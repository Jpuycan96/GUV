import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoEventService {
  
  // Subject para notificar cuando se registra un pago
  private pagoRegistradoSource = new Subject<void>();
  
  // Observable que los componentes pueden suscribirse
  pagoRegistrado$ = this.pagoRegistradoSource.asObservable();
  
  // Método para notificar que se registró un pago
  notificarPagoRegistrado(): void {
    this.pagoRegistradoSource.next();
  }
}