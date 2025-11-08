// components/login/login/login.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../../services/AuthService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  loading = false;
  error = '';
  returnUrl = '';

  constructor() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Cambiado: siempre navegar a /home después del login, a menos que haya un returnUrl específico
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const credentials: LoginRequest = {
      username: this.f['username'].value,
      password: this.f['password'].value
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        // Navegación explícita a /home
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.error = this.getErrorMessage(error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Usuario o contraseña incorrectos';
    } else if (error.status === 0) {
      return 'Error de conexión. Verifique que el servidor esté funcionando.';
    } else {
      return error.error?.message || 'Error inesperado. Intente nuevamente.';
    }
  }
}

