import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View className="w-[92%] bg-white rounded-2xl border border-[#E7E3D8] px-4 py-3.5 flex-row items-start">
      <View className="w-8 h-8 rounded-full bg-[#E7EFE9] items-center justify-center mr-3 mt-0.5">
        <Feather name="check" size={16} color="#1F4D3D" />
      </View>
      <View className="flex-1">
        <Text className="text-[#1B2420] font-semibold text-[15px]">
          {text1}
        </Text>
        {!!text2 && (
          <Text className="text-[#6B7268] text-[13px] mt-0.5">{text2}</Text>
        )}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View className="w-[92%] bg-white rounded-2xl border border-[#F0D9D7] px-4 py-3.5 flex-row items-start">
      <View className="w-8 h-8 rounded-full bg-[#FBEAE9] items-center justify-center mr-3 mt-0.5">
        <Feather name="alert-circle" size={16} color="#B3413B" />
      </View>
      <View className="flex-1">
        <Text className="text-[#1B2420] font-semibold text-[15px]">
          {text1}
        </Text>
        {!!text2 && (
          <Text className="text-[#6B7268] text-[13px] mt-0.5">{text2}</Text>
        )}
      </View>
    </View>
  ),
};
