import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecioEscalaModalComponent } from './precio-escala-modal.component';

describe('PrecioEscalaModalComponent', () => {
  let component: PrecioEscalaModalComponent;
  let fixture: ComponentFixture<PrecioEscalaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrecioEscalaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrecioEscalaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
