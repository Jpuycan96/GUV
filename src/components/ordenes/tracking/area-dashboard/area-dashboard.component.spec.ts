import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaDashboardComponent } from './area-dashboard.component';

describe('AreaDashboardComponent', () => {
  let component: AreaDashboardComponent;
  let fixture: ComponentFixture<AreaDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
