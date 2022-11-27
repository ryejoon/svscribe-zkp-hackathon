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
