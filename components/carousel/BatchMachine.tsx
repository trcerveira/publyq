"use client";

import { useState } from "react";
import type { CarouselSlide } from "@/lib/supabase/types";

// ── Sequence labels (mirrors server-side BATCH_SEQUENCE) ────

const SEQUENCE_LABELS = [
  { day: 1, label: "Dor", angulo: "Confronto", template: "Verdade Desconfortável" },
  { day: 2, label: "Inimigo", angulo: "Confronto", template: "Erro Invisível" },
  { day: 3, label: "Quebra de crença", angulo: "Educação", template: "Verdade Desconfortável" },
  { day: 4, label: "Solução", angulo: "Educação", template: "Sistema Simples" },
  { day: 5, label: "Demonstração", angulo: "Demonstração", template: "Sistema Simples" },
  { day: 6, label: "Prova social", angulo: "Prova", template: "Erro Invisível" },
  { day: 7, label: "Convite", angulo: "Convite", template: "Sistema Simples" },
];

const ANGULO_COLORS: Record<string, string> = {
  Confronto: "bg-red-500/10 border-red-500/30 text-red-400",
  "Educação": "bg-blue-500/10 border-blue-500/30 text-blue-400",
  "Demonstração": "bg-purple-500/10 border-purple-500/30 text-purple-400",
  Prova: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  Convite: "bg-accent/10 border-accent/30 text-accent",
};

// ── Types ───────────────────────────────────────────────────

interface BatchDay {
  dia: number;
  sequencia: string;
  pilar: string;
  angulo: string;
  template: string;
  tema: string;
  slides: CarouselSlide[];
}

// ── Component ───────────────────────────────────────────────

