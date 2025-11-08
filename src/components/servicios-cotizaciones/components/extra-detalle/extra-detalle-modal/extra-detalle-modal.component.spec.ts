import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraDetalleModalComponent } from './extra-detalle-modal.component';

describe('ExtraDetalleModalComponent', () => {
  let component: ExtraDetalleModalComponent;
  let fixture: ComponentFixture<ExtraDetalleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraDetalleModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraDetalleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
