import {Component} from '@angular/core';
import {Address, PrivateKey, PublicKey} from '@runonbitcoin/nimble';
import {WhatsOnChainClient} from "../whatsOnChainClient/WhatsOnChainClient";
import {BehaviorSubject, from, Observable} from "rxjs";
import {WhatsOnChainBalance} from "../whatsOnChainClient/WhatsOnChainResponse";
import {AxiosResponse} from "axios";
import {HttpClient} from "@angular/common/http";

export function toHexString(key: PrivateKey): string {
  return [...key.number].map(n => n.toString(16)).map(t => t.length === 1 ? '0' + t : t).join('');
}
export function hexToBuffer(hexStr: string) {
  return new Uint8Array(hexStr.match(/../g).map(h => parseInt(h, 16)));
}

export function toDecString(hexStr: string): [string, string] {
  const first = hexStr.slice(0, 32);
  const second = hexStr.slice(32);
  return [first, second];
}

@Component({
  selector: 'prover-client-main',
  template: `
    <div>
      <div>
        <button (click)="generateRandomKey()">Generate New Key</button>
        <div>Address: {{address?.toString()}}</div>
        <div>Key: {{key?.toString()}}</div>
        <div>{{key.number.length}} {{key.number | json}}</div>
        <ng-container *ngIf="(balance$ | async).data as balance">
          <div>Balance: {{balance.confirmed + balance.unconfirmed}}</div>
        </ng-container>
        <button (click)="generateZkp()" *ngIf="address">Generate ZKP</button>
      </div>
    </div>
  `,
  styles: [],
})
export class ProverClientMainComponent {

  constructor(
    private http: HttpClient
  ) {
  }

  generatingProof$ = new BehaviorSubject(false);

  wocClient = new WhatsOnChainClient({}, { network: "main" });

  key: PrivateKey;
  address: Address;

  balance$: Observable<AxiosResponse<WhatsOnChainBalance, any>>;

  generateRandomKey() {
    this.key = PrivateKey.fromRandom();
    this.address = Address.fromPublicKey(PublicKey.fromPrivateKey(this.key));
    this.balance$ = from(this.wocClient.getBalance(this.address.toString()));

    console.log(this.key.number.length);
    // => need to be two hex chars
    const hexStr = toHexString(this.key);
    console.log(hexStr);
    const buffer = hexToBuffer(hexStr);
    console.log(buffer);

    const decStr = [...buffer].map(n => n.toString(10)).join('');
    console.log(decStr);
  }

  arrayBufferToHex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
  }

  generateZkp() {
    this.generatingProof$.next(true);
    // this.http.get(environment.proverHost, {
    //   params: {
    //     key:
    //   }}
    // )

  }
}
