import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { CarouselBatchSchema, CarouselSlidesResponseSchema } from "@/lib/validators";
import { checkAndConsumeRateLimit, rateLimitResponse } from "@/lib/supabase/rate-limit";
import { getBrandCard, getVoiceCard, getUserProgress } from "@/lib/supabase/user-profiles";
import { logAudit } from "@/lib/supabase/audit";
import { buildCarouselPrompt } from "@/lib/prompts/carousel";
import { createServerClient } from "@/lib/supabase/server";
import type { BrandDNACard, VoiceDNACard } from "@/lib/supabase/types";

// POST — Generate carousel from topic
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
    const rateLimit = await checkAndConsumeRateLimit(userId, "carousel");
    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitResponse(rateLimit), { status: 429 });
    }

    // Validate input
    const body = await request.json();
    const result = CarouselBatchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Input inválido" },
        { status: 400 }
      );
    }

    const { weekTheme, template, cta } = result.data;

    // Fetch Brand + Voice DNA
    const brandCard = await getBrandCard(userId) as BrandDNACard | null;
    const voiceCard = await getVoiceCard(userId) as VoiceDNACard | null;

    if (!brandCard || !voiceCard) {
      return NextResponse.json(
        { error: "Brand DNA ou Voice DNA em falta." },
        { status: 400 }
      );
    }

    // Build system prompt with DNA + template + CTA injection
    const systemPrompt = buildCarouselPrompt(brandCard, voiceCard, template, cta);

    // Call Claude API
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Gera um carrossel de Instagram sobre o tema: "${weekTheme}"\n\nSegue o template indicado. Exactamente 7 slides. Usa a VOZ DA MARCA definida no Voice DNA.`,
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
    const rawSlides = JSON.parse(jsonText);

    // Validate Claude response structure
    const slidesResult = CarouselSlidesResponseSchema.safeParse(rawSlides);
    if (!slidesResult.success) {
      throw new Error("Claude returned invalid slide format");
    }
    const slides = slidesResult.data;

    // Save carousel to database
    const supabase = createServerClient();
    await supabase.from("generated_carousels").insert({
      user_id: userId,
      topic: weekTheme,
      slides,
      status: "draft",
    });

    // Audit log
    logAudit({
      userId,
      action: "carousel.generate",
      metadata: { weekTheme, template, cta, slidesCount: slides.length },
    });

    return NextResponse.json({
      slides,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("Carousel POST error:", error);

    if (userId) {
      logAudit({
        userId,
        action: "carousel.generate",
        success: false,
        errorMsg: String(error),
      });
    }

    return NextResponse.json(
      { error: "Erro ao gerar carrossel. Tenta novamente." },
      { status: 500 }
    );
  }
}

// GET — List user's carousels
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("generated_carousels")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ carousels: data ?? [] });
  } catch (error) {
    console.error("Carousel GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
