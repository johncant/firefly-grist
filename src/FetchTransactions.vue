<script lang="ts">
import { defineComponent, toRaw } from 'vue'
import widget from './widget.js'
import type { FireflyConnectionRecord } from './types/FireflyConnectionRecord.js'
import Client from './client.js'
import * as _ from 'lodash' // TODO only require what we need to slim build

interface FetchTransactionsData {
  transaction_journal_table_name: string;
  transaction_group_table_name: string;
  connection?: FireflyConnectionRecord;
}
interface FetchTransactionsMethods {
  setRecord: (rec: FireflyConnectionRecord) => null;
}
interface FetchTransactionsComputed {
  client: Client;
}

type FetchTransactions = FetchTransactionsData & FetchTransactionsMethods & FetchTransactionsComputed;

export default defineComponent({
  mounted() {
    widget.onRecord(this.setRecord);
    widget.fetchSelectedRecord().then(this.setRecord);
  },
  data(): FetchTransactionsData {
    return {
      "transaction_journal_table_name": "Firefly_transaction_journal",
      "transaction_group_table_name": "Firefly_transaction_group",
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
    setRecord(this: FetchTransactions, rec: FireflyConnectionRecord) {
      if (rec && rec.id) this.connection = rec;
      console.log("setRecord")
      console.log(rec)
    },
    async fetchTransactions(this: FetchTransactions) {
      await widget.createOrOverwriteTransactionGroupTable(this.transaction_group_table_name);
      await widget.createOrOverwriteTransactionJournalTable(this.transaction_journal_table_name);
      const transaction_group_table = await widget.getTable(this.transaction_group_table_name);
      const transaction_journal_table = await widget.getTable(this.transaction_journal_table_name);
      const transaction_groups = this.client.fetchTransactions();
      for await (const transaction_group of transaction_groups) {
        let transaction_group_record = _.assign(
          _.omit(transaction_group.attributes, "transactions"),
          {"transaction_group_id": transaction_group.id}
        )
        await transaction_group_table.create({
          "fields": transaction_group_record
        });
        for (const transaction_journal of transaction_group.attributes.transactions) {
          await transaction_journal_table.create({
            "fields": transaction_journal
          });
        }
        // TODO - move logic to widget.ts and add progressbar
        // TODO - Download in bulk
      }
    }
  },
  components: {},
});
</script>
<template>
  <transition>
    <div>
      <h3>Fetch Transactions</h3>

      <p>This will create or overwrite a table with transactions data.</p>

      <p>Firefly-iii returns transactions structured in two separate entities. Transaction groups have many transaction journals, to handle split transactions.</p>

      <p v-if="connection">connection id: {{ connection.id }}</p>

      <p v-if="!connection">
        Add the connections table to this page and select a row to choose a connection.
      </p>

      <p v-if="connection">
        <label for="table_name">Transaction table name</label><input type="text" v-model="transaction_group_table_name" />
      </p>

      <p v-if="connection">
        <label for="table_name">Transaction journal table name</label><input type="text" v-model="transaction_journal_table_name" />
      </p>

      <p v-if="connection">
        <button @click=fetchTransactions>Fetch Transactions</button>
      </p>

      <p>
        <button @click="$emit('close')">Back</button>
      </p>

    </div>
  </transition>
</template>
