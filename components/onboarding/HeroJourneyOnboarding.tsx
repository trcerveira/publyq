"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { BrandDNACard, VoiceDNACard } from "@/lib/supabase/types";

// ── Question data (matches API validators exactly) ──────────

const BRAND_QUESTIONS = [
  {
    key: "oqueFazParaQuem",
    question: "O que fazes e para quem?",
    hint: "Descreve o teu negócio de forma simples.",
    placeholder:
      "Ex: Ajudo PMEs portuguesas a criar conteúdo para Instagram sem precisar de agência...",
    minChars: 10,
  },
  {
    key: "transformacao",
    question: "Qual é a transformação que entregas?",
    hint: 'Usa o formato: "Transformo ___ em ___ sem ___"',
    placeholder:
      "Ex: Transformo empresários invisíveis online em criadores consistentes...",
    minChars: 10,
  },
  {
    key: "irritacoes",
    question: "O que te irrita no teu mercado?",
    hint: "O que te recusas a fazer?",
    placeholder:
      "Ex: Irrita-me ver fake gurus a vender cursos sobre algo que nunca fizeram...",
    minChars: 10,
  },
  {
    key: "clienteIdeal",
    question: "Quem é o teu cliente ideal?",
    hint: "Qual é a dor profunda dele?",
    placeholder:
      "Ex: Dono de PME, 35-50 anos, fatura bem mas é invisível online...",
    minChars: 10,
  },
  {
    key: "crencas",
    question: "Quais são as tuas 3 crenças mais fortes?",
    hint: "Sobre o teu trabalho.",
    placeholder:
      "Ex: 1. Consistência vence talento. 2. Conteúdo autêntico vende mais que perfeito...",
    minChars: 10,
  },
  {
    key: "porque",
    question: "Qual é o teu grande PORQUÊ?",
    hint: "A resposta real, não a bonita.",
    placeholder:
      "Ex: Porque vi o meu pai trabalhar 60h/semana num negócio que ninguém conhecia online...",
    minChars: 10,
  },
];

const VOICE_QUESTIONS = [
  {
    key: "tom",
    question: "Como soa a tua marca quando fala?",
    hint: "Formal ou informal? Directo ou suave?",
    placeholder:
      "Ex: Directo mas empático, como um amigo que te diz a verdade sem rodeios...",
    minChars: 5,
  },
  {
    key: "personagem",
    question: "Se a tua marca fosse uma pessoa famosa, quem seria?",
    hint: "E porquê?",
    placeholder:
      "Ex: Gary Vee pela energia e verdade crua, mas com mais profundidade...",
    minChars: 5,
  },
  {
    key: "vocabulario",
    question: "Palavras que usas SEMPRE + que NUNCA usas",
    hint: "Lista pelo menos 3 de cada lado.",
    placeholder:
      "SEMPRE: 'sistema', 'processo', 'sem desculpas'\nNUNCA: 'mindset', 'vibe', 'agenda uma call'...",
    minChars: 5,
  },
  {
    key: "frasesAssinatura",
    question: "As tuas frases assinatura.",
    hint: "Expressões recorrentes, bordões. Pelo menos 3.",
    placeholder:
      "Ex: 'Se não estás na internet, não existes.' / 'Resultados falam mais alto.'...",
    minChars: 5,
  },
  {
    key: "posicao",
    question: "Qual é a tua posição no mercado?",
    hint: "Rebelde? Mentor? Especialista? Provocador?",
    placeholder:
      "Ex: Sou o mentor prático — não vendo sonhos, mostro o caminho com ferramentas reais...",
    minChars: 5,
  },
];

// ── Screen 14 — Multiple choice options ─────────────────────

const POSICAO_OPTIONS = [
  { id: "rebelde", label: "O Rebelde", desc: "Dizes o que outros têm medo de dizer. Desafias o status quo." },
  { id: "mentor", label: "O Mentor", desc: "Guias com experiência. As pessoas confiam em ti." },
  { id: "especialista", label: "O Especialista", desc: "Dominas o assunto. Dados e profundidade." },
  { id: "amigo", label: "O Amigo", desc: "Falas de igual para igual. Acessível e próximo." },
  { id: "provocador", label: "O Provocador", desc: "Confrontas. Incomodas de propósito para fazer pensar." },
  { id: "estrategista", label: "O Estrategista", desc: "Mostras o caminho. Sistemas e planos claros." },
];

