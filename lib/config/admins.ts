// ============================================================
// Access Control — PUBLYQ
// ============================================================

function parseEmailList(envVar: string | undefined, defaults: string[]): string[] {
  if (!envVar) return defaults.map(e => e.toLowerCase().trim());
  return envVar
    .split(",")
    .map(e => e.toLowerCase().trim())
    .filter(Boolean);
}

export const SUPER_ADMINS: string[] = parseEmailList(
  process.env.SUPER_ADMINS,
  ["trcerveira@gmail.com"]
);

// Beta whitelist — only these users can access the dashboard
export const BETA_USERS: string[] = [
  "trcerveira@gmail.com",
  "miguel.rodrigues@imomaster.com",
  "geral@arm-lda.com",
  "cleciofwise@hotmail.com",
  "bruno@pulsifyai.com",
];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMINS.includes(email.toLowerCase().trim());
}

export function hasBetaAccess(email: string | null | undefined): boolean {
  if (!email) return false;
  return BETA_USERS.includes(email.toLowerCase().trim());
}
