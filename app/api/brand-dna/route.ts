import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { BrandDNAAnswersSchema } from "@/lib/validators";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { saveBrandProfile, getBrandCard } from "@/lib/supabase/user-profiles";
import { logAudit } from "@/lib/supabase/audit";
import { BRAND_DNA_SYSTEM_PROMPT } from "@/lib/prompts/brand-dna";

// GET — Fetch user's Brand DNA card
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const brandCard = await getBrandCard(userId);
    return NextResponse.json({ brandCard });
  } catch (error) {
    console.error("Brand DNA GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST — Generate Brand DNA from answers
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Rate limit
    const rateLimit = await checkAndConsumeRateLimit(userId, "brand-dna");
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
    }

    // Validate input
    const body = await request.json();
    const result = BrandDNAAnswersSchema.safeParse(body);
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
      max_tokens: 2000,
      system: BRAND_DNA_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Aqui estão as respostas do utilizador ao questionário Brand DNA:\n\n${userMessage}\n\nGera o Brand DNA Card em JSON.`,
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
    const brandCard = JSON.parse(jsonText);

    // Save to database
    await saveBrandProfile(userId, answers, brandCard);

    // Audit log (fire-and-forget)
    logAudit({
      userId,
      action: "brand_dna.generate",
      metadata: { answersCount: Object.keys(answers).length },
    });

    return NextResponse.json({
      brandCard,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("Brand DNA POST error:", error);

    const { userId } = await auth();
    if (userId) {
      logAudit({
        userId,
        action: "brand_dna.generate",
        success: false,
        errorMsg: String(error),
      });
    }

    return NextResponse.json({ error: "Erro ao gerar Brand DNA. Tenta novamente." }, { status: 500 });
  }
}
