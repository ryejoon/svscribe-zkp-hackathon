import {Component} from '@angular/core';
import {Address, PrivateKey, PublicKey} from '@runonbitcoin/nimble';
import {WhatsOnChainClient} from "../whatsOnChainClient/WhatsOnChainClient";
import {BehaviorSubject, from, Observable} from "rxjs";
import {WhatsOnChainBalance} from "../whatsOnChainClient/WhatsOnChainResponse";
import {AxiosResponse} from "axios";
import {HttpClient} from "@angular/common/http";
import {privKeyToHexString, privKeyToSha256HashSplitted, splitDecimal} from "./input-generator";

@Component({
  selector: 'prover-client-main',
  template: `
    <div>
      <div>
        <button (click)="generateRandomKey()">Generate New Key</button>
        <ng-container *ngIf="key">
          <div>Address: {{address?.toString()}}</div>
          <div>Key: {{key?.toString()}}</div>
          <div>{{key.number.length}} {{key.number | json}}</div>
          <ng-container *ngIf="(balance$ | async)?.data as balance">
            <div>Balance: {{balance.confirmed + balance.unconfirmed}}</div>
          </ng-container>
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
    this.balance$ = from(this.wocClient.getBalance(this.address?.toString()));
  }

  generateZkp() {
    this.generatingProof$.next(true);
    const keyHexStr = privKeyToHexString(this.key);
    const [first, second] = splitDecimal(keyHexStr);
    const [firstHash, secondsHash] = privKeyToSha256HashSplitted(keyHexStr);

    console.log(first, second, firstHash, secondsHash);
  }
}
