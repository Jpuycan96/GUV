import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeloModalComponent } from './modelo-modal.component';

describe('ModeloModalComponent', () => {
  let component: ModeloModalComponent;
  let fixture: ComponentFixture<ModeloModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeloModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModeloModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
