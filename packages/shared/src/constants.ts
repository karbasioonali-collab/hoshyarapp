import type { CategoryBranch } from "./enums";

// رنگ ثابت هر سرشاخه در نمودار خلاصه‌ی «حساب و کتاب»
export const BRANCH_COLORS: Record<CategoryBranch, string> = {
  INCOME: "#22c55e", // سبز
  INSTALLMENT: "#f97316", // نارنجی
  EXPENSE: "#ef4444", // قرمز
  RECEIVABLE: "#3b82f6", // آبی
  DEBT: "#a855f7", // بنفش
  ASSET: "#eab308", // زرد
};

export const BRANCH_LABELS: Record<CategoryBranch, string> = {
  INCOME: "درآمد",
  INSTALLMENT: "اقساط",
  EXPENSE: "هزینه‌های جاری",
  DEBT: "بدهی به اشخاص",
  RECEIVABLE: "طلب از اشخاص",
  ASSET: "دارایی‌ها",
};

// پالت اصلی برند
export const BRAND_COLORS = {
  navy: "#0a1a3f",
  turquoiseLight: "#2dd9e8",
  turquoiseDark: "#14b8a6",
  background: "#f7fafc",
};

// نام پیش‌فرض ستون‌ها به‌ازای هر جدول (کاربر می‌تونه از ColumnLabelOverride عوضشون کنه)
export const DEFAULT_COLUMN_LABELS: Record<string, Record<string, string>> = {
  transactions: { row: "ردیف", description: "شرح", amount: "مبلغ", occurredOn: "تاریخ" },
  bankAccounts: { row: "ردیف", name: "نام بانک", balance: "موجودی", description: "شرح" },
  installments: {
    row: "ردیف",
    description: "شرح",
    totalAmount: "مبلغ کل قسط",
    monthlyAmount: "قسط هر ماه",
    monthsCount: "تعداد اقساط",
    payDay: "تاریخ پرداخت هر ماه",
  },
  debts: {
    row: "ردیف",
    description: "شرح",
    personName: "نام",
    amount: "مبلغ",
    dueMonth: "ماه پرداخت",
    dueDay: "روز پرداخت",
  },
  receivables: {
    row: "ردیف",
    description: "شرح",
    personName: "نام",
    amount: "مبلغ",
    dueMonth: "ماه دریافت",
    dueDay: "روز دریافت",
  },
  assets: { row: "ردیف", description: "شرح", amount: "میزان" },
  events: { row: "ردیف", description: "شرح", jalaliMonth: "ماه", jalaliDay: "روز" },
  appointments: {
    row: "ردیف",
    description: "شرح",
    jalaliMonth: "ماه",
    jalaliDay: "روز",
    time: "ساعت",
    location: "محل",
  },
  reminders: {
    row: "ردیف",
    description: "شرح",
    jalaliMonth: "ماه",
    jalaliDay: "روز",
    time: "ساعت",
  },
};

export const TIME_RANGE_PRESETS = [
  { key: "1m", label: "۱ ماه اخیر", months: 1 },
  { key: "3m", label: "۳ ماه اخیر", months: 3 },
  { key: "6m", label: "۶ ماه اخیر", months: 6 },
  { key: "12m", label: "۱۲ ماه اخیر", months: 12 },
  { key: "all", label: "همه‌ی زمان‌ها", months: null },
] as const;

export const REMINDER_LEAD_TIME_PRESETS = [
  { key: "1d", label: "۱ روز قبل", minutes: 24 * 60 },
  { key: "2d", label: "۲ روز قبل", minutes: 2 * 24 * 60 },
  { key: "1w", label: "یک هفته قبل", minutes: 7 * 24 * 60 },
] as const;
