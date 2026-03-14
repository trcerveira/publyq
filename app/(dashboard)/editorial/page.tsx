"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EditorialLines from "@/components/editorial/EditorialLines";
import type { EditorialLine } from "@/lib/supabase/types";

export default function EditorialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gated, setGated] = useState(false);
  const [initialLines, setInitialLines] = useState<EditorialLine[] | null>(null);
  const [initialResumo, setInitialResumo] = useState<string | null>(null);
  const [initialStatus, setInitialStatus] = useState<"draft" | "confirmed" | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Check progress gating
        const progressRes = await fetch("/api/progress");
        if (progressRes.ok) {
          const progress = await progressRes.json();
          if (!progress.brandDnaComplete || !progress.voiceDnaComplete) {
            setGated(true);
            setLoading(false);
            return;
          }
        }

        // Load existing editorial lines
        const editorialRes = await fetch("/api/editorial");
        if (editorialRes.ok) {
          const data = await editorialRes.json();
          if (data.lines) {
            setInitialLines(data.lines);
            setInitialResumo(data.resumo);
            setInitialStatus(data.status);
            if (data.status === "confirmed") {
              setCompleted(true);
            }
          }
        }
      } catch (err) {
        console.error("Error loading editorial data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (gated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-muted/50 text-4xl mb-4">&#128274;</p>
        <h2 className="text-xl font-bold mb-2">Linhas Editoriais bloqueadas</h2>
        <p className="text-muted text-sm mb-6">
          Completa o Brand DNA e Voice DNA primeiro para desbloquear as Linhas Editoriais.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-lg text-sm hover:bg-accent/90 transition-colors"
        >
          Ir para Dashboard
        </button>
      </div>
    );
  }

  // Show success CTA after confirming
  if (completed && !loading) {
    return (
      <div className="py-4">
        <div className="mb-8">
          <p className="text-accent text-xs font-mono tracking-wider mb-1">PASSO 03</p>
          <h1 className="text-2xl font-bold">Linhas Editoriais</h1>
          <p className="text-muted text-sm mt-2">
            Os teus pilares de conteúdo, criados pela IA e confirmados por ti.
          </p>
        </div>

        <EditorialLines
          initialLines={initialLines}
          initialResumo={initialResumo}
          initialStatus={initialStatus}
          onComplete={() => setCompleted(true)}
        />

        <div className="max-w-3xl mx-auto mt-8 text-center">
          <button
            onClick={() => router.push("/carousel")}
            className="px-8 py-3 bg-accent text-background font-semibold rounded-lg text-sm hover:bg-accent/90 transition-colors"
          >
            Avançar para Carrossel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-8">
        <p className="text-accent text-xs font-mono tracking-wider mb-1">PASSO 03</p>
        <h1 className="text-2xl font-bold">Linhas Editoriais</h1>
        <p className="text-muted text-sm mt-2">
          A IA cria os teus pilares de conteúdo. Tu revês, editas e confirmas.
        </p>
      </div>

      <EditorialLines
        initialLines={initialLines}
        initialResumo={initialResumo}
        initialStatus={initialStatus}
        onComplete={() => setCompleted(true)}
      />
    </div>
  );
}
