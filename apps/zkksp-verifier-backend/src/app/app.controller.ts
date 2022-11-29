import {Body, Controller, Get, Headers, Post, Query} from '@nestjs/common';
import {exec} from "child_process";
import * as fs from "fs";
import {environment} from '../environments/environment';
import {BlockchainService} from "./blockchain/blockchain.service";
import {DbService, generateRandomAlphanumeric} from "./db/db.service";
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
    const publicKey = payload.publicKey;
    fs.writeFileSync(`${environment.zokratesDir}/${publicKey}.json`, JSON.stringify(payload.proof));

    const stdOut = await new Promise((resolve, reject) => {
      let stdOutTemp: string;
      const command = `${environment.zokratesCmdPath} verify-key-proof -p ${publicKey} -j ${publicKey}.json`;
      console.log(`running command: ${command}`)
      const process = exec(command, execOptions, (error, stdout, stderr) => {
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

    if (stdOut) {
      const token = generateRandomAlphanumeric(30);
      await this.db.insertToken({
        token: token,
        publicKey
      });
      return {
        token,
        stdOut
      }
    }
    return {
      stdOut
    };
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
      throw new Error(`Invalid Token ${token}`);
    }

    const pr = await this.db.queryPaymentPeriods(tokenItem.publicKey);
    const start = Date.now();
    const now = start;

    const targetPeriod = pr?.find(p => p.start < now && now < p.end);
    if (targetPeriod) {
      // auth succeed
      return {
        authorized: true,
        start: targetPeriod.start,
        end: targetPeriod.end
      };
    }
    const appId = query['appId'];
    const app = await this.db.queryApp(appId);

    // lookup blockchain
    const payerAddress = PublicKey.from(tokenItem.publicKey).toAddress().toString();
    const txRaw = await this.blockchainService.fetchTxsAndFilterFirst(app.paymentAddress, payerAddress, false);
    if (!txRaw) {
      return {
        authorized: false,
        reason: `no payment from ${payerAddress} to ${app.paymentAddress} found`
      };
    }
    const tx = Transaction.fromHex(txRaw);
    const paymentOutput = tx.outputs.find(o => {
      if (o.script['toAddress']) {
        return app.paymentAddress === (o.script as P2PKHLockScript).toAddress().toString();
      }
      return false;
    })
    // todo: need to bypass if already consumed period
    if (paymentOutput.satoshis >= app.priceSatoshis) {
      // valid
      console.log(`Starting period for app ${app.appId} with payment ${tx.hash}`);
      const end = start + (app.durationSeconds * 1000);
      await this.db.insertPayment({
        appId: app.appId,
        start: start,
        end,
        txid: tx.hash,
        publicKey: tokenItem.publicKey
      });
      return {
        authorized: true,
        start,
        end
      };
    }
    const msg = `Payment not enough: ${paymentOutput.satoshis}`;
    console.log(msg);
    return {
      authorized: false,
      message: msg
    };
  }
}
