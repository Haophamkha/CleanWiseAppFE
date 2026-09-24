import type { BookingScheduleDetail } from "@/types/Booking";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScheduleItemCard } from "./ScheduleItemCard";
import { SectionTitle } from "./SectionTitle";

function pickUpcomingSchedule(schedules: BookingScheduleDetail[]) {
  const now = Date.now();

  const upcoming = schedules.find(
    (s) =>
      new Date(s.scheduled_start).getTime() >= now &&
      s.status !== "CANCELLED" &&
      s.status !== "COMPLETED",
  );

  return upcoming ?? schedules[0];
}

export function WorkerSection({
  schedules,
}: {
  schedules: BookingScheduleDetail[];
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const displaySchedule = useMemo(
    () => pickUpcomingSchedule(schedules),
    [schedules],
  );

  if (!schedules.length) {
    return null;
  }

  const isMultiple = schedules.length > 1;

  return (
    <View className="mb-5">
      <SectionTitle icon="user">
        {isMultiple ? "Buổi làm việc sắp tới" : "Buổi làm việc"}
      </SectionTitle>

      {displaySchedule && <ScheduleItemCard schedule={displaySchedule} />}

      {isMultiple && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
          className="flex-row items-center justify-center mt-3 py-3 rounded-2xl"
          style={{ backgroundColor: "#F0FDF4" }}
        >
          <Text className="font-bold text-[14px]" style={{ color: "#047857" }}>
            Xem tất cả {schedules.length} buổi
          </Text>
          <Feather
            name="chevron-right"
            size={16}
            color="#047857"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(17,24,39,0.45)" }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                maxHeight: "80%",
                paddingBottom: 28,
              }}
            >
              <View className="items-center pt-3 pb-1">
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "#E5E7EB",
                  }}
                />
              </View>

              <View className="flex-row items-center justify-between px-5 py-3">
                <Text className="text-[16px] font-bold text-gray-900">
                  Tất cả {schedules.length} buổi
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Feather name="x" size={22} color="#111827" />
                </TouchableOpacity>
              </View>

              <ScrollView
                className="px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                {schedules.map((schedule) => (
                  <View key={schedule.id} className="mb-3">
                    <ScheduleItemCard schedule={schedule} />
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
