import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  BulkTransactionStatus, WhatsOnChainBalance,
  WhatsOnChainBlockChainInfo,
  WhatsOnChainBlockHeader,
  WhatsOnChainHistory,
  WhatsOnChainMerkleProof, WhatsOnChainNetwork,
  WhatsOnChainTransaction,
  WhatsOnChainUtxo,
} from './WhatsOnChainResponse';


/**
 * https://developers.whatsonchain.com/#introduction
 */

export interface ServiceOption {
  network: WhatsOnChainNetwork;
  logRequest?: boolean;
  logResponse?: boolean;
}

const baseURL = 'https://api.whatsonchain.com/v1/bsv';

export class WhatsOnChainClient {
  private axiosInstance: AxiosInstance;

  constructor(
    private _axiosRequestConfig: AxiosRequestConfig,
    private serviceConfig: ServiceOption
  ) {
    this.axiosInstance = axios.create({
      baseURL: baseURL
    });
    if (serviceConfig?.logRequest) {
      this.axiosInstance.interceptors.request.use(v => { console.log(v); return v;});
    }
    if (serviceConfig?.logResponse) {
      this.axiosInstance.interceptors.response.use(v => { console.log(v); return v;});
    }
  }

  public setAuth(auth: { username: string; password: string }) {
    this._axiosRequestConfig.auth = auth;
  }

  get axiosRequestConfig(): AxiosRequestConfig {
    return this._axiosRequestConfig;
  }

  getApiStatus() {
    return this.axiosInstance.get(
      `/${this.serviceConfig.network}/woc`,
      this._axiosRequestConfig
    );
  }

  getBlockChainInfo() {
    return this.axiosInstance.get<WhatsOnChainBlockChainInfo>(
      `${this.serviceConfig.network}/chain/info`,
      this._axiosRequestConfig
    );
  }

  getHeaderByHash(blockHash: string) {
    return this.axiosInstance.get<WhatsOnChainBlockHeader>(
      `${this.serviceConfig.network}/block/${blockHash}/header`,
      this._axiosRequestConfig
    );
  }

  getHeaderByHeight(height: number) {
    return this.axiosInstance.get<WhatsOnChainBlockHeader>(
      `${this.serviceConfig.network}/block/height/${height}`,
      this._axiosRequestConfig
    );
  }

  // This endpoint retrieves the last 10 block headers.
  getHeaders() {
    return this.axiosInstance.get<WhatsOnChainBlockHeader[]>(
      `${this.serviceConfig.network}/block/headers`,
      this._axiosRequestConfig
    );
  }

  // fromAddress
  getUnspentTransactions(fromAddress: string) {
    return this.axiosInstance.get<WhatsOnChainUtxo[]>(
      `${this.serviceConfig.network}/address/${fromAddress}/unspent`,
      this._axiosRequestConfig
    );
  }

  getMerkleProof(txHash: string) {
    return this.axiosInstance.get<WhatsOnChainMerkleProof[]>(
      `${this.serviceConfig.network}/tx/${txHash}/proof`,
      this._axiosRequestConfig
    );
  }

  /**
   * Txs of which specified address is in the output
   */
  getHistory(address: string) {
    return this.axiosInstance.get<WhatsOnChainHistory[]>(
      `${this.serviceConfig.network}/address/${address}/history`,
      this._axiosRequestConfig
    );
  }

  getTransactionInfo(hash: string) {
    return this.axiosInstance.get<WhatsOnChainTransaction>(
      `${this.serviceConfig.network}/tx/hash/${hash}`,
      this._axiosRequestConfig
    );
  }

  getTransactionRaw(hash: string) {
    return this.axiosInstance.get<string>(
      `${this.serviceConfig.network}/tx/${hash}/hex`,
      this._axiosRequestConfig
    );
  }

  getExchangeRate() {
    return this.axiosInstance.get<{ currency: string; rate: number }>(
      `${this.serviceConfig.network}/exchangerate`,
      this._axiosRequestConfig
    );
  }

  getBalance(address: string) {
    if (!address) {
      return Promise.resolve(null);
    }
    return this.axiosInstance.get<WhatsOnChainBalance>(
      `/${this.serviceConfig.network}/address/${address}/balance`,
      this._axiosRequestConfig
    );
  }

  bulkTransactionStatus(txids: string[]) {
    if (!txids?.length) {
      throw new Error('txids empty');
    }
    return this.axiosInstance.post<BulkTransactionStatus>(
      `${this.serviceConfig.network}/txs/status`,
      {
        txids: txids,
      },
      this._axiosRequestConfig
    );
  }

  putTransaction(txhex: string) {
    return this.axiosInstance.post(
      `${this.serviceConfig.network}/tx/raw`,
      {
        txhex
      },
      this._axiosRequestConfig
    );
  }
}
