"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface Progress {
  brandDnaComplete: boolean;
  voiceDnaComplete: boolean;
  editorialComplete: boolean;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [progress, setProgress] = useState<Progress>({
    brandDnaComplete: false,
    voiceDnaComplete: false,
    editorialComplete: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch("/api/progress");
        if (res.ok) {
          const data = await res.json();
          setProgress(data);
        }
      } catch (err) {
        console.error("Error loading progress:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadProgress();
  }, [user]);

  const firstName = user?.firstName || "there";

  const steps = [
    {
      number: "01",
      title: "Brand DNA",
      description: "Define a identidade da tua marca. Quem serves, quem és, o que defendes.",
      href: "/brand-dna",
      status: progress.brandDnaComplete ? "complete" : "active",
      locked: false,
    },
    {
      number: "02",
      title: "Voice DNA",
      description: "Define a tua voz única. Tom, vocabulário, frases assinatura.",
      href: "/voice-dna",
      status: progress.voiceDnaComplete ? "complete" : progress.brandDnaComplete ? "active" : "locked",
      locked: !progress.brandDnaComplete,
    },
    {
      number: "03",
      title: "Linhas Editoriais",
      description: "A IA cria os teus pilares de conteúdo. Tu revês, editas e confirmas.",
      href: "/editorial",
      status: progress.editorialComplete ? "complete" : progress.voiceDnaComplete ? "active" : "locked",
      locked: !progress.voiceDnaComplete,
    },
    {
      number: "04",
      title: "Carrossel Instagram",
      description: "Gera carrosséis com a tua voz — prontos a publicar.",
      href: "/carousel",
      status: progress.editorialComplete ? "active" : "locked",
      locked: !progress.editorialComplete,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Olá, {firstName}
        </h1>
        <p className="text-muted text-sm mt-2">
          O teu Content Machine em 4 passos.
        </p>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step) => (
          <StepCard key={step.number} {...step} />
        ))}
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  href,
  status,
  locked,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
  status: string;
  locked: boolean;
}) {
  const card = (
    <div
      className={`p-6 rounded-xl border transition-all ${
        status === "complete"
          ? "border-accent/30 bg-accent/5"
          : status === "active"
          ? "border-white/10 bg-surface/50 hover:border-accent/30 hover:bg-surface/80"
          : "border-white/5 bg-surface/20 opacity-50 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-accent/40 text-xs font-mono tracking-wider">
          {number}
        </span>
        {status === "complete" && (
          <span className="text-accent text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
            Completo
          </span>
        )}
        {locked && (
          <span className="text-muted/50 text-xs">Bloqueado</span>
        )}
      </div>
      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );

  if (locked) return card;

  return <Link href={href}>{card}</Link>;
}
