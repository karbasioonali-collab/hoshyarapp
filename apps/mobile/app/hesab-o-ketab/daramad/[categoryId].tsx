import React from "react";
import { useLocalSearchParams } from "expo-router";
import { CategoryDetail } from "@/screens/CategoryDetail";

export default function DaramadCategoryDetail() {
  const { categoryId, name } = useLocalSearchParams<{ categoryId: string; name?: string }>();
  return (
    <CategoryDetail
      branch="INCOME"
      categoryId={categoryId}
      fallbackName={name ?? "درآمد"}
      basePath="/hesab-o-ketab/daramad"
      pageContext={`/hesab-o-ketab/daramad/${categoryId}`}
    />
  );
}
