import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioProcesosConfigComponent } from './servicio-procesos-config.component';

describe('ServicioProcesosConfigComponent', () => {
  let component: ServicioProcesosConfigComponent;
  let fixture: ComponentFixture<ServicioProcesosConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioProcesosConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicioProcesosConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
