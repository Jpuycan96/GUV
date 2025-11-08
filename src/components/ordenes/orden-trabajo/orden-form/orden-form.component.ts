import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';

// Services
import { OrdenTrabajoService, CrearOrdenRequest } from '../../../../services/ordenes/orden-trabajo/orden-trabajo.service';
import { ClienteService, ClienteDTO } from '../../../../services/cliente/cliente.service';
import { UsuarioService, UsuarioDTO } from '../../../../services/usuario/usuario.service';
import { ServicioService, ServicioDTO } from '../../../../services/servicios-cotizaciones/servicio/servicio.service';
import { MaterialService, MaterialDTO } from '../../../../services/servicios-cotizaciones/material/material.service';
import { ModeloService, ModeloDTO } from '../../../../services/servicios-cotizaciones/modelo/modelo.service';
import { ExtraService, ExtraDTO } from '../../../../services/servicios-cotizaciones/extra/extra.service';
import { ExtraDetalleService, ExtraDetalleDTO } from '../../../../services/servicios-cotizaciones/extra-detalle/extra-detalle.service';
import { PrecioEscalaService, PrecioEscalaDTO } from '../../../../services/servicios-cotizaciones/precio-escala/precio-escala.service';
import { PrecioMaterialAreaService, PrecioMaterialAreaDTO } from '../../../../services/servicios-cotizaciones/precio-material-area/precio-material-area.service';
import { AuthService, User } from '../../../../services/AuthService';

interface ServicioFormulario {
  idServicio: number | null;
  nombreServicio?: string;
  idMaterial: number | null;
  nombreMaterial?: string;
  idModelo: number | null;
  nombreModelo?: string;
  cantidad: number;
  ancho: number | null;
  alto: number | null;
  unidadMedida: string;
  descripcion: string;
  archivoDiseno?: string;
  disenoEmpresa: boolean;
  disenoCliente: boolean;
  sinDiseno: boolean;
  precioUnitario: number;
  subtotal: number;
  requiereDimensiones: boolean;
  extras: ExtraFormulario[];
}

interface ExtraFormulario {
  idExtra: number | null;
  nombreExtra?: string;
  idExtraDetalle: number | null;
  nombreDetalle?: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatExpansionModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './orden-form.component.html',
  styleUrl: './orden-form.component.css'
})
export class OrdenFormComponent implements OnInit {
  // Formulario principal
  ordenForm: FormGroup;

  // Usuario actual
  usuarioActual: User | null = null;

  // Búsqueda de cliente
  busquedaCelular: string = '';
  clienteEncontrado: ClienteDTO | null = null;
  mostrarFormCliente: boolean = false;

  // ✅ FECHAS - Fecha y hora separadas para la fecha de entrega acordada
  // La fecha de registro se genera automáticamente en el backend
  fechaEntrega: Date | null = null;
  horaEntrega: string = '';

  // Datos del catálogo
  clientes: ClienteDTO[] = [];
  vendedores: UsuarioDTO[] = [];
  servicios: ServicioDTO[] = [];
  materiales: MaterialDTO[] = [];
  modelos: ModeloDTO[] = [];
  extras: ExtraDTO[] = [];
  
  // Datos filtrados
  materialesFiltrados: MaterialDTO[] = [];
  modelosFiltrados: ModeloDTO[] = [];
  extrasDetalles: Map<number, ExtraDetalleDTO[]> = new Map();

  // Servicios agregados
  serviciosAgregados: ServicioFormulario[] = [];

  // Totales
  subtotal: number = 0;
  totalExtras: number = 0;
  subtotalBruto: number = 0;
  descuento: number = 0;
  totalFinal: number = 0;

  // Descuento
  montoDescuento: number = 0;
  porcentajeDescuento: number = 0;
  errorDescuento: string = '';

  // Estado
  cargando: boolean = false;
  guardando: boolean = false;
  error: string = '';

  // Flags
  esCotizacion: boolean = false;
  aplicarDescuento: boolean = false;

  // ========== ✅ NUEVAS PROPIEDADES PARA IA ==========
  textoLibreIA: string = '';
  interpretandoIA: boolean = false;
  errorIA: string = '';
  resultadoIA: any = null;
  confianzaIA: number = 0;

