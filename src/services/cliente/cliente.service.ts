import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClienteDTO {
  idCliente?: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ruc?: string;
  razonSocial?: string;
  enabled: boolean;
}

export interface CrearClienteDTO {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ruc?: string;
  razonSocial?: string;
}

export interface ActualizarClienteDTO {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ruc?: string;
  razonSocial?: string;
}

// Alias para compatibilidad con código existente
export type Cliente = ClienteDTO;

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  // Listar todos los clientes
  listar(): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(this.apiUrl);
  }

  // Alias para compatibilidad
  getClientes(): Observable<ClienteDTO[]> {
    return this.listar();
  }

  // Alias para compatibilidad con orden-form
  obtenerTodos(): Observable<ClienteDTO[]> {
    return this.listar();
  }

  // Listar clientes habilitados
  listarHabilitados(): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(`${this.apiUrl}/habilitados`);
  }

  // Obtener cliente por ID
  obtenerPorId(id: number): Observable<ClienteDTO> {
    return this.http.get<ClienteDTO>(`${this.apiUrl}/${id}`);
  }

  // Alias para compatibilidad
  getCliente(id: number): Observable<ClienteDTO> {
    return this.obtenerPorId(id);
  }

  // Crear nuevo cliente
  crear(dto: CrearClienteDTO): Observable<ClienteDTO> {
    return this.http.post<ClienteDTO>(this.apiUrl, dto);
  }

  // Alias para compatibilidad
  createCliente(dto: CrearClienteDTO): Observable<ClienteDTO> {
    return this.crear(dto);
  }

  // Actualizar cliente
  actualizar(id: number, dto: ActualizarClienteDTO): Observable<ClienteDTO> {
    return this.http.put<ClienteDTO>(`${this.apiUrl}/${id}`, dto);
  }

  // Alias para compatibilidad (recibe objeto completo)
  updateCliente(cliente: ClienteDTO): Observable<ClienteDTO> {
    const dto: ActualizarClienteDTO = {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      ruc: cliente.ruc,
      razonSocial: cliente.razonSocial
    };
    return this.actualizar(cliente.idCliente!, dto);
  }

  // Habilitar cliente
  habilitar(id: number): Observable<ClienteDTO> {
    return this.http.patch<ClienteDTO>(`${this.apiUrl}/${id}/habilitar`, {});
  }

  // Deshabilitar cliente
  deshabilitar(id: number): Observable<ClienteDTO> {
    return this.http.patch<ClienteDTO>(`${this.apiUrl}/${id}/deshabilitar`, {});
  }

  // Eliminar cliente
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Alias para compatibilidad
  deleteCliente(id: number): Observable<void> {
    return this.eliminar(id);
  }
}