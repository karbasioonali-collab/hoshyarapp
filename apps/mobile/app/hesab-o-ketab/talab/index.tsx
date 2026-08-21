import React from "react";
import { PersonLedgerScreen } from "@/screens/PersonLedgerScreen";

export default function TalabScreen() {
  return (
    <PersonLedgerScreen
      direction="RECEIVABLE"
      title="طلب از اشخاص"
      pageContext="/hesab-o-ketab/talab"
      tableKey="receivables"
      monthColumnLabel="ماه دریافت"
      dayColumnLabel="روز دریافت"
    />
  );
}
