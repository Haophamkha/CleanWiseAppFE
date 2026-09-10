export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  ward: string;
  province: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}
