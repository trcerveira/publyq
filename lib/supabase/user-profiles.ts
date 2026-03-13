import { createServerClient } from "@/lib/supabase/server";

// ============================================================
// PUBLYQ — User profile management (Supabase)
// DB column = user_id (stores Clerk ID as TEXT)
// ============================================================

interface SyncParams {
  userId: string;   // Clerk ID (user_xxxxxxx)
  email: string;
  name?: string | null;
}

// Sync user from Clerk to Supabase (called on every dashboard visit)
export async function syncUserProfile({ userId, email, name }: SyncParams) {
  const supabase = createServerClient();

  try {
    // Select-before-upsert to avoid unnecessary writes
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("user_id, email, name")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      if (existing.email === email && existing.name === (name ?? null)) {
        return existing;
      }
      const { data } = await supabase
        .from("user_profiles")
        .update({ email, name: name ?? null, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .select()
        .single();
      return data;
    }

    // First time — insert
    const { data } = await supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        email,
        name: name ?? null,
        brand_dna_complete: false,
        voz_dna_complete: false,
      })
      .select()
      .single();

    return data;
  } catch (error) {
    console.error("Error syncing profile:", error);
    return null;
  }
}

// Get user pipeline progress (for dashboard gating)
export async function getUserProgress(userId: string) {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("user_profiles")
    .select("brand_dna_complete, voz_dna_complete, editorial_complete")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    brandDnaComplete: data?.brand_dna_complete ?? false,
    voiceDnaComplete: data?.voz_dna_complete ?? false,
    editorialComplete: data?.editorial_complete ?? false,
  };
}

// Mark Brand DNA as complete
export async function markBrandDnaComplete(userId: string) {
  const supabase = createServerClient();
  await supabase
    .from("user_profiles")
    .update({ brand_dna_complete: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}

// Mark Voice DNA as complete
export async function markVoiceDnaComplete(userId: string) {
  const supabase = createServerClient();
  await supabase
    .from("user_profiles")
    .update({ voz_dna_complete: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}

// Save Brand DNA profile
export async function saveBrandProfile(
  userId: string,
  answers: Record<string, string>,
  brandCard: Record<string, unknown>
) {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("brand_profiles")
    .select("id, version")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("brand_profiles")
      .update({
        brand_dna_output: brandCard,
        version: (existing.version ?? 1) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    await supabase
      .from("brand_profiles")
      .insert({
        user_id: userId,
        brand_dna_output: brandCard,
      });
  }

  await markBrandDnaComplete(userId);
}

// Save Voice DNA profile
export async function saveVoiceProfile(
  userId: string,
  answers: Record<string, string>,
  voiceCard: Record<string, unknown>
) {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("voice_profiles")
    .select("id, version")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("voice_profiles")
      .update({
        answers,
        voice_dna: voiceCard,
        version: (existing.version ?? 1) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    await supabase
      .from("voice_profiles")
      .insert({
        user_id: userId,
        answers,
        voice_dna: voiceCard,
      });
  }

  await markVoiceDnaComplete(userId);
}

// Mark Editorial Lines as complete
export async function markEditorialComplete(userId: string) {
  const supabase = createServerClient();
  await supabase
    .from("user_profiles")
    .update({ editorial_complete: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}

// Save editorial lines (draft or confirmed)
export async function saveEditorialLines(
  userId: string,
  lines: unknown[],
  resumo: string,
  status: "draft" | "confirmed" = "draft"
) {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("editorial_lines")
    .select("id, version")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("editorial_lines")
      .update({
        lines,
        resumo,
        status,
        version: (existing.version ?? 1) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    await supabase
      .from("editorial_lines")
      .insert({
        user_id: userId,
        lines,
        resumo,
        status,
      });
  }

  if (status === "confirmed") {
    await markEditorialComplete(userId);
  }
}

// Get editorial lines for user
export async function getEditorialLines(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("editorial_lines")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

// Get Brand DNA card (for carousel generation)
export async function getBrandCard(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("brand_profiles")
    .select("brand_dna_output")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.brand_dna_output ?? null;
}

// Get Voice DNA card (for carousel generation)
export async function getVoiceCard(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("voice_profiles")
    .select("voice_dna")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.voice_dna ?? null;
}

// Save generated carousel
export async function saveCarousel(
  userId: string,
  topic: string,
  slides: unknown[],
  keywords?: string[],
  palette?: Record<string, string>
) {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("generated_carousels")
    .insert({
      user_id: userId,
      topic,
      slides,
      keywords: keywords ?? null,
      palette: palette ?? null,
    })
    .select()
    .single();

  return data;
}

// Get user's carousels (excluding soft-deleted)
export async function getUserCarousels(userId: string) {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("generated_carousels")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return data ?? [];
}
