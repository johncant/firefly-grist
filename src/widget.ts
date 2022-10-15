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
          "name": 'URL',
          "type": 'string'
        },
        {
          "name": 'AccessToken',
          "type": "string"
        }
      ],
      // Show configuration screen when we press "Open configuration" in the Creator panel.
      onEditOptions() {
        ui.screen = "config"
      }
    });

    // Grist will send "options" event when loaded with all options we stored.
    grist.onOptions(options => {
      console.log(options)
      // Read the apikey we saved in the document.
      app.firefly_iii_url = options?.firefly_iii_url || '';
      app.firefly_iii_personal_access_token = options?.firefly_iii_personal_access_token || '';
    });
  }
}
