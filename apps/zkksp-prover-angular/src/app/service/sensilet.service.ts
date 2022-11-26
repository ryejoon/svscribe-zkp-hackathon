import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SensiletService {

  private sensilet: Sensilet;

  constructor() {
    if (typeof window['sensilet'] !== 'undefined') {
      this.sensilet = window['sensilet'];
      console.log(this.sensilet);
      this.sensilet.isConnect()
        .then(r => console.log(r));
    }
  }
}

type Action = Promise<any>;

type AddrAmnt = {
  address: string,
  amount: number
};
/**
 * https://doc.sensilet.com/guide/sensilet-api.html
 */
type Sensilet = {

  isConnect(): Promise<boolean>;

  /**
   * returns address of current account
   */
  requestAccount(): Promise<string>;

  exitAccount(): Promise<void>;

  /**
   * @returns txid
   */
  transferBsv(options:
                {
                  receivers: AddrAmnt[],
                  broadcast?: boolean
                }): Promise<string>;

  /**
   * @returns txid
   */
  transferSensibleFt(options:
                       {
                         genesis: string,
                         codehash: string,
                         rabinApis: AddrAmnt[],
                         broadcast?: boolean,
                         receivers: AddrAmnt[]
                       }
    ): Promise<string>;

  getBsvBalance(params: any): Promise<{ address: string, balance: { confirmed: number, unconfirmed: number, total: number }}>;

  getSensibleFtBalance(): Promise<any[]>;

  checkTokenUtxoCount({genesis, codehash}): any;

  signTx(options: { list: {txHex: string, address: string, inputIndex: number, scriptHex: string, satoshis: number, sigtype: number }[] }): Promise<{ publicKey:string, r: string, s: string, sig: string }>;

  genesis(params: any): Action;

  getAccount(params: any): Action;

  getAddress(hdPath: any): any;

  getNetwork(): Promise<"mainnet" | "testnet">;

  getPublicKey(hdPath: any): any;

  getPublicKeyAndAddress(hdPath: any): any;

  getVersion(): Action;

  isHDAccount(): Action;

  issue(params: any): Action;

  listGenesis(params: any): Action;

  listNft(params:any): Action;

  on(eventName: string, callback: any): any;

  payWithoutBroadcast({receivers}): any;

  postMessage(message, callback): any;

  signMessage(msg: any): any;

  signMsg(options: { msg: string }): Promise<{address: string, sig: string}>;

  signTransaction(txHex: any, inputInfos: any): any;

  transferAll(params: any): Promise<any>;

  transferNft(params): Action;

}
