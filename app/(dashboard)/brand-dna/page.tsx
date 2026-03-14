"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandDNAAssessment from "@/components/brand-dna/BrandDNAAssessment";
import type { BrandDNACard } from "@/lib/supabase/types";

export default function BrandDNAPage() {
  const router = useRouter();
  const [existingCard, setExistingCard] = useState<BrandDNACard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExisting() {
      try {
        // If brand DNA not complete, redirect to hero journey onboarding
        const progressRes = await fetch("/api/progress");
        if (progressRes.ok) {
          const progress = await progressRes.json();
          if (!progress.brandDnaComplete) {
            router.replace("/onboarding");
            return;
          }
        }

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
        <p className="text-accent text-xs font-mono tracking-wider mb-1">PASSO 01</p>
        <h1 className="text-2xl font-bold">Brand DNA</h1>
        <p className="text-muted text-sm mt-2">
          Define a identidade da tua marca. Quem serves, quem és, o que defendes.
        </p>
      </div>

      <BrandDNAAssessment
        existingCard={existingCard}
        onComplete={() => { router.push("/dashboard"); }}
      />
    </div>
  );
}
