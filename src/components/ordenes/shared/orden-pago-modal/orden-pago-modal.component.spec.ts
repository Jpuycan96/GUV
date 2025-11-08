import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenPagoModalComponent } from './orden-pago-modal.component';

describe('OrdenPagoModalComponent', () => {
  let component: OrdenPagoModalComponent;
  let fixture: ComponentFixture<OrdenPagoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenPagoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenPagoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
