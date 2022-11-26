import {hexToBuffer} from "./prover-client-main.component";
import {classes} from "@runonbitcoin/nimble";
import PrivateKey = classes.PrivateKey;
import PublicKey = classes.PublicKey;
import {BinaryLike, createHash} from "crypto";

// https://github.com/sCrypt-Inc/zokrates/blob/33ec173c28a019d7993e328b61b99e4e65fc814d/README.md#L75-L75
describe('test', () => {
  const privKeyHexString = "ec4916dd28fc4c10d78e287ca5d9cc51ee1ae73cbfde08c6b37324cbfaac8bc5";

  it('splitPrivKey', () => {
    expect(splitDecimal(privKeyHexString)).toStrictEqual([
      "314077308411032793321278816725012958289",
      "316495952764820137513325325447450102725"
    ]);
  });

  it("splitSha256OfPrivKey", () => {
    const hexString = sha256Hash(hexStringToBuffer(privKeyHexString));
    console.log(hexString);
    const splitted = splitDecimal(hexString);
    expect(splitted)
      .toStrictEqual([
        "67428615251739275197038733346106089224",
        "232995379825841761673536055030921300908"
      ]);
  });


  it("splitPubKey", async () => {
    const privKeyBuffer = hexStringToBuffer(privKeyHexString);

    const unCompressedPk = new PrivateKey(privKeyBuffer, false, false, true);
    const unCompressedPubKey = PublicKey.fromPrivateKey(unCompressedPk);
    expect(unCompressedPubKey.toString())
      .toBe("0494d6deea102c33307a5ae7e41515198f6fc19d3b11abeca5bff56f1011ed2d8e3d8f02cbd20e8c53d8050d681397775d0dc8b0ad406b261f9b4c94404201cab3");
  });
});

function hexStringToBuffer(hexString: string) {
  return hexToBuffer(hexString);
}

function splitBuffer(buffer: Uint8Array): [string, string] {
  const halfIdx = buffer.length / 2;
  return [
    toBigInt(buffer.slice(halfIdx).buffer).toString(10),
    toBigInt(buffer.slice(0, halfIdx).buffer).toString(10)
  ];
}

function splitDecimal(hexString: string): [string, string] {
  const buffer = hexStringToBuffer(hexString).reverse();
  return splitBuffer(buffer);
}

function toBigInt(buf: ArrayBuffer) {
  const arr = new Uint8Array(buf);
  let result = BigInt(0);
  for (let i = arr.length - 1; i >= 0; i--) {
    result = result * BigInt(256) + BigInt(arr[i]);
  }
  return result;
}

function sha256Hash(input: BinaryLike) {
  return createHash('sha256').update(input).digest('hex');
}
