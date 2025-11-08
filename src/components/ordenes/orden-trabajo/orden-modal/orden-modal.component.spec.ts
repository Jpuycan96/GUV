import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenModalComponent } from './orden-modal.component';

describe('OrdenModalComponent', () => {
  let component: OrdenModalComponent;
  let fixture: ComponentFixture<OrdenModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
