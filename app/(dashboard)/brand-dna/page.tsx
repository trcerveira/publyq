"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandDNAAssessment from "@/components/brand-dna/BrandDNAAssessment";
import type { BrandDNACard } from "@/lib/supabase/types";

export default function BrandDNAPage() {
  const router = useRouter();
  const [existingCard, setExistingCard] = useState<BrandDNACard | null>(null);
  const [loading, setLoading] = useState(true);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      try {
        const res = await fetch("/api/brand-dna");
        if (res.ok) {
          const data = await res.json();
          setExistingCard(data.brandCard ?? null);
        }
      } catch (err) {
        console.error("Error loading Brand DNA:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExisting();
  }, []);

  const handleComplete = (card: BrandDNACard) => {
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

  return (
    <div className="py-4">
      <div className="mb-8">
        <p className="text-accent text-xs font-mono tracking-wider mb-1">PASSO 01</p>
        <h1 className="text-2xl font-bold">Brand DNA</h1>
        <p className="text-muted text-sm mt-2">
          Define a identidade da tua marca. Quem serves, quem és, o que defendes.
        </p>
      </div>

      {justCompleted ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 text-center">
            <p className="text-accent text-lg font-semibold mb-2">Brand DNA gerado com sucesso!</p>
            <p className="text-muted text-sm mb-6">O próximo passo é definir a tua Voice DNA.</p>
            <button
              onClick={() => router.push("/voice-dna")}
              className="px-6 py-2.5 bg-accent text-background font-semibold rounded-lg text-sm hover:bg-accent/90 transition-colors"
            >
              Continuar para Voice DNA
            </button>
          </div>
        </div>
      ) : (
        <BrandDNAAssessment
          existingCard={existingCard}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