  constructor(
    private fb: FormBuilder,
    private ordenService: OrdenTrabajoService,
    private clienteService: ClienteService,
    private usuarioService: UsuarioService,
    private servicioService: ServicioService,
    private materialService: MaterialService,
    private modeloService: ModeloService,
    private extraService: ExtraService,
    private extraDetalleService: ExtraDetalleService,
    private precioEscalaService: PrecioEscalaService,
    private precioAreaService: PrecioMaterialAreaService,
    private authService: AuthService,
    private router: Router
  ) {
    this.ordenForm = this.fb.group({
      idCliente: [null, Validators.required],
      idVendedor: [null, Validators.required],
      fEntregaAcordada: [''], // Se llenará con fecha + hora combinadas
      observaciones: [''],
      motivoDescuento: [''],
      porcentajeDescuento: [0, [Validators.min(0), Validators.max(10)]]
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarioActual();
    this.cargarDatos();
  }

  // obtenerUsuarioActual - obtiene el usuario logueado
  obtenerUsuarioActual(): void {
    this.authService.currentUser$.subscribe(user => {
      this.usuarioActual = user;
    });
  }

  // cargarDatos - carga todos los catálogos necesarios
  cargarDatos(): void {
    this.cargando = true;

    Promise.all([
      this.clienteService.obtenerTodos().toPromise(),
      this.usuarioService.obtenerTodos().toPromise(),
      this.servicioService.obtenerTodos().toPromise(),
      this.extraService.obtenerTodos().toPromise()
    ]).then(([clientes, usuarios, servicios, extras]) => {
      this.clientes = clientes || [];
      this.vendedores = usuarios || [];
      this.servicios = servicios || [];
      this.extras = extras || [];
      
      // Autoseleccionar vendedor si encontramos al usuario actual
      if (this.usuarioActual) {
        const vendedor = this.vendedores.find(v => 
          v.username === this.usuarioActual?.username
        );
        if (vendedor) {
          this.ordenForm.patchValue({ idVendedor: vendedor.id });
        }
      }
      
      this.cargando = false;
    }).catch(err => {
      console.error('Error al cargar datos:', err);
      this.error = 'Error al cargar los datos necesarios';
      this.cargando = false;
    });
  }

  // ========== ✅ NUEVO MÉTODO: INTERPRETAR CON IA ==========
  interpretarConIA(): void {
    if (!this.textoLibreIA.trim()) {
      this.errorIA = 'Por favor ingresa un texto para interpretar';
      return;
    }

    this.interpretandoIA = true;
    this.errorIA = '';
    this.resultadoIA = null;

    console.log('🤖 [IA] Enviando texto a interpretar:', this.textoLibreIA);

    // Preparar catálogos para enviar al backend
    const catalogos = {
      servicios: this.servicios.map(s => ({
        idServicio: s.idServicio,
        nombre: s.nombre,
        descripcion: s.descripcion || ''
      })),
      materiales: this.materiales.map(m => ({
        idMaterial: m.idMaterial,
        nombre: m.nombre,
        descripcion: m.descripcion || '',
        idServicio: m.idServicio
      })),
      extras: this.extras.map(e => ({
        idExtra: e.idExtra,
        nombre: e.nombre,
        tipo: e.tipo || ''
      })),
      modelos: this.modelos.map(m => ({
        idModelo: m.idModelo,
        codigo: m.codigo,
        descripcion: m.descripcion || '',
        idMaterial: m.idMaterial
      }))
    };

    // Request para el backend
    const request = {
      textoUsuario: this.textoLibreIA,
      idVendedor: this.ordenForm.get('idVendedor')?.value || null,
      catalogos: catalogos
    };

    // Llamar al servicio (endpoint /api/ordenes/interpretar)
    this.ordenService.interpretarTextoConIA(request).subscribe({
      next: (response) => {
        console.log('✅ [IA] Respuesta recibida:', response);
        
        this.resultadoIA = response;
        this.confianzaIA = response.confianza || 0;
        
        // Si hay advertencia, mostrarla
        if (response.advertencia) {
          this.errorIA = response.advertencia;
          this.interpretandoIA = false;
          return;
        }

        // Auto-llenar formulario con los servicios interpretados
        this.autoLlenarFormulario(response);
        
        this.interpretandoIA = false;
        alert(`✅ Interpretación exitosa!\n\nConfianza: ${(this.confianzaIA * 100).toFixed(0)}%\n\n${response.observaciones || ''}`);
      },
      error: (err) => {
        console.error('❌ [IA] Error:', err);
        this.errorIA = err.error?.message || 'Error al interpretar el texto';
        this.interpretandoIA = false;
      }
    });
  }

// ========== ✅ MÉTODO CORREGIDO: AUTO-LLENAR FORMULARIO ==========
  autoLlenarFormulario(response: any): void {
    console.log('🔧 [IA] Auto-llenando formulario...');

    // Limpiar servicios existentes
    this.serviciosAgregados = [];

    // Llenar fecha de entrega si existe
    if (response.fechaEntrega) {
      const fechaEntrega = new Date(response.fechaEntrega);
      this.fechaEntrega = fechaEntrega;
      
      // Extraer hora en formato HH:mm
      const horas = fechaEntrega.getHours().toString().padStart(2, '0');
      const minutos = fechaEntrega.getMinutes().toString().padStart(2, '0');
      this.horaEntrega = `${horas}:${minutos}`;
      
      this.actualizarFechaEntrega();
    }

    // ✅ CARGAR TODOS LOS MATERIALES Y MODELOS PRIMERO
    if (response.servicios && response.servicios.length > 0) {
      // Obtener todos los IDs de servicios únicos
      const serviciosIds = [...new Set(response.servicios
        .map((s: any) => {
          const servicioEncontrado = this.servicios.find(srv => 
            srv.nombre.toLowerCase().includes(s.nombreServicio?.toLowerCase() || '') ||
            (s.nombreServicio?.toLowerCase() || '').includes(srv.nombre.toLowerCase())
          );
          return servicioEncontrado?.idServicio;
        })
        .filter((id: any) => id != null))];

      // Cargar materiales de todos los servicios
      const promesasMateriales = serviciosIds.map(idServicio => 
        this.materialService.obtenerPorServicio(idServicio as number).toPromise()
      );

      Promise.all(promesasMateriales).then(resultados => {
        // Combinar todos los materiales
        this.materiales = resultados.flat().filter(m => m != null) as MaterialDTO[];
        
        // Ahora sí, agregar cada servicio interpretado
        response.servicios.forEach((servicioIA: any, index: number) => {
          console.log(`📦 [IA] Procesando servicio ${index + 1}:`, servicioIA);
          
          // Crear nuevo servicio vacío
          this.agregarServicio();
          const servicioIndex = this.serviciosAgregados.length - 1;
          const servicio = this.serviciosAgregados[servicioIndex];

          // Buscar servicio por nombre
          if (servicioIA.nombreServicio) {
            const servicioEncontrado = this.servicios.find(s => 
              s.nombre.toLowerCase().includes(servicioIA.nombreServicio.toLowerCase()) ||
              servicioIA.nombreServicio.toLowerCase().includes(s.nombre.toLowerCase())
            );
            
            if (servicioEncontrado) {
              servicio.idServicio = servicioEncontrado.idServicio ?? null;
              servicio.nombreServicio = servicioEncontrado.nombre;
              this.onServicioChange(servicioIndex);
              
              // Esperar a que carguen los materiales antes de continuar
              setTimeout(() => {
                this.llenarMaterialYDimensiones(servicioIndex, servicioIA);
              }, 500);
            } else {
              console.warn(`⚠️ [IA] No se encontró servicio: ${servicioIA.nombreServicio}`);
            }
          }
        });

        console.log('✅ [IA] Formulario auto-llenado');
      }).catch(err => {
        console.error('❌ [IA] Error al cargar materiales:', err);
      });
    }
  }
  // ========== ✅ NUEVO MÉTODO: LLENAR MATERIAL Y DIMENSIONES ==========
  llenarMaterialYDimensiones(index: number, servicioIA: any): void {
    const servicio = this.serviciosAgregados[index];

    // Buscar material por nombre
    if (servicioIA.material) {
      const materialEncontrado = this.materialesFiltrados.find(m => 
        m.nombre.toLowerCase().includes(servicioIA.material.toLowerCase()) ||
        servicioIA.material.toLowerCase().includes(m.nombre.toLowerCase())
      );
      
      if (materialEncontrado) {
        servicio.idMaterial = materialEncontrado.idMaterial ?? null;
        servicio.nombreMaterial = materialEncontrado.nombre;
        this.onMaterialChange(index);
        
        // Esperar a que carguen los modelos
        setTimeout(() => {
          // Buscar modelo si existe
          if (servicioIA.modelo) {
            const modeloEncontrado = this.modelosFiltrados.find(m => 
              m.codigo.toLowerCase().includes(servicioIA.modelo.toLowerCase()) ||
              (m.descripcion && m.descripcion.toLowerCase().includes(servicioIA.modelo.toLowerCase()))
            );
            
            if (modeloEncontrado) {
              servicio.idModelo = modeloEncontrado.idModelo ?? null;
              this.onModeloChange(index);
            }
          }
        }, 200);
      } else {
        console.warn(`⚠️ [IA] No se encontró material: ${servicioIA.material}`);
      }
    }

    // Llenar cantidad
    if (servicioIA.cantidad) {
      servicio.cantidad = servicioIA.cantidad;
    }

    // Llenar dimensiones
    if (servicioIA.ancho && servicioIA.alto) {
      servicio.ancho = servicioIA.ancho;
      servicio.alto = servicioIA.alto;
      this.onDimensionesChange(index);
    }

    // Llenar descripción
    if (servicioIA.descripcion) {
      servicio.descripcion = servicioIA.descripcion;
    }

    // Recalcular precio
    setTimeout(() => {
      this.calcularPrecioServicio(index);
      
      // Agregar extras si existen
      if (servicioIA.extras && servicioIA.extras.length > 0) {
        servicioIA.extras.forEach((extraIA: any) => {
          this.agregarExtra(index);
          const extraIndex = servicio.extras.length - 1;
          const extra = servicio.extras[extraIndex];
          
          // Buscar extra por nombre
          const extraEncontrado = this.extras.find(e => 
            e.nombre.toLowerCase().includes(extraIA.nombreExtra.toLowerCase()) ||
            extraIA.nombreExtra.toLowerCase().includes(e.nombre.toLowerCase())
          );
          
          if (extraEncontrado) {
            extra.idExtra = extraEncontrado.idExtra ?? null;
            extra.cantidad = extraIA.cantidad || 1;
            this.onExtraChange(index, extraIndex);
          }
        });
      }
    }, 500);
  }

  // ========== ✅ NUEVO MÉTODO: LIMPIAR ASISTENTE IA ==========
  limpiarAsistenteIA(): void {
    this.textoLibreIA = '';
    this.errorIA = '';
    this.resultadoIA = null;
    this.confianzaIA = 0;
  }

 // ✅ actualizarFechaEntrega - combina fecha y hora SIN conversión UTC
  actualizarFechaEntrega(): void {
    if (!this.fechaEntrega) {
      this.ordenForm.patchValue({ fEntregaAcordada: '' });
      return;
    }

    const fecha = new Date(this.fechaEntrega);
    
    if (this.horaEntrega && this.horaEntrega.trim()) {
      const [horas, minutos] = this.horaEntrega.split(':');
      fecha.setHours(parseInt(horas, 10) || 0);
      fecha.setMinutes(parseInt(minutos, 10) || 0);
      fecha.setSeconds(0);
      fecha.setMilliseconds(0);
    } else {
      // Si no hay hora, usar mediodía por defecto
      fecha.setHours(12);
      fecha.setMinutes(0);
      fecha.setSeconds(0);
      fecha.setMilliseconds(0);
    }
    
    // ✅ CORREGIDO: Ajustar para que la hora local se mantenga al enviar al backend
    // Restar el offset de la zona horaria para que al convertir a ISO mantenga la hora local
    const fechaAjustada = new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000));
    
    this.ordenForm.patchValue({ fEntregaAcordada: fechaAjustada.toISOString() });
    
    console.log('📅 Fecha original (local):', fecha.toLocaleString('es-PE'));
    console.log('📤 Fecha enviada (ISO):', fechaAjustada.toISOString());
  }

