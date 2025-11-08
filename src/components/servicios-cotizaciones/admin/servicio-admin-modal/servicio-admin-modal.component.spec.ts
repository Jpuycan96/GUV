import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioAdminModalComponent } from './servicio-admin-modal.component';

describe('ServicioAdminModalComponent', () => {
  let component: ServicioAdminModalComponent;
  let fixture: ComponentFixture<ServicioAdminModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioAdminModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicioAdminModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
