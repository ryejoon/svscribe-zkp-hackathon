import { Component, Input } from '@angular/core';
import {App, AuthStatus} from "@zkp-hackathon/common";
import {BehaviorSubject, combineLatest, filter, map, mergeMap, timer} from "rxjs";
import {WalletService} from "../service/wallet.service";
import {ZkpService} from "../service/zkp.service";

@Component({
  selector: 'app-view',
  template: `
    <div fxLayout="column">
      <ng-container *ngIf="{
        processing: walletService.paymentProcessing$ | async,
        key: walletService.privateKey$ | async,
        token: zkpService.token$ | async,
        remaining: (_remainingTime$ | async) / 1000,
        auth: authStatus$ | async
      } as context">
        <div fxLayout="row">
          <div fxFlex="50" fxLayout="column">
            <div class="subtitle">{{app.name}}</div>
            <div class="title-box">
              <div>{{app.description}}</div>
              <div>{{app.appId}}</div>
              <div class="gray">{{app.priceSatoshis}} satoshi for {{app.durationSeconds}} seconds</div>
            </div>
          </div>
          <div fxFlex="50" fxLayout="row" fxLayoutAlign="space-evenly">
            <button (click)="pay()" [disabled]="!context.key || context.processing">Pay
            </button>
            <button (click)="checkAuth()" [disabled]="!context.token || context.processing">Check Auth</button>
          </div>
        </div>
        <div *ngIf="context.auth && context.remaining >= 0" fxLayout="row">
          <div class="green">Authorized : </div>
          <div class="gray">{{context.remaining | number: '1.0-0'}} seconds remaining</div>
        </div>
        <div *ngIf="context.token && context.auth && !context.auth.authorized" fxLayout="row">
          <div class="red">Unauthorized : </div>
          <div class="gray">{{context.auth?.reason}}</div>
        </div>
      </ng-container>
    </div> `,
  styleUrls: ['../common.scss'],
  styles: [`
    .outer {
      padding: 10px
    }
    .green {
      color: green
    }
    .red {
      color: red
    }
    .gray {
      color: darkgray
    }
  `],
})
export class AppViewComponent {
  public authStatus$ = new BehaviorSubject<AuthStatus>(null);
  public _remainingTime$ = combineLatest([
    timer(0, 1000),
    this.authStatus$.asObservable()
  ]).pipe(
    filter(([time, auth]) => auth != null),
    map(
      ([time, auth]) => {
        return auth.end - Date.now();
      }
    )
  );

  constructor(
    public walletService: WalletService,
    public zkpService: ZkpService
  ) {
  }

  @Input() app: App;

  async pay() {
    this.walletService.paymentProcessing$.next(true);
    await this.walletService.pay(this.app.paymentAddress, this.app.priceSatoshis)
      .then(r => console.log(r))
      .finally(() => this.walletService.paymentProcessing$.next(false));
  }

  async checkAuth() {
    const res: AuthStatus = await this.zkpService.authorizeApp(this.app.appId)
    this.authStatus$.next(res);
  }
}
