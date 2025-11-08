import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenDetailComponent } from './orden-detail.component';

describe('OrdenDetailComponent', () => {
  let component: OrdenDetailComponent;
  let fixture: ComponentFixture<OrdenDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
