<script lang="ts">
import { defineComponent } from 'vue'
import Tablesetup from './Tablesetup.vue'
import Connection from './Connection.vue'
import FetchAccounts from './FetchAccounts.vue'
import FetchTransactions from './FetchTransactions.vue'
import widget from './widget.js'
import type { App } from './types/App.js'


export default defineComponent({
  data() {
    return {
      screen: "main_menu",
    }
  },
  methods: {
    newConnection(this: App) {
      this.screen = "connection";
    }
  },
  mounted(this: App) {
    widget.init(this);
  },
  components: {
    "Tablesetup": Tablesetup,
    "Connection": Connection,
    "FetchAccounts": FetchAccounts,
    "FetchTransactions": FetchTransactions,
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
      <button @click="screen = 'fetch_accounts'">Fetch Accounts</button>
    </p>

    <p>
      <button @click="screen = 'fetch_transactions'">Fetch Transactions</button>
    </p>
  </div>

  <Tablesetup screen=screen v-if="screen == 'tablesetup'" @close="screen = 'main_menu'"></TableSetup>
  <Connection screen=screen v-if="screen == 'connection'" @close="screen = 'main_menu'" widget=widget></Connection>
  <FetchAccounts screen=screen v-if="screen == 'fetch_accounts'" @close="screen = 'main_menu'" widget=widget></FetchAccounts>
  <FetchTransactions screen=screen v-if="screen == 'fetch_transactions'" @close="screen = 'main_menu'" widget=widget></FetchTransactions>
</template>
