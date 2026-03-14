"use client";

import { useEffect, useState } from "react";
import HeroJourneyOnboarding from "@/components/onboarding/HeroJourneyOnboarding";
import type { BrandDNACard, VoiceDNACard } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialScreen, setInitialScreen] = useState(1);
  const [brandCard, setBrandCard] = useState<BrandDNACard | null>(null);
  const [voiceCard, setVoiceCard] = useState<VoiceDNACard | null>(null);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch("/api/progress");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const progress = await res.json();

        // Both complete → skip onboarding, go to dashboard
        if (progress.brandDnaComplete && progress.voiceDnaComplete) {
          router.replace("/dashboard");
          return;
        }

        // Brand complete but voice not → start at voice section (screen 10)
        if (progress.brandDnaComplete && !progress.voiceDnaComplete) {
          // Load existing brand card
          const brandRes = await fetch("/api/brand-dna");
          if (brandRes.ok) {
            const data = await brandRes.json();
            setBrandCard(data.brandCard ?? null);
          }
          setInitialScreen(10);
        }

        // Neither complete → start from beginning
      } catch (err) {
        console.error("Error loading onboarding progress:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <HeroJourneyOnboarding
      initialScreen={initialScreen}
      existingBrandCard={brandCard}
      existingVoiceCard={voiceCard}
    />
  );
}
