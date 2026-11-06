"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const welcomeMessage: ChatMessage = {
  role: "assistant",
  content:
    "Salom! Men AI Academy yordamchisiman. Sayt, kurslar, roadmap yoki classroom bo'yicha savolingizga javob beraman.",
};

export function WebsiteAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, pending, open]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    try {
      const response = await fetch("/api/website-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.filter((message) => message.role !== "assistant" || message !== welcomeMessage).slice(-8),
        }),
      });
      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !data.answer) {
        throw new Error(data.error ?? "Javob olinmadi.");
      }
      setMessages((current) => [...current, { role: "assistant", content: data.answer! }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "AI yordamchi bilan aloqa uzildi. Keyinroq qayta urinib ko'ring.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              key="assistant-overlay"
              type="button"
              aria-label="AI yordamchini yopish"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] cursor-default bg-ink/10 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
            <motion.div
              key="assistant-panel"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed bottom-24 right-3 z-[70] flex max-h-[min(34rem,calc(100dvh-7rem))] w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-[1.4rem] border-2 border-white bg-white shadow-lift sm:right-5"
              role="dialog"
              aria-modal="true"
              aria-label="AI Academy yordamchisi"
            >
              <div className="flex items-center gap-2.5 border-b border-line bg-canvas/60 p-3.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                  <Bot className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-ink">AI Academy yordamchisi</p>
                  <p className="flex items-center gap-1 text-[10px] font-semibold text-muted">
                    <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                    Sayt bo&apos;yicha onlayn
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-line bg-white text-muted transition-colors hover:text-ink"
                  aria-label="Yopish"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              <div ref={scrollRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3.5">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <p
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-xs font-semibold leading-relaxed",
                        message.role === "user"
                          ? "rounded-br-md bg-primary-600 text-white"
                          : "rounded-bl-md bg-canvas text-slate-700",
                      )}
                    >
                      {message.content}
                    </p>
                  </div>
                ))}
                {pending ? (
                  <div className="flex justify-start">
                    <span className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-canvas px-3 py-2.5">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="size-1.5 rounded-full bg-slate-400"
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: dot * 0.12 }}
                        />
                      ))}
                    </span>
                  </div>
                ) : null}
              </div>

              <form onSubmit={onSubmit} className="border-t border-line bg-white p-2.5">
                <div className="flex items-end gap-1.5">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Sayt haqida savol yozing..."
                    maxLength={1000}
                    className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-canvas/60 px-3 text-xs font-semibold text-ink outline-none placeholder:text-muted focus:border-primary-300"
                    aria-label="Savolingiz"
                  />
                  <button
                    type="submit"
                    disabled={pending || input.trim().length === 0}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Yuborish"
                  >
                    <Send className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-1.5 flex items-center gap-1 px-1 text-[9px] font-semibold text-muted">
                  <Sparkles className="size-2.5" aria-hidden="true" />
                  Faqat AI Academy sayti bo&apos;yicha javob beradi
                </p>
              </form>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "fixed bottom-4 right-3 z-[70] inline-flex items-center gap-2 rounded-full border-2 border-white bg-primary-600 py-2.5 pl-2.5 pr-3.5 text-xs font-extrabold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-primary-700 sm:bottom-5 sm:right-5",
          open ? "scale-0 opacity-0" : "scale-100 opacity-100",
        )}
        aria-label={open ? "AI yordamchini yopish" : "AI yordamchini ochish"}
        aria-expanded={open}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-white/15">
          <MessageCircle className="size-4" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">Sayt bo&apos;yicha savol</span>
      </button>
    </>
  );
}
