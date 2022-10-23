<script lang="ts">
import { defineComponent, toRaw } from 'vue'
import widget from './widget.js'
import type { FireflyConnectionRecord } from './types/FireflyConnectionRecord.js'
import Client from './client.js'
import * as _ from 'lodash' // TODO only require what we need to slim build

interface FetchAccountsData {
  table_name: string;
  connection?: FireflyConnectionRecord;
}
interface FetchAccountsMethods {
  setRecord: (rec: FireflyConnectionRecord) => null;
}
interface FetchAccountsComputed {
  client: Client;
}

type FetchAccounts = FetchAccountsData & FetchAccountsMethods & FetchAccountsComputed;

export default defineComponent({
  mounted() {
    widget.onRecord(this.setRecord);
    widget.fetchSelectedRecord().then(this.setRecord);
  },
  data(): FetchAccountsData {
    return {
      "table_name": "",
      "connection": undefined
    }
  },
  props: ["screen"],
  computed: {
    client(): Client {
      if (!this.connection) throw new Error("Connection is undefined")
      return new Client(this.connection);
    }
  },
  methods: {
    setRecord(this: FetchAccounts, rec: FireflyConnectionRecord) {
      if (rec && rec.id) this.connection = rec;
      console.log("setRecord")
      console.log(rec)
    },
    async fetchAccounts(this: FetchAccounts) {
      await widget.createOrOverwriteAccountsTable(this.table_name);
      const accounts = this.client.fetchAccounts();
      const table = await widget.getTable(this.table_name);
      for await (const account of accounts) {
        console.log(account)
        table.create({
          "fields": _.assign(account.attributes, {"firefly_iii_id": account.id})
        })
        // TODO - move logic to widget.ts and add progressbar
      }
    }
  },
  components: {},
});
</script>
<template>
  <transition>
    <div>
      <h3>Fetch Accounts</h3>

      <p>This will create or overwrite a table with accounts data.</p>

      <p v-if="connection">connection id: {{ connection.id }}</p>

      <p v-if="!connection">
        Add the connections table to this page and select a row to choose a connection.
      </p>

      <p v-if="connection">
        <label for="table_name">Table name</label><input type="text" v-model="table_name" />
      </p>

      <p v-if="connection">
        <button @click=fetchAccounts>Fetch</button>
      </p>

      <p>
        <button @click="$emit('close')">Back</button>
      </p>

    </div>
  </transition>
</template>
