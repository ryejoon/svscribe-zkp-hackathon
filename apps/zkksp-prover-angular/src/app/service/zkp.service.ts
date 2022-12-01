import { Injectable } from '@angular/core';
import {BehaviorSubject, lastValueFrom} from "rxjs";
import {privKeyToHexString, privKeyToSha256HashSplitted, splitDecimal} from "../prover-client-main/input-generator";
import {environment} from "../../environments/environment";
import {WalletService} from "./wallet.service";
import {HttpClient} from "@angular/common/http";
import {PrivateKey} from "@runonbitcoin/nimble";
import {AuthStatus, GenerateProofResponse} from "@zkp-hackathon/common";
import {ConsoleService} from "./console.service";

@Injectable({
  providedIn: 'root'
})
export class ZkpService {

  constructor(
    private http: HttpClient,
    private walletService: WalletService,
    private console: ConsoleService
  ) {
  }

  public proofGeneration$ = new BehaviorSubject<GenerateProofResponse>(null);
  public processing$ = new BehaviorSubject(false);
  public token$ = new BehaviorSubject(null);

  public async generateZkp() {
    this.processing$.next(true);
    const privateKey = this.walletService.privateKey$.value;
    const keyHexStr = privKeyToHexString(privateKey);
    const [first, second] = splitDecimal(keyHexStr);
    const [firstHash, secondsHash] = privKeyToSha256HashSplitted(keyHexStr);

    this.console.addMessage(`start generating zk-proof for your possession of the privateKey...`);
    const res: GenerateProofResponse = await lastValueFrom(this.http.get(`${environment.proverBackendHost}/generateProof`, {
      responseType: 'json',
      params: {
        keyParts: `${first} ${second}`,
        hashParts: `${firstHash} ${secondsHash}`,
        publicKey: new PrivateKey(privateKey.number, false, false, true).toPublicKey().toString()
      }
    }))
      .catch(err => {
        console.error(err);
        this.console.addMessage(`generating zk-proof failed with status : ${err.status}`, 'error');
        this.console.addMessage(err.message, 'error');
        throw err;
      })
      .finally(() => {
      this.processing$.next(false);
    }) as GenerateProofResponse;
    this.console.addMessage(`zk-proof generation succeeded with command: ${res['command']}, written proof to ${res['proofFile']}`);
    this.console.addMessage(res['message']);
    this.proofGeneration$.next(res);
    return res;
  }

  public async registerSubmitZkp() {
    this.processing$.next(true);
    const pk = this.walletService.privateKey$;
    const pkUncompressed = new PrivateKey(pk.value.number, false, false, true);
    const proverBackend = `${environment.proverBackendHost}/registerProof`;
    this.console.addMessage(`submitting your zk-proof file to Svscribe...`);
    const res = await lastValueFrom(
      this.http.post(proverBackend, {
        publicKey: pkUncompressed.toPublicKey().toString()
    })
    ).catch(err => {
      this.console.addMessage(`submitting your zk-proof to Svscribe failed with status: ${err.status}`, "error");
      this.console.addMessage(err.message, "error");
      throw err;
    })
      .finally(() => {
      this.processing$.next(false);
    })
    const token = res['token'];
    if (token) {
      this.console.addMessage(`submitting zk-proof to Svscribe succeed. Received auth token ${token}`);
      this.token$.next(token);
    }
    console.log(res);
  }

  public async authorizeApp(appId: string): Promise<AuthStatus> {
    this.processing$.next(true);
    const token = this.token$.value;
    this.console.addMessage(`checking auth for app ${appId} with token ${token}`);
    const res: AuthStatus = await lastValueFrom(
      this.http.get(`${environment.verifierBackendHost}/authorize`, {
        headers: {
          authorization: `Bearer ${token}`
        },
        params: {
          appId
        }
      })
    )
      .catch(err => {
        this.console.addMessage(`auth request to app ${appId} failed : ${err.message}`, 'error');
        throw err;
      })
      .finally(() => {
      this.processing$.next(false);
    }) as AuthStatus;
    this.console.addMessage(`authorized for app ${appId} : ${res.authorized}`, res.authorized ? 'log' : 'error');
    return res;
  }
}
