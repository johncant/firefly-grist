<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: ["screen"],
  components: {
  }
});
</script>
<template>
  <transition>
    <div>
      <h3>Fetch data</h3>

      <p>
        <button @click="screen = 'fetch_accounts'">Fetch Accounts</button>
      </p>

      <p>This will create or overwrite a table with accounts data.</p>

      <p>connection id: {{ connection_id }}</p>

      <p>
        <label for="table_name">Table name</label><input type="text" :value="table_name"></input>
      </p>

      <p>
        <button>Fetch</button>
      </p>

      <p>
        <button @click="$emit('close')">Back</button>
      </p>

    </div>
  </transition>
</template>
