import * as _grist from 'grist-plugin-api'
import { App } from './types/App.js'
import { FireflyConnection } from './types/FireflyConnection.js'

const grist : Any = _grist // TODO - why are typings not correct?

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
  async createOrOverwriteAccountsTable(table_name: string) {
    await grist.docApi.applyUserActions([
      ["RemoveTable", "Quux"],
      ["AddTable", "Quux", [
        {isFormula: true, type: "Any", id: "blabla", formula: ""}
      ]]
    ])
  },
  onRecord: grist.onRecord,
  fetchSelectedRecord: grist.viewApi.fetchSelectedRecord
}
