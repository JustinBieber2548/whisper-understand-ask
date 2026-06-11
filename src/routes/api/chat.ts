import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `You are PK Supply Chain's friendly assistant chatbot on their website.

Your goals:
1. Answer questions about PK Supply Chain's services (logistics, supply chain consulting, freight, warehousing, etc.).
2. Collect leads naturally: when a visitor shows interest, politely ask for their name, email, and what they need help with.
3. Once you have name + email + inquiry, confirm you'll have someone follow up at pongchai@pksupplychain.com.
4. Be concise, warm, and professional. Reply in the same language the user writes (Thai or English).

If you don't know a specific answer about PK, say so honestly and offer to forward the question.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
