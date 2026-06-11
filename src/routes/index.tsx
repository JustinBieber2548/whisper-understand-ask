import { createFileRoute } from "@tanstack/react-router";
import { ChatWidget } from "@/components/ChatWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PK Supply Chain — Logistics & Supply Chain Solutions" },
      {
        name: "description",
        content:
          "PK Supply Chain delivers end-to-end logistics, freight, and supply chain consulting. Chat with us 24/7.",
      },
      { property: "og:title", content: "PK Supply Chain" },
      {
        property: "og:description",
        content: "End-to-end logistics & supply chain solutions. Chat with us now.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-xl font-bold tracking-tight text-slate-900">PK Supply Chain</div>
          <nav className="hidden gap-6 text-sm text-slate-600 md:flex">
            <a href="#services" className="hover:text-slate-900">Services</a>
            <a href="#about" className="hover:text-slate-900">About</a>
            <a href="#contact" className="hover:text-slate-900">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Smarter logistics. <span className="text-primary">Stronger supply chains.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            PK Supply Chain helps businesses move goods faster, cheaper, and smarter — across Thailand and beyond.
          </p>
          <p className="mt-8 text-sm text-slate-500">
            Have a question? Click the chat bubble in the corner — our AI assistant replies instantly.
          </p>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Freight & Transport", desc: "Road, sea, and air freight with full tracking." },
              { title: "Warehousing", desc: "Smart storage with real-time inventory." },
              { title: "Consulting", desc: "Supply chain strategy that scales with you." },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Get in touch</h2>
          <p className="mt-2 text-slate-600">
            Email us at <a className="text-primary underline" href="mailto:pongchai@pksupplychain.com">pongchai@pksupplychain.com</a> or chat now.
          </p>
        </section>
      </main>

      <ChatWidget />
    </div>
  );
}
