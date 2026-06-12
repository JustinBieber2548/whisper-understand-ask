import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Languages, MessageCircle, Send, Trash2, X } from "lucide-react";
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
        text: "สวัสดีครับ เราเป็นผู้ช่วยของ PK Supply Chain สอบถามเรื่องระบบลำเลียง ไลน์การผลิต หรือฝากข้อมูลให้ทีมงานติดต่อกลับได้เลยครับ\n\nHello, we are the PK Supply Chain assistant. Ask about conveyor systems, production lines, or leave your details for our team to follow up.",
      },
    ],
  },
];

const I18N = {
  th: {
    subtitle: "ออนไลน์ — ตอบกลับทันที",
    leadButton: "ฝากชื่อและอีเมล",
    leadTitle: "ฝากข้อมูลติดต่อ",
    name: "ชื่อของคุณ",
    email: "อีเมล",
    phone: "เบอร์โทรศัพท์",
    message: "ให้เราช่วยอะไรดีครับ?",
    attach: "แนบรูป",
    removeImage: "ลบรูป",
    send: "ส่ง",
    sending: "กำลังส่ง...",
    sent: "ส่งข้อมูลแล้ว",
    cancel: "ยกเลิก",
    placeholder: "พิมพ์ข้อความ...",
    invalid: "กรุณากรอกชื่อ อีเมล และรายละเอียดให้ถูกต้องครับ",
    imageType: "กรุณาเลือกรูปภาพเท่านั้น",
    imageSize: "กรุณาเลือกรูปไม่เกิน 3 MB",
    leadOk: "ส่งข้อมูลเรียบร้อยครับ ทีมงานจะติดต่อกลับโดยเร็ว",
    leadErr: "ส่งข้อมูลไม่ได้ กรุณาลองอีกครั้งครับ",
    leadSummary: "ฝากข้อมูลติดต่อ",
  },
  en: {
    subtitle: "Online — quick reply",
    leadButton: "Leave name and email",
    leadTitle: "Leave contact details",
    name: "Your name",
    email: "Email",
    phone: "Phone number",
    message: "How can we help?",
    attach: "Attach image",
    removeImage: "Remove image",
    send: "Send",
    sending: "Sending...",
    sent: "Sent",
    cancel: "Cancel",
    placeholder: "Type a message...",
    invalid: "Please enter a valid name, email, and message.",
    imageType: "Please choose an image file",
    imageSize: "Please choose an image under 3 MB",
    leadOk: "Your information was sent successfully. Our team will contact you soon.",
    leadErr: "Could not send your details. Please try again.",
    leadSummary: "Contact details",
  },
} as const;

type Language = keyof typeof I18N;

type LeadImage = {
  name: string;
  type: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  size: number;
  dataUrl: string;
};

type LocalMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
  imageName?: string;
};

const getText = (m: UIMessage) =>
  m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

