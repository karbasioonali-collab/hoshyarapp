import React from "react";
import { useLocalSearchParams } from "expo-router";
import { CategoryDetail } from "@/screens/CategoryDetail";

export default function HazineCategoryDetail() {
  const { categoryId, name } = useLocalSearchParams<{ categoryId: string; name?: string }>();
  return (
    <CategoryDetail
      branch="EXPENSE"
      categoryId={categoryId}
      fallbackName={name ?? "هزینه"}
      basePath="/hesab-o-ketab/hazine"
      pageContext={`/hesab-o-ketab/hazine/${categoryId}`}
    />
  );
}
