import {classes, P2PKHLockScript} from "@runonbitcoin/nimble";
import {UsedUtxoMap} from "./blockchain/blockchain.service";

export function isUnused(o: classes.Transaction.Output, filterAddress: string, usedUtxoMap: UsedUtxoMap) {
  if (o.script['toAddress']) {
    // P2PKH
    if (filterAddress === (o.script as P2PKHLockScript).toAddress().toString()) {
      if (usedUtxoMap[toUtxoKey(o.txid, o.vout)]) {
        return false;
      } else {
        return true;
      }
      return false;
    }
  }
  return false;
}

export function toUtxoKey(txid: string, outputIndex: number): string {
  return `${txid}_${outputIndex}`;
}
