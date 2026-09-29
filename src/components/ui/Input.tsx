import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

export type FeatherName = React.ComponentProps<typeof Feather>["name"];

export type InputProps = TextInputProps & {
  label?: string;
  labelRight?: ReactNode;
  required?: boolean;
  icon?: FeatherName;
  right?: ReactNode;
  invalid?: boolean;
};

export function Input({
  label,
  labelRight,
  required,
  icon,
  right,
  invalid,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const border = invalid
    ? "border-danger bg-danger-light"
    : focused
      ? "border-primary bg-surface"
      : "border-line bg-canvas";

  return (
    <View className="mb-4">
      {(label || labelRight) && (
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-ink">
            {label}
            {required && <Text className="text-danger"> *</Text>}
          </Text>
          {labelRight}
        </View>
      )}
      <View
        className={`flex-row items-center border rounded-xl px-4 py-3.5 ${border}`}
      >
        {icon && (
          <Feather
            name={icon}
            size={17}
            color={focused ? COLORS.primary : COLORS.inkMuted}
          />
        )}
        <TextInput
          className={`flex-1 text-base text-ink ${icon ? "ml-3" : ""}`}
          placeholderTextColor={COLORS.inkMuted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {right}
      </View>
    </View>
  );
}

export function PasswordInput(
  props: Omit<InputProps, "secureTextEntry" | "right">,
) {
  const [show, setShow] = useState(false);
  return (
    <Input
      icon="lock"
      autoCapitalize="none"
      {...props}
      secureTextEntry={!show}
      right={
        <TouchableOpacity onPress={() => setShow((v) => !v)} hitSlop={8}>
          <Feather
            name={show ? "eye" : "eye-off"}
            size={17}
            color={COLORS.inkMuted}
          />
        </TouchableOpacity>
      }
    />
  );
}
