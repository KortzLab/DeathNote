// Deliberately narrow. "Heart attack" as a cause is the whole point of the site; we only
// block things that read as real threats, self-harm encouragement, slurs or doxxing.

export type GuardResult = { ok: true } | { ok: false; reason: GuardReason };
export type GuardReason = "threat" | "self-harm" | "slur" | "personal-data";

/** "K1LLL y0u" -> "kill you" */
export function normalise(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/3/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/7/g, "t")
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/\s+/g, " ");
}

const THREATS: RegExp[] = [
  /\bi(?:'?m| am)? ?(?:going to|gonna|will|'?ll|wanna|want to) (?:kill|murder|hurt|stab|shoot|find|rape) (?:you|u|ya)\b/,
  /\b(?:you|u)(?:'?re| are)? (?:going to|gonna|will) die\b/,
  /\bi know where (?:you|u) (?:live|work|sleep|study)\b/,
  /\b(?:sleep with one eye open|i'?m coming for (?:you|u))\b/,
  /\b(?:bomb|shoot up|attack) (?:the|your|ur|a) (?:school|office|church|mosque|synagogue|temple)\b/,
];

const SELF_HARM: RegExp[] = [/\bkill (?:your ?self|urself|ur self)\b/, /\bkys\b/, /\bgo die\b/];

// Patterns rather than literals so they still match after normalise().
const SLURS: RegExp[] = [
  /\bn+i+g+(?:e+r+|a+|ah|uh)s?\b/,
  /\bf+a+g+(?:o+t+)?s?\b/,
  /\bk+i+k+e+s?\b/,
  /\bs+p+i+c+s?\b/,
  /\bc+h+i+n+k+s?\b/,
  /\bt+r+a+n+n+(?:y|ie)s?\b/,
  /\br+e+t+a+r+d+s?\b/,
  /\bw+e+t+b+a+c+k+s?\b/,
];

const PERSONAL_DATA: RegExp[] = [
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, // e-mail address
  /(?:\+?\d[\s().-]?){9,}\d/, // phone-number-like digit runs
  /\b\d{1,5} [a-z0-9 .'-]{2,40} (?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\b/i,
];

export function checkText(raw: string): GuardResult {
  if (!raw) return { ok: true };
  for (const re of PERSONAL_DATA) if (re.test(raw)) return { ok: false, reason: "personal-data" };
  const text = normalise(raw);
  for (const re of SELF_HARM) if (re.test(text)) return { ok: false, reason: "self-harm" };
  for (const re of THREATS) if (re.test(text)) return { ok: false, reason: "threat" };
  for (const re of SLURS) if (re.test(text)) return { ok: false, reason: "slur" };
  return { ok: true };
}

export function checkAll(...values: Array<string | null | undefined>): GuardResult {
  for (const v of values) {
    const r = checkText(v ?? "");
    if (!r.ok) return r;
  }
  return { ok: true };
}

export const GUARD_MESSAGES: Record<GuardReason, string> = {
  threat: "The notebook refuses words that read like a real threat. Keep it fictional.",
  "self-harm":
    "The notebook will not carry that. If you are struggling, please reach out to someone you trust or a local helpline.",
  slur: "The notebook rejects hateful language.",
  "personal-data": "No e-mails, phone numbers or addresses. Protect real people's privacy.",
};
