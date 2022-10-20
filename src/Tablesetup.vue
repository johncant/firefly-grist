<script lang=ts>
import { defineComponent } from 'vue'
import widget from './widget.js'
import type { TableSetup } from './types/TableSetup.js'

declare interface TableSetupComponentData {
  loading: boolean;
}

export default defineComponent({
  data(): TableSetup & TableSetupComponentData {
    return {
      loading: true,
      name: "",
      column_info: []
    }
  },
  methods: {
    async modifyTable() {
      this.populateTableSetup()
    },
    async populateTableSetup() {
      this.loading = true;
      const data = await widget.getTableSetup()

      // TODO - just set the object
      this.name = data.name
      this.column_info = data.column_info // TODO - won't work due change of object
      this.loading = false;
    },
  }
})
</script>
<template>

  <transition @after-enter=populateTableSetup>
    <div>
      <h3>Table setup</h3>

      <p v-if="loading">Loading...</p>

      <p v-else>
        <span>Table name: </span><span>{{ name }}</span>
        <ul>
          <li v-for="item in column_info">{{item.name}} - <span class="status">{{item.status_message}}</span></li>
        </ul>
      </p>

      <p>
        <button @click=modifyTable>MODIFY</button>
      </p>

      <p>
        <button @click="$emit('close')">Back</button>
      </p>
    </div>
  </transition>
</template>
