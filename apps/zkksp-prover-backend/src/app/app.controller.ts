import {Controller, Get, Query} from '@nestjs/common';
import { exec } from 'child_process';
import { AppService } from './app.service';

@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService
  ) {}

  @Get("generateProof")
  async getData(
    @Query() query: any
  ) {
    const keyParts: string = query.keyParts;
    const hashParts: string = query.hashParts;

    const res = await new Promise((resolve, reject) => {
      exec(`/app/zokrates compute-witness -a ${keyParts} ${hashParts}`, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      }).on("exit", () => {
        exec(`/app/zokrates generate-key-proof --output proof.json`, (error, stdout, stderr) => {
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
    })

    return res;
  }

}
