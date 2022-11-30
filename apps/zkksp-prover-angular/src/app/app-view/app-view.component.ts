import { Component, Input } from '@angular/core';
import {App, AuthStatus} from "@zkp-hackathon/common";
import {BehaviorSubject, combineLatest, filter, map, mergeMap, timer} from "rxjs";
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
        {{_remainingTime$ | async}}
      </ng-container>
      <ng-container *ngIf="authStatus | async as status">
        <div *ngIf="status.authorized" fxLayout="column">
          <div>Authorized</div>
        </div>
        <div *ngIf="!status.authorized" fxLayout="column">
          <div>Unauthorized: {{status.reason}}</div>
        </div>
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

  public authStatus = new BehaviorSubject<AuthStatus>(null);
  public _remainingTime$ = combineLatest([
    timer(0, 1000),
    this.authStatus.asObservable()
  ]).pipe(
    filter(([time, auth]) => auth != null),
    map(
      ([time, auth]) => {
        return auth.end - Date.now();
      }
    )
  );

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
    const res: AuthStatus = await this.zkpService.authorizeApp(this.app.appId)
    this.authStatus.next(res);
  }
}
