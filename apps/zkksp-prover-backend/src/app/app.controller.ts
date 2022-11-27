import {Controller, Get, Query} from '@nestjs/common';
import { exec } from 'child_process';
import { AppService } from './app.service';
import {environment} from "../environments/environment";

const execOptions = Object.freeze({
  cwd: environment.zokratesDir
});

@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService
  ) {}

  @Get("generateProof")
  async generateProof(
    @Query() query: any
  ) {
    const keyParts: string = query.keyParts;
    const hashParts: string = query.hashParts;

    const res = await new Promise((resolve, reject) => {
      exec(`${environment.zokratesCmdPath} compute-witness -a ${keyParts} ${hashParts}`, execOptions, (error, stdout, stderr) => {
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
        exec(`${environment.zokratesCmdPath} generate-key-proof --output proof.json`, execOptions, (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
          }
          resolve(stdout);
          console.log(`stdout: ${stdout}`);
        })
      });
    });

    return res;
  }

}
