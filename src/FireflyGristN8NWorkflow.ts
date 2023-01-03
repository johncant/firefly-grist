import { v4 as uuidv4 } from "uuid";

interface Credential {
  id: string;
  name: string;
}

interface WorkflowGenerationResult {
  fireflyWebhookInstallationWebhookUUID: string;
  fireflyTransactionRescanWebhookUUID: string;
  fireflyTransactionCreateWebhookUUID: string;
  fireflyTransactionUpdateWebhookUUID: string;
  fireflyTransactionDestroyWebhookUUID: string;
  workflow: any;
}

export default function generateWorkflow(
  fireflyUrl: string,
  n8nUrl: string,
  gristDocId: string,
  transactionJournalsTable: string,
  transactionGroupsTable: string,
  gristCredential: Credential,
  fireflyCredential: Credential
): WorkflowGenerationResult {
  const fireflyWebhookInstallationWebhookUUID = uuidv4();
  const fireflyTransactionRescanWebhookUUID = uuidv4();
  const fireflyTransactionUpdateWebhookUUID = uuidv4();
  const fireflyTransactionCreateWebhookUUID = uuidv4();
  const fireflyTransactionDestroyWebhookUUID = uuidv4();

  const workflow = {
    name: "Firefly to Grist",
    nodes: [
      {
        parameters: {
          operation: "create",
          docId: gristDocId,
          tableId: transactionJournalsTable,
          dataToSend: "autoMapInputs",
          inputsToIgnore: "links,id,table_id,tags",
        },
        id: uuidv4(),
        name: "Grist",
        type: "n8n-nodes-base.grist",
        typeVersion: 1,
        position: [2740, 1060],
        credentials: {
          gristApi: gristCredential,
        },
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json["id"]}}',
                operation: "isNotEmpty",
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [2440, 920],
      },
      {
        parameters: {
          operation: "update",
          docId: gristDocId,
          tableId: transactionJournalsTable,
          rowId: '={{$json["id"]}}',
          dataToSend: "autoMapInputs",
          inputsToIgnore: "links,tags,id,table_id",
        },
        id: uuidv4(),
        name: "Grist1",
        type: "n8n-nodes-base.grist",
        typeVersion: 1,
        position: [2740, 900],
        credentials: {
          gristApi: gristCredential,
        },
      },
      {
        parameters: {
          httpMethod: "POST",
          path: fireflyTransactionUpdateWebhookUUID,
          options: {},
        },
        id: uuidv4(),
        name: "Firefly Transaction Update Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [-220, 260],
        webhookId: fireflyTransactionUpdateWebhookUUID,
      },
      {
        parameters: {
          docId: gristDocId,
          tableId: transactionJournalsTable,
          returnAll: true,
          additionalOptions: {
            filter: {
              filterProperties: [
                {
                  field: "transaction_journal_id",
                  values: '={{$json["transaction_journal_id"]}}',
                },
              ],
            },
          },
        },
        id: uuidv4(),
        name: "Does transaction_journal row exist?",
        type: "n8n-nodes-base.grist",
        typeVersion: 1,
        position: [1540, 880],
        alwaysOutputData: true,
        executeOnce: false,
        credentials: {
          gristApi: gristCredential,
        },
      },
      {
        parameters: {
          operation: "create",
          docId: gristDocId,
          tableId: transactionGroupsTable,
          dataToSend: "autoMapInputs",
          inputsToIgnore: "id,links,table_id",
        },
        id: uuidv4(),
        name: "Grist2",
        type: "n8n-nodes-base.grist",
        typeVersion: 1,
        position: [2740, 580],
        credentials: {
          gristApi: gristCredential,
        },
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json["id"]}}',
                operation: "isNotEmpty",
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF1",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [2440, 440],
      },
      {
        parameters: {
          operation: "update",
          docId: gristDocId,
          tableId: transactionGroupsTable,
          rowId: '={{$json["id"]}}',
          dataToSend: "autoMapInputs",
          inputsToIgnore: "links,id,table_id",
        },
        id: uuidv4(),
        name: "Grist3",
        type: "n8n-nodes-base.grist",
        typeVersion: 1,
        position: [2740, 420],
        credentials: {
          gristApi: gristCredential,
        },
      },
      {
        parameters: {
          mode: "runOnceForEachItem",
          jsCode:
            "$input.item['json']['data']['table_id'] = $input.item['json']['table_id'];\n$input.item['json']['data']['id'] = $input.item['json']['id'];\nreturn {'json': $input.item['json']['data']};",
        },
        id: uuidv4(),
        name: "Code",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [2600, 420],
      },
      {
        parameters: {
          jsCode:
            "const outputs = [];\n\nfor (const item of $input.all()) {\n\n  const transaction_group = item['json'][\"body\"][\"content\"];\n  delete transaction_group.transactions;\n\n  transaction_group['transaction_group_id'] = transaction_group['id'];\n  delete transaction_group['id'];\n\n  outputs.push({\n    \"transaction_group_id\": transaction_group['transaction_group_id'],\n    \"table_id\": \"Transaction_groups\",\n    \"data\": transaction_group,\n    \"trigger\": item['json']['body']['trigger']\n  });\n\n}\n\nreturn outputs;\n",
        },
        id: uuidv4(),
        name: "Extract table transaction_groups",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [1340, 260],
        alwaysOutputData: false,
      },
      {
        parameters: {
          docId: gristDocId,
          tableId: transactionGroupsTable,
          returnAll: true,
          additionalOptions: {
            filter: {
              filterProperties: [
                {
                  field: "transaction_group_id",
                  values: '={{$json["transaction_group_id"]}}',
                },
              ],
            },
          },
        },
        id: uuidv4(),
        name: "Does transaction_group row exist?",
        type: "n8n-nodes-base.grist",
        typeVersion: 1,
        position: [1540, 400],
        alwaysOutputData: true,
        executeOnce: false,
        credentials: {
          gristApi: gristCredential,
        },
      },
      {
        parameters: {
          jsCode:
            'const outputs = [];\n\nfor (const item of $input.all()) {\n\n  const transaction_group = item["json"]["body"]["content"];\n  const transaction_journals = transaction_group["transactions"];\n\n  // Handles split transactions\n  for (const tj of transaction_journals) {\n    outputs.push({\n      "transaction_journal_id": tj["transaction_journal_id"],\n      "id_column_name": "transaction_journal_id",\n      "table_id": "Transaction_journals",\n      "data": tj,\n      "trigger": item["json"]["body"]["trigger"]\n    });\n  }\n\n}\n\nreturn outputs;\n',
        },
        id: uuidv4(),
        name: "Extract table transaction_journals",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [1340, 740],
        alwaysOutputData: false,
      },
      {
        parameters: {
          mode: "runOnceForEachItem",
          jsCode:
            "$input.item['json']['data']['table_id'] = $input.item['json']['table_id'];\n$input.item['json']['data']['id'] = $input.item['json']['id'];\nreturn {'json': $input.item['json']['data']};",
        },
        id: uuidv4(),
        name: "Code4",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [2600, 580],
      },
      {
        parameters: {
          mode: "runOnceForEachItem",
          jsCode:
            "$input.item['json']['data']['table_id'] = $input.item['json']['table_id'];\n$input.item['json']['data']['id'] = $input.item['json']['id'];\nreturn {'json': $input.item['json']['data']};",
        },
        id: uuidv4(),
        name: "Code5",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [2600, 900],
      },
      {
        parameters: {
          mode: "runOnceForEachItem",
          jsCode:
            "$input.item['json']['data']['table_id'] = $input.item['json']['table_id'];\n$input.item['json']['data']['id'] = $input.item['json']['id'];\nreturn {'json': $input.item['json']['data']};",
        },
        id: uuidv4(),
        name: "Code6",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [2600, 1060],
      },
      {
        parameters: {
          mode: "combine",
          mergeByFields: {
            values: [
              {
                field1: "transaction_group_id",
                field2: "transaction_group_id",
              },
            ],
          },
          joinMode: "enrichInput1",
          options: {},
        },
        id: uuidv4(),
        name: "Merge",
        type: "n8n-nodes-base.merge",
        typeVersion: 2,
        position: [1920, 280],
      },
      {
        parameters: {
          operation: "removeDuplicates",
          compare: "selectedFields",
          fieldsToCompare: {
            fields: [
              {
                fieldName: "transaction_group_id",
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Item Lists",
        type: "n8n-nodes-base.itemLists",
        typeVersion: 1,
        position: [2080, 280],
      },
      {
        parameters: {
          mode: "combine",
          mergeByFields: {
            values: [
              {
                field1: "transaction_journal_id",
                field2: "transaction_journal_id",
              },
            ],
          },
          joinMode: "enrichInput1",
          options: {},
        },
        id: uuidv4(),
        name: "Merge1",
        type: "n8n-nodes-base.merge",
        typeVersion: 2,
        position: [1920, 760],
      },
      {
        parameters: {
          mode: "runOnceForEachItem",
          jsCode:
            "if (!('transaction_journal_id' in $input.item['json'])) {\n  return {\n    'json': {\n      'transaction_journal_id': null\n    }\n  }\n} else {\n  return $input.item\n}",
        },
        id: uuidv4(),
        name: "Code7",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [1700, 880],
      },
      {
        parameters: {
          mode: "runOnceForEachItem",
          jsCode:
            "if (!('transaction_group_id' in $input.item['json'])) {\n  return {\n    'json': {\n      'transaction_group_id': null\n    }\n  }\n} else {\n  return $input.item\n}",
        },
        id: uuidv4(),
        name: "Code8",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [1700, 400],
      },
      {
        parameters: {
          operation: "removeDuplicates",
          compare: "selectedFields",
          fieldsToCompare: {
            fields: [
              {
                fieldName: "transaction_journal_id",
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Item Lists1",
        type: "n8n-nodes-base.itemLists",
        typeVersion: 1,
        position: [2080, 760],
      },
      {
        parameters: {
          url: fireflyUrl + "/api/v1/transactions",
          authentication: "genericCredentialType",
          genericAuthType: "httpHeaderAuth",
          sendQuery: true,
          queryParameters: {
            parameters: [
              {
                name: "page",
                value: '={{$json["page"]}}',
              },
            ],
          },
          options: {
            response: {
              response: {
                responseFormat: "json",
              },
            },
          },
        },
        id: uuidv4(),
        name: "HTTP Request",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [200, -20],
        credentials: {
          httpHeaderAuth: fireflyCredential,
        },
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{ $json["meta"]["pagination"]["current_page"] }}',
                value2: '={{ $json["meta"]["pagination"]["total_pages"] }}',
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF2",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [400, 100],
      },
      {
        parameters: {
          values: {
            number: [
              {
                name: "page",
                value: 1,
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Set",
        type: "n8n-nodes-base.set",
        typeVersion: 1,
        position: [-20, -20],
      },
      {
        parameters: {
          fieldToSplitOut: '={{ $json["data"] }}',
          options: {},
        },
        id: uuidv4(),
        name: "Item Lists2",
        type: "n8n-nodes-base.itemLists",
        typeVersion: 1,
        position: [780, -20],
      },
      {
        parameters: {
          values: {
            number: [
              {
                value: '={{ $json["meta"]["pagination"]["current_page"] + 1 }}',
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Set1",
        type: "n8n-nodes-base.set",
        typeVersion: 1,
        position: [600, 80],
      },
      {
        parameters: {},
        id: uuidv4(),
        name: "NoOp",
        type: "n8n-nodes-base.noOp",
        typeVersion: 1,
        position: [1060, 260],
      },
      {
        parameters: {
          url: fireflyUrl + "/api/v1/webhooks",
          authentication: "genericCredentialType",
          genericAuthType: "httpHeaderAuth",
          options: {
            response: {
              response: {
                responseFormat: "json",
              },
            },
          },
        },
        id: uuidv4(),
        name: "HTTP Request1",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [200, -440],
        credentials: {
          httpHeaderAuth: fireflyCredential,
        },
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json["meta"]["pagination"]["current_page"]}}',
                value2: '={{ $json["meta"]["pagination"]["total_pages"] }}',
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF3",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [400, -320],
      },
      {
        parameters: {
          values: {
            number: [
              {
                name: "page",
                value: 1,
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Set2",
        type: "n8n-nodes-base.set",
        typeVersion: 1,
        position: [-20, -440],
      },
      {
        parameters: {
          fieldToSplitOut: "data",
          options: {},
        },
        id: uuidv4(),
        name: "Item Lists3",
        type: "n8n-nodes-base.itemLists",
        typeVersion: 1,
        position: [800, -440],
        alwaysOutputData: true,
      },
      {
        parameters: {
          values: {
            number: [
              {
                value: '={{ $json["meta"]["pagination"]["current_page"] +1}}',
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Set3",
        type: "n8n-nodes-base.set",
        typeVersion: 1,
        position: [600, -340],
      },
      {
        parameters: {
          httpMethod: "POST",
          path: fireflyTransactionCreateWebhookUUID,
          options: {},
        },
        id: uuidv4(),
        name: "Firefly transaction create webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [-220, 520],
        webhookId: fireflyTransactionCreateWebhookUUID,
      },
      {
        parameters: {
          httpMethod: "POST",
          path: fireflyWebhookInstallationWebhookUUID,
          responseMode: "responseNode",
          options: {},
        },
        id: uuidv4(),
        name: "Install Firefly-iii webhooks",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [-220, -440],
        webhookId: fireflyWebhookInstallationWebhookUUID,
      },
      {
        parameters: {
          jsCode:
            "// Loop over input items and add a new field\n// called 'myNewField' to the JSON of each one\n$input.all().forEach((item, index) => {\n  item.json.index = index;\n});\n\n\nreturn $input.all();",
        },
        id: uuidv4(),
        name: "Code1",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [1420, -620],
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{ $json["attributes"]["url"] }}',
                value2:
                  "=" +
                  n8nUrl +
                  '/{{$json["body"]["webhook_env"]}}/{{$node["Firefly transaction create webhook"].parameter["path"]}}',
              },
              {
                value1: '={{ $json["attributes"]["url"] }}',
                operation: "isEmpty",
              },
            ],
          },
          combineOperation: "any",
        },
        id: uuidv4(),
        name: "IF6",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [1240, -600],
        alwaysOutputData: true,
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json["attributes"]["url"]}}',
                operation: "isEmpty",
              },
              {
                value1: '={{ $json["attributes"]["url"] }}',
                value2:
                  "=" +
                  n8nUrl +
                  '/{{$json["body"]["webhook_env"]}}/{{$node["Firefly Transaction Update Webhook"].parameter["path"]}}',
              },
            ],
          },
          combineOperation: "any",
        },
        id: uuidv4(),
        name: "IF7",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [1240, -460],
        alwaysOutputData: true,
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{ $json["index"] }}',
                operation: "equal",
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF9",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [1600, -620],
      },
      {
        parameters: {
          jsCode:
            "// Loop over input items and add a new field\n// called 'myNewField' to the JSON of each one\n$input.all().forEach((item, index) => {\n  item.json.index = index;\n});\n\n\nreturn $input.all();",
        },
        id: uuidv4(),
        name: "Code2",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [1420, -480],
      },
      {
        parameters: {
          jsCode:
            "// Loop over input items and add a new field\n// called 'myNewField' to the JSON of each one\n$input.all().forEach((item, index) => {\n  item.json.index = index;\n});\n\n\nreturn $input.all();",
        },
        id: uuidv4(),
        name: "Code3",
        type: "n8n-nodes-base.code",
        typeVersion: 1,
        position: [1420, -340],
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{ $json["index"] }}',
                operation: "equal",
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF10",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [1600, -480],
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{ $json["index"] }}',
                operation: "equal",
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF11",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [1600, -340],
      },
      {
        parameters: {
          values: {
            string: [
              {
                name: "trigger",
                value: "TRIGGER_STORE_TRANSACTION",
              },
              {
                name: "url",
                value:
                  "=" +
                  n8nUrl +
                  '/{{$node["Install Firefly-iii webhooks"].json["body"]["webhook_env"]}}/{{$node["Firefly transaction create webhook"].parameter["path"]}}',
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Set4",
        type: "n8n-nodes-base.set",
        typeVersion: 1,
        position: [1800, -640],
      },
      {
        parameters: {
          values: {
            string: [
              {
                name: "trigger",
                value: "TRIGGER_UPDATE_TRANSACTION",
              },
              {
                name: "url",
                value:
                  "=" +
                  n8nUrl +
                  '/{{$node["Install Firefly-iii webhooks"].json["body"]["webhook_env"]}}/{{$node["Firefly Transaction Update Webhook"].parameter["path"]}}',
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Set5",
        type: "n8n-nodes-base.set",
        typeVersion: 1,
        position: [1800, -500],
      },
      {
        parameters: {
          values: {
            string: [
              {
                name: "trigger",
                value: "TRIGGER_DESTROY_TRANSACTION",
              },
              {
                name: "url",
                value:
                  "=" +
                  n8nUrl +
                  '/{{$node["Install Firefly-iii webhooks"].json["body"]["webhook_env"]}}/{{$node["Firefly Transaction Destroy Webhook"].parameter["path"]}}',
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Set6",
        type: "n8n-nodes-base.set",
        typeVersion: 1,
        position: [1800, -360],
      },
      {
        parameters: {
          httpMethod: "POST",
          path: fireflyTransactionDestroyWebhookUUID,
          options: {},
        },
        id: uuidv4(),
        name: "Firefly Transaction Destroy Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [-220, 980],
        webhookId: fireflyTransactionDestroyWebhookUUID,
      },
      {
        parameters: {
          values: {
            string: [
              {
                name: "delivery",
                value: "DELIVERY_JSON",
              },
              {
                name: "response",
                value: "RESPONSE_TRANSACTIONS",
              },
              {
                name: "title",
                value:
                  '=Created by firefly_grist, env {{$node["Install Firefly-iii webhooks"].json["body"]["webhook_env"]}}, for {{$json["trigger"]}} with grist_document_id: {{$node["Install Firefly-iii webhooks"].json["body"]["grist_document_id"]}}, at {{new Date().toString()}}',
              },
            ],
            boolean: [
              {
                name: "active",
                value: true,
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Set7",
        type: "n8n-nodes-base.set",
        typeVersion: 1,
        position: [2060, -500],
      },
      {
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json["id"]}}',
                operation: "isEmpty",
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF12",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [2280, -500],
      },
      {
        parameters: {
          method: "POST",
          url: fireflyUrl + "/api/v1/webhooks",
          authentication: "genericCredentialType",
          genericAuthType: "httpHeaderAuth",
          sendBody: true,
          bodyParameters: {
            parameters: [
              {
                name: "trigger",
                value: '={{ $json["trigger"] }}',
              },
              {
                name: "url",
                value: '={{ $json["url"] }}',
              },
              {
                name: "delivery",
                value: '={{ $json["delivery"] }}',
              },
              {
                name: "response",
                value: '={{ $json["response"] }}',
              },
              {
                name: "title",
                value: '={{ $json["title"] }}',
              },
              {
                name: "active",
                value: '={{$json["active"]}}',
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Create Webhook",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [2480, -660],
        alwaysOutputData: true,
        credentials: {
          httpHeaderAuth: fireflyCredential,
        },
      },
      {
        parameters: {
          method: "PUT",
          url: "=" + fireflyUrl + '/api/v1/webhooks/{{$json["id"]}}',
          authentication: "genericCredentialType",
          genericAuthType: "httpHeaderAuth",
          sendBody: true,
          bodyParameters: {
            parameters: [
              {
                name: "trigger",
                value: '={{ $json["trigger"] }}',
              },
              {
                name: "url",
                value: '={{ $json["url"] }}',
              },
              {
                name: "delivery",
                value: '={{ $json["delivery"] }}',
              },
              {
                name: "response",
                value: '={{ $json["response"] }}',
              },
              {
                name: "title",
                value: '={{ $json["title"] }}',
              },
              {
                name: "active",
                value: '={{ $json["active"] }}',
              },
            ],
          },
          options: {},
        },
        id: uuidv4(),
        name: "Update Webhook",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [2480, -480],
        alwaysOutputData: true,
        credentials: {
          httpHeaderAuth: fireflyCredential,
        },
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json["attributes"]["url"]}}',
                operation: "isEmpty",
              },
              {
                value1: '={{ $json["attributes"]["url"] }}',
                value2:
                  "=" +
                  n8nUrl +
                  '/{{$json["body"]["webhook_env"]}}/{{$node["Firefly Transaction Destroy Webhook"].parameter["path"]}}',
              },
            ],
          },
          combineOperation: "any",
        },
        id: uuidv4(),
        name: "IF8",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [1240, -320],
        alwaysOutputData: true,
      },
      {
        parameters: {},
        id: uuidv4(),
        name: "NoOp2",
        type: "n8n-nodes-base.noOp",
        typeVersion: 1,
        position: [1420, -20],
      },
      {
        parameters: {},
        id: uuidv4(),
        name: "NoOp3",
        type: "n8n-nodes-base.noOp",
        typeVersion: 1,
        position: [2480, -20],
        alwaysOutputData: true,
      },
      {
        parameters: {},
        id: uuidv4(),
        name: "NoOp1",
        type: "n8n-nodes-base.noOp",
        typeVersion: 1,
        position: [1800, -220],
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json["id"]}}',
                operation: "isNotEmpty",
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF5",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [2060, -220],
      },
      {
        parameters: {
          mode: "combine",
          combinationMode: "multiplex",
          options: {},
        },
        id: uuidv4(),
        name: "Merge5",
        type: "n8n-nodes-base.merge",
        typeVersion: 2,
        position: [1020, -460],
      },
      {
        parameters: {},
        id: uuidv4(),
        name: "NoOp4",
        type: "n8n-nodes-base.noOp",
        typeVersion: 1,
        position: [-20, -580],
      },
      {
        parameters: {},
        id: uuidv4(),
        name: "NoOp5",
        type: "n8n-nodes-base.noOp",
        typeVersion: 1,
        position: [800, -580],
      },
      {
        parameters: {
          options: {},
        },
        id: uuidv4(),
        name: "Respond to Webhook",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1,
        position: [2760, -360],
      },
      {
        parameters: {
          content: "Ignored",
          height: 80.2598454935623,
        },
        id: uuidv4(),
        name: "Note",
        type: "n8n-nodes-base.stickyNote",
        typeVersion: 1,
        position: [2660, 0],
      },
      {
        parameters: {
          errorMessage:
            "More than one webhook found - this should never happen due to firefly-iii's uniqueness contraints and validation",
        },
        id: uuidv4(),
        name: "Stop And Error",
        type: "n8n-nodes-base.stopAndError",
        typeVersion: 1,
        position: [2480, -240],
      },
      {
        parameters: {
          content:
            "# Success\n\nResponse might not be sent after last firefly-iii webhook API call.\n\nI wasn't able to synchronize by using merge nodes - this ended up invoking the API calls even though no messages arrived at those nodes.",
          height: 232.14585407725315,
          width: 304.5515536480686,
        },
        id: uuidv4(),
        name: "Note1",
        type: "n8n-nodes-base.stickyNote",
        typeVersion: 1,
        position: [2760, -640],
      },
      {
        parameters: {
          content:
            "## Fetch existing webhooks\n\nTODO - collect data from all pages\n\nAt the moment having more than 50 webhooks will cause strange bugs.",
          height: 186.5800515021459,
          width: 370.0523948497853,
        },
        id: uuidv4(),
        name: "Note2",
        type: "n8n-nodes-base.stickyNote",
        typeVersion: 1,
        position: [300, -752.0808927038627],
      },
      {
        parameters: {
          content:
            "## Deduplicate for each webhook trigger\n\nActually, this is unneeded",
          height: 132.47066094420597,
          width: 272.2757768240342,
        },
        id: uuidv4(),
        name: "Note3",
        type: "n8n-nodes-base.stickyNote",
        typeVersion: 1,
        position: [1420, -780],
      },
      {
        parameters: {
          content: "## Set new params",
          height: 80,
          width: 232.40569957081536,
        },
        id: uuidv4(),
        name: "Note4",
        type: "n8n-nodes-base.stickyNote",
        typeVersion: 1,
        position: [1860, -780],
      },
      {
        parameters: {
          content: "## Add or update webhooks",
          height: 80,
          width: 347.2694935622315,
        },
        id: uuidv4(),
        name: "Note5",
        type: "n8n-nodes-base.stickyNote",
        typeVersion: 1,
        position: [2220, -780],
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{ $json["trigger"] }}',
                operation: "contains",
                value2: "TRIGGER_DESTROY_TRANSACTION",
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF4",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [2260, 280],
      },
      {
        parameters: {
          operation: "delete",
          docId: gristDocId,
          tableId: transactionGroupsTable,
          rowId: '={{$json["id"]}}',
        },
        id: uuidv4(),
        name: "Grist5",
        type: "n8n-nodes-base.grist",
        typeVersion: 1,
        position: [2740, 260],
        credentials: {
          gristApi: gristCredential,
        },
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{ $json["trigger"] }}',
                operation: "contains",
                value2: "TRIGGER_DESTROY_TRANSACTION",
              },
            ],
          },
        },
        id: uuidv4(),
        name: "IF13",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [2260, 760],
      },
      {
        parameters: {
          operation: "delete",
          docId: gristDocId,
          tableId: transactionJournalsTable,
          rowId: '={{$json["id"]}}',
        },
        id: uuidv4(),
        name: "Grist6",
        type: "n8n-nodes-base.grist",
        typeVersion: 1,
        position: [2740, 740],
        credentials: {
          gristApi: gristCredential,
        },
      },
    ],
    connections: {
      "Firefly Transaction Update Webhook": {
        main: [
          [
            {
              node: "NoOp",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF: {
        main: [
          [
            {
              node: "Code5",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "Code6",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF1: {
        main: [
          [
            {
              node: "Code",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "Code4",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Code: {
        main: [
          [
            {
              node: "Grist3",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Extract table transaction_groups": {
        main: [
          [
            {
              node: "Does transaction_group row exist?",
              type: "main",
              index: 0,
            },
            {
              node: "Merge",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Does transaction_group row exist?": {
        main: [
          [
            {
              node: "Code8",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Extract table transaction_journals": {
        main: [
          [
            {
              node: "Does transaction_journal row exist?",
              type: "main",
              index: 0,
            },
            {
              node: "Merge1",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Does transaction_journal row exist?": {
        main: [
          [
            {
              node: "Code7",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Code4: {
        main: [
          [
            {
              node: "Grist2",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Code5: {
        main: [
          [
            {
              node: "Grist1",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Code6: {
        main: [
          [
            {
              node: "Grist",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Merge: {
        main: [
          [
            {
              node: "Item Lists",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Item Lists": {
        main: [
          [
            {
              node: "IF4",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Code7: {
        main: [
          [
            {
              node: "Merge1",
              type: "main",
              index: 1,
            },
          ],
        ],
      },
      Code8: {
        main: [
          [
            {
              node: "Merge",
              type: "main",
              index: 1,
            },
          ],
        ],
      },
      Merge1: {
        main: [
          [
            {
              node: "Item Lists1",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Item Lists1": {
        main: [
          [
            {
              node: "IF13",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "HTTP Request": {
        main: [
          [
            {
              node: "IF2",
              type: "main",
              index: 0,
            },
            {
              node: "Item Lists2",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Set: {
        main: [
          [
            {
              node: "HTTP Request",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF2: {
        main: [
          [
            {
              node: "Set1",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Set1: {
        main: [
          [
            {
              node: "HTTP Request",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      NoOp: {
        main: [
          [
            {
              node: "Extract table transaction_groups",
              type: "main",
              index: 0,
            },
            {
              node: "Extract table transaction_journals",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Item Lists2": {
        main: [
          [
            {
              node: "NoOp",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "HTTP Request1": {
        main: [
          [
            {
              node: "Item Lists3",
              type: "main",
              index: 0,
            },
            {
              node: "IF3",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF3: {
        main: [
          [
            {
              node: "Set3",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Set2: {
        main: [
          [
            {
              node: "HTTP Request1",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Firefly transaction create webhook": {
        main: [
          [
            {
              node: "NoOp",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Item Lists3": {
        main: [
          [
            {
              node: "Merge5",
              type: "main",
              index: 1,
            },
          ],
        ],
      },
      "Install Firefly-iii webhooks": {
        main: [
          [
            {
              node: "Set2",
              type: "main",
              index: 0,
            },
            {
              node: "NoOp4",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF6: {
        main: [
          [
            {
              node: "Code1",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "NoOp2",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Code1: {
        main: [
          [
            {
              node: "IF9",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF7: {
        main: [
          [
            {
              node: "Code2",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "NoOp2",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Code2: {
        main: [
          [
            {
              node: "IF10",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Code3: {
        main: [
          [
            {
              node: "IF11",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF9: {
        main: [
          [
            {
              node: "Set4",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "NoOp1",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF10: {
        main: [
          [
            {
              node: "Set5",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "NoOp1",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF11: {
        main: [
          [
            {
              node: "Set6",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "NoOp1",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Set4: {
        main: [
          [
            {
              node: "Set7",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Set5: {
        main: [
          [
            {
              node: "Set7",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Set6: {
        main: [
          [
            {
              node: "Set7",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Set7: {
        main: [
          [
            {
              node: "IF12",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF12: {
        main: [
          [
            {
              node: "Create Webhook",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "Update Webhook",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Set3: {
        main: [
          [
            {
              node: "HTTP Request1",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF8: {
        main: [
          [
            {
              node: "Code3",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "NoOp2",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      NoOp2: {
        main: [
          [
            {
              node: "NoOp3",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Create Webhook": {
        main: [
          [
            {
              node: "Respond to Webhook",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Update Webhook": {
        main: [
          [
            {
              node: "Respond to Webhook",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      NoOp1: {
        main: [
          [
            {
              node: "IF5",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF5: {
        main: [
          [
            {
              node: "Stop And Error",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "NoOp3",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      Merge5: {
        main: [
          [
            {
              node: "IF6",
              type: "main",
              index: 0,
            },
            {
              node: "IF7",
              type: "main",
              index: 0,
            },
            {
              node: "IF8",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      NoOp4: {
        main: [
          [
            {
              node: "NoOp5",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      NoOp5: {
        main: [
          [
            {
              node: "Merge5",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Firefly Transaction Destroy Webhook": {
        main: [
          [
            {
              node: "NoOp",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF4: {
        main: [
          [
            {
              node: "Grist5",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "IF1",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      IF13: {
        main: [
          [
            {
              node: "Grist6",
              type: "main",
              index: 0,
            },
          ],
          [
            {
              node: "IF",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
    },
    settings: {},
  };

  return {
    fireflyWebhookInstallationWebhookUUID:
      fireflyWebhookInstallationWebhookUUID,
    fireflyTransactionRescanWebhookUUID: fireflyTransactionRescanWebhookUUID,
    fireflyTransactionCreateWebhookUUID: fireflyTransactionCreateWebhookUUID,
    fireflyTransactionUpdateWebhookUUID: fireflyTransactionUpdateWebhookUUID,
    fireflyTransactionDestroyWebhookUUID: fireflyTransactionDestroyWebhookUUID,
    workflow: workflow,
  };
}
