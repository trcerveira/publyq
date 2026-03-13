"use client";

import { useState } from "react";
import { BRAND_DNA_QUESTIONS } from "@/lib/prompts/brand-dna";
import type { BrandDNACard } from "@/lib/supabase/types";

interface Props {
  existingCard: BrandDNACard | null;
  onComplete: (card: BrandDNACard) => void;
}

const MIN_CHARS = 10;

export default function BrandDNAAssessment({ existingCard, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redoing, setRedoing] = useState(false);

  // Show existing card if user already completed (unless redoing)
  if (existingCard && Object.keys(answers).length === 0 && !redoing) {
    return <BrandDNACardDisplay card={existingCard} onRedo={() => setRedoing(true)} />;
  }

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const allComplete = BRAND_DNA_QUESTIONS.every(
    (q) => (answers[q.key]?.trim().length ?? 0) >= MIN_CHARS
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/brand-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar Brand DNA");
      }

      onComplete(data.brandCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {BRAND_DNA_QUESTIONS.map((q, i) => (
          <div
            key={q.key}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              (answers[q.key]?.trim().length ?? 0) >= MIN_CHARS
                ? "bg-accent"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <p className="text-muted text-sm">
        Responde com honestidade. Não há respostas erradas — quanto mais real, melhor o resultado.
      </p>

      {/* Questions */}
      <div className="space-y-6">
        {BRAND_DNA_QUESTIONS.map((q, i) => (
          <div key={q.key} className="space-y-2">
            <label className="block text-sm font-medium">
              <span className="text-accent mr-2">{i + 1}.</span>
              {q.question}
            </label>
            {"hint" in q && q.hint && (
              <p className="text-muted/60 text-xs italic">{q.hint}</p>
            )}
            <textarea
              value={answers[q.key] ?? ""}
              onChange={(e) => handleChange(q.key, e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
            />
            <p className="text-muted/50 text-xs">
              {answers[q.key]?.trim().length ?? 0} / mín. {MIN_CHARS} caracteres
            </p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={!allComplete || loading}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors flex items-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "A gerar..." : "Gerar Brand DNA"}
        </button>
      </div>
    </div>
  );
}

// ── Brand DNA Card Display ──────────────────────────────────

function BrandDNACardDisplay({
  card,
  onRedo,
}: {
  card: BrandDNACard;
  onRedo: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">O teu Brand DNA</h2>
          <p className="text-muted text-sm mt-1">A identidade da tua marca, gerada por IA.</p>
        </div>
        <button
          onClick={onRedo}
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          Refazer
        </button>
      </div>

      {/* Commander's Intent */}
      <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
        <p className="text-accent text-xs font-mono tracking-wider mb-2">COMMANDER&apos;S INTENT</p>
        <p className="text-lg font-semibold">{card.commandersIntent}</p>
      </div>

      {/* Client profile */}
      <Section title="Cliente Ideal">
        <p className="text-sm mb-3">{card.clienteIdeal.perfil}</p>
        <div className="grid grid-cols-2 gap-4">
          <TagList title="Dores" items={card.clienteIdeal.dores} color="red" />
          <TagList title="Desejos" items={card.clienteIdeal.desejos} color="green" />
        </div>
        <TagList title="Linguagem" items={card.clienteIdeal.linguagem} color="blue" />
      </Section>

      {/* Character */}
      <Section title="A Tua Personagem">
        <p className="text-sm mb-2">{card.personagem.historia}</p>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <MiniCard label="Superpoder" value={card.personagem.superpoder} />
          <MiniCard label="Vulnerabilidade" value={card.personagem.defeito} />
          <MiniCard label="Voz" value={card.personagem.voz} />
        </div>
      </Section>

      {/* Big Idea */}
      <Section title="Big Idea">
        <p className="text-lg font-semibold mb-2">&ldquo;{card.bigIdea.frase}&rdquo;</p>
        <p className="text-sm text-muted">{card.bigIdea.explicacao}</p>
      </Section>

      {/* Enemy + Future */}
      <div className="grid grid-cols-2 gap-4">
        <Section title="Inimigo">
          <p className="font-medium text-sm">{card.inimigo.quem}</p>
          <p className="text-muted text-xs mt-1">{card.inimigo.porque}</p>
        </Section>
        <Section title="Causa Futura">
          <p className="font-medium text-sm">{card.causaFutura.movimento}</p>
          <p className="text-muted text-xs mt-1">{card.causaFutura.visao10anos}</p>
        </Section>
      </div>

      {/* Diferencial */}
      <Section title="Nova Oportunidade">
        <p className="text-sm mb-1"><strong>Diferencial:</strong> {card.novaOportunidade.diferencial}</p>
        <p className="text-sm"><strong>Reframe:</strong> {card.novaOportunidade.reframe}</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-surface/50 border border-white/5 space-y-2">
      <h3 className="text-xs font-mono tracking-wider text-accent/60 uppercase">{title}</h3>
      {children}
    </div>
  );
}

function TagList({ title, items, color }: { title: string; items: string[]; color: string }) {
  const colorMap: Record<string, string> = {
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="mt-2">
      <p className="text-xs text-muted mb-1">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[color] ?? colorMap.blue}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-xs">{value}</p>
    </div>
  );
}
