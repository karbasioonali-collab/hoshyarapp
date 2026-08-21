import { z } from "zod";
import { CATEGORY_BRANCHES, PERSON_DIRECTIONS, TRANSACTION_SOURCES, TRANSACTION_STATUSES } from "./enums";

// ---------- احراز هویت ----------
export const requestOtpSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/),
  code: z.string().length(5),
  name: z.string().min(1).optional(),
});

export const emailRegisterSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشه"),
  name: z.string().min(1).optional(),
});

export const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ---------- حساب بانکی ----------
export const bankAccountInputSchema = z.object({
  name: z.string().min(1),
  balance: z.number().finite().optional(),
  description: z.string().optional(),
});

// ---------- دسته‌بندی ----------
export const categoryInputSchema = z.object({
  branch: z.enum(CATEGORY_BRANCHES),
  parentId: z.string().cuid().nullable().optional(),
  name: z.string().min(1),
});

// ---------- تراکنش (لجر مرکزی) ----------
export const transactionInputSchema = z.object({
  categoryId: z.string().cuid(),
  bankAccountId: z.string().cuid().nullable().optional(),
  amount: z.number().positive(),
  occurredOnJalali: z.string().regex(/^\d{4}-\d{1,2}-\d{1,2}$/),
  description: z.string().optional(),
  status: z.enum(TRANSACTION_STATUSES).optional(),
  source: z.enum(TRANSACTION_SOURCES).optional(),
  metadata: z.record(z.any()).optional(),
});

export const transactionUpdateSchema = transactionInputSchema.partial();

// ---------- اقساط ----------
export const installmentPlanInputSchema = z.object({
  description: z.string().min(1),
  totalAmount: z.number().positive(),
  monthsCount: z.number().int().min(1).max(120),
  payDay: z.number().int().min(1).max(31),
  bankAccountId: z.string().cuid().nullable().optional(),
});

// ---------- بدهی/طلب اشخاص ----------
export const personLedgerEntryInputSchema = z.object({
  direction: z.enum(PERSON_DIRECTIONS),
  description: z.string().min(1),
  personName: z.string().min(1),
  amount: z.number().positive(),
  dueMonth: z.number().int().min(1).max(12),
  dueDay: z.number().int().min(1).max(31),
  bankAccountId: z.string().cuid().nullable().optional(),
});

// ---------- دارایی ----------
export const assetInputSchema = z.object({
  description: z.string().min(1),
  amount: z.string().min(1),
  unit: z.string().min(1),
});

// ---------- مناسبت‌ها ----------
export const eventInputSchema = z.object({
  description: z.string().min(1),
  jalaliMonth: z.number().int().min(1).max(12),
  jalaliDay: z.number().int().min(1).max(31),
});

// ---------- جلسات و قرارها ----------
export const appointmentInputSchema = z.object({
  description: z.string().min(1),
  jalaliYear: z.number().int().min(1300).max(1500),
  jalaliMonth: z.number().int().min(1).max(12),
  jalaliDay: z.number().int().min(1).max(31),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().optional(),
});

// ---------- یادآوری‌ها ----------
export const reminderInputSchema = z.object({
  description: z.string().min(1),
  jalaliYear: z.number().int().min(1300).max(1500),
  jalaliMonth: z.number().int().min(1).max(12),
  jalaliDay: z.number().int().min(1).max(31),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  leadTimeMinutes: z.number().int().positive().nullable().optional(),
});

// ---------- Onboarding ----------
export const onboardingInputSchema = z.object({
  monthlyIncome: z.number().nonnegative().optional(),
  housingCost: z.number().nonnegative().optional(),
  carCost: z.number().nonnegative().optional(),
  otherFixedCosts: z
    .array(z.object({ description: z.string().min(1), amount: z.number().nonnegative() }))
    .optional(),
});

// ---------- هوش مصنوعی (ویس/تایپ) ----------
export const transcribeRequestSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().min(1),
});

export const speakRequestSchema = z.object({
  text: z.string().min(1),
});

export const voiceIntentRequestSchema = z.object({
  text: z.string().min(1),
  inputType: z.enum(["VOICE", "TEXT"]),
  pageContext: z.string().optional(),
  wantsAudio: z.boolean().optional(),
});

export const consultRequestSchema = z.object({
  text: z.string().min(1),
  inputType: z.enum(["VOICE", "TEXT"]),
  wantsAudio: z.boolean().optional(),
});

// برای اعتبارسنجی خروجی JSON مدل زبانی، قبل از اجرای هر اقدامی روی دیتابیس
export const voiceActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("add_transaction"),
    branch: z.enum(CATEGORY_BRANCHES),
    categoryName: z.string().min(1),
    amount: z.number().positive(),
    bankAccountName: z.string().optional(),
    description: z.string().optional(),
    occurredOnJalali: z.string().optional(),
  }),
  z.object({
    type: z.literal("pay_installment"),
    installmentDescription: z.string().min(1),
  }),
  z.object({
    type: z.literal("create_installment"),
    description: z.string().min(1),
    totalAmount: z.number().positive(),
    monthsCount: z.number().int().min(1).max(120),
    payDay: z.number().int().min(1).max(31),
    bankAccountName: z.string().optional(),
  }),
  z.object({
    type: z.literal("navigate"),
    path: z.string().min(1),
  }),
  z.object({
    type: z.literal("ask_clarification"),
    question: z.string().min(1),
  }),
]);

export const aiIntentOutputSchema = z.object({
  message: z.string().min(1),
  action: voiceActionSchema,
});
export type AiIntentOutput = z.infer<typeof aiIntentOutputSchema>;

// ---------- نام‌گذاری دلخواه ستون‌ها ----------
export const columnLabelOverrideInputSchema = z.object({
  tableKey: z.string().min(1),
  columnKey: z.string().min(1),
  customLabel: z.string().min(1),
});
