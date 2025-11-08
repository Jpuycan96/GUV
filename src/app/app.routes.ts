import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guards';
import { usuariosGuard } from '../guards/Usuarios.guard';
import { clientesGuard } from '../guards/Clientes.guards';
import { ordenesGuard } from '../guards/Ordenes.guards';
import { serviciosGuard } from '../guards/servicios.guards';
import { LayoutComponent } from '../layout/layout/layout.component';

export const routes: Routes = [
  // 🔹 Redirección raíz → login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // 🔹 Login (página pública)
  {
    path: 'login',
    loadComponent: () =>
      import('../components/login/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  // 🔹 Rutas protegidas con Layout y AuthGuard
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // 🚀 Redirección por defecto (tras login) → órdenes para no-admin, servicios para admin
      { path: '', redirectTo: 'ordenes/lista', pathMatch: 'full' },

      // 🔸 CRUD de Clientes (protegido con clientesGuard)
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

      // 🔸 CRUD de Usuarios (protegido con usuariosGuard)
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

      // 🔸 SERVICIOS Y COTIZACIONES (solo ADMINISTRADOR)
      {
        path: 'servicios-cotizaciones',
        canActivate: [serviciosGuard],
        children: [
          // 📌 SERVICIOS
          // Lista de servicios (vista principal tras login)
          {
            path: 'servicios',
            loadComponent: () =>
              import(
                '../components/servicios-cotizaciones/admin/servicio-admin-list/servicio-admin-list.component'
              ).then((m) => m.ServicioAdminListComponent),
          },

          // Dashboard del servicio (vista principal de configuración)
          {
            path: 'servicios/:id/dashboard',
            loadComponent: () =>
              import(
                '../components/servicios-cotizaciones/dashboard/servicio-dashboard/servicio-dashboard.component'
              ).then((m) => m.ServicioDashboardComponent),
          },
        ],
      },

      // 🔸 MÓDULO DE ÓRDENES (accesible para ADMINISTRADOR, VENDEDOR, PRODUCCION, DISEÑADOR)
      {
        path: 'ordenes',
        canActivate: [ordenesGuard],
        children: [
          // 📌 ÓRDENES DE TRABAJO
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

          // 📌 TURNOS
          {
            path: 'turnos',
            loadComponent: () =>
              import('../components/ordenes/turnos/turno-list/turno-list.component').then(
                (m) => m.TurnoListComponent
              ),
          },

          // 📌 CAJAS DIARIAS
          {
            path: 'cajas',
            loadComponent: () =>
              import('../components/ordenes/caja-diaria/caja-list/caja-list.component').then(
                (m) => m.CajaListComponent
              ),
          },
          // ✅ NUEVO: Ruta de resumen/detalle de caja
          {
            path: 'cajas/resumen/:id',
            loadComponent: () =>
              import('../components/ordenes/caja-diaria/caja-resumen/caja-resumen.component').then(
                (m) => m.CajaResumenComponent
              ),
          },
        ],
      },
    ],
  },

  // 🔹 Cualquier ruta no encontrada → redirigir a órdenes
  { path: '**', redirectTo: '/ordenes/lista' },
];