import { ScreenHeader } from "@/components/common/ScreenHeader";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { COLORS } from "@/constants/theme";
import { useGetHelpArticlesQuery } from "@/features/chatbot/api/chatbotApi";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HelpLibrary() {
  const user = useAppSelector((s) => s.auth.user);
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useGetHelpArticlesQuery(undefined, { skip: !user, refetchOnMountOrArgChange: true });
  return <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
    <ScreenHeader title="Hướng dẫn sử dụng" />
    {!user ? <RequireLoginNotice /> : <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
      <Text className="text-ink-soft leading-6 mb-4">Hướng dẫn đặt dịch vụ, theo dõi đơn và thanh toán trên CleanWise.</Text>
      {isLoading && <ActivityIndicator color={COLORS.primary} />}
      {isError && <View><Text className="text-ink-soft mb-3">Chưa tải được hướng dẫn.</Text><TouchableOpacity onPress={refetch}><Text className="text-primary font-bold">Thử lại</Text></TouchableOpacity></View>}
      {!isLoading && !isError && !data?.length && <Text className="text-ink-soft">Chưa có hướng dẫn được xuất bản.</Text>}
      {!isError && data?.map((article) => <TouchableOpacity key={article.id} onPress={() => router.push({ pathname: "/help/[id]", params: { id: String(article.id) } })} accessibilityRole="button" className="bg-surface border border-line rounded-2xl p-4 mb-3">
        <View className="flex-row items-center"><Feather name="book-open" size={20} color={COLORS.primaryDark} /><Text className="flex-1 text-ink font-bold ml-3">{article.title}</Text></View>
        <Text className="text-ink-soft leading-5 mt-3">{article.summary}</Text>
        <Text className="text-primary-dark text-xs mt-3">Phiên bản {article.version} · Xem hướng dẫn</Text>
      </TouchableOpacity>)}
    </ScrollView>}
  </View>;
}
