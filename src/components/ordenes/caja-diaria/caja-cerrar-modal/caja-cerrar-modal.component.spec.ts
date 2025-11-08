import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaCerrarModalComponent } from './caja-cerrar-modal.component';

describe('CajaCerrarModalComponent', () => {
  let component: CajaCerrarModalComponent;
  let fixture: ComponentFixture<CajaCerrarModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaCerrarModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaCerrarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
