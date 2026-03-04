"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DisclaimerBanner from "../../components/DisclaimerBanner";
import { getClientDictionary } from "../../lib/i18nClient";
import { getLawMetadata } from "../../lib/lawMetadata";
import { clearAdminToken } from "../../lib/adminAuth";
import { detectLanguage, isRtlLanguage, SupportedLanguage } from "../../lib/language";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    code: string;
    articleNumber: string;
    source?: string | null;
    effectiveDate?: string | null;
  }>;
  isRejected?: boolean;
  language?: SupportedLanguage;
};

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
};

type SectionKey = "summary" | "legalAnalysis" | "clarifyingQuestions" | "additionalDetails";

type SectionKeywordEntry = {
  key: SectionKey | "citations";
  patterns: RegExp[];
};

type ArticleLookupResponse = {
  code: string;
  articleNumber: string;
  text?: string | null;
  language?: string | null;
  metadata?: Record<string, string> | null;
  source?: string | null;
  effectiveDate?: string | null;
};

type ParsedSection = {
  key: SectionKey;
  text: string;
  hasExplicitHeading: boolean;
};

type AggregatedCitation = {
  code: string;
  normalizedCode: string;
  articleNumber: string;
  normalizedArticleNumber: string;
  sources: string[];
  effectiveDates: string[];
};

const ARTICLE_METADATA_LABELS: Record<string, { en: string; fr: string; ar: string }> = {
  part: { en: "Part", fr: "Partie", ar: "الجزء" },
  book: { en: "Book", fr: "Livre", ar: "الكتاب" },
  title: { en: "Title", fr: "Titre", ar: "العنوان" },
  section: { en: "Section", fr: "Section", ar: "القسم" },
  chapter: { en: "Chapter", fr: "Chapitre", ar: "الباب" },
  subsection: { en: "Subsection", fr: "Sous-section", ar: "الفقرة" },
  paragraph: { en: "Paragraph", fr: "Paragraphe", ar: "الفقرة" },
  article: { en: "Article", fr: "Article", ar: "المادة" },
};

const SECTION_LABELS: Record<SectionKey, Record<SupportedLanguage, string>> = {
  summary: { en: "Summary", fr: "Résumé", ar: "الخلاصة", darija: "الملخص" },
  legalAnalysis: { en: "Legal Grounds", fr: "Fondements juridiques", ar: "الأسس القانونية", darija: "الأسس القانونية" },
  clarifyingQuestions: { en: "Clarifying Questions", fr: "Questions de clarification", ar: "أسئلة للتوضيح", darija: "أسئلة للتوضيح" },
  additionalDetails: { en: "Additional Details", fr: "Détails complémentaires", ar: "تفاصيل إضافية", darija: "تفاصيل إضافية" },
};

const ARTICLE_LABELS: Record<SupportedLanguage, string> = {
  en: "Article",
  fr: "Article",
  ar: "المادة",
  darija: "المادة",
};

const SECTION_KEYWORDS: SectionKeywordEntry[] = [
  {
    key: "summary",
    patterns: [
      /^summary\b/i,
      /^overview\b/i,
      /^résumé\b/i,
      /^synthèse\b/i,
      /^aperçu\b/i,
      /^خلاصة\b/,
      /^الخلاصة\b/,
      /^ملخص\b/,
    ],
  },
  {
    key: "legalAnalysis",
    patterns: [
      /^legal\s+(?:analysis|reasoning)\b/i,
      /^legal\s+(?:basis|bases)\b/i,
      /^analysis\s+juridique\b/i,
      /^bases?\s+juridiques\b/i,
      /^fondements?\s+juridiques\b/i,
      /^التحليل\s+القانوني\b/,
      /^الأسس\s+القانونية\b/,
      /^الاسس\s+القانونية\b/,
      /^الحقوق\s+والالتزامات\b/,
    ],
  },
  {
    key: "clarifyingQuestions",
    patterns: [
      /^clarifying\s+questions?\b/i,
      /^questions?\s+(?:to\s+)?clarify\b/i,
      /^questions?\s+de\s+clarification\b/i,
      /^questions?\s+a\s+clarifier\b/i,
      /^أسئلة\s+للتوضيح\b/,
      /^اسئلة\s+للتوضيح\b/,
    ],
  },
  {
    key: "citations",
    patterns: [
      /^citations?\b/i,
      /^references?\b/i,
      /^références?\b/i,
      /^references?\s+juridiques\b/i,
      /^المراجع\b/,
      /^الإحالات\b/,
      /^الاحالات\b/,
    ],
  },
];

const SECTION_RENDER_ORDER: SectionKey[] = ["summary", "legalAnalysis", "clarifyingQuestions", "additionalDetails"];

