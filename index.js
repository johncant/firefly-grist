//const normalizeUrl = require('normalize-url').normalizeUrl;
//const axios = require("axios")

// Copied and modified from https://github.com/gristlabs/grist-widget/blob/master/stock-monitor/index.js


// To update Grist table, we first need to know what table we are connected to.
// Here we will listen to all messages sent from Grist to our custom widget,
// and if any of this message has a tableId, we will store it in global window
// object.
let tableId;
grist.on("message", (data) => {
  if (data.tableId) {
    tableId = data.tableId;
  }
});

// Next we will listen to onRecords event and store the information
// that is send with this event in two global variables.
let rows = null; // All rows in a table.
let mappings = null; // Column mappings configuration.
//
grist.onRecords((_rows, _mappings) => {
  mappings = _mappings;
  rows = grist.mapColumnNames(_rows);
  if (!rows) {
    // grist.mapColumnNames helper will return null if not all
    // columns are mapped.
    app.error = "Please map columns";
  } else {
    app.error = "";
    app.updated = rows.length ? Math.max(...rows.map(r => r.Updated ?? 0)) : 0;
    // Get prices and symbols from rows.
    const symbols = new Set(rows.map(x => x.Name));
    app.list = Array.from(symbols).map(s => ({
      Name: s,
      Price: rows.find(r => r.Name === s)?.Price
    }));
  }
})


async function fetchPrices(symbols) {
  const key = `polygon-${new Date().toISOString().slice(0, 13)}`;
  const today = new Date().toISOString().slice(0, 10);
  // We are querying daily aggregated data, so we will cache it for 1 hour.
  if (!localStorage.getItem(key)) {
    // Endpoint documentation can be found at: 
    // https://polygon.io/docs/stocks/get_v2_aggs_grouped_locale_us_market_stocks__date
    const url = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${today}?adjusted=true&apiKey=${app.apikey}`;
    const res = await fetch(url);
    if (res.status === 200) {
      const result = await res.json();
      if (result?.error) {
        throw new Error(result?.error);
      }
      // Store successful response in local storage.
      localStorage.setItem(key, JSON.stringify(result));
      // To clear previous cache (from an hour before), we will also
      // store current item's key under 'polygon' key, and use its value
      // to clear previous cached result.
      if (localStorage.getItem(`polygon`)) {
        localStorage.removeItem(localStorage.getItem('polygon'));
      }
      localStorage.setItem('polygon', key);
    } else {
      throw new Error(res.statusText || `Error response with ${res.status}`);
    }
  }
  const result = JSON.parse(localStorage.getItem(key));
  const map = new Map();
  for(const r of result.results) {
    // Map all symbols to prices
    map.set(r.T, r.c);
  }
  const prices = []; 
  for(const s of symbols) {
    const price = map.has(s) ? map.get(s) : null;
    prices.push({Name: s, Price: price});
  }
  return prices;
}

// Function invoked when we press the Refresh button.
const refreshClicked = async () => {
  if (!rows) {
    app.error = "Please map columns";
    return;
  }
  if (!app.apikey) {
    app.error = "Please enter API key";
    return;
  }
  try {
    app.waiting = true;
    app.error = null;
    // Remove duplicates from symbols.
    const toQuery = Array.from(new Set(rows.map(r => r.Name)));
    const prices = await fetchPrices(toQuery);
    const rowIds = [];
    const values = [];
    for (const r of rows) {
      const price = prices.find(x => x.Name == r.Name)?.Price;
      rowIds.push(r.id);
      values.push(price ?? "Not found");
    }
    const priceColumn = mappings['Price'];
    await grist.docApi.applyUserActions([
      ['BulkUpdateRecord', tableId, rowIds, {[priceColumn]: values}]
    ]);
  } catch (err) {
    console.log(err);
    app.error = err.message;
  } finally {
    app.waiting = false;
  }
};

// Tell Grist that we are ready, and inform about our requirements.
grist.ready({
  // We need full access to the document, in order to update stock prices.
  requiredAccess: 'full',
  // We need some information how to read the table.
  columns: [
  ],
  // Show configuration screen when we press "Open configuration" in the Creator panel.
  onEditOptions() {
    app.config = true;
  }
});

// Grist will send "options" event when loaded with all options we stored.
grist.onOptions(options => {
  console.log(options)
  // Read the apikey we saved in the document.
  app.firefly_iii_url = options?.firefly_iii_url || '';
  app.firefly_iii_personal_access_token = options?.firefly_iii_personal_access_token || '';
});

// Here we will use VueJS framework to bind JavaScript object to HTML.
const app = Vue.createApp({
  data() {
    return {
      firefly_iii_url: "foo",
      firefly_iii_personal_access_token: "",
      test_waiting: false,
      test_result: "",
      // If we are currently waiting for the prices.
      waiting: false,
      // Api key stored inside the textbox on the configuration screen.
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
    }
  }
}).mount('#app')
