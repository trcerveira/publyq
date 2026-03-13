"use client";

import { useState, useCallback } from "react";
import type { CarouselSlide } from "@/lib/supabase/types";
import SlidePreview from "./SlidePreview";

const BRAND_COLORS = {
  bg: "#0A0E1A",
  text: "#F0ECE4",
  accent: "#BFD64B",
};

const TEMPLATES = [
  {
    id: "simple-system" as const,
    label: "Sistema Simples",
    desc: "Problema → Passo 1 → Passo 2 → Passo 3 → Resultado → CTA",
  },
  {
    id: "uncomfortable-truth" as const,
    label: "Verdade Desconfortável",
    desc: "Crença comum → Problema → Sistema errado → Sistema certo → Porquê → Conclusão",
  },
  {
    id: "invisible-mistake" as const,
    label: "Erro Invisível",
    desc: "Comportamento comum → Porquê não funciona → Erro revelado → Alternativa → Mini sistema → Conclusão",
  },
];

const CTA_OPTIONS = [
  { id: "send-friend" as const, label: "Envia para um amigo" },
  { id: "comment" as const, label: "Comenta" },
  { id: "link-bio" as const, label: "Vai ao link da bio" },
  { id: "other" as const, label: "Outro" },
  { id: "none" as const, label: "Sem CTA" },
];

type TemplateId = (typeof TEMPLATES)[number]["id"];
type CtaId = (typeof CTA_OPTIONS)[number]["id"];

export default function CarouselGenerator() {
  const [step, setStep] = useState<"topic" | "generating" | "preview">("topic");
  const [topic, setTopic] = useState("");
  const [template, setTemplate] = useState<TemplateId>("simple-system");
  const [cta, setCta] = useState<CtaId>("send-friend");
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [slideImages, setSlideImages] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleGenerate = async () => {
    if (topic.trim().length < 3) return;
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekTheme: topic, template, cta }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar carrossel");
      }

      setSlides(data.slides);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setStep("topic");
    }
  };

  const handleSearchImage = useCallback(async (slideNumber: number, query: string) => {
    try {
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.photos?.length > 0) {
        setSlideImages((prev) => ({
          ...prev,
          [slideNumber]: data.photos[0].regular,
        }));
      }
    } catch {
      // Silent fail for image search
    }
  }, []);

  const handleAutoImages = async () => {
    for (const slide of slides) {
      if (slide.imageQuery) {
        await handleSearchImage(slide.slideNumber, slide.imageQuery);
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const htmlToImage = await import("html-to-image");
      const JSZip = (await import("jszip")).default;
      const { saveAs } = await import("file-saver");

      const zip = new JSZip();

      for (const slide of slides) {
        const el = document.getElementById(`slide-${slide.slideNumber}`);
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
        zip.file(`slide-${String(slide.slideNumber).padStart(2, "0")}.png`, blob);
      }

      const fileCount = Object.keys(zip.files).length;
      if (fileCount === 0) {
        setError("Nenhum slide foi exportado. Tenta novamente.");
        return;
      }
      if (fileCount < slides.length) {
        setError(`Apenas ${fileCount} de ${slides.length} slides exportados. Verifica o ZIP.`);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `publyq-carousel-${Date.now()}.zip`);
    } catch (err) {
      console.error("Export error:", err);
      setError("Erro ao exportar. Tenta novamente.");
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setStep("topic");
    setSlides([]);
    setSlideImages({});
    setTopic("");
    setError(null);
  };

  // Step 1: Topic + Template + CTA selection
  if (step === "topic") {
    return (
      <div className="max-w-xl mx-auto space-y-8">
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Sobre que tema queres criar o carrossel?
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Como criar uma marca pessoal forte em 2026..."
            rows={3}
            className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
            autoFocus
          />
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Escolhe o template
          </label>
          <div className="space-y-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  template === t.id
                    ? "border-accent/50 bg-accent/5"
                    : "border-white/10 bg-surface/30 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      template === t.id ? "border-accent" : "border-white/30"
                    }`}
                  >
                    {template === t.id && (
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted mt-0.5">{t.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Call-to-action do último slide
          </label>
          <div className="flex flex-wrap gap-2">
            {CTA_OPTIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCta(c.id)}
                className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                  cta === c.id
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={topic.trim().length < 3}
          className="w-full px-6 py-3 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors cursor-pointer"
        >
          Gerar Carrossel
        </button>
      </div>
    );
  }

  // Step 2: Generating
  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">A gerar o teu carrossel...</p>
        <p className="text-muted/50 text-xs">Isto pode demorar até 30 segundos</p>
      </div>
    );
  }

  // Step 3: Preview + Export
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-medium">{slides.length} slides gerados</p>
          <p className="text-muted text-xs">
            {TEMPLATES.find((t) => t.id === template)?.label} — {topic}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoImages}
            className="px-4 py-2 text-sm border border-white/10 rounded-lg hover:border-accent/30 transition-colors"
          >
            Auto-imagens
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-50 hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            {exporting && (
              <div className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
            )}
            {exporting ? "A exportar..." : "Exportar ZIP"}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            Novo
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Slides horizontal scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {slides.map((slide, i) => (
            <SlidePreview
              key={slide.slideNumber}
              slide={slide}
              brandColors={BRAND_COLORS}
              imageUrl={slideImages[slide.slideNumber]}
              isFirst={i === 0}
              isLast={i === slides.length - 1}
              totalSlides={slides.length}
            />
          ))}
        </div>
      </div>

      {/* Slide text list for copying */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted">Texto dos slides (copiar)</h3>
        {slides.map((slide) => (
          <div
            key={slide.slideNumber}
            className="p-3 rounded-lg bg-surface/30 border border-white/5 text-sm space-y-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-accent/50 text-xs font-mono">
                {String(slide.slideNumber).padStart(2, "0")}
              </span>
              <span className="font-semibold">{slide.headline}</span>
            </div>
            {slide.body && <p className="text-muted pl-6">{slide.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
