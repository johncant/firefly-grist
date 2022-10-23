import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { FireflyConnection } from './types/FireflyConnection.js'
import type { FireflyAccountResponse } from './types/FireflyAccountResponse.js'
import type { FireflyAccountResponse } from './types/FireflyTransactionResponse.js'
import type { FireflyAccount } from './types/FireflyTransaction.js'


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

  private async fetchPage(path: string, page: number): Promise<any> {
    const response = await this.http_client.get(path, {"params": {"page": page}})
    return response.data
  }

  private async *fetchPaginated(path: string): AsyncGenerator<FireflyPaginatedResponse> {
    let result = null;
    let page = 0

    while(result == null || result.meta.pagination.current_page < result.meta.pagination.total) {
      result = await this.fetchPage(path, page);
      for (const item of result.data) {
        yield item
      }
      page++;
    }
  }

  async *fetchAccounts(): AsyncGenerator<FireflyAccount> {
    const gen = <AsyncGenerator<FireflyAccount> >(this.fetchPaginated("/api/v1/accounts"));
    yield *gen
  }

  async *fetchTransactions(): AsyncGenerator<FireflyTransaction> {
    const gen = <AsyncGenerator<FireflyTransaction> >(this.fetchPaginated("/api/v1/transactions"));
    yield *gen
  }
}
