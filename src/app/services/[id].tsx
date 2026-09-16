import { FormSchemaRenderer } from "@/components/service/FormSchemaRenderer";
import { RepeatableItemsFooter } from "@/components/service/RepeatableItemsFooter";
import { useGetServiceDetailQuery } from "@/services/serviceApi";
import { formatVnd } from "@/utils/currency";
import { calculateEstimatedPrice } from "@/utils/servicePricing";
import { getServiceVisual } from "@/utils/serviceVisuals";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const serviceId = Number(id);
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

  // Dịch vụ có REPEATABLE_GROUP (máy lạnh, sofa...) dùng footer dạng
  // "Thiết bị đã chọn" thu gọn/mở rộng. Dịch vụ khác (dọn nhà, chuyển nhà)
  // dùng footer "Tạm tính" đơn giản như cũ.
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

          {service.form_schema.address_count > 1 && (
            <View className="bg-emerald-50 rounded-2xl p-4 mb-5">
              <Text className="text-emerald-700 font-semibold text-sm mb-1">
                Dịch vụ này cần {service.form_schema.address_count} địa chỉ
              </Text>
              {service.form_schema.addresses?.map((addr) => (
                <Text key={addr.key} className="text-gray-700 text-sm">
                  • {addr.label}
                </Text>
              ))}
            </View>
          )}

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
          onSubmit={() => {
            // TODO: điều hướng sang bước tiếp theo (chọn thời gian/thanh toán)
          }}
          submitDisabled={groupItems.length === 0}
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
            style={{ opacity: estimatedPrice == null ? 0.5 : 1 }}
            disabled={estimatedPrice == null}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Đặt dịch vụ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
