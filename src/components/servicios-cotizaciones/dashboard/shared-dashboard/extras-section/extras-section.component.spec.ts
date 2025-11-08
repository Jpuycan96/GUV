import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtrasSectionComponent } from './extras-section.component';

describe('ExtrasSectionComponent', () => {
  let component: ExtrasSectionComponent;
  let fixture: ComponentFixture<ExtrasSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtrasSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtrasSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
