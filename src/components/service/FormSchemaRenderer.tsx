// src/components/service/FormSchemaRenderer.tsx
import type { FormField } from "@/types/Service";
import { Text, View } from "react-native";
import { COLORS, FieldControl, Values } from "./formFieldShared";
import { RepeatableCategoryGroupField } from "./RepeatableCategoryGroupField";
import { TaskChecklist } from "./TaskChecklist";

export function FormSchemaRenderer({
  fields,
  values,
  pricingConfig,
  taskChecklist,
  onChange,
}: {
  fields: FormField[];
  values: Values;
  pricingConfig?: any;
  taskChecklist?: string;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <View>
      {fields.map((field) => {
        if (field.type === "TASK_CHECKLIST") {
          return <TaskChecklist key={field.key} content={taskChecklist} />;
        }

        return (
          <View key={field.key} className="mb-6">
            {field.type !== "BOOLEAN" && (
              <View className="flex-row items-center mb-2">
                <Text
                  className="font-bold text-[16px]"
                  style={{ color: COLORS.text }}
                >
                  {field.label}
                </Text>
                {field.required && (
                  <Text className="ml-1" style={{ color: COLORS.danger }}>
                    *
                  </Text>
                )}
              </View>
            )}

            {field.type === "REPEATABLE_GROUP" ? (
              <RepeatableCategoryGroupField
                field={field}
                value={values[field.key] ?? []}
                pricingConfig={pricingConfig}
                onChange={(v) => onChange(field.key, v)}
              />
            ) : (
              <FieldControl
                field={field}
                value={values[field.key]}
                siblingValues={values}
                pricingConfig={pricingConfig}
                onChange={(v) => onChange(field.key, v)}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
