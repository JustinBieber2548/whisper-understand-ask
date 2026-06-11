import { createFileRoute } from "@tanstack/react-router";
import { ChatWidget } from "@/components/ChatWidget";
import logo from "@/assets/pk-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PK Supply Chain — Smarter Logistics" },
      {
        name: "description",
        content:
          "PK Supply Chain delivers end-to-end logistics, freight, and supply chain consulting. Chat with us instantly.",
      },
      { property: "og:title", content: "PK Supply Chain" },
      {
        property: "og:description",
        content: "End-to-end logistics & supply chain solutions. Chat with us now.",
      },
      { property: "og:image", content: logo.url },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="PK Supply Chain" className="h-9 w-9 object-contain" />
            <span className="text-lg font-bold tracking-tight text-secondary">
              PK Supply Chain
            </span>
          </div>
          <nav className="hidden gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#services" className="hover:text-foreground">Services</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <a
            href="mailto:pongchai@pksupplychain.com"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Get a quote
          </a>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Now with 24/7 AI assistant
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-secondary sm:text-6xl">
            Smarter logistics.
            <br />
            <span className="text-primary">Stronger supply chains.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            PK Supply Chain helps businesses move goods faster, cheaper, and smarter — across Thailand and beyond.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a
              href="#contact"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Talk to us
            </a>
            <a
              href="#services"
              className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Our services
            </a>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { title: "Freight & Transport", desc: "Road, sea, and air freight with end-to-end tracking." },
              { title: "Warehousing", desc: "Smart storage with real-time inventory visibility." },
              { title: "Consulting", desc: "Supply chain strategy that scales with your business." },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="mb-3 h-1 w-8 rounded-full bg-primary" />
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-secondary">Let's talk</h2>
          <p className="mt-3 text-muted-foreground">
            Click the chat bubble or email{" "}
            <a className="font-medium text-primary underline-offset-4 hover:underline" href="mailto:pongchai@pksupplychain.com">
              pongchai@pksupplychain.com
            </a>
          </p>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PK Supply Chain
      </footer>

      <ChatWidget />
    </div>
  );
}
