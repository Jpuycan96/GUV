import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosRankingComponent } from './servicios-ranking.component';

describe('ServiciosRankingComponent', () => {
  let component: ServiciosRankingComponent;
  let fixture: ComponentFixture<ServiciosRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosRankingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiciosRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
