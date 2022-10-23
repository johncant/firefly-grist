<script lang="ts">
import { defineComponent, toRaw } from 'vue'
import ConnectivityTest from './ConnectivityTest.vue'
import widget from './widget.js'
import Client from './client.js'
import type { FireflyConnection } from './types/FireflyConnection.js'
import type { FireflyConnectionRecord } from './types/FireflyConnectionRecord.js'


type MaybeUnsavedFireflyConnectionRecord = FireflyConnection & {
  id?: number;
}


declare interface ConnectionComponentData {
  connection: MaybeUnsavedFireflyConnectionRecord;
  is_new: boolean;
  loading: boolean;
  saving: boolean;
  save_message: string;
}


declare interface ConnectionComponentMethods {
    populateConnection(): null;
    saveConfig(): null;
    cleanConnection() : FireflyConnection;
    client(this: ConnectionComponent): Client;
}


type ConnectionComponent = ConnectionComponentData & ConnectionComponentMethods;


function newDefaults() : FireflyConnection {
  return {
    firefly_iii_url: "",
    firefly_iii_personal_access_token: "",
  }
}

export default defineComponent({
  data(): ConnectionComponentData {
    return {
      connection: newDefaults(),
      is_new: true,
      loading: true,
      saving: false,
      save_message: ""
    }
  },
  props: ['screen'],
  computed: {
    firefly_iii_url_valid() {
      return this.connection.firefly_iii_url.length > 0
    },
    firefly_iii_clean_url() {
      return this.connection.firefly_iii_url//normalizeUrl(this.firefly_iii_url)
    },
    firefly_iii_config_url() {
      return this.firefly_iii_clean_url+"/profile#oauth"
    },
    client(this: ConnectionComponent) {
      return new Client(this.cleanConnection())
    }
  },
  components: {
    'ConnectivityTest': ConnectivityTest
  },
  methods: {
    populateConnection() {
      this.loading = false;
    },
    saveConfig() {
      this.saving = true;
      widget.saveConnection(toRaw(this.connection)).then(response => {
        this.save_message = "Success"
      }, error => {
        this.save_message = error.message
      }).finally(() => {
        this.saving = false;
      })
    },
    cleanConnection() : FireflyConnection {
      return {
        firefly_iii_url: this.firefly_iii_clean_url,
        firefly_iii_personal_access_token: this.connection.firefly_iii_personal_access_token
      }
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

      <p v-if="!is_new">
        <label for="id">Connection id:</label><span>{{ connection.id }}</span>
      </p>

      <p>
        <label for="firefly-iii-url">Firefly-iii URL:</label>
        <input type="text" id="firefly-iii-url" v-model="connection.firefly_iii_url" />
      </p>

      <p v-if="firefly_iii_url_valid">
        Visit <a :href="firefly_iii_config_url" target="_blank">{{ firefly_iii_config_url }}</a> to configure firefly-iii. Click the OAuth tab, and create a new token.
      </p>

      <p>
        <label for="firefly-iii-personal-access-token">Personal access token:</label>
        <input type="password" id="firefly-iii-personal-access-token" v-model="connection.firefly_iii_personal_access_token"/>
      </p>

      <ConnectivityTest :client=client></ConnectivityTest>

      <p>
        <button @click=saveConfig>Save Config</button>
      </p>

      <p v-if="saving">Saving connection</p>
      <p v-if="!saving">{{ save_message }}</p>

      <p>
        <button @click="$emit('close')">Back</button>
      </p>

    </div>
  </transition>
</template>
