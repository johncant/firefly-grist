<script lang="ts">
import { defineComponent } from 'vue'
import * as grist from 'grist-plugin-api'
import Tablesetup from './Tablesetup.vue'
import Connection from './Connection.vue'


export default defineComponent({
  data() {
    return {
      screen: "main_menu",
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
  methods: {
    mounted() {
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
          app.screen = "config";
        }
      });
    },
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
    newConnection() {
      this.screen = "connection";
    }
  },
  components: {
    "Tablesetup": Tablesetup,
    "Connection": Connection
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
  <Connection screen=screen v-if="screen == 'connection'" @close="screen = 'main_menu'"></Connection>
</template>
