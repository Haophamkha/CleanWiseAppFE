import { ENV } from "@/config/env";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Modal, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { HelpImage } from "../types/chatbot";

export function HelpScreenshot({ image, english }: { image: HelpImage; english: boolean }) {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [viewport, setViewport] = useState({ width, height: height - insets.top - insets.bottom - 44 });
  const fittedWidth = Math.max(1, Math.min(viewport.width - 16, (viewport.height - 16) * image.width / image.height));
  const uri = `${ENV.API_URL.replace(/\/$/, "")}/api/chatbot/help-images/${encodeURIComponent(image.file)}/`;
  useEffect(() => { setFailed(false); setOpen(false); setZoom(1); }, [uri]);
  const alt = english ? image.alt_en ?? image.alt : image.alt;
  const photo = (large = false) => (
    <View style={{ width: large ? fittedWidth * zoom : "100%", aspectRatio: image.width / image.height }}>
      <Image key={`${uri}:${attempt}`} source={{ uri }} accessibilityLabel={alt} resizeMode="contain"
        onError={() => setFailed(true)} style={{ width: "100%", height: "100%", borderRadius: 14 }} />
      {image.markers?.map((mark, index) => (
        <View key={index} pointerEvents="none" style={{ position: "absolute", left: `${mark.x}%`, top: `${mark.y}%`, width: `${mark.width}%`, height: `${mark.height}%`, borderWidth: 2, borderColor: "#5EEAD4", borderRadius: 8 }}>
          <View style={{ position: "absolute", left: -6, top: -12, width: 23, height: 23, borderRadius: 12, backgroundColor: "#0F766E", borderWidth: 1, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>{index + 1}</Text>
          </View>
        </View>
      ))}
    </View>
  );
  return (
    <View className="mt-5">
      {failed ? (
        <TouchableOpacity accessibilityRole="button" onPress={() => { setAttempt(attempt + 1); setFailed(false); }} className="bg-surface-muted p-4" style={{ borderRadius: 14 }}>
          <Text className="text-ink-soft">{t("Chưa tải được ảnh minh họa. Chạm để thử lại.")}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("Mở ảnh minh họa")} onPress={() => { setZoom(1); setOpen(true); }} activeOpacity={0.85} style={{ width: "100%", maxWidth: 260, alignSelf: "center" }}>
          {photo()}
        </TouchableOpacity>
      )}
      <Text className="text-ink-soft text-xs text-center mt-3">{alt}</Text>
      <Text className="text-ink-muted text-xs text-center mt-1">{t("Chạm ảnh để xem lớn")}{english ? ` · ${t("Hình minh họa giao diện tiếng Việt")}` : ""}</Text>
      <Modal visible={open} onRequestClose={() => setOpen(false)} animationType="fade" presentationStyle="fullScreen" statusBarTranslucent navigationBarTranslucent>
        <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View className="flex-row items-center justify-between px-2" style={{ height: 44 }}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("Đóng")} onPress={() => setOpen(false)} style={{ padding: 12 }}>
              <Feather name="x" size={22} color={COLORS.ink} />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("Thu nhỏ ảnh")} disabled={zoom <= 1} onPress={() => setZoom(Math.max(1, zoom - 0.5))} style={{ padding: 12 }}><Feather name="minus" size={20} color={COLORS.ink} /></TouchableOpacity>
              <Text className="text-ink text-sm">{Math.round(zoom * 100)}%</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("Phóng to ảnh")} disabled={zoom >= 3} onPress={() => setZoom(Math.min(3, zoom + 0.5))} style={{ padding: 12 }}><Feather name="plus" size={20} color={COLORS.ink} /></TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1 }} onLayout={({ nativeEvent: { layout } }) => setViewport({ width: layout.width, height: layout.height })}>
            <ScrollView scrollEnabled={zoom > 1} contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
              <ScrollView horizontal scrollEnabled={zoom > 1} style={{ flexGrow: 0 }} contentContainerStyle={{ minWidth: viewport.width, padding: 8, alignItems: "center", justifyContent: "center" }}>{photo(true)}</ScrollView>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
