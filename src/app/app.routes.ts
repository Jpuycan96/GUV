import { Routes } from '@angular/router';
import { LoginComponent } from '../components/login/login/login.component';
import { authGuard } from '../guards/auth.guards';

export const routes: Routes = [
    { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
    },
    { 
        path: 'login', 
        loadComponent: () => import('../components/login/login/login.component').then(m => m.LoginComponent)
    },
    { 
        path: 'dashboard', 
        loadComponent: () => import('../components/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    { 
        path: '**', 
        redirectTo: '/login' 
    }
];
