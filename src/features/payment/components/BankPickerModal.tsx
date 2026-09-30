import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS, SHADOWS } from "@/constants/theme";
import type { BankCatalogItem } from "@/features/payment/types/PaymentMethod";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  banks: BankCatalogItem[];
  onClose: () => void;
  onSelect: (bank: BankCatalogItem) => void;
};

export default function BankPickerModal({
  visible,
  banks,
  onClose,
  onSelect,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [focused, setFocused] = useState(false);

  const filteredBanks = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("vi");
    if (!query) return banks;
    return banks.filter((bank) =>
      `${bank.short_name} ${bank.name} ${bank.code}`
        .toLocaleLowerCase("vi")
        .includes(query),
    );
  }, [banks, keyword]);

  const close = () => {
    setKeyword("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView className="flex-1 bg-canvas">
        {/* Header */}
        <View className="flex-row items-center px-5 py-3 bg-surface border-b border-line">
          <TouchableOpacity
            onPress={close}
            hitSlop={8}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-canvas items-center justify-center mr-3"
          >
            <Feather name="x" size={20} color={COLORS.ink} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-bold text-ink">Chọn ngân hàng</Text>
            <Text className="text-xs text-ink-muted">
              {filteredBanks.length} ngân hàng
            </Text>
          </View>
        </View>

        {/* Search */}
        <View className="px-5 pt-4 pb-2">
          <View
            className={`flex-row items-center bg-surface rounded-2xl px-4 border ${
              focused ? "border-primary" : "border-line"
            }`}
          >
            <Feather
              name="search"
              size={18}
              color={focused ? COLORS.primary : COLORS.inkMuted}
            />
            <TextInput
              className="flex-1 py-3.5 ml-3 text-ink"
              value={keyword}
              onChangeText={setKeyword}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Tìm theo tên ngân hàng"
              placeholderTextColor={COLORS.inkMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {keyword.length > 0 && (
              <TouchableOpacity
                onPress={() => setKeyword("")}
                hitSlop={8}
                activeOpacity={0.7}
              >
                <Feather name="x-circle" size={18} color={COLORS.inkMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={filteredBanks}
          keyExtractor={(item) => `${item.bin}-${item.code}`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 24,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center bg-surface rounded-2xl border border-line p-3 mb-2.5"
              style={SHADOWS.card}
              onPress={() => {
                setKeyword("");
                onSelect(item);
              }}
              activeOpacity={0.75}
            >
              <View className="w-12 h-12 rounded-xl bg-surface border border-line items-center justify-center overflow-hidden mr-3">
                {item.logo ? (
                  <Image
                    source={{ uri: item.logo }}
                    style={{ width: 36, height: 36 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Feather name="briefcase" size={20} color={COLORS.primary} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-ink font-bold text-[15px]">
                  {item.short_name}
                </Text>
                <Text
                  className="text-ink-muted text-xs mt-0.5"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>
              <View className="w-8 h-8 rounded-full bg-canvas items-center justify-center ml-2">
                <Feather
                  name="chevron-right"
                  size={18}
                  color={COLORS.inkMuted}
                />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="pt-16">
              <EmptyState icon="search" title="Không tìm thấy ngân hàng" />
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}