  // buscarClientePorCelular - busca cliente por número de teléfono
  buscarClientePorCelular(): void {
    if (!this.busquedaCelular.trim()) {
      this.error = 'Ingresa un número de celular';
      return;
    }

    const cliente = this.clientes.find(c => 
      c.telefono?.includes(this.busquedaCelular.trim())
    );

    if (cliente) {
      this.clienteEncontrado = cliente;
      this.ordenForm.patchValue({ idCliente: cliente.idCliente });
      this.error = '';
    } else {
      this.clienteEncontrado = null;
      this.error = 'Cliente no encontrado';
      this.mostrarFormCliente = true;
    }
  }

  // limpiarBusquedaCliente - resetea la búsqueda
  limpiarBusquedaCliente(): void {
    this.busquedaCelular = '';
    this.clienteEncontrado = null;
    this.ordenForm.patchValue({ idCliente: null });
    this.mostrarFormCliente = false;
  }

  // agregarServicio - agrega un nuevo servicio a la orden
  agregarServicio(): void {
    const nuevoServicio: ServicioFormulario = {
      idServicio: null,
      idMaterial: null,
      idModelo: null,
      cantidad: 1,
      ancho: null,
      alto: null,
      unidadMedida: 'unidad',
      descripcion: '',
      archivoDiseno: '',
      disenoEmpresa: false,
      disenoCliente: false,
      sinDiseno: true,
      precioUnitario: 0,
      subtotal: 0,
      requiereDimensiones: false,
      extras: []
    };

    this.serviciosAgregados.push(nuevoServicio);
  }

