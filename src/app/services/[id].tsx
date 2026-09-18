import { AddressPickerField } from "@/components/service/AddressPickerField";
import { FormSchemaRenderer } from "@/components/service/FormSchemaRenderer";
import { RepeatableItemsFooter } from "@/components/service/RepeatableItemsFooter";
import { useGetServiceDetailQuery } from "@/services/serviceApi";
import { clearPickedAddress } from "@/store/addressPickerSlice";
import { setBookingDraft } from "@/store/bookingDraftSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatVnd } from "@/utils/currency";
import { calculateEstimatedPrice } from "@/utils/servicePricing";
import { getServiceVisual } from "@/utils/serviceVisuals";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { showErrorToast } from "@/utils/toast";
import { getMissingRequiredFieldLabels } from "@/utils/validators";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const serviceId = Number(id);
  const dispatch = useAppDispatch();
  const pickedSelections = useAppSelector((s) => s.addressPicker.selections);

  const {
    data: service,
    isLoading,
    isError,
  } = useGetServiceDetailQuery(serviceId, {
    skip: !Number.isFinite(serviceId),
  });

  const [values, setValues] = useState<Record<string, any>>({});

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // Danh sách dòng địa chỉ cần chọn: lấy từ form_schema.addresses,
  // nếu dịch vụ không khai báo (mặc định) thì tạo 1 dòng chung.
  const addressEntries =
    service?.form_schema.addresses ??
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
      service.form_schema.fields,
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
  const estimatedPrice = calculateEstimatedPrice(
    service.form_schema.fields,
    service.pricing_config,
    values,
  );

  const groupField = service.form_schema.fields.find(
    (f) => f.type === "REPEATABLE_GROUP",
  );
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
        <View
          className="items-center justify-center py-10"
          style={{ backgroundColor: visual.bg }}
        >
          <MaterialCommunityIcons
            name={visual.icon as any}
            size={56}
            color={visual.color}
          />
        </View>

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
            fields={service.form_schema.fields}
            values={values}
            pricingConfig={service.pricing_config}
            taskChecklist={service.form_schema.task_checklist}
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
        <View className="px-6 pb-8 pt-4 border-t border-gray-100 bg-white">
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
            onPress={handleGoToConfirm}
          >
            <Text className="text-white font-bold text-base">Đặt dịch vụ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
