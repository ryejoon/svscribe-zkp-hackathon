import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatestWith, exhaustMap, filter, from, map, Observable} from "rxjs";
import {classes, PrivateKey} from "@runonbitcoin/nimble";
import {WhatsOnChainBalance, WhatsOnChainClient} from "@zkp-hackathon/common";
import {casts, forgeTx, toUTXO} from 'txforge'
import Transaction = classes.Transaction;
import {AxiosResponse} from "axios";

const { P2PKH, OpReturn } = casts

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  public paymentProcessing$ = new BehaviorSubject(false);
  public privateKey$ = new BehaviorSubject<PrivateKey>(null);
  public address$ = this.privateKey$.pipe(
    filter(pk => pk != null),
    map(pk => pk.toAddress().toString())
  );
  public needsRefresh$ = new BehaviorSubject(true);
  public balance$: Observable<AxiosResponse<WhatsOnChainBalance>> =
    this.address$
      .pipe(
        combineLatestWith(this.needsRefresh$.asObservable()),
        exhaustMap(([address]) => from(this.wocClient.getBalance(address)))
      )

  private wocClient = new WhatsOnChainClient({ responseType: "json" }, { network: "main" });

  async pay(targetAddress: string, amountSatoshis: number) {
    const privateKey = this.privateKey$.value;
    const fromAddress = privateKey.toAddress().toString();

    const axiosResponse = await this.wocClient.getUnspentTransactions(fromAddress);
    const utxos = axiosResponse.data;
    const targetUtxo = utxos[0];
    const utxoTxRaw = (await this.wocClient.getTransactionRaw(targetUtxo.tx_hash)).data;
    const utxoTx = Transaction.fromHex(utxoTxRaw);

    const utxo = toUTXO({
      txid: targetUtxo.tx_hash,       // utxo transaction id
      vout: targetUtxo.tx_pos,       // utxo output index
      satoshis: targetUtxo.value,   // utxo amount
      script: utxoTx.outputs[targetUtxo.tx_pos].script.toHex()      // utxo lock script
    })

// Forge a transaction
    const tx = forgeTx({
      inputs: [
        P2PKH.unlock(utxo, { privkey: privateKey })
      ],
      outputs: [
        P2PKH.lock(amountSatoshis, { address: targetAddress })
      ],
      change: { address: fromAddress }
    })

    const hexTx = tx.toHex();
    console.log(hexTx)
    return this.wocClient.putTransaction(hexTx)
      .finally(() => setTimeout(() =>this.needsRefresh$.next(true), 1500));
  }




}
