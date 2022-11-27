import {Test, TestingModule} from '@nestjs/testing';

import {AppController} from './app.controller';
import * as fs from 'fs';
import {BlockchainService} from "./blockchain/blockchain.service";
import {DbService} from "./db/db.service";
import {PrivateKey} from "@runonbitcoin/nimble";


jest.setTimeout(300000);

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [BlockchainService, DbService],
    }).compile();
  });

  type ProofJson = {
    proof: any[];
    inputs: [string, string]
  }

  describe('verify', () => {
    it('should return true for valid proof', async () => {
      const appController = app.get<AppController>(AppController);
      const proofJson: ProofJson = JSON.parse(fs.readFileSync('../../sample/1/proof.json', { encoding: "utf8" }));

      expect(await appController.register({
        publicKey: "0494d6deea102c33307a5ae7e41515198f6fc19d3b11abeca5bff56f1011ed2d8e3d8f02cbd20e8c53d8050d681397775d0dc8b0ad406b261f9b4c94404201cab3",
        proof: proofJson
      })).toBe(true);
    });

    it('should return false for invalid proof', async () => {
      const appController = app.get<AppController>(AppController);
      const proofJson: ProofJson = JSON.parse(fs.readFileSync('../../sample/1/proof.json', { encoding: "utf8" }));

      expect(await appController.register({
        publicKey: "9494d6deea102c33307a5ae7e41515198f6fc19d3b11abeca5bff56f1011ed2d8e3d8f02cbd20e8c53d8050d681397775d0dc8b0ad406b261f9b4c94404201cab3",
        proof: proofJson
      })).toBe(false);
    });
  });

  describe('authorize', () => {
    let appId: string;
    let token: string;

    const appWalletPk = "Kxw1L6m98UmsBADbJzNgXUVQ3z2UnUUQjWe9mzsz26fSV17KSLMb";
    const subscriberPk = "L28gxsx2CpqaesYj8upwr7VAxtmttQ2jdiKNUKPBW7r4VsZ61nDV";

    beforeEach(async () => {
      const db = app.get<DbService>(DbService);
      const result = await db.insertApp({
        name: "testApp'",
        description: "testDesc",
        durationSeconds: 60,
        priceSatoshis: 600,
        privateKey: appWalletPk,
        paymentAddress: PrivateKey.from(appWalletPk).toAddress().toString()
      });

      token = "testToken";
      const publicKey = PrivateKey.from(subscriberPk).toPublicKey().toString();
      await db.insertToken({
        publicKey, token
      });
      appId = result.appId;
    })

    it("should fail for unpaid auth request", async () => {
      const appController = app.get<AppController>(AppController);
      const res = await appController.authorize({
        authorization: `Bearer ${token}`
      }, { appId })

      expect(res).toBe(false);
    });

    it('spec name', async () => {
      const db = app.get<DbService>(DbService);
      console.log(await db.scanApps());

      // const blockchainService = app.get<BlockchainService>(BlockchainService);
      // jest.spyOn(blockchainService, 'findAll').mockImplementation(() => result);
    });

  });
});
