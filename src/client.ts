import axios from 'axios'
import { FireflyConnection } from './types/FireflyConnection.js'

export default class Client {
  http_client: Any

  constructor(conn: FireflyConnection) {
    this.http_client = axios.create({
      baseURL: conn.firefly_iii_clean_url,
      headers: {
        'Authorization': 'Bearer '+conn.connection.firefly_iii_personal_access_token
      }
    })
  }

  testConnectivity() {
    return this.http_client.get("/api/v1/about")
  }
}
