import * as grist from 'grist-plugin-api'

export default {
  init(app) {
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

    // Grist will send "options" event when loaded with all options we stored.
    grist.onOptions(options => {
      console.log(options)
      // Read the apikey we saved in the document.
      app.firefly_iii_url = options?.firefly_iii_url || '';
      app.firefly_iii_personal_access_token = options?.firefly_iii_personal_access_token || '';
    });
  },
  async saveConnection(connection) {
    const mappings = await grist.sectionApi.mappings()

    console.log(connection)
    const record = grist.mapColumnNamesBack(connection, {'mappings': mappings})

    if (record == null) {
      throw new Error("Columns were not mapped");
    }

    delete record['id']
    console.log(record)

    await grist.selectedTable.create({'fields': record})
  }
}
