<script lang="ts">
import { defineComponent } from 'vue'
import { FetchAccounts } from './FetchAccounts.vue'

export default defineComponent({
  props: ["screen"],
  components: {
    "Fetchaccounts": FetchAccounts
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

      <p>
        <button @click="$emit('close')">Back</button>
      </p>

    </div>
  </transition>
  <Fetchaccounts screen=screen v-if="screen == 'fetch_accounts'" @close="screen = 'main_menu'" widget=widget></Fetchaccounts>
</template>
