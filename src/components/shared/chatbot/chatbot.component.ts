import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Mensaje {
  texto: string;
  esUsuario: boolean;
  hora: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('inputMensaje') inputMensaje!: ElementRef;

  abierto = false;
  mensajeUsuario = '';
  mensajes: Mensaje[] = [];
  escribiendo = false;

  private apiUrl = `${environment.apiUrl}/chatbot`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Mensaje de bienvenida
    this.agregarMensajeBot('¡Hola! 👋 Soy el asistente de Gigantografías UV. ¿En qué puedo ayudarte?');
  }

  toggleChat(): void {
    this.abierto = !this.abierto;
    if (this.abierto) {
      setTimeout(() => {
        this.inputMensaje?.nativeElement?.focus();
        this.scrollToBottom();
      }, 100);
    }
  }

  enviarMensaje(): void {
    const texto = this.mensajeUsuario.trim();
    if (!texto) return;

    // Agregar mensaje del usuario
    this.agregarMensajeUsuario(texto);
    this.mensajeUsuario = '';
    this.escribiendo = true;

    // Enviar al backend
    this.http.post<{ respuesta: string }>(`${this.apiUrl}/consultar`, { mensaje: texto })
      .subscribe({
        next: (response) => {
          this.escribiendo = false;
          this.agregarMensajeBot(response.respuesta);
        },
        error: (err) => {
          this.escribiendo = false;
          console.error('Error chatbot:', err);
          this.agregarMensajeBot('Lo siento, hubo un error al procesar tu consulta. Intenta de nuevo.');
        }
      });
  }

  private agregarMensajeUsuario(texto: string): void {
    this.mensajes.push({
      texto,
      esUsuario: true,
      hora: this.obtenerHora()
    });
    this.scrollToBottom();
  }

  private agregarMensajeBot(texto: string): void {
    this.mensajes.push({
      texto,
      esUsuario: false,
      hora: this.obtenerHora()
    });
    this.scrollToBottom();
  }

  private obtenerHora(): string {
    return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  limpiarHistorial(): void {
    this.mensajes = [];
    this.agregarMensajeBot('¡Hola! 👋 Soy el asistente de Gigantografías UV. ¿En qué puedo ayudarte?');
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }
}