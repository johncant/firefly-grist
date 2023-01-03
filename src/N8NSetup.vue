<script lang="ts">
import axios from 'axios'
import { defineComponent, toRaw } from 'vue'
import ConnectivityTest from './ConnectivityTest.vue'
import widget from './widget.js'
import N8NClient from './N8NClient.js'
import generateWorkflow from './FireflyGristN8NWorkflow.ts'
import type { Credential } from './FireflyGristN8NWorkflow.ts'
import type { N8NConnection } from './types/N8NConnection.js'
import type { FireflyConnectionRecord } from './types/FireflyConnectionRecord.js'


declare interface ConnectionComponentData {
  connection: N8NConnection;
  installing: boolean;
}


declare interface ConnectionComponentMethods {
    populateConnection(): null;
    saveConfig(): null;
    cleanConnection() : FireflyConnection;
    client(this: ConnectionComponent): N8NClient;
}


type ConnectionComponent = ConnectionComponentData & ConnectionComponentMethods;


function newDefaults() : N8NConnection{
  return {
    n8n_url: "HARDCODED_FOR_POC",
    n8n_api_key: "HARDCODED_FOR_POC",
  }
}

export default defineComponent({
  data(): ConnectionComponentData {
    return {
      connection: newDefaults(),
      n8n_grist_credential: {id: 1, name: "Grist account"},
      n8n_firefly_iii_credential: {id: 2, name: "Firefly"},
      firefly_iii_url: "HARDCODED_FOR_POC",
      transaction_journals_table: "transaction_journals_table",
      transaction_groups_table: "transaction_groups_table",
      installing: true,
      activating_workflow: false,
      activate_message: "",
      activated: false,
      installing_webhooks: false,
      n8n_workflow_id: null,
      workflow_generation_result: null,
      install_webhooks_message: "",
    }
  },
  props: ['screen'],
  computed: {
    n8n_url_valid() {
      return this.connection.n8n_url.length > 0;
    },
    n8n_clean_url() {
      return this.connection.n8n_url;
    },
    n8n_config_url() {
      return this.n8n_clean_url+"";
    },
    n8n_client(this: ConnectionComponent) {
      return new N8NClient(this.cleanConnection())
    }
  },
  methods: {
    cleanConnection() {
      return this.connection;
    },
    async install() {
      this.installing = true;
      this.activated = false;
      this.n8n_workflow_id = null;
      try {
        const n8n_workflow = generateWorkflow(
          this.firefly_iii_url,
          this.cleanConnection().n8n_url,
          "HARDCODED_FOR_POC", // TODO
          this.transaction_journals_table,
          this.transaction_groups_table,
          this.n8n_grist_credential,
          this.n8n_firefly_iii_credential,
        );
        const n8n_response = await this.n8n_client.createWorkflow(n8n_workflow.workflow);
        if (n8n_response['id']) {
          this.install_message = "Success" + n8n_response.id;
          this.n8n_workflow_id = n8n_response.id;
          this.workflow_generation_result = n8n_workflow;
        } else {
          this.install_message = n8n_response;
        }
      } catch(e) {
        this.install_message = e.message;
      }
      this.installing = false;
    },
    populateConnection() {
    },
    async activateWorkflow() {
      this.activating_workflow = true;
      const result = await this.n8n_client.activateWorkflow(this.n8n_workflow_id)
      if (result.active) {
        this.activate_message = "Success"
        this.activated = true;
      } else {
        this.activate_message = result
      }
      this.activating_workflow = false;
    },
    async installWebhooks() {
      await this.installWebhooksForEnv("webhook");
    },
    async installWebhooksTest() {
      await this.installWebhooksForEnv("webhook-test");
    },
    async installWebhooksForEnv(env) {
      this.installing_webhooks = true;
      const workflow_client = axios.create({
        baseURL: this.cleanConnection().n8n_url,
      });
      const result = await workflow_client.post(
        '/webhook/'+this.workflow_generation_result.fireflyWebhookInstallationWebhookUUID,
        {"webhook_env": env, "grist_document_id": "HARDCODED_FOR_POC"}, // TODO
      )
      if (result.status == 200) {
        this.install_webhooks_message = "Success (not guaranteed - please test)"
      } else {
        this.install_webhooks_message = result.data;
      }
      this.installing_webhooks = false;
    }
  }
});
</script>
<template>
  <transition @after-enter=populateConnection>
    <div>
      <h3>N8N workflow integration</h3>

      <p>
        <label for="n8n_url">URL of your n8n installation:</label>
        <input type="text" id="n8n_url" v-model="connection.n8n_url" />
      </p>

      <p v-if="n8n_url_valid">
        Visit <a :href="n8n_config_url" target="_blank">{{ n8n_config_url }}</a> to configure n8n and generate an API key.
      </p>

      <p>
        <label for="n8n_api_key">API key</label>
        <input type="password" id="n8n_api_key" v-model="connection.n8n_api_key"/>
      </p>

      <p>
        <label for="firefly_iii_url">Firefly-iii URL</label>
        <input type="text" id="firefly_iii_url" v-model="firefly_iii_url"/>
      </p>

      <p>
        <label for="firefly_iii_url">N8N firefly-iii credential id</label>
        <input type="text" id="firefly_iii_url" v-model="n8n_firefly_iii_credential.id"/>
      </p>

      <p>
        <label for="firefly_iii_url">N8N firefly-iii credential name</label>
        <input type="text" id="firefly_iii_url" v-model="n8n_firefly_iii_credential.name"/>
      </p>

      <p>
        <label for="grist_iii_url">N8N Grist credential id</label>
        <input type="text" id="grist_url" v-model="n8n_grist_credential.id"/>
      </p>

      <p>
        <label for="grist_url">N8N Grist credential name</label>
        <input type="text" id="grist_url" v-model="n8n_grist_credential.name"/>
      </p>

      <p>
        <label for="transaction_journals_table">Transaction Journals Table</label>
        <input type="text" id="transaction_journals_table" v-model="transaction_journals_table"/>
      </p>

      <p>
        <label for="transaction_groups_table">Transaction Groups Table</label>
        <input type="text" id="transaction_groups_table" v-model="transaction_groups_table"/>
      </p>

      <p>
        <button @click=install>Install n8n workflow</button>
        <span>If installation fails due to CORS, check the browser logs for a curl command.</span>
      </p>

      <p v-if="installing">Installing n8n workflow</p>
      <p v-if="!installing">{{ install_message }}</p>

      <p v-if="n8n_workflow_id">
        <button @click=activateWorkflow>Activate n8n workflow</button>
      </p>

      <p v-if="activating_workflow">Activating n8n workflow</p>
      <p v-if="!activating_workflow">{{ activate_message }}</p>

      <p v-if="activated">
        <button @click=installWebhooks>Install Firefly-iii webhooks</button>
      </p>

      <p v-if="activated">
        <button @click=installWebhooksTest>Install Firefly-iii webhooks (test)</button>
      </p>

      <p v-if="installing_webhooks">Installing Firefly-iii webhooks</p>
      <p v-if="!installing_webhooks">{{ install_webhooks_message }}</p>

      <p>
        <button @click="$emit('close')">Back</button>
      </p>

    </div>
  </transition>
</template>
