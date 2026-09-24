import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { COLORS } from "@/components/service/formFieldShared";
import { useRefreshControl } from "@/hooks/useRefreshControl";
import {
    useGetWalletQuery,
    useRequestWithdrawMutation,
} from "@/services/walletApi";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Tông màu riêng cho ví: đậm hơn COLORS.primary một chút để tách bạch
// với phần còn lại của app, gợi cảm giác "khối tài sản" chắc chắn.
const WALLET_DARK = "#065F46";

function DecorRing({
  size,
  top,
  right,
  left,
  opacity = 0.08,
}: {
  size: number;
  top?: number;
  right?: number;
  left?: number;
  opacity?: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top,
        right,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: `rgba(255,255,255,${opacity})`,
      }}
    />
  );
}

function WithdrawModal({
  visible,
  balance,
  onClose,
}: {
  visible: boolean;
  balance: number;
  onClose: () => void;
}) {
  const [amountText, setAmountText] = useState("");
  const [requestWithdraw, { isLoading }] = useRequestWithdrawMutation();

  const quickAmounts = [50000, 100000, 200000, 500000].filter(
    (v) => v <= balance,
  );

  const handleSubmit = async () => {
    const amount = Number(amountText.replace(/[^0-9]/g, ""));

    if (!amount || amount < 1000) {
      Alert.alert("Số tiền không hợp lệ", "Số tiền rút tối thiểu là 1.000đ.");
      return;
    }
    if (amount > balance) {
      Alert.alert("Số dư không đủ", "Số tiền rút vượt quá số dư trong ví.");
      return;
    }

    try {
      await requestWithdraw({ amount }).unwrap();
      setAmountText("");
      onClose();
      Alert.alert(
        "Đã gửi yêu cầu",
        "Yêu cầu rút tiền đã được ghi nhận, chờ admin xử lý.",
      );
    } catch (err: any) {
      const message =
        err?.data?.amount?.[0] ||
        err?.data?.message ||
        "Không thể gửi yêu cầu rút tiền, vui lòng thử lại.";
      Alert.alert("Lỗi", String(message));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(5,20,15,0.55)" }}
        onPress={onClose}
      >
        <View style={{ flex: 1 }} />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingBottom: 32,
            }}
          >
            <View className="items-center pt-3 pb-1">
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.border,
                }}
              />
            </View>

            <View className="px-6 pt-4">
              <Text
                className="text-[18px] font-bold"
                style={{ color: COLORS.text }}
              >
                Rút tiền về tài khoản
              </Text>
              <Text
                className="text-[13px] mt-1 mb-5"
                style={{ color: COLORS.textMuted }}
              >
                Số dư khả dụng {formatVnd(balance)}
              </Text>

              <View
                className="flex-row items-center rounded-2xl px-4 mb-4"
                style={{
                  backgroundColor: COLORS.background,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Text
                  className="text-[20px] font-bold mr-2"
                  style={{ color: COLORS.textMuted }}
                >
                  đ
                </Text>
                <TextInput
                  className="flex-1 py-4 text-[20px] font-bold"
                  style={{ color: COLORS.text }}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={amountText}
                  onChangeText={setAmountText}
                />
              </View>

              {quickAmounts.length > 0 && (
                <View className="flex-row flex-wrap mb-6" style={{ gap: 8 }}>
                  {quickAmounts.map((v) => (
                    <TouchableOpacity
                      key={v}
                      onPress={() => setAmountText(String(v))}
                      activeOpacity={0.8}
                      className="px-3.5 py-2 rounded-full"
                      style={{
                        backgroundColor: COLORS.primaryLight,
                        borderWidth: 1,
                        borderColor: COLORS.primaryBorder,
                      }}
                    >
                      <Text
                        className="text-[13px] font-bold"
                        style={{ color: COLORS.primary }}
                      >
                        {formatVnd(v)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
                className="rounded-2xl py-4 items-center"
                style={{
                  backgroundColor: WALLET_DARK,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Gửi yêu cầu
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function WalletScreen() {
  const [withdrawVisible, setWithdrawVisible] = useState(false);

  const {
    data: wallet,
    isLoading: walletLoading,
    isFetching: walletFetching,
    refetch,
  } = useGetWalletQuery();
  const balance = wallet ? Number(wallet.balance) : 0;

  const { refreshing, onRefresh } = useRefreshControl(refetch);

  // Đang tải lần đầu, chưa có data nào.
  const isInitialLoading = walletLoading && !wallet;

  // KHÔNG return sớm nữa — luôn render UI thật bên dưới, LoadingOverlay
  // chỉ đè lên trên (position: absolute) để có nội dung thật phía sau blur.
  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={WALLET_DARK}
            colors={[WALLET_DARK]}
          />
        }
      >
        {/* Hero: header + balance liền khối, bo góc dưới */}
        <View
          style={{
            backgroundColor: WALLET_DARK,
            paddingTop: 56,
            paddingBottom: 28,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            overflow: "hidden",
          }}
        >
          <DecorRing size={180} top={-70} right={-50} opacity={0.07} />
          <DecorRing size={110} top={40} right={40} opacity={0.06} />

          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={10}
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Feather name="arrow-left" size={18} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-[17px] font-bold">Ví của tôi</Text>

            {walletFetching && !isInitialLoading && !refreshing && (
              <ActivityIndicator
                color="rgba(255,255,255,0.7)"
                size="small"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>

          <Text
            className="text-[13px] font-medium mb-2"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Số dư khả dụng
          </Text>

          {/* Giữ chỗ bằng chiều cao cố định khi đang tải lần đầu, tránh
              hiện "0 đ" nhấp nháy dưới lớp blur trước khi có data thật. */}
          {isInitialLoading ? (
            <View style={{ height: 46 }} />
          ) : (
            <View className="flex-row items-baseline">
              <Text className="text-white font-extrabold text-[38px] tracking-tight">
                {balance.toLocaleString("vi-VN")}
              </Text>
              <Text
                className="text-[20px] font-bold ml-1"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                đ
              </Text>
            </View>
          )}

          <View className="flex-row mt-7" style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={() => setWithdrawVisible(true)}
              activeOpacity={0.85}
              className="flex-1 flex-row items-center justify-center rounded-2xl py-3.5"
              style={{ backgroundColor: "#fff" }}
            >
              <Feather name="arrow-down-left" size={16} color={WALLET_DARK} />
              <Text
                className="font-bold ml-2 text-[14px]"
                style={{ color: WALLET_DARK }}
              >
                Rút tiền
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                Alert.alert(
                  "Sắp ra mắt",
                  "Tính năng nạp tiền vào ví sẽ sớm được cập nhật.",
                )
              }
              className="flex-1 flex-row items-center justify-center rounded-2xl py-3.5"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
              }}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text className="text-white font-bold ml-2 text-[14px]">
                Nạp tiền
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nội dung dưới hero */}
        <View className="px-5 pt-6">
          <Text
            className="font-bold text-[15px] mb-3"
            style={{ color: COLORS.text }}
          >
            Liên kết thanh toán
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                "Sắp ra mắt",
                "Tính năng thêm thẻ ngân hàng sẽ sớm được cập nhật.",
              )
            }
            className="flex-row items-center rounded-2xl px-4 py-4"
            style={{
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              shadowColor: "#000",
              shadowOpacity: 0.03,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
              style={{ backgroundColor: COLORS.primaryLight }}
            >
              <Feather name="credit-card" size={19} color={COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text
                className="font-bold text-[15px]"
                style={{ color: COLORS.text }}
              >
                Thêm thẻ ngân hàng
              </Text>
              <Text
                className="text-[12.5px] mt-0.5"
                style={{ color: COLORS.textMuted }}
              >
                Liên kết thẻ để rút tiền nhanh hơn
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Ghi chú nhỏ giải thích ví */}
          <View
            className="flex-row items-start rounded-2xl px-4 py-3.5 mt-4"
            style={{ backgroundColor: COLORS.primaryLight }}
          >
            <Feather
              name="info"
              size={15}
              color={COLORS.primary}
              style={{ marginTop: 1, marginRight: 10 }}
            />
            <Text
              className="text-[12.5px] flex-1"
              style={{ color: COLORS.primary, lineHeight: 18 }}
            >
              Số dư trong ví được cộng khi đơn hàng của bạn được hoàn tiền. Bạn
              có thể rút về tài khoản ngân hàng bất cứ lúc nào.
            </Text>
          </View>
        </View>
      </ScrollView>

      <WithdrawModal
        visible={withdrawVisible}
        balance={balance}
        onClose={() => setWithdrawVisible(false)}
      />

      {/* Đè lên trên cùng khi đang tải lần đầu — nội dung thật đã render phía sau */}
      <LoadingOverlay
        visible={isInitialLoading}
        fullscreen
        text="Đang tải ví của bạn..."
      />

      <SafeAreaView edges={["bottom"]} />
    </View>
  );
}
