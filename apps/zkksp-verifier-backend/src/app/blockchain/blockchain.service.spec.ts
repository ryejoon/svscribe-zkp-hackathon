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
    const txs = await service.fetchTxsAndFilterFirst("16ZqP5Tb22KJuvSAbjNkoiZs13mmRmexZA", "14oUpJ3nxQtMbrBvELDz6qZbGBbWNqZec2", false);
    console.log(txs);
  });
});
