"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You're on the list. We'll let you know when we launch.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection error. Try again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="w-full px-6 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-accent">P</span>UBLYQ
        </span>
        <a
          href="#waitlist"
          className="text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          Waitlist
        </a>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-6 pt-24 pb-32 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-xs font-medium text-accent tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Waitlist open
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
              7 days of content.
              <br />
              <span className="text-accent">1 hour.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted max-w-lg mx-auto leading-relaxed">
              The method that turns 1 hour per week into published content
              across every platform — in your voice, not a robot&apos;s.
            </p>

            {/* Waitlist Form */}
            <div id="waitlist" className="pt-2">
              {status === "success" ? (
                <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
                  {message}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-6 py-3 rounded-lg bg-accent text-background text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                  >
                    {status === "loading" ? "Joining..." : "Get Early Access"}
                  </button>
                </form>
              )}
              {status === "error" && (
                <p className="text-red-400 text-xs mt-2">{message}</p>
              )}
              <p className="text-muted/50 text-xs mt-3">
                No spam. We only email when we launch.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Method */}
        <section className="px-6 py-28 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">Content Machine Method</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Four layers. One system.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              {
                step: "01",
                title: "Foundation",
                desc: "Define your Brand DNA and Voice DNA. The AI learns your voice — once.",
              },
              {
                step: "02",
                title: "Machine",
                desc: "Batch Day: 1 hour, 1 day per week. An entire week of content generated at once.",
              },
              {
                step: "03",
                title: "Kaizen",
                desc: "Review Day: the system analyzes metrics, finds what works, and adjusts the next cycle.",
              },
              {
                step: "04",
                title: "Scale",
                desc: "Multi-platform, multi-format. One input, content adapted for every channel.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-8 bg-surface/50 flex flex-col"
              >
                <span className="text-accent/40 text-xs font-mono tracking-wider mb-6">{item.step}</span>
                <h3 className="font-semibold text-base mb-3">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Problem */}
        <section className="px-6 py-28 max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              The problem everyone ignores
            </h2>
          </div>

          <div className="space-y-3">
            {[
              "You spend more time thinking about what to post than actually working on your business.",
              "AI-generated content doesn't sound like you — it sounds like everyone else.",
              "You publish when you remember. No plan. No consistency.",
              "You don't know what's working because you never measure anything.",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-lg border border-white/5 bg-surface/30">
                <span className="w-1 h-1 rounded-full bg-muted/40 mt-2.5 shrink-0" />
                <p className="text-muted text-sm leading-relaxed">{pain}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-base font-medium leading-relaxed">
              The Content Machine Method solves all of this with a system
              <br className="hidden sm:block" />
              that <span className="text-accent">improves automatically</span> every week.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Differentiator */}
        <section className="px-6 py-28 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {[
              {
                title: "Your voice. Not a robot's.",
                desc: "PUBLYQ learns your tone, vocabulary, and style. The content it generates is indistinguishable from what you'd write — because it starts from you.",
              },
              {
                title: "Batch creation. Not one post at a time.",
                desc: "One 1-hour session generates content for the entire week. Text, carousels, email — all adapted to each platform.",
              },
              {
                title: "Kaizen Loop. The moat.",
                desc: "Every week the system analyzes what worked and adjusts the next cycle. Week 12 is dramatically better than week 1.",
              },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="font-semibold text-base mb-3">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Bottom CTA */}
        <section className="px-6 py-28 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Early access
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              We&apos;re building PUBLYQ for a select group of creators
              and solopreneurs. Sign up to be among the first.
            </p>
            <a
              href="#waitlist"
              className="inline-block px-8 py-3.5 rounded-lg bg-accent text-background text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Get Early Access
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted/50">
          <span>
            <span className="text-accent font-semibold">P</span>UBLYQ &copy; 2026
          </span>
          <span>Publish smarter. Not harder.</span>
        </div>
      </footer>
    </div>
  );
}