const ChatPage = () => {
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastQuestionType, setLastQuestionType] = useState<string | null>(null);
  const [dict, setDict] = useState(getClientDictionary());
  const [isTyping, setIsTyping] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    query?: string;
    questionType?: string;
    retrievedArticles?: Array<{ code: string; articleNumber: string; score?: number }>;
    processingTime?: number;
    error?: string;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [citationArticles, setCitationArticles] = useState<Record<string, ArticleLookupResponse>>({});
  const [citationArticlesLoaded, setCitationArticlesLoaded] = useState(false);
  const [citationArticlesError, setCitationArticlesError] = useState<string | null>(null);
  const [activeCitationTooltip, setActiveCitationTooltip] = useState<{
    code: string;
    article: string;
    direction: "rtl" | "ltr";
    top: number;
    left: number;
    below?: boolean;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const streamTimerRef = useRef<number | null>(null);
  const streamTimeoutRef = useRef<number | null>(null);
  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentConversation = conversations.find((conversation) => conversation.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  const attachLanguage = useCallback(
    (message: ChatMessage): ChatMessage => {
      if (message.language) {
        return message;
      }
      const detected = detectLanguage(message.content);
      return { ...message, language: detected };
    },
    []
  );

  const conversationCitations = useMemo<AggregatedCitation[]>(() => {
    const map = new Map<string, AggregatedCitation>();

    const pushUnique = (items: string[], value?: string | null) => {
      const trimmed = value?.trim();
      if (!trimmed) {
        return;
      }
      if (!items.includes(trimmed)) {
        items.push(trimmed);
      }
    };

    messages.forEach((message) => {
      message.citations?.forEach((citation) => {
        const normalizedCode = (citation.code || "").toLowerCase().trim();
        const normalizedArticleNumber = (citation.articleNumber || "").toString().trim();

        if (!normalizedCode || !normalizedArticleNumber) {
          return;
        }

        const key = `${normalizedCode}|${normalizedArticleNumber}`;
        const codeValue = (citation.code || "").toString().trim();
        if (!map.has(key)) {
          const sources: string[] = [];
          const effectiveDates: string[] = [];
          pushUnique(sources, citation.source || undefined);
          pushUnique(effectiveDates, citation.effectiveDate || undefined);
          map.set(key, {
            code: codeValue || normalizedCode,
            normalizedCode,
            articleNumber: (citation.articleNumber || "").toString().trim() || normalizedArticleNumber,
            normalizedArticleNumber,
            sources,
            effectiveDates,
          });
        } else {
          const entry = map.get(key)!;
          if (codeValue) {
            entry.code = codeValue;
          }
          pushUnique(entry.sources, citation.source || undefined);
          pushUnique(entry.effectiveDates, citation.effectiveDate || undefined);
        }
      });
    });

    return Array.from(map.values());
  }, [messages]);

  const isRTL = dict.language === "ar";
  const copyLabel = dict.chatCopyMessage || (dict.language === "fr" ? "Copier la réponse" : dict.language === "ar" ? "نسخ الرد" : "Copy answer");
  const lawLocaleKey = useMemo(() => (dict.language === "ar" ? "ar" : dict.language === "fr" ? "fr" : "en"), [dict.language]);
  const conversationLanguage = useMemo<SupportedLanguage>(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const lang = messages[index]?.language;
      if (lang) {
        return lang;
      }
    }
    const fallback = (dict.language as SupportedLanguage) || "en";
    return fallback;
  }, [dict.language, messages]);
  const articleLanguage = useMemo(() => {
    const normalized = conversationLanguage === "darija" ? "ar" : conversationLanguage;
    return normalized === "fr" ? "fr" : normalized === "ar" ? "ar" : "en";
  }, [conversationLanguage]);
  const citationsHeading = dict.citationsTitle || dict.chatExportCitationsSection || "Citations";
  const articleLabel = dict.articleLabel || "Article";
  const citationTooltipTitle =
    dict.citationsTooltipTitle || (dict.language === "ar" ? "نص المادة" : dict.language === "fr" ? "Texte de l'article" : "Article text");
  const citationTooltipLoading =
    dict.citationsTooltipLoading || (dict.language === "ar" ? "جاري تحميل نص المادة..." : dict.language === "fr" ? "Chargement du texte de l'article..." : "Loading article text...");
  const citationTooltipError =
    dict.citationsTooltipError || (dict.language === "ar" ? "تعذر تحميل نص المادة." : dict.language === "fr" ? "Impossible de charger le texte de l'article." : "Unable to load article text.");
  const citationTooltipUnavailable =
    dict.citationsTooltipUnavailable || dict.chatExportArticleTextUnavailable || (dict.language === "ar" ? "نص المادة غير متوفر." : dict.language === "fr" ? "Texte de l'article indisponible." : "Article text unavailable.");

  const getCitationTooltipContent = useCallback(
    (normalizedCode: string, normalizedArticle: string) => {
      const key = `${normalizedCode}|${normalizedArticle}|${articleLanguage}`;
      const articleData = citationArticles[key];
      if (articleData?.text?.trim()) {
        return articleData.text;
      }
      if (citationArticlesError) {
        return citationTooltipError;
      }
      if (citationArticlesLoaded) {
        return citationTooltipUnavailable;
      }
      return citationTooltipLoading;
    },
    [articleLanguage, citationArticles, citationArticlesError, citationArticlesLoaded, citationTooltipError, citationTooltipLoading, citationTooltipUnavailable],
  );

    const showCitationTooltip = useCallback(
      (element: HTMLElement, normalizedCode: string, normalizedArticle: string, direction: "rtl" | "ltr") => {
        // Cancel any pending hide so moving from badge → tooltip stays open
        if (tooltipHideTimeoutRef.current) {
          clearTimeout(tooltipHideTimeoutRef.current);
          tooltipHideTimeoutRef.current = null;
        }
        const rect = element.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const clampedLeft = Math.min(window.innerWidth - 16, Math.max(16, center));
        // If element is near the top, show tooltip below it instead
        const spaceAbove = rect.top;
        const showBelow = spaceAbove < 120;
        const clampedTop = showBelow
          ? Math.min(window.innerHeight - 16, rect.bottom + 8)
          : Math.max(12, rect.top);
        setActiveCitationTooltip({
          code: normalizedCode,
          article: normalizedArticle,
          direction,
          top: clampedTop,
          left: clampedLeft,
          below: showBelow,
        });
      },
      [],
    );

    const hideCitationTooltip = useCallback(() => {
      // Small delay so user can move cursor to the tooltip itself
      tooltipHideTimeoutRef.current = setTimeout(() => {
        setActiveCitationTooltip(null);
        tooltipHideTimeoutRef.current = null;
      }, 150);
    }, []);

  const renderMessageContent = useCallback((text: string, rtl: boolean) => {
    const nodes: JSX.Element[] = [];
    const paragraphBuffer: string[] = [];
    const listBuffer: string[] = [];
    let listType: "unordered" | "ordered" | null = null;

    const flushList = (listKey: number) => {
      if (!listBuffer.length) {
        listType = null;
        return;
      }

      if (listType === "ordered") {
        nodes.push(
          <ol
            key={`list-${listKey}`}
            className={`my-3 space-y-2 list-decimal ${rtl ? "pr-6" : "pl-6"}`}
            dir={rtl ? "rtl" : "ltr"}
          >
            {listBuffer.map((item, itemIndex) => (
              <li key={`list-${listKey}-item-${itemIndex}`} className="leading-relaxed" dir="auto">
                {item}
              </li>
            ))}
          </ol>,
        );
      } else {
        nodes.push(
          <ul
            key={`list-${listKey}`}
            className={`my-3 space-y-2 list-disc ${rtl ? "pr-6" : "pl-6"}`}
            dir={rtl ? "rtl" : "ltr"}
          >
            {listBuffer.map((item, itemIndex) => (
              <li key={`list-${listKey}-item-${itemIndex}`} className="leading-relaxed" dir="auto">
                {item}
              </li>
            ))}
          </ul>,
        );
      }

      listBuffer.splice(0, listBuffer.length);
      listType = null;
    };

    const flushParagraph = (paraKey: number) => {
      if (!paragraphBuffer.length) {
        return;
      }
      nodes.push(
        <p key={`para-${paraKey}`} className="whitespace-pre-line leading-relaxed" dir="auto">
          {paragraphBuffer.join("\n")}
        </p>,
      );
      paragraphBuffer.splice(0, paragraphBuffer.length);
    };

    const lines = text.split(/\r?\n/);
    let keyCounter = 0;

    lines.forEach((rawLine) => {
      const trimmed = rawLine.trim();

      if (!trimmed) {
        flushParagraph(keyCounter++);
        flushList(keyCounter++);
        return;
      }

      if (/^[-*•]\s+/.test(trimmed)) {
        flushParagraph(keyCounter++);
        if (listType && listType !== "unordered") {
          flushList(keyCounter++);
        }
        listType = "unordered";
        listBuffer.push(trimmed.replace(/^[-*•]\s+/, ""));
      } else if (/^(\d+\.|\d+\)|\(\d+\))\s+/.test(trimmed)) {
        flushParagraph(keyCounter++);
        if (listType && listType !== "ordered") {
          flushList(keyCounter++);
        }
        listType = "ordered";
        listBuffer.push(trimmed.replace(/^(\d+\.|\d+\)|\(\d+\))\s+/, ""));
      } else {
        flushList(keyCounter++);
        paragraphBuffer.push(trimmed);
      }
    });

    flushParagraph(keyCounter++);
    flushList(keyCounter++);

    return nodes;
  }, []);

  const getSectionLabel = useCallback((key: SectionKey, language: SupportedLanguage) => {
    if (dict.language === language) {
      switch (key) {
        case "summary":
          return dict.chatSectionSummary || SECTION_LABELS[key][language];
        case "legalAnalysis":
          return dict.chatSectionLegalAnalysis || SECTION_LABELS[key][language];
        case "clarifyingQuestions":
          return dict.chatSectionClarifyingQuestions || SECTION_LABELS[key][language];
        case "additionalDetails":
        default:
          return dict.chatSectionAdditionalDetails || SECTION_LABELS[key][language];
      }
    }

    const labels = SECTION_LABELS[key];
    return (labels && labels[language]) || labels.en;
  }, [dict]);

  const parseAssistantSections = useCallback((text: string): ParsedSection[] => {
    const sections: Record<SectionKey, string[]> = {
      summary: [],
      legalAnalysis: [],
      clarifyingQuestions: [],
      additionalDetails: [],
    };
    const explicitFlags: Record<SectionKey, boolean> = {
      summary: false,
      legalAnalysis: false,
      clarifyingQuestions: false,
      additionalDetails: false,
    };

    let current: SectionKey = "summary";

    const lines = text.split(/\r?\n/);

    lines.forEach((rawLine) => {
      const trimmed = rawLine.trim();

      if (!trimmed) {
        sections[current].push("");
        return;
      }

      const colonIndex = trimmed.indexOf(":");
      const headingCandidate = colonIndex >= 0 ? trimmed.slice(0, colonIndex).trim() : trimmed;
      const matched = SECTION_KEYWORDS.find((entry) => entry.patterns.some((pattern) => pattern.test(headingCandidate)));

      if (matched) {
        if (matched.key !== "citations") {
          current = matched.key as SectionKey;
          explicitFlags[current] = true;
        }

        const remainder = colonIndex >= 0 ? trimmed.slice(colonIndex + 1).trim() : "";
        if (remainder && matched.key !== "citations") {
          sections[current].push(remainder);
        }
        return;
      }

      sections[current].push(trimmed);
    });

    const parsed = SECTION_RENDER_ORDER
      .map<ParsedSection>((key) => ({
        key,
        text: sections[key].join("\n").trim(),
        hasExplicitHeading: explicitFlags[key],
      }))
      .filter((section) => section.text.length > 0);

    if (parsed.length === 0) {
      return parsed;
    }

    const hasAnyExplicit = parsed.some((section) => section.hasExplicitHeading);

    if (!hasAnyExplicit && parsed.length === 1 && parsed[0].key === "summary") {
      const single = parsed[0];
      return [{ ...single, key: "additionalDetails", hasExplicitHeading: false }];
    }

    if (!hasAnyExplicit) {
      return parsed.map((section) => {
        if (section.key !== "summary") {
          return section;
        }
        return { ...section, key: "additionalDetails", hasExplicitHeading: false };
      });
    }

    return parsed;
  }, []);

  const handleCopyMessage = useCallback(async (message: ChatMessage, index: number) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      console.warn("[ChatPage] Clipboard API unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageIndex(index);
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
      copyFeedbackTimeoutRef.current = setTimeout(() => {
        setCopiedMessageIndex((previous) => (previous === index ? null : previous));
        copyFeedbackTimeoutRef.current = null;
      }, 2000);
    } catch (error) {
      console.error("[ChatPage] Failed to copy message", error);
    }
  }, []);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: getClientDictionary().chatNewConversation || "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((previous) => [newConversation, ...previous]);
    setCurrentConversationId(newConversation.id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoaded(true);
      return;
    }

    let hydrated = false;
    try {
      const saved = localStorage.getItem("chatConversations");
      const legacy = localStorage.getItem("chatMessages");

      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          const normalized = parsed.map((conversation) => ({
            ...conversation,
            messages: Array.isArray(conversation.messages)
              ? conversation.messages.map(attachLanguage)
              : [],
          }));
          setConversations(normalized);
          setCurrentConversationId(normalized[0].id);
          hydrated = true;
        }
      } else if (legacy) {
        const legacyMessages: ChatMessage[] = JSON.parse(legacy);
        if (Array.isArray(legacyMessages) && legacyMessages.length) {
          const legacyConversation: Conversation = {
            id: Date.now().toString(),
            title: getClientDictionary().chatNewConversation || "New Chat",
            messages: legacyMessages.map(attachLanguage),
            createdAt: Date.now(),
          };
          setConversations([legacyConversation]);
          setCurrentConversationId(legacyConversation.id);
          hydrated = true;
        }
        localStorage.removeItem("chatMessages");
      }
    } catch (error) {
      console.error("[ChatPage] Failed to restore conversations", error);
    } finally {
      setIsLoaded(true);
    }

    if (!hydrated) {
      createNewConversation();
    }
  }, [attachLanguage, createNewConversation]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem("chatConversations", JSON.stringify(conversations));
    } catch (error) {
      console.error("[ChatPage] Failed to persist conversations", error);
    }
  }, [conversations, isLoaded]);

  useEffect(() => {
    setCopiedMessageIndex(null);
    if (copyFeedbackTimeoutRef.current) {
      clearTimeout(copyFeedbackTimeoutRef.current);
      copyFeedbackTimeoutRef.current = null;
    }
  }, [currentConversationId]);

  useEffect(() => {
    if (!activeCitationTooltip) {
      return;
    }

    const handleHide = () => {
      setActiveCitationTooltip(null);
    };

    window.addEventListener("scroll", handleHide, true);
    window.addEventListener("resize", handleHide);

    return () => {
      window.removeEventListener("scroll", handleHide, true);
      window.removeEventListener("resize", handleHide);
    };
  }, [activeCitationTooltip]);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
      if (tooltipHideTimeoutRef.current) {
        clearTimeout(tooltipHideTimeoutRef.current);
      }
    };
  }, []);

  const updateConversation = useCallback((id: string, changes: Partial<Conversation>) => {
    setConversations((previous) =>
      previous.map((conversation) => (conversation.id === id ? { ...conversation, ...changes } : conversation))
    );
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setOpenMenuId((previous) => (previous === id ? null : previous));
      setConversations((previous) => {
        const remaining = previous.filter((conversation) => conversation.id !== id);
        if (remaining.length === 0) {
          // Create a fresh conversation atomically — no setTimeout race condition
          const fresh: Conversation = {
            id: Date.now().toString(),
            title: getClientDictionary().chatNewConversation || "New Chat",
            messages: [],
            createdAt: Date.now(),
          };
          setCurrentConversationId(fresh.id);
          return [fresh];
        }
        if (currentConversationId === id) {
          setCurrentConversationId(remaining[0].id);
        }
        return remaining;
      });
    },
    [currentConversationId],
  );

  const downloadConversation = useCallback(async (conversation: Conversation, locale: string) => {
    const escapeHtml = (text: string) =>
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const sanitizeFilenameForDownload = (raw: string) =>
      raw
        .replace(/[\u0000-\u001f<>:"/\\|?*\u007f]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120);

    const applyPlaceholder = (template: string | undefined, placeholder: string, value: string) =>
      template ? template.replace(placeholder, value) : value;

    const sanitizedTitle = conversation.title?.trim()
      ? conversation.title.trim()
      : dict.chatNewConversation || dict.chatTitle || "Conversation";
    const documentLang = (dict.language as string) || "en";
    const preparedDate = new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());
    const conversationDate = new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(conversation.createdAt));

    const totalMessages = conversation.messages.length;
    const userMessages = conversation.messages.filter((message) => message.role === "user").length;
    const assistantMessages = conversation.messages.filter((message) => message.role === "assistant").length;

    const aggregatedCitations = new Map<string, {
      code: string;
      articleNumber: string;
      sources: Set<string>;
      effectiveDates: Set<string>;
    }>();

    conversation.messages.forEach((message) => {
      message.citations?.forEach((citation) => {
        const normalizedCode = (citation.code || "").toLowerCase().trim();
        const normalizedArticle = (citation.articleNumber || "").toString().trim();
        if (!normalizedCode || !normalizedArticle) {
          return;
        }
        const key = `${normalizedCode}|${normalizedArticle}`;
        if (!aggregatedCitations.has(key)) {
          aggregatedCitations.set(key, {
            code: normalizedCode,
            articleNumber: normalizedArticle,
            sources: new Set(citation.source ? [citation.source] : []),
            effectiveDates: new Set(citation.effectiveDate ? [citation.effectiveDate] : []),
          });
        } else {
          const entry = aggregatedCitations.get(key)!;
          if (citation.source) entry.sources.add(citation.source);
          if (citation.effectiveDate) entry.effectiveDates.add(citation.effectiveDate);
        }
      });
    });

    const uniqueCitations = aggregatedCitations.size
      ? Array.from(aggregatedCitations.values()).map((citation) => ({
          code: citation.code,
          articleNumber: citation.articleNumber,
        }))
      : [];

    let articleLookupResults: ArticleLookupResponse[] = [];
    if (uniqueCitations.length) {
      try {
        const response = await fetch("/api/articles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            citations: uniqueCitations,
            language: documentLang,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data?.articles)) {
            articleLookupResults = data.articles as ArticleLookupResponse[];
          }
        } else {
          console.error(`[downloadConversation] Article lookup failed with status ${response.status}`);
        }
      } catch (error) {
        console.error("[downloadConversation] Failed to fetch article texts", error);
      }
    }

    const articleResultMap = new Map<string, ArticleLookupResponse>();
    articleLookupResults.forEach((item) => {
      if (!item) return;
      const key = `${(item.code || "").toLowerCase()}|${item.articleNumber || ""}`;
      articleResultMap.set(key, item);
    });

    const localeKeyForMetadata = (["ar", "fr", "en"].includes(documentLang) ? documentLang : "en") as "en" | "fr" | "ar";

    const aggregatedEntries = Array.from(aggregatedCitations.values()).map((citation) => {
      const result = articleResultMap.get(`${citation.code}|${citation.articleNumber}`);
      if (result?.source) citation.sources.add(result.source);
      if (result?.effectiveDate) citation.effectiveDates.add(result.effectiveDate);

      const lawInfo = getLawMetadata(citation.code);
      const lawDisplayName = lawInfo ? lawInfo.name[localeKeyForMetadata] ?? lawInfo.name.en : citation.code.toUpperCase();
      const lawShortName = lawInfo ? lawInfo.shortName[localeKeyForMetadata] ?? lawInfo.shortName.en : citation.code.toUpperCase();

      return {
        code: citation.code,
        articleNumber: citation.articleNumber,
        sources: Array.from(citation.sources),
        effectiveDates: Array.from(citation.effectiveDates),
        lawDisplayName,
        lawShortName,
        articleText: result?.text ?? null,
        articleLanguage: result?.language ?? null,
        articleMetadata: result?.metadata ?? {},
        articleSource: result?.source ?? null,
        articleEffectiveDate: result?.effectiveDate ?? null,
      };
    });

    const coverTitle = dict.chatExportDocumentTitle || "AI-Mizan Legal Brief";
    const coverSubtitle = dict.chatExportDocumentSubtitle || "Guidance grounded in the Moroccan Family Code (Moudawana)";
    const coverTagline = dict.chatExportMoudawanaTagline || "Insights drawn from official Moroccan family law sources.";
    const preparedOn = applyPlaceholder(dict.chatExportPreparedOn, "{date}", preparedDate);
    const summaryTitle = dict.chatExportSummaryTitle || "Conversation Overview";
    const summaryTopic = applyPlaceholder(dict.chatExportSummaryTopic, "{title}", sanitizedTitle);
    const summaryMessages = applyPlaceholder(dict.chatExportSummaryMessages, "{count}", totalMessages.toString());
    const summaryQuestions = applyPlaceholder(dict.chatExportSummaryQuestions, "{count}", userMessages.toString());
    const summaryAnswers = applyPlaceholder(dict.chatExportSummaryAnswers, "{count}", assistantMessages.toString());
    const timelineTitle = dict.chatExportConversationSection || "Conversation Timeline";
    const timelineHint = dict.chatExportTimelineHint || "Messages are listed in chronological order.";
    const messageLabelTemplate = dict.chatExportMessageLabel || "Exchange {index}";
    const userLabel = dict.chatExportUser || "Citizen";
    const assistantLabel = dict.chatExportAssistant || "AI-Mizan";
    const citationsTitle = dict.chatExportCitationsSection || "Referenced Articles";
    const citationsIntro = dict.chatExportCitationsIntro || "Articles cited across this briefing:";
    const noCitations = dict.chatExportNoCitations || "No legal citations were referenced in this conversation.";
    const footerNote = dict.chatExportFooterNote || "Informational briefing generated by AI-Mizan. Consult a licensed lawyer for formal legal advice.";
    const filenamePrefix = dict.chatExportFilenamePrefix || "AI-Mizan-Conversation";
    const conversationTitleLine = applyPlaceholder(dict.chatExportConversationTitlePrefix, "{title}", sanitizedTitle);
    const conversationDateLine = dict.chatExportConversationDate
      ? dict.chatExportConversationDate.replace("{date}", conversationDate)
      : `${dict.chatTitle || "Legal chat"}: ${conversationDate}`;
    const articleTextsTitle = dict.chatExportArticleTextsSection || "Cited Article Texts";
    const articleTextsIntro = dict.chatExportArticleTextsIntro || "Full official text for each cited article.";
    const articleTextUnavailable = dict.chatExportArticleTextUnavailable || "Official text unavailable for this article.";
    const articleLanguageLabel = dict.chatExportArticleLanguage || "Language";
    const articleStructureLabel = dict.chatExportArticleMetadataLabel || "Legal structure";

    const sanitizeLine = (text: string) => escapeHtml(text).replace(/\r?\n/g, "<br />");
    const articleLabel = dict.articleLabel || "Article";
    const sourceLabel = dict.citationsSource || "Source";
    const updatedLabel = dict.citationsUpdated || "Updated";

    const messageHtml = conversation.messages
      .map((message, index) => {
        const roleLabel = message.role === "user" ? userLabel : assistantLabel;
        const exchangeLabel = messageLabelTemplate.replace("{index}", (index + 1).toString());
        const body = sanitizeLine(message.content || "");
        const citationItems = (message.citations || []).map((citation) => {
          const normalizedCode = (citation.code || "").toLowerCase();
          const citationParts = [
            `${escapeHtml(normalizedCode.toUpperCase())} · ${articleLabel} ${escapeHtml(citation.articleNumber)}`,
          ];
          if (citation.source) {
            citationParts.push(`${sourceLabel}: ${escapeHtml(citation.source)}`);
          }
          if (citation.effectiveDate) {
            citationParts.push(`${updatedLabel}: ${escapeHtml(citation.effectiveDate)}`);
          }
          return `<li>${citationParts.join(" · ")}</li>`;
        });

        const citationBlock = citationItems.length
          ? `<div class="message-citations"><h4>${escapeHtml(citationsTitle)}</h4><ul>${citationItems.join("")}</ul></div>`
          : "";

        return `
          <article class="message ${message.role}">
            <header>
              <span class="badge">${escapeHtml(roleLabel)}</span>
              <span class="sequence">${escapeHtml(exchangeLabel)}</span>
            </header>
            <div class="message-body">${body}</div>
            ${citationBlock}
          </article>
        `;
      })
      .join("");

    const citationSummaryHtml = aggregatedEntries.length
      ? aggregatedEntries
          .map((citation) => {
            const sources = citation.sources;
            const effectiveDates = citation.effectiveDates;
            const lawNameLine = citation.lawDisplayName && citation.lawDisplayName !== citation.lawShortName
              ? `<div class="citation-meta">${escapeHtml(citation.lawDisplayName)}</div>`
              : "";
            return `
              <li>
                <div class="citation-title">${escapeHtml(citation.lawShortName.toUpperCase())} · ${articleLabel} ${escapeHtml(citation.articleNumber)}</div>
                ${lawNameLine}
                ${sources.length ? `<div class="citation-meta">${sourceLabel}: ${sources.map((src) => escapeHtml(src)).join(" · ")}</div>` : ""}
                ${effectiveDates.length ? `<div class="citation-meta">${updatedLabel}: ${effectiveDates.map((date) => escapeHtml(date)).join(" · ")}</div>` : ""}
              </li>
            `;
          })
          .join("")
      : "";

    const languageLabels: Record<string, string> = {
      ar: dict.languageArabic || "Arabic",
      fr: dict.languageFrench || "French",
      en: dict.languageEnglish || "English",
    };

    const articleTextsHtml = aggregatedEntries.length
      ? aggregatedEntries
          .map((entry) => {
            const metadataEntries = Object.entries(entry.articleMetadata || {});
            const metadataHtml = metadataEntries.length
              ? `<div class="article-metadata-block">
                  <h5>${escapeHtml(articleStructureLabel)}</h5>
                  <ul class="article-metadata">
                    ${metadataEntries
                      .map(([key, value]) => {
                        const label = ARTICLE_METADATA_LABELS[key]?.[localeKeyForMetadata] || key;
                        const safeValue = value == null ? "" : String(value);
                        return `<li><span>${escapeHtml(label)}:</span> ${escapeHtml(safeValue)}</li>`;
                      })
                      .join("")}
                  </ul>
                </div>`
              : "";

            const resolvedLanguage = entry.articleLanguage ? (languageLabels[entry.articleLanguage] || entry.articleLanguage.toUpperCase()) : "";
            const languageBadge = resolvedLanguage
              ? `<span class="article-language">${escapeHtml(articleLanguageLabel)}: ${escapeHtml(resolvedLanguage)}</span>`
              : "";
            const sourceLine = entry.articleSource ? `<div class="article-meta-line">${escapeHtml(sourceLabel)}: ${escapeHtml(entry.articleSource)}</div>` : "";
            const effectiveLine = entry.articleEffectiveDate ? `<div class="article-meta-line">${escapeHtml(updatedLabel)}: ${escapeHtml(entry.articleEffectiveDate)}</div>` : "";

            const body = entry.articleText
              ? `<div class="article-body">${sanitizeLine(entry.articleText)}</div>`
              : `<div class="article-body missing">${escapeHtml(articleTextUnavailable)}</div>`;

            return `
              <article class="article-section">
                <header class="article-header">
                  <div>
                    <div class="article-prefix">${escapeHtml(entry.lawShortName.toUpperCase())} · ${articleLabel} ${escapeHtml(entry.articleNumber)}</div>
                    <h4>${escapeHtml(entry.lawDisplayName)}</h4>
                  </div>
                  ${languageBadge}
                </header>
                ${metadataHtml}
                ${(sourceLine || effectiveLine) ? `<div class="article-meta">${sourceLine}${effectiveLine}</div>` : ""}
                ${body}
              </article>
            `;
          })
          .join("")
      : "";

    const pdfMarkup = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
        }

        .pdf-document {
          width: 210mm;
          margin: 0 auto;
          color: #1f2937;
          background: #f7f9fb;
          font-family: '${documentLang === "ar" ? "Noto Sans Arabic" : "Work Sans"}', 'Segoe UI', sans-serif;
          line-height: 1.6;
        }

        .pdf-document.ltr {
          direction: ltr;
          text-align: left;
        }

        .pdf-document.rtl {
          direction: rtl;
          text-align: right;
        }

        .pdf-cover {
          background: linear-gradient(160deg, #063b2b 0%, #0d5f45 60%, #1aa274 100%);
          color: white;
          padding: 35mm 28mm;
          min-height: 297mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          page-break-after: always;
        }

        .pdf-cover::after {
          content: "";
          position: absolute;
          inset: 20mm;
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-radius: 18px;
          pointer-events: none;
        }

        .pdf-cover .cover-header {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .pdf-cover .cover-header img {
          width: 88px;
          height: 88px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.2);
          padding: 9px;
        }

        .pdf-cover h1 {
          font-size: 2.4rem;
          margin: 0;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .pdf-cover h2 {
          font-size: 1.35rem;
          margin: 0.75rem 0 0;
          font-weight: 500;
          max-width: 480px;
        }

        .pdf-cover p {
          margin: 0.5rem 0 0;
          font-size: 1rem;
          opacity: 0.85;
        }

        .pdf-cover .metadata {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.25);
          font-size: 0.95rem;
          display: grid;
          gap: 0.5rem;
        }

        .pdf-page {
          background: white;
          margin: 0;
          padding: 25mm 26mm;
          min-height: 297mm;
          page-break-after: always;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(15, 118, 110, 0.08);
        }

        .pdf-page:last-of-type {
          page-break-after: auto;
        }

        .pdf-document .section-title {
          font-size: 1.4rem;
          margin: 0 0 0.6rem;
          font-weight: 600;
          color: #03422f;
        }

        .pdf-document .section-hint {
          font-size: 0.95rem;
          color: #64748b;
          margin: 0 0 1.8rem;
        }

        .pdf-document .summary-card {
          border: 1px solid #c7eedb;
          background: #f3fbf7;
          border-radius: 18px;
          padding: 1.8rem;
          display: grid;
          gap: 0.75rem;
        }

        .pdf-document .summary-card span {
          font-weight: 500;
        }

        .pdf-document .messages {
          display: grid;
          gap: 1.5rem;
        }

        .pdf-document .message {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.4rem 1.6rem;
          background: #ffffff;
          box-shadow: 0 3px 12px rgba(15, 118, 110, 0.05);
        }

        .pdf-document.ltr .message.user {
          border-left: 5px solid #16a34a;
        }

        .pdf-document.ltr .message.assistant {
          border-left: 5px solid #0ea5e9;
        }

        .pdf-document.rtl .message.user {
          border-right: 5px solid #16a34a;
        }

        .pdf-document.rtl .message.assistant {
          border-right: 5px solid #0ea5e9;
        }

        .pdf-document .message header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.9rem;
        }

        .pdf-document .badge {
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
          color: #0f172a;
        }

        .pdf-document .sequence {
          font-size: 0.82rem;
          color: #64748b;
        }

        .pdf-document .message-body {
          font-size: 1rem;
          color: #1f2937;
        }

        .pdf-document .message-citations {
          margin-top: 1rem;
          padding-top: 0.9rem;
          border-top: 1px solid #e2e8f0;
        }

        .pdf-document .message-citations h4 {
          margin: 0 0 0.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
        }

        .pdf-document .message-citations ul {
          margin: 0;
          list-style: disc;
          padding-inline-start: 1.2rem;
        }

        .pdf-document.rtl .message-citations ul {
          padding-inline-start: 0;
          padding-inline-end: 1.2rem;
        }

        .pdf-document .message-citations li {
          margin-bottom: 0.35rem;
          font-size: 0.92rem;
          color: #334155;
        }

        .pdf-document .citations-list {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 16px;
          padding: 1.6rem;
          list-style: none;
          margin: 0;
          display: grid;
          gap: 1rem;
        }

        .pdf-document .citations-list li {
          border-inline-start: 4px solid #10b981;
          padding-inline-start: 1rem;
        }

        .pdf-document.rtl .citations-list li {
          padding-inline-start: 0;
          padding-inline-end: 1rem;
        }

        .pdf-document .citation-title {
          font-weight: 600;
          color: #0f172a;
        }

        .pdf-document .citation-meta {
          font-size: 0.9rem;
          color: #475569;
          margin-top: 0.25rem;
        }

        .pdf-document .article-section {
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 1.8rem;
          background: #ffffff;
          box-shadow: 0 6px 18px rgba(15, 118, 110, 0.06);
          display: grid;
          gap: 1rem;
        }

        .pdf-document .article-section + .article-section {
          margin-top: 1.8rem;
        }

        .pdf-document .article-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .pdf-document .article-prefix {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0f172a;
          font-weight: 600;
        }

        .pdf-document .article-header h4 {
          font-size: 1.2rem;
          margin: 0.4rem 0 0;
          font-weight: 600;
          color: #065f46;
        }

        .pdf-document .article-language {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          background: #dcfce7;
          border-radius: 999px;
          padding: 0.4rem 0.8rem;
        }

        .pdf-document .article-metadata-block h5 {
          margin: 0 0 0.4rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
        }

        .pdf-document .article-metadata {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.35rem;
          font-size: 0.92rem;
          color: #334155;
        }

        .pdf-document .article-metadata li span {
          font-weight: 600;
          color: #0f172a;
        }

        .pdf-document .article-meta {
          display: grid;
          gap: 0.3rem;
          font-size: 0.9rem;
          color: #475569;
        }

        .pdf-document .article-body {
          font-size: 0.98rem;
          color: #1f2937;
          white-space: pre-wrap;
        }

        .pdf-document .article-body.missing {
          color: #9ca3af;
          font-style: italic;
        }

        .pdf-document .footer-note {
          margin-top: auto;
          font-size: 0.9rem;
          color: #64748b;
          text-align: center;
          padding-top: 2rem;
        }
      </style>
      <div class="pdf-document ${documentLang === "ar" ? "rtl" : "ltr"}">
        <section class="pdf-cover">
          <div>
            <div class="cover-header">
              <img src="${window.location.origin}/ai-mizan-logo.png" alt="AI-Mizan" />
              <div>
                <h1>${escapeHtml(coverTitle)}</h1>
                <h2>${escapeHtml(coverSubtitle)}</h2>
                <p>${escapeHtml(coverTagline)}</p>
              </div>
            </div>
            <div class="metadata">
              <span>${escapeHtml(preparedOn)}</span>
              <span>${escapeHtml(conversationTitleLine)}</span>
              <span>${escapeHtml(conversationDateLine)}</span>
            </div>
          </div>
          <div class="footer-note">${escapeHtml(footerNote)}</div>
        </section>
        <section class="pdf-page">
          <h3 class="section-title">${escapeHtml(summaryTitle)}</h3>
          <div class="summary-card">
            <span>${escapeHtml(summaryTopic)}</span>
            <span>${escapeHtml(summaryMessages)}</span>
            <span>${escapeHtml(summaryQuestions)}</span>
            <span>${escapeHtml(summaryAnswers)}</span>
          </div>
        </section>
        <section class="pdf-page">
          <h3 class="section-title">${escapeHtml(timelineTitle)}</h3>
          <p class="section-hint">${escapeHtml(timelineHint)}</p>
          <div class="messages">${messageHtml}</div>
          <div class="footer-note">${escapeHtml(footerNote)}</div>
        </section>
        <section class="pdf-page">
          <h3 class="section-title">${escapeHtml(citationsTitle)}</h3>
          <p class="section-hint">${escapeHtml(citationsIntro)}</p>
          ${aggregatedEntries.length ? `<ul class="citations-list">${citationSummaryHtml}</ul>` : `<div class="summary-card">${escapeHtml(noCitations)}</div>`}
          <div class="footer-note">${escapeHtml(footerNote)}</div>
        </section>
        ${aggregatedEntries.length ? `
          <section class="pdf-page">
            <h3 class="section-title">${escapeHtml(articleTextsTitle)}</h3>
            <p class="section-hint">${escapeHtml(articleTextsIntro)}</p>
            ${articleTextsHtml}
            <div class="footer-note">${escapeHtml(footerNote)}</div>
          </section>
        ` : ""}
      </div>
    `;

    const pdfContainer = document.createElement("div");
    pdfContainer.style.position = "fixed";
    pdfContainer.style.top = "0";
    pdfContainer.style.left = "-9999px";
    pdfContainer.style.width = "210mm";
    pdfContainer.style.zIndex = "-1";
    pdfContainer.style.opacity = "0";
    pdfContainer.style.pointerEvents = "none";
    pdfContainer.innerHTML = pdfMarkup;
    document.body.appendChild(pdfContainer);

    const filenameBase = sanitizeFilenameForDownload(`${filenamePrefix}-${sanitizedTitle}`) || "AI-Mizan-Conversation";
    const pdfFilename = `${filenameBase}.pdf`;
    const fallbackDocument = `<!DOCTYPE html><html lang="${documentLang}" ${documentLang === "ar" ? 'dir="rtl"' : ""}><head><meta charset="utf-8"></head><body>${pdfContainer.innerHTML}</body></html>`;

    try {
      if ("fonts" in document) {
        try {
          await (document as unknown as { fonts: { ready: Promise<void> } }).fonts.ready;
        } catch {
          // Ignore font loading errors; continue to PDF generation.
        }
      }

      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = (html2pdfModule as any).default ?? html2pdfModule;

      await html2pdf()
        .set({
          filename: pdfFilename,
          margin: [10, 12, 14, 12],
          pagebreak: { mode: ["css", "legacy"] },
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(pdfContainer)
        .save();
    } catch (error) {
      console.error("[downloadConversation] Failed to render PDF, using HTML fallback", error);
      const blob = new Blob([fallbackDocument], { type: "text/html" });
      const fallbackUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = fallbackUrl;
      tempLink.download = `${filenameBase}.html`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.setTimeout(() => URL.revokeObjectURL(fallbackUrl), 1000);
    } finally {
      document.body.removeChild(pdfContainer);
    }
  }, [dict]);

  const citationFetchMemo = useMemo(() => {
    const entries = conversationCitations.map((citation) => ({
      code: citation.normalizedCode,
      articleNumber: citation.normalizedArticleNumber,
    }));
    const key = entries.map((entry) => `${entry.code}|${entry.articleNumber}`).join(",");
    return { entries, key };
  }, [conversationCitations]);

  // Preload article text for citations to support hover previews.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const language = articleLanguage;
    const entries = citationFetchMemo.entries;

    if (!entries.length) {
      setCitationArticles((previous) => {
        if (!Object.keys(previous).length) {
          return previous;
        }
        const filtered: Record<string, ArticleLookupResponse> = {};
        Object.entries(previous).forEach(([key, value]) => {
          if (!key.endsWith(`|${language}`)) {
            filtered[key] = value;
          }
        });
        return filtered;
      });
      setCitationArticlesLoaded(true);
      setCitationArticlesError(null);
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    setCitationArticlesLoaded(false);
    setCitationArticlesError(null);

    const loadArticles = async () => {
      try {
        const response = await fetch("/api/articles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            citations: entries.map((entry) => ({
              code: entry.code,
              articleNumber: entry.articleNumber,
            })),
            language,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }

        const data = await response.json();
        if (!isActive) {
          return;
        }

        const incoming: Record<string, ArticleLookupResponse> = {};
        if (Array.isArray(data?.articles)) {
          (data.articles as ArticleLookupResponse[]).forEach((item) => {
            if (!item) {
              return;
            }
            const normalizedCode = (item.code || "").toLowerCase().trim();
            const normalizedArticle = (item.articleNumber || "").toString().trim();
            if (!normalizedCode || !normalizedArticle) {
              return;
            }
            const mapKey = `${normalizedCode}|${normalizedArticle}|${language}`;
            incoming[mapKey] = item;
          });
        }

        setCitationArticles((previous) => {
          const filtered: Record<string, ArticleLookupResponse> = {};
          Object.entries(previous).forEach(([key, value]) => {
            if (!key.endsWith(`|${language}`)) {
              filtered[key] = value;
            }
          });
          return { ...filtered, ...incoming };
        });
        setCitationArticlesLoaded(true);
      } catch (error) {
        if (controller.signal.aborted || !isActive) {
          return;
        }
        console.error("[ChatPage] Failed to fetch article texts", error);
        setCitationArticlesLoaded(true);
        setCitationArticlesError(error instanceof Error ? error.message : "Failed to load article text");
      }
    };

    void loadArticles();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [articleLanguage, citationFetchMemo.key]);

  // Listen for locale changes - only update dictionary, not conversations
  useEffect(() => {
    const updateDict = () => {
      console.log('[DEBUG] Locale changed, updating dictionary only');
      setDict(getClientDictionary());
    };
    window.addEventListener("locale-change", updateDict);
    return () => {
      window.removeEventListener("locale-change", updateDict);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isTyping]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-conversation-menu]')) {
        setOpenMenuId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (openMenuId && !conversations.some(conv => conv.id === openMenuId)) {
      setOpenMenuId(null);
    }
  }, [conversations, openMenuId]);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        window.clearInterval(streamTimerRef.current);
      }
      if (streamTimeoutRef.current) {
        window.clearTimeout(streamTimeoutRef.current);
      }
    };
  }, []);

  const streamAssistantMessage = (
    text: string,
    citations: Array<{ code: string; articleNumber: string }> ,
    isRejected: boolean = false,
    baseMessages: ChatMessage[] = messages,
    language?: SupportedLanguage
  ) => {
    if (streamTimerRef.current) {
      window.clearInterval(streamTimerRef.current);
    }
    if (streamTimeoutRef.current) {
      window.clearTimeout(streamTimeoutRef.current);
    }

    const safeText = text?.trim() ? text : dict.chatError;

    setIsTyping(true);
    const newMessages = [
      ...baseMessages,
      {
        role: "assistant",
        content: "",
        citations,
        isRejected,
        language,
      }
    ];
    updateConversation(currentConversationId!, { messages: newMessages as ChatMessage[] });

    let index = 0;
    streamTimerRef.current = window.setInterval(() => {
      index += 2;
      setConversations((prev) => {
        const convs = [...prev];
        const convIndex = convs.findIndex(c => c.id === currentConversationId);
        if (convIndex === -1) return prev;
        const conv = convs[convIndex];
        const nextMessages = [...conv.messages];
        const last = nextMessages[nextMessages.length - 1];
        if (!last || last.role !== "assistant") {
          return prev;
        }
        nextMessages[nextMessages.length - 1] = {
          ...last,
          content: safeText.slice(0, index)
        };
        const newConv = { ...conv, messages: nextMessages };
        const newConvs = [...convs];
        newConvs[convIndex] = newConv;
        return newConvs;
      });

      if (index >= safeText.length) {
        if (streamTimerRef.current) {
          window.clearInterval(streamTimerRef.current);
        }
        streamTimerRef.current = null;
        if (streamTimeoutRef.current) {
          window.clearTimeout(streamTimeoutRef.current);
        }
        streamTimeoutRef.current = null;
        setIsTyping(false);
      }
    }, 20);

    // Timeout based on text length (minimum 30s, +20ms per character for long responses)
    const timeoutMs = Math.max(30000, safeText.length * 25);
    streamTimeoutRef.current = window.setTimeout(() => {
      if (streamTimerRef.current) {
        window.clearInterval(streamTimerRef.current);
      }
      streamTimerRef.current = null;
      streamTimeoutRef.current = null;
      setIsTyping(false);
    }, timeoutMs);
  };

  const sendMessage = async () => {
    if (loading || isTyping || !input.trim() || !currentConversationId) {
      return;
    }

    const questionLanguage = detectLanguage(input);
    const userMessage: ChatMessage = { role: "user", content: input, language: questionLanguage };
    const newMessages = [...messages, userMessage];
    updateConversation(currentConversationId, { messages: newMessages });

    if (messages.length === 0) {
      const title = input.trim().slice(0, 50) + (input.length > 50 ? '...' : '');
      updateConversation(currentConversationId, { title });
    }

    setInput("");
    setLoading(true);
    setDebugInfo(null);
    const startTime = performance.now();

    try {
      // Build conversation history for context-aware follow-ups
      const historyMessages = newMessages.slice(0, -1).slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage.content,
          language: questionLanguage,
          history: historyMessages,
        })
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      const processingTime = performance.now() - startTime;
      const citations = data.citations || [];
      const qType = data.question_type || null;
      const isRejected = data.error === "non_legal_question" || data.error === "no_citations_available";
      setLastQuestionType(qType);

      // Update debug info
      setDebugInfo({
        query: userMessage.content,
        questionType: qType || 'unknown',
        retrievedArticles: citations.map((c: { code: string; articleNumber: string; score?: number }) => ({
          code: c.code,
          articleNumber: c.articleNumber,
          score: c.score
        })),
        processingTime: Math.round(processingTime),
        error: data.error || undefined
      });

      const sanitizedAnswer = typeof data.answer === "string" ? data.answer.trim() : "";

      if (isRejected) {
        const rejectionMessage = sanitizedAnswer || dict.chatNonLegalResponse || dict.chatUnableToRespond || "I can only answer Moroccan family-law questions.";
        streamAssistantMessage(rejectionMessage, citations ?? [], true, newMessages, (data.language as SupportedLanguage) || questionLanguage);
      } else if (data.clarify) {
        const prompts: string[] = data.prompts || [];
        const promptText = prompts.join("\n- ");
        const clarifyPrefix = dict.chatClarifyQuestion || "Can you clarify:\n- ";
        streamAssistantMessage(
          `${clarifyPrefix}${promptText}`,
          citations,
          false,
          newMessages,
          (data.language as SupportedLanguage) || questionLanguage
        );
      } else {
        const answer = sanitizedAnswer || dict.chatUnableToRespond || "Unable to respond.";
        streamAssistantMessage(answer, citations, false, newMessages, (data.language as SupportedLanguage) || questionLanguage);
      }
    } catch (error) {
      setIsTyping(false);
      const processingTime = performance.now() - startTime;
      setDebugInfo({
        query: userMessage.content,
        questionType: 'error',
        processingTime: Math.round(processingTime),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      const errorMessages = [
        ...messages,
        {
          role: "assistant",
          content: dict.chatError,
          language: questionLanguage
        }
      ];
      updateConversation(currentConversationId!, { messages: errorMessages as ChatMessage[] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] overflow-hidden">
        
        {/* Left Sidebar - Citations & Disclaimer */}
        <aside className="hidden lg:flex flex-col bg-white border-r border-slate-200 overflow-hidden">
          <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
            <h2 className={`text-xs font-semibold uppercase tracking-wider text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>
              {dict.citationsTitle || (dict.language === "ar" ? "الاستشهادات" : dict.language === "fr" ? "Citations" : "Citations")}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 chat-scroll">
            {conversationCitations.length === 0 ? (
              <p className={`text-sm text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                {dict.citationsEmpty || (dict.language === "ar" ? "لا توجد استشهادات بعد" : dict.language === "fr" ? "Aucune citation pour le moment" : "No citations yet")}
              </p>
            ) : (
              conversationCitations.map((citation, index) => {
                const formattedDates = citation.effectiveDates.map((date) => {
                  const parsed = new Date(date);
                  return Number.isNaN(parsed.getTime())
                    ? date
                    : parsed.toLocaleDateString(dict.language === "ar" ? "ar-MA" : dict.language === "fr" ? "fr-FR" : "en-US");
                });
                const displayCode = (citation.code || citation.normalizedCode).toUpperCase();
                const tooltipDirection = articleLanguage === "ar" ? "rtl" : "ltr";

                return (
                  <Link
                    key={citation.normalizedCode + "-" + citation.normalizedArticleNumber + "-" + index}
                    href={"/laws/" + citation.normalizedCode + "/articles/" + citation.articleNumber}
                    className={`relative block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:border-green-300 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                    onMouseEnter={(event) => showCitationTooltip(event.currentTarget, citation.normalizedCode, citation.normalizedArticleNumber, tooltipDirection)}
                    onMouseLeave={hideCitationTooltip}
                    onFocus={(event) => showCitationTooltip(event.currentTarget, citation.normalizedCode, citation.normalizedArticleNumber, tooltipDirection)}
                    onBlur={hideCitationTooltip}
                  >
                    <span className="font-semibold text-slate-800 block mb-1">
                      {displayCode} · {dict.articleLabel || (dict.language === "ar" ? "المادة" : "Art.")} {citation.articleNumber}
                    </span>
                    {citation.sources.length > 0 && (
                      <span className="text-xs text-slate-500 block">
                        {citation.sources.join(" · ")}
                      </span>
                    )}
                    {formattedDates.length > 0 && (
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {formattedDates.join(" · ")}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
          <div className="flex-shrink-0 p-6 border-t border-slate-200">
            <DisclaimerBanner text={dict.disclaimer || (dict.language === "ar" ? "AI-Mizan يوفر معلومات قانونية فقط. لا يحل محل محامٍ مرخص." : dict.language === "fr" ? "AI-Mizan fournit des informations juridiques uniquement. Ne remplace pas un avocat agréé." : "AI-Mizan provides legal information only. Does not replace a licensed lawyer.")} />
          </div>
        </aside>

        {/* Center - Chat Area */}
        <div className="flex flex-col bg-white h-full overflow-hidden">
          {/* Header */}
          <div className={`flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                  {dict.chatTitle || "Legal Chat"}
                </h1>
                <p className="text-sm text-slate-600">
                  {dict.chatSubtitle || "Ask about Moroccan law. AI-Mizan cites official Moroccan law articles."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      await fetch("/api/admin/logout", { method: "POST" });
                    } catch { /* ignore */ }
                    clearAdminToken();
                    window.location.href = "/";
                  }}
                  className="px-3 py-1.5 text-xs rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all"
                  title={dict.language === "fr" ? "Déconnexion" : dict.language === "ar" ? "تسجيل الخروج" : "Logout"}
                >
                  {dict.language === "fr" ? "Déconnexion" : dict.language === "ar" ? "خروج" : "Logout"}
                </button>
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                    showDebug 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Toggle Debug Panel"
                >
                  {showDebug ? '🔍 DEBUG ON' : '🔍 DEBUG'}
                </button>
              </div>
            </div>
            {lastQuestionType && (
              <div className={`mt-2 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs text-green-700 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{dict.chatQuestionType || "Type:"}</span>
                <span className="uppercase">{lastQuestionType}</span>
              </div>
            )}
          </div>

          {/* Debug Panel */}
          {showDebug && debugInfo && (
            <div className="flex-shrink-0 px-6 py-3 bg-amber-50 border-b border-amber-200 font-mono text-xs overflow-x-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-amber-800">DEBUG INFO</span>
                <span className="text-amber-600">|</span>
                <span className="text-amber-700">Processing: {debugInfo.processingTime}ms</span>
                {debugInfo.error && (
                  <span className="text-red-600 font-semibold">| Error: {debugInfo.error}</span>
                )}
              </div>
              <div className="space-y-1 text-amber-900">
                <div><span className="text-amber-600">Query:</span> {debugInfo.query}</div>
                <div><span className="text-amber-600">Type:</span> {debugInfo.questionType}</div>
                <div>
                  <span className="text-amber-600">Retrieved ({debugInfo.retrievedArticles?.length || 0}):</span>
                  {debugInfo.retrievedArticles && debugInfo.retrievedArticles.length > 0 ? (
                    <span className="ml-1">
                      {debugInfo.retrievedArticles.map((a, i) => (
                        <span key={i} className="inline-block bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5 mr-1 mb-1">
                          {a.code.toUpperCase()} Art.{a.articleNumber}
                          {a.score !== undefined && <span className="text-amber-500 ml-1">({(a.score * 100).toFixed(1)}%)</span>}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-amber-500 ml-1">None</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 chat-scroll bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="mb-6">
                    <Image
                      src="/ai-mizan-logo.png"
                      alt="AI-Mizan"
                      width={100}
                      height={100}
                      className="mx-auto opacity-40"
                    />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                    {dict.chatWelcome || "Welcome to AI-Mizan"}
                  </h2>
                  <p className="text-slate-600">
                    {dict.chatWelcomeSubtitle || "Ask a question about Moroccan family law"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isAssistant = message.role === "assistant";
                  const messageLanguage = (message.language as SupportedLanguage) || detectLanguage(message.content);
                  const messageIsRTL = isRtlLanguage(messageLanguage);
                  const messageArticleLabel = dict.language === messageLanguage
                    ? (dict.articleLabel || ARTICLE_LABELS[messageLanguage] || ARTICLE_LABELS.en)
                    : (ARTICLE_LABELS[messageLanguage] || ARTICLE_LABELS.en);
                  const assistantSections = isAssistant ? parseAssistantSections(message.content) : [];
                  const uniqueCitations = isAssistant && message.citations?.length
                    ? Array.from(
                        new Map(
                          message.citations
                            .filter((citation) => (citation.code || "").trim() && (citation.articleNumber || "").toString().trim())
                            .map((citation) => {
                              const key = `${(citation.code || "").toLowerCase()}|${(citation.articleNumber || "").toString().trim()}`;
                              return [key, citation];
                            }),
                        ).values(),
                      )
                    : [];

                  const bubbleClasses = [
                    "relative",
                    "max-w-[75%]",
                    "rounded-2xl",
                    "text-sm",
                    "leading-relaxed",
                    "shadow-sm",
                    messageIsRTL ? "text-right" : "text-left",
                  ];

                  if (message.role === "user") {
                    bubbleClasses.push("bg-green-600", "text-white", "px-4", "py-3");
                  } else if (message.isRejected) {
                    bubbleClasses.push("bg-red-50", "text-red-800", "border-2", "border-red-200", "px-5", "py-4");
                  } else {
                    bubbleClasses.push("bg-white", "text-slate-900", "border", "border-slate-200", "px-5", "py-4", "space-y-5", "group");
                  }

                  if (isAssistant) {
                    bubbleClasses.push(messageIsRTL ? "pl-12" : "pr-12");
                  }

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${message.role === "user" ? (isRTL ? "flex-row" : "flex-row-reverse") : (isRTL ? "flex-row-reverse" : "flex-row")}`}
                    >
                      {isAssistant && (
                        <div className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-green-100 bg-white shadow-sm flex items-center justify-center">
                          <Image
                            src="/ai-mizan-logo.png"
                            alt="AI-Mizan"
                            width={22}
                            height={22}
                          />
                        </div>
                      )}
                      <div className={bubbleClasses.join(" ")} dir={messageIsRTL ? "rtl" : "ltr"}>
                        {isAssistant && !message.isRejected && (
                          <button
                            type="button"
                            className={`absolute top-3 ${messageIsRTL ? "left-3" : "right-3"} inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white/90 text-slate-500 hover:text-green-600 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors`}
                            onClick={() => handleCopyMessage(message, index)}
                            title={copyLabel}
                            aria-label={copyLabel}
                          >
                            {copiedMessageIndex === index ? (
                              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.112 7.21a1 1 0 0 1-1.424 0L3.29 8.99a1 1 0 0 1 1.42-1.408l3.171 3.196 6.4-6.488a1 1 0 0 1 1.423 0Z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9V5.6a1.6 1.6 0 0 1 1.6-1.6h8.8A1.6 1.6 0 0 1 20 5.6v8.8a1.6 1.6 0 0 1-1.6 1.6H15" />
                                <rect x="4" y="8" width="11" height="13" rx="1.6" />
                              </svg>
                            )}
                            <span className="sr-only">{copyLabel}</span>
                          </button>
                        )}
                        {message.isRejected ? (
                          <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-red-200 ${messageIsRTL ? 'flex-row-reverse' : ''}`}>
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                              {dict.chatNonLegal || "Non-legal question"}
                            </span>
                          </div>
                        ) : isAssistant ? (
                          <div className="space-y-5">
                            {assistantSections.length > 0 ? (
                              assistantSections.map((section, sectionIndex) => {
                                const showHeading = section.hasExplicitHeading || assistantSections.length > 1;
                                return (
                                  <section key={`${section.key}-${sectionIndex}`} className="space-y-2" dir="auto">
                                    {showHeading && (
                                      <h3 className="text-base font-semibold text-slate-900">
                                        {getSectionLabel(section.key, messageLanguage)}
                                      </h3>
                                    )}
                                    <div className="space-y-2 text-sm text-slate-700">
                                      {renderMessageContent(section.text, messageIsRTL)}
                                    </div>
                                  </section>
                                );
                              })
                            ) : (
                              <section className="space-y-2" dir="auto">
                                <div className="space-y-2 text-sm text-slate-700">
                                  {renderMessageContent(message.content, messageIsRTL)}
                                </div>
                              </section>
                            )}
                            {uniqueCitations.length > 0 && (
                              <div className={`border-t border-slate-100 pt-4 ${messageIsRTL ? "text-right" : "text-left"}`} dir={messageIsRTL ? "rtl" : "ltr"}>
                                <div
                                  className={`${isRTL ? "text-sm font-semibold text-slate-500 mb-2" : "text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2"}`}
                                  dir={isRTL ? "rtl" : "ltr"}
                                >
                                  {citationsHeading}
                                </div>
                                <div className={`flex flex-wrap gap-2 ${messageIsRTL ? "justify-end" : ""}`}>
                                  {uniqueCitations.map((citation) => {
                                    const normalizedCode = (citation.code || "").toLowerCase().trim();
                                    const normalizedArticle = (citation.articleNumber || "").toString().trim();
                                    const lawInfo = getLawMetadata(normalizedCode);
                                    const lawShortName = lawInfo
                                      ? lawInfo.shortName?.[lawLocaleKey] ?? lawInfo.shortName?.en ?? lawInfo.name?.[lawLocaleKey] ?? lawInfo.name?.en ?? normalizedCode.toUpperCase()
                                      : normalizedCode.toUpperCase();
                                    const tooltipDirection = articleLanguage === "ar" ? "rtl" : "ltr";
                                    return (
                                      <div key={`${normalizedCode}|${normalizedArticle}`} className="inline-flex">
                                        <Link
                                          href={`/laws/${normalizedCode}/articles/${normalizedArticle}`}
                                          className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-100 hover:bg-green-100 hover:border-green-300 transition-colors cursor-pointer"
                                          onMouseEnter={(event) => showCitationTooltip(event.currentTarget, normalizedCode, normalizedArticle, tooltipDirection)}
                                          onMouseLeave={hideCitationTooltip}
                                          onFocus={(event) => showCitationTooltip(event.currentTarget, normalizedCode, normalizedArticle, tooltipDirection)}
                                          onBlur={hideCitationTooltip}
                                        >
                                          <span className="font-medium">{lawShortName}</span>
                                          <span className="font-semibold">{`${messageArticleLabel} ${citation.articleNumber}`}</span>
                                        </Link>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {renderMessageContent(message.content, messageIsRTL)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(loading || isTyping) && (
                  <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-green-100 bg-white shadow-sm flex items-center justify-center">
                      <Image
                        src="/ai-mizan-logo.png"
                        alt="AI-Mizan"
                        width={22}
                        height={22}
                      />
                    </div>
                    <div className="max-w-[75%] rounded-2xl bg-white px-4 py-3 text-sm border border-slate-200 shadow-sm">
                      <div className="typing-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-white">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
                placeholder={dict.chatPlaceholder || "Type your legal question..."}
                className={`flex-1 min-h-[54px] max-h-[120px] resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                rows={1}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <button
                onClick={sendMessage}
                disabled={loading || isTyping || !input.trim()}
                className="flex-shrink-0 h-[54px] bg-green-600 text-white rounded-lg px-5 text-sm font-semibold hover:bg-green-700 active:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading ? dict.chatSending : dict.chatSend}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Conversation History */}
        <aside className="hidden lg:flex flex-col bg-white border-l border-slate-200 overflow-hidden">
          {/* New Chat Button - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-slate-200">
            <button
              onClick={createNewConversation}
              className="w-full bg-green-600 text-white rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-green-700 active:bg-green-800 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="truncate">
                {dict.chatNewConversation || "New Chat"}
              </span>
            </button>
          </div>
          
          {/* Conversations List - Scrollable */}
          <div className="flex-1 overflow-y-auto chat-scroll">
            {conversations.map((conv) => {
              const isActive = conv.id === currentConversationId;
              const locale = dict.language === "ar" ? "ar-MA" : dict.language === "fr" ? "fr-FR" : "en-US";
              const createdAt = new Date(conv.createdAt);
              const formattedDate = createdAt.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
              const formattedTime = createdAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
              const menuLabel = dict.chatConversationMenu || (dict.language === "fr" ? "Options de conversation" : dict.language === "ar" ? "خيارات المحادثة" : "Conversation options");
              const downloadLabel = dict.chatDownloadConversation || (dict.language === "fr" ? "Télécharger la conversation" : dict.language === "ar" ? "تنزيل المحادثة" : "Download chat");
              const deleteLabel = dict.chatDeleteConversation || (dict.language === "fr" ? "Supprimer la conversation" : dict.language === "ar" ? "حذف المحادثة" : "Delete chat");

              return (
                <div
                  key={conv.id}
                  data-conversation-menu
                  className={`relative group flex items-stretch transition-all border-b border-slate-100 ${isRTL ? 'flex-row-reverse' : ''} ${
                    isActive ? 'bg-green-50' : 'hover:bg-slate-50'
                  } ${isActive ? (isRTL ? 'border-r-4 border-r-green-600' : 'border-l-4 border-l-green-600') : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentConversationId(conv.id);
                      setOpenMenuId(null);
                    }}
                    className={`flex-1 px-4 py-4 text-left focus:outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                    dir="auto"
                  >
                    <div className="text-sm font-medium text-slate-800 truncate mb-1.5 leading-snug">
                      {conv.title}
                    </div>
                    <div className="text-xs text-slate-500" dir={isRTL ? 'rtl' : 'ltr'}>
                      {formattedDate} {formattedTime}
                    </div>
                  </button>
                  <div className={`relative flex items-center ${isRTL ? 'pr-4 pl-2' : 'pl-4 pr-2'}`}>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpenMenuId(prev => (prev === conv.id ? null : conv.id));
                      }}
                      aria-label={menuLabel}
                      aria-expanded={openMenuId === conv.id}
                      className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      title={menuLabel}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 3a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm0 5.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm0 5.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
                      </svg>
                    </button>
                    {openMenuId === conv.id && (
                      <div
                        className="absolute top-full mt-2 w-48 rounded-md border border-slate-200 bg-white shadow-lg z-30 right-0"
                        role="menu"
                        aria-orientation="vertical"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        <button
                          type="button"
                          className={`w-full px-4 py-2 ${isRTL ? "text-right" : "text-left"} text-sm text-slate-600 hover:bg-green-50 hover:text-green-700 focus:outline-none`}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setOpenMenuId(null);
                            void downloadConversation(conv, locale);
                          }}
                        >
                          {downloadLabel}
                        </button>
                        <button
                          type="button"
                          className={`w-full px-4 py-2 ${isRTL ? "text-right" : "text-left"} text-sm text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none`}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setOpenMenuId(null);
                            deleteConversation(conv.id);
                          }}
                        >
                          {deleteLabel}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-white border-t border-slate-200 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <span>© 2026 AI-Mizan</span>
            <span className="mx-2">·</span>
            <span>{dict.footerTagline || "Moroccan Family Law Assistant"}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/about" className="hover:text-green-600 transition-colors">
              {dict.footerAbout || "About"}
            </a>
            <a href="/privacy" className="hover:text-green-600 transition-colors">
              {dict.footerPrivacy || "Privacy"}
            </a>
            <a href="/terms" className="hover:text-green-600 transition-colors">
              {dict.footerTerms || "Terms"}
            </a>
          </div>
        </div>
      </footer>
      {activeCitationTooltip && (
        <div
          className="fixed z-[9999] max-w-lg sm:max-w-2xl pointer-events-auto"
          style={{
            top: activeCitationTooltip.top,
            left: activeCitationTooltip.left,
            transform: activeCitationTooltip.below
              ? "translate(-50%, 0)"
              : "translate(-50%, calc(-100% - 8px))",
          }}
          dir={activeCitationTooltip.direction}
          onMouseEnter={() => {
            if (tooltipHideTimeoutRef.current) {
              clearTimeout(tooltipHideTimeoutRef.current);
              tooltipHideTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            setActiveCitationTooltip(null);
          }}
        >
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-600 shadow-2xl">
            <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
              {citationTooltipTitle}
            </div>
            <div className="whitespace-pre-wrap">
              {getCitationTooltipContent(activeCitationTooltip.code, activeCitationTooltip.article)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;