// ── Props ───────────────────────────────────────────────────

interface Props {
  initialScreen?: number;
  existingBrandCard?: BrandDNACard | null;
  existingVoiceCard?: VoiceDNACard | null;
}

// ── Main Component ──────────────────────────────────────────

export default function HeroJourneyOnboarding({
  initialScreen = 1,
  existingBrandCard = null,
  existingVoiceCard = null,
}: Props) {
  const router = useRouter();
  const [screen, setScreen] = useState(initialScreen);
  const [brandAnswers, setBrandAnswers] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("publyq_brand_answers");
      if (saved) return JSON.parse(saved);
    }
    return Object.fromEntries(BRAND_QUESTIONS.map((q) => [q.key, ""]));
  });
  const [voiceAnswers, setVoiceAnswers] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("publyq_voice_answers");
      if (saved) return JSON.parse(saved);
    }
    return Object.fromEntries(VOICE_QUESTIONS.map((q) => [q.key, ""]));
  });
  const [brandCard, setBrandCard] = useState<BrandDNACard | null>(existingBrandCard);
  const [voiceCard, setVoiceCard] = useState<VoiceDNACard | null>(existingVoiceCard);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const brandAttempted = useRef(false);
  const voiceAttempted = useRef(false);

  // Persist answers to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("publyq_brand_answers", JSON.stringify(brandAnswers));
  }, [brandAnswers]);

  useEffect(() => {
    sessionStorage.setItem("publyq_voice_answers", JSON.stringify(voiceAnswers));
  }, [voiceAnswers]);

  // Submit Brand DNA API (fires once on screen 9)
  const submitBrandDNA = useCallback(async () => {
    if (brandCard || apiLoading) return;
    brandAttempted.current = true;
    setApiLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/brand-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: brandAnswers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar Brand DNA");
      setBrandCard(data.brandCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setApiLoading(false);
    }
  }, [brandAnswers, brandCard, apiLoading]);

  // Submit Voice DNA API (fires once on screen 15)
  const submitVoiceDNA = useCallback(async () => {
    if (voiceCard || apiLoading) return;
    voiceAttempted.current = true;
    setApiLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/voice-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: voiceAnswers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar Voice DNA");
      setVoiceCard(data.voiceCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setApiLoading(false);
    }
  }, [voiceAnswers, voiceCard, apiLoading]);

  // Trigger API calls on specific screens — once only (ref guards re-fire after error)
  useEffect(() => {
    if (screen === 9 && !brandCard && !brandAttempted.current) {
      submitBrandDNA();
    }
  }, [screen, brandCard, submitBrandDNA]);

  useEffect(() => {
    if (screen === 15 && !voiceCard && !voiceAttempted.current) {
      submitVoiceDNA();
    }
  }, [screen, voiceCard, submitVoiceDNA]);

  // Navigation
  const goNext = () => {
    setError(null);
    setScreen((s) => Math.min(s + 1, 16));
  };
  const goBack = () => {
    setError(null);
    setScreen((s) => Math.max(s - 1, 1));
  };

  // Question helpers
  const updateBrand = (key: string, value: string) => {
    setBrandAnswers((prev) => ({ ...prev, [key]: value }));
  };
  const updateVoice = (key: string, value: string) => {
    setVoiceAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // Finish — clear session, go to machine
  const handleFinish = () => {
    sessionStorage.removeItem("publyq_brand_answers");
    sessionStorage.removeItem("publyq_voice_answers");
    router.push("/editorial");
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-[80vh] flex flex-col relative">
      <ProgressBar screen={screen} />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <FadeWrapper key={screen}>
          {/* Screen 1 — Hook */}
          {screen === 1 && (
            <NarrativeView
              lines={[
                "Tens ideias. Tens valor.",
                "Tens algo para dizer.",
                "",
                "Mas quando abres o Instagram...",
                "o cursor fica ali a piscar.",
                "",
                "Não é falta de conhecimento.",
                "É falta de sistema.",
              ]}
              button="Quero mudar isto"
              onNext={goNext}
            />
          )}

          {/* Screen 2 — Promise */}
          {screen === 2 && (
            <NarrativeView
              lines={[
                "O PUBLYQ vai criar uma coisa que só tu tens:",
                "A tua voz. O teu sistema. O teu conteúdo.",
                "",
                "Mas primeiro preciso de te conhecer.",
              ]}
              button="Estou pronto"
              onNext={goNext}
            />
          )}

          {/* Screens 3-8 — Brand DNA questions */}
          {screen >= 3 && screen <= 8 && (
            <QuestionView
              question={BRAND_QUESTIONS[screen - 3]}
              value={brandAnswers[BRAND_QUESTIONS[screen - 3].key]}
              onChange={(v) => updateBrand(BRAND_QUESTIONS[screen - 3].key, v)}
              onNext={goNext}
              onBack={goBack}
              canGoBack={screen > 3}
              sectionLabel="BRAND DNA"
            />
          )}

          {/* Screen 9 — Transition + Brand DNA API */}
          {screen === 9 && (
            <TransitionView
              lines={[
                "Agora sei quem és.",
                "Sei o que defendes. Sei contra quem lutas.",
                "",
                "Falta saber como falas.",
              ]}
              button="Continuar"
              onNext={goNext}
              loading={apiLoading}
              ready={!!brandCard}
              error={error}
              onRetry={() => {
                brandAttempted.current = false;
                submitBrandDNA();
              }}
            />
          )}

          {/* Screens 10-13 — Voice DNA text questions */}
          {screen >= 10 && screen <= 13 && (
            <QuestionView
              question={VOICE_QUESTIONS[screen - 10]}
              value={voiceAnswers[VOICE_QUESTIONS[screen - 10].key]}
              onChange={(v) => updateVoice(VOICE_QUESTIONS[screen - 10].key, v)}
              onNext={goNext}
              onBack={goBack}
              canGoBack={screen > 10}
              sectionLabel="VOICE DNA"
            />
          )}

          {/* Screen 14 — Voice DNA Q5: Multiple choice */}
          {screen === 14 && (
            <MultiChoiceView
              value={voiceAnswers.posicao}
              onChange={(v) => updateVoice("posicao", v)}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {/* Screen 15 — Loading + Reveal */}
          {screen === 15 && (
            <RevealView
              loading={apiLoading && !voiceCard}
              brandCard={brandCard}
              voiceCard={voiceCard}
              error={error}
              onRetry={() => {
                voiceAttempted.current = false;
                submitVoiceDNA();
              }}
              onNext={goNext}
            />
          )}

          {/* Screen 16 — Final */}
          {screen === 16 && (
            <NarrativeView
              lines={[
                "Agora tens o que 99% dos criadores",
                "nunca vão ter:",
                "",
                "Uma voz impossível de copiar.",
                "",
                "Vamos usá-la.",
              ]}
              button="Descobrir as minhas Linhas Editoriais"
              onNext={handleFinish}
            />
          )}
        </FadeWrapper>
      </div>
    </div>
  );
}

// ── Progress Bar ────────────────────────────────────────────

function ProgressBar({ screen }: { screen: number }) {
  if (screen < 3 || screen > 14) return null;
  const progress = ((screen - 3) / 11) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
      <div
        className="h-full bg-accent/50 transition-all duration-700 ease-out rounded-r-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ── Fade Wrapper ────────────────────────────────────────────

function FadeWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`w-full max-w-xl mx-auto transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
}

// ── Narrative Screen ────────────────────────────────────────

function NarrativeView({
  lines,
  button,
  onNext,
}: {
  lines: string[];
  button: string;
  onNext: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const totalLines = lines.filter((l) => l !== "").length;
  const buttonDelay = totalLines * 250 + 600;

  return (
    <div className="text-center space-y-1">
      {lines.map((line, i) =>
        line === "" ? (
          <div key={i} className="h-6" />
        ) : (
          <p
            key={i}
            className="text-lg sm:text-xl leading-relaxed transition-all duration-700 ease-out"
            style={{
              transitionDelay: `${i * 250}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {line}
          </p>
        )
      )}

      <div className="pt-10">
        <button
          onClick={onNext}
          className="px-8 py-3.5 bg-accent text-background font-semibold rounded-lg text-sm hover:bg-accent/90 transition-all duration-700 ease-out cursor-pointer"
          style={{
            transitionDelay: `${buttonDelay}ms`,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {button}
        </button>
      </div>
    </div>
  );
}

