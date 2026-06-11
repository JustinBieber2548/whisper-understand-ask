import { createFileRoute } from "@tanstack/react-router";
import { ChatWidget } from "@/components/ChatWidget";
import logo from "@/assets/pk-logo.png.asset.json";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PK Supply Chain — Chatbot Install" },
      { name: "description", content: "Install snippet for the PK Supply Chain AI chatbot widget." },
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
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-8 flex items-center gap-3">
          <img src={logo.url} alt="PK" className="h-10 w-10 object-contain" />
          <div>
            <div className="text-xl font-bold text-secondary">PK Chat Widget</div>
            <div className="text-sm text-muted-foreground">Install on any page in 1 line.</div>
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
          <h2 className="text-sm font-semibold text-foreground">2. Preview</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            The chat bubble in the bottom-right of this page is the live widget.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• AI replies powered by Google Gemini 3 Flash</li>
            <li>
              • Lead form appends to{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">data/leads.txt</code> in your
              GitHub repo
            </li>
            <li>• Mobile responsive (full screen on small screens)</li>
          </ul>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
