import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioExtraModalComponent } from './servicio-extra-modal.component';

describe('ServicioExtraModalComponent', () => {
  let component: ServicioExtraModalComponent;
  let fixture: ComponentFixture<ServicioExtraModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioExtraModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicioExtraModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
