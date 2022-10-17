<script lang="ts">
import { defineComponent } from 'vue'
import Tablesetup from './Tablesetup.vue'
import Connection from './Connection.vue'
import Fetch from './Fetch.vue'
import widget from './widget.ts'


export default defineComponent({
  data() {
    return {
      screen: "main_menu",
    }
  },
  methods: {
    newConnection() {
      this.screen = "connection";
    }
  },
  mounted() {
    widget.init(self)
  },
  components: {
    "Tablesetup": Tablesetup,
    "Connection": Connection,
    "Fetch": Fetch
  }
})
</script>
<template>
  <h2>Grist Firefly Widget</h2>

  <div id="main_menu" v-if="screen == 'main_menu'">
    <h3>Main menu</h3>

    <p>
      <button @click="screen = 'tablesetup'">Table setup</button>
    </p>

    <p>
      <button @click=newConnection>Add connection</button>
    </p>

    <p>
      <button @click="screen = 'fetch'">Fetch data</button>
    </p>
  </div>

  <Tablesetup screen=screen v-if="screen == 'tablesetup'" @close="screen = 'main_menu'"></TableSetup>
  <Connection screen=screen v-if="screen == 'connection'" @close="screen = 'main_menu'" widget=widget></Connection>
  <Fetch screen=screen v-if="screen == 'fetch'" @close="screen = 'main_menu'" widget=widget></Fetch>
</template>
