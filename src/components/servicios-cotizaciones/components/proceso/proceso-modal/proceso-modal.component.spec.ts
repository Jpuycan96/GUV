import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcesoModalComponent } from './proceso-modal.component';

describe('ProcesoModalComponent', () => {
  let component: ProcesoModalComponent;
  let fixture: ComponentFixture<ProcesoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcesoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcesoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
