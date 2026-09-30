export type Address = {
  id: number;
  label: string;
  receiver_name: string;
  receiver_phone: string;
  address_line: string;
  ward: string;
  city: string;
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
  latitude?: string;
  longitude?: string;
  is_default?: boolean;
};
