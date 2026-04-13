"use client";

import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { SectionTitle } from "./SectionTitle";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AiChatProps {
  token: string;
}

export function AiChat({ token }: AiChatProps) {
  const t = useTranslations("Stay");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/stay/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          token,
          history: messages,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setMessages([
          ...nextHistory,
          { role: "assistant", content: errorData.error ?? t("aiError") },
        ]);
        return;
      }

      const data = await res.json();
      setMessages([...nextHistory, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...nextHistory,
        { role: "assistant", content: t("aiError") },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    t("messageSuggestion1"),
    t("messageSuggestion2"),
    t("messageSuggestion3"),
  ];

  return (
    <section id="ask-ai" className="mx-5 mt-10 scroll-mt-20">
      <div className="mx-auto max-w-md">
        <SectionTitle
          icon={Sparkles}
          title={t("askAnything")}
          subtitle={t("askSubtitle")}
        />

        <div
          className="overflow-hidden rounded-3xl p-3"
          style={{
            background:
              "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #f0f9ff 100%)",
          }}
        >
          {/* Messages */}
          <div
            ref={scrollRef}
            className="max-h-[420px] min-h-[200px] space-y-3 overflow-y-auto p-2"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-start gap-2 px-1 py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage(s)}
                      className="cursor-pointer rounded-full bg-white px-3.5 py-2 text-[12px] font-medium text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-95 dark:bg-card"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-[1.55]",
                      msg.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(27,77,110,0.2)]"
                        : "rounded-bl-md bg-white text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:bg-card"
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:bg-card">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="mt-2 flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:bg-card"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("askPlaceholder")}
              disabled={isLoading}
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition active:scale-95 disabled:opacity-40"
            >
              <Send className="size-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
