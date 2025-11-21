import { TestBed } from '@angular/core/testing';

import { OrdenProcesoService } from './orden-proceso.service';

describe('OrdenProcesoService', () => {
  let service: OrdenProcesoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdenProcesoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
