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
    const txs = await service.fetchTxsAndFilterFirst("16E2tWHx6sXLhQqqnoE1uiyQBAL8E63jmK", "1FM8ei1kvA1TGfJQabRpFy8ZbAcAN1yrZm", false);
    console.log(txs);
  });
});
