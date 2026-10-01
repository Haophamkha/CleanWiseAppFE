export type Address = {
  id: number;
  label: string;
  receiver_name: string;
  receiver_phone: string;
  address_line: string;
  ward: string;
  city: string;
  province_code: string;
  ward_code: string;
  latitude: string | null;
  longitude: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AddressPayload = {
  label?: string;
  receiver_name: string;
  receiver_phone: string;
  address_line: string;
  ward: string;
  city: string;
  ward_code: string;
  latitude?: string;
  longitude?: string;
  is_default?: boolean;
};

// Dữ liệu tỉnh/phường lấy từ BE (bảng Area)
export type AreaProvince = { province_code: string; city: string };
export type AreaWard = {
  id: number;
  name: string;
  city: string;
  province_code: string;
  ward_code: string;
};
