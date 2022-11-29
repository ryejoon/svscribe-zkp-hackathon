import {Body, Controller, Get, Headers, Post, Query} from '@nestjs/common';
import {randomUUID} from 'crypto';
import {exec} from "child_process";
import * as fs from "fs";
import {environment} from '../environments/environment';
import {BlockchainService} from "./blockchain/blockchain.service";
import {DbService} from "./db/db.service";
import {P2PKHLockScript, PublicKey, Transaction} from "@runonbitcoin/nimble";

type RegisterPayload = {
  publicKey: string,
  proof: any
}

const execOptions = Object.freeze({
  cwd: environment.zokratesDir
});

@Controller()
export class AppController {

  constructor(
    public blockchainService: BlockchainService,
    private db: DbService
  ) {
  }

  @Post("register")
  async register(@Body() payload: RegisterPayload) {
    const uuid = randomUUID();
    fs.writeFileSync(`${environment.zokratesDir}/${uuid}.json`, JSON.stringify(payload.proof));

    const res = await new Promise((resolve, reject) => {
      let stdOutTemp: string;
      const process = exec(`${environment.zokratesCmdPath} verify-key-proof -p ${payload.publicKey} -j ${uuid}.json`, execOptions, (error, stdout, stderr) => {
        if (error) {
          console.log(stdout, error);
          return;
        }
        if (stderr) {
          console.log(stdout, stderr);
          return;
        }
        stdOutTemp = stdout;
        console.log(`stdout: ${stdout}`);
      }).on('exit', () => {
        setTimeout(() => {
          if (stdOutTemp.includes("does not hash to ")) {
            resolve(false);
          } else if (stdOutTemp.includes("hashes to ")) {
            resolve(true);
          } else {
            resolve(false);
          }
        }, 1000);
      })
    })

    return res;
  }

  @Get("apps")
  async getApps() {
    return this.db.scanApps();
  }

  @Get("authorize")
  async authorize(@Headers() headers, @Query() query) {
    const authHeader: string = headers['authorization'];
    const token = authHeader.split(' ')[1];
    const tokenItem = await this.db.queryTokenItem(token);
    if (!tokenItem) {
      throw new Error("Invalid Token");
    }

    const pr = await this.db.queryPaymentPeriods(tokenItem.publicKey);
    const now = Date.now();

    if (pr?.length && pr.find(p => p.start < now && now < p.end)) {
      // auth succeed
      return true;
    }
    const appId = query['appId'];
    const app = await this.db.queryApp(appId);

    // lookup blockchain
    const payerAddress = PublicKey.from(tokenItem.publicKey).toAddress().toString();
    const txRaw = await this.blockchainService.fetchTxsAndFilterFirst(app.paymentAddress, payerAddress, false);
    if (!txRaw) {
      return false;
    }
    const tx = Transaction.fromHex(txRaw);
    const paymentOutput = tx.outputs.find(o => {
      if (o.script['toAddress']) {
        return app.paymentAddress === (o.script as P2PKHLockScript).toAddress().toString();
      }
      return false;
    })
    if (paymentOutput.satoshis >= app.priceSatoshis) {
      // valid
      console.log(`Starting period for app ${app.appId} with payment ${tx.hash}`);
      await this.db.insertPayment({
        appId: app.appId,
        start: Date.now(),
        end: Date.now() + (app.durationSeconds * 1000),
        txid: tx.hash,
        publicKey: tokenItem.publicKey
      });
      return true;
    }
    console.log(`Payment not enough: ${paymentOutput.satoshis}`);
    return false;
  }
}
