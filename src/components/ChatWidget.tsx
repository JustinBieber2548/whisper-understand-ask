import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/leads.functions";

const transport = new DefaultChatTransport({ api: "/api/chat" });

const initialMessages: UIMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "สวัสดีครับ! I'm PK Supply Chain's assistant. How can I help you today? (Ask anything, or leave your name & email and we'll follow up.)",
      },
    ],
  },
];

function getText(m: UIMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [leadOpen, setLeadOpen] = useState(false);
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
  }, [messages, leadOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadStatus("sending");
    try {
      await submitLeadFn({ data: lead });
      setLeadStatus("ok");
      setTimeout(() => {
        setLeadOpen(false);
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
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[85vh] w-[380px] max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <header className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <div className="font-semibold">PK Supply Chain</div>
              <div className="text-xs opacity-80">We typically reply instantly</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-white/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border text-foreground"
                  }`}
                >
                  {getText(m)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                  typing…
                </div>
              </div>
            )}

            {leadOpen && (
              <form onSubmit={handleLeadSubmit} className="space-y-2 rounded-xl border border-border bg-background p-3">
                <div className="text-sm font-medium">Leave your details</div>
                <input
                  required
                  placeholder="Name"
                  value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />
                <textarea
                  required
                  placeholder="How can we help?"
                  rows={2}
                  value={lead.message}
                  onChange={(e) => setLead({ ...lead, message: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={leadStatus === "sending"}
                    className="flex-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {leadStatus === "sending" ? "Sending…" : leadStatus === "ok" ? "Sent ✓" : "Send"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadOpen(false)}
                    className="rounded-md border border-input px-3 py-1.5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
                {leadStatus === "err" && (
                  <div className="text-xs text-destructive">Couldn't send. Try again.</div>
                )}
              </form>
            )}
          </div>

          <div className="border-t border-border bg-background p-3">
            {!leadOpen && (
              <button
                onClick={() => setLeadOpen(true)}
                className="mb-2 w-full rounded-md border border-input bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                📝 Leave name & email for follow-up
              </button>
            )}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message…"
                disabled={isLoading}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
