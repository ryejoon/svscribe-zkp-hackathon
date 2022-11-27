import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { DbService } from './db/db.service';
import { BlockchainService } from './blockchain/blockchain.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [DbService, BlockchainService],
})
export class AppModule {}
