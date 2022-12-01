export type TokenItem = {
  token: string;
  publicKey: string;
}

export type PaymentPeriod = {
  publicKey: string;
  txid: string;
  appId: string;
  start: number;
  end: number;
  sequence?: number;
}

export type Utxo = {
  publicKey: string;
  txid: string;
  outputIdx: number;
}

export type AppCreateInput = {
  name: string;
  description: string;
  durationSeconds: number;
  priceSatoshis: number;
  privateKey?: string;
  paymentAddress?: string;
}

export type App = AppCreateInput & {
  appId: string;
}

export type ProofJson = {
  proof: any[];
  inputs: [string, string]
}

export type AuthStatus = {
  authorized: boolean,
  start?: number,
  end?: number,
  reason?: string
}


export type GenerateProofResponse = {
  message: string,
  proofFile: string,
  command: string
}
