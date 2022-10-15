<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      test_waiting: true,
      test_result: "",
    }
  },
  props: ['client'],
  methods: {
    testConnectivity() {
      this.test_waiting = true;
      console.log(this.client)
      this.client.get("/api/v1/about")
      .then(response => {
        this.test_result = JSON.stringify(response.data.data)
      }, error => {
        this.test_result = error.message
      }).finally(() => {
        this.test_waiting = false
      })
    },
  }
});
</script>
<template>
  <p>
    <button @click=testConnectivity>Test Connectivity</button>
  </p>

  <p v-if="!test_waiting">{{test_result}}</p>
</template>
