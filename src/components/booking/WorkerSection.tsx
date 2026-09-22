import { COLORS } from "@/components/service/formFieldShared";
import type { BookingScheduleDetail } from "@/types/Booking";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SectionTitle } from "./SectionTitle";

type Worker = NonNullable<BookingScheduleDetail["worker"]>;

function WorkerCard({
  worker,
  assignmentId,
  scheduledStart,
}: {
  worker: Worker;
  assignmentId: number | null;
  scheduledStart: string;
}) {
  const fullName =
    `${worker.last_name ?? ""} ${worker.first_name ?? ""}`.trim() ||
    "Nhân viên";

  const content = (
    <View
      className="rounded-2xl p-4"
      style={{
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <View className="flex-row items-center">
        {worker.avatar ? (
          <Image
            source={{ uri: worker.avatar }}
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-emerald-100 items-center justify-center">
            <Feather name="user" size={24} color={COLORS.primary} />
          </View>
        )}

        <View className="flex-1 ml-3">
          <Text
            className="font-bold text-[15px] text-gray-900"
            numberOfLines={1}
          >
            {fullName}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Lịch {new Date(scheduledStart).toLocaleString("vi-VN")}
          </Text>
        </View>

        {!!assignmentId && (
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        )}
      </View>
    </View>
  );

  if (!assignmentId) {
    return content;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: "/worker/[id]",
          params: {
            id: String(worker.worker_id),
            data: JSON.stringify(worker),
            assignmentId: String(assignmentId),
          },
        });
      }}
    >
      {content}
    </TouchableOpacity>
  );
}

function NoWorkerCard() {
  return (
    <View
      className="rounded-2xl p-4 flex-row items-center"
      style={{
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
        <Feather name="user" size={21} color="#9CA3AF" />
      </View>

      <View className="flex-1">
        <Text className="font-semibold text-[14px] text-gray-700">
          Chưa có nhân viên
        </Text>
        <Text className="text-[12px] text-gray-500 mt-1">
          Đơn hàng đang chờ nhân viên nhận việc.
        </Text>
      </View>
    </View>
  );
}

export function WorkerSection({
  schedules,
}: {
  schedules: BookingScheduleDetail[];
}) {
  return (
    <View className="mb-5">
      <SectionTitle icon="user">Nhân viên thực hiện</SectionTitle>
      {schedules.length ? schedules.map((schedule) => (
        schedule.worker ? (
          <View key={schedule.id} className="mb-2">
            <WorkerCard worker={schedule.worker} assignmentId={schedule.assignment_id} scheduledStart={schedule.scheduled_start} />
          </View>
        ) : (
          <View key={schedule.id} className="mb-2"><NoWorkerCard /></View>
        )
      )) : (
        <NoWorkerCard />
      )}
    </View>
  );
}
