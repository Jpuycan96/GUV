import { TestBed } from '@angular/core/testing';

import { PagoEventService } from './pago-event.service';

describe('PagoEventService', () => {
  let service: PagoEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PagoEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