export default function BatchMachine() {
  const [step, setStep] = useState<"input" | "generating" | "preview">("input");
  const [weekTheme, setWeekTheme] = useState("");
  const [batch, setBatch] = useState<BatchDay[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  // Generate batch
  const handleGenerate = async () => {
    if (weekTheme.trim().length < 3) return;
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/carousel-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekTheme }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar batch");
      }

      setBatch(data.semana);
      setStep("preview");
      setExpandedDays(new Set([1]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setStep("input");
    }
  };

  // Toggle day expansion
  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  // Expand all days
  const expandAll = () => {
    setExpandedDays(new Set([1, 2, 3, 4, 5, 6, 7]));
  };

  // Export all 7 carousels as ZIP
  const handleExportAll = async () => {
    if (!batch) return;
    setExporting(true);
    setError(null);

    try {
      const htmlToImage = await import("html-to-image");
      const JSZip = (await import("jszip")).default;
      const { saveAs } = await import("file-saver");

      // Ensure all days are expanded so slides are rendered in DOM
      setExpandedDays(new Set([1, 2, 3, 4, 5, 6, 7]));

      // Wait for DOM to render expanded slides
      await new Promise((resolve) => setTimeout(resolve, 500));

      const zip = new JSZip();

      for (const day of batch) {
        const folderName = `dia-${String(day.dia).padStart(2, "0")}-${day.sequencia
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")}`;
        const folder = zip.folder(folderName);
        if (!folder) continue;

        for (const slide of day.slides) {
          const el = document.getElementById(
            `batch-day-${day.dia}-slide-${slide.slideNumber}`
          );
          if (!el) continue;

          const dataUrl = await htmlToImage.toPng(el, {
            width: 1080,
            height: 1080,
            pixelRatio: 2,
            style: {
              width: "1080px",
              height: "1080px",
              transform: "scale(1)",
            },
          });

          const response = await fetch(dataUrl);
          const blob = await response.blob();
          folder.file(
            `slide-${String(slide.slideNumber).padStart(2, "0")}.png`,
            blob
          );
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `publyq-semana-${Date.now()}.zip`);
    } catch (err) {
      console.error("Export error:", err);
      setError("Erro ao exportar. Tenta novamente.");
    } finally {
      setExporting(false);
    }
  };

  // Reset to input
  const handleReset = () => {
    setStep("input");
    setBatch(null);
    setWeekTheme("");
    setError(null);
    setExpandedDays(new Set([1]));
  };

  // ── INPUT PHASE ───────────────────────────────────────────

  if (step === "input") {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Week theme input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Qual é o tema da semana?
          </label>
          <textarea
            value={weekTheme}
            onChange={(e) => setWeekTheme(e.target.value)}
            placeholder="Ex: Como criar uma marca pessoal forte que atrai clientes todos os dias..."
            rows={3}
            className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
            autoFocus
          />
          <p className="text-muted/50 text-xs mt-2">
            A Machine gera 7 carrosséis com base neste tema, nos teus pilares editoriais e na sequência psicológica.
          </p>
        </div>

        {/* Psychological sequence preview */}
        <div>
          <p className="text-xs font-mono tracking-wider text-accent/60 uppercase mb-4">
            Sequência Psicológica — 7 Dias
          </p>
          <div className="space-y-1">
            {SEQUENCE_LABELS.map((seq, i) => (
              <div key={seq.day} className="flex items-center gap-3">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center w-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/60 shrink-0" />
                  {i < SEQUENCE_LABELS.length - 1 && (
                    <div className="w-px h-6 bg-white/10" />
                  )}
                </div>

                {/* Day info */}
                <div className="flex items-center gap-2 flex-1 py-1">
                  <span className="text-accent/40 text-xs font-mono w-5">
                    {String(seq.day).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium w-32 truncate">
                    {seq.label}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      ANGULO_COLORS[seq.angulo] || "bg-white/5 border-white/10 text-muted"
                    }`}
                  >
                    {seq.angulo}
                  </span>
                  <span className="text-muted/40 text-xs hidden sm:inline">
                    {seq.template}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formula explanation */}
        <div className="p-4 rounded-xl bg-surface/30 border border-white/5">
          <p className="text-xs font-mono tracking-wider text-muted/60 uppercase mb-2">
            Fórmula
          </p>
          <p className="text-sm text-muted">
            <span className="text-accent">Pilar Editorial</span> ×{" "}
            <span className="text-blue-400">Template</span> ×{" "}
            <span className="text-purple-400">Ângulo</span> = 7 carrosséis
            únicos, distribuídos automaticamente pela IA.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={weekTheme.trim().length < 3}
          className="w-full px-6 py-3.5 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors cursor-pointer"
        >
          Gerar Semana Completa
        </button>
      </div>
    );
  }

  // ── GENERATING PHASE ──────────────────────────────────────

  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">A gerar 7 carrosséis...</p>
        <p className="text-muted/50 text-xs text-center max-w-xs">
          A Machine está a criar a tua semana de conteúdo com a sequência
          psicológica Dor → Inimigo → Quebra → Solução → Demo → Prova → Convite.
          Pode demorar até 60 segundos.
        </p>
      </div>
    );
  }

  // ── PREVIEW PHASE ─────────────────────────────────────────

  if (!batch) return null;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-medium">
            7 carrosséis · 49 slides
          </p>
          <p className="text-muted text-xs truncate max-w-xs">
            {weekTheme}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            Expandir tudo
          </button>
          <button
            onClick={handleExportAll}
            disabled={exporting}
            className="px-4 py-2 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-50 hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            {exporting && (
              <div className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
            )}
            {exporting ? "A exportar..." : "Exportar Semana (ZIP)"}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            Nova semana
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Days */}
      <div className="space-y-3">
        {batch.map((day) => (
          <DayCard
            key={day.dia}
            day={day}
            expanded={expandedDays.has(day.dia)}
            onToggle={() => toggleDay(day.dia)}
          />
        ))}
      </div>

      {/* Copy-paste text for all days */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted">
          Texto completo (copiar)
        </h3>
        {batch.map((day) => (
          <div
            key={day.dia}
            className="p-4 rounded-xl bg-surface/20 border border-white/5 space-y-2"
          >
            <p className="text-xs font-mono text-accent/50">
              DIA {day.dia} — {day.sequencia.toUpperCase()} · {day.pilar}
            </p>
            {day.slides.map((slide) => (
              <div key={slide.slideNumber} className="pl-3 border-l border-white/5">
                <p className="text-sm">
                  <span className="text-accent/40 font-mono text-xs mr-2">
                    {String(slide.slideNumber).padStart(2, "0")}
                  </span>
                  <span className="font-semibold">{slide.headline}</span>
                </p>
                {slide.body && (
                  <p className="text-muted text-xs pl-7">{slide.body}</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Day Card ────────────────────────────────────────────────

function DayCard({
  day,
  expanded,
  onToggle,
}: {
  day: BatchDay;
  expanded: boolean;
  onToggle: () => void;
}) {
  const templateLabels: Record<string, string> = {
    "simple-system": "Sistema Simples",
    "uncomfortable-truth": "Verdade Desconfortável",
    "invisible-mistake": "Erro Invisível",
  };

  return (
    <div className="rounded-xl border border-white/5 bg-surface/30 overflow-hidden">
      {/* Day header — clickable */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-surface/50 transition-colors"
      >
        {/* Day number */}
        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
          <span className="text-accent font-mono text-sm font-bold">
            {String(day.dia).padStart(2, "0")}
          </span>
        </div>

        {/* Day info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">
              {day.sequencia}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${
                ANGULO_COLORS[day.angulo] || "bg-white/5 border-white/10 text-muted"
              }`}
            >
              {day.angulo}
            </span>
            <span className="text-xs text-muted/40 hidden sm:inline">
              {templateLabels[day.template] || day.template}
            </span>
          </div>
          <p className="text-xs text-muted truncate mt-0.5">
            {day.pilar} · {day.tema}
          </p>
        </div>

        {/* Expand indicator */}
        <span className="text-muted/40 text-xs shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {/* Slides — expanded */}
      {expanded && (
        <div className="px-5 pb-5">
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3">
              {day.slides.map((slide) => (
                <BatchSlide
                  key={slide.slideNumber}
                  slide={slide}
                  dayNumber={day.dia}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Batch Slide (with unique ID for export) ─────────────────

function BatchSlide({
  slide,
  dayNumber,
}: {
  slide: CarouselSlide;
  dayNumber: number;
}) {
  return (
    <div
      id={`batch-day-${dayNumber}-slide-${slide.slideNumber}`}
      className="relative w-[260px] h-[260px] rounded-xl overflow-hidden flex-shrink-0 border border-white/10"
      style={{ backgroundColor: "#0A0E1A" }}
    >
      <div className="h-full flex flex-col justify-between p-5">
        <span
          className="text-xs font-mono opacity-40"
          style={{ color: "#F0ECE4" }}
        >
          {slide.slideNumber === 1
            ? "HOOK"
            : slide.slideNumber === 7
            ? "CTA"
            : `${slide.slideNumber}/7`}
        </span>

        <div className="flex-1 flex flex-col justify-center">
          <h3
            className="text-sm font-bold leading-tight mb-2"
            style={{ color: "#F0ECE4" }}
          >
            {slide.headline}
          </h3>
          {slide.body && (
            <p
              className="text-xs leading-relaxed opacity-80"
              style={{ color: "#F0ECE4" }}
            >
              {slide.body}
            </p>
          )}
        </div>

        <div
          className="h-1 w-10 rounded-full"
          style={{ backgroundColor: "#BFD64B" }}
        />
      </div>
    </div>
  );
}
