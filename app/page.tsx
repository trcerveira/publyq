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
        setMessage("Estás na lista! Vamos avisar-te quando lançarmos.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Algo correu mal. Tenta novamente.");
      }
    } catch {
      setStatus("error");
      setMessage("Erro de ligação. Tenta novamente.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-accent">P</span>UBLYQ
          </span>
        </div>
        <a
          href="#waitlist"
          className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          Lista de Espera →
        </a>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-sm text-accent">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Em desenvolvimento — lista de espera aberta
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            7 dias de conteúdo.
            <br />
            <span className="text-accent">1 hora.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted max-w-xl mx-auto leading-relaxed">
            O método que transforma 1 hora por semana em 7 dias de conteúdo
            publicado — na tua voz, em todas as plataformas.
          </p>

          {/* Waitlist Form */}
          <div id="waitlist" className="pt-4">
            {status === "success" ? (
              <div className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-accent/10 border border-accent/20 text-accent font-medium">
                ✓ {message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="o-teu@email.com"
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-surface border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-6 py-3 rounded-xl bg-accent text-background font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {status === "loading" ? "A enviar..." : "Quero Acesso"}
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="text-red-400 text-sm mt-2">{message}</p>
            )}
            <p className="text-muted text-xs mt-3">
              Sem spam. Só te avisamos quando estiver pronto.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto mt-24 w-full">
          <h2 className="text-2xl font-bold text-center mb-12">
            Como funciona o <span className="text-accent">Content Machine Method™</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Fundação",
                desc: "Define o teu Brand DNA + Voice DNA. Uma vez. O AI aprende a tua voz.",
                icon: "🧬",
              },
              {
                step: "02",
                title: "Máquina",
                desc: "Batch Day: 1 hora, 1 dia por semana. Conteúdo para 7 dias gerado.",
                icon: "⚡",
              },
              {
                step: "03",
                title: "Kaizen",
                desc: "Review Day: métricas → análise → ajuste. Cada semana melhor que a anterior.",
                icon: "📈",
              },
              {
                step: "04",
                title: "Escala",
                desc: "Multi-plataforma, multi-formato. O teu conteúdo chega a todo o lado.",
                icon: "🚀",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-surface border border-white/5 hover:border-accent/20 transition-colors"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-accent text-xs font-bold mb-1">CAMADA {item.step}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pain points */}
        <div className="max-w-2xl mx-auto mt-24 w-full text-center space-y-8">
          <h2 className="text-2xl font-bold">
            Cansado de perder <span className="text-accent">horas</span> a criar conteúdo?
          </h2>
          <div className="space-y-4 text-left">
            {[
              "Passas mais tempo a pensar no que publicar do que a trabalhar no teu negócio",
              "O conteúdo não soa a ti — parece genérico e feito por AI",
              "Publicas quando te lembras, sem estratégia nem consistência",
              "Não sabes o que está a funcionar porque não medes nada",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-surface/50 border border-white/5">
                <span className="text-red-400 mt-0.5">✕</span>
                <p className="text-muted">{pain}</p>
              </div>
            ))}
          </div>
          <p className="text-lg font-medium">
            O Content Machine Method™ resolve tudo isto.
            <br />
            <span className="text-accent">1 hora. 7 dias. Na tua voz.</span>
          </p>
        </div>

        {/* CTA bottom */}
        <div className="max-w-md mx-auto mt-24 text-center space-y-6">
          <h2 className="text-2xl font-bold">
            Junta-te aos primeiros
          </h2>
          <p className="text-muted">
            Estamos a construir o PUBLYQ para um grupo selecto de criadores.
            Inscreve-te para acesso antecipado.
          </p>
          <a
            href="#waitlist"
            className="inline-block px-8 py-4 rounded-xl bg-accent text-background font-semibold hover:bg-accent/90 transition-colors"
          >
            Quero Acesso Antecipado →
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span>
            <span className="text-accent font-bold">P</span>UBLYQ © 2026
          </span>
          <span>Publish smarter. Not harder.</span>
        </div>
      </footer>
    </div>
  );
}
