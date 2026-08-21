import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { VoiceMicButton } from "./VoiceMicButton";
import { EditIcon, PlusIcon, TrashIcon } from "./Icons";
import { useColumnLabels } from "@/hooks/useColumnLabels";

export interface RecordColumn<T> {
  key: string;
  defaultLabel: string;
  render: (row: T) => React.ReactNode;
  width?: number;
}

interface RecordTableProps<T extends { id: string }> {
  title: string;
  tableKey: string;
  columns: RecordColumn<T>[];
  rows: T[];
  pageContext: string;
  onAddPress?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  renderExtraAction?: (row: T) => React.ReactNode;
  emptyText?: string;
}

/** جدول عمومی هوشیار: ستون اول (ردیف) ثابت، بقیه قابل‌تغییرنام؛ افزودن سمت راست، میکروفون سمت چپ */
export function RecordTable<T extends { id: string }>({
  title,
  tableKey,
  columns,
  rows,
  pageContext,
  onAddPress,
  onEdit,
  onDelete,
  renderExtraAction,
  emptyText,
}: RecordTableProps<T>) {
  const defaults = Object.fromEntries(columns.map((c) => [c.key, c.defaultLabel]));
  const { getLabel, setLabel } = useColumnLabels(tableKey, defaults);

  return (
    <Card>
      <View className="flex-row-reverse items-center justify-between mb-3">
        <Text className="text-navy font-bold text-base">{title}</Text>
        <View className="flex-row-reverse items-center gap-2">
          {onAddPress && (
            <Pressable onPress={onAddPress} className="w-9 h-9 rounded-full bg-turquoise/15 items-center justify-center">
              <PlusIcon />
            </Pressable>
          )}
          <VoiceMicButton pageContext={pageContext} size={36} />
        </View>
      </View>

      {rows.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View className="flex-row-reverse border-b border-border pb-2 mb-1">
              <HeaderCell width={40} text="ردیف" />
              {columns.map((col) => (
                <EditableHeaderCell
                  key={col.key}
                  width={col.width ?? 110}
                  text={getLabel(col.key)}
                  onRename={(next) => setLabel(col.key, next)}
                />
              ))}
              {(onEdit || onDelete || renderExtraAction) && <HeaderCell width={110} text="عملیات" />}
            </View>
            {rows.map((row, index) => (
              <View key={row.id} className="flex-row-reverse items-center py-2.5 border-b border-border/60">
                <Cell width={40}>
                  <Text className="text-navy text-center">{index + 1}</Text>
                </Cell>
                {columns.map((col) => (
                  <Cell key={col.key} width={col.width ?? 110}>
                    {col.render(row)}
                  </Cell>
                ))}
                {(onEdit || onDelete || renderExtraAction) && (
                  <Cell width={110}>
                    <View className="flex-row items-center gap-3 justify-center">
                      {renderExtraAction?.(row)}
                      {onEdit && (
                        <Pressable onPress={() => onEdit(row)}>
                          <EditIcon />
                        </Pressable>
                      )}
                      {onDelete && (
                        <Pressable onPress={() => onDelete(row)}>
                          <TrashIcon />
                        </Pressable>
                      )}
                    </View>
                  </Cell>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </Card>
  );
}

function HeaderCell({ width, text }: { width: number; text: string }) {
  return (
    <View style={{ width }} className="px-1">
      <Text className="text-xs font-semibold text-navy text-center">{text}</Text>
    </View>
  );
}

function Cell({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <View style={{ width }} className="px-1 items-center justify-center">
      {children}
    </View>
  );
}

function EditableHeaderCell({ width, text, onRename }: { width: number; text: string; onRename: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  function submit() {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== text) onRename(trimmed);
  }

  if (editing) {
    return (
      <View style={{ width }} className="px-1">
        <TextInput
          autoFocus
          value={value}
          onChangeText={setValue}
          onSubmitEditing={submit}
          onBlur={submit}
          className="text-xs text-center text-navy border-b border-turquoise-dark"
          style={{ writingDirection: "rtl" }}
        />
      </View>
    );
  }

  return (
    <Pressable style={{ width }} className="px-1" onPress={() => setEditing(true)} onLongPress={() => setEditing(true)}>
      <Text className="text-xs font-semibold text-navy text-center">{text}</Text>
    </Pressable>
  );
}
