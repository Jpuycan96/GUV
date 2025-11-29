import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guards';
import { usuariosGuard } from '../guards/Usuarios.guard';
import { clientesGuard } from '../guards/Clientes.guards';
import { ordenesGuard } from '../guards/Ordenes.guards';
import { serviciosGuard } from '../guards/servicios.guards';
import { LayoutComponent } from '../layout/layout/layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('../components/login/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // ========== DASHBOARD ANALÍTICO ==========
      {
        path: 'dashboard',
        canActivate: [ordenesGuard],
        loadComponent: () =>
          import('../components/dashboard/analytics-dashboard/analytics-dashboard.component').then(
            (m) => m.AnalyticsDashboardComponent
          ),
      },

      // ========== CRUD DE CLIENTES ==========
      {
        path: 'clientes',
        canActivate: [clientesGuard],
        loadComponent: () =>
          import('../components/cliente/cliente-list/cliente-list.component').then(
            (m) => m.ClienteListComponent
          ),
      },
      {
        path: 'clientes/nuevo',
        canActivate: [clientesGuard],
        loadComponent: () =>
          import('../components/cliente/cliente-form/cliente-form.component').then(
            (m) => m.ClienteFormComponent
          ),
      },
      {
        path: 'clientes/editar/:id',
        canActivate: [clientesGuard],
        loadComponent: () =>
          import('../components/cliente/cliente-form/cliente-form.component').then(
            (m) => m.ClienteFormComponent
          ),
      },

      // ========== CRUD DE USUARIOS ==========
      {
        path: 'usuarios',
        canActivate: [usuariosGuard],
        loadComponent: () =>
          import('../components/usuario/usuario-list/usuario-list.component').then(
            (m) => m.UsuarioListComponent
          ),
      },
      {
        path: 'usuarios/nuevo',
        canActivate: [usuariosGuard],
        loadComponent: () =>
          import('../components/usuario/usuario-form/usuario-form.component').then(
            (m) => m.UsuarioFormComponent
          ),
      },
      {
        path: 'usuarios/:id/editar',
        canActivate: [usuariosGuard],
        loadComponent: () =>
          import('../components/usuario/usuario-form/usuario-form.component').then(
            (m) => m.UsuarioFormComponent
          ),
      },
      {
        path: 'usuarios/:id/roles',
        canActivate: [usuariosGuard],
        loadComponent: () =>
          import('../components/usuario/usuario-roles/usuario-roles.component').then(
            (m) => m.UsuarioRolesComponent
          ),
      },

      // ========== SERVICIOS Y COTIZACIONES ==========
      {
        path: 'servicios-cotizaciones',
        canActivate: [serviciosGuard],
        children: [
          {
            path: 'servicios',
            loadComponent: () =>
              import(
                '../components/servicios-cotizaciones/admin/servicio-admin-list/servicio-admin-list.component'
              ).then((m) => m.ServicioAdminListComponent),
          },
          {
            path: 'configuracion/servicio-procesos',
            loadComponent: () =>
              import(
                '../components/servicios-cotizaciones/admin/servicio-procesos-config/servicio-procesos-config.component'
              ).then((m) => m.ServicioProcesosConfigComponent),
          },
          {
            path: 'servicios/:id/dashboard',
            loadComponent: () =>
              import(
                '../components/servicios-cotizaciones/dashboard/servicio-dashboard/servicio-dashboard.component'
              ).then((m) => m.ServicioDashboardComponent),
          },
        ],
      },

      // ========== MÓDULO DE ÓRDENES ==========
      {
        path: 'ordenes',
        canActivate: [ordenesGuard],
        children: [
          {
            path: 'lista',
            loadComponent: () =>
              import('../components/ordenes/orden-trabajo/orden-list/orden-list.component').then(
                (m) => m.OrdenListComponent
              ),
          },
          {
            path: 'crear',
            loadComponent: () =>
              import('../components/ordenes/orden-trabajo/orden-form/orden-form.component').then(
                (m) => m.OrdenFormComponent
              ),
          },
          {
            path: 'detalle/:id',
            loadComponent: () =>
              import('../components/ordenes/orden-trabajo/orden-detail/orden-detail.component').then(
                (m) => m.OrdenDetailComponent
              ),
          },
          {
            path: 'turnos',
            loadComponent: () =>
              import('../components/ordenes/turnos/turno-list/turno-list.component').then(
                (m) => m.TurnoListComponent
              ),
          },
          {
            path: 'cajas',
            loadComponent: () =>
              import('../components/ordenes/caja-diaria/caja-list/caja-list.component').then(
                (m) => m.CajaListComponent
              ),
          },
          {
            path: 'cajas/resumen/:id',
            loadComponent: () =>
              import('../components/ordenes/caja-diaria/caja-resumen/caja-resumen.component').then(
                (m) => m.CajaResumenComponent
              ),
          },
        ],
      },

      // ========== TRACKING DE PRODUCCIÓN ==========
      {
        path: 'tracking',
        canActivate: [ordenesGuard],
        loadComponent: () =>
          import('../components/ordenes/tracking/tracking-dashboard/tracking-dashboard.component').then(
            (m) => m.TrackingDashboardComponent
          ),
      },
    ],
  },

  { path: '**', redirectTo: '/dashboard' },
];