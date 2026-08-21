// این تایپ‌ها معادل خروجی JSON بک‌اندن. چون Prisma.Decimal به رشته سریالایز می‌شه،
// فیلدهای مبلغ همه‌جا string هستن و باید موقع نمایش با Number(...) تبدیل بشن.
import type {
  CategoryBranch,
  PersonDirection,
  PersonEntryStatus,
  TransactionSource,
  TransactionStatus,
} from "@hoshyar/shared";

export interface BankAccount {
  id: string;
  name: string;
  balance: string;
  description: string | null;
  sortOrder: number;
}

export interface Category {
  id: string;
  branch: CategoryBranch;
  parentId: string | null;
  userId: string | null;
  name: string;
  sortOrder: number;
}

export interface Transaction {
  id: string;
  categoryId: string;
  category: Category;
  bankAccountId: string | null;
  bankAccount: BankAccount | null;
  amount: string;
  occurredOn: string;
  description: string | null;
  status: TransactionStatus;
  source: TransactionSource;
  metadata: Record<string, unknown>;
}

export interface InstallmentPayment {
  id: string;
  planId: string;
  monthIndex: number;
  dueJalaliYear: number;
  dueMonth: number;
  dueDay: number;
  amount: string;
  paidAt: string | null;
}

export interface InstallmentPlan {
  id: string;
  description: string;
  totalAmount: string;
  monthlyAmount: string;
  monthsCount: number;
  payDay: number;
  bankAccountId: string | null;
  bankAccount: BankAccount | null;
  payments: InstallmentPayment[];
}

export interface PersonLedgerEntry {
  id: string;
  direction: PersonDirection;
  description: string;
  personName: string;
  amount: string;
  dueMonth: number;
  dueDay: number;
  status: PersonEntryStatus;
  bankAccountId: string | null;
}

export interface Asset {
  id: string;
  description: string;
  amount: string;
  unit: string;
}

export interface EventItem {
  id: string;
  description: string;
  jalaliMonth: number;
  jalaliDay: number;
}

export interface Appointment {
  id: string;
  description: string;
  jalaliYear: number;
  jalaliMonth: number;
  jalaliDay: number;
  time: string;
  location: string | null;
}

export interface Reminder {
  id: string;
  description: string;
  jalaliYear: number;
  jalaliMonth: number;
  jalaliDay: number;
  time: string;
  leadTimeMinutes: number | null;
}

export interface LedgerEventMessage {
  message: string;
  transactionId?: string | null;
}
