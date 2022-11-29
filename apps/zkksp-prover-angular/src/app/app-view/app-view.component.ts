import { Component, Input } from '@angular/core';
import {App} from "@zkp-hackathon/common";
import {BehaviorSubject} from "rxjs";
import {WalletService} from "../service/wallet.service";

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
    private walletService: WalletService
  ) {
  }

  @Input() app: App;

  pay() {
    this.paymentProcessing$.next(true);


  }
}