function isSupportedImage(type: string): type is LeadImage["type"] {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(type);
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("th");
  const [input, setInput] = useState("");
  const [showLead, setShowLead] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", phone: "", message: "" });
  const [leadImage, setLeadImage] = useState<LeadImage | null>(null);
  const [leadStatus, setLeadStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [leadError, setLeadError] = useState("");
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copy = I18N[language];
  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages,
  });
  const submitLeadFn = useServerFn(submitLead);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    window.parent?.postMessage({ type: "pk-chat-frame", open }, "*");
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, localMessages, showLead, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  };

  const resetLead = () => {
    setLead({ name: "", email: "", phone: "", message: "" });
    setLeadImage(null);
    setLeadError("");
    setLeadStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImage = (file: File | undefined) => {
    if (!file) return;

    if (!isSupportedImage(file.type)) {
      setLeadError(copy.imageType);
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setLeadError(copy.imageSize);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLeadImage({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: String(reader.result),
      });
      setLeadError("");
    };
    reader.readAsDataURL(file);
  };

  const handleLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadStatus === "sending") return;

    const cleanLead = {
      name: lead.name.trim(),
      email: lead.email.trim(),
      phone: lead.phone.trim(),
      message: lead.message.trim(),
    };

    if (!cleanLead.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanLead.email) || !cleanLead.message) {
      setLeadError(copy.invalid);
      return;
    }

    setLeadStatus("sending");
    setLeadError("");

    const receiptId = `lead-${Date.now()}`;
    setLocalMessages((current) => [
      ...current,
      {
        id: receiptId,
        role: "user",
        text: `${copy.leadSummary}\n${cleanLead.name}\n${cleanLead.email}${cleanLead.phone ? `\n${cleanLead.phone}` : ""}\n${cleanLead.message}`,
        imageUrl: leadImage?.dataUrl,
        imageName: leadImage?.name,
      },
    ]);

    try {
      await submitLeadFn({
        data: {
          ...cleanLead,
          language,
          image: leadImage ?? undefined,
        },
      });

      setLeadStatus("ok");
      setLocalMessages((current) => [
        ...current,
        { id: `${receiptId}-ok`, role: "assistant", text: copy.leadOk },
      ]);
      setShowLead(false);
      resetLead();
    } catch (error) {
      console.error(error);
      setLeadStatus("err");
      setLeadError(copy.leadErr);
      setLocalMessages((current) => [
        ...current,
        { id: `${receiptId}-err`, role: "assistant", text: copy.leadErr },
      ]);
    }
  };

  const conversation = [
    ...messages.map((message) => ({
      id: message.id,
      role: message.role === "user" ? ("user" as const) : ("assistant" as const),
      text: getText(message),
    })),
    ...localMessages,
  ];

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/15 transition hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 left-6 z-50 flex h-[560px] max-h-[85vh] w-[370px] max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <header className="flex items-center gap-3 bg-secondary px-4 py-3 text-secondary-foreground">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-1">
              <img src={logo.url} alt="PK" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold leading-tight">PK Supply Chain</div>
              <div className="flex items-center gap-1.5 truncate text-xs opacity-80">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                {copy.subtitle}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full border border-white/25 p-0.5">
                <Languages className="ml-1 h-3.5 w-3.5 opacity-70" />
                {(["th", "en"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLanguage(value)}
                    className={`rounded-full px-2 py-1 text-[10px] font-bold transition ${
                      language === value ? "bg-white text-secondary" : "text-white/75 hover:text-white"
                    }`}
                  >
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded p-1 opacity-70 hover:bg-white/10 hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4">
            {conversation.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border border-border bg-background text-foreground"
                  }`}
                >
                  <div>{m.text}</div>
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt={m.imageName || ""}
                      className="mt-2 max-h-36 w-full rounded-xl border border-white/30 object-cover"
                    />
                  )}
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
              <form onSubmit={handleLead} className="space-y-2 rounded-xl border border-border bg-background p-3 shadow-sm">
                <div className="text-sm font-semibold text-foreground">{copy.leadTitle}</div>
                <input
                  required
                  placeholder={copy.name}
                  value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                />
                <input
                  required
                  type="email"
                  placeholder={copy.email}
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                />
                <input
                  type="tel"
                  placeholder={copy.phone}
                  value={lead.phone}
                  onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                />
                <textarea
                  required
                  placeholder={copy.message}
                  rows={3}
                  value={lead.message}
                  onChange={(e) => setLead({ ...lead, message: e.target.value })}
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => handleImage(event.target.files?.[0])}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-primary px-3 text-xs font-semibold text-primary hover:bg-primary/5"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    {copy.attach}
                  </button>
                  {leadImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setLeadImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {copy.removeImage}
                    </button>
                  )}
                </div>
                {leadImage && (
                  <img
                    src={leadImage.dataUrl}
                    alt={leadImage.name}
                    className="max-h-28 w-full rounded-xl border border-border object-cover"
                  />
                )}
                {leadError && <div className="text-xs text-destructive">{leadError}</div>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={leadStatus === "sending"}
                    className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    {leadStatus === "sending" ? copy.sending : leadStatus === "ok" ? copy.sent : copy.send}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLead(false);
                      setLeadError("");
                    }}
                    className="rounded-xl border border-input px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {copy.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="border-t border-border bg-background p-3">
            {!showLead && (
              <button
                onClick={() => setShowLead(true)}
                className="mb-2 w-full rounded-full border border-dashed border-primary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5"
              >
                {copy.leadButton}
              </button>
            )}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={copy.placeholder}
                disabled={isLoading}
                className="h-10 min-w-0 flex-1 rounded-full border border-input bg-muted/40 px-4 text-sm outline-none focus:border-primary focus:bg-background"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
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