  // eliminarServicio - elimina un servicio de la lista
  eliminarServicio(index: number): void {
    if (confirm('¿Deseas eliminar este servicio?')) {
      this.serviciosAgregados.splice(index, 1);
      this.calcularTotales();
    }
  }

  // onServicioChange - cuando cambia el servicio seleccionado
  onServicioChange(index: number): void {
    const servicio = this.serviciosAgregados[index];
    const servicioData = this.servicios.find(s => s.idServicio === servicio.idServicio);
    
    if (servicioData) {
      servicio.nombreServicio = servicioData.nombre;
      
      // Cargar solo materiales de este servicio
      if (servicioData.idServicio) {
        this.materialService.obtenerPorServicio(servicioData.idServicio).subscribe({
          next: (materiales) => {
            this.materialesFiltrados = materiales;
          },
          error: (err) => {
            console.error('Error al cargar materiales:', err);
            this.materialesFiltrados = [];
          }
        });
      }
    }
    
    // Reset campos dependientes
    servicio.idMaterial = null;
    servicio.idModelo = null;
    servicio.precioUnitario = 0;
    servicio.subtotal = 0;
    servicio.requiereDimensiones = false;
  }

  // onMaterialChange - cuando cambia el material
  onMaterialChange(index: number): void {
    const servicio = this.serviciosAgregados[index];
    const materialData = this.materialesFiltrados.find(m => m.idMaterial === servicio.idMaterial);
    
    if (materialData) {
      servicio.nombreMaterial = materialData.nombre;
      
      // Cargar solo modelos de este material
      if (materialData.idMaterial) {
        this.modeloService.obtenerPorMaterial(materialData.idMaterial).subscribe({
          next: (modelos) => {
            this.modelosFiltrados = modelos;
          },
          error: (err) => {
            console.error('Error al cargar modelos:', err);
            this.modelosFiltrados = [];
          }
        });
      }

      // Verificar si requiere dimensiones (si tiene precio por área)
      if (servicio.idServicio && servicio.idMaterial) {
        this.precioAreaService.obtenerPorServicioYMaterial(servicio.idServicio, servicio.idMaterial)
          .subscribe({
            next: (precios) => {
              servicio.requiereDimensiones = precios && precios.length > 0;
            },
            error: () => {
              servicio.requiereDimensiones = false;
            }
          });
      }
    }

    this.calcularPrecioServicio(index);
  }

