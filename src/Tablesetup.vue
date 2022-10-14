<script language=javascript>
export default {
  data() {
    return {
      loading: true,
      name: null,
      results: []
    }
  },
  methods: {
    async modifyTable() {
      this.populateTableSetup()
    },
    async populateTableSetup() {
      this.loading = true
      this.name = await grist.selectedTable.getTableId()
      const required_columns = ["id", "URL", "AccessToken"]
      const mapped_columns = await grist.mapColumnNamesBack(required_columns)

      function statusMessage(col) {
        if(mapped_columns == null) {
          return "Column mapping incomplete"
        } else {
          return "Mapped successfully"
        }
      }

      this.results = this.results.slice(0, 0)
      required_columns.forEach((col) => {
        this.results.push({name: col, message: statusMessage(col)})
      })

      console.log(this.results)

      this.loading = false
    },
  }
}
</script>
<template>

  <transition @after-enter=populateTableSetup>
    <div>
      <h3>Table setup</h3>

      <p v-if="loading">Loading...</p>

      <p v-else>
        <span>Table name: </span><span>{{ name }}</span>
        <ul>
          <li v-for="item in results">{{item.name}} - <span class="status">{{item.message}}</span></li>
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
