import { TestBed } from '@angular/core/testing';

import { CajaDiariaService } from './caja-diaria.service';

describe('CajaDiariaService', () => {
  let service: CajaDiariaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CajaDiariaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
