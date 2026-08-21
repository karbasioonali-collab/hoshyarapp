import React from "react";
import { CategoryBranchIndex } from "@/screens/CategoryBranchIndex";

export default function HazineIndex() {
  return (
    <CategoryBranchIndex
      branch="EXPENSE"
      title="هزینه‌های جاری"
      chartTitle="مقایسه‌ی هزینه‌ها"
      basePath="/hesab-o-ketab/hazine"
      pageContext="/hesab-o-ketab/hazine"
    />
  );
}
