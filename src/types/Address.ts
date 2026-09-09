export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string; // số nhà, tên đường
  ward: string;
  district: string;
  province: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}
