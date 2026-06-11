import { createFileRoute } from "@tanstack/react-router";
import { ChatWidget } from "@/components/ChatWidget";

export const Route = createFileRoute("/embed")({
  head: () => ({
    meta: [
      { title: "PK Chat" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Embed,
});

function Embed() {
  // Transparent body so the iframe blends into any host page.
  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <style>{`html, body { background: transparent !important; }`}</style>
      <ChatWidget />
    </div>
  );
}
