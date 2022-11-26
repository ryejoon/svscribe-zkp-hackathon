import { TestBed } from '@angular/core/testing';

import { SensiletService } from './sensilet.service';

describe('SensiletService', () => {
  let service: SensiletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SensiletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
