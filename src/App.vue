<script lang="ts">
import { defineComponent } from 'vue'
import Tablesetup from './Tablesetup.vue'

export default defineComponent({
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
})
</script>
<template>
  <h2>Grist Firefly Widget</h2>

  <div id="main_menu" v-if="screen == 'main_menu'">
    <h3>Main menu</h3>

    <p>
      <button @click="screen = 'tablesetup'">Table setup</button>
    </p>

    <p>
      <button @click=newConnection>Add connection</button>
    </p>

    <p>
      <button>Fetch data</button>
    </p>
  </div>

  <Tablesetup screen=screen v-if="screen == 'tablesetup'" @close="screen = 'main_menu'"></TableSetup>
</template>
