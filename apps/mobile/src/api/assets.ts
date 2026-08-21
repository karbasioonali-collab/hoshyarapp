import { api } from "./client";
import type { Asset } from "./types";

export function listAssets() {
  return api.get<{ assets: Asset[] }>("/api/assets");
}

export function createAsset(input: { description: string; amount: string; unit: string }) {
  return api.post<{ asset: Asset }>("/api/assets", input);
}

export function updateAsset(id: string, input: Partial<{ description: string; amount: string; unit: string }>) {
  return api.patch<{ asset: Asset }>(`/api/assets/${id}`, input);
}

export function deleteAsset(id: string) {
  return api.delete<{ ok: true }>(`/api/assets/${id}`);
}
