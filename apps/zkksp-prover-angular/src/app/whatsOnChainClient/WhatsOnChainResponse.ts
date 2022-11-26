export type WhatsOnChainNetwork = 'main' | 'test' | 'stn' | string;

export interface WhatsOnChainBlockChainInfo {
  chain: WhatsOnChainNetwork;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  mediantime: number;
  verificationprogress: number;
  pruned: false;
  chainwork: string;
}

export interface GetByHashResp {
  hash: string;
  confirmations: number;
  size: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  txcount: number;
  tx: string[];
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  previousblockhash: string;
  nextblockhash: string;
  coinbaseTx: {
    hex: string;
    txid: string;
    hash: string;
    size: number;
    version: number;
    locktime: number;
    vin: [
      {
        txid: string;
        vout: number;
        scriptSig: {
          asm: string;
          hex: string;
        };
        sequence: number;
        coinbase: string;
      }
    ];
    vout: [
      {
        value: number;
        n: number;
        scriptPubKey: {
          asm: string;
          hex: string;
          reqSigs: number;
          type: number;
          addresses: string[];
          opReturn: null;
        };
      }
    ];
    blockhash: string;
    confirmations: number;
    time: number;
    blocktime: 1553416668;
  };
  totalFees: number;
  miner: string;
  pages: null;
}

export interface GetByHeightResp {
  hash: string;
  confirmations: number;
  size: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  txcount: number;
  tx: string[];
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  previousblockhash: string;
  nextblockhash: string;
  coinbaseTx: {
    hex: string;
    txid: string;
    hash: string;
    size: number;
    version: number;
    locktime: number;
    vin: [
      {
        txid: string;
        vout: number;
        scriptSig: {
          asm: string;
          hex: '';
        };
        sequence: number;
        coinbase: string;
      }
    ];
    vout: [
      {
        value: number;
        n: number;
        scriptPubKey: {
          asm: string;
          hex: string;
          reqSigs: number;
          type: number;
          addresses: string[];
          opReturn: null;
        };
      }
    ];
    blockhash: string;
    confirmations: number;
    time: number;
    blocktime: 1553501874;
  };
  totalFees: number;
  miner: string;
  pages: null;
}

export interface WhatsOnChainBlockHeader {
  hash: string;
  confirmations: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  previousblockhash: string;
  nextblockhash: string;
}

export interface WhatsOnChainMerkleBranch {
  hash: string;
  pos: 'R' | 'L';
}
export interface WhatsOnChainMerkleProof {
  blockHash: string;
  branches: WhatsOnChainMerkleBranch[];
  hash: string;
  merkleRoot: string;
}

export interface WhatsOnChainUtxo {
  height?: number;
  tx_hash: string;
  tx_pos: number;
  value: number;
}

export interface WhatsOnChainHistory {
  tx_hash: string;
  height: number;
}

type TransactionInput = {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
  coinbase: string;
};

type TransactionOutput = {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    reqSigs: number;
    type: number;
    addresses: string[];
    opReturn: string;
    isTruncated: boolean;
  };
};

/**
 * https://developers.whatsonchain.com/#get-by-tx-hash
 */
export interface WhatsOnChainTransaction {
  txid: string;
  hash: string;
  size: number;
  version: number;
  locktime: number;
  vin: TransactionInput[];
  vout: TransactionOutput[];
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
}

export type WhatsOnChainAddressInfo = {
  address: string,
  ismine: boolean,
  isscript: boolean,
  isvalid: boolean,
  iswatchonly: boolean,
  scriptPubKey: string
}

export type WhatsOnChainBalance = {
  confirmed: number,
  unconfirmed: number
}

export type BulkTransactionStatus = {
  txid: string;
  blockhash: string;
  blockheight: number;
  blocktime: number;
  confirmations: number;
}[];
