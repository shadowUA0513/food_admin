export type PaymentAcceptingStyle = "non-o" | "o";

export const PAYMENT_ACCEPTING_STYLE_OPTIONS: Array<{
  value: PaymentAcceptingStyle;
  label: string;
}> = [
  { value: "non-o", label: "non-o" },
  { value: "o", label: "o" },
];

export interface Company {
  id: string;
  name: string;
  bot_token: string;
  bot_username: string;
  telegram_chat_id: number | null;
  phone_numbers: string[];
  card_pans: string[];
  brand_color: string;
  logo_url: string;
  is_active: boolean;
  supported_order_types: string[];
  min_order_amount: number;
  payment_accepting_style?: PaymentAcceptingStyle;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyPayload {
  name: string;
  bot_token: string;
  bot_username: string;
  telegram_chat_id: number | null;
  phone_numbers: string[];
  card_pans: string[];
  brand_color: string;
  logo_url: string;
  is_active?: boolean;
  supported_order_types: string[];
  min_order_amount: number;
  payment_accepting_style: PaymentAcceptingStyle;
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

export interface CompanyCreateResponse {
  company: Company;
}

export interface CompanyDetailsResponse {
  data: Company;
}

export interface CompanyListResponse {
  error: boolean;
  data: {
    companies: Company[];
    count: number;
  };
}
