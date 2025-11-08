import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { CajaDiariaService, CajaDiariaDTO } from '../../../../services/ordenes/caja-diaria/caja-diaria.service';
import { PermisosService } from '../../../../services/permisos/permisos.service';
import { AuthService } from '../../../../services/AuthService';

// Modales
import { CajaAbrirModalComponent } from '../caja-abrir-modal/caja-abrir-modal.component';
import { CajaCerrarModalComponent } from '../caja-cerrar-modal/caja-cerrar-modal.component';

@Component({
  selector: 'app-caja-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './caja-list.component.html',
  styleUrl: './caja-list.component.css'
})
export class CajaListComponent implements OnInit {
  
  cajas: CajaDiariaDTO[] = [];
  cajaActiva?: CajaDiariaDTO;
  
  // Filtros
  filtroFechaDesde: Date | null = null;
  filtroFechaHasta: Date | null = null;
  filtroEstado: string = 'TODAS';
  
  // ✅ Control de filtros colapsables
  filtrosExpandidos = false;
  
  // Loading
  cargando = false;
  error = '';
  
  // Control de roles
  esAdministrador = false;
  esCajero = false;
  
  // Columnas tabla
  displayedColumns = [
    'nombreTurno',
    'fecha',
    'nombreCajero',
    'fApertura',
    'fCierre',
    'totalOrdenes',
    'ventaNeta',
    'totalEfectivo',
    'totalDigital',
    'totalPendiente',
    'estado',
    'acciones'
  ];

  // Estadísticas
  stats = {
    cajasAbiertas: 0,
    totalVentas: 0,
    totalEfectivo: 0,
    totalDigital: 0,
    totalPendiente: 0
  };

  constructor(
    private cajaService: CajaDiariaService,
    private router: Router,
    public permisos: PermisosService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('🚀 CajaListComponent inicializado');
    
    this.verificarRoles();
    
    if (this.esAdministrador || this.esCajero) {
      this.verificarCajaActiva();
    }
    
    this.cargarCajas();
  }

  // ========== VERIFICAR ROLES ==========
  verificarRoles(): void {
    const user = this.authService.getCurrentUser();
    
    if (user && user.roles) {
      this.esAdministrador = user.roles.includes('ROLE_ADMINISTRADOR');
      this.esCajero = user.roles.includes('ROLE_CAJERO');
      
      console.log('👤 Roles detectados:', {
        esAdministrador: this.esAdministrador,
        esCajero: this.esCajero
      });
    }
  }

  // ========== PERMISOS ==========
  puedeAbrirCaja(): boolean {
    return this.permisos.tiene('cajas', 'crear') && !this.cajaActiva;
  }

  puedeCerrarCaja(): boolean {
    return this.permisos.tiene('cajas', 'editar');
  }

  // ========== TOGGLE FILTROS ==========
  toggleFiltros(): void {
    this.filtrosExpandidos = !this.filtrosExpandidos;
  }

  // ========== CARGAR CAJAS ==========
  cargarCajas(): void {
    this.cargando = true;
    this.error = '';

    const filtros: any = {};
    
    if (this.filtroFechaDesde) {
      filtros.fechaDesde = this.formatearFecha(this.filtroFechaDesde);
    }
    
    if (this.filtroFechaHasta) {
      filtros.fechaHasta = this.formatearFecha(this.filtroFechaHasta);
    }
    
    if (this.filtroEstado !== 'TODAS') {
      filtros.estado = this.filtroEstado;
    }

    this.cajaService.obtenerTodas(filtros).subscribe({
      next: (data) => {
        console.log('✅ Cajas cargadas:', data);
        
        // ✅ Si es cajero, mostrar solo su caja activa
        if (this.esCajero && !this.esAdministrador) {
          this.cajas = data.filter(c => c.estado === 'ABIERTA');
        } else {
          this.cajas = data;
        }
        
        this.calcularEstadisticas();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar cajas:', err);
        this.error = 'Error al cargar las cajas diarias';
        this.cargando = false;
      }
    });
  }

  // ========== VERIFICAR CAJA ACTIVA ==========
  verificarCajaActiva(): void {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario?.idUsuario) {
      console.log('⚠️ No se pudo obtener usuario actual');
      return;
    }
    
    console.log('🔍 Verificando caja activa para usuario:', usuario.idUsuario);
    
