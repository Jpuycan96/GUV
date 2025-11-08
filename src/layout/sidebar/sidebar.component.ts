import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService, User } from '../../services/AuthService';
import { PermisosService } from '../../services/permisos/permisos.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  color?: string;
  children?: MenuItem[];
  requierePermiso?: { modulo: string; accion: string };
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatExpansionModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() collapsed = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  public permisos = inject(PermisosService);

  user: User | null = null;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/servicios-cotizaciones/servicios',
      color: 'primary',
      requierePermiso: { modulo: 'servicios', accion: 'ver' }
    },
    {
      label: 'Servicios',
      icon: 'settings',
      route: '/servicios-cotizaciones/servicios',
      requierePermiso: { modulo: 'servicios', accion: 'ver' }
    },
    {
      label: 'Clientes',
      icon: 'people',
      route: '/clientes',
      requierePermiso: { modulo: 'clientes', accion: 'ver' }
    },
    {
      label: 'Usuarios',
      icon: 'person',
      route: '/usuarios',
      requierePermiso: { modulo: 'usuarios', accion: 'ver' }
    },
    {
      label: 'Órdenes',
      icon: 'receipt_long',
      requierePermiso: { modulo: 'ordenes', accion: 'ver' },
      children: [
        {
          label: 'Lista de Órdenes',
          icon: 'list',
          route: '/ordenes/lista',
          requierePermiso: { modulo: 'ordenes', accion: 'ver' }
        },
        {
          label: 'Nueva Orden',
          icon: 'add_circle',
          route: '/ordenes/crear',
          requierePermiso: { modulo: 'ordenes', accion: 'crear' }
        },
        {
          label: 'Turnos',
          icon: 'schedule',
          route: '/ordenes/turnos',
          requierePermiso: { modulo: 'turnos', accion: 'ver' }
        },
        {
          label: 'Cajas Diarias',
          icon: 'account_balance_wallet',
          route: '/ordenes/cajas',
          requierePermiso: { modulo: 'cajas', accion: 'ver' }
        }
      ]
    }
  ];

  constructor() {
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      // 🔍 DEBUG: Ver roles del usuario
      console.log('👤 Usuario actual:', u?.username);
      console.log('🎭 Roles:', u?.roles);
      console.log('✅ Puede ver órdenes?', this.permisos.tiene('ordenes', 'ver'));
    });
  }

  // Verificar si un item debe mostrarse
  mostrarItem(item: MenuItem): boolean {
    // Si no requiere permisos, siempre se muestra
    if (!item.requierePermiso) {
      return true;
    }

    // Verificar permiso
    return this.permisos.tiene(
      item.requierePermiso.modulo as any,
      item.requierePermiso.accion as any
    );
  }

  logout(): void {
    this.authService.logout();
  }
}