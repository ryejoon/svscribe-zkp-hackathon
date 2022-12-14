import {Injectable, OnModuleInit} from '@nestjs/common';
import {Utxo, WhatsOnChainClient} from "@zkp-hackathon/common";
import {Br, OpCode, Tx, TxIn} from "@ts-bitcoin/core";
import {classes, Transaction} from "@runonbitcoin/nimble";
import PublicKey = classes.PublicKey;
import {isUnused} from "../utils";

export type UsedUtxoMap = { [p: string]: Utxo };

@Injectable()
export class BlockchainService implements OnModuleInit {

  public wocClient: WhatsOnChainClient = new WhatsOnChainClient(
    null, { network: "main" });

  onModuleInit() {
    //
  }

  async fetchTxsAndFilterFirst(sentAddress: string, receiveAddress: string, usedUtxoMap: UsedUtxoMap, heightAscend: boolean): Promise<string> {
    const history = await this.wocClient.getHistory(receiveAddress);
    const data = history.data.sort((a, b) => heightAscend ? a.height - b.height : b.height - a.height);

    console.log(`receiveAddress ${receiveAddress} history count ${data.length}`)
    for (const hist of data) {
      console.log(`fetching height ${hist.height}, ${hist.tx_hash}`)
      const resp = await this.wocClient.getTransactionRaw(hist.tx_hash);
      const rawTx = resp.data;
      const tx = Tx.fromBr(new Br(Buffer.from(rawTx, "hex")));
      const txNimble = Transaction.fromHex(rawTx);
      if (tx.txIns.find(tin => isP2PKHfromAddress(tin, sentAddress) &&
          tx.txOuts.find((o, idx) => {
            return isUnused(txNimble.outputs[idx], receiveAddress, usedUtxoMap);
          }))
      ) {
        return rawTx;
      }
    }
    return null;
  }
}


function isP2PKHfromAddress(txin: TxIn, addressOrPubKey: string) {
  const chunks = txin.script.chunks;
  if (chunks.length != 2) {
    return null;
  }
  if (!chunks.every(c => c.opCodeNum < OpCode.OP_PUSHDATA1)) {
    return null;
  }

  const [signature, pubKeyOrAddress] = chunks;
  return addressOrPubKey === PublicKey.fromString(pubKeyOrAddress.buf.toString('hex')).toAddress().toString();
}