  // onModeloChange - cuando cambia el modelo
  onModeloChange(index: number): void {
    const servicio = this.serviciosAgregados[index];
    const modeloData = this.modelosFiltrados.find(m => m.idModelo === servicio.idModelo);
    
    if (modeloData) {
      servicio.nombreModelo = `${modeloData.codigo} - ${modeloData.descripcion || ''}`;
    }

    this.calcularPrecioServicio(index);
  }

  // onCantidadChange - cuando cambia la cantidad
  onCantidadChange(index: number): void {
    this.calcularPrecioServicio(index);
  }

  // onDimensionesChange - cuando cambian ancho/alto
  onDimensionesChange(index: number): void {
    const servicio = this.serviciosAgregados[index];
    
    if (servicio.ancho && servicio.alto) {
      servicio.unidadMedida = 'm2';
    } else {
      servicio.unidadMedida = 'unidad';
    }

    this.calcularPrecioServicio(index);
  }

  // onDisenoChange - cuando cambian los checkboxes de diseño
  onDisenoChange(index: number, tipo: 'empresa' | 'cliente' | 'sin'): void {
    const servicio = this.serviciosAgregados[index];
    
    // Solo uno puede estar activo a la vez
    if (tipo === 'empresa') {
      servicio.disenoCliente = false;
      servicio.sinDiseno = false;
    } else if (tipo === 'cliente') {
      servicio.disenoEmpresa = false;
      servicio.sinDiseno = false;
    } else if (tipo === 'sin') {
      servicio.disenoEmpresa = false;
      servicio.disenoCliente = false;
    }
  }

// ✅ MÉTODO CORREGIDO: calcularPrecioServicio
  // Ahora considera el modelo seleccionado al buscar el precio
  calcularPrecioServicio(index: number): void {
    const servicio = this.serviciosAgregados[index];

    if (!servicio.idServicio || !servicio.idMaterial || !servicio.cantidad) {
      servicio.precioUnitario = 0;
      servicio.subtotal = 0;
      this.calcularTotales();
      return;
    }

    // Intentar obtener precio por escala primero
    this.precioEscalaService.obtenerPorServicioYMaterial(servicio.idServicio, servicio.idMaterial)
      .subscribe({
        next: (precios) => {
          if (precios && precios.length > 0) {
            // ✅ FILTRAR POR MODELO SI ESTÁ SELECCIONADO
            let preciosFiltrados = precios;
            if (servicio.idModelo) {
              preciosFiltrados = precios.filter(p => p.idModelo === servicio.idModelo);
              
              // Si no hay precios para este modelo específico, usar precios sin modelo
              if (preciosFiltrados.length === 0) {
                console.warn(`⚠️ No hay precios específicos para modelo ${servicio.idModelo}, usando precios generales`);
                preciosFiltrados = precios.filter(p => !p.idModelo);
              }
            } else {
              // Si no hay modelo seleccionado, usar solo precios sin modelo específico
              preciosFiltrados = precios.filter(p => !p.idModelo);
            }
            
            // Buscar precio según cantidad
            const precioAplicable = this.buscarPrecioPorCantidad(preciosFiltrados, servicio.cantidad);
            
            if (precioAplicable) {
              servicio.precioUnitario = precioAplicable.precioUnitario || 0;
              servicio.subtotal = servicio.precioUnitario * servicio.cantidad;
              console.log(`💰 Precio aplicado: S/ ${servicio.precioUnitario} para cantidad ${servicio.cantidad} (modelo: ${servicio.idModelo || 'sin modelo'})`);
              this.calcularTotales();
              return;
            }
          }

          // Si no hay precio por escala, buscar por área
          this.calcularPrecioPorArea(index);
        },
        error: () => {
          // Si falla, intentar por área
          this.calcularPrecioPorArea(index);
        }
      });
  }

