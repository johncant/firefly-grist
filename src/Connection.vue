<script lang="ts">
import { defineComponent } from 'vue'
import ConnectivityTest from './ConnectivityTest.vue'
import axios from 'axios'

function newDefaults() {
  return {
    name: null,
    is_new: true,
    firefly_iii_url: "",
    firefly_iii_personal_access_token: "",
  }
}

export default defineComponent({
  data() {
    const data = newDefaults();
    data['loading'] = true
    data['results'] = []
    return data
  },
  props: ['screen'],
  computed: {
    firefly_iii_url_valid() {
      return this.firefly_iii_url.length > 0
    },
    firefly_iii_clean_url() {
      return this.firefly_iii_url //normalizeUrl(this.firefly_iii_url)
    },
    firefly_iii_config_url() {
      return this.firefly_iii_clean_url+"/profile#oauth"
    },
    client() {
      return axios.create({
        baseURL: this.firefly_iii_clean_url,
        headers: {
          'Authorization': 'Bearer '+this.firefly_iii_personal_access_token
        }
      })
    },
  },
  components: {
    'ConnectivityTest': ConnectivityTest
  },
  methods: {
    populateConnection() {
      this.loading = false;
    }
  }
});
</script>
<template>
  <transition @after-enter=populateConnection>
    <div>
      <h3 v-if=is_new>New Connection</h3>
      <h3 v-else>Edit Connection</h3>

      <p v-if="loading">Loading...</p>

      <p>
        <label for="firefly-iii-url">Firefly-iii URL:</label>
        <input type="text" id="firefly-iii-url" v-model="firefly_iii_url" />
      </p>

      <p v-if="firefly_iii_url_valid">
        Visit <a :href="firefly_iii_config_url" target="_blank">{{ firefly_iii_config_url }}</a> to configure firefly-iii. Click the OAuth tab, and create a new token.
      </p>

      <p>
        <label for="firefly-iii-personal-access-token">Personal access token:</label>
        <input type="password" id="firefly-iii-personal-access-token" v-model="firefly_iii_personal_access_token"/>
      </p>

      <ConnectivityTest :client=client></ConnectivityTest>

      <p>
        <button @click=saveConfig>Save Config</button>
      </p>

    </div>
  </transition>
</template>
