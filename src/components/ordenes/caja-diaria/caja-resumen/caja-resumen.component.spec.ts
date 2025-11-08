import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaResumenComponent } from './caja-resumen.component';

describe('CajaResumenComponent', () => {
  let component: CajaResumenComponent;
  let fixture: ComponentFixture<CajaResumenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaResumenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaResumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
