import { TestBed } from '@angular/core/testing';

import { PrecioEscalaService } from './precio-escala.service';

describe('PrecioEscalaService', () => {
  let service: PrecioEscalaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrecioEscalaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
