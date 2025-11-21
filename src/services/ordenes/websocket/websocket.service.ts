import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

// ========== INTERFACES (MODELOS) ==========

export interface NotificacionDTO {
  tipo: 'NUEVO_PROCESO' | 'PROCESO_COMPLETADO' | 'ALERTA';
  idOrdenProceso?: number;
  numeroOrden?: string;
  nombreServicio?: string;
  nombreProceso?: string;
  prioridad?: string;
  mensaje: string;
  timestamp?: string;
}

// ========== SERVICE ==========

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: any = null;
  private notificacionesSubject = new Subject<NotificacionDTO>();
  
  public notificaciones$: Observable<NotificacionDTO> = this.notificacionesSubject.asObservable();
  
  private conectado = false;

  constructor() {}

  // Conectar al WebSocket (lo implementaremos después de instalar dependencias)
  connect(): void {
    console.log('⚠️ WebSocket: Pendiente de implementación completa');
    // TODO: Implementar con SockJS + STOMP después de instalar
  }

  // Desconectar WebSocket
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.conectado = false;
      console.log('🔌 WebSocket desconectado');
    }
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.conectado;
  }

  // Simular notificación (para pruebas)
  simularNotificacion(notificacion: NotificacionDTO): void {
    this.notificacionesSubject.next(notificacion);
  }
}