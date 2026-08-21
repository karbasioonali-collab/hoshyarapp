import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { colors } from "@/theme/colors";

export interface BoxItem {
  id: string;
  label: string;
}

interface BoxGridProps {
  items: BoxItem[];
  onPressItem: (item: BoxItem) => void;
  /** آخرین باکس همیشه خالیه؛ کاربر روش اسم می‌ذاره و دسته‌بندی دلخواه جدید اضافه می‌کنه */
  onAddNew?: (name: string) => void;
}

export function BoxGrid({ items, onPressItem, onAddNew }: BoxGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onPressItem(item)}
          className="basis-[31%] grow aspect-square rounded-card bg-white items-center justify-center px-2 shadow-sm border border-navy/5"
        >
          <Text className="text-navy text-center font-semibold">{item.label}</Text>
        </Pressable>
      ))}
      {onAddNew && <AddBox onAddNew={onAddNew} />}
    </View>
  );
}

function AddBox({ onAddNew }: { onAddNew: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (trimmed) onAddNew(trimmed);
    setValue("");
    setEditing(false);
  }

  if (editing) {
    return (
      <View className="basis-[31%] grow aspect-square rounded-card bg-white items-center justify-center px-2 border-2 border-dashed border-turquoise-dark">
        <TextInput
          autoFocus
          value={value}
          onChangeText={setValue}
          onSubmitEditing={submit}
          onBlur={submit}
          placeholder="اسم دسته"
          className="text-navy text-center"
          style={{ writingDirection: "rtl" }}
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => setEditing(true)}
      className="basis-[31%] grow aspect-square rounded-card bg-white items-center justify-center border-2 border-dashed border-navy/15"
    >
      <Text style={{ fontSize: 28, color: colors.turquoiseDark }}>+</Text>
      <Text className="text-xs mt-1" style={{ color: "#94a3b8" }}>
        افزودن جدید
      </Text>
    </Pressable>
  );
}
