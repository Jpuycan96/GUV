import { TestBed } from '@angular/core/testing';

import { PrecioMaterialAreaService } from './precio-material-area.service';

describe('PrecioMaterialAreaService', () => {
  let service: PrecioMaterialAreaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrecioMaterialAreaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
