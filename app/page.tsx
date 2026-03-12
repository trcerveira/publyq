"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
        setMessage("Estás na lista. Avisamos quando lançarmos.");
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
      <nav className="w-full px-6 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <Image src="/logo-publyq.jpeg" alt="PUBLYQ" width={140} height={36} className="h-9 w-auto" />
        <div className="flex items-center gap-4">
          <a
            href="#waitlist"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Waitlist
          </a>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            Entrar
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-6 pt-24 pb-32 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-xs font-medium text-accent tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Acesso antecipado
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
              7 dias de conteúdo.
              <br />
              <span className="text-accent">Uma manhã.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted max-w-lg mx-auto leading-relaxed">
              O método que transforma uma manhã por semana em conteúdo publicado
              para todas as plataformas — na tua voz, não na de um robô.
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
                    placeholder="o-teu@email.com"
                    required
                    className="flex-1 px-4 py-3 rounded-lg bg-surface border border-white/10 text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-6 py-3 rounded-lg bg-accent text-background text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                  >
                    {status === "loading" ? "A entrar..." : "Acesso Antecipado"}
                  </button>
                </form>
              )}
              {status === "error" && (
                <p className="text-red-400 text-xs mt-2">{message}</p>
              )}
              <p className="text-muted/50 text-xs mt-3">
                Sem spam. Só avisamos quando lançarmos.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Content Machine Method */}
        <section className="px-6 py-28 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">Content Machine Method</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Quatro camadas. Um sistema.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              {
                step: "01",
                title: "Foundation",
                desc: "Define o teu Brand DNA e Voice DNA. A IA aprende a tua voz — uma vez.",
              },
              {
                step: "02",
                title: "Machine",
                desc: "Batch Day: uma manhã, 1 dia por semana. Uma semana inteira de conteúdo gerada de uma vez.",
              },
              {
                step: "03",
                title: "Kaizen",
                desc: "O sistema analisa métricas, descobre o que funciona e ajusta o próximo ciclo.",
              },
              {
                step: "04",
                title: "Scale",
                desc: "Multi-plataforma, multi-formato. Um input, conteúdo adaptado para cada canal.",
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
              O problema que todos ignoram
            </h2>
          </div>

          <div className="space-y-3">
            {[
              "Passas mais tempo a pensar no que publicar do que a trabalhar no teu negócio.",
              "O conteúdo gerado por IA não soa como tu — soa como toda a gente.",
              "Publicas quando te lembras. Sem plano. Sem consistência.",
              "Não sabes o que está a funcionar porque nunca medes nada.",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-lg border border-white/5 bg-surface/30">
                <span className="w-1 h-1 rounded-full bg-muted/40 mt-2.5 shrink-0" />
                <p className="text-muted text-sm leading-relaxed">{pain}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-base font-medium leading-relaxed">
              O Content Machine Method resolve tudo isto com um sistema
              <br className="hidden sm:block" />
              que <span className="text-accent">melhora automaticamente</span> a cada semana.
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
                title: "A tua voz. Não a de um robô.",
                desc: "O PUBLYQ aprende o teu tom, vocabulário e estilo. O conteúdo que gera é indistinguível do que tu escreverias — porque começa de ti.",
              },
              {
                title: "Batch creation. Não um post de cada vez.",
                desc: "Uma sessão de manhã gera conteúdo para a semana inteira. Texto, carrosséis, email — tudo adaptado a cada plataforma.",
              },
              {
                title: "Kaizen Loop. O moat.",
                desc: "Todas as semanas o sistema analisa o que funcionou e ajusta o próximo ciclo. A semana 12 é dramaticamente melhor que a semana 1.",
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
              Acesso antecipado
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Estamos a construir o PUBLYQ para um grupo selecto de criadores
              e empreendedores. Inscreve-te para seres dos primeiros.
            </p>
            <a
              href="#waitlist"
              className="inline-block px-8 py-3.5 rounded-lg bg-accent text-background text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Acesso Antecipado
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted/50">
          <span className="flex items-center gap-2">
            <Image src="/logo-publyq.jpeg" alt="PUBLYQ" width={80} height={20} className="h-5 w-auto" />
            <span>&copy; 2026</span>
          </span>
          <span>Publica melhor. Não mais.</span>
        </div>
      </footer>
    </div>
  );
}
