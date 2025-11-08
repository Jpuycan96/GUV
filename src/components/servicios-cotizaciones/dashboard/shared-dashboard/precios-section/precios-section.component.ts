import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { PrecioEscalaService, PrecioEscalaDTO } from '../../../../../services/servicios-cotizaciones/precio-escala/precio-escala.service';
import { PrecioMaterialAreaService, PrecioMaterialAreaDTO } from '../../../../../services/servicios-cotizaciones/precio-material-area/precio-material-area.service';
import { MaterialService, MaterialDTO } from '../../../../../services/servicios-cotizaciones/material/material.service';
import { ModeloService, ModeloDTO } from '../../../../../services/servicios-cotizaciones/modelo/modelo.service';
import { PrecioEscalaModalComponent } from '../../../components/precio-escala/precio-escala-modal/precio-escala-modal.component';
import { PrecioMaterialAreaModalComponent } from '../../../components/precio-material-area/precio-material-area-modal/precio-material-area-modal.component';

// Interfaz unificada para mostrar en la tabla
interface PrecioUnificado {
  id: number;
  tipo: 'escala' | 'area';
  material: string;
  modelo?: string;
  rango?: string;
  precio: string;
  unidad: string | undefined;
  precioOriginal: PrecioEscalaDTO | PrecioMaterialAreaDTO;
}

@Component({
  selector: 'app-precios-section',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './precios-section.component.html',
  styleUrl: './precios-section.component.css'
})
export class PreciosSectionComponent implements OnInit {
  // idServicio - ID del servicio actual (recibido del padre)
  @Input() idServicio: number | null = null;

  // listas de precios
  preciosEscala: PrecioEscalaDTO[] = [];
  preciosMaterialArea: PrecioMaterialAreaDTO[] = [];
  
  // lista unificada para mostrar
  preciosUnificados: PrecioUnificado[] = [];

  // mapas para nombres (para mostrar en tabla)
  materialesMap: Map<number, string> = new Map();
  modelosMap: Map<number, string> = new Map();

  // columnas de la tabla
  columnasTabla: string[] = ['tipo', 'material', 'modelo', 'rango', 'precio', 'acciones'];

  // bandera de loading
  cargando: boolean = false;

  // mensaje de error
  error: string = '';

  constructor(
    private precioEscalaService: PrecioEscalaService,
    private precioMaterialAreaService: PrecioMaterialAreaService,
    private materialService: MaterialService,
    private modeloService: ModeloService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // cargar precios cuando el componente se inicializa
    if (this.idServicio) {
      this.cargarDatos();
    }
  }

  // cargarDatos - obtiene materiales, modelos y precios
  async cargarDatos(): Promise<void> {
    this.cargando = true;
    this.error = '';

    try {
      // cargar materiales y modelos primero
      await this.cargarMaterialesYModelos();
      
      // luego cargar precios
      await this.cargarPrecios();
      
      // unificar precios para mostrar
      this.unificarPrecios();
      
      this.cargando = false;
    } catch (err) {
      console.error('Error al cargar datos:', err);
      this.error = 'Error al cargar los datos';
      this.cargando = false;
    }
  }

  // cargarMaterialesYModelos - carga materiales y modelos para mapear nombres
  async cargarMaterialesYModelos(): Promise<void> {
    return new Promise((resolve, reject) => {
      // cargar materiales
      this.materialService.obtenerPorServicio(this.idServicio!).subscribe({
        next: (materiales) => {
          materiales.forEach(m => {
            if (m.idMaterial) {
              this.materialesMap.set(m.idMaterial, m.nombre);
            }
          });

          // cargar modelos de cada material
          const promesasModelos = materiales.map(m => 
            this.modeloService.obtenerPorMaterial(m.idMaterial!).toPromise()
          );

          Promise.all(promesasModelos).then(resultados => {
            resultados.forEach(modelos => {
              modelos?.forEach(modelo => {
                if (modelo.idModelo) {
                  this.modelosMap.set(modelo.idModelo, modelo.codigo);
                }
              });
            });
            resolve();
          });
        },
        error: reject
      });
    });
  }

