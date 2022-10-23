
export interface FireflyAccountAttributes {
  created_at: any;
  updated_at: any;
  active: any;
  order: any;
  name: any;
  type: any;
  account_role: any;
  currency_id: any;
  currency_code: any;
  currency_symbol: any;
  currency_decimal_places: any;
  current_balance: any;
  current_balance_date: any;
  iban: any;
  bic: any;
  account_number: any;
  opening_balance: any;
  current_debt: any;
  opening_balance_date: any;
  virtual_balance: any;
  include_net_worth: any;
  credit_card_type: any;
  monthly_payment_date: any;
  liability_type: any;
  liability_direction: any;
  interest: any;
  interest_period: any;
  notes: any;
  latitude: any;
  longitude: any;
  zoom_level: any;
}

export interface FireflyAccount {
  id: string;
  type: string; // Could make this generic
  attributes: FireflyAccountData;
  links: any; // Not yet used
}
