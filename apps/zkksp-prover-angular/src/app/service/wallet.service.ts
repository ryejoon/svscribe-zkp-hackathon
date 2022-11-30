import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatestWith, exhaustMap, filter, from, map, Observable} from "rxjs";
import {classes, PrivateKey} from "@runonbitcoin/nimble";
import {WhatsOnChainBalance, WhatsOnChainClient} from "@zkp-hackathon/common";
import {casts, forgeTx, toUTXO} from 'txforge'
import Transaction = classes.Transaction;
import {AxiosResponse} from "axios";

const { P2PKH, OpReturn } = casts
const AVG_FEE = 50;

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

    const targetUtxos = [];
    let sum = 0;
    const targetAmount = amountSatoshis + AVG_FEE;
    for (const utxo of utxos) {
      sum += utxo.value;
      targetUtxos.push(utxo);
      if (sum > targetAmount) {
        break;
      }
    }
    if (sum < targetAmount) {
      throw new Error(`Not enough balance for address ${fromAddress}. has ${sum}, required ${targetAmount}`);
    }

    const utxoTxRaws = await Promise.all(
      targetUtxos.map(u => this.wocClient.getTransactionRaw(u.tx_hash)))
      .then(r => r.map(rr => rr.data));
    const utxoTxs: { [key: string] : Transaction } = utxoTxRaws.map(raw => Transaction.fromHex(raw))
      .reduce((map, current) => { map[current.hash] = current; return map; }, {});

    const utxoInputs = targetUtxos.map(u => toUTXO({
      txid: u.tx_hash,       // utxo transaction id
      vout: u.tx_pos,       // utxo output index
      satoshis: u.value,   // utxo amount
      script: utxoTxs[u.tx_hash].outputs[u.tx_pos].script.toHex()      // utxo lock script
    }));

// Forge a transaction
    const input = {
      inputs: utxoInputs.map(u => P2PKH.unlock(u, { privkey: privateKey })),
      outputs: [
        P2PKH.lock(amountSatoshis, { address: targetAddress })
      ],
      change: { address: fromAddress }
    };
    const tx = forgeTx(input)
    console.log(utxoInputs);
    console.log(input);
    console.log(tx);
    const hexTx = tx.toHex();
    console.log(hexTx)
    return this.wocClient.putTransaction(hexTx)
      .finally(() => setTimeout(() =>this.needsRefresh$.next(true), 1500));
  }




}
