import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaAbrirModalComponent } from './caja-abrir-modal.component';

describe('CajaAbrirModalComponent', () => {
  let component: CajaAbrirModalComponent;
  let fixture: ComponentFixture<CajaAbrirModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaAbrirModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaAbrirModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
