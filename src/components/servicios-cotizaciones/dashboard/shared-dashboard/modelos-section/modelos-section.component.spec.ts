import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelosSectionComponent } from './modelos-section.component';

describe('ModelosSectionComponent', () => {
  let component: ModelosSectionComponent;
  let fixture: ComponentFixture<ModelosSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelosSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelosSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
