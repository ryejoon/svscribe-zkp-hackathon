import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {exec} from 'child_process';
import {environment} from "../environments/environment";
import {ProofJson} from "@zkp-hackathon/common";
import * as fs from "fs";
import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";


const execOptions = Object.freeze({
  cwd: environment.zokratesDir
});

@Controller()
export class AppController {

  constructor(
    private readonly httpService: HttpService
  ) {}

  @Get("generateProof")
  async generateProof(
    @Query() query: any
  ) {
    const keyParts: string = query.keyParts;
    const hashParts: string = query.hashParts;
    const publicKey: string = query.publicKey;

    const res = await new Promise((resolve, reject) => {
      const command = `${environment.zokratesCmdPath} compute-witness -o prover/${publicKey}_witness -a ${keyParts} ${hashParts}`;
      console.log(command);
      exec(command, execOptions, (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          return;
        }
        if (stderr) {
          console.error(stderr);
          return;
        }
        console.log(`stdout: ${stdout}`);
      }).on("exit", () => {
        exec(`${environment.zokratesCmdPath} generate-key-proof -w prover/${publicKey}_witness --output prover/${publicKey}.json`, execOptions, (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          resolve(stdout);
        })
      });
    });

    return res;
  }

  @Post("registerProof")
  async registerProof(@Body() payload: { publicKey: string }) {
    const proofJson: ProofJson = JSON.parse(fs.readFileSync(`${environment.zokratesCmdPath}/prover/${payload.publicKey}.json`, { encoding: "utf8" }));
    console.log(`invoking verifier with proof for pubKey ${payload.publicKey}`);
    const res = await firstValueFrom(this.httpService.post(`${environment.zkpVerifierHost}/register`, {
      publicKey: payload.publicKey,
      proof: proofJson
    }, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }));

    console.log(res);
    return res.data;
  }

}
