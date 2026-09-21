import { SCHEMA_VERSION, type StudyData } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function requiredText(value: string, label: string): string | null {
  if (!value.trim()) return `${label} نمی‌تواند خالی باشد.`;
  return null;
}

export function validateScore(score: number, maxScore: number): string | null {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore)) return "نمره باید عدد باشد.";
  if (maxScore <= 0) return "حداکثر نمره باید بزرگ‌تر از صفر باشد.";
  if (score < 0 || score > maxScore) return "نمره خارج از محدوده مجاز است.";
  return null;
}

export function validateMinutes(value: number, label: string): string | null {
  if (!Number.isFinite(value) || value < 0) return `${label} نامعتبر است.`;
  return null;
}

export function parseImportPayload(raw: unknown): { ok: true; data: StudyData } | { ok: false; error: string } {
  if (!isRecord(raw)) return { ok: false, error: "فایل واردشده ساختار معتبری ندارد." };
  if (raw.version !== SCHEMA_VERSION) {
    return { ok: false, error: "نسخه فایل پشتیبان با این برنامه سازگار نیست." };
  }
  const collections = ["subjects", "sessions", "tasks", "homework", "exams", "grades", "goals", "notes"] as const;
  for (const key of collections) {
    if (!isArray(raw[key])) {
      return { ok: false, error: `فیلد ${key} در فایل پشتیبان ناقص است.` };
    }
  }
  if (!isRecord(raw.settings)) {
    return { ok: false, error: "تنظیمات فایل پشتیبان ناقص است." };
  }
  return { ok: true, data: raw as unknown as StudyData };
}