    this.cajaService.obtenerCajaActiva(usuario.idUsuario).subscribe({
      next: (caja) => {
        console.log('✅ Caja activa encontrada:', caja);
        this.cajaActiva = caja;
      },
      error: (err) => {
        if (err.status === 204) {
          console.log('ℹ️ No hay caja activa - puede abrir una nueva');
          this.cajaActiva = undefined;
        } else {
          console.log('ℹ️ No hay caja activa o error:', err.status);
          this.cajaActiva = undefined;
        }
      }
    });
  }

  // ========== CALCULAR ESTADÍSTICAS ==========
  calcularEstadisticas(): void {
    this.stats.cajasAbiertas = this.cajas.filter(c => c.estado === 'ABIERTA').length;
    this.stats.totalVentas = this.cajas.reduce((sum, c) => sum + (c.ventaNeta || 0), 0);
    this.stats.totalEfectivo = this.cajas.reduce((sum, c) => sum + (c.totalEfectivo || 0), 0);
    
    this.stats.totalDigital = this.cajas.reduce((sum, c) => 
      sum + (c.totalYape || 0) + (c.totalPlin || 0) + (c.totalTransferencia || 0), 0
    );
    
    this.stats.totalPendiente = this.cajas.reduce((sum, c) => sum + (c.totalPendiente || 0), 0);
  }

  // ========== ABRIR MODAL APERTURA ==========
  abrirModalApertura(): void {
    const dialogRef = this.dialog.open(CajaAbrirModalComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((caja: CajaDiariaDTO | null) => {
      if (caja) {
        console.log('✅ Caja abierta:', caja);
        this.mostrarMensaje('Caja abierta exitosamente', 'success');
        this.cargarCajas();
        this.verificarCajaActiva();
      }
    });
  }

  // ========== ABRIR MODAL CIERRE ==========
  abrirModalCierre(caja: CajaDiariaDTO): void {
    const dialogRef = this.dialog.open(CajaCerrarModalComponent, {
      width: '600px',
      disableClose: true,
      data: { caja }
    });

    dialogRef.afterClosed().subscribe((cajaCerrada: CajaDiariaDTO | null) => {
      if (cajaCerrada) {
        console.log('✅ Caja cerrada:', cajaCerrada);
        this.mostrarMensaje('Caja cerrada exitosamente', 'success');
        this.cargarCajas();
        this.verificarCajaActiva();
      }
    });
  }

  // ========== VER DETALLE ==========
  verDetalle(idCaja: number | undefined): void {
    if (idCaja) {
      this.router.navigate(['/ordenes/cajas/resumen', idCaja]);
    }
  }

  // ========== RECALCULAR TOTALES ==========
  recalcularTotales(caja: CajaDiariaDTO): void {
    if (!caja.idCaja) return;
    
    if (!confirm('¿Estás seguro de recalcular los totales de esta caja?')) {
      return;
    }

    this.cajaService.recalcularTotales(caja.idCaja).subscribe({
      next: () => {
        this.mostrarMensaje('Totales recalculados correctamente', 'success');
        this.cargarCajas();
      },
      error: (err) => {
        console.error('Error al recalcular:', err);
        this.mostrarMensaje('Error al recalcular los totales', 'error');
      }
    });
  }

  // ========== APLICAR/LIMPIAR FILTROS ==========
  aplicarFiltros(): void {
    this.cargarCajas();
  }

  limpiarFiltros(): void {
    this.filtroFechaDesde = null;
    this.filtroFechaHasta = null;
    this.filtroEstado = 'TODAS';
    this.cargarCajas();
  }

  // ========== HELPERS ==========
  getEstadoClass(estado: string): string {
    return estado === 'ABIERTA' ? 'estado-abierta' : 'estado-cerrada';
  }

  getDiferenciaClass(diferencia: number | undefined): string {
    if (!diferencia) return '';
    return diferencia > 0 ? 'diferencia-positiva' : 
           diferencia < 0 ? 'diferencia-negativa' : '';
  }

  getTotalDigital(caja: CajaDiariaDTO): number {
    return (caja.totalYape || 0) + (caja.totalPlin || 0) + (caja.totalTransferencia || 0);
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: tipo === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
    // ========== CALCULAR TOTALES PARA CARDS ==========
  getTotalCobrado(caja: CajaDiariaDTO): number {
    return (caja.totalEfectivo || 0) + this.getTotalDigital(caja);
  }

  recargar(): void {
    this.cargarCajas();
    
    if (this.esAdministrador || this.esCajero) {
      this.verificarCajaActiva();
    }
  }
}