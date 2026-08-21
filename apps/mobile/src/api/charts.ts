import type { CategoryBranch } from "@hoshyar/shared";
import { api } from "./client";

export interface BranchSummary {
  jalaliMonth: { jy: number; jm: number };
  branches: Record<CategoryBranch, number>;
}

export function fetchSummaryChart() {
  return api.get<BranchSummary>("/api/charts/summary");
}

export interface BranchChartItem {
  categoryId: string;
  name: string;
  total: number;
}

export function fetchBranchChart(branch: CategoryBranch, months = 3, parentId?: string | null) {
  const query = new URLSearchParams({ branch, months: String(months) });
  if (parentId) query.set("parentId", parentId);
  return api.get<{ items: BranchChartItem[] }>(`/api/charts/branch?${query.toString()}`);
}

export interface CategoryChartPoint {
  jy: number;
  jm: number;
  total: number;
}

export function fetchCategoryChart(categoryId: string, months = 6) {
  return api.get<{ points: CategoryChartPoint[] }>(
    `/api/charts/category?categoryId=${categoryId}&months=${months}`,
  );
}
