import { createServerClient } from "@/lib/supabase/server";

// ============================================================
// PUBLYQ — User profile management (Supabase)
// ============================================================

interface SyncParams {
  clerkId: string;
  email: string;
  name?: string | null;
}

// Sync user from Clerk to Supabase (called on every dashboard visit)
export async function syncUserProfile({ clerkId, email, name }: SyncParams) {
  const supabase = createServerClient();

  // Select-before-upsert to avoid unnecessary writes
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("clerk_id, email, name")
    .eq("clerk_id", clerkId)
    .single();

  if (existing) {
    // Only update if something changed
    if (existing.email === email && existing.name === (name ?? null)) {
      return existing;
    }
    const { data } = await supabase
      .from("user_profiles")
      .update({ email, name: name ?? null, updated_at: new Date().toISOString() })
      .eq("clerk_id", clerkId)
      .select()
      .single();
    return data;
  }

  // First time — insert
  const { data } = await supabase
    .from("user_profiles")
    .insert({
      clerk_id: clerkId,
      email,
      name: name ?? null,
      brand_dna_complete: false,
      voice_dna_complete: false,
    })
    .select()
    .single();

  return data;
}

// Get user pipeline progress (for dashboard gating)
export async function getUserProgress(clerkId: string) {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("user_profiles")
    .select("brand_dna_complete, voice_dna_complete")
    .eq("clerk_id", clerkId)
    .single();

  return {
    brandDnaComplete: data?.brand_dna_complete ?? false,
    voiceDnaComplete: data?.voice_dna_complete ?? false,
  };
}

// Mark Brand DNA as complete
export async function markBrandDnaComplete(clerkId: string) {
  const supabase = createServerClient();
  await supabase
    .from("user_profiles")
    .update({ brand_dna_complete: true, updated_at: new Date().toISOString() })
    .eq("clerk_id", clerkId);
}

// Mark Voice DNA as complete
export async function markVoiceDnaComplete(clerkId: string) {
  const supabase = createServerClient();
  await supabase
    .from("user_profiles")
    .update({ voice_dna_complete: true, updated_at: new Date().toISOString() })
    .eq("clerk_id", clerkId);
}

// Save Brand DNA profile
export async function saveBrandProfile(clerkId: string, answers: Record<string, string>, brandCard: unknown) {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (existing) {
    await supabase
      .from("brand_profiles")
      .update({ answers, brand_card: brandCard, updated_at: new Date().toISOString() })
      .eq("clerk_id", clerkId);
  } else {
    await supabase
      .from("brand_profiles")
      .insert({ clerk_id: clerkId, answers, brand_card: brandCard });
  }

  await markBrandDnaComplete(clerkId);
}

// Save Voice DNA profile
export async function saveVoiceProfile(clerkId: string, answers: Record<string, string>, voiceCard: unknown) {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("voice_profiles")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (existing) {
    await supabase
      .from("voice_profiles")
      .update({ answers, voice_card: voiceCard, updated_at: new Date().toISOString() })
      .eq("clerk_id", clerkId);
  } else {
    await supabase
      .from("voice_profiles")
      .insert({ clerk_id: clerkId, answers, voice_card: voiceCard });
  }

  await markVoiceDnaComplete(clerkId);
}

// Get Brand DNA card (for carousel generation)
export async function getBrandCard(clerkId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("brand_profiles")
    .select("brand_card")
    .eq("clerk_id", clerkId)
    .single();
  return data?.brand_card ?? null;
}

// Get Voice DNA card (for carousel generation)
export async function getVoiceCard(clerkId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("voice_profiles")
    .select("voice_card")
    .eq("clerk_id", clerkId)
    .single();
  return data?.voice_card ?? null;
}
