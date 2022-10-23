
export interface FireflyTransactionJournal {
  user: string;
  transaction_journal_id: string;
  type: string;
  date: string;
  order: string;
  currency_id: string;
  currency_code: string;
  currency_symbol: string;
  currency_name: string;
  currency_decimal_places: string;
  foreign_currency_id: string;
  foreign_currency_code: string;
  foreign_currency_symbol: string;
  foreign_currency_decimal_places: string;
  amount: string;
  foreign_amount: string;
  description: string;
  source_id: string;
  source_name: string;
  source_iban: string;
  source_type: string;
  destination_id: string;
  destination_name: string;
  destination_iban: string;
  destination_type: string;
  budget_id: string;
  budget_name: string;
  category_id: string;
  category_name: string;
  bill_id: string;
  bill_name: string;
  reconciled: string;
  notes: string;
  tags: string;
  internal_reference: string;
  external_id: string;
  external_url: string;
  original_source: string;
  recurrence_id: string;
  recurrence_total: string;
  recurrence_count: string;
  bunq_payment_id: string;
  import_hash_v2: string;
  sepa_cc: string;
  sepa_ct_op: string;
  sepa_ct_id: string;
  sepa_db: string;
  sepa_country: string;
  sepa_ep: string;
  sepa_ci: string;
  sepa_batch_id: string;
  interest_date: string;
  book_date: string;
  process_date: string;
  due_date: string;
  payment_date: string;
  invoice_date: string;
  latitude: string;
  longitude: string;
  zoom_level: string;
  has_attachments: string;
}


export interface FireflyTransactionAttributes {
  created_at: any;
  updated_at: any;
  user: any;
  group_title: any;
  transactions: FireflyTransactionJournal;
}


export interface FireflyTransactions {
  type: string;
  id: string;
  attributes: FireflyTransactionAttributes;
  links: any;
}
