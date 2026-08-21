import { api } from "./client";
import type { InstallmentPlan, LedgerEventMessage } from "./types";

export function listInstallmentPlans() {
  return api.get<{ plans: InstallmentPlan[] }>("/api/installments");
}

export function getInstallmentPlan(id: string) {
  return api.get<{ plan: InstallmentPlan }>(`/api/installments/${id}`);
}

export function createInstallmentPlan(input: {
  description: string;
  totalAmount: number;
  monthsCount: number;
  payDay: number;
  bankAccountId?: string | null;
}) {
  return api.post<{ plan: InstallmentPlan; events: LedgerEventMessage[] }>("/api/installments", input);
}

export function deleteInstallmentPlan(id: string) {
  return api.delete<{ ok: true }>(`/api/installments/${id}`);
}

export function payInstallment(paymentId: string) {
  return api.post<{ ok: true; events: LedgerEventMessage[] }>(`/api/installments/payments/${paymentId}/pay`);
}
