import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { VoiceDNAAnswersSchema } from "@/lib/validators";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { saveVoiceProfile, getVoiceCard, getUserProgress } from "@/lib/supabase/user-profiles";
import { logAudit } from "@/lib/supabase/audit";
import { VOICE_DNA_SYSTEM_PROMPT } from "@/lib/prompts/voice-dna";

// GET — Fetch user's Voice DNA card
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const voiceCard = await getVoiceCard(userId);
    return NextResponse.json({ voiceCard });
  } catch (error) {
    console.error("Voice DNA GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST — Generate Voice DNA from answers
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Gate: Brand DNA must be complete first
    const progress = await getUserProgress(userId);
    if (!progress.brandDnaComplete) {
      return NextResponse.json(
        { error: "Completa o Brand DNA primeiro." },
        { status: 403 }
      );
    }

    // Rate limit
    const rateLimit = await checkAndConsumeRateLimit(userId, "voice-dna");
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
    }

    // Validate input
    const body = await request.json();
    const result = VoiceDNAAnswersSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Input inválido" },
        { status: 400 }
      );
    }

    const { answers } = result.data;

    // Build user message from answers
    const userMessage = Object.entries(answers)
      .map(([key, value]) => `**${key}:** ${value}`)
      .join("\n\n");

    // Call Claude API
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: VOICE_DNA_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Aqui estão as respostas do utilizador ao questionário Voice DNA:\n\n${userMessage}\n\nGera o Voice DNA Card em JSON.`,
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
    const voiceCard = JSON.parse(jsonText);

    // Save to database
    await saveVoiceProfile(userId, answers, voiceCard);

    // Audit log (fire-and-forget)
    logAudit({
      userId,
      action: "voice_dna.generate",
      metadata: { answersCount: Object.keys(answers).length },
    });

    return NextResponse.json({
      voiceCard,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("Voice DNA POST error:", error);

    const { userId } = await auth();
    if (userId) {
      logAudit({
        userId,
        action: "voice_dna.generate",
        success: false,
        errorMsg: String(error),
      });
    }

    return NextResponse.json({ error: "Erro ao gerar Voice DNA. Tenta novamente." }, { status: 500 });
  }
}
