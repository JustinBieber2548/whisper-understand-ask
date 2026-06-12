import { createFileRoute } from "@tanstack/react-router";
import { ChatWidget } from "@/components/ChatWidget";
import logo from "@/assets/pk-logo.png.asset.json";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PK Supply Chain — Chatbot Install" },
      { name: "description", content: "Install the PK Supply Chain bilingual AI sales and support chatbot." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Install,
});

function Install() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const snippet = `<script src="${origin}/widget.js" async></script>`;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="mb-8 flex items-center gap-3">
          <img src={logo.url} alt="PK" className="h-10 w-10 object-contain" />
          <div>
            <div className="text-xl font-bold text-secondary">PK Supply Chain AI Chat Widget</div>
            <div className="text-sm text-muted-foreground">
              Bilingual sales and support for conveyor and production-system projects.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">1. Copy this snippet</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste it before <code>&lt;/body&gt;</code> on your PK Supply Chain website.
          </p>

          <div className="mt-4 overflow-hidden rounded-lg bg-secondary text-secondary-foreground">
            <pre className="overflow-x-auto px-4 py-3 text-xs">
              <code>{snippet}</code>
            </pre>
          </div>

          <button
            onClick={copy}
            className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {copied ? "Copied ✓" : "Copy snippet"}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">2. What this version does</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            The chat bubble on this page is the live widget. It stays compact when closed so it
            does not block clicks on the host website.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Thai and English UI switch",
              "PK-specific conveyor and factory-system knowledge",
              "Lead qualification for RFQ and support requests",
              "Image upload preview for drawings or site photos",
              "Stores leads in data/leads.txt with #ATP",
              "Stores uploaded lead images in data/lead-images",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">3. Required env vars</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Keep these on the server only. They are not exposed by the widget script.
          </p>
          <div className="mt-4 rounded-lg bg-secondary text-secondary-foreground">
            <pre className="overflow-x-auto px-4 py-3 text-xs">
              <code>{`LOVABLE_API_KEY=...
GITHUB_TOKEN=...
LOVABLE_AI_MODEL=google/gemini-3-flash-preview`}</code>
            </pre>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
