import { TestBed } from '@angular/core/testing';

import { ServicioProcesoService } from './servicio-proceso.service';

describe('ServicioProcesoService', () => {
  let service: ServicioProcesoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioProcesoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
