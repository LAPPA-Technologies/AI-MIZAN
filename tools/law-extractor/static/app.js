'use strict';

// ── State ─────────────────────────────────────────────────────────────────
const state = {
  articles: [],       // extracted articles with session status
  dbArticles: {},     // map articleNumber → db article
  currentIndex: -1,
  currentPage: 1,
  totalPages: 0,
  pdfBase64: null,
  lawCode: () => document.getElementById('law-code-select').value,
  provider: () => document.getElementById('api-provider-select').value,
  issues: [],
  editDirty: false,
};

// ── Boot ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pdf-upload').addEventListener('change', onPdfUpload);
  document.addEventListener('keydown', onKeyDown);

  // PDF panel drag-to-resize from left edge
  const handle = document.getElementById('pdf-resize-handle');
  const pdfPanel = document.getElementById('panel-pdf');
  let resizing = false, startX = 0, startW = 0;
  handle.addEventListener('mousedown', (e) => {
    resizing = true;
    startX = e.clientX;
    startW = pdfPanel.offsetWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', (e) => {
    if (!resizing) return;
    const delta = startX - e.clientX; // dragging left = wider
    const newW = Math.min(window.innerWidth * 0.7, Math.max(240, startW + delta));
    pdfPanel.style.width = newW + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!resizing) return;
    resizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
  let _wheelTimer = null;
  document.getElementById('pdf-viewport').addEventListener('wheel', (e) => {
    if (!state.pdfBase64) return;
    e.preventDefault();
    if (_wheelTimer) return; // debounce — one page per 400ms
    _wheelTimer = setTimeout(() => { _wheelTimer = null; }, 400);
    changePage(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });
});

