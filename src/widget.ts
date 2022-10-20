import * as _grist from 'grist-plugin-api'
import type { App } from './types/App.js'
import type { TableSetup } from './types/TableSetup.js'
import type { FireflyConnection } from './types/FireflyConnection.js'

const grist : any = _grist // TODO - why are typings not correct?

export default {
  init(app: App) {
    // Tell Grist that we are ready, and inform about our requirements.
    grist.ready({
      // We need full access to the document, in order to update stock prices.
      requiredAccess: 'full',
      // We need some information how to read the table.
      columns: [
        {
          "name": 'firefly_iii_url',
          "type": 'Text',
        },
        {
          "name": 'firefly_iii_personal_access_token',
          "type": "Text",
          "optional": true
        }
      ],
      // Show configuration screen when we press "Open configuration" in the Creator panel.
      onEditOptions() {
        app.screen = "tablesetup"
      }
    });

  },
  async getTableSetup(): Promise<TableSetup> {
    const name = await grist.selectedTable.getTableId()

    const required_columns: string[]  = ["firefly_iii_url", "firefly_iii_personal_access_token"]
    const mapped_columns = await grist.mapColumnNamesBack(required_columns)

    function statusMessage(col: string) {
      if(mapped_columns == null) {
        return "Column mapping incomplete"
      } else {
        return "Mapped successfully"
      }
    }

    const results = required_columns.map((col) => {
      return {name: col, status_message: statusMessage(col)}
    })

    return {
      "name": name,
      "column_info": results
    }

  },

  async saveConnection(connection: FireflyConnection) {
    const mappings = await grist.sectionApi.mappings()

    console.log(connection)
    const record = grist.mapColumnNamesBack(connection, {'mappings': mappings})

    if (record == null) {
      throw new Error("Columns were not mapped");
    }

    delete record['id']
    console.log(record)

    await grist.selectedTable.create({'fields': record})
  },
  async createOrOverwriteTable(table_name: string, columns: any[]) {
    const all_tables = await grist.docApi.listTables();
    const needs_deletion = table_name in all_tables;

    const actions = [];
    
    if (needs_deletion) actions.push(["RemoveTable", table_name])

    actions.push(
      ["AddTable", table_name, columns]
    )

    await grist.docApi.applyUserActions(actions)

    return
  },
  async createOrOverwriteAccountsTable(table_name: string) {
    const columns = [
      {isFormula: true, type: "Any", id: "blabla", formula: ""}
    ]
    await this.createOrOverwriteTable(table_name, columns)
    return
  },
  onRecord: grist.onRecord,
  fetchSelectedRecord: grist.viewApi.fetchSelectedRecord
}
