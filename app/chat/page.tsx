"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import DisclaimerBanner from "../../components/DisclaimerBanner";
import { getClientDictionary } from "../../lib/i18nClient";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    code: string;
    articleNumber: string;
    source?: string | null;
    effectiveDate?: string | null;
  }>;
};

const ChatPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [dict, setDict] = useState(getClientDictionary());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const streamTimerRef = useRef<number | null>(null);
  const streamTimeoutRef = useRef<number | null>(null);

  const latestCitations = useMemo(() => {
    const latest = [...messages].reverse().find((message) => message.citations?.length);
    return latest?.citations ?? [];
  }, [messages]);

  useEffect(() => {
    const updateDict = () => setDict(getClientDictionary());
    updateDict();
    window.addEventListener("locale-change", updateDict);
    return () => {
      window.removeEventListener("locale-change", updateDict);
    };
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isTyping]);

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
    citations: Array<{ code: string; articleNumber: string }>
  ) => {
    if (streamTimerRef.current) {
      window.clearInterval(streamTimerRef.current);
    }
    if (streamTimeoutRef.current) {
      window.clearTimeout(streamTimeoutRef.current);
    }

    const safeText = text?.trim() ? text : dict.chatError;

    setIsTyping(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        citations
      }
    ]);

    let index = 0;
    streamTimerRef.current = window.setInterval(() => {
      index += 2;
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (!last || last.role !== "assistant") {
          return prev;
        }
        next[next.length - 1] = {
          ...last,
          content: safeText.slice(0, index)
        };
        return next;
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

    streamTimeoutRef.current = window.setTimeout(() => {
      if (streamTimerRef.current) {
        window.clearInterval(streamTimerRef.current);
      }
      streamTimerRef.current = null;
      streamTimeoutRef.current = null;
      setIsTyping(false);
    }, 15000);
  };

  const sendMessage = async () => {
    if (loading || isTyping || !input.trim()) {
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content })
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      const answer = data.answer || "Unable to respond.";
      const citations = data.citations || [];
      streamAssistantMessage(answer, citations);
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: dict.chatError
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-[calc(100vh-140px)] flex-col pb-0 overflow-hidden"
      style={{ marginBottom: -54, paddingTop: 5}}
    >
      <div className="shrink-0" style={{ marginBottom: 10 }}>
        <h1 className="text-3xl font-semibold">{dict.chatTitle}</h1>
        <p className="text-slate-600">{dict.chatSubtitle}</p>
      </div>

      <div className="grid flex-1 min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-0 flex-col">
          <div className="chat-scroll flex-1 space-y-4 overflow-y-auto pr-2" dir="ltr">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white">
                    <Image
                      src="/ai-mizan-logo.png"
                      alt="AI-Mizan"
                      width={22}
                      height={22}
                    />
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-800 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            {(loading || isTyping) && (
              <div className="flex items-end gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <Image
                    src="/ai-mizan-logo.png"
                    alt="AI-Mizan"
                    width={22}
                    height={22}
                  />
                </span>
                <div className="max-w-[60%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="sticky bottom-0 mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={dict.chatPlaceholder}
                className="min-h-[70px] flex-1 resize-none rounded-xl border border-slate-200 p-3"
              />
              <button
                onClick={sendMessage}
                disabled={loading || isTyping}
                className="btn-primary self-start"
              >
                {loading ? dict.chatSending : dict.chatSend}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Enter to send • Shift + Enter for a new line
            </p>
          </div>
        </div>

        <aside className="space-y-4 lg:border-s lg:border-slate-200 lg:ps-6">
          <div className="surface">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {dict.citationsTitle}
            </h2>
            <div className="mt-4 space-y-3">
              {latestCitations.length === 0 ? (
                <p className="text-sm text-slate-500">{dict.citationsEmpty}</p>
              ) : (
                latestCitations.map((citation, index) => (
                  <Link
                    key={`${citation.code}-${citation.articleNumber}-${index}`}
                    href={`/laws/${citation.code}/articles/${citation.articleNumber}`}
                    className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <span className="font-semibold text-slate-800">
                      {citation.code.toUpperCase()} · {dict.articleLabel} {citation.articleNumber}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {dict.citationsSource}
                      {citation.source ? `: ${citation.source}` : ""}
                      {citation.effectiveDate ? ` · ${citation.effectiveDate}` : ""}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
          <DisclaimerBanner text={dict.disclaimer} />
        </aside>
      </div>
    </div>
  );
};

export default ChatPage;
