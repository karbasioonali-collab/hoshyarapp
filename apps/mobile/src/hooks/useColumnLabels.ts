import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listColumnLabelOverrides, setColumnLabel } from "@/api/columnLabels";

/** نام ستون‌های هر جدول قابل‌تغییره (به‌جز ستون اول/ردیف) - این هوک نام فعلی + امکان تغییرش رو می‌ده */
export function useColumnLabels(tableKey: string, defaults: Record<string, string>) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["column-labels"],
    queryFn: listColumnLabelOverrides,
  });

  const overrides = (data?.overrides ?? []).filter((o) => o.tableKey === tableKey);

  function getLabel(columnKey: string): string {
    return overrides.find((o) => o.columnKey === columnKey)?.customLabel ?? defaults[columnKey] ?? columnKey;
  }

  const mutation = useMutation({
    mutationFn: (input: { columnKey: string; customLabel: string }) =>
      setColumnLabel(tableKey, input.columnKey, input.customLabel),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["column-labels"] }),
  });

  return { getLabel, setLabel: (columnKey: string, customLabel: string) => mutation.mutate({ columnKey, customLabel }) };
}
