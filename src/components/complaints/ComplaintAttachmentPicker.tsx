import type { PickedFile } from "@/types/Complaint";
import { pickImage } from "@/utils/imagePicker";
import { Feather } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, View } from "react-native";

const THUMB_SIZE = 84;
const MAX_IMAGES = 5;

export function ComplaintAttachmentPicker({
  images,
  onChange,
  disabled,
}: {
  images: PickedFile[];
  onChange: (files: PickedFile[]) => void;
  disabled?: boolean;
}) {
  const handleAdd = async () => {
    if (disabled || images.length >= MAX_IMAGES) return;
    const file = await pickImage();
    if (file) onChange([...images, file]);
  };

  const handleRemove = (uri: string) => {
    onChange(images.filter((f) => f.uri !== uri));
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row" style={{ gap: 10 }}>
        {images.map((file) => (
          <View
            key={file.uri}
            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
            className="rounded-2xl overflow-hidden border border-[#F3F4F6] bg-[#F3F4F6]"
          >
            <Image
              source={{ uri: file.uri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            {!disabled && (
              <Pressable
                onPress={() => handleRemove(file.uri)}
                hitSlop={8}
                className="absolute top-1 right-1 w-6 h-6 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(17,24,39,0.75)" }}
              >
                <Feather name="x" size={14} color="#fff" />
              </Pressable>
            )}
          </View>
        ))}

        {!disabled && images.length < MAX_IMAGES && (
          <Pressable
            onPress={handleAdd}
            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
            className="rounded-2xl items-center justify-center border-2 border-dashed border-[#EF4444] bg-[#FEF2F2]"
          >
            <Feather name="camera" size={20} color="#EF4444" />
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
