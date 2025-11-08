import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialesSectionComponent } from './materiales-section.component';

describe('MaterialesSectionComponent', () => {
  let component: MaterialesSectionComponent;
  let fixture: ComponentFixture<MaterialesSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialesSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
