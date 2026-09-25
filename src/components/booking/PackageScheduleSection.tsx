import type { BookingScheduleDetail } from "@/types/Booking";
import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { ScheduleItemCard } from "./ScheduleItemCard";
import { SectionTitle } from "./SectionTitle";

const ITEM_HEIGHT = 230;
const VISIBLE_ITEMS = 4;

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

export function PackageScheduleSection({
  schedules,
}: {
  schedules: BookingScheduleDetail[];
}) {
  const displaySchedule = useMemo(
    () => pickUpcomingSchedule(schedules),
    [schedules],
  );

  if (!schedules.length) return null;

  const openDetail = (schedule: BookingScheduleDetail) => {
    router.push({
      pathname: "/booking/schedule/[id]",
      params: {
        id: String(schedule.id),
        data: JSON.stringify(schedule),
      },
    });
  };

  const restSchedules = schedules.filter((s) => s.id !== displaySchedule?.id);
  const needsScroll = restSchedules.length > VISIBLE_ITEMS;

  const listItems = restSchedules.map((schedule) => (
    <View key={schedule.id} className="mb-3">
      <ScheduleItemCard schedule={schedule} onPress={openDetail} />
    </View>
  ));

  return (
    <View className="mb-5">
      <SectionTitle icon="user">Buổi làm việc sắp tới</SectionTitle>

      {displaySchedule && (
        <ScheduleItemCard schedule={displaySchedule} onPress={openDetail} />
      )}

      {restSchedules.length > 0 &&
        (needsScroll ? (
          <ScrollView
            className="mt-3"
            style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {listItems}
          </ScrollView>
        ) : (
          <View className="mt-3">{listItems}</View>
        ))}
    </View>
  );
}
