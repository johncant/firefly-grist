import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { FireflyConnection } from './types/FireflyConnection.js'

export default class Client {
  http_client: AxiosInstance

  constructor(conn: FireflyConnection) {
    this.http_client = axios.create({
      baseURL: conn.firefly_iii_url,
      headers: {
        'Authorization': 'Bearer '+conn.firefly_iii_personal_access_token
      }
    })
  }

  async testConnectivity() {
    const response = await this.http_client.get("/api/v1/about")
    return response.data
  }
}
