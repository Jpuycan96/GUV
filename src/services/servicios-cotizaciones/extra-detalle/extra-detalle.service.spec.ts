import { TestBed } from '@angular/core/testing';

import { ExtraDetalleService } from './extra-detalle.service';

describe('ExtraDetalleService', () => {
  let service: ExtraDetalleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtraDetalleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
