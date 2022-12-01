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
    const command = `${environment.zokratesCmdPath} compute-witness -a ${keyParts} ${hashParts}`;

    const proofFile = `prover/${publicKey}.json`;

    const res = await new Promise((resolve, reject) => {
      // currently -w option is not working in scrypt-zokrates and is only reading from 'witness' file
      console.log(command);
      exec(command, execOptions, (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          reject(error);
        }
        if (stderr) {
          reject(stderr);
        }
        console.log(`stdout: ${stdout}`);
      }).on("exit", (code, signal) => {
        console.log(code);
        console.log(signal);
        // currently -w option is not working in scrypt-zokrates and is only reading from 'witness' file
        exec(`${environment.zokratesCmdPath} generate-key-proof --output ${proofFile}`, execOptions, (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            reject(error);
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            reject(stderr);
          }
          console.log(`stdout: ${stdout}`);
          resolve(stdout);
        })
      });
    });

    return {
      command,
      proofFile,
      messages: res
    };
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
    return res.data;
  }

}