  // buscarPrecioPorCantidad - encuentra el precio según la cantidad
  buscarPrecioPorCantidad(precios: PrecioEscalaDTO[], cantidad: number): PrecioEscalaDTO | null {
    for (const precio of precios) {
      const cantMin = precio.cantidadMin || 0;
      const cantMax = precio.cantidadMax || Number.MAX_VALUE;
      
      if (cantidad >= cantMin && cantidad <= cantMax) {
        return precio;
      }
    }
    return null;
  }

  // calcularPrecioPorArea - calcula precio por área (m2)
  calcularPrecioPorArea(index: number): void {
    const servicio = this.serviciosAgregados[index];

    if (!servicio.idServicio || !servicio.idMaterial) {
      return;
    }

    this.precioAreaService.obtenerPorServicioYMaterial(servicio.idServicio, servicio.idMaterial)
      .subscribe({
        next: (precios) => {
          if (precios && precios.length > 0) {
            const precio = precios[0];
            const precioM2 = precio.precioM2 || 0;

            if (servicio.ancho && servicio.alto) {
              // Calcular por área
              const area = servicio.ancho * servicio.alto;
              servicio.precioUnitario = precioM2 * area;
              servicio.subtotal = servicio.precioUnitario * servicio.cantidad;
            } else {
              // Si requiere dimensiones pero no las tiene, precio = 0
              servicio.precioUnitario = 0;
              servicio.subtotal = 0;
            }

            this.calcularTotales();
          } else {
            // No hay precio configurado
            servicio.precioUnitario = 0;
            servicio.subtotal = 0;
            this.calcularTotales();
          }
        },
        error: (err) => {
          console.error('No se encontró precio para este servicio:', err);
          servicio.precioUnitario = 0;
          servicio.subtotal = 0;
          this.calcularTotales();
        }
      });
  }

  // agregarExtra - agrega un extra a un servicio
  agregarExtra(indexServicio: number): void {
    const servicio = this.serviciosAgregados[indexServicio];
    
    const nuevoExtra: ExtraFormulario = {
      idExtra: null,
      idExtraDetalle: null,
      cantidad: 1,
      precio: 0,
      subtotal: 0
    };

    servicio.extras.push(nuevoExtra);
  }

