import {Component} from '@angular/core';
import {PrivateKey} from '@runonbitcoin/nimble';
import {
  BehaviorSubject,
  combineLatestWith,
  exhaustMap,
  filter,
  firstValueFrom,
  from,
  lastValueFrom,
  map,
  Observable
} from "rxjs";
import {AxiosResponse} from "axios";
import {HttpClient} from "@angular/common/http";
import {privKeyToHexString, privKeyToSha256HashSplitted, splitDecimal} from "./input-generator";
import {environment} from "../../environments/environment";
import {App, WhatsOnChainBalance, WhatsOnChainClient} from "@zkp-hackathon/common";
import {SensiletService} from "../service/sensilet.service";

@Component({
  selector: 'prover-client-main',
  template: `
    <div fxLayout="row">
      <div fxLayout="column" fxFlex="50">
        <div>
          <button (click)="generateRandomKey()">Generate New Key</button>
          <div>
            <input type="text" [(ngModel)]="tempKey" />
            <button (click)="importKey()">Import Key</button>
          </div>
        </div>
        <ng-container *ngIf="(privateKey$ | async) as key">
          <div>Address: {{address$ | async}}</div>
          <div>Key: {{key?.toString()}}</div>
          <ng-container *ngIf="(balance$ | async)?.data as balance">
            <div>Balance: {{balance.confirmed + balance.unconfirmed}}</div>
          </ng-container>

          <button (click)="charge()">Charge 1000 Satoshi</button>
          <button (click)="generateZkp()">Generate ZKP</button>
        </ng-container>
        <mat-progress-spinner *ngIf="generatingProof$ | async" mode="indeterminate"></mat-progress-spinner>
      </div>
      <div fxLayout="row wrap">
        <app-view *ngFor="let app of apps$ | async" [app]="app">
        </app-view>
      </div>
    </div>
  `,
  styles: [],
})
export class ProverClientMainComponent {

  constructor(
    private http: HttpClient,
    private sensiletService: SensiletService
  ) {
  }

  apps$ = this.getAllApps();
  tempKey: string;
  privateKey$ = new BehaviorSubject<PrivateKey>(null);
  address$ = this.privateKey$.pipe(
    filter(pk => pk != null),
    map(pk => pk.toAddress().toString())
  );

  generatingProof$ = new BehaviorSubject(false);
  needsRefresh$ = new BehaviorSubject(true);

  wocClient = new WhatsOnChainClient(null, { network: "main" });

  balance$: Observable<AxiosResponse<WhatsOnChainBalance>> =
    this.address$
      .pipe(
        combineLatestWith(this.needsRefresh$.asObservable()),
        exhaustMap(([address]) => from(this.wocClient.getBalance(address)))
      )

  generateRandomKey() {
    this.privateKey$.next(PrivateKey.fromRandom());
  }

  async generateZkp() {
    this.generatingProof$.next(true);
    const keyHexStr = privKeyToHexString(this.privateKey$.value);
    const [first, second] = splitDecimal(keyHexStr);
    const [firstHash, secondsHash] = privKeyToSha256HashSplitted(keyHexStr);

    const res = await lastValueFrom(this.http.get(`${environment.proverBackendHost}/generateProof`, {
      params: {
        keyParts: `${first} ${second}`,
        hashParts: `${firstHash} ${secondsHash}`
      }
    })).finally(() => {
      this.generatingProof$.next(false);
    })
    console.log(res);
  }

  getAllApps(): Observable<App[]> {
    return this.http.get(`${environment.verifierBackendHost}/apps`) as Observable<App[]>;
  }

  async charge() {
    const address = await firstValueFrom(this.address$);
    const res = await this.sensiletService.sensilet.transferBsv({
      receivers: [{
        address: address,
        amount: 1000
      }],
      broadcast: true
    })
    console.log(res);
    this.needsRefresh$.next(true);
  }

  importKey() {
    this.privateKey$.next(PrivateKey.from(this.tempKey));
  }
}
