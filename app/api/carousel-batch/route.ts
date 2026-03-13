import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { BatchWeekSchema, BatchResponseSchema } from "@/lib/validators";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import {
  getBrandCard,
  getVoiceCard,
  getUserProgress,
  getEditorialLines,
} from "@/lib/supabase/user-profiles";
import { logAudit } from "@/lib/supabase/audit";
import { buildBatchPrompt } from "@/lib/prompts/carousel-batch";
import { createServerClient } from "@/lib/supabase/server";
import type { BrandDNACard, VoiceDNACard, EditorialLine } from "@/lib/supabase/types";

// Allow up to 2 minutes for batch generation (7 carousels)
export const maxDuration = 120;

// POST — Generate 7 carousels (one per day) in batch
export async function POST(request: Request) {
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Gate: Brand DNA, Voice DNA, and Editorial Lines must be complete
    const progress = await getUserProgress(userId);
    if (
      !progress.brandDnaComplete ||
      !progress.voiceDnaComplete ||
      !progress.editorialComplete
    ) {
      return NextResponse.json(
        { error: "Completa o Brand DNA, Voice DNA e Linhas Editoriais primeiro." },
        { status: 403 }
      );
    }

    // Rate limit (separate from single carousel)
    const rateLimit = await checkAndConsumeRateLimit(userId, "carousel-batch");
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
    }

    // Validate input
    const body = await request.json();
    const result = BatchWeekSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Input inválido" },
        { status: 400 }
      );
    }

    const { weekTheme } = result.data;

    // Fetch Brand + Voice DNA + Editorial Lines
    const [brandCard, voiceCard, editorialRecord] = await Promise.all([
      getBrandCard(userId) as Promise<BrandDNACard | null>,
      getVoiceCard(userId) as Promise<VoiceDNACard | null>,
      getEditorialLines(userId),
    ]);

    if (!brandCard || !voiceCard) {
      return NextResponse.json(
        { error: "Brand DNA ou Voice DNA em falta." },
        { status: 400 }
      );
    }

    if (!editorialRecord?.lines || !Array.isArray(editorialRecord.lines)) {
      return NextResponse.json(
        { error: "Linhas Editoriais em falta. Gera e confirma primeiro." },
        { status: 400 }
      );
    }

    const editorialLines = editorialRecord.lines as EditorialLine[];

    // Build system prompt
    const systemPrompt = buildBatchPrompt(
      brandCard,
      voiceCard,
      editorialLines,
      weekTheme
    );

    // Call Claude API — single call for all 7 carousels
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Gera os 7 carrosséis para a semana com o tema: "${weekTheme}"\n\nSegue exactamente a sequência psicológica e a fórmula Pilar × Template × Ângulo. Cada carrossel tem exactamente 7 slides. Usa a VOZ DA MARCA.`,
        },
      ],
    });

    // Extract text from response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON (remove markdown fences if present)
    const jsonText = textBlock.text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const rawBatch = JSON.parse(jsonText);

    // Validate Claude response structure
    const batchResult = BatchResponseSchema.safeParse(rawBatch);
    if (!batchResult.success) {
      console.error("Batch validation error:", batchResult.error.issues);
      throw new Error("Claude returned invalid batch format");
    }

    const batch = batchResult.data;

    // Save each carousel individually to generated_carousels
    const supabase = createServerClient();
    const batchId = crypto.randomUUID();

    const insertPromises = batch.semana.map((day) =>
      supabase.from("generated_carousels").insert({
        user_id: userId,
        topic: `[Machine] Dia ${day.dia}: ${day.sequencia} — ${day.tema}`,
        slides: day.slides,
        keywords: [weekTheme, day.sequencia, day.pilar, day.angulo],
        status: "draft",
      })
    );

    await Promise.all(insertPromises);

    // Audit log
    logAudit({
      userId,
      action: "batch.generate",
      metadata: {
        batchId,
        weekTheme,
        daysGenerated: batch.semana.length,
        totalSlides: batch.semana.reduce((sum, d) => sum + d.slides.length, 0),
      },
    });

    return NextResponse.json({
      semana: batch.semana,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("Carousel batch POST error:", error);

    if (userId) {
      logAudit({
        userId,
        action: "batch.generate",
        success: false,
        errorMsg: String(error),
      });
    }

    return NextResponse.json(
      { error: "Erro ao gerar a semana de carrosséis. Tenta novamente." },
      { status: 500 }
    );
  }
}
