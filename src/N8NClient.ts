import axios from 'axios';
import type { AxiosInstance } from 'axios';
import curlirize from 'axios-curlirize';


export default class N8NClient {
  http_client: AxiosInstance
  n8n_api_key: string

  constructor(conn: any) {
    this.conn = conn;
    this.http_client = axios.create({
      baseURL: conn.n8n_url,
      headers: {
        'X-N8N-API-KEY': conn.n8n_api_key
      }
    });
    curlirize(this.http_client);
  }

  async createWorkflow(workflow): Promise<any> {
    const response = await this.http_client.post(
      "/api/v1/workflows",
      workflow, {
        "headers": {
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  }

  async activateWorkflow(id: number): Promise<any> {
    const response = await this.http_client.post(
      "/api/v1/workflows/"+id+"/activate"
    );
    return response.data;
  }

}
