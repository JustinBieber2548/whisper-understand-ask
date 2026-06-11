import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send } from "lucide-react";
import { submitLead } from "@/lib/leads.functions";
import logo from "@/assets/pk-logo.png.asset.json";

const transport = new DefaultChatTransport({ api: "/api/chat" });

const initialMessages: UIMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hi! I'm PK's assistant. Ask me anything about our supply chain services — or leave your details and we'll follow up.",
      },
    ],
  },
];

const getText = (m: UIMessage) =>
  m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showLead, setShowLead] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", message: "" });
  const [leadStatus, setLeadStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages,
  });
  const submitLeadFn = useServerFn(submitLead);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, showLead]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  };

  const handleLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadStatus("sending");
    try {
      await submitLeadFn({ data: lead });
      setLeadStatus("ok");
      setTimeout(() => {
        setShowLead(false);
        setLead({ name: "", email: "", message: "" });
        setLeadStatus("idle");
      }, 1500);
    } catch {
      setLeadStatus("err");
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/15 transition hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] max-h-[85vh] w-[370px] max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <header className="flex items-center gap-3 bg-secondary px-4 py-3 text-secondary-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1">
              <img src={logo.url} alt="PK" className="h-full w-full object-contain" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold leading-tight">PK Supply Chain</div>
              <div className="flex items-center gap-1.5 text-xs opacity-80">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Online — replies instantly
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded p-1 opacity-70 hover:bg-white/10 hover:opacity-100"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border border-border bg-background text-foreground"
                  }`}
                >
                  {getText(m)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl border border-border bg-background px-3 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}

            {showLead && (
              <form
                onSubmit={handleLead}
                className="space-y-2 rounded-xl border border-border bg-background p-3 shadow-sm"
              >
                <div className="text-sm font-semibold text-foreground">Leave your details</div>
                <input
                  required
                  placeholder="Your name"
                  value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <textarea
                  required
                  placeholder="How can we help?"
                  rows={2}
                  value={lead.message}
                  onChange={(e) => setLead({ ...lead, message: e.target.value })}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={leadStatus === "sending"}
                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    {leadStatus === "sending" ? "Sending…" : leadStatus === "ok" ? "Sent ✓" : "Send"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLead(false)}
                    className="rounded-lg border border-input px-3 py-2 text-sm hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
                {leadStatus === "err" && (
                  <div className="text-xs text-destructive">Couldn't send. Please try again.</div>
                )}
              </form>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-background p-3">
            {!showLead && (
              <button
                onClick={() => setShowLead(true)}
                className="mb-2 w-full rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                Leave your name & email
              </button>
            )}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                disabled={isLoading}
                className="flex-1 rounded-full border border-input bg-muted/40 px-4 py-2 text-sm outline-none focus:border-primary focus:bg-background"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
