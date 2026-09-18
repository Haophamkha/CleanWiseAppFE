import React from "react";
import { KeyboardAvoidingView, Platform, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Hoặc từ "react-native" nếu không dùng package ngoài

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenContainer({
  children,
  style,
}: ScreenContainerProps) {
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#fff" }, style]}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
