'use strict';

// ── State ─────────────────────────────────────────────────────────────────
const state = {
  articles: [],
  dbArticles: {},
  currentIndex: -1,
  currentPage: 1,
  totalPages: 0,
  pdfBase64: null,
  pdfFileName: '',
  reviewerName: '',
  lawCode: () => document.getElementById('law-code-select').value,
  provider: () => document.getElementById('api-provider-select').value,
  issues: [],
  editDirty: false,
};

// ── Boot ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('pdf-upload').addEventListener('change', onPdfUpload);
  document.addEventListener('keydown', onKeyDown);

  // PDF panel drag-to-resize
  const handle = document.getElementById('pdf-resize-handle');
  const pdfPanel = document.getElementById('panel-pdf');
  let resizing = false, startX = 0, startW = 0;
  handle.addEventListener('mousedown', e => {
    resizing = true; startX = e.clientX; startW = pdfPanel.offsetWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!resizing) return;
    const newW = Math.min(window.innerWidth * 0.7, Math.max(240, startW + (startX - e.clientX)));
    pdfPanel.style.width = newW + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!resizing) return;
    resizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  let _wheelTimer = null;
  document.getElementById('pdf-viewport').addEventListener('wheel', e => {
    if (!state.pdfBase64) return;
    e.preventDefault();
    if (_wheelTimer) return;
    _wheelTimer = setTimeout(() => { _wheelTimer = null; }, 400);
    changePage(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  await checkIdentity();
});

// ── Identity + security ───────────────────────────────────────────────────
async function checkIdentity() {
  try {
    const res = await get('/session/identity');
    // Show/hide security code field based on whether server has a passcode set
    document.getElementById('security-label').style.display =
      res.hasPasscode ? 'flex' : 'none';

    if (res.name) {
      state.reviewerName = res.name;
      showReviewerBadge(res.name);
      await openSessionsList(true); // auto-open sessions list after identity
    } else {
      document.getElementById('identity-modal').style.display = 'flex';
      document.getElementById('identity-input').focus();
    }
  } catch (_) {
    document.getElementById('identity-modal').style.display = 'flex';
    document.getElementById('identity-input').focus();
  }
}

async function submitIdentity() {
  const name = document.getElementById('identity-input').value.trim();
  const code = document.getElementById('security-input').value;
  const errEl = document.getElementById('identity-error');
  errEl.style.display = 'none';

  if (!name) { errEl.textContent = 'Please enter your name.'; errEl.style.display = 'block'; return; }

  try {
    await post('/session/identity', { name, securityCode: code });
    state.reviewerName = name;
    showReviewerBadge(name);
    document.getElementById('identity-modal').style.display = 'none';
    await openSessionsList(true);
  } catch (err) {
    const msg = err.message.includes('403') || err.message.toLowerCase().includes('invalid security')
      ? 'Invalid security code.'
      : 'Error: ' + err.message;
    errEl.textContent = msg;
    errEl.style.display = 'block';
    document.getElementById('security-input').focus();
    document.getElementById('security-input').select();
  }
}

function showReviewerBadge(name) {
  const badge = document.getElementById('reviewer-badge');
  badge.textContent = name;
  badge.style.display = 'inline-block';
}

// ── Sessions list ─────────────────────────────────────────────────────────
async function openSessionsList(autoClose = false) {
  try {
    const res = await get('/session/list');
    const sessions = res.sessions || [];
    if (autoClose && sessions.length === 0) return; // nothing saved → skip modal
    renderSessionsList(sessions, autoClose);
    document.getElementById('sessions-modal').style.display = 'flex';
  } catch (_) { /* server might not be ready */ }
}

function closeSessionsList() {
  document.getElementById('sessions-modal').style.display = 'none';
}

function renderSessionsList(sessions, autoClose) {
  const el = document.getElementById('sessions-list-body');
  if (sessions.length === 0) {
    el.innerHTML = '<div class="sessions-empty">No saved sessions. Upload a PDF to begin.</div>';
    return;
  }

  el.innerHTML = sessions.map(s => {
    const pct = s.total ? Math.round((s.approved / s.total) * 100) : 0;
    const date = s.updated_at ? new Date(s.updated_at).toLocaleString() : '—';
    const fileName = s.file_name || 'Unknown PDF';
    const hasPdf = !!s.file_name;
    return `
    <div class="session-card">
      <div class="session-card-main">
        <div class="session-card-law">${escHtml(s.law_code)}</div>
        <div class="session-card-file">${escHtml(fileName)}${s.page_count ? ' · ' + s.page_count + ' pages' : ''}</div>
        <div class="session-card-stats">
          <span class="stat-approved">${s.approved} approved</span>
          <span class="stat-rejected">${s.rejected} rejected</span>
          <span class="stat-pending">${s.pending} pending</span>
          <span class="stat-total">/ ${s.total} total</span>
        </div>
        <div class="session-card-progress">
          <div class="session-progress-bar" style="width:${pct}%"></div>
        </div>
        <div class="session-card-date">Last updated: ${escHtml(date)}</div>
      </div>
      <div class="session-card-actions">
        <button class="btn btn-approve btn-sm" onclick="resumeSession('${escHtml(s.law_code)}')" ${hasPdf ? '' : 'title="PDF not stored — articles only"'}>
          ${hasPdf ? 'Resume' : 'Articles only'}
        </button>
        <button class="btn btn-reject btn-sm" onclick="confirmDeleteSession('${escHtml(s.law_code)}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}

async function resumeSession(lawCode) {
  closeSessionsList();
  showLoading('Restoring session…');
  try {
    // Set law code dropdown
    const select = document.getElementById('law-code-select');
    if ([...select.options].some(o => o.value === lawCode)) {
      select.value = lawCode;
    }

    // Load articles
    const sessionRes = await get(`/session/load/${lawCode}`);
    if (!sessionRes.articles || sessionRes.articles.length === 0) {
      toast('No articles found in session', 'warn');
      return;
    }

    // Restore PDF if stored
    let pdfRestored = false;
    try {
      const pdfRes = await get(`/session/pdf/${lawCode}`);
      state.pdfBase64  = pdfRes.pdf_base64;
      state.pdfFileName = pdfRes.file_name;
      state.totalPages  = pdfRes.page_count;

      // Send PDF bytes to server so /pdf/page/* works
      await post('/session/load-pdf', {
        pdf_base64: pdfRes.pdf_base64,
        fileName:   pdfRes.file_name,
        lawCode:    lawCode,
      });
      await loadPdfPage(1);
      pdfRestored = true;
    } catch (_) { /* PDF not stored — articles-only restore is still useful */ }

    state.articles = sessionRes.articles;
    state.issues   = [];

    await loadDbArticles();
    renderArticleList();
    renderIssues();
    updateProgress();
    // Jump to first pending article
    const firstPending = state.articles.findIndex(a => a.status === 'pending');
    if (firstPending >= 0) selectArticle(firstPending);
    else if (state.articles.length) selectArticle(0);

    const msg = `Session restored: ${sessionRes.total} articles` +
      (pdfRestored ? '' : ' (PDF not available — upload to view pages)');
    toast(msg, 'success');
  } catch (err) {
    toast('Failed to restore session: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
}

function confirmDeleteSession(lawCode) {
  if (!confirm(`Delete session for "${lawCode}"? This cannot be undone.`)) return;
  deleteSessionEntry(lawCode);
}

async function deleteSessionEntry(lawCode) {
  try {
    await fetch(`/session/${lawCode}`, { method: 'DELETE' });
    toast(`Session "${lawCode}" deleted`, 'warn');
    await openSessionsList(false);
  } catch (err) {
    toast('Delete failed: ' + err.message, 'error');
  }
}

// ── PDF Upload ────────────────────────────────────────────────────────────
async function onPdfUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  showLoading('Loading PDF…');
  try {
    const b64 = await fileToBase64(file);
    state.pdfBase64   = b64;
    state.pdfFileName = file.name;
    const res = await post('/session/load-pdf', {
      pdf_base64: b64,
      fileName:   file.name,
      lawCode:    state.lawCode(),
    });
    state.totalPages  = res.pageCount;
    state.currentPage = 1;
    await loadPdfPage(1);
    toast(`PDF loaded — ${res.pageCount} pages`, 'success');
  } catch (err) {
    toast('Failed to load PDF: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
}

// ── Extract ───────────────────────────────────────────────────────────────
let _pendingExtractResult = null;

function _providerLabel(p) {
  return p === 'openai' ? 'OpenAI GPT-4o' : p === 'none' ? 'No AI' : 'Claude Sonnet';
}

async function extractArticles() {
  if (!state.pdfBase64) { toast('Upload a PDF first', 'warn'); return; }
  const provider = state.provider();
  const label    = _providerLabel(provider);
  showLoading(`[${label}] Extracting article structure…`);

  const pollId = setInterval(async () => {
    try {
      const p = await get('/extract/progress');
      if (p.status === 'running') {
        document.getElementById('loading-msg').textContent = p.total > 0
          ? `[${label}] Cleaning: ${p.done} / ${p.total} articles`
          : `[${label}] ${p.message || 'Analyzing document…'}`;
      }
    } catch (_) {}
  }, 1500);

  try {
    const res = await post('/extract', {
      pdf_base64:  state.pdfBase64,
      lawCode:     state.lawCode(),
      apiProvider: provider,
      fileName:    state.pdfFileName || '',
    });

    if (res.interrupted) {
      _pendingExtractResult = res;
      const cleaned = res.articles.filter(a => a.quality !== 'needs_review').length;
      document.getElementById('rate-limit-msg').innerHTML =
        `API rate limit reached during cleaning.<br><br>` +
        `<strong>${cleaned} / ${res.articles.length}</strong> articles cleaned before the limit hit.` +
        `<br>The rest have raw extracted text.<br><br>` +
        `Continue with raw text, or change provider and re-extract.`;
      document.getElementById('rate-limit-modal').style.display = 'flex';
      return;
    }
    _applyExtractResult(res, label);
  } catch (err) {
    toast('Extraction failed: ' + err.message, 'error');
  } finally {
    clearInterval(pollId);
    hideLoading();
  }
}

function _applyExtractResult(res, label) {
  state.articles   = res.articles || [];
  state.issues     = res.issues   || [];
  state.totalPages = res.pageCount || state.totalPages;
  loadDbArticles().then(() => {
    renderArticleList();
    renderIssues();
    updateProgress();
    if (state.articles.length) selectArticle(0);
  });
  toast(`[${label || _providerLabel(state.provider())}] Extracted ${state.articles.length} articles`, 'success');
}

function continueWithoutAI() {
  if (_pendingExtractResult) { _applyExtractResult(_pendingExtractResult, 'Partial'); _pendingExtractResult = null; }
  document.getElementById('rate-limit-modal').style.display = 'none';
}

function closeRateLimitModal() {
  _pendingExtractResult = null;
  document.getElementById('rate-limit-modal').style.display = 'none';
  toast('Change API provider in the header, then re-extract.', 'warn');
}

// ── DB articles ───────────────────────────────────────────────────────────
async function loadDbArticles() {
  try {
    const res = await get(`/db/articles/${state.lawCode()}`);
    state.dbArticles = {};
    (res.articles || []).forEach(a => { state.dbArticles[a.article_number] = a; });
  } catch (_) {}
}

// ── Article list ──────────────────────────────────────────────────────────
function renderArticleList() {
  const list         = document.getElementById('articles-list');
  const search       = document.getElementById('article-search').value.toLowerCase();
  const filterStatus = document.getElementById('filter-status').value;

  const filtered = state.articles.filter(a => {
    const matchText   = !search || a.articleNumber.includes(search) || (a.text || '').toLowerCase().includes(search);
    const matchStatus = filterStatus === 'all' || a.status === filterStatus || a.quality === filterStatus;
    return matchText && matchStatus;
  });

  if (!filtered.length) { list.innerHTML = '<div class="empty-state">No articles match</div>'; return; }

  list.innerHTML = filtered.map(a => {
    const realIdx   = state.articles.indexOf(a);
    const icon      = statusIcon(a);
    const activeClass = realIdx === state.currentIndex ? 'active' : '';
    return `
      <div class="article-item s-${a.status || 'pending'} ${activeClass}"
           onclick="selectArticle(${realIdx})">
        <span class="article-icon">${icon}</span>
        <span class="article-num">Art. ${a.articleNumber}</span>
        <span class="article-quality q-${a.quality}">${a.quality || 'pending'}</span>
      </div>`;
  }).join('');
}

function filterArticles() { renderArticleList(); }

function statusIcon(a) {
  if (a.status === 'approved')       return '✅';
  if (a.status === 'rejected')       return '❌';
  if (a.quality === 'corrupted')     return '❌';
  if (a.quality === 'needs_review')  return '⚠️';
  return '🔵';
}

// ── Select article ────────────────────────────────────────────────────────
async function selectArticle(idx) {
  if (idx < 0 || idx >= state.articles.length) return;
  state.currentIndex = idx;
  state.editDirty    = false;

  const a = state.articles[idx];
  document.getElementById('editor-empty').style.display   = 'none';
  document.getElementById('edit-article-num').value = a.articleNumber;
  document.getElementById('edit-text').value    = a.text    || '';
  document.getElementById('edit-book').value    = a.book    || '';
  document.getElementById('edit-part').value    = a.part    || '';
  document.getElementById('edit-title').value   = a.title   || '';
  document.getElementById('edit-chapter').value = a.chapter || '';
  document.getElementById('edit-section').value = a.section || '';

  const q  = a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : (a.quality || 'pending');
  const qb = document.getElementById('quality-badge');
  qb.textContent = q;
  qb.className   = `badge badge-${q}`;

  const dbA       = state.dbArticles[a.articleNumber];
  const dbDisplay = document.getElementById('db-text-display');
  const dbBadge   = document.getElementById('db-diff-badge');
  if (dbA) { dbDisplay.innerHTML = diffHtml(a.text || '', dbA.text || ''); dbBadge.textContent = '(diff shown)'; }
  else      { dbDisplay.textContent = 'No DB version found';               dbBadge.textContent = '(not in DB)'; }

  document.getElementById('btn-save').disabled = true;
  renderArticleList();

  if (state.totalPages > 0) {
    const page = a.startPage || Math.max(1, Math.round((idx / state.articles.length) * state.totalPages));
    await loadPdfPage(page);
  }
}

function onTextEdit() {
  state.editDirty = true;
  document.getElementById('btn-save').disabled = false;
}

// ── Save edit ─────────────────────────────────────────────────────────────
function saveEdit() {
  if (state.currentIndex < 0) return;
  const a      = state.articles[state.currentIndex];
  a.text       = document.getElementById('edit-text').value;
  a.book       = document.getElementById('edit-book').value;
  a.part       = document.getElementById('edit-part').value;
  a.title      = document.getElementById('edit-title').value;
  a.chapter    = document.getElementById('edit-chapter').value;
  a.section    = document.getElementById('edit-section').value;
  state.editDirty = false;
  document.getElementById('btn-save').disabled = true;
  toast('Edit saved locally', 'success');
}

// ── Approve ───────────────────────────────────────────────────────────────
async function approveArticle() {
  if (state.currentIndex < 0) return;
  if (!state.reviewerName) { toast('Set your reviewer name first (reload page)', 'warn'); return; }
  if (state.editDirty) saveEdit();
  const a = state.articles[state.currentIndex];
  try {
    await post('/db/approve', {
      lawCode:        state.lawCode(),
      articleNumber:  a.articleNumber,
      text:           a.text,
      reviewerName:   state.reviewerName,
      book:           a.book    || null,
      part:           a.part    || null,
      title:          a.title   || null,
      chapter:        a.chapter || null,
      section:        a.section || null,
      startPage:      a.startPage      || null,
      sourceDocument: a.sourceDocument || null,
      quality:        a.quality        || null,
    });
    a.status = 'approved'; a.quality = 'clean';
    renderArticleList(); updateProgress();
    toast(`Art. ${a.articleNumber} approved`, 'success');
    advanceToNext();
  } catch (err) { toast('Approve failed: ' + err.message, 'error'); }
}

// ── Reject modal ──────────────────────────────────────────────────────────
function openRejectModal() {
  if (state.currentIndex < 0) return;
  if (!state.reviewerName) { toast('Set your reviewer name first (reload page)', 'warn'); return; }
  document.getElementById('reject-category').value = 'encoding_error';
  document.getElementById('reject-notes').value    = '';
  document.getElementById('reject-modal').style.display = 'flex';
}

function closeRejectModal() { document.getElementById('reject-modal').style.display = 'none'; }

async function submitReject() {
  if (state.currentIndex < 0) return;
  const a        = state.articles[state.currentIndex];
  const category = document.getElementById('reject-category').value;
  const notes    = document.getElementById('reject-notes').value.trim();
  closeRejectModal();
  try {
    await post('/db/reject', {
      lawCode:           state.lawCode(),
      articleNumber:     a.articleNumber,
      reviewerName:      state.reviewerName,
      rejectionCategory: category,
      reason:            notes || null,
    });
    a.status = 'rejected'; a.rejectionCategory = category; a.rejectionReason = notes || null;
    renderArticleList(); updateProgress();
    toast(`Art. ${a.articleNumber} rejected (${category})`, 'warn');
    advanceToNext();
  } catch (err) { toast('Reject failed: ' + err.message, 'error'); }
}

function advanceToNext() {
  const next = state.articles.findIndex((a, i) => i > state.currentIndex && a.status === 'pending');
  if (next >= 0) selectArticle(next);
}

// ── Next issue ────────────────────────────────────────────────────────────
function nextIssue() {
  const start = state.currentIndex + 1;
  let found = state.articles.findIndex((a, i) => i >= start && (a.quality === 'needs_review' || a.quality === 'corrupted'));
  if (found < 0) found = state.articles.findIndex(a => a.quality === 'needs_review' || a.quality === 'corrupted');
  if (found >= 0) selectArticle(found);
  else toast('No more issues', 'success');
}

// ── Push to Neon DB ───────────────────────────────────────────────────────
function pushToNeonDB() {
  const approved = state.articles.filter(a => a.status === 'approved');
  if (!approved.length) { toast('No approved articles to push', 'warn'); return; }
  if (!state.reviewerName) { toast('Reviewer name required', 'warn'); return; }

  document.getElementById('push-modal-body').innerHTML =
    `You are about to push <strong>${approved.length}</strong> articles to the ` +
    `production Neon database. This cannot be undone.<br><br>` +
    `Reviewed by: <strong>${escHtml(state.reviewerName)}</strong><br>` +
    `Law code: <strong>${escHtml(state.lawCode())}</strong>`;

  document.getElementById('push-confirm-input').value = '';
  document.getElementById('btn-push-confirm').disabled = true;
  document.getElementById('push-modal').style.display = 'flex';
}

function closePushModal() { document.getElementById('push-modal').style.display = 'none'; }

async function executePush() {
  closePushModal();
  const approved = state.articles.filter(a => a.status === 'approved');
  showLoading(`Pushing ${approved.length} articles to Neon DB…`);
  try {
    const res = await post('/db/import-batch', {
      articles:     approved,
      lawCode:      state.lawCode(),
      reviewerName: state.reviewerName,
    });
    let html = `<p><strong>Imported: ${res.imported}</strong></p>`;
    if (res.failed && res.failed.length) {
      html += `<p style="color:var(--red)">Failed: ${res.failed.length}</p><ul>`;
      res.failed.forEach(f => { html += `<li>Art. ${escHtml(String(f.articleNumber))}: ${escHtml(f.error)}</li>`; });
      html += '</ul>';
    }
    document.getElementById('push-results-body').innerHTML = html;
    document.getElementById('push-results-modal').style.display = 'flex';
    toast(`Pushed ${res.imported} articles`, res.failed?.length ? 'warn' : 'success');
  } catch (err) {
    toast('Push failed: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
}

// ── Export JSON ───────────────────────────────────────────────────────────
function exportJSON() {
  if (!state.articles.length) { toast('No articles to export', 'warn'); return; }
  const blob = new Blob([JSON.stringify(state.articles, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${state.lawCode()}_articles.json`; a.click();
  URL.revokeObjectURL(url);
}

// ── PDF navigation ────────────────────────────────────────────────────────
async function loadPdfPage(page) {
  if (!state.pdfBase64) return;
  try {
    const res         = await get(`/pdf/page/${page}`);
    const img         = document.getElementById('pdf-page-img');
    const placeholder = document.querySelector('.pdf-placeholder');
    img.src           = `data:image/png;base64,${res.image}`;
    img.style.display = 'block';
    img.style.width   = `${pdfZoom * 100}%`;
    if (placeholder) placeholder.style.display = 'none';
    state.currentPage = page;
    state.totalPages  = res.total;
    document.getElementById('pdf-page-info').textContent = `Page ${page} / ${res.total}`;
    document.getElementById('zoom-label').textContent    = Math.round(pdfZoom * 100) + '%';
  } catch (_) {}
}

function changePage(delta) {
  const p = state.currentPage + delta;
  if (p >= 1 && p <= state.totalPages) loadPdfPage(p);
}

const PDF_DEFAULT_ZOOM = 0.65;
let pdfZoom = PDF_DEFAULT_ZOOM;

function zoomPdf(delta) {
  pdfZoom = delta === 0 ? PDF_DEFAULT_ZOOM : Math.min(4, Math.max(0.25, pdfZoom + delta));
  document.getElementById('pdf-page-img').style.width = `${pdfZoom * 100}%`;
  document.getElementById('zoom-label').textContent   = Math.round(pdfZoom * 100) + '%';
}

// ── Progress ──────────────────────────────────────────────────────────────
function updateProgress() {
  const total    = state.articles.length;
  const reviewed = state.articles.filter(a => a.status === 'approved' || a.status === 'rejected').length;
  const pct      = total ? Math.round((reviewed / total) * 100) : 0;
  document.getElementById('progress-label').textContent = `${reviewed} / ${total} reviewed`;
  document.getElementById('progress-bar').style.width   = pct + '%';
  document.getElementById('progress-pct').textContent   = pct + '%';
}

// ── Issues ────────────────────────────────────────────────────────────────
function renderIssues() {
  const panel = document.getElementById('issues-panel');
  const list  = document.getElementById('issues-list');
  if (!state.issues.length) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  list.innerHTML = state.issues.map(i => `<li>${escHtml(i)}</li>`).join('');
}

// ── Diff ──────────────────────────────────────────────────────────────────
function diffHtml(extracted, db) {
  const a = extracted.split(/\s+/), b = db.split(/\s+/);
  const aSet = new Set(a), bSet = new Set(b), result = [];
  b.forEach(w => result.push(aSet.has(w) ? escHtml(w) : `<span class="diff-del">${escHtml(w)}</span>`));
  a.forEach(w => { if (!bSet.has(w)) result.push(`<span class="diff-add">${escHtml(w)}</span>`); });
  return result.join(' ');
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────
function onKeyDown(e) {
  if (e.ctrlKey && e.key === 'Enter')      { e.preventDefault(); approveArticle(); }
  if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); advanceToNext(); }
  if (e.ctrlKey && e.key === 'ArrowDown')  { e.preventDefault(); nextIssue(); }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function get(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function post(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function showLoading(msg) {
  document.getElementById('loading-msg').textContent = msg || 'Loading…';
  document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() { document.getElementById('loading-overlay').style.display = 'none'; }

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  const cls = { success: 'success', error: 'error', warn: 'warn' }[type] || 'info';
  el.className = `toast toast-${cls}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
