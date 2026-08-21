import { api } from "./client";
import type { BankAccount } from "./types";

export function listBankAccounts() {
  return api.get<{ accounts: BankAccount[] }>("/api/bank-accounts");
}

export function createBankAccount(input: { name: string; balance?: number; description?: string }) {
  return api.post<{ account: BankAccount }>("/api/bank-accounts", input);
}

export function updateBankAccount(id: string, input: Partial<{ name: string; balance: number; description: string }>) {
  return api.patch<{ account: BankAccount }>(`/api/bank-accounts/${id}`, input);
}

export function deleteBankAccount(id: string) {
  return api.delete<{ ok: true }>(`/api/bank-accounts/${id}`);
}
