import type { PickedFile } from "@/features/complaint/types/Complaint";
import { pickImage } from "@/utils/imagePicker";
import { showErrorToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

const THUMB_SIZE = 84;
const MAX_IMAGES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
    if (disabled) return;
    if (images.length >= MAX_IMAGES) {
      showErrorToast(
        "Quá số ảnh",
        `Chỉ được đính kèm tối đa ${MAX_IMAGES} ảnh.`,
      );
      return;
    }
    const file = await pickImage();
    if (!file) return;

    const mime = file.type?.toLowerCase();
    if (mime && mime.includes("/") && !ALLOWED_TYPES.includes(mime)) {
      showErrorToast(
        "Ảnh không hợp lệ",
        "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.",
      );
      return;
    }
    if (file.size && file.size > MAX_BYTES) {
      showErrorToast("Ảnh quá lớn", "Mỗi ảnh tối đa 5MB.");
      return;
    }
    onChange([...images, file]);
  };

  const handleRemove = (uri: string) => {
    onChange(images.filter((f) => f.uri !== uri));
  };

  return (
    <View>
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
      <Text className="text-[11px] text-gray-400 mt-2">
        {images.length}/{MAX_IMAGES} ảnh · JPG, PNG, WEBP · tối đa 5MB mỗi ảnh
      </Text>
    </View>
  );
}
