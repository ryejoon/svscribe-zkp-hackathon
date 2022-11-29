import {Component} from '@angular/core';
import {PrivateKey} from '@runonbitcoin/nimble';
import {BehaviorSubject, combineLatestWith, exhaustMap, firstValueFrom, from, lastValueFrom, Observable} from "rxjs";
import {AxiosResponse} from "axios";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {App, WhatsOnChainBalance, WhatsOnChainClient} from "@zkp-hackathon/common";
import {SensiletService} from "../service/sensilet.service";
import {WalletService} from "../service/wallet.service";
import {ZkpService} from "../service/zkp.service";

@Component({
  selector: 'prover-client-main',
  template: `
    <div fxLayout="row">
      <div fxLayout="column" fxFlex="50">
        <div fxLayout="row">
          <div fxFlex="50">
            <button (click)="generateRandomKey()">Generate New Key</button>
          </div>
          <div fxFlex="50" fxLayout="row">
            <input type="text" [(ngModel)]="tempKey" />
            <button (click)="importKey()">Import Key</button>
          </div>
        </div>
        <ng-container *ngIf="(walletService.privateKey$ | async) as key">
          <div>Address: {{walletService.address$ | async}}</div>
          <div>Key: {{key?.toString()}}</div>
          <ng-container *ngIf="(walletService.balance$ | async)?.data as balance">
            <div>Balance: {{balance.confirmed + balance.unconfirmed}}</div>
          </ng-container>
          <button (click)="charge()">Charge 1000 Satoshi</button>
          <button (click)="zkpService.generateZkp()">Generate ZKP</button>
          <button (click)="zkpService.registerSubmitZkp()">Register Svscribe (submit ZKP)</button>
          <div>Token: {{zkpService.token$ | async}}</div>
        </ng-container>
        <pre>{{zkpService.output | async}}</pre>
        <mat-progress-spinner *ngIf="zkpService.processing$ | async" mode="indeterminate"></mat-progress-spinner>
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
    private sensiletService: SensiletService,
    public walletService: WalletService,
    public zkpService: ZkpService
  ) {
  }

  apps$ = this.getAllApps();
  tempKey: string;

  generateRandomKey() {
    this.walletService.privateKey$.next(PrivateKey.fromRandom());
  }

  getAllApps(): Observable<App[]> {
    return this.http.get(`${environment.verifierBackendHost}/apps`) as Observable<App[]>;
  }

  async charge() {
    const address = await firstValueFrom(this.walletService.address$);
    const res = await this.sensiletService.sensilet.transferBsv({
      receivers: [{
        address: address,
        amount: 1000
      }],
      broadcast: true
    })
    setTimeout(() => this.walletService.needsRefresh$.next(true), 1500);
  }

  importKey() {
    this.walletService.privateKey$.next(PrivateKey.from(this.tempKey));
  }
}
