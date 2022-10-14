import { createApp } from 'vue/dist/vue.esm-bundler'
const grist = require('grist-plugin-api')

//const Tablesetup = require('./Tablesetup.vue')
import Tablesetup from  './Tablesetup.vue'
console.log(Tablesetup)

//const normalizeUrl = require('normalize-url').normalizeUrl;
//const axios = require("axios")

// Copied and modified from https://github.com/gristlabs/grist-widget/blob/master/stock-monitor/index.js


// To update Grist table, we first need to know what table we are connected to.
// Here we will listen to all messages sent from Grist to our custom widget,
// and if any of this message has a tableId, we will store it in global window
// object.
let tableId;

if (typeof(grist) === "undefined") {
  throw "grist is not defined"
}

grist.on("message", (data) => {
  if (data.tableId) {
    tableId = data.tableId;
  }
});

grist.onRecord(async function(record, mappings) {
  console.log("onRecord")
  console.log(record)
  console.log(mappings)
  const foo = await grist.mapColumnNames(record)
  console.log(foo)
})

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

// Next we will listen to onRecords event and store the information
// that is send with this event in two global variables.
let rows = null; // All rows in a table.
let mappings = null; // Column mappings configuration.

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

// Here we will use VueJS framework to bind JavaScript object to HTML.
const app = createApp({
  data() {
    return {
      screen: "main_menu",
      firefly_iii_url: "foo",
      firefly_iii_personal_access_token: "",
      test_waiting: false,
      test_result: "",
      // If we are currently waiting for the prices.
      waiting: false,
      // Api key stored inside the textbox on thebootstrap grain configuration screen.
      apikey: '',
      // Holds error message that can be shown on the UI.
      error: '',
      // If config screen is visible.
      config: false,
      // Current status.
      message: 'Wait ...',
      // Holds last date we updated the stock price (optional)
      updated: null,
      // List of all stock symbols and their last read prices.
      list: [{
      }]
    }
  },
  computed: {
    testComputed() {
      return "foobar"
    },
    firefly_iii_url_valid() {
      return this.firefly_iii_url.length > 0
    },
    firefly_iii_clean_url() {
      return this.firefly_iii_url //normalizeUrl(this.firefly_iii_url)
    },
    firefly_iii_config_url() {
      return this.firefly_iii_clean_url+"/profile#oauth"
    }
  },
  methods: {
    refresh() {
      refreshClicked();
    },
    saveConfig() {
      console.log("saving config")
      console.log(this)
      this.config = false;
      grist.setOption("firefly_iii_url", this.firefly_iii_url);
      grist.setOption("firefly_iii_personal_access_token", this.firefly_iii_personal_access_token);
    },
    client() {
      return axios.create({
        baseURL: this.firefly_iii_clean_url,
        headers: {
          'Authorization': 'Bearer '+this.firefly_iii_personal_access_token
        }
      })
    },
    testConnectivity() {
      this.test_waiting = true;
      this.client().get("/api/v1/about")
      .then(response => {
        this.test_result = JSON.stringify(response.data.data)
      }, error => {
        this.test_result = error.message
      }).finally(() => {
        this.test_waiting = false
      })
    },
    fetchTransactions() {
      this.client.get("")
    },

  },
  components: {
    "Tablesetup": Tablesetup,
    "AddConnection": {
      template: "#AddConnection",
      data() {
        return {
          loading: true,
          name: null,
          results: []
        }
      },
      props: ['screen'],
      methods: {
      }
    }
  }
}).mount('#app')

