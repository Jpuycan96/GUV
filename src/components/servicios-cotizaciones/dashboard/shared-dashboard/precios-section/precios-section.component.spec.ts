import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreciosSectionComponent } from './precios-section.component';

describe('PreciosSectionComponent', () => {
  let component: PreciosSectionComponent;
  let fixture: ComponentFixture<PreciosSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreciosSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreciosSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
