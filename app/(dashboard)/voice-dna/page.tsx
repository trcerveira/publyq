"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VoiceDNAAssessment from "@/components/voice-dna/VoiceDNAAssessment";
import type { VoiceDNACard } from "@/lib/supabase/types";

export default function VoiceDNAPage() {
  const router = useRouter();
  const [existingCard, setExistingCard] = useState<VoiceDNACard | null>(null);
  const [loading, setLoading] = useState(true);
  const [gated, setGated] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Check progress first
        const progressRes = await fetch("/api/progress");
        if (progressRes.ok) {
          const progress = await progressRes.json();
          if (!progress.brandDnaComplete) {
            setGated(true);
            setLoading(false);
            return;
          }
        }

        // Load existing voice card
        const res = await fetch("/api/voice-dna");
        if (res.ok) {
          const data = await res.json();
          setExistingCard(data.voiceCard ?? null);
        }
      } catch (err) {
        console.error("Error loading Voice DNA:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleComplete = (card: VoiceDNACard) => {
    setExistingCard(card);
    setJustCompleted(true);
  };

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
        <h2 className="text-xl font-bold mb-2">Voice DNA bloqueado</h2>
        <p className="text-muted text-sm mb-6">
          Completa o Brand DNA primeiro para desbloquear o Voice DNA.
        </p>
        <button
          onClick={() => router.push("/brand-dna")}
          className="px-6 py-2.5 bg-accent text-background font-semibold rounded-lg text-sm hover:bg-accent/90 transition-colors"
        >
          Ir para Brand DNA
        </button>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-8">
        <p className="text-accent text-xs font-mono tracking-wider mb-1">PASSO 02</p>
        <h1 className="text-2xl font-bold">Voice DNA</h1>
        <p className="text-muted text-sm mt-2">
          Define a tua voz. Tom, vocabulário, frases assinatura.
        </p>
      </div>

      {justCompleted ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 text-center">
            <p className="text-accent text-lg font-semibold mb-2">Voice DNA gerado com sucesso!</p>
            <p className="text-muted text-sm mb-6">Agora podes criar carrosséis com a tua voz única.</p>
            <button
              onClick={() => router.push("/carousel")}
              className="px-6 py-2.5 bg-accent text-background font-semibold rounded-lg text-sm hover:bg-accent/90 transition-colors"
            >
              Continuar para Carrossel
            </button>
          </div>
        </div>
      ) : (
        <VoiceDNAAssessment
          existingCard={existingCard}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
