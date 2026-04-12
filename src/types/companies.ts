export interface Company {
  id: string;
  name: string;
  bot_token: string;
  bot_username: string;
  brand_color: string;
  logo_url: string;
  is_active: boolean;
  supported_order_types: string[];
  min_order_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyPayload {
  name: string;
  bot_token: string;
  bot_username: string;
  brand_color: string;
  logo_url: string;
  is_active?: boolean;
  supported_order_types: string[];
  min_order_amount: number;
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