  // cargarPrecios - obtiene lista de precios del servicio
  async cargarPrecios(): Promise<void> {
    return new Promise((resolve, reject) => {
      let completados = 0;
      const total = 2;

      const verificarCompletado = () => {
        completados++;
        if (completados === total) resolve();
      };

      // cargar precios de escala
      this.precioEscalaService.obtenerPorServicio(this.idServicio!).subscribe({
        next: (precios) => {
          this.preciosEscala = precios;
          verificarCompletado();
        },
        error: (err) => {
          console.error('Error al cargar precios de escala:', err);
          verificarCompletado();
        }
      });

      // cargar precios por área
      this.precioMaterialAreaService.obtenerPorServicio(this.idServicio!).subscribe({
        next: (precios) => {
          this.preciosMaterialArea = precios;
          verificarCompletado();
        },
        error: (err) => {
          console.error('Error al cargar precios por área:', err);
          verificarCompletado();
        }
      });
    });
  }

  // unificarPrecios - combina ambos tipos de precios en una lista
  unificarPrecios(): void {
    this.preciosUnificados = [];

    // agregar precios de escala
    this.preciosEscala.forEach(precio => {
      const materialNombre = this.materialesMap.get(precio.idMaterial) || 'Material desconocido';
      const modeloNombre = precio.idModelo ? this.modelosMap.get(precio.idModelo) : undefined;
      
      const rango = precio.cantidadMax 
        ? `${precio.cantidadMin} - ${precio.cantidadMax}`
        : `${precio.cantidadMin}+`;

      this.preciosUnificados.push({
        id: precio.idPrecioEscala!,
        tipo: 'escala',
        material: materialNombre,
        modelo: modeloNombre,
        rango: rango,
        precio: `${precio.precioUnitario}`,
        unidad: precio.unidadMedida,
        precioOriginal: precio
      });
    });

    // agregar precios por área
    this.preciosMaterialArea.forEach(precio => {
      const materialNombre = this.materialesMap.get(precio.idMaterial) || 'Material desconocido';

      this.preciosUnificados.push({
        id: precio.idPrecioArea!,
        tipo: 'area',
        material: materialNombre,
        modelo: undefined,
        rango: '—',
        precio: `${precio.precioM2}`,
        unidad: precio.unidadMedida,
        precioOriginal: precio
      });
    });
  }

  // abrirModalEscala - abre modal para crear/editar precio de escala
  abrirModalEscala(precio?: PrecioEscalaDTO): void {
    const dialogRef = this.dialog.open(PrecioEscalaModalComponent, {
      width: '700px',
      data: { precio, idServicio: this.idServicio }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.cargarDatos();
      }
    });
  }

  // abrirModalArea - abre modal para crear/editar precio por área
  abrirModalArea(precio?: PrecioMaterialAreaDTO): void {
    const dialogRef = this.dialog.open(PrecioMaterialAreaModalComponent, {
      width: '600px',
      data: { precio, idServicio: this.idServicio }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.cargarDatos();
      }
    });
  }

  // editarPrecio - abre modal de edición según tipo
  editarPrecio(precioUnificado: PrecioUnificado): void {
    if (precioUnificado.tipo === 'escala') {
      this.abrirModalEscala(precioUnificado.precioOriginal as PrecioEscalaDTO);
    } else {
      this.abrirModalArea(precioUnificado.precioOriginal as PrecioMaterialAreaDTO);
    }
  }

  // eliminarPrecio - elimina un precio según tipo
  eliminarPrecio(precioUnificado: PrecioUnificado): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este precio?')) {
      return;
    }

    if (precioUnificado.tipo === 'escala') {
      this.precioEscalaService.eliminar(precioUnificado.id).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error al eliminar precio de escala:', err);
          this.error = 'Error al eliminar el precio de escala';
        }
      });
    } else {
      this.precioMaterialAreaService.eliminar(precioUnificado.id).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error al eliminar precio por área:', err);
          this.error = 'Error al eliminar el precio por área';
        }
      });
    }
  }

  // recargar - recarga la lista de precios
  recargar(): void {
    this.cargarDatos();
  }

  // obtenerColorTipo - retorna el color del chip según tipo
  obtenerColorTipo(tipo: string) {
    return tipo === 'escala' ? 'primary' : 'accent';
  }

  // obtenerTextoTipo - retorna el texto del chip según tipo
  obtenerTextoTipo(tipo: string) {
    return tipo === 'escala' ? 'Escala' : 'Área';
  }
}