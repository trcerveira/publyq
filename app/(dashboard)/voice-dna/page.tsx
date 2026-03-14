"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VoiceDNAAssessment from "@/components/voice-dna/VoiceDNAAssessment";
import type { VoiceDNACard } from "@/lib/supabase/types";

export default function VoiceDNAPage() {
  const router = useRouter();
  const [existingCard, setExistingCard] = useState<VoiceDNACard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const progressRes = await fetch("/api/progress");
        if (progressRes.ok) {
          const progress = await progressRes.json();
          // Not complete → redirect to hero journey onboarding
          if (!progress.voiceDnaComplete) {
            router.replace("/onboarding");
            return;
          }
        }

        // Load existing voice card (for viewing after completion)
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
  }, [router]);

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
        <p className="text-accent text-xs font-mono tracking-wider mb-1">PASSO 02</p>
        <h1 className="text-2xl font-bold">Voice DNA</h1>
        <p className="text-muted text-sm mt-2">
          Define a tua voz. Tom, vocabulário, frases assinatura.
        </p>
      </div>

      <VoiceDNAAssessment
        existingCard={existingCard}
        onComplete={() => { router.push("/dashboard"); }}
      />
    </div>
  );
}
