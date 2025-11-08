import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioRolesComponent } from './usuario-roles.component';

describe('UsuarioRolesComponent', () => {
  let component: UsuarioRolesComponent;
  let fixture: ComponentFixture<UsuarioRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioRolesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
