import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { useWorkerProfile } from "@/features/favorite-worker/hooks/useWorkerProfile";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = keyof typeof Feather.glyphMap;

const AVATAR = 104;
const RING = 6;
const STATS_OVERLAP = 46;
const BAR_HEIGHT = 84;

/* ───────────────────────── Thành phần nhỏ ───────────────────────── */

/** Hiện dần + trượt lên nhẹ khi vào màn hình. */
function FadeUp({
  delay = 0,
  children,
}: {
  delay?: number;
  children: ReactNode;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function Stars({ rating, active }: { rating: number; active: boolean }) {
  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const name = !active
          ? "star-outline"
          : rating >= i
            ? "star"
            : rating >= i - 0.5
              ? "star-half"
              : "star-outline";
        return (
          <Ionicons
            key={i}
            name={name}
            size={17}
            color={active ? COLORS.accent : "rgba(255,255,255,0.55)"}
            style={{ marginHorizontal: 1 }}
          />
        );
      })}
    </View>
  );
}

function StatItem({
  icon,
  value,
  label,
  tint,
  tone,
  divider,
}: {
  icon: IconName;
  value: string;
  label: string;
  tint: string;
  tone: string;
  divider?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 16,
        borderLeftWidth: divider ? StyleSheet.hairlineWidth : 0,
        borderLeftColor: COLORS.line,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tint,
        }}
      >
        <Feather name={icon} size={18} color={tone} />
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={{
          marginTop: 10,
          paddingHorizontal: 4,
          fontSize: 19,
          fontWeight: "900",
          color: COLORS.ink,
        }}
      >
        {value}
      </Text>
      <Text
        numberOfLines={1}
        style={{ marginTop: 2, fontSize: 11.5, color: COLORS.inkMuted }}
      >
        {label}
      </Text>
    </View>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        {
          marginTop: 14,
          padding: 18,
          borderRadius: RADIUS.card,
          backgroundColor: COLORS.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.line,
        },
        SHADOWS.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <LinearGradient
          colors={[COLORS.primaryLight, COLORS.primarySoft]}
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            marginRight: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name={icon} size={16} color={COLORS.primaryDark} />
        </LinearGradient>
        <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink }}>
          {title}
        </Text>
      </View>
      <View style={{ marginTop: 14 }}>{children}</View>
    </View>
  );
}

