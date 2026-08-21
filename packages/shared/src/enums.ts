// این‌ها آینه‌ی enum های packages/database/prisma/schema.prisma هستن، اما مستقل از
// Prisma تعریف شدن تا apps/mobile (که Node/Prisma نداره) هم بتونه استفاده‌شون کنه.

export const CATEGORY_BRANCHES = [
  "INCOME",
  "INSTALLMENT",
  "EXPENSE",
  "DEBT",
  "RECEIVABLE",
  "ASSET",
] as const;
export type CategoryBranch = (typeof CATEGORY_BRANCHES)[number];

export const TRANSACTION_STATUSES = ["PAID", "PENDING"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const TRANSACTION_SOURCES = ["MANUAL", "VOICE", "AUTO"] as const;
export type TransactionSource = (typeof TRANSACTION_SOURCES)[number];

export const PERSON_DIRECTIONS = ["DEBT", "RECEIVABLE"] as const;
export type PersonDirection = (typeof PERSON_DIRECTIONS)[number];

export const PERSON_ENTRY_STATUSES = ["PENDING", "SETTLED"] as const;
export type PersonEntryStatus = (typeof PERSON_ENTRY_STATUSES)[number];

export const VOICE_INPUT_TYPES = ["VOICE", "TEXT"] as const;
export type VoiceInputType = (typeof VOICE_INPUT_TYPES)[number];
