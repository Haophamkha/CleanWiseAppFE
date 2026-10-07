import { clearPickedAddress } from "@/features/address/stores/addressPickerSlice";
import { setBookingDraft } from "@/features/booking/stores/bookingDraftSlice";
import { useGetServiceDetailQuery } from "@/features/service/api/serviceApi";
import { AddressPickerField } from "@/features/service/components/AddressPickerField";
import { FormSchemaRenderer } from "@/features/service/components/FormSchemaRenderer";
import { RepeatableItemsFooter } from "@/features/service/components/RepeatableItemsFooter";
import { ServiceIcon } from "@/features/service/components/ServiceIcon";
import { calculateEstimatedPrice } from "@/features/service/utils/servicePricing";
import { getServiceVisual } from "@/features/service/utils/serviceVisuals";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { showErrorToast } from "@/utils/toast";
import { getMissingRequiredFieldLabels } from "@/utils/validators";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const serviceId = Number(id);
  const dispatch = useAppDispatch();
  const pickedSelections = useAppSelector((s) => s.addressPicker.selections);
  const insets = useSafeAreaInsets();

  const {
    data: service,
    isLoading,
    isError,
  } = useGetServiceDetailQuery(serviceId, {
    skip: !Number.isFinite(serviceId),
    refetchOnMountOrArgChange: true,
  });

  const [values, setValues] = useState<Record<string, any>>({});

  // Dữ liệu dịch vụ cũ có thể chưa có form_schema/fields. Luôn chuẩn hóa
  // thành mảng để màn hình chi tiết không bị crash khi render.
  const serviceFields = service?.form_schema?.fields ?? [];

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // Danh sách dòng địa chỉ cần chọn: lấy từ form_schema.addresses,
  // nếu dịch vụ không khai báo (mặc định) thì tạo 1 dòng chung.
  const addressEntries =
    service?.form_schema?.addresses ??
    (service
      ? [{ key: "address", label: "Địa chỉ thực hiện dịch vụ", required: true }]
      : []);

  const pickerKeyFor = (entryKey: string) => `service_${serviceId}_${entryKey}`;

  // Lắng nghe địa chỉ vừa chọn từ màn AddressList, đổ vào values rồi xoá khỏi kênh tạm.
  useEffect(() => {
    addressEntries.forEach((entry) => {
      const pKey = pickerKeyFor(entry.key);
      const picked = pickedSelections[pKey];
      if (picked) {
        handleChange(entry.key, picked);
        dispatch(clearPickedAddress(pKey));
      }
    });
  }, [pickedSelections]);

  const handleGoToConfirm = () => {
    if (!service) return;

    const missing = getMissingRequiredFieldLabels(
      serviceFields,
      values,
      addressEntries,
    );

    if (groupField && groupItems.length === 0) {
      missing.push(groupField.label);
    }

    if (missing.length > 0) {
      showErrorToast("Thiếu thông tin", `Vui lòng điền: ${missing.join(", ")}`);
      return;
    }

    dispatch(
      setBookingDraft({
        service,
        values,
        addresses: Object.fromEntries(
          addressEntries
            .filter((entry) => !!values[entry.key])
            .map((entry) => [entry.key, values[entry.key]]),
        ),
      }),
    );
    router.push("/booking/confirm");
  };

  const handleChooseAddress = (entryKey: string, label: string) => {
    router.push({
      pathname: "/profile/address",
      params: { pickerKey: pickerKeyFor(entryKey), title: label },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#047857" />
      </View>
    );
  }

  if (isError || !service) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Feather name="alert-circle" size={36} color="#DC2626" />
        <Text className="text-gray-900 font-semibold mt-4">
          Không tải được dịch vụ
        </Text>
        <TouchableOpacity
          className="mt-5 bg-emerald-700 rounded-xl px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const visual = getServiceVisual(service.section_code);
  const heroImage =
    service.images?.find((i) => i.is_primary)?.image ??
    service.images?.[0]?.image ??
    null;

  const estimatedPrice = calculateEstimatedPrice(
    serviceFields,
    service.pricing_config,
    values,
  );

  const groupField = serviceFields.find((f) => f.type === "REPEATABLE_GROUP");
  const groupItems: Record<string, any>[] = groupField
    ? (values[groupField.key] ?? [])
    : [];

  const handleRemoveGroupItem = (index: number) => {
    if (!groupField) return;
    handleChange(
      groupField.key,
      groupItems.filter((_, i) => i !== index),
    );
  };

  const missingRequiredAddress = addressEntries.some(
    (entry) => entry.required && !values[entry.key],
  );

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text
          className="text-lg font-bold text-gray-900 flex-1"
          numberOfLines={1}
        >
          {service.name}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 220 }}
      >
        {heroImage ? (
          <Image
            source={{ uri: heroImage }}
            style={{ width: "100%", height: 200 }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="items-center justify-center py-10"
            style={{ backgroundColor: visual.bg }}
          >
            <ServiceIcon
              uri={service.icon}
              fallbackName={visual.icon}
              size={56}
              color={visual.color}
            />
          </View>
        )}

        <View className="px-5 pt-5">
          <Text className="text-gray-500 text-sm mb-5">
            {service.description}
          </Text>

          {/* Ô chọn địa chỉ — 1 dòng mặc định, hoặc 2 dòng cho chuyển nhà */}
          {addressEntries.map((entry) => (
            <AddressPickerField
              key={entry.key}
              label={entry.label}
              required={entry.required}
              value={values[entry.key]}
              onPress={() => handleChooseAddress(entry.key, entry.label)}
            />
          ))}

          <FormSchemaRenderer
            fields={serviceFields}
            values={values}
            pricingConfig={service.pricing_config}
            taskChecklist={service.form_schema?.task_checklist}
            onChange={handleChange}
          />
        </View>
      </ScrollView>

      {groupField ? (
        <RepeatableItemsFooter
          groupField={groupField}
          items={groupItems}
          pricingConfig={service.pricing_config}
          onRemove={handleRemoveGroupItem}
          onSubmit={handleGoToConfirm}
          submitDisabled={groupItems.length === 0 || missingRequiredAddress}
          submitLabel="Tiếp theo"
        />
      ) : (
        <View
          className="px-6 pt-4 border-t border-gray-100 bg-white"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-500 text-sm">Tạm tính</Text>
            <Text className="text-emerald-700 font-bold text-lg">
              {estimatedPrice != null
                ? formatVnd(estimatedPrice)
                : "Chưa đủ thông tin"}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-emerald-700 rounded-xl py-4 items-center"
            style={{
              opacity:
                estimatedPrice == null || missingRequiredAddress ? 0.6 : 1,
            }}
            activeOpacity={0.8}
            disabled={estimatedPrice == null || missingRequiredAddress}
            onPress={handleGoToConfirm}
          >
            <Text className="text-white font-bold text-base">Đặt dịch vụ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
