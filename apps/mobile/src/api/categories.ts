import type { CategoryBranch } from "@hoshyar/shared";
import { api } from "./client";
import type { Category } from "./types";

export function listCategories(branch: CategoryBranch, parentId: string | null) {
  const query = new URLSearchParams({ branch, ...(parentId ? { parentId } : {}) });
  return api.get<{ categories: Category[] }>(`/api/categories?${query.toString()}`);
}

export function createCategory(input: { branch: CategoryBranch; parentId?: string | null; name: string }) {
  return api.post<{ category: Category }>("/api/categories", input);
}

export function renameCategory(id: string, name: string) {
  return api.patch<{ category: Category }>(`/api/categories/${id}`, { name });
}

export function deleteCategory(id: string) {
  return api.delete<{ ok: true }>(`/api/categories/${id}`);
}
