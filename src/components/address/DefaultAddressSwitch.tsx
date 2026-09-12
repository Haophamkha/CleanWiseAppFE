import { Feather } from "@expo/vector-icons";
import { Alert, Switch, Text, View } from "react-native";

interface DefaultAddressSwitchProps {
  isDefault: boolean;
  onValueChange: (value: boolean) => void;
  isCurrentDefault?: boolean; // Dùng riêng cho màn Edit để biết địa chỉ này vốn đã là mặc định hay chưa
  isEditMode?: boolean; // Phân biệt màn Thêm hay màn Sửa
}

export default function DefaultAddressSwitch({
  isDefault,
  onValueChange,
  isCurrentDefault = false,
  isEditMode = false,
}: DefaultAddressSwitchProps) {
  const handleToggle = (val: boolean) => {
    // Nếu ở màn Edit và địa chỉ này ĐÃ LÀ mặc định, không cho phép tắt trực tiếp
    if (isEditMode && isCurrentDefault && !val) {
      Alert.alert(
        "Thông báo",
        "Không thể tắt địa chỉ mặc định trực tiếp ở đây. Bạn hãy chọn địa chỉ khác làm mặc định nếu muốn thay đổi.",
      );
      return;
    }
    onValueChange(val);
  };

  const active = isEditMode && isCurrentDefault ? true : isDefault;

  return (
    <View className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
      <View className="flex-row items-center flex-1 mr-3">
        <Feather name="star" size={18} color={active ? "#F59E0B" : "#9CA3AF"} />
        <View className="ml-3 flex-1">
          <Text className="text-gray-800 font-medium">
            Đặt làm địa chỉ mặc định
          </Text>
          {isEditMode && isCurrentDefault && (
            <Text className="text-gray-400 text-xs mt-0.5">
              Địa chỉ này đang là mặc định.
            </Text>
          )}
        </View>
      </View>

      <Switch
        value={active}
        onValueChange={handleToggle}
        trackColor={{ false: "#D1D5DB", true: "#047857" }}
        thumbColor="#ffffff"
      />
    </View>
  );
}
