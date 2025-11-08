import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenDetalleItemComponent } from './orden-detalle-item.component';

describe('OrdenDetalleItemComponent', () => {
  let component: OrdenDetalleItemComponent;
  let fixture: ComponentFixture<OrdenDetalleItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenDetalleItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenDetalleItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
