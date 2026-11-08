// Shared by client and server: limits, slugs and how names are hidden.

export const PUBLIC_PAGE_SIZE = 5;
/** Reports from distinct people before an item hides itself pending review. */
export const AUTO_HIDE_AT = 3;

export const SHARE_ID = /^[A-Za-z0-9]{10}$/;

export const REPORT_REASONS = {
  "real-person": "It names a real person",
  threat: "It reads like a real threat",
  hate: "Hateful or harassing",
  "personal-data": "Contains personal information",
  spam: "Spam",
  other: "Something else",
} as const;
export type ReportReason = keyof typeof REPORT_REASONS;

export type TargetType = "public_entry" | "shared_note";

/** What the browser receives for anything public. */
export type PublicItem = {
  id: string;
  name: string;
  cause: string | null;
  details: string | null;
  time: string | null;
  penName: string | null;
  candles: number;
  createdAt: string;
};

export function shouldAutoHide(reports: number): boolean {
  return reports >= AUTO_HIDE_AT;
}
