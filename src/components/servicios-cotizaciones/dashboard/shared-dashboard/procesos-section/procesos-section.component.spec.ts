import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcesosSectionComponent } from './procesos-section.component';

describe('ProcesosSectionComponent', () => {
  let component: ProcesosSectionComponent;
  let fixture: ComponentFixture<ProcesosSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcesosSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcesosSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