  // eliminarExtra - elimina un extra
  eliminarExtra(indexServicio: number, indexExtra: number): void {
    const servicio = this.serviciosAgregados[indexServicio];
    servicio.extras.splice(indexExtra, 1);
    this.calcularTotales();
  }

  // onExtraChange - cuando cambia el extra seleccionado
  onExtraChange(indexServicio: number, indexExtra: number): void {
    const extra = this.serviciosAgregados[indexServicio].extras[indexExtra];
    const extraData = this.extras.find(e => e.idExtra === extra.idExtra);
    
    if (extraData) {
      extra.nombreExtra = extraData.nombre;
      
      // Cargar detalles del extra
      if (extraData.idExtra) {
        this.extraDetalleService.obtenerPorExtra(extraData.idExtra).subscribe({
          next: (detalles) => {
            if (detalles) {
              this.extrasDetalles.set(extraData.idExtra!, detalles);
            }
          },
          error: (err) => {
            console.error('Error al cargar detalles del extra:', err);
          }
        });
      }
    }

    extra.idExtraDetalle = null;
    extra.precio = 0;
    extra.subtotal = 0;
    this.calcularTotales();
  }

  // onExtraDetalleChange - cuando cambia el detalle del extra
  onExtraDetalleChange(indexServicio: number, indexExtra: number): void {
    const extra = this.serviciosAgregados[indexServicio].extras[indexExtra];
    
    if (extra.idExtra && extra.idExtraDetalle) {
      const detalles = this.extrasDetalles.get(extra.idExtra);
      const detalle = detalles?.find(d => d.idExtraDetalle === extra.idExtraDetalle);
      
      if (detalle) {
        extra.nombreDetalle = detalle.unidadBaseExtra || '';
        extra.precio = detalle.precioExtraBase || 0;
        extra.subtotal = extra.precio * extra.cantidad;
        this.calcularTotales();
      }
    }
  }

  // onExtraCantidadChange - cuando cambia la cantidad del extra
  onExtraCantidadChange(indexServicio: number, indexExtra: number): void {
    const extra = this.serviciosAgregados[indexServicio].extras[indexExtra];
    extra.subtotal = extra.precio * extra.cantidad;
    this.calcularTotales();
  }

  // calcularTotalExtrasServicio - calcula el total de extras de un servicio
  calcularTotalExtrasServicio(servicio: ServicioFormulario): number {
    return servicio.extras.reduce((sum, e) => sum + e.subtotal, 0);
  }

  // calcularTotales - calcula todos los totales de la orden
  calcularTotales(): void {
    this.subtotal = 0;
    this.totalExtras = 0;

    this.serviciosAgregados.forEach(servicio => {
      this.subtotal += servicio.subtotal;
      
      servicio.extras.forEach(extra => {
        this.totalExtras += extra.subtotal;
      });
    });

    this.subtotalBruto = this.subtotal + this.totalExtras;

    // El descuento ya está calculado en onMontoDescuentoChange
    this.totalFinal = this.subtotalBruto - this.descuento;
  }

  // abrirDescuento - activa el modo descuento
  abrirDescuento(): void {
    this.aplicarDescuento = true;
    this.ordenForm.get('motivoDescuento')?.setValidators([Validators.required]);
    this.ordenForm.get('motivoDescuento')?.updateValueAndValidity();
  }

  // cancelarDescuento - desactiva el descuento
  cancelarDescuento(): void {
    this.aplicarDescuento = false;
    this.montoDescuento = 0;
    this.descuento = 0;
    this.porcentajeDescuento = 0;
    this.errorDescuento = '';
    this.ordenForm.patchValue({ 
      motivoDescuento: '',
      porcentajeDescuento: 0 
    });
    this.ordenForm.get('motivoDescuento')?.clearValidators();
    this.ordenForm.get('motivoDescuento')?.updateValueAndValidity();
    this.calcularTotales();
  }

  // onMontoDescuentoChange - cuando cambia el monto del descuento
  onMontoDescuentoChange(): void {
    this.errorDescuento = '';
    
    // Validar que no sea negativo
    if (this.montoDescuento < 0) {
      this.montoDescuento = 0;
    }

    // Calcular porcentaje
    if (this.subtotalBruto > 0) {
      this.porcentajeDescuento = (this.montoDescuento / this.subtotalBruto) * 100;
      
      // Validar máximo 10%
      if (this.porcentajeDescuento > 10) {
        this.errorDescuento = `El descuento supera el 10% permitido. Máximo: S/ ${(this.subtotalBruto * 0.10).toFixed(2)}`;
        this.montoDescuento = this.subtotalBruto * 0.10;
        this.porcentajeDescuento = 10;
      }
    }

    this.descuento = this.montoDescuento;
    this.ordenForm.patchValue({ porcentajeDescuento: this.porcentajeDescuento });
    this.calcularTotales();
  }

