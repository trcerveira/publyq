"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useUser();
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
            href={isSignedIn ? "/dashboard" : "/sign-in"}
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            {isSignedIn ? "Dashboard" : "Entrar"}
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* 1. Hero */}
        <section className="flex flex-col items-center justify-center px-6 pt-24 pb-32 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-xs font-medium text-accent tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Acesso antecipado
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
              Cria o conteúdo de uma semana
              <br />
              <span className="text-accent">numa manhã.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted max-w-lg mx-auto leading-relaxed">
              O método que transforma uma manhã por semana em conteúdo publicado
              para todas as plataformas — na tua voz, não na de um robô.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="px-8 py-3.5 rounded-lg bg-accent text-background text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                Começar Grátis
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-3.5 rounded-lg border border-white/10 text-foreground text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Como funciona
              </a>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* 2. Problem */}
        <section className="px-6 py-28 max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">O Problema</p>
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
                <span className="w-1 h-1 rounded-full bg-red-400/60 mt-2.5 shrink-0" />
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

        {/* 3. Solution — Content Machine Method */}
        <section className="px-6 py-28 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">Content Machine Method</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Três camadas. Um sistema.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              {
                step: "01",
                title: "Foundation",
                desc: "Define o teu Brand DNA e Voice DNA. A IA aprende a tua voz, o teu tom e o teu público — uma única vez.",
              },
              {
                step: "02",
                title: "Machine",
                desc: "Batch Day: uma manhã por semana. Uma semana inteira de conteúdo gerada de uma vez — carrosséis, posts, emails.",
              },
              {
                step: "03",
                title: "REFINE Loop",
                desc: "O sistema analisa métricas, descobre o que funciona e ajusta o próximo ciclo. Cada semana melhor que a anterior.",
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

        {/* 4. How it Works */}
        <section id="how-it-works" className="px-6 py-28 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">Como Funciona</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              4 passos. Conteúdo na tua voz.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: "🧬",
                title: "Brand DNA",
                desc: "Respondes a perguntas sobre o teu negócio, público e posicionamento. O sistema cria o teu perfil de marca único.",
                time: "15 min (uma vez)",
              },
              {
                step: "2",
                icon: "🎙️",
                title: "Voice DNA",
                desc: "Defines o teu tom, vocabulário e estilo. A IA aprende a escrever como tu — não como um robô genérico.",
                time: "10 min (uma vez)",
              },
              {
                step: "3",
                icon: "📝",
                title: "Linhas Editoriais",
                desc: "O sistema gera linhas editoriais alinhadas com a tua marca. Temas, ângulos e hooks prontos para a semana.",
                time: "5 min (semanal)",
              },
              {
                step: "4",
                icon: "🎠",
                title: "Carrossel",
                desc: "Escolhes o tema, o sistema gera carrosséis profissionais prontos a publicar. Uma manhã = 7 dias de conteúdo.",
                time: "1 manhã/semana",
              },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 rounded-xl border border-white/5 bg-surface/20">
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
                  Passo {item.step}
                </div>
                <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed mb-3">{item.desc}</p>
                <p className="text-accent/60 text-xs font-mono">{item.time}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/sign-up"
              className="inline-block px-8 py-3.5 rounded-lg bg-accent text-background text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Começar Grátis
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* 5. Differentiator */}
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
                title: "REFINE Loop. O moat.",
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

        {/* 6. Testimonials (placeholder) */}
        <section className="px-6 py-28 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-accent tracking-widest uppercase mb-3">Testemunhos</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              O que dizem os primeiros utilizadores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl border border-white/5 bg-surface/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20" />
                  <div>
                    <div className="h-3 w-24 rounded bg-white/5" />
                    <div className="h-2 w-16 rounded bg-white/5 mt-2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded bg-white/5" />
                  <div className="h-2 w-4/5 rounded bg-white/5" />
                  <div className="h-2 w-3/5 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-muted/40 text-xs mt-8">Em breve — a recolher feedback dos primeiros utilizadores.</p>
        </section>

        {/* Divider */}
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* 8. Waitlist */}
        <section id="waitlist" className="px-6 py-28 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Junta-te à lista de espera
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Estamos a construir o PUBLYQ para um grupo selecto de criadores
              e empreendedores. Inscreve-te para seres dos primeiros.
            </p>

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
                  {status === "loading" ? "A entrar..." : "Entrar na Lista"}
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="text-red-400 text-xs mt-2">{message}</p>
            )}
            <p className="text-muted/50 text-xs">
              Sem spam. Só avisamos quando lançarmos.
            </p>
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
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#waitlist" className="hover:text-foreground transition-colors">Waitlist</a>
          </div>
          <span>Publica melhor. Não mais.</span>
        </div>
      </footer>
    </div>
  );
}
