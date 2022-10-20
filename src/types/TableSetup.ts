export interface ColumnSetup {
  name: string;
  status_message: string;
}

export interface TableSetup {
  name: string;
  column_info: ColumnSetup[];
}