// ── Question Screen ─────────────────────────────────────────

function QuestionView({
  question,
  value,
  onChange,
  onNext,
  onBack,
  canGoBack,
  sectionLabel,
}: {
  question: {
    key: string;
    question: string;
    hint?: string;
    placeholder: string;
    minChars: number;
  };
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
  sectionLabel: string;
}) {
  const isValid = value.trim().length >= question.minChars;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && isValid) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-accent/40 text-xs font-mono tracking-widest uppercase">
        {sectionLabel}
      </p>

      <h2 className="text-xl sm:text-2xl font-bold leading-tight">
        {question.question}
      </h2>

      {question.hint && (
        <p className="text-muted text-sm">{question.hint}</p>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={question.placeholder}
        rows={5}
        autoFocus
        className="w-full bg-surface/50 border border-white/10 rounded-xl px-5 py-4 text-sm leading-relaxed placeholder:text-muted/40 focus:outline-none focus:border-accent/40 resize-none transition-colors"
      />

      <div className="flex items-center justify-between">
        {canGoBack ? (
          <button
            onClick={onBack}
            className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            Voltar
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-8 py-3 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-20 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors cursor-pointer"
        >
          Seguinte
        </button>
      </div>

      <p className="text-muted/30 text-xs text-right">
        {value.trim().length < question.minChars && value.trim().length > 0
          ? `Mínimo ${question.minChars} caracteres`
          : "\u00A0"}
      </p>
    </div>
  );
}

// ── Multi-Choice Screen (Screen 14) ─────────────────────────

function MultiChoiceView({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const selected = value ? value.split(", ").filter(Boolean) : [];

  const toggle = (label: string) => {
    if (selected.includes(label)) {
      const next = selected.filter((s) => s !== label);
      onChange(next.join(", "));
    } else if (selected.length < 2) {
      onChange([...selected, label].join(", "));
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-accent/40 text-xs font-mono tracking-widest uppercase">
        VOICE DNA
      </p>

      <h2 className="text-xl sm:text-2xl font-bold leading-tight">
        Como queres que as pessoas te vejam?
      </h2>

      <p className="text-muted text-sm">
        Escolhe até 2 posições que te definem.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {POSICAO_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.label);
          const isDisabled = !isSelected && selected.length >= 2;

          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.label)}
              disabled={isDisabled}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-accent/50 bg-accent/10"
                  : isDisabled
                  ? "border-white/5 bg-surface/20 opacity-40 cursor-not-allowed"
                  : "border-white/10 bg-surface/50 hover:border-accent/30"
              }`}
            >
              <p className={`text-sm font-semibold mb-1 ${isSelected ? "text-accent" : ""}`}>
                {opt.label}
              </p>
              <p className="text-muted text-xs leading-relaxed">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          Voltar
        </button>

        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className="px-8 py-3 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-20 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors cursor-pointer"
        >
          Seguinte
        </button>
      </div>

      <p className="text-muted/30 text-xs text-right">
        {selected.length}/2 seleccionadas
      </p>
    </div>
  );
}

// ── Transition Screen (Screen 9) ────────────────────────────

function TransitionView({
  lines,
  button,
  onNext,
  loading,
  ready,
  error,
  onRetry,
}: {
  lines: string[];
  button: string;
  onNext: () => void;
  loading: boolean;
  ready: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const totalLines = lines.filter((l) => l !== "").length;
  const buttonDelay = totalLines * 250 + 600;

  return (
    <div className="text-center space-y-1">
      {lines.map((line, i) =>
        line === "" ? (
          <div key={i} className="h-6" />
        ) : (
          <p
            key={i}
            className="text-lg sm:text-xl leading-relaxed transition-all duration-700 ease-out"
            style={{
              transitionDelay: `${i * 250}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {line}
          </p>
        )
      )}

      {error && (
        <div
          className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm transition-all duration-500"
          style={{
            transitionDelay: `${buttonDelay}ms`,
            opacity: visible ? 1 : 0,
          }}
        >
          {error}
          <button
            onClick={onRetry}
            className="ml-3 underline hover:no-underline cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="pt-10">
        <button
          onClick={onNext}
          disabled={!ready || loading}
          className="px-8 py-3.5 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-20 disabled:cursor-not-allowed hover:bg-accent/90 transition-all duration-700 ease-out cursor-pointer flex items-center gap-2 mx-auto"
          style={{
            transitionDelay: `${buttonDelay}ms`,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "A processar..." : button}
        </button>
      </div>
    </div>
  );
}

// ── Loading + Reveal Screen (Screen 15) ─────────────────────

function RevealView({
  loading,
  brandCard,
  voiceCard,
  error,
  onRetry,
  onNext,
}: {
  loading: boolean;
  brandCard: BrandDNACard | null;
  voiceCard: VoiceDNACard | null;
  error: string | null;
  onRetry: () => void;
  onNext: () => void;
}) {
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    if (voiceCard && !loading) {
      const timer = setTimeout(() => setShowCards(true), 800);
      return () => clearTimeout(timer);
    }
  }, [voiceCard, loading]);

  // Loading phase
  if (loading || (!voiceCard && !error)) {
    return (
      <div className="text-center space-y-6">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-lg font-medium">A analisar a tua voz...</p>
        <p className="text-muted/50 text-sm">
          Isto pode demorar até 30 segundos.
        </p>
      </div>
    );
  }

  // Error phase
  if (error) {
    return (
      <div className="text-center space-y-6">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
        <button
          onClick={onRetry}
          className="px-8 py-3 bg-accent text-background font-semibold rounded-lg text-sm hover:bg-accent/90 transition-colors cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Reveal phase
  return (
    <div
      className={`space-y-8 transition-all duration-1000 ease-out ${
        showCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <p className="text-center text-lg font-medium">
        O teu DNA está completo.
      </p>

      {/* Brand DNA Summary */}
      {brandCard && (
        <div className="p-5 rounded-xl bg-surface/50 border border-white/5 space-y-3">
          <p className="text-accent/50 text-xs font-mono tracking-widest uppercase">
            Brand DNA
          </p>
          <p className="text-sm font-semibold">
            {brandCard.commandersIntent}
          </p>
          <p className="text-muted text-sm leading-relaxed">
            {brandCard.bigIdea.frase}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {brandCard.clienteIdeal.dores.slice(0, 3).map((d, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Voice DNA Summary */}
      {voiceCard && (
        <div className="p-5 rounded-xl bg-surface/50 border border-white/5 space-y-3">
          <p className="text-accent/50 text-xs font-mono tracking-widest uppercase">
            Voice DNA
          </p>
          <p className="text-sm font-semibold">{voiceCard.arquetipo}</p>
          <div className="flex flex-wrap gap-1.5">
            {voiceCard.tomEmTresPalavras.map((t, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="space-y-1">
            {voiceCard.frasesAssinatura.slice(0, 3).map((f, i) => (
              <p key={i} className="text-muted text-sm italic">
                &ldquo;{f}&rdquo;
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="text-center pt-4">
        <button
          onClick={onNext}
          className="px-8 py-3.5 bg-accent text-background font-semibold rounded-lg text-sm hover:bg-accent/90 transition-colors cursor-pointer"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
