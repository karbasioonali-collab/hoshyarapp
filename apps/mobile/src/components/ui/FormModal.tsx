import React from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Button } from "./Button";

interface FormModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitting?: boolean;
  children: React.ReactNode;
}

export function FormModal({ visible, title, onClose, onSubmit, submitLabel = "ثبت", submitting, children }: FormModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(10,26,63,0.4)" }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View className="bg-white rounded-t-3xl p-5 max-h-[85%]">
            <View className="flex-row-reverse items-center justify-between mb-4">
              <Text className="text-navy font-bold text-lg">{title}</Text>
              <Pressable onPress={onClose}>
                <Text className="text-navy text-xl">×</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {children}
              <Button title={submitLabel} onPress={onSubmit} loading={submitting} className="mt-2 mb-4" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function FormLabel({ text }: { text: string }) {
  return <Text className="text-xs text-navy mb-1 text-right">{text}</Text>;
}
