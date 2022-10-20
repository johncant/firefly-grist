<script lang="ts">
import { defineComponent } from 'vue'

interface ConnectivityTestComponentData {
  test_waiting: boolean;
  test_result: string;
}

export default defineComponent({
  data(): ConnectivityTestComponentData {
    return {
      test_waiting: true,
      test_result: "",
    }
  },
  props: ['client'],
  methods: {
    async testConnectivity() {
      this.test_waiting = true;
      try {
        const response_data = await this.client.testConnectivity()
        this.test_result = JSON.stringify(response_data.data)
      } catch(error: any) {
        this.test_result = error.message;
      } finally {
        this.test_waiting = false
      }
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
