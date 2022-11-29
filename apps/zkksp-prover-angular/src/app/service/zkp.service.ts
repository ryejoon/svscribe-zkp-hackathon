import { Injectable } from '@angular/core';
import {BehaviorSubject, lastValueFrom} from "rxjs";
import {privKeyToHexString, privKeyToSha256HashSplitted, splitDecimal} from "../prover-client-main/input-generator";
import {environment} from "../../environments/environment";
import {WalletService} from "./wallet.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ZkpService {

  constructor(
    private http: HttpClient,
    private walletService: WalletService
  ) {
  }

  public processing$ = new BehaviorSubject(false);
  public output = new BehaviorSubject(null);

  public async generateZkp() {
    this.processing$.next(true);
    const keyHexStr = privKeyToHexString(this.walletService.privateKey$.value);
    const [first, second] = splitDecimal(keyHexStr);
    const [firstHash, secondsHash] = privKeyToSha256HashSplitted(keyHexStr);

    const res = await lastValueFrom(this.http.get(`${environment.proverBackendHost}/generateProof`, {
      responseType: 'text',
      params: {
        keyParts: `${first} ${second}`,
        hashParts: `${firstHash} ${secondsHash}`
      }
    })).finally(() => {
      this.processing$.next(false);
    })
    console.log(res);
    this.output.next(res);
    return res;
  }

  public async registerSubmitZkp() {
    const publicKey = this.walletService.privateKey$.value.toPublicKey();
    const res = await lastValueFrom(
      this.http.post(`${environment.proverBackendHost}/registerProof`, {
        publicKey: publicKey.toString()
    })
    ).finally(() => {
      this.processing$.next(false);
    })
    console.log(res);
  }
}
