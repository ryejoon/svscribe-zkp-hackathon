import { Component, Input } from '@angular/core';
import {App} from "@zkp-hackathon/common";
import {BehaviorSubject} from "rxjs";
import {WalletService} from "../service/wallet.service";
import {ZkpService} from "../service/zkp.service";

@Component({
  selector: 'app-view',
  template: `
    <div fxLayout="column" class="outer">
      <div>{{app.name}}</div>
      <div>{{app.description}}</div>
      <div>{{app.priceSatoshis}} satoshi for {{app.durationSeconds}} seconds</div>
      <ng-container *ngIf="{processing: paymentProcessing$ | async} as context">
        <button (click)="pay()" *ngIf="!context.processing">Pay</button>
        <mat-progress-bar mode="indeterminate" *ngIf="context.processing"></mat-progress-bar>

        <button (click)="checkAuth()" *ngIf="!context.processing">Check Auth</button>
      </ng-container>
    </div> `,
  styles: [`
    .outer {
      padding: 10px
    }
  `],
})
export class AppViewComponent {
  public paymentProcessing$ = new BehaviorSubject(false);

  constructor(
    private walletService: WalletService,
    private zkpService: ZkpService
  ) {
  }

  @Input() app: App;

  async pay() {
    this.paymentProcessing$.next(true);
    await this.walletService.pay(this.app.paymentAddress, this.app.priceSatoshis);
    this.paymentProcessing$.next(false);
  }

  async checkAuth() {
    const res = await this.zkpService.authorizeApp(this.app.appId)
    console.log(res);
  }
}
