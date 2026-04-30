export interface AddressFormValues {
  shippingMethod: "delivery" | "pickup";
  fullname: string;
  street?: string;
  apartment?: string;
  zip?: string;
  city?: string;
  provinceId?: string;
  phone: string;
  dni: string;
  description?: string;
  rememberAddress?: boolean;
}
