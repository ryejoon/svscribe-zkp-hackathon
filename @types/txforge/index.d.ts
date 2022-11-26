declare module 'txforge' {
  import * as Nimble from '@runonbitcoin/nimble';
  import { classes } from '@runonbitcoin/nimble';
  import Output = classes.Transaction.Output;

  class Cast {
    mode: string;

    init(params: { address: string | Nimble.Address }, opts?: any);

    lockingScript(params: { address?: string | Nimble.Address }, opts?: any);

    unlockingScript(params: { privkey?: Nimble.PrivateKey }, opts?: any);
  }

  type CreateForgeInput = {
    inputs: any | Cast[];
    outputs: any | Cast[];
    change?:
      | { address?: string | Nimble.Address; script?: string | Nimble.Script }
      | [Cast, any];
    locktime?: number;
    options?: {
      rates?: any;
      sort?: boolean;
    };
  };

  type ToUtxoInput = {
    txid: string; // utxo transaction id
    vout: number; // utxo output index
    satoshis: number; // utxo amount
    script: string | Nimble.Script; // utxo lock script
  };

  class Utxo {
    constructor(input: {
      txid: string;
      vout: any;
      satoshis: number;
      script: any;
    });

    txid: string;
    vout: number;
    satoshis: number;
    script: string | Nimble.Script;

    get output(): Output;
  }

  function forgeTx(input: CreateForgeInput): Nimble.Transaction;

  function toUTXO(input: ToUtxoInput): Utxo;

  export namespace casts {
    class P2PKH {
      static lock(n: number, o: { address: string | Nimble.Address });

      static unlock(utxo: Utxo, k: { privkey: Nimble.PrivateKey });
    }

    class P2PK {
      static lock(n: number, k: { pubkey: Nimble.PublicKey });

      static unlock(utxo: Utxo, k: { privkey: Nimble.PrivateKey });
    }

    class P2MS {
      static lock(
        n: number,
        k: { pubkeys: Nimble.PublicKey[]; threshold: number }
      );

      static unlock(utxo: Utxo, k: { privkeys: Nimble.PrivateKey[] });
    }

    class P2RPH {
      static lock(n: number, k: { r: Uint8Array });

      static unlock(n: number, k: { k: any; privkey: Nimble.PrivateKey });
    }

    class OpReturn {
      static lock(n: number, o: { data: string | string[] });
    }

    class Raw {
      static lock(n: number, k: { script: string });
    }
  }
}
