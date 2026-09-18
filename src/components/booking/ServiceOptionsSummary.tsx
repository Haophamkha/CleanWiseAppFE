// src/components/booking/ServiceOptionsSummary.tsx
import type { FormField, PricingConfig } from "@/types/Service";
import { formatVnd } from "@/utils/currency";
import { getItemTotalPrice } from "@/utils/servicePricing";
import { Text, View } from "react-native";
import {
    buildCaption,
    COLORS,
    getSelectedOption,
    resolveOptions,
} from "../service/formFieldShared";

export function ServiceOptionsSummary({
  fields,
  values,
  pricingConfig,
}: {
  fields: FormField[];
  values: Record<string, any>;
  pricingConfig?: PricingConfig;
}) {
  return (
    <View>
      {fields.map((field) => {
        if (field.type === "TASK_CHECKLIST") return null;

        if (field.type === "REPEATABLE_GROUP") {
          const items: Record<string, any>[] = values[field.key] ?? [];
          if (items.length === 0) return null;
          const itemFields = field.item_fields ?? [];
          const categoryField = itemFields[0];
          const categoryOptions = (categoryField?.options as any[]) ?? [];
          const optionField = itemFields.find(
            (f) =>
              f.key !== categoryField?.key &&
              f.options_by === categoryField?.key,
          );

          return (
            <View key={field.key} className="mb-1">
              <SectionLabel label={field.label} />
              {items.map((item, idx) => {
                const catOpt = categoryOptions.find(
                  (o) => o.value === item[categoryField?.key ?? ""],
                );
                const opt = optionField
                  ? getSelectedOption(optionField, item)
                  : undefined;
                const price = getItemTotalPrice(
                  pricingConfig,
                  itemFields,
                  item,
                );
                return (
                  <InfoRow
                    key={idx}
                    title={catOpt?.label ?? "—"}
                    subtitle={[opt?.label, `Số lượng: ${item.quantity ?? 1}`]
                      .filter(Boolean)
                      .join(" · ")}
                    trailing={price != null ? formatVnd(price) : undefined}
                  />
                );
              })}
            </View>
          );
        }

        const value = values[field.key];
        if (value === undefined || value === null || value === "") return null;

        if (field.type === "SINGLE_SELECT") {
          const opt = getSelectedOption(field, values);
          if (!opt) return null;
          const caption = buildCaption(opt, false, pricingConfig);
          return (
            <View key={field.key} className="mb-1">
              <SectionLabel label={field.label} />
              <InfoRow
                title={opt.label}
                subtitle={opt.description}
                trailing={caption}
              />
            </View>
          );
        }

        if (field.type === "MULTI_SELECT") {
          const selected: string[] = Array.isArray(value) ? value : [];
          if (selected.length === 0) return null;
          const options = resolveOptions(field, values);
          return (
            <View key={field.key} className="mb-1">
              <SectionLabel label={field.label} />
              {selected.map((v) => {
                const opt = options.find((o) => o.value === v);
                if (!opt) return null;
                const caption = buildCaption(opt, true, pricingConfig);
                return (
                  <InfoRow
                    key={v}
                    title={opt.label}
                    subtitle={opt.description}
                    trailing={caption}
                  />
                );
              })}
            </View>
          );
        }

        if (field.type === "WEEKDAY_MULTI_SELECT") {
          const selected: string[] = Array.isArray(value) ? value : [];
          if (selected.length === 0) return null;
          const options = (field.options as any[]) ?? [];
          const labels = selected
            .map((v) => options.find((o) => o.value === v)?.label ?? v)
            .join(", ");
          return (
            <View key={field.key} className="mb-1">
              <SectionLabel label={field.label} />
              <InfoRow title={labels} />
            </View>
          );
        }

        if (field.type === "BOOLEAN") {
          if (!value) return null;
          return (
            <View key={field.key} className="mb-1">
              <SectionLabel label={field.label} />
              <InfoRow title="Có" />
            </View>
          );
        }

        // QUANTITY, TEXT, TEXTAREA, TIME
        return (
          <View key={field.key} className="mb-1">
            <SectionLabel label={field.label} />
            <InfoRow title={String(value)} />
          </View>
        );
      })}
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      className="text-[12px] font-bold uppercase mb-1.5 mt-3"
      style={{ color: COLORS.textMuted, letterSpacing: 0.3 }}
    >
      {label}
    </Text>
  );
}

function InfoRow({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: string;
}) {
  return (
    <View className="flex-row items-center justify-between mb-2">
      <View className="flex-1 pr-2">
        <Text
          className="text-[14px] font-semibold"
          style={{ color: COLORS.text }}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            className="text-[12px] mt-0.5"
            style={{ color: COLORS.textMuted }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {!!trailing && (
        <Text
          className="text-[14px] font-bold"
          style={{ color: COLORS.primary }}
        >
          {trailing}
        </Text>
      )}
    </View>
  );
}
