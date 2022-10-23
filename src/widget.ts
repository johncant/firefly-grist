import * as _grist from 'grist-plugin-api'
import type { App } from './types/App.js'
import type { TableSetup } from './types/TableSetup.js'
import type { FireflyConnection } from './types/FireflyConnection.js'
import * as _ from 'lodash' // TODO only require what we need to slim build

const grist : any = _grist // TODO - why are typings not correct?

export default {
  init(app: App) {
    // Tell Grist that we are ready, and inform about our requirements.
    grist.ready({
      // We need full access to the document, in order to update stock prices.
      requiredAccess: 'full',
      // We need some information how to read the table.
      // Don't bother with column mappings - it doesn't really fit our use case and adds complexity
      columns: [],
      // Show configuration screen when we press "Open configuration" in the Creator panel.
      onEditOptions() {
        app.screen = "tablesetup"
      }
    });

  },
  async getTableColumnNames(name: string): Promise<string[]> {
    const data = await grist.docApi.fetchTable(name);

    return _.keys(_.omit(data, 'manualSort', 'id'));
  },
  async getTableSetup(): Promise<TableSetup> {
    const name = await grist.selectedTable.getTableId()

    const required_columns: string[] = ["firefly_iii_url", "firefly_iii_personal_access_token"];
    const existing_columns: string[] = await this.getTableColumnNames(name);

    const all_columns: string[] = _.union(required_columns, existing_columns);

    function statusMessage(col: string) {
      const is_required = required_columns.includes(col);
      const is_present = existing_columns.includes(col);

      if (is_required && is_present) {
        return "Ok"
      } else if (is_required) {
        return "Missing"
      } else {
        return "Not needed"
      }
    }

    const results = all_columns.map((col) => {
      return {name: col, status_message: statusMessage(col)}
    })

    return {
      "name": name,
      "column_info": results
    }

  },
  async saveConnection(connection: FireflyConnection) {
    await grist.selectedTable.create({'fields': connection})
  },
  async createOrOverwriteTable(table_name: string, columns: any[]) {
    const all_tables = await grist.docApi.listTables();
    const needs_deletion = all_tables.includes(table_name);

    const actions = [];
    
    if (needs_deletion) actions.push(["RemoveTable", table_name])

    actions.push(
      ["AddTable", table_name, columns]
    )

    await grist.docApi.applyUserActions(actions)

    return
  },
  async modifyTableInPlace(table_name: string, columns: any[]) {
    const required_column_names: string[] = columns.map((c) => c.id);
    const existing_column_names: string[] = await this.getTableColumnNames(table_name);
    const actions: any[] = [];

    // Delete extra cols
    //
    existing_column_names.forEach((col) => {
      if (!required_column_names.includes(col)) {
        actions.push(["RemoveColumn", table_name, col])
      }
    })

    // Add missing cols
    columns.forEach((col) => {
      if (!existing_column_names.includes(col.id)) {
        actions.push(["AddColumn", table_name, col.id, col])
      }
    })

    if (actions.length > 0) await grist.docApi.applyUserActions(actions);

    return
  },
  async createOrOverwriteConnectionsTable(table_name: string) {
    const columns = [
      {isFormula: true, type: "Any", id: "firefly_iii_url", formula: ""},
      {isFormula: true, type: "Any", id: "firefly_iii_personal_access_token", formula: ""},
    ];
    await this.modifyTableInPlace(table_name, columns);
  },
  async createOrOverwriteAccountsTable(table_name: string) {
    const columns = [
      {isFormula: true, type: "Any", id: "firefly_iii_id", formula: ""},
      {isFormula: true, type: "Any", id: "created_at", formula: ""},
      {isFormula: true, type: "Any", id: "updated_at", formula: ""},
      {isFormula: true, type: "Any", id: "active", formula: ""},
      {isFormula: true, type: "Any", id: "order", formula: ""},
      {isFormula: true, type: "Any", id: "name", formula: ""},
      {isFormula: true, type: "Any", id: "type", formula: ""},
      {isFormula: true, type: "Any", id: "account_role", formula: ""},
      {isFormula: true, type: "Any", id: "currency_id", formula: ""},
      {isFormula: true, type: "Any", id: "currency_code", formula: ""},
      {isFormula: true, type: "Any", id: "currency_symbol", formula: ""},
      {isFormula: true, type: "Any", id: "currency_decimal_places", formula: ""},
      {isFormula: true, type: "Any", id: "current_balance", formula: ""},
      {isFormula: true, type: "Any", id: "current_balance_date", formula: ""},
      {isFormula: true, type: "Any", id: "iban", formula: ""},
      {isFormula: true, type: "Any", id: "bic", formula: ""},
      {isFormula: true, type: "Any", id: "account_number", formula: ""},
      {isFormula: true, type: "Any", id: "opening_balance", formula: ""},
      {isFormula: true, type: "Any", id: "current_debt", formula: ""},
      {isFormula: true, type: "Any", id: "opening_balance_date", formula: ""},
      {isFormula: true, type: "Any", id: "virtual_balance", formula: ""},
      {isFormula: true, type: "Any", id: "include_net_worth", formula: ""},
      {isFormula: true, type: "Any", id: "credit_card_type", formula: ""},
      {isFormula: true, type: "Any", id: "monthly_payment_date", formula: ""},
      {isFormula: true, type: "Any", id: "liability_type", formula: ""},
      {isFormula: true, type: "Any", id: "liability_direction", formula: ""},
      {isFormula: true, type: "Any", id: "interest", formula: ""},
      {isFormula: true, type: "Any", id: "interest_period", formula: ""},
      {isFormula: true, type: "Any", id: "notes", formula: ""},
      {isFormula: true, type: "Any", id: "latitude", formula: ""},
      {isFormula: true, type: "Any", id: "longitude", formula: ""},
      {isFormula: true, type: "Any", id: "zoom_level", formula: ""}
    ]
    await this.createOrOverwriteTable(table_name, columns)
    return
  },
  async createOrOverwriteTransactionGroupTable(table_name: string) {
    const columns = [
      {isFormula: true, type: "Any", id: "firefly_iii_id", formula: ""},
      {isFormula: true, type: "Any", id: "created_at", formula: ""},
      {isFormula: true, type: "Any", id: "updated_at", formula: ""},
      {isFormula: true, type: "Any", id: "user", formula: ""},
      {isFormula: true, type: "Any", id: "group_title", formula: ""},
    ]
    await this.createOrOverwriteTable(table_name, columns);
    return
  },
  async createOrOverwriteTransactionJournalTable(table_name: string) {
    const columns = [
      {isFormula: true, type: "Any", id: "user", formula: ""},
      {isFormula: true, type: "Any", id: "transaction_journal_id", formula: ""},
      {isFormula: true, type: "Any", id: "type", formula: ""},
      {isFormula: true, type: "Any", id: "date", formula: ""},
      {isFormula: true, type: "Any", id: "order", formula: ""},
      {isFormula: true, type: "Any", id: "currency_id", formula: ""},
      {isFormula: true, type: "Any", id: "currency_code", formula: ""},
      {isFormula: true, type: "Any", id: "currency_symbol", formula: ""},
      {isFormula: true, type: "Any", id: "currency_name", formula: ""},
      {isFormula: true, type: "Any", id: "currency_decimal_places", formula: ""},
      {isFormula: true, type: "Any", id: "foreign_currency_id", formula: ""},
      {isFormula: true, type: "Any", id: "foreign_currency_code", formula: ""},
      {isFormula: true, type: "Any", id: "foreign_currency_symbol", formula: ""},
      {isFormula: true, type: "Any", id: "foreign_currency_decimal_places", formula: ""},
      {isFormula: true, type: "Any", id: "amount", formula: ""},
      {isFormula: true, type: "Any", id: "foreign_amount", formula: ""},
      {isFormula: true, type: "Any", id: "description", formula: ""},
      {isFormula: true, type: "Any", id: "source_id", formula: ""},
      {isFormula: true, type: "Any", id: "source_name", formula: ""},
      {isFormula: true, type: "Any", id: "source_iban", formula: ""},
      {isFormula: true, type: "Any", id: "source_type", formula: ""},
      {isFormula: true, type: "Any", id: "destination_id", formula: ""},
      {isFormula: true, type: "Any", id: "destination_name", formula: ""},
      {isFormula: true, type: "Any", id: "destination_iban", formula: ""},
      {isFormula: true, type: "Any", id: "destination_type", formula: ""},
      {isFormula: true, type: "Any", id: "budget_id", formula: ""},
      {isFormula: true, type: "Any", id: "budget_name", formula: ""},
      {isFormula: true, type: "Any", id: "category_id", formula: ""},
      {isFormula: true, type: "Any", id: "category_name", formula: ""},
      {isFormula: true, type: "Any", id: "bill_id", formula: ""},
      {isFormula: true, type: "Any", id: "bill_name", formula: ""},
      {isFormula: true, type: "Any", id: "reconciled", formula: ""},
      {isFormula: true, type: "Any", id: "notes", formula: ""},
      {isFormula: true, type: "Any", id: "tags", formula: ""},
      {isFormula: true, type: "Any", id: "internal_reference", formula: ""},
      {isFormula: true, type: "Any", id: "external_id", formula: ""},
      {isFormula: true, type: "Any", id: "external_url", formula: ""},
      {isFormula: true, type: "Any", id: "original_source", formula: ""},
      {isFormula: true, type: "Any", id: "recurrence_id", formula: ""},
      {isFormula: true, type: "Any", id: "recurrence_total", formula: ""},
      {isFormula: true, type: "Any", id: "recurrence_count", formula: ""},
      {isFormula: true, type: "Any", id: "bunq_payment_id", formula: ""},
      {isFormula: true, type: "Any", id: "import_hash_v2", formula: ""},
      {isFormula: true, type: "Any", id: "sepa_cc", formula: ""},
      {isFormula: true, type: "Any", id: "sepa_ct_op", formula: ""},
      {isFormula: true, type: "Any", id: "sepa_ct_id", formula: ""},
      {isFormula: true, type: "Any", id: "sepa_db", formula: ""},
      {isFormula: true, type: "Any", id: "sepa_country", formula: ""},
      {isFormula: true, type: "Any", id: "sepa_ep", formula: ""},
      {isFormula: true, type: "Any", id: "sepa_ci", formula: ""},
      {isFormula: true, type: "Any", id: "sepa_batch_id", formula: ""},
      {isFormula: true, type: "Any", id: "interest_date", formula: ""},
      {isFormula: true, type: "Any", id: "book_date", formula: ""},
      {isFormula: true, type: "Any", id: "process_date", formula: ""},
      {isFormula: true, type: "Any", id: "due_date", formula: ""},
      {isFormula: true, type: "Any", id: "payment_date", formula: ""},
      {isFormula: true, type: "Any", id: "invoice_date", formula: ""},
      {isFormula: true, type: "Any", id: "latitude", formula: ""},
      {isFormula: true, type: "Any", id: "longitude", formula: ""},
      {isFormula: true, type: "Any", id: "zoom_level", formula: ""},
      {isFormula: true, type: "Any", id: "has_attachments", formula: ""}
    ]
    await this.createOrOverwriteTable(table_name, columns);
    return
  },
  getTable: grist.getTable,

  // TODO - clean up types
  async fetchCompleteSelectedRecord(id: number) : Promise<any> {
    const name = await grist.selectedTable.getTableId()
    return grist.docApi.fetchTable(name).then((data: { [key: string]: any; }) => {
      const index: number = data.id.indexOf(id)
      const completeRecord: { [key: string]: any; } = {}
      for (const key in data) {
        if (data.hasOwnProperty(key) && key != 'manualSort') {
          completeRecord[key] = data[key][index];
        }
      }
      return completeRecord;
    })
  },
  async fetchSelectedRecord(): Promise<any> {
    return grist.viewApi.fetchSelectedRecord().then((rec: any) => {
      this.fetchCompleteSelectedRecord(rec.id)
    });
  },
  onRecord(func: (rec: any) => void) {
    // We only get a subset of the columns if we don't use mapping
    grist.onRecord((subsetRec: any) => {
      this.fetchCompleteSelectedRecord(subsetRec.id).then(func)
    })
  },
}
