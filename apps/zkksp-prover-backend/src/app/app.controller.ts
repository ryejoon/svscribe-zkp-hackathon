import {Controller, Get, Query} from '@nestjs/common';
import { exec } from 'child_process';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(
    @Query() query: any
  ) {
    const params: string = query.test;

    exec(`/app/zokrates compute-witness -a ${params}`,  (error, stdout, stderr) => {
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
      exec(`/app/zokrates generate-key-proof --output proof.json`,  (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      })
    });

    return this.appService.getData();
  }

}
