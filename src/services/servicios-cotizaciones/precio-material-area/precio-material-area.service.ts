import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PrecioMaterialAreaDTO {
  idPrecioArea?: number;
  idServicio: number;
  idMaterial: number;
  precioM2: number;
  unidadMedida?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrecioMaterialAreaService {
  private apiUrl = `${environment.apiUrl}/precios-material-area`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<PrecioMaterialAreaDTO[]> {
    return this.http.get<PrecioMaterialAreaDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<PrecioMaterialAreaDTO> {
    return this.http.get<PrecioMaterialAreaDTO>(`${this.apiUrl}/${id}`);
  }

  obtenerPorServicio(idServicio: number): Observable<PrecioMaterialAreaDTO[]> {
    return this.http.get<PrecioMaterialAreaDTO[]>(`${this.apiUrl}/servicio/${idServicio}`);
  }

  obtenerPorMaterial(idMaterial: number): Observable<PrecioMaterialAreaDTO[]> {
    return this.http.get<PrecioMaterialAreaDTO[]>(`${this.apiUrl}/material/${idMaterial}`);
  }

  obtenerPorServicioYMaterial(idServicio: number, idMaterial: number): Observable<PrecioMaterialAreaDTO[]> {
    return this.http.get<PrecioMaterialAreaDTO[]>(`${this.apiUrl}/servicio/${idServicio}/material/${idMaterial}`);
  }

  crear(dto: PrecioMaterialAreaDTO): Observable<PrecioMaterialAreaDTO> {
    return this.http.post<PrecioMaterialAreaDTO>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: PrecioMaterialAreaDTO): Observable<PrecioMaterialAreaDTO> {
    return this.http.put<PrecioMaterialAreaDTO>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}