  // toggleDescuento - activa/desactiva descuento (por si se usa)
  toggleDescuento(): void {
    if (!this.aplicarDescuento) {
      this.abrirDescuento();
    } else {
      this.cancelarDescuento();
    }
  }

  // getTipoDiseno - obtiene el tipo de diseño seleccionado
  getTipoDiseno(servicio: ServicioFormulario): string {
    if (servicio.disenoEmpresa) return 'EMPRESA';
    if (servicio.disenoCliente) return 'CLIENTE';
    return 'SIN_DISENO';
  }

  // ✅ guardarOrden - guarda la orden con las 3 fechas correctamente
  guardarOrden(esCotizacion: boolean): void {
    if (this.serviciosAgregados.length === 0) {
      this.error = 'Debes agregar al menos un servicio a la orden';
      return;
    }

    if (this.ordenForm.invalid) {
      this.error = 'Por favor completa los campos requeridos';
      Object.keys(this.ordenForm.controls).forEach(key => {
        this.ordenForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.guardando = true;
    this.error = '';

    const request: CrearOrdenRequest = {
      idCliente: this.ordenForm.get('idCliente')?.value,
      idVendedor: this.ordenForm.get('idVendedor')?.value,
      // ✅ SOLO enviar fEntregaAcordada - fRecepcion se genera automáticamente en backend
      fEntregaAcordada: this.ordenForm.get('fEntregaAcordada')?.value || undefined,
      observaciones: this.ordenForm.get('observaciones')?.value || undefined,
      esCotizacion: esCotizacion,
      detalles: this.serviciosAgregados.map(servicio => ({
        idServicio: servicio.idServicio!,
        idMaterial: servicio.idMaterial!,
        idModelo: servicio.idModelo || undefined,
        cantidad: servicio.cantidad,
        ancho: servicio.ancho || undefined,
        alto: servicio.alto || undefined,
        descripcion: servicio.descripcion || undefined,
        tipoDiseno: this.getTipoDiseno(servicio),
        extras: servicio.extras
          .filter(e => e.idExtra !== null)
          .map(extra => ({
            idExtra: extra.idExtra!,
            idExtraDetalle: extra.idExtraDetalle || undefined,
            cantidad: extra.cantidad
          }))
      }))
    };

    // Agregar descuento si aplica
    if (this.aplicarDescuento && this.descuento > 0) {
      request.motivoDescuento = this.ordenForm.get('motivoDescuento')?.value;
      request.porcentajeDescuento = this.porcentajeDescuento;
      // Agregar idUsuarioDescuento del usuario actual si está disponible
      if (this.usuarioActual && (this.usuarioActual as any).id) {
        request.idUsuarioDescuento = (this.usuarioActual as any).id;
      }
    }

    console.log('📤 Enviando orden:', request);
    console.log('✅ Fecha de entrega acordada:', request.fEntregaAcordada);
    console.log('ℹ️ La fecha de registro se generará automáticamente en el backend');

    this.ordenService.crear(request).subscribe({
      next: (resultado) => {
        console.log('✅ Orden creada:', resultado);
        console.log('📅 Fecha de registro (backend):', resultado.fRecepcion);
        console.log('🤝 Fecha de entrega acordada:', resultado.fEntregaAcordada);
        
        this.guardando = false;
        alert(`✅ ${esCotizacion ? 'Cotización' : 'Orden'} creada exitosamente!\n\nNúmero: ${resultado.numeroOrden}\nFecha de registro: ${new Date().toLocaleString('es-PE')}`);
        this.router.navigate(['/ordenes/detalle', resultado.idOrden]);
      },
      error: (err) => {
        console.error('❌ Error al guardar orden:', err);
        this.error = err.error?.message || 'Error al guardar la orden';
        this.guardando = false;
      }
    });
  }

  // cancelar - cancela y vuelve a la lista
  cancelar(): void {
    if (confirm('¿Deseas cancelar? Se perderán los datos ingresados.')) {
      this.router.navigate(['/ordenes/lista']);
    }
  }
}