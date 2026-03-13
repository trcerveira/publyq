import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { EditorialConfirmSchema, EditorialProfileSchema } from "@/lib/validators";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { getBrandCard, getVoiceCard, getUserProgress, getEditorialLines, saveEditorialLines } from "@/lib/supabase/user-profiles";
import { logAudit } from "@/lib/supabase/audit";
import { buildEditorialPrompt } from "@/lib/prompts/editorial";
import type { BrandDNACard, VoiceDNACard } from "@/lib/supabase/types";

// POST — Generate editorial lines from Brand DNA + Voice DNA
export async function POST(request: Request) {
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Gate: Both Brand DNA and Voice DNA must be complete
    const progress = await getUserProgress(userId);
    if (!progress.brandDnaComplete || !progress.voiceDnaComplete) {
      return NextResponse.json(
        { error: "Completa o Brand DNA e Voice DNA primeiro." },
        { status: 403 }
      );
    }

    // Rate limit
    const rateLimit = await checkAndConsumeRateLimit(userId, "editorial");
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
    }

    // Fetch Brand + Voice DNA
    const brandCard = await getBrandCard(userId) as BrandDNACard | null;
    const voiceCard = await getVoiceCard(userId) as VoiceDNACard | null;

    if (!brandCard || !voiceCard) {
      return NextResponse.json(
        { error: "Brand DNA ou Voice DNA em falta." },
        { status: 400 }
      );
    }

    // Build system prompt
    const systemPrompt = buildEditorialPrompt(brandCard, voiceCard);

    // Call Claude API
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "Gera as 5 linhas editoriais para esta marca. Segue exactamente o formato JSON pedido.",
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
    const rawProfile = JSON.parse(jsonText);

    // Validate Claude response
    const profileResult = EditorialProfileSchema.safeParse(rawProfile);
    if (!profileResult.success) {
      throw new Error("Claude returned invalid editorial format");
    }
    const profile = profileResult.data;

    // Save as draft
    await saveEditorialLines(userId, profile.linhas, profile.resumo, "draft");

    // Audit log
    logAudit({
      userId,
      action: "editorial.generate",
      metadata: { linesCount: profile.linhas.length },
    });

    return NextResponse.json({
      lines: profile.linhas,
      resumo: profile.resumo,
      status: "draft",
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("Editorial POST error:", error);

    if (userId) {
      logAudit({
        userId,
        action: "editorial.generate",
        success: false,
        errorMsg: String(error),
      });
    }

    return NextResponse.json(
      { error: "Erro ao gerar linhas editoriais. Tenta novamente." },
      { status: 500 }
    );
  }
}

// GET — Fetch user's editorial lines
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const record = await getEditorialLines(userId);

    if (!record) {
      return NextResponse.json({ lines: null, status: null });
    }

    return NextResponse.json({
      lines: record.lines,
      resumo: record.resumo,
      status: record.status,
    });
  } catch (error) {
    console.error("Editorial GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PUT — Confirm editorial lines (user reviewed and approved)
export async function PUT(request: Request) {
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const result = EditorialConfirmSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Input inválido" },
        { status: 400 }
      );
    }

    const { lines, resumo } = result.data;

    // Save as confirmed
    await saveEditorialLines(userId, lines, resumo, "confirmed");

    // Audit log
    logAudit({
      userId,
      action: "editorial.confirm",
      metadata: { linesCount: lines.length },
    });

    return NextResponse.json({
      lines,
      resumo,
      status: "confirmed",
    });
  } catch (error) {
    console.error("Editorial PUT error:", error);

    if (userId) {
      logAudit({
        userId,
        action: "editorial.confirm",
        success: false,
        errorMsg: String(error),
      });
    }

    return NextResponse.json(
      { error: "Erro ao confirmar linhas editoriais." },
      { status: 500 }
    );
  }
}
