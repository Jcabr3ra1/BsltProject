import { TestBed } from '@angular/core/testing';

import { BolsillosService } from './bolsillos.service';

describe('BolsillosService', () => {
  let service: BolsillosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BolsillosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
