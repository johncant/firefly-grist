<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
});
</script>
<template>
  <transition>
    <div>
      <h3>Fetch Accounts</h3>



      <p>
        <button @click="$emit('close')">Back</button>
      </p>

    </div>
  </transition>
</template>
