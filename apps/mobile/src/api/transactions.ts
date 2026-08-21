import { api } from "./client";
import type { LedgerEventMessage, Transaction } from "./types";

export function listTransactions(params: { categoryId?: string; branch?: string; months?: number }) {
  const query = new URLSearchParams();
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.branch) query.set("branch", params.branch);
  if (params.months) query.set("months", String(params.months));
  return api.get<{ transactions: Transaction[] }>(`/api/transactions?${query.toString()}`);
}

export interface TransactionInput {
  categoryId: string;
  bankAccountId?: string | null;
  amount: number;
  occurredOnJalali: string;
  description?: string;
  status?: "PAID" | "PENDING";
}

export function createTransaction(input: TransactionInput) {
  return api.post<{ transaction: Transaction; events: LedgerEventMessage[] }>("/api/transactions", input);
}

export function updateTransaction(id: string, input: Partial<TransactionInput>) {
  return api.patch<{ transaction: Transaction; events: LedgerEventMessage[] }>(`/api/transactions/${id}`, input);
}

export function deleteTransaction(id: string) {
  return api.delete<{ ok: true; events: LedgerEventMessage[] }>(`/api/transactions/${id}`);
}
