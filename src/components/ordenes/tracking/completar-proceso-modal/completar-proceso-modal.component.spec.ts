import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletarProcesoModalComponent } from './completar-proceso-modal.component';

describe('CompletarProcesoModalComponent', () => {
  let component: CompletarProcesoModalComponent;
  let fixture: ComponentFixture<CompletarProcesoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletarProcesoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletarProcesoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
