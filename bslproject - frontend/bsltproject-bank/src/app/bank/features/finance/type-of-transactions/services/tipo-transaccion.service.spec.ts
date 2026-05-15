import { TestBed } from '@angular/core/testing';

import { TipoTransaccionService } from './tipo-transaccion.service';

describe('TipoTransaccionService', () => {
  let service: TipoTransaccionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoTransaccionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
