import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaListComponent } from './caja-list.component';

describe('CajaListComponent', () => {
  let component: CajaListComponent;
  let fixture: ComponentFixture<CajaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