// ── PDF Upload ────────────────────────────────────────────────────────────
async function onPdfUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  showLoading('Loading PDF…');
  try {
    const b64 = await fileToBase64(file);
    state.pdfBase64 = b64;
    const res = await post('/session/load-pdf', { pdf_base64: b64 });
    state.totalPages = res.pageCount;
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

function _providerLabel(provider) {
  if (provider === 'openai') return 'OpenAI GPT-4o';
  if (provider === 'none')   return 'No AI';
  return 'Claude Sonnet';
}

async function extractArticles() {
  if (!state.pdfBase64) { toast('Upload a PDF first', 'warn'); return; }
  const provider = state.provider();
  const label = _providerLabel(provider);
  showLoading(`[${label}] Extracting article structure…`);

  const pollId = setInterval(async () => {
    try {
      const p = await get('/extract/progress');
      if (p.status === 'running') {
        const msg = p.total > 0
          ? `[${label}] Cleaning: ${p.done} / ${p.total} articles`
          : `[${label}] ${p.message || 'Analyzing document…'}`;
        document.getElementById('loading-msg').textContent = msg;
      }
    } catch (_) {}
  }, 1500);

  try {
    const res = await post('/extract', {
      pdf_base64: state.pdfBase64,
      lawCode: state.lawCode(),
      apiProvider: provider,
    });

    if (res.interrupted) {
      _pendingExtractResult = res;
      const cleaned = res.articles.filter(a => a.quality !== 'needs_review').length;
      document.getElementById('rate-limit-msg').innerHTML =
        `API rate limit was reached during cleaning.<br><br>` +
        `<strong>${cleaned} / ${res.articles.length}</strong> articles were cleaned before the limit hit.<br>` +
        `The rest have their raw extracted text.<br><br>` +
        `You can continue with the raw text, or change the API provider and re-extract.`;
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
  state.articles = res.articles || [];
  state.issues = res.issues || [];
  state.totalPages = res.pageCount || state.totalPages;
  loadDbArticles().then(() => {
    renderArticleList();
    renderIssues();
    updateProgress();
    if (state.articles.length) selectArticle(0);
  });
  const lbl = label || _providerLabel(state.provider());
  toast(`[${lbl}] Extracted ${state.articles.length} articles`, 'success');
}

function continueWithoutAI() {
  if (_pendingExtractResult) {
    _applyExtractResult(_pendingExtractResult, 'Partial');
    _pendingExtractResult = null;
  }
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
    (res.articles || []).forEach(a => {
      state.dbArticles[a.article_number] = a;
    });
  } catch (_) {
    // DB might not be configured — silently ignore
  }
}

// ── Article list rendering ────────────────────────────────────────────────
function renderArticleList() {
  const list = document.getElementById('articles-list');
  const search = document.getElementById('article-search').value.toLowerCase();
  const filterStatus = document.getElementById('filter-status').value;

  const filtered = state.articles.filter(a => {
    const matchText = !search || a.articleNumber.includes(search) ||
      (a.text || '').toLowerCase().includes(search);
    const matchStatus = filterStatus === 'all' ||
      a.status === filterStatus || a.quality === filterStatus;
    return matchText && matchStatus;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">No articles match</div>';
    return;
  }

  list.innerHTML = filtered.map((a, idx) => {
    const realIdx = state.articles.indexOf(a);
    const icon = statusIcon(a);
    const qClass = `q-${a.quality}`;
    const sClass = `s-${a.status || 'pending'}`;
    const activeClass = realIdx === state.currentIndex ? 'active' : '';
    return `
      <div class="article-item ${sClass} ${activeClass}"
           onclick="selectArticle(${realIdx})" data-idx="${realIdx}">
        <span class="article-icon">${icon}</span>
        <span class="article-num">Art. ${a.articleNumber}</span>
        <span class="article-quality ${qClass}">${a.quality || 'pending'}</span>
      </div>`;
  }).join('');
}

function filterArticles() { renderArticleList(); }

function statusIcon(a) {
  if (a.status === 'approved') return '✅';
  if (a.status === 'rejected') return '❌';
  if (a.quality === 'corrupted') return '❌';
  if (a.quality === 'needs_review') return '⚠️';
  return '🔵';
}

// ── Select article ────────────────────────────────────────────────────────
async function selectArticle(idx) {
  if (idx < 0 || idx >= state.articles.length) return;
  state.currentIndex = idx;
  state.editDirty = false;

  const a = state.articles[idx];
  document.getElementById('editor-empty').style.display = 'none';
  document.getElementById('edit-article-num').value = a.articleNumber;
  document.getElementById('edit-text').value = a.text || '';
  document.getElementById('edit-chapter').value = a.chapter || '';
  document.getElementById('edit-book').value = a.book || '';

  // Quality badge
  const qb = document.getElementById('quality-badge');
  const q = a.status === 'approved' ? 'approved' :
            a.status === 'rejected' ? 'rejected' : (a.quality || 'pending');
  qb.textContent = q;
  qb.className = `badge badge-${q}`;

  // DB version
  const dbA = state.dbArticles[a.articleNumber];
  const dbDisplay = document.getElementById('db-text-display');
  const dbBadge = document.getElementById('db-diff-badge');
  if (dbA) {
    dbDisplay.innerHTML = diffHtml(a.text || '', dbA.text || '');
    dbBadge.textContent = '(diff shown)';
  } else {
    dbDisplay.textContent = 'No DB version found';
    dbBadge.textContent = '(not in DB)';
  }

  // Save button state
  document.getElementById('btn-save').disabled = true;

  // Highlight active in list
  renderArticleList();

  // Jump PDF to article's actual start page
  if (state.totalPages > 0) {
    const page = a.startPage || Math.max(1, Math.round((idx / state.articles.length) * state.totalPages));
    await loadPdfPage(page);
  }
}

function onTextEdit() {
  state.editDirty = true;
  document.getElementById('btn-save').disabled = false;
}

// ── Save edit (local only) ────────────────────────────────────────────────
function saveEdit() {
  if (state.currentIndex < 0) return;
  const a = state.articles[state.currentIndex];
  a.text = document.getElementById('edit-text').value;
  a.chapter = document.getElementById('edit-chapter').value;
  a.book = document.getElementById('edit-book').value;
  state.editDirty = false;
  document.getElementById('btn-save').disabled = true;
  toast('Edit saved locally', 'success');
}

// ── Approve ───────────────────────────────────────────────────────────────
async function approveArticle() {
  if (state.currentIndex < 0) return;
  if (state.editDirty) saveEdit();
  const a = state.articles[state.currentIndex];
  try {
    await post('/db/approve', {
      lawCode: state.lawCode(),
      articleNumber: a.articleNumber,
      text: a.text,
      chapter: a.chapter || null,
      book: a.book || null,
    });
    a.status = 'approved';
    a.quality = 'clean';
    renderArticleList();
    updateProgress();
    toast(`Art. ${a.articleNumber} approved ✓`, 'success');
    advanceToNext();
  } catch (err) {
    toast('Approve failed: ' + err.message, 'error');
  }
}

// ── Reject ────────────────────────────────────────────────────────────────
async function rejectArticle() {
  if (state.currentIndex < 0) return;
  const a = state.articles[state.currentIndex];
  const reason = prompt('Rejection reason (optional):') || '';
  try {
    await post('/db/reject', {
      lawCode: state.lawCode(),
      articleNumber: a.articleNumber,
      reason,
    });
    a.status = 'rejected';
    renderArticleList();
    updateProgress();
    toast(`Art. ${a.articleNumber} rejected`, 'warn');
    advanceToNext();
  } catch (err) {
    toast('Reject failed: ' + err.message, 'error');
  }
}

function advanceToNext() {
  const next = state.articles.findIndex(
    (a, i) => i > state.currentIndex && a.status === 'pending'
  );
  if (next >= 0) selectArticle(next);
}

// ── Next issue ────────────────────────────────────────────────────────────
function nextIssue() {
  const start = state.currentIndex + 1;
  let found = state.articles.findIndex(
    (a, i) => i >= start && (a.quality === 'needs_review' || a.quality === 'corrupted')
  );
  if (found < 0) {
    found = state.articles.findIndex(
      (a) => a.quality === 'needs_review' || a.quality === 'corrupted'
    );
  }
  if (found >= 0) selectArticle(found);
  else toast('No more issues', 'success');
}

// ── Import batch ──────────────────────────────────────────────────────────
async function importApproved() {
  const approved = state.articles.filter(a => a.status === 'approved');
  if (approved.length === 0) { toast('No approved articles to import', 'warn'); return; }
  if (!confirm(`Import ${approved.length} approved articles to the DB?`)) return;
  showLoading(`Importing ${approved.length} articles…`);
  try {
    const res = await post('/db/import-batch', {
      articles: approved,
      lawCode: state.lawCode(),
    });
    let msg = `Imported ${res.imported}`;
    if (res.failed && res.failed.length) msg += `, ${res.failed.length} failed`;
    toast(msg, res.failed?.length ? 'warn' : 'success');
  } catch (err) {
    toast('Import failed: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
}

// ── Export JSON ───────────────────────────────────────────────────────────
function exportJSON() {
  if (state.articles.length === 0) { toast('No articles to export', 'warn'); return; }
  const data = JSON.stringify(state.articles, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.lawCode()}_articles.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── PDF navigation ────────────────────────────────────────────────────────
async function loadPdfPage(page) {
  if (!state.pdfBase64) return;
  try {
    const res = await get(`/pdf/page/${page}`);
    const img = document.getElementById('pdf-page-img');
    const placeholder = document.querySelector('.pdf-placeholder');
    img.src = `data:image/png;base64,${res.image}`;
    img.style.display = 'block';
    img.style.width = `${pdfZoom * 100}%`;
    img.style.transform = '';
    if (placeholder) placeholder.style.display = 'none';
    state.currentPage = page;
    state.totalPages = res.total;
    document.getElementById('pdf-page-info').textContent =
      `Page ${page} / ${res.total}`;
    document.getElementById('zoom-label').textContent = Math.round(pdfZoom * 100) + '%';
  } catch (_) { /* no PDF loaded */ }
}

function changePage(delta) {
  const newPage = state.currentPage + delta;
  if (newPage >= 1 && newPage <= state.totalPages) loadPdfPage(newPage);
}

const PDF_DEFAULT_ZOOM = 0.65;
let pdfZoom = PDF_DEFAULT_ZOOM;

function zoomPdf(delta) {
  if (delta === 0) { pdfZoom = PDF_DEFAULT_ZOOM; }
  else { pdfZoom = Math.min(4, Math.max(0.25, pdfZoom + delta)); }
  const img = document.getElementById('pdf-page-img');
  img.style.width = `${pdfZoom * 100}%`;
  img.style.transform = '';
  document.getElementById('zoom-label').textContent = Math.round(pdfZoom * 100) + '%';
}

// ── Progress ──────────────────────────────────────────────────────────────
function updateProgress() {
  const total = state.articles.length;
  const reviewed = state.articles.filter(
    a => a.status === 'approved' || a.status === 'rejected'
  ).length;
  const pct = total ? Math.round((reviewed / total) * 100) : 0;
  document.getElementById('progress-label').textContent = `${reviewed} / ${total} reviewed`;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';
}

// ── Issues rendering ──────────────────────────────────────────────────────
function renderIssues() {
  const panel = document.getElementById('issues-panel');
  const list = document.getElementById('issues-list');
  if (!state.issues.length) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  list.innerHTML = state.issues
    .map(i => `<li>${escHtml(i)}</li>`)
    .join('');
}

// ── Word-level diff ───────────────────────────────────────────────────────
function diffHtml(extracted, db) {
  const a = extracted.split(/\s+/);
  const b = db.split(/\s+/);
  const aSet = new Set(a);
  const bSet = new Set(b);
  const result = [];
  // Simple approach: highlight words unique to each side
  b.forEach(w => {
    if (!aSet.has(w)) result.push(`<span class="diff-del">${escHtml(w)}</span>`);
    else result.push(escHtml(w));
  });
  a.forEach(w => {
    if (!bSet.has(w)) result.push(`<span class="diff-add">${escHtml(w)}</span>`);
  });
  return result.join(' ');
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────
function onKeyDown(e) {
  if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); approveArticle(); }
  if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); advanceToNext(); }
  if (e.ctrlKey && e.key === 'ArrowDown') { e.preventDefault(); nextIssue(); }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
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
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function showLoading(msg) {
  document.getElementById('loading-msg').textContent = msg || 'Loading…';
  document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loading-overlay').style.display = 'none';
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast-${type === 'success' ? 'success' : type === 'error' ? 'error' : 'warn'}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
