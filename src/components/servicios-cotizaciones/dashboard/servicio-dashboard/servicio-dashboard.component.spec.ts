import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioDashboardComponent } from './servicio-dashboard.component';

describe('ServicioDashboardComponent', () => {
  let component: ServicioDashboardComponent;
  let fixture: ComponentFixture<ServicioDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicioDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
