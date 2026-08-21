import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { colors } from "@/theme/colors";

interface ToastItem {
  id: number;
  text: string;
}

interface ToastContextValue {
  /** یک یا چند جمله رو پشت‌سرهم به کاربر نشون می‌ده (برای توضیح تغییرات پشت‌صحنه) */
  showMessages: (messages: string[]) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (text: string, isError = false) => {
      const id = idCounter++;
      setToasts((prev) => [...prev, { id, text: isError ? `⚠️ ${text}` : text }]);
      timers.current[id] = setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const showMessages = useCallback((messages: string[]) => messages.forEach((m) => push(m)), [push]);
  const showError = useCallback((message: string) => push(message, true), [push]);

  return (
    <ToastContext.Provider value={{ showMessages, showError }}>
      {children}
      <View pointerEvents="none" className="absolute bottom-10 left-4 right-4 items-center gap-2">
        {toasts.map((toast) => (
          <ToastBubble key={toast.id} text={toast.text} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastBubble({ text }: { text: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity, backgroundColor: colors.navy }}
      className="rounded-2xl px-4 py-3 shadow-md max-w-full"
    >
      <Text className="text-white text-center" style={{ writingDirection: "rtl" }}>
        {text}
      </Text>
    </Animated.View>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast باید داخل ToastProvider استفاده بشه");
  return ctx;
}
