import React from "react";
import { PersonLedgerScreen } from "@/screens/PersonLedgerScreen";

export default function BedehiScreen() {
  return (
    <PersonLedgerScreen
      direction="DEBT"
      title="بدهی به اشخاص"
      pageContext="/hesab-o-ketab/bedehi"
      tableKey="debts"
      monthColumnLabel="ماه پرداخت"
      dayColumnLabel="روز پرداخت"
    />
  );
}
