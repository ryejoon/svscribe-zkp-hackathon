import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';

describe('BlockchainService', () => {
  let service: BlockchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainService],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  it('should be defined', async () => {
    const usedUtxoMap = {};
    const txs = await service.fetchTxsAndFilterFirst("1FM8ei1kvA1TGfJQabRpFy8ZbAcAN1yrZm", "16E2tWHx6sXLhQqqnoE1uiyQBAL8E63jmK", usedUtxoMap, false);
    console.log(txs);
  });
});
