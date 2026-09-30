// utils/imagePicker.ts
import type { PickedFile } from "@/features/complaint/types/Complaint";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

type Options = {
  square?: boolean;
};

export async function pickImage(options?: Options): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Cần quyền truy cập",
      "Vui lòng cho phép ứng dụng truy cập thư viện ảnh.",
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    ...(options?.square && {
      allowsEditing: true,
      aspect: [1, 1] as [number, number],
    }),
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const name = asset.fileName ?? asset.uri.split("/").pop() ?? "photo.jpg";
  const type = asset.mimeType ?? "image/jpeg";

  return { uri: asset.uri, name, type };
}
