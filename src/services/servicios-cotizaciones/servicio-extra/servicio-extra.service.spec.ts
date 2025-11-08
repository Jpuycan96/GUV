import { TestBed } from '@angular/core/testing';

import { ServicioExtraService } from './servicio-extra.service';

describe('ServicioExtraService', () => {
  let service: ServicioExtraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioExtraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
