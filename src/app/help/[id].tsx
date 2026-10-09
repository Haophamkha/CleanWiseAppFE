import { ScreenHeader } from "@/components/common/ScreenHeader";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { COLORS } from "@/constants/theme";
import { useGetHelpArticleQuery } from "@/features/chatbot/api/chatbotApi";
import { useAppSelector } from "@/store/hooks";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HelpArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const articleId = Number(id);
  const validId = Number.isSafeInteger(articleId) && articleId > 0;
  const user = useAppSelector((s) => s.auth.user);
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refetch } = useGetHelpArticleQuery(articleId, { skip: !user || !validId, refetchOnMountOrArgChange: true });
  const unavailable = !validId || (typeof error === "object" && error !== null && "status" in error && error.status === 404);
  return <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
    <ScreenHeader title="Chi tiết hướng dẫn" />
    {!user ? <RequireLoginNotice /> : <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
      {isLoading && <ActivityIndicator color={COLORS.primary} />}
      {unavailable ? <Text className="text-ink-soft leading-6">Hướng dẫn này đã được cập nhật hoặc không còn khả dụng. Hãy mở kho hướng dẫn để xem phiên bản hiện tại.</Text> : error ? <View><Text className="text-ink-soft mb-3">Chưa tải được hướng dẫn.</Text><TouchableOpacity onPress={refetch}><Text className="text-primary font-bold">Thử lại</Text></TouchableOpacity></View> : data && <>
        <Text selectable className="text-ink text-2xl font-bold">{data.title}</Text>
        <Text className="text-ink-muted text-xs mt-3">Phiên bản {data.version} · Áp dụng từ {data.effective_from.split("-").reverse().join("/")}</Text>
        <Text selectable className="text-ink-soft leading-6 mt-4">{data.summary}</Text>
        {data.sections.map((section, index) => <View key={`${index}:${section.heading}`} className="mt-6">
          <Text selectable className="text-ink font-bold text-lg mb-2">{section.heading}</Text>
          <Text selectable className="text-ink leading-7 text-base">{section.text}</Text>
        </View>)}
      </>}
    </ScrollView>}
  </View>;
}
