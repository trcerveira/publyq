"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CarouselGenerator from "@/components/carousel/CarouselGenerator";

export default function CarouselPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gated, setGated] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch("/api/progress");
        if (res.ok) {
          const progress = await res.json();
          if (!progress.brandDnaComplete || !progress.voiceDnaComplete || !progress.editorialComplete) {
            setGated(true);
          }
        }
      } catch (err) {
        console.error("Error checking progress:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (gated) {
    const missingStep = "Brand DNA, Voice DNA e Linhas Editoriais";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-muted/50 text-4xl mb-4">&#128274;</p>
        <h2 className="text-xl font-bold mb-2">Carrossel bloqueado</h2>
        <p className="text-muted text-sm mb-6">
          Completa o {missingStep} primeiro para desbloquear a geração de carrosséis.
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

  return (
    <div className="py-4">
      <div className="mb-8">
        <p className="text-accent text-xs font-mono tracking-wider mb-1">PASSO 04</p>
        <h1 className="text-2xl font-bold">Carrossel Instagram</h1>
        <p className="text-muted text-sm mt-2">
          Gera carrosséis com a tua voz. Exporta como imagens prontas a publicar.
        </p>
      </div>

      <CarouselGenerator />
    </div>
  );
}
