
export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export const MARGIN_BASE = 0.22; // 22%
export const CREDIT_CARD_TAX = 0.24; // 24%
