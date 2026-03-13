"use client";

import { useState } from "react";

interface EditorialLine {
  id: string;
  nome: string;
  proposito: string;
  funcao: "despertar" | "educar" | "reter";
  temas: string[];
  emocao: string;
  percentagem: number;
}

interface Props {
  initialLines: EditorialLine[] | null;
  initialResumo: string | null;
  initialStatus: "draft" | "confirmed" | null;
  onComplete: () => void;
}

export default function EditorialLines({
  initialLines,
  initialResumo,
  initialStatus,
  onComplete,
}: Props) {
  const [lines, setLines] = useState<EditorialLine[] | null>(initialLines);
  const [resumo, setResumo] = useState<string>(initialResumo ?? "");
  const [status, setStatus] = useState<"draft" | "confirmed" | null>(initialStatus);
  const [generating, setGenerating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate editorial lines via AI
  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/editorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar linhas editoriais");
      }

      setLines(data.lines);
      setResumo(data.resumo);
      setStatus("draft");
      setEditing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setGenerating(false);
    }
  };

  // Confirm (approve) editorial lines
  const handleConfirm = async () => {
    if (!lines || lines.length === 0) return;
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch("/api/editorial", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, resumo }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao confirmar");
      }

      setStatus("confirmed");
      setEditing(false);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setConfirming(false);
    }
  };

  // Edit a specific line field
  const updateLine = (index: number, field: keyof EditorialLine, value: string | string[] | number) => {
    if (!lines) return;
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  // Edit a specific tema within a line
  const updateTema = (lineIndex: number, temaIndex: number, value: string) => {
    if (!lines) return;
    const updated = [...lines];
    const temas = [...updated[lineIndex].temas];
    temas[temaIndex] = value;
    updated[lineIndex] = { ...updated[lineIndex], temas };
    setLines(updated);
  };

  // Add a new tema to a line
  const addTema = (lineIndex: number) => {
    if (!lines) return;
    const updated = [...lines];
    updated[lineIndex] = {
      ...updated[lineIndex],
      temas: [...updated[lineIndex].temas, ""],
    };
    setLines(updated);
  };

  // Remove a tema from a line
  const removeTema = (lineIndex: number, temaIndex: number) => {
    if (!lines) return;
    const updated = [...lines];
    const temas = updated[lineIndex].temas.filter((_, i) => i !== temaIndex);
    updated[lineIndex] = { ...updated[lineIndex], temas };
    setLines(updated);
  };

  // ── No lines yet — show generate button ──
  if (!lines) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Linhas Editoriais</h2>
          <p className="text-muted text-sm">
            A IA vai criar os teus pilares de conteúdo com base no teu Brand DNA e Voice DNA.
            Depois revês, editas e confirmas.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-8 py-3 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-30 hover:bg-accent/90 transition-colors flex items-center gap-2 mx-auto"
        >
          {generating && (
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
          )}
          {generating ? "A gerar..." : "Gerar Linhas Editoriais"}
        </button>
      </div>
    );
  }

  // ── Confirmed — show read-only view ──
  if (status === "confirmed" && !editing) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">As tuas Linhas Editoriais</h2>
            <p className="text-muted text-sm mt-1">Confirmadas e prontas a usar.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              Editar
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              {generating ? "A gerar..." : "Refazer"}
            </button>
          </div>
        </div>

        {/* Summary */}
        {resumo && (
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
            <p className="text-accent text-xs font-mono tracking-wider mb-2">ESTRATÉGIA EDITORIAL</p>
            <p className="text-sm leading-relaxed">{resumo}</p>
          </div>
        )}

        {/* Pillars */}
        <div className="space-y-4">
          {lines.map((line) => (
            <PillarCard key={line.id} line={line} />
          ))}
        </div>

        {/* Distribution */}
        <DistributionBar lines={lines} />
      </div>
    );
  }

  // ── Draft / Editing — show editable view ──
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Revê as tuas Linhas Editoriais</h2>
          <p className="text-muted text-sm mt-1">
            A IA criou estas linhas. Edita o que quiseres e confirma.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          {generating ? "A gerar..." : "Regenerar"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Editable summary */}
      <div className="space-y-2">
        <label className="text-xs font-mono tracking-wider text-accent/60 uppercase">
          Estratégia Editorial
        </label>
        <textarea
          value={resumo}
          onChange={(e) => setResumo(e.target.value)}
          rows={3}
          className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
        />
      </div>

      {/* Editable pillars */}
      <div className="space-y-6">
        {lines.map((line, lineIndex) => (
          <div
            key={line.id}
            className="p-5 rounded-xl bg-surface/50 border border-white/5 space-y-4"
          >
            {/* Pillar header */}
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-accent/40 text-xs font-mono">
                    {String(lineIndex + 1).padStart(2, "0")}
                  </span>
                  <input
                    value={line.nome}
                    onChange={(e) => updateLine(lineIndex, "nome", e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/10 pb-1 text-sm font-semibold focus:outline-none focus:border-accent/50"
                    placeholder="Nome do pilar"
                  />
                </div>
                <textarea
                  value={line.proposito}
                  onChange={(e) => updateLine(lineIndex, "proposito", e.target.value)}
                  rows={2}
                  className="w-full bg-surface/30 border border-white/5 rounded-lg px-3 py-2 text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none"
                  placeholder="Propósito deste território"
                />
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted/50 mb-1 block">Função</label>
                    <select
                      value={line.funcao}
                      onChange={(e) => updateLine(lineIndex, "funcao", e.target.value)}
                      className="w-full bg-surface/30 border border-white/5 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/50"
                    >
                      <option value="despertar">Despertar (~40%)</option>
                      <option value="educar">Educar (~35%)</option>
                      <option value="reter">Reter (~25%)</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted/50 mb-1 block">Emoção</label>
                    <input
                      value={line.emocao}
                      onChange={(e) => updateLine(lineIndex, "emocao", e.target.value)}
                      className="w-full bg-surface/30 border border-white/5 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/50"
                      placeholder="Emoção principal"
                    />
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <input
                  type="number"
                  value={line.percentagem}
                  onChange={(e) => updateLine(lineIndex, "percentagem", Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-16 bg-surface/30 border border-white/10 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-accent/50"
                />
                <p className="text-muted/50 text-xs mt-1">%</p>
              </div>
            </div>

            {/* Temas */}
            <div className="space-y-2">
              <p className="text-xs font-mono tracking-wider text-muted/60 uppercase">Temas</p>
              {line.temas.map((tema, temaIndex) => (
                <div key={temaIndex} className="flex items-center gap-2">
                  <span className="text-accent/30 text-xs">&#9679;</span>
                  <input
                    value={tema}
                    onChange={(e) => updateTema(lineIndex, temaIndex, e.target.value)}
                    className="flex-1 bg-surface/30 border border-white/5 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/50"
                    placeholder="Tema..."
                  />
                  {line.temas.length > 1 && (
                    <button
                      onClick={() => removeTema(lineIndex, temaIndex)}
                      className="text-red-400/50 hover:text-red-400 text-xs transition-colors"
                    >
                      remover
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addTema(lineIndex)}
                className="text-xs text-accent/60 hover:text-accent transition-colors"
              >
                + Adicionar tema
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution preview */}
      <DistributionBar lines={lines} />

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        {status === "confirmed" && (
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
        )}
        <div className="ml-auto">
          <button
            onClick={handleConfirm}
            disabled={confirming || !resumo.trim()}
            className="px-8 py-3 bg-accent text-background font-semibold rounded-lg text-sm disabled:opacity-30 hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            {confirming && (
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            )}
            {confirming ? "A confirmar..." : "Confirmar Linhas Editoriais"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pillar Card (read-only) ──────────────────────────────────

const FUNCAO_LABELS: Record<string, { label: string; color: string }> = {
  despertar: { label: "Despertar", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  educar: { label: "Educar", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  reter: { label: "Reter", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
};

function PillarCard({ line }: { line: EditorialLine }) {
  const funcaoInfo = FUNCAO_LABELS[line.funcao] ?? { label: line.funcao, color: "text-muted bg-white/5 border-white/10" };

  return (
    <div className="p-4 rounded-xl bg-surface/50 border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{line.nome}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${funcaoInfo.color}`}>
            {funcaoInfo.label}
          </span>
        </div>
        <span className="text-accent text-xs font-mono">{line.percentagem}%</span>
      </div>
      <p className="text-muted text-sm">{line.proposito}</p>
      {line.emocao && (
        <p className="text-xs text-muted/60 italic">Emoção: {line.emocao}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {line.temas.map((tema, i) => (
          <span
            key={i}
            className="text-xs px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent"
          >
            {tema}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Distribution Bar ─────────────────────────────────────────

function DistributionBar({ lines }: { lines: EditorialLine[] }) {
  const total = lines.reduce((sum, l) => sum + l.percentagem, 0);
  const colors = [
    "bg-accent",
    "bg-blue-400",
    "bg-purple-400",
    "bg-orange-400",
    "bg-pink-400",
    "bg-teal-400",
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono tracking-wider text-muted/60 uppercase">
          Distribuição
        </p>
        <p className={`text-xs ${total === 100 ? "text-accent" : "text-red-400"}`}>
          {total}%
        </p>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
        {lines.map((line, i) => (
          <div
            key={line.id}
            className={`${colors[i % colors.length]} transition-all`}
            style={{ width: `${line.percentagem}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {lines.map((line, i) => (
          <div key={line.id} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
            <span className="text-xs text-muted">{line.nome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
