import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { OrdenTrabajoService, OrdenTrabajoDTO } from '../../../../services/ordenes/orden-trabajo/orden-trabajo.service';
import { PermisosService } from '../../../../services/permisos/permisos.service';

@Component({
  selector: 'app-orden-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ],
  templateUrl: './orden-list.component.html',
  styleUrl: './orden-list.component.css'
})
export class OrdenListComponent implements OnInit {
  // lista de órdenes
  ordenes: OrdenTrabajoDTO[] = [];
  ordenesFiltradas: OrdenTrabajoDTO[] = [];
  
  // columnas de la tabla
  displayedColumns: string[] = [
    'numeroOrden',
    'cliente',
    'vendedor',
    'fecha',
    'fechaEntrega',
    'total',
    'pagado',
    'saldo',
    'estado',
    'acciones'
  ];
  
  // ✨ Variables de filtrado por fecha
  filtroActivo: string | null = null; // Puede ser: 'SEMANA', 'MES', 'FECHA_CUSTOM'
  fechaSeleccionada: Date | null = null;
  filtroFechaDesde: Date | null = null;
  filtroFechaHasta: Date | null = null;
  
  // filtros
  filtroEstado: string = 'TODAS';
  filtroTexto: string = '';
  filtroTipo: string = 'ORDENES'; // ✅ Por defecto: ORDENES
  
  // loading
  cargando: boolean = false;
  error: string = '';

  // estadísticas rápidas
  stats = {
    totalOrdenes: 0,
    totalVentas: 0,
    totalPendiente: 0,
    ordenesPendientes: 0
  };

  constructor(
    private ordenService: OrdenTrabajoService,
    private router: Router,
    public permisos: PermisosService
  ) { }

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  // Métodos de permisos para usar en el template
  puedeCrear(): boolean {
    return this.permisos.tiene('ordenes', 'crear');
  }

  puedeEditar(): boolean {
    return this.permisos.tiene('ordenes', 'editar');
  }

  puedeEliminar(): boolean {
    return this.permisos.tiene('ordenes', 'eliminar');
  }

  puedeVerEstadisticas(): boolean {
    // Solo ADMINISTRADOR y CAJERO pueden ver estadísticas de ventas
    const roles = this.permisos.getRolesUsuarioActual();
    return roles.some(rol => 
      rol === 'ADMINISTRADOR' || 
      rol === 'ROLE_ADMINISTRADOR' || 
      rol === 'CAJERO' || 
      rol === 'ROLE_CAJERO'
    );
  }

  // ✨ Filtrar por semana actual
  filtrarPorSemana(): void {
    this.filtroActivo = 'SEMANA';
    this.fechaSeleccionada = null;

    const hoy = new Date();
    const diaActual = hoy.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    
    // Calcular lunes de esta semana
    const lunes = new Date(hoy);
    const diferencia = diaActual === 0 ? -6 : 1 - diaActual; // Si es domingo, retroceder 6 días
    lunes.setDate(hoy.getDate() + diferencia);
    lunes.setHours(0, 0, 0, 0);

    // Calcular sábado de esta semana
    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5); // Lunes + 5 = Sábado
    sabado.setHours(23, 59, 59, 999);

    this.filtroFechaDesde = lunes;
    this.filtroFechaHasta = sabado;

