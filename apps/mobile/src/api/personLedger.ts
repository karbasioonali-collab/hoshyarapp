import type { PersonDirection } from "@hoshyar/shared";
import { api } from "./client";
import type { LedgerEventMessage, PersonLedgerEntry } from "./types";

export function listPersonLedgerEntries(direction: PersonDirection) {
  return api.get<{ entries: PersonLedgerEntry[] }>(`/api/person-ledger?direction=${direction}`);
}

export interface PersonLedgerInput {
  direction: PersonDirection;
  description: string;
  personName: string;
  amount: number;
  dueMonth: number;
  dueDay: number;
  bankAccountId?: string | null;
}

export function createPersonLedgerEntry(input: PersonLedgerInput) {
  return api.post<{ entry: PersonLedgerEntry }>("/api/person-ledger", input);
}

export function updatePersonLedgerEntry(id: string, input: Partial<PersonLedgerInput>) {
  return api.patch<{ entry: PersonLedgerEntry }>(`/api/person-ledger/${id}`, input);
}

export function deletePersonLedgerEntry(id: string) {
  return api.delete<{ ok: true }>(`/api/person-ledger/${id}`);
}

export function settlePersonLedgerEntry(id: string) {
  return api.post<{ ok: true; events: LedgerEventMessage[] }>(`/api/person-ledger/${id}/settle`);
}
