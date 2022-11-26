import {PrivateKey} from "@runonbitcoin/nimble";
import * as CryptoJS from 'crypto-js';

export function hexStringToBuffer(hexString: string): Uint8Array {
  return hexToBuffer(hexString);
}

export function bufferToHexString(buffer: Uint8Array) {
  return toBigInt(buffer.buffer).toString(16);
}

export function splitBuffer(buffer: Uint8Array): [string, string] {
  const halfIdx = buffer.length / 2;
  return [
    toBigInt(buffer.slice(halfIdx).buffer).toString(10),
    toBigInt(buffer.slice(0, halfIdx).buffer).toString(10)
  ];
}

export function splitDecimal(hexString: string): [string, string] {
  const buffer = hexStringToBuffer(hexString).reverse();
  return splitBuffer(buffer);
}

export function privKeyToHexString(key: PrivateKey) {
  return toBigInt(key.number.reverse()).toString(16);
}

export function toBigInt(buf: ArrayBuffer) {
  const arr = new Uint8Array(buf);
  let result = 0n;
  for (let i = arr.length - 1; i >= 0; i--) {
    // @ts-ignore
    result = result * 256n + BigInt(arr[i]);
  }
  return result;
}

/**
 * was
 * function sha256Hash(input: BinaryLike) {
 *   return createHash('sha256').update(input).digest('hex');
 * }
 */
export function sha256Hash(hexStringInput: string) {
  const hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(hexStringInput));
  return hash.toString(CryptoJS.enc.Hex);
}

export function toHexString(key: PrivateKey): string {
  return [...key.number].map(n => n.toString(16)).map(t => t.length === 1 ? '0' + t : t).join('');
}
export function hexToBuffer(hexStr: string): Uint8Array {
  return new Uint8Array(hexStr.match(/../g).map(h => parseInt(h, 16)));
}

export function toDecString(hexStr: string): [string, string] {
  const first = hexStr.slice(0, 32);
  const second = hexStr.slice(32);
  return [first, second];
}

export function privKeyToSha256HashSplitted(privKeyHexString: string) {
  const hexString = sha256Hash(privKeyHexString);
  return splitDecimal(hexString);
}
