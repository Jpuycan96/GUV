import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioAdminListComponent } from './servicio-admin-list.component';

describe('ServicioAdminListComponent', () => {
  let component: ServicioAdminListComponent;
  let fixture: ComponentFixture<ServicioAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioAdminListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicioAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
