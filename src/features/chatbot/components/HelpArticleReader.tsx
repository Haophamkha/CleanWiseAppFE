import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { BackHandler, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { HelpArticle } from "../types/chatbot";
import { guidePosition } from "../utils/helpGuide";
import { HelpScreenshot } from "./HelpScreenshot";

export function HelpArticleReader({ article }: { article: HelpArticle }) {
  const { t, i18n } = useTranslation();
  const { COLORS } = useAppTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ section?: string; step?: string }>();
  const { section, invalid, step } = guidePosition(article.sections, params.section, params.step);
  const english = i18n.resolvedLanguage === "en";
  const scroll = useRef<ScrollView>(null);
  const tocOffset = useRef(0);
  const steps = section?.steps ?? [];
  const current = steps[step];
  const toc = useCallback(() => router.setParams({ section: "", step: "" }), []);
  const back = () => params.section ? toc() : router.replace("/help");

  useEffect(() => {
    const frame = requestAnimationFrame(() => scroll.current?.scrollTo({ y: params.section ? 0 : tocOffset.current, animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [params.section, params.step]);
  useEffect(() => {
    if (!params.section) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => { toc(); return true; });
    return () => sub.remove();
  }, [params.section, toc]);

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-5 py-2 border-b border-line">
        <TouchableOpacity onPress={back} accessibilityRole="button" accessibilityLabel={params.section ? t("Mục lục chương") : t("Kho hướng dẫn")} style={{ padding: 10, marginLeft: -10 }}>
          <Feather name="arrow-left" size={21} color={COLORS.inkSoft} />
        </TouchableOpacity>
        <Feather name="book-open" size={18} color={COLORS.primary} />
        <Text className="flex-1 text-ink-soft text-xs ml-2">{params.section ? t("Mục lục chương") : t("Kho hướng dẫn")}</Text>
        <Text className="text-primary text-xs font-semibold">CleanWise</Text>
      </View>
      <ScrollView ref={scroll} showsVerticalScrollIndicator={false} scrollEventThrottle={100}
        onScroll={event => { if (!params.section) tocOffset.current = event.nativeEvent.contentOffset.y; }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
        {!params.section ? (
          <>
            <Text selectable className="text-ink font-bold text-[23px]" style={{ lineHeight: 32 }}>{t(article.title)}</Text>
            <Text className="text-ink-soft text-sm leading-6 mt-3 mb-5">{t("Chọn đề mục để xem hướng dẫn từng bước và ảnh minh họa.")}</Text>
            <View className="bg-surface overflow-hidden px-3" style={{ borderRadius: 18 }}>
              {article.sections.map((item, index) => (
                <TouchableOpacity key={item.id} accessibilityRole="button" accessibilityLabel={`${index + 1}. ${english ? item.heading_en ?? item.heading : item.heading}`}
                  onPress={() => router.setParams({ section: item.id, step: "1" })} activeOpacity={0.7}
                  className={`flex-row items-center py-3 ${index ? "border-t border-line" : ""}`} style={{ minHeight: 50 }}>
                  <Text className="text-primary text-xs mr-3" style={{ width: 22 }}>{String(index + 1).padStart(2, "0")}</Text>
                  <Text className="flex-1 text-ink text-sm mr-2">{english ? item.heading_en ?? item.heading : item.heading}</Text>
                  <Feather name="chevron-right" size={15} color={COLORS.inkMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : invalid ? (
          <View className="mt-5"><Text className="text-ink-soft">{t("Đề mục này không còn khả dụng. Hãy chọn lại từ mục lục chương.")}</Text><TouchableOpacity accessibilityRole="button" onPress={toc} className="py-4"><Text className="text-primary font-semibold">{t("Mục lục chương")}</Text></TouchableOpacity></View>
        ) : section && (
          <>
            <Text className="text-ink text-xl font-bold">{english ? section.heading_en ?? section.heading : section.heading}</Text>
            {current ? (
              <View key={`${section.id}:${step}`}>
                <Text accessibilityLiveRegion="polite" className="text-primary text-xs font-semibold mt-4">{t("Bước {{number}} / {{count}}", { number: step + 1, count: steps.length })}</Text>
                <Text selectable className="text-ink text-base font-semibold mt-2">{english ? current.title_en ?? current.title : current.title}</Text>
                <Text selectable className="text-ink-soft text-sm leading-6 mt-2">{english ? current.text_en ?? current.text : current.text}</Text>
                {current.image && <HelpScreenshot image={current.image} english={english} />}
                {!!current.result && <View className="bg-primary-soft flex-row items-start p-3 mt-4" style={{ borderRadius: 12 }}><Feather name="check-circle" size={17} color={COLORS.primary} /><Text className="flex-1 text-ink-soft text-xs leading-5 ml-2">{english ? current.result_en ?? current.result : current.result}</Text></View>}
              </View>
            ) : <Text selectable className="text-ink-soft leading-7 mt-4">{english ? section.text_en ?? section.text : section.text}</Text>}
            <View className="flex-row justify-between mt-5" style={{ gap: 12 }}>
              <TouchableOpacity accessibilityRole="button" disabled={step === 0} onPress={() => router.setParams({ step: String(step) })}
                className={`bg-surface border border-line px-3 py-3 ${step === 0 ? "opacity-40" : ""}`} style={{ borderRadius: 12 }}>
                <Text className="text-ink text-sm">{t("Bước trước")}</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={() => step + 1 < steps.length ? router.setParams({ step: String(step + 2) }) : toc()}
                className="bg-primary-fill px-3 py-3" style={{ borderRadius: 12 }}>
                <Text className="text-white text-sm font-semibold">{step + 1 < steps.length ? t("Bước tiếp") : t("Về mục lục")}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
