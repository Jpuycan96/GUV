import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecioMaterialAreaModalComponent } from './precio-material-area-modal.component';

describe('PrecioMaterialAreaModalComponent', () => {
  let component: PrecioMaterialAreaModalComponent;
  let fixture: ComponentFixture<PrecioMaterialAreaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrecioMaterialAreaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrecioMaterialAreaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
