// src/components/service/TaskChecklist.tsx
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "./formFieldShared";

type Props = {
  content?: string;
};

export function TaskChecklist({ content }: Props) {
  const [visible, setVisible] = useState(false);

  if (!content) return null;

  const tasks = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (tasks.length === 0) return null;

  return (
    <>
      {/* Hàng gọn hiển thị ban đầu */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        className="flex-row items-center rounded-2xl px-4 py-3.5 mb-6"
        style={{
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <View
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: COLORS.primaryLight }}
        >
          <Feather name="list" size={16} color={COLORS.primary} />
        </View>
        <Text
          className="flex-1 text-[15px] font-semibold"
          style={{ color: COLORS.text }}
        >
          Chi tiết công việc
        </Text>
        <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* Modal bottom-sheet che nửa màn hình */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: "rgba(17,24,39,0.45)" }}
          onPress={() => setVisible(false)}
        >
          <View className="flex-1" />
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: "70%",
            }}
          >
            {/* Drag handle */}
            <View className="items-center pt-3 pb-2">
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.border,
                }}
              />
            </View>

            <Text
              className="text-center text-[20px] font-bold px-6 pt-2 pb-5"
              style={{ color: COLORS.text }}
            >
              Chi tiết công việc
            </Text>

            <ScrollView
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <View
                className="rounded-2xl px-4"
                style={{ borderWidth: 1, borderColor: COLORS.border }}
              >
                {tasks.map((task, index) => (
                  <View
                    key={index}
                    className="flex-row items-start py-3.5"
                    style={{
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: COLORS.background,
                    }}
                  >
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: "#FFF7ED" }}
                    >
                      <Feather name="star" size={14} color="#F59E0B" />
                    </View>
                    <Text
                      className="flex-1 text-[14px] leading-5 mt-0.5"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {task}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View className="px-5 pt-4" style={{ paddingBottom: 28 }}>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                activeOpacity={0.8}
                className="items-center py-4 rounded-2xl"
                style={{ backgroundColor: COLORS.background }}
              >
                <Text
                  className="font-semibold text-[15px]"
                  style={{ color: COLORS.primary }}
                >
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
