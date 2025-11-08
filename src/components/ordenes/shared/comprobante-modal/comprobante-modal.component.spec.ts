import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprobanteModalComponent } from './comprobante-modal.component';

describe('ComprobanteModalComponent', () => {
  let component: ComprobanteModalComponent;
  let fixture: ComponentFixture<ComprobanteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComprobanteModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComprobanteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