function Highlight({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: COLORS.accentLight,
      }}
    >
      <Feather name={icon} size={13} color={COLORS.accentDark} />
      <Text
        style={{
          marginLeft: 6,
          fontSize: 12.5,
          fontWeight: "800",
          color: COLORS.accentDark,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function StateScreen({
  icon,
  title,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        backgroundColor: COLORS.canvas,
      }}
    >
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.dangerLight,
        }}
      >
        <Feather name={icon} size={32} color={COLORS.danger} />
      </View>
      <Text
        style={{
          marginTop: 18,
          fontSize: 16,
          fontWeight: "800",
          textAlign: "center",
          color: COLORS.ink,
        }}
      >
        {title}
      </Text>
      <TouchableOpacity
        onPress={onAction}
        activeOpacity={0.85}
        style={[
          {
            marginTop: 22,
            paddingHorizontal: 30,
            paddingVertical: 13,
            borderRadius: 16,
            backgroundColor: COLORS.primary,
          },
          SHADOWS.float,
        ]}
      >
        <Text style={{ fontWeight: "800", color: COLORS.white }}>
          {actionLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ───────────────────────── Màn hình ───────────────────────── */

export function WorkerProfile() {
  const w = useWorkerProfile();
  const insets = useSafeAreaInsets();

  // Nút tim "nảy" nhẹ mỗi khi đổi trạng thái yêu thích
  const heartScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.25,
        useNativeDriver: true,
        speed: 40,
        bounciness: 12,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 8,
      }),
    ]).start();
  }, [w.liked, heartScale]);

  if (w.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.canvas,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, fontSize: 14, color: COLORS.inkMuted }}>
          Đang tải hồ sơ nhân viên...
        </Text>
      </View>
    );
  }

  if (!w.worker) {
    return (
      <StateScreen
        icon="alert-circle"
        title={
          w.isError
            ? "Không tải được thông tin nhân viên"
            : "Không tìm thấy thông tin nhân viên"
        }
        actionLabel={w.isError ? "Thử lại" : "Quay lại"}
        onAction={() => (w.isError ? w.refetch() : w.goBack())}
      />
    );
  }

  const { worker } = w;
  const bottomPad = Math.max(insets.bottom, 12);

  // Điểm nổi bật: suy ra từ dữ liệu thật, chỉnh ngưỡng tuỳ ý
  const highlights: { icon: IconName; label: string }[] = [];
  if (w.hasRating && w.rating >= 4.5)
    highlights.push({ icon: "award", label: "Được đánh giá cao" });
  if (w.completedJobs >= 10)
    highlights.push({
      icon: "trending-up",
      label: `${w.completedJobs}+ đơn hoàn thành`,
    });
  if (w.experienceYears >= 3)
    highlights.push({
      icon: "shield",
      label: `${w.experienceYears} năm kinh nghiệm`,
    });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      {/* Nền màu phía sau để kéo giãn (overscroll) trên iOS không lộ màu trắng */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 320,
          backgroundColor: COLORS.primary,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: BAR_HEIGHT + bottomPad + 20 }}
      >
        {/* ── Hero ── */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 10,
            paddingBottom: STATS_OVERLAP + 26,
            paddingHorizontal: 20,
            borderBottomLeftRadius: RADIUS.hero,
            borderBottomRightRadius: RADIUS.hero,
            overflow: "hidden",
          }}
        >
          {/* trang trí */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -100,
              right: -70,
              width: 260,
              height: 260,
              borderRadius: 130,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 90,
              left: -60,
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: "rgba(255,255,255,0.07)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: -60,
              right: 40,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />

          {/* Thanh trên */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={w.goBack}
              hitSlop={8}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.22)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.28)",
              }}
            >
              <Feather name="arrow-left" size={19} color={COLORS.white} />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                marginRight: 40,
                textAlign: "center",
                fontSize: 16,
                fontWeight: "800",
                color: COLORS.white,
              }}
            >
              Hồ sơ nhân viên
            </Text>
          </View>

          {/* Avatar + tên + đánh giá */}
          <View style={{ alignItems: "center", marginTop: 22 }}>
            <LinearGradient
              colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.3)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: AVATAR + RING * 2,
                height: AVATAR + RING * 2,
                borderRadius: (AVATAR + RING * 2) / 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {worker.avatar ? (
                <Image
                  source={{ uri: worker.avatar }}
                  style={{
                    width: AVATAR,
                    height: AVATAR,
                    borderRadius: AVATAR / 2,
                    borderWidth: 3,
                    borderColor: COLORS.white,
                    backgroundColor: COLORS.primaryLight,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: AVATAR,
                    height: AVATAR,
                    borderRadius: AVATAR / 2,
                    borderWidth: 3,
                    borderColor: COLORS.white,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: COLORS.primaryLight,
                  }}
                >
                  <Feather name="user" size={42} color={COLORS.primaryDark} />
                </View>
              )}
            </LinearGradient>

            <Text
              numberOfLines={2}
              style={{
                marginTop: 14,
                fontSize: 24,
                fontWeight: "900",
                textAlign: "center",
                color: COLORS.white,
              }}
            >
              {w.fullName}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.28)",
              }}
            >
              <Feather name="check-circle" size={13} color={COLORS.white} />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 12.5,
                  fontWeight: "700",
                  color: COLORS.white,
                }}
              >
                Nhân viên CleanWise
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Stars rating={w.rating} active={w.hasRating} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontWeight: "800",
                  color: COLORS.white,
                }}
              >
                {w.hasRating ? w.rating.toFixed(1) : "Chưa có đánh giá"}
              </Text>
              {w.hasRating && (
                <Text
                  style={{
                    marginLeft: 4,
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  ({w.completedJobs} đơn)
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* ── Nội dung ── */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* Thẻ thống kê nổi, đè lên hero */}
          <FadeUp delay={60}>
            <View
              style={[
                {
                  flexDirection: "row",
                  marginTop: -STATS_OVERLAP,
                  borderRadius: RADIUS.card,
                  backgroundColor: COLORS.surface,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: COLORS.line,
                  overflow: "hidden",
                },
                SHADOWS.card,
              ]}
            >
              <StatItem
                icon="star"
                value={w.hasRating ? w.rating.toFixed(1) : "—"}
                label="Đánh giá"
                tint={COLORS.accentLight}
                tone={COLORS.accentDark}
              />
              <StatItem
                icon="check-circle"
                value={`${w.completedJobs}`}
                label="Đơn hoàn thành"
                tint={COLORS.primaryLight}
                tone={COLORS.primaryDark}
                divider
              />
              <StatItem
                icon="briefcase"
                value={`${w.experienceYears} năm`}
                label="Kinh nghiệm"
                tint={COLORS.primaryLight}
                tone={COLORS.primaryDark}
                divider
              />
            </View>
          </FadeUp>

          {highlights.length > 0 && (
            <FadeUp delay={120}>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                {highlights.map((h) => (
                  <Highlight key={h.label} icon={h.icon} label={h.label} />
                ))}
              </View>
            </FadeUp>
          )}

          {!!worker.bio?.trim() && (
            <FadeUp delay={180}>
              <Section icon="user" title="Giới thiệu">
                <Text
                  style={{
                    fontSize: 14.5,
                    lineHeight: 23,
                    color: COLORS.inkSoft,
                  }}
                >
                  {worker.bio}
                </Text>
              </Section>
            </FadeUp>
          )}

          {!!worker.skills?.length && (
            <FadeUp delay={240}>
              <Section icon="tool" title="Kỹ năng chuyên môn">
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {worker.skills.map((skill) => (
                    <View
                      key={skill}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingLeft: 9,
                        paddingRight: 13,
                        paddingVertical: 7,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: COLORS.primaryBorder,
                        backgroundColor: COLORS.primarySoft,
                      }}
                    >
                      <Feather
                        name="check"
                        size={13}
                        color={COLORS.primaryDark}
                      />
                      <Text
                        style={{
                          marginLeft: 5,
                          fontSize: 12.5,
                          fontWeight: "700",
                          color: COLORS.primaryDark,
                        }}
                      >
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>
              </Section>
            </FadeUp>
          )}

          {/* Khu vực hoạt động — chỉ hiện khi API có dữ liệu */}
          {!!worker.work_area && (
            <FadeUp delay={300}>
              <Section icon="map-pin" title="Khu vực hoạt động">
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: COLORS.canvas,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: COLORS.primaryLight,
                    }}
                  >
                    <Feather
                      name="navigation"
                      size={17}
                      color={COLORS.primaryDark}
                    />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14.5,
                      lineHeight: 21,
                      fontWeight: "600",
                      color: COLORS.ink,
                    }}
                  >
                    {worker.work_area}
                  </Text>
                </View>
              </Section>
            </FadeUp>
          )}
        </View>
      </ScrollView>

      {/* ── Thanh hành động cố định ── */}
      <View
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: bottomPad,
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: COLORS.ink,
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: -6 },
            shadowRadius: 14,
            elevation: 12,
          },
        ]}
      >
        <TouchableOpacity
          onPress={w.openChat}
          disabled={w.openingChat}
          activeOpacity={0.85}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                height: 54,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                opacity: w.openingChat ? 0.8 : 1,
              },
              SHADOWS.float,
            ]}
          >
            {w.openingChat ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Feather name="message-circle" size={19} color={COLORS.white} />
            )}
            <Text
              style={{
                marginLeft: 8,
                fontSize: 15.5,
                fontWeight: "800",
                color: COLORS.white,
              }}
            >
              Nhắn tin
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Animated.View
          style={{ marginLeft: 10, transform: [{ scale: heartScale }] }}
        >
          <TouchableOpacity
            onPress={w.toggleFavorite}
            disabled={w.updatingFavorite}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={w.liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            style={{
              width: 54,
              height: 54,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              borderWidth: w.liked ? 0 : 1.5,
              borderColor: COLORS.line,
              backgroundColor: w.liked ? COLORS.danger : COLORS.surface,
            }}
          >
            <Ionicons
              name={w.liked ? "heart" : "heart-outline"}
              size={24}
              color={w.liked ? COLORS.white : COLORS.inkMuted}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
