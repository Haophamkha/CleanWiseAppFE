import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import {
  useGetFavoriteWorkersQuery,
  useRemoveFavoriteWorkerMutation,
} from "@/services/favoriteWorkerApi";
import { useAppSelector } from "@/store/hooks";
import type { FavoriteWorker } from "@/types/FavoriteWorker";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY = "#047857";

function WorkerCard({
  worker,
  removing,
  onRemove,
}: {
  worker: FavoriteWorker;
  removing: boolean;
  onRemove: () => void;
}) {
  const fullName =
    `${worker.last_name ?? ""} ${worker.first_name ?? ""}`.trim() ||
    "Nhân viên";
  const rating = Number(worker.average_rating ?? 0);
  const hasRating = worker.total_completed_jobs > 0 && rating > 0;

  const openProfile = () => {
    router.push({
      pathname: "/worker/[id]",
      params: {
        id: String(worker.worker_id),
        data: JSON.stringify(worker),
      },
    });
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-3xl border border-gray-100 p-4 mb-3"
      style={{
        shadowColor: "#0F172A",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
      activeOpacity={0.82}
      onPress={openProfile}
    >
      <View className="flex-row items-start">
        {worker.avatar ? (
          <Image
            source={{ uri: worker.avatar }}
            className="w-[68px] h-[68px] rounded-2xl bg-emerald-50"
          />
        ) : (
          <View className="w-[68px] h-[68px] rounded-2xl bg-emerald-50 items-center justify-center">
            <Feather name="user" size={26} color={PRIMARY} />
          </View>
        )}

        <View className="flex-1 ml-3.5">
          <View className="flex-row items-start">
            <View className="flex-1 pr-2">
              <Text className="text-[16px] font-extrabold text-gray-900" numberOfLines={1}>
                {fullName}
              </Text>
              <View className="flex-row items-center mt-1.5">
                <Feather name="star" size={13} color="#F59E0B" />
                <Text className="text-[12.5px] font-bold text-gray-700 ml-1">
                  {hasRating ? rating.toFixed(1) : "Chưa có đánh giá"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-rose-50 items-center justify-center"
              hitSlop={8}
              activeOpacity={0.75}
              disabled={removing}
              onPress={(event) => {
                event.stopPropagation();
                onRemove();
              }}
            >
              {removing ? (
                <ActivityIndicator size="small" color="#E11D48" />
              ) : (
                <Feather name="heart" size={18} color="#E11D48" />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mt-3">
            <View className="flex-row items-center mr-4">
              <Feather name="briefcase" size={13} color="#64748B" />
              <Text className="text-xs text-gray-500 ml-1.5">
                {worker.experience_years} năm
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="check-circle" size={13} color="#64748B" />
              <Text className="text-xs text-gray-500 ml-1.5">
                {worker.total_completed_jobs} đơn
              </Text>
            </View>
          </View>
        </View>
      </View>

      {!!worker.bio?.trim() && (
        <Text className="text-[12.5px] leading-5 text-gray-500 mt-3" numberOfLines={2}>
          {worker.bio}
        </Text>
      )}

      <View className="flex-row items-center justify-end mt-3 pt-3 border-t border-gray-100">
        <Text className="text-xs font-bold text-emerald-700 mr-1">
          Xem hồ sơ
        </Text>
        <Feather name="chevron-right" size={15} color={PRIMARY} />
      </View>
    </TouchableOpacity>
  );
}

export default function FavoriteWorkersScreen() {
  const isAuthenticated = !!useAppSelector((state) => state.auth.user);
  const [page, setPage] = useState(1);
  const [workers, setWorkers] = useState<FavoriteWorker[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { data, isLoading, isFetching, isError, refetch } =
    useGetFavoriteWorkersQuery(
      { page, page_size: 20 },
      { skip: !isAuthenticated },
    );
  const [removeFavorite] = useRemoveFavoriteWorkerMutation();

  useEffect(() => {
    if (!data) return;
    setWorkers((current) => {
      const merged = page === 1 ? [] : [...current];
      for (const worker of data.results) {
        const index = merged.findIndex(
          (item) => item.worker_id === worker.worker_id,
        );
        if (index >= 0) merged[index] = worker;
        else merged.push(worker);
      }
      return merged;
    });
  }, [data, page]);

  const handleRefresh = () => {
    setWorkers([]);
    if (page === 1) void refetch();
    else setPage(1);
  };

  const handleLoadMore = () => {
    if (data?.has_next && !isFetching) setPage((value) => value + 1);
  };

  const handleRemove = async (worker: FavoriteWorker) => {
    setRemovingId(worker.worker_id);
    try {
      await removeFavorite(worker.worker_id).unwrap();
      setWorkers((current) =>
        current.filter((item) => item.worker_id !== worker.worker_id),
      );
      showSuccessToast(
        "Đã bỏ yêu thích",
        `${worker.last_name} ${worker.first_name}`.trim(),
      );
    } catch (error: any) {
      showErrorToast(
        "Không thể bỏ yêu thích",
        error?.data?.message ?? "Vui lòng thử lại sau.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full bg-gray-50"
        >
          <Feather name="arrow-left" size={21} color="#111827" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900">
            Nhân viên yêu thích
          </Text>
          <Text className="text-[11px] text-gray-400 mt-0.5">
            Những người bạn tin tưởng
          </Text>
        </View>
        <View className="w-9" />
      </View>

      {!isAuthenticated ? (
        <View className="px-5 pt-5">
          <RequireLoginNotice message="Đăng nhập để xem danh sách nhân viên yêu thích" />
        </View>
      ) : isLoading && page === 1 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text className="text-sm text-gray-400 mt-3">
            Đang tải danh sách...
          </Text>
        </View>
      ) : isError && workers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
            <Feather name="wifi-off" size={28} color="#DC2626" />
          </View>
          <Text className="text-gray-900 font-bold text-base mt-4">
            Không tải được danh sách
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            Kiểm tra kết nối mạng và thử lại nhé.
          </Text>
          <TouchableOpacity
            className="bg-emerald-700 rounded-xl px-6 py-3 mt-5"
            onPress={() => refetch()}
          >
            <Text className="text-white font-bold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item) => String(item.worker_id)}
          contentContainerStyle={{ padding: 20, paddingBottom: 48, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshing={isFetching && page === 1}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            workers.length > 0 ? (
              <View className="bg-emerald-700 rounded-3xl p-5 mb-5 overflow-hidden">
                <View className="absolute w-28 h-28 rounded-full bg-white/10 -right-8 -top-10" />
                <View className="flex-row items-center">
                  <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
                    <Feather name="heart" size={21} color="#FFFFFF" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-white text-[17px] font-extrabold">
                      {data?.count ?? workers.length} nhân viên
                    </Text>
                    <Text className="text-emerald-100 text-xs mt-1">
                      Chạm vào thẻ để xem lại hồ sơ chi tiết
                    </Text>
                  </View>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <WorkerCard
              worker={item}
              removing={removingId === item.worker_id}
              onRemove={() => handleRemove(item)}
            />
          )}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <ActivityIndicator className="py-4" color={PRIMARY} />
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 pb-20">
              <View className="w-20 h-20 rounded-full bg-rose-50 items-center justify-center">
                <Feather name="heart" size={32} color="#F43F5E" />
              </View>
              <Text className="text-gray-900 font-extrabold text-lg mt-5">
                Chưa có nhân viên yêu thích
              </Text>
              <Text className="text-gray-400 text-sm leading-5 text-center mt-2">
                Sau khi có nhân viên nhận việc, hãy mở hồ sơ và nhấn biểu tượng tim để lưu lại.
              </Text>
              <TouchableOpacity
                className="bg-emerald-700 rounded-xl px-6 py-3 mt-5"
                onPress={() => router.push("/(tabs)/booking")}
              >
                <Text className="text-white font-bold">Xem đơn hàng</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}
