import {Component} from '@angular/core';
import {PrivateKey} from '@runonbitcoin/nimble';
import {BehaviorSubject, firstValueFrom, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {App} from "@zkp-hackathon/common";
import {SensiletService} from "../service/sensilet.service";
import {WalletService} from "../service/wallet.service";
import {ZkpService} from "../service/zkp.service";

@Component({
  selector: 'prover-client-main',
  template: `
    <ng-container *ngIf="{
        key: walletService.privateKey$ | async,
        address: walletService.address$ | async,
        balance: (walletService.balance$ | async)?.data,
        token: zkpService.token$ | async,
        processing: processing$ | async,
        zpkProcessing: zkpService.processing$ | async,
        paymentProcessing: walletService.paymentProcessing$ | async
    } as context">
      <div class="top-bar">
        <mat-progress-bar mode="indeterminate" *ngIf="context.processing || context.zpkProcessing || context.paymentProcessing">
        </mat-progress-bar>
      </div>
      <div fxLayout="row">
        <div fxLayout="column" fxFlex="50">
          <div>
            <div class="title">Wallet</div>
            <div fxLayout="column" class="title-box">
              <div fxLayout="row">
                <div fxFlex="50">
                  <button (click)="generateRandomKey()">Generate New Key</button>
                </div>
                <div fxFlex="50" fxLayout="row">
                  <input type="text" [(ngModel)]="tempKey"/>
                  <button (click)="importKey()">Import Key</button>
                </div>
              </div>
              <ng-container *ngIf="context.key">
                <div fxLayout="column">
                  <div>Address: {{context.address}}</div>
                  <div>Key: {{context.key?.toString()}}</div>
                  <div fxLayout="row" fxLayoutAlign="space-evenly" *ngIf="context.balance && !context.processing">
                    <div>Balance: {{context.balance.confirmed + context.balance.unconfirmed}}</div>
                    <button (click)="charge()">Charge 1000 Satoshi</button>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
          <div *ngIf="context.key">
            <div class="title">ZKP</div>
            <div class="title-box">
              <div>Svscribe Token: {{context.token}}</div>
              <button (click)="zkpService.generateZkp()">Generate ZKP</button>
              <button (click)="zkpService.registerSubmitZkp()">Register Svscribe (submit ZKP)</button>
            </div>
          </div>
          <pre>{{zkpService.output$ | async}}</pre>
        </div>
        <div fxLayout="column" fxFlex="50" fxLayoutAlign="start">
          <app-view *ngFor="let app of apps$ | async" [app]="app">
          </app-view>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ['../common.scss'],
  styles: [
    `
      .top-bar {
        height: 5px
      }
    `
  ]
})
export class ProverClientMainComponent {

  constructor(
    private http: HttpClient,
    private sensiletService: SensiletService,
    public walletService: WalletService,
    public zkpService: ZkpService
  ) {
  }

  processing$ = new BehaviorSubject<boolean>(null);
  apps$ = this.getAllApps();
  tempKey: string;

  generateRandomKey() {
    this.walletService.privateKey$.next(PrivateKey.fromRandom());
  }

  getAllApps(): Observable<App[]> {
    return this.http.get(`${environment.verifierBackendHost}/apps`) as Observable<App[]>;
  }

  async charge() {
    this.processing$.next(true);
    const address = await firstValueFrom(this.walletService.address$);
    const res = await this.sensiletService.sensilet.transferBsv({
      receivers: [{
        address: address,
        amount: 1000
      }],
      broadcast: true
    }).finally(() => setTimeout(() => {
      this.walletService.needsRefresh$.next(true);
      this.processing$.next(false);
    }, 3000))
  }

  importKey() {
    this.walletService.privateKey$.next(PrivateKey.from(this.tempKey));
  }
}
