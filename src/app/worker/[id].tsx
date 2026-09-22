import { COLORS } from "@/components/service/formFieldShared";
import type { BookingScheduleDetail } from "@/types/Booking";
import { useLazyGetAssignmentConversationQuery } from "@/services/chatApi";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type WorkerProfile = NonNullable<BookingScheduleDetail["worker"]> & {
  total_completed_jobs?: number;
  work_area?: string;
  skills?: string[];
};

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      className="flex-1 flex-row items-center rounded-2xl px-3.5 py-3.5"
      style={{
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#EEF0F2",
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: "#EAF9EE" }}
      >
        <Feather name={icon} size={18} color={COLORS.primary} />
      </View>
      <View className="flex-1">
        <Text
          className="text-[16px] font-extrabold text-gray-900"
          numberOfLines={1}
        >
          {value}
        </Text>
        <Text className="text-[11px] text-gray-500 mt-0.5" numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

export default function WorkerProfileScreen() {
  const { data, assignmentId } = useLocalSearchParams<{ id: string; data?: string; assignmentId?: string }>();
  const insets = useSafeAreaInsets();
  const [getChat, { isFetching: openingChat }] = useLazyGetAssignmentConversationQuery();

  const openChat = async () => {
    const selectedAssignment = Number(assignmentId);
    if (!Number.isInteger(selectedAssignment) || selectedAssignment <= 0) {
      Alert.alert("Chưa thể nhắn tin", "Hãy mở hồ sơ từ lịch đã được phân công.");
      return;
    }
    try {
      const result = await getChat(selectedAssignment).unwrap();
      router.push({
        pathname: "/messages/[id]",
        params: { id: String(result.conversation.id), assignmentId: String(selectedAssignment) },
      });
    } catch {
      Alert.alert("Không mở được trò chuyện", "Vui lòng kiểm tra lịch phân công và thử lại.");
    }
  };

  let worker: WorkerProfile | null = null;
  try {
    worker = data ? (JSON.parse(data) as WorkerProfile) : null;
  } catch {
    worker = null;
  }

  const [liked, setLiked] = useState(false);

  if (!worker) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Feather name="alert-circle" size={36} color="#DC2626" />
        <Text className="text-gray-900 font-semibold mt-4">
          Không tìm thấy thông tin nhân viên
        </Text>

        <TouchableOpacity
          className="mt-5 bg-emerald-700 rounded-xl px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fullName =
    `${worker.first_name ?? ""} ${worker.last_name ?? ""}`.trim() ||
    "Nhân viên";
  const rating = Number(worker.average_rating ?? 0);
  const experienceYears = worker.experience_years ?? 0;
  const completedJobs = worker.total_completed_jobs ?? 0;
  const hasRating = completedJobs > 0 && rating > 0;

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      >
        <View style={{ height: 190 + insets.top, overflow: "hidden" }}>
          <View style={{ position: "absolute", inset: 0, backgroundColor: "#0D9B69" }} />
          <View
            style={{
              position: "absolute",
              width: 240,
              height: 240,
              borderRadius: 120,
              backgroundColor: "#FFFFFF",
              opacity: 0.08,
              top: -120,
              right: -70,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 170,
              height: 170,
              borderRadius: 85,
              backgroundColor: "#FFFFFF",
              opacity: 0.08,
              bottom: -100,
              left: -50,
            }}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            className="w-9 h-9 rounded-full items-center justify-center ml-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
              marginTop: insets.top + 12,
            }}
          >
            <Feather name="arrow-left" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View className="items-center" style={{ marginTop: -56 }}>
          {worker.avatar ? (
            <Image
              source={{ uri: worker.avatar }}
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                borderWidth: 4,
                borderColor: "#FFFFFF",
              }}
            />
          ) : (
            <View
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                borderWidth: 4,
                borderColor: "#FFFFFF",
                backgroundColor: "#D1FAE5",
              }}
              className="items-center justify-center"
            >
              <Feather name="user" size={40} color={COLORS.primary} />
            </View>
          )}

          <Text className="text-[21px] font-extrabold text-gray-900 mt-3">
            {fullName}
          </Text>

          <View
            className="flex-row items-center px-3.5 py-1.5 rounded-full mt-2"
            style={{ backgroundColor: "#EAF9EE" }}
          >
            <Feather name="star" size={14} color={COLORS.primary} />
            <Text
              className="text-[13.5px] font-bold ml-1.5"
              style={{ color: COLORS.primary }}
            >
              {hasRating ? rating.toFixed(1) : "Chưa có đánh giá"}
            </Text>
            {hasRating && (
              <Text
                className="text-[12.5px] ml-1"
                style={{ color: COLORS.primary, opacity: 0.75 }}
              >
                ({completedJobs} đơn)
              </Text>
            )}
          </View>
        </View>

        <View className="px-5">
          <View className="flex-row mt-6" style={{ gap: 10 }}>
            <StatCard
              icon="check-circle"
              label="Đã hoàn thành"
              value={`${completedJobs} đơn`}
            />
            <StatCard
              icon="briefcase"
              label="Kinh nghiệm"
              value={`${experienceYears} năm`}
            />
          </View>

          {/* Khu vực hoạt động — chỉ hiện khi API có dữ liệu */}
          {!!worker.work_area && (
            <View className="flex-row items-start mt-6">
              <Feather
                name="map-pin"
                size={17}
                color={COLORS.primary}
                style={{ marginTop: 2 }}
              />
              <View className="ml-2.5">
                <Text className="text-[14px] font-bold text-gray-900">
                  Khu vực hoạt động
                </Text>
                <Text className="text-[13px] text-gray-500 mt-0.5">
                  {worker.work_area}
                </Text>
              </View>
            </View>
          )}

          {!!worker.skills?.length && (
            <View className="mt-6">
              <View className="flex-row items-center mb-2.5">
                <Feather name="tool" size={17} color={COLORS.primary} />
                <Text className="text-[14px] font-bold text-gray-900 ml-2.5">
                  Kỹ năng chuyên môn
                </Text>
              </View>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {worker.skills.map((skill) => (
                  <View
                    key={skill}
                    className="px-3.5 py-1.5 rounded-full"
                    style={{ backgroundColor: "#065F46" }}
                  >
                    <Text className="text-[12.5px] font-semibold text-white">
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Giới thiệu */}
          {!!worker.bio?.trim() && (
            <View className="mt-6">
              <Text className="text-[14px] font-bold text-gray-900 mb-1.5">
                Giới thiệu
              </Text>
              <Text className="text-[13.5px] leading-5 text-gray-500">
                {worker.bio}
              </Text>
            </View>
          )}

          <View className="flex-row mt-7" style={{ gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={{ flex: 8, backgroundColor: COLORS.primary }}
              className="rounded-2xl py-3.5 flex-row items-center justify-center"
              onPress={openChat}
              disabled={openingChat}
            >
              {openingChat ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Feather name="message-circle" size={17} color="#FFFFFF" />}
              <Text className="font-bold text-[14.5px] text-white ml-2">
                Nhắn tin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                flex: 2,
                backgroundColor: liked ? "#E11D48" : "#FFFFFF",
                borderWidth: liked ? 0 : 1.5,
                borderColor: "#E5E7EB",
              }}
              className="rounded-2xl py-3.5 items-center justify-center"
              onPress={() => {
                setLiked((prev) => !prev);
              }}
            >
              <Feather
                name="heart"
                size={18}
                color={liked ? "#FFFFFF" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
