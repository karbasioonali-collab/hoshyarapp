import React from "react";
import { CategoryBranchIndex } from "@/screens/CategoryBranchIndex";

export default function DaramadIndex() {
  return (
    <CategoryBranchIndex
      branch="INCOME"
      title="درآمد"
      chartTitle="مقایسه‌ی منابع درآمد"
      basePath="/hesab-o-ketab/daramad"
      pageContext="/hesab-o-ketab/daramad"
    />
  );
}
