import { TestBed } from '@angular/core/testing';

import { BolsilloService } from './bolsillo.service';

describe('BolsilloService', () => {
  let service: BolsilloService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BolsilloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
