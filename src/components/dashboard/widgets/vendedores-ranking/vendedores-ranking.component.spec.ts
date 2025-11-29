import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendedoresRankingComponent } from './vendedores-ranking.component';

describe('VendedoresRankingComponent', () => {
  let component: VendedoresRankingComponent;
  let fixture: ComponentFixture<VendedoresRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendedoresRankingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendedoresRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
