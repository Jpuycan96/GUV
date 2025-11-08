import { TestBed } from '@angular/core/testing';

import { OrdenTrabajoService } from './orden-trabajo.service';

describe('OrdenTrabajoService', () => {
  let service: OrdenTrabajoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdenTrabajoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
