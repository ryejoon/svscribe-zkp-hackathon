import { Injectable } from '@angular/core';
import {BehaviorSubject, lastValueFrom} from "rxjs";
import {privKeyToHexString, privKeyToSha256HashSplitted, splitDecimal} from "../prover-client-main/input-generator";
import {environment} from "../../environments/environment";
import {WalletService} from "./wallet.service";
import {HttpClient} from "@angular/common/http";
import {PrivateKey} from "@runonbitcoin/nimble";
import {AuthStatus} from "@zkp-hackathon/common";

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
  public token$ = new BehaviorSubject(null);

  public async generateZkp() {
    this.processing$.next(true);
    const privateKey = this.walletService.privateKey$.value;
    const keyHexStr = privKeyToHexString(privateKey);
    const [first, second] = splitDecimal(keyHexStr);
    const [firstHash, secondsHash] = privKeyToSha256HashSplitted(keyHexStr);

    const res = await lastValueFrom(this.http.get(`${environment.proverBackendHost}/generateProof`, {
      responseType: 'text',
      params: {
        keyParts: `${first} ${second}`,
        hashParts: `${firstHash} ${secondsHash}`,
        publicKey: new PrivateKey(privateKey.number, false, false, true).toPublicKey().toString()
      }
    })).finally(() => {
      this.processing$.next(false);
    })
    console.log(res);
    this.output.next(res);
    return res;
  }

  public async registerSubmitZkp() {
    this.processing$.next(true);
    const pk = this.walletService.privateKey$;
    const pkUncompressed = new PrivateKey(pk.value.number, false, false, true);
    const res = await lastValueFrom(
      this.http.post(`${environment.proverBackendHost}/registerProof`, {
        publicKey: pkUncompressed.toPublicKey().toString()
    })
    ).finally(() => {
      this.processing$.next(false);
    })
    const token = res['token'];
    if (token) {
      this.token$.next(token);
    }
    console.log(res);
  }

  public async authorizeApp(appId: string): Promise<AuthStatus> {
    this.processing$.next(true);
    const res = await lastValueFrom(
      this.http.get(`${environment.verifierBackendHost}/authorize`, {
        headers: {
          authorization: `Bearer ${this.token$.value}`
        },
        params: {
          appId
        }
      })
    ).finally(() => {
      this.processing$.next(false);
    })
    console.log(res);
    return res as AuthStatus;
  }
}
