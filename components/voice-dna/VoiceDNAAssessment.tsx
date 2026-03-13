"use client";

import { useState } from "react";
import { VOICE_DNA_QUESTIONS } from "@/lib/prompts/voice-dna";
import type { VoiceDNACard } from "@/lib/supabase/types";

interface Props {
  existingCard: VoiceDNACard | null;
  onComplete: (card: VoiceDNACard) => void;
}

const MIN_CHARS = 5;

export default function VoiceDNAAssessment({ existingCard, onComplete }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redoing, setRedoing] = useState(false);

  const totalQuestions = VOICE_DNA_QUESTIONS.length;
  const question = VOICE_DNA_QUESTIONS[currentQuestion];

  // Show existing card if user already completed (unless redoing)
  if (existingCard && Object.keys(answers).length === 0 && !redoing) {
    return <VoiceDNACardDisplay card={existingCard} onRedo={() => setRedoing(true)} />;
  }

  const handleChange = (value: string) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
  };

  const currentAnswer = question ? (answers[question.key] ?? "") : "";
  const isValid = currentAnswer.trim().length >= MIN_CHARS;

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((q) => q + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/voice-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar Voice DNA");
      }

      onComplete(data.voiceCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= currentQuestion ? "bg-accent" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Question counter */}
      <p className="text-accent text-xs font-mono tracking-wider">
        PERGUNTA {currentQuestion + 1} DE {totalQuestions}
      </p>

      {/* Question */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold leading-relaxed">
          {question.question}
        </h2>
        {"hint" in question && question.hint && (
          <p className="text-muted/60 text-sm italic">{question.hint}</p>
        )}
        <textarea
          value={currentAnswer}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={question.placeholder}
          rows={5}
          className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
          autoFocus
        />
        <p className="text-muted/50 text-xs">
          {currentAnswer.trim().length} / mín. {MIN_CHARS} caracteres
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          className="text-sm text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Voltar
        </button>

        {currentQuestion < totalQuestions - 1 ? (
          <button
            onClick={handleNext}
            disabled={!isValid}
            className="px-6 py-2.5 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          >
            Seguinte
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="px-6 py-2.5 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "A gerar..." : "Gerar Voice DNA"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Voice DNA Card Display ──────────────────────────────────

function VoiceDNACardDisplay({
  card,
  onRedo,
}: {
  card: VoiceDNACard;
  onRedo: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">O teu Voice DNA</h2>
          <p className="text-muted text-sm mt-1">A tua voz única, capturada por IA.</p>
        </div>
        <button
          onClick={onRedo}
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          Refazer
        </button>
      </div>

      {/* Archetype */}
      <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
        <p className="text-accent text-xs font-mono tracking-wider mb-2">ARQUÉTIPO</p>
        <p className="text-lg font-semibold">{card.arquetipo}</p>
        {card.descricaoArquetipo && (
          <p className="text-sm text-muted mt-1">{card.descricaoArquetipo}</p>
        )}
      </div>

      {/* Tone */}
      <Section title="Tom em 3 Palavras">
        <div className="flex gap-2">
          {card.tomEmTresPalavras.map((word, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium"
            >
              {word}
            </span>
          ))}
        </div>
      </Section>

      {/* Vocabulary */}
      <div className="grid grid-cols-2 gap-4">
        <Section title="Vocabulário Activo">
          <div className="flex flex-wrap gap-1.5">
            {card.vocabularioActivo.map((word, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400"
              >
                {word}
              </span>
            ))}
          </div>
        </Section>
        <Section title="Vocabulário Proibido">
          <div className="flex flex-wrap gap-1.5">
            {card.vocabularioProibido.map((word, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400"
              >
                {word}
              </span>
            ))}
          </div>
        </Section>
      </div>

      {/* Signature Phrases */}
      <Section title="Frases Assinatura">
        <div className="space-y-2">
          {card.frasesAssinatura.map((phrase, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-accent/40 text-xs mt-0.5">&ldquo;</span>
              <p className="text-sm italic">{phrase}</p>
              <span className="text-accent/40 text-xs mt-0.5">&rdquo;</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Style Rules */}
      <Section title="Regras de Estilo">
        <ul className="space-y-1.5">
          {card.regrasEstilo.map((rule, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className="text-accent mt-0.5 text-xs">&#9679;</span>
              {rule}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-surface/50 border border-white/5 space-y-3">
      <h3 className="text-xs font-mono tracking-wider text-accent/60 uppercase">{title}</h3>
      {children}
    </div>
  );
}
