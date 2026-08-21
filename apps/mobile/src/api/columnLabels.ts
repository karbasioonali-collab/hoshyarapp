import { api } from "./client";

export interface ColumnLabelOverride {
  id: string;
  tableKey: string;
  columnKey: string;
  customLabel: string;
}

export function listColumnLabelOverrides() {
  return api.get<{ overrides: ColumnLabelOverride[] }>("/api/column-labels");
}

export function setColumnLabel(tableKey: string, columnKey: string, customLabel: string) {
  return api.post<{ override: ColumnLabelOverride }>("/api/column-labels", { tableKey, columnKey, customLabel });
}

export function resetColumnLabel(overrideId: string) {
  return api.delete<{ ok: true }>(`/api/column-labels/${overrideId}`);
}