    this.aplicarFiltros();
  }

  // ✨ NUEVO: Filtrar por mes actual
  filtrarPorMes(): void {
    this.filtroActivo = 'MES';
    this.fechaSeleccionada = null;

    const hoy = new Date();
    
    // Primer día del mes
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    primerDia.setHours(0, 0, 0, 0);

    // Último día del mes
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    ultimoDia.setHours(23, 59, 59, 999);

    this.filtroFechaDesde = primerDia;
    this.filtroFechaHasta = ultimoDia;

    this.aplicarFiltros();
  }

  // ✨ NUEVO: Filtrar por fecha seleccionada en calendario
  filtrarPorFechaSeleccionada(): void {
    if (!this.fechaSeleccionada) {
      this.limpiarFiltros();
      return;
    }

    this.filtroActivo = 'FECHA_CUSTOM';

    const fecha = new Date(this.fechaSeleccionada);
    
    this.filtroFechaDesde = new Date(fecha);
    this.filtroFechaDesde.setHours(0, 0, 0, 0);

    this.filtroFechaHasta = new Date(fecha);
    this.filtroFechaHasta.setHours(23, 59, 59, 999);

    this.aplicarFiltros();
  }

  // cargarOrdenes - obtiene todas las órdenes
  cargarOrdenes(): void {
    this.cargando = true;
    this.error = '';
    
    this.ordenService.obtenerTodas().subscribe({
      next: (data) => {
        console.log('📋 Órdenes cargadas:', data);
        
        this.ordenes = data;
        this.aplicarFiltros();
        // ✅ CAMBIO: Calcular estadísticas DESPUÉS de filtrar
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar órdenes:', err);
        this.error = 'Error al cargar las órdenes';
        this.cargando = false;
      }
    });
  }

  // aplicarFiltros - filtra las órdenes según criterios
  aplicarFiltros(): void {
    let resultado = [...this.ordenes];

    // Filtro por tipo (Orden/Cotización)
    if (this.filtroTipo === 'ORDENES') {
      resultado = resultado.filter(o => !o.esCotizacion);
    } else if (this.filtroTipo === 'COTIZACIONES') {
      resultado = resultado.filter(o => o.esCotizacion);
    }

    // Filtro por estado
    if (this.filtroEstado !== 'TODAS') {
      resultado = resultado.filter(o => o.estado === this.filtroEstado);
    }

    // Filtro por texto (número orden, cliente)
    if (this.filtroTexto.trim()) {
      const texto = this.filtroTexto.toLowerCase();
      resultado = resultado.filter(o =>
        o.numeroOrden?.toLowerCase().includes(texto) ||
        o.nombreCliente?.toLowerCase().includes(texto) ||
        o.nombreVendedor?.toLowerCase().includes(texto)
      );
    }

    // Filtro por fecha desde
    if (this.filtroFechaDesde) {
      resultado = resultado.filter(o => {
        if (!o.fRecepcion) return false;
        const fechaOrden = new Date(o.fRecepcion);
        return fechaOrden >= this.filtroFechaDesde!;
      });
    }

    // Filtro por fecha hasta
    if (this.filtroFechaHasta) {
      resultado = resultado.filter(o => {
        if (!o.fRecepcion) return false;
        const fechaOrden = new Date(o.fRecepcion);
        return fechaOrden <= this.filtroFechaHasta!;
      });
    }

    this.ordenesFiltradas = resultado;
    
    // ✅ CALCULAR ESTADÍSTICAS DESPUÉS DE FILTRAR
    this.calcularEstadisticas();
  }

  // limpiarFiltros - resetea todos los filtros
  limpiarFiltros(): void {
    this.filtroEstado = 'TODAS';
    this.filtroTexto = '';
    this.filtroTipo = 'ORDENES'; // ✅ Volver a ORDENES por defecto
    this.filtroFechaDesde = null;
    this.filtroFechaHasta = null;
    this.filtroActivo = null;
    this.fechaSeleccionada = null;
    this.aplicarFiltros();
  }

  // ✅ MODIFICADO: calcularEstadisticas - calcula estadísticas SOLO de órdenes filtradas
  calcularEstadisticas(): void {
    // ✅ Usar ordenesFiltradas en lugar de ordenes
    const ordenesNoConsulta = this.ordenesFiltradas.filter(o => !o.esCotizacion);
    
    this.stats.totalOrdenes = ordenesNoConsulta.length;
    this.stats.totalVentas = ordenesNoConsulta.reduce((sum, o) => sum + (o.totalFinal || 0), 0);
    this.stats.totalPendiente = ordenesNoConsulta.reduce((sum, o) => sum + (o.saldoPendiente || 0), 0);
    this.stats.ordenesPendientes = ordenesNoConsulta.filter(o => (o.saldoPendiente || 0) > 0).length;
    
    console.log('📊 Estadísticas calculadas:', this.stats);
  }

  // verDetalle - navega al detalle de la orden
  verDetalle(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/ordenes/detalle', id]);
    }
  }

  // crearOrden - navega al formulario de creación
  crearOrden(): void {
    if (!this.puedeCrear()) {
      alert('No tienes permisos para crear órdenes');
      return;
    }
    this.router.navigate(['/ordenes/crear']);
  }

  // convertirCotizacion - convierte una cotización en orden
  convertirCotizacion(id: number | undefined, event: Event): void {
    event.stopPropagation();
    
    if (!id) return;

    if (!this.puedeCrear()) {
      alert('No tienes permisos para convertir cotizaciones');
      return;
    }
    
    if (confirm('¿Deseas convertir esta cotización en orden de trabajo?')) {
      this.ordenService.convertirCotizacionAOrden(id).subscribe({
        next: (nuevaOrden) => {
          alert(`Orden creada: ${nuevaOrden.numeroOrden}`);
          this.cargarOrdenes();
        },
        error: (err) => {
          console.error('Error al convertir cotización:', err);
          this.error = 'Error al convertir la cotización';
        }
      });
    }
  }

  // eliminarOrden - elimina una orden
  eliminarOrden(id: number | undefined, event: Event): void {
    event.stopPropagation();
    
    if (!id) return;

    if (!this.puedeEliminar()) {
      alert('No tienes permisos para eliminar órdenes');
      return;
    }
    
    if (confirm('¿Estás seguro de eliminar esta orden? Esta acción no se puede deshacer.')) {
      this.ordenService.eliminar(id).subscribe({
        next: () => {
          this.cargarOrdenes();
        },
        error: (err) => {
          console.error('Error al eliminar orden:', err);
          this.error = 'Error al eliminar la orden';
        }
      });
    }
  }

  // getEstadoClass - retorna clase CSS según el estado
  getEstadoClass(estado: string | undefined): string {
    switch (estado) {
      case 'PENDIENTE': return 'estado-pendiente';
      case 'EN_PROCESO': return 'estado-proceso';
      case 'COMPLETADO': return 'estado-completado';
      case 'ENTREGADO': return 'estado-entregado';
      case 'CANCELADO': return 'estado-cancelado';
      default: return '';
    }
  }

  // getEstadoLabel - retorna label legible del estado
  getEstadoLabel(estado: string | undefined): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROCESO': return 'En Proceso';
      case 'COMPLETADO': return 'Completado';
      case 'ENTREGADO': return 'Entregado';
      case 'CANCELADO': return 'Cancelado';
      default: return estado || 'Sin Estado';
    }
  }

  // recargar - recarga la lista
  recargar(): void {
    this.cargarOrdenes();
  }
  // Navegar al tracking de una orden específica
  irATracking(idOrden: number | undefined, event: Event): void {
    event.stopPropagation(); // Evitar que se active el click de la fila
    
    if (idOrden) {
      this.router.navigate(['/tracking'], { 
        queryParams: { orden: idOrden } 
      });
    }
  }
}