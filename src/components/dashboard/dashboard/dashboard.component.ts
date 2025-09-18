// components/dashboard/dashboard.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/AuthService';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <button class="logout-btn" (click)="logout()">Cerrar Sesión</button>
      </div>
      
      <div class="welcome-card" *ngIf="currentUser">
        <h2>¡Bienvenido, {{ currentUser.username }}!</h2>
        <p>Estás autenticado correctamente.</p>
        
        <div class="user-info">
          <h3>Información del usuario:</h3>
          <p><strong>Usuario:</strong> {{ currentUser.username }}</p>
          <p><strong>Roles:</strong> 
            <span *ngFor="let role of currentUser.roles; let last = last">
              {{ role }}<span *ngIf="!last">, </span>
            </span>
          </p>
          <p><strong>Estado:</strong> 
            <span class="status-badge">{{ currentUser.isAuthenticated ? 'Autenticado' : 'No autenticado' }}</span>
          </p>
        </div>
      </div>
      
      <div class="actions">
        <button class="btn btn-primary" (click)="testProtectedEndpoint()">
          Probar Endpoint Protegido
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .dashboard-header h1 {
      color: #333;
      margin: 0;
    }
    
    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    }
    
    .logout-btn:hover {
      background: #c82333;
    }
    
    .welcome-card {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    
    .user-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .status-badge {
      background: #28a745;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-primary:hover {
      background: #0056b3;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser: User | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  testProtectedEndpoint(): void {
    // Aquí puedes hacer una petición a tu endpoint protegido
    alert('Funcionalidad por implementar: llamada a endpoint protegido');
  }
}