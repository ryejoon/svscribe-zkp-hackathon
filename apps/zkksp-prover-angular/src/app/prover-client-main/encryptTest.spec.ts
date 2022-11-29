import {classes} from "@runonbitcoin/nimble";
import {
  bufferToHexString,
  hexStringToBuffer, hexToBuffer,
  privKeyToHexString,
  privKeyToSha256HashSplitted,
  splitDecimal
} from "./input-generator";
import PrivateKey = classes.PrivateKey;
import PublicKey = classes.PublicKey;

// https://github.com/sCrypt-Inc/zokrates/blob/33ec173c28a019d7993e328b61b99e4e65fc814d/README.md#L75-L75
describe('test', () => {
  it("spec name", () => {
    const pk = PrivateKey.fromRandom();
    console.log(pk.toString());
    console.log(bufferToHexString(new Uint8Array(pk.number)));
  });
  const samplePrivKeyHexString = "ec4916dd28fc4c10d78e287ca5d9cc51ee1ae73cbfde08c6b37324cbfaac8bc5";

  it('splitPrivKey', async () => {
    expect(splitDecimal(samplePrivKeyHexString)).toStrictEqual([
      "314077308411032793321278816725012958289",
      "316495952764820137513325325447450102725"
    ]);
  });

  it("splitSha256OfPrivKey", () => {
    const splitted = privKeyToSha256HashSplitted(samplePrivKeyHexString);
    expect(splitted)
      .toStrictEqual([
        "67428615251739275197038733346106089224",
        "232995379825841761673536055030921300908"
      ]);
  });


  it("splitPubKey", async () => {
    const privKeyBuffer = hexStringToBuffer(samplePrivKeyHexString);

    const unCompressedPk = new PrivateKey(privKeyBuffer, false, false, true);
    const unCompressedPubKey = PublicKey.fromPrivateKey(unCompressedPk);
    expect(unCompressedPubKey.toString())
      .toBe("0494d6deea102c33307a5ae7e41515198f6fc19d3b11abeca5bff56f1011ed2d8e3d8f02cbd20e8c53d8050d681397775d0dc8b0ad406b261f9b4c94404201cab3");

    expect(privKeyToHexString(unCompressedPk)).toBe(samplePrivKeyHexString);
  });

  it("spec name", () => {
    const pk = new PrivateKey(hexToBuffer("ec4916dd28fc4c10d78e287ca5d9cc51ee1ae73cbfde08c6b37324cbfaac8bc5"), false, false, true);
    console.log(pk.toString());
  });
});
