<script lang="ts">
import { defineComponent, toRaw } from 'vue'
import widget from './widget.js'
import type { FireflyConnectionRecord } from './types/FireflyConnectionRecord.js'

interface FetchAccounts {
  table_name: string;
  connection: FireflyConnectionRecord;
  setRecord: (FireflyConnectionRecord) => null
}

export default defineComponent({
  mounted() {
    widget.onRecord(this.setRecord);
    widget.fetchSelectedRecord().then(this.setRecord);
  },
  data() {
    return {
      "table_name": "",
      "connection": null
    }
  },
  props: ["screen"],
  computed: {
  },
  methods: {
    setRecord(rec: FireflyConnectionRecord) {
      this.connection = rec
    },
    fetchAccounts(this: FetchAccounts) {
      console.log(toRaw(this.connection))
      widget.createOrOverwriteAccountsTable(this.table_name);
    }
  },
  components: {
  },
});
</script>
<template>
  <transition>
    <div>
      <h3>Fetch Accounts</h3>

      <p>This will create or overwrite a table with accounts data.</p>

      <p v-if="connection">connection id: {{ connection.id }}</p>

      <p v-if="!connection">
        Select a row to choose a connection
      </p>

      <p v-if="connection">
        <label for="table_name">Table name</label><input type="text" :value="table_name" />
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
