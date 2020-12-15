import { TestBed } from '@angular/core/testing';

import { BlindtestService } from './blindtest.service';

describe('BlindtestService', () => {
  let service: BlindtestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlindtestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
