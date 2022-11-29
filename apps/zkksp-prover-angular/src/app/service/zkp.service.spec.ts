import { TestBed } from '@angular/core/testing';

import { ZkpService } from './zkp.service';

describe('ZkpService', () => {
  let service: ZkpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZkpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
