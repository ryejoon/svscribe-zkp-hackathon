import { Injectable } from '@angular/core';
import {BehaviorSubject, filter, map} from "rxjs";
import {PrivateKey} from "@runonbitcoin/nimble";

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  public privateKey$ = new BehaviorSubject<PrivateKey>(null);
  public address$ = this.privateKey$.pipe(
    filter(pk => pk != null),
    map(pk => pk.toAddress().toString())
  );

}
