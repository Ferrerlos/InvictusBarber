import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Importar Router
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  message: string = '';
  changeId: string | null = null; // Cambiar appointmentId a changeId
  newDate: string = '';
  newTime: string = ''; // Agregar la propiedad newTime
  availableTimes: string[] = []; // Agrega una propiedad para los horarios disponibles
  showOptions: boolean = true; // Propiedad para mostrar/ocultar opciones
  email: string = ''; // Agregar la propiedad email
  phone: string = ''; // Agregar la propiedad phone

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {} // Inyectar Router

  ngOnInit(): void {
    this.changeId = this.route.snapshot.paramMap.get('id'); // Cambiar appointmentId a changeId
  }

  onDateChange(): void {
    if (this.newDate) {
      this.http.get<any[]>(`http://localhost:3001/appointments/${this.newDate}`).subscribe({
        next: (times) => {
          this.availableTimes = times.map(time => time.time); // Asegurarse de que los tiempos sean cadenas de texto
        },
        error: () => {
          this.message = 'Hubo un error al cargar los horarios disponibles.';
        }
      });
    }
  }

  modifyAppointment(): void {
    this.http.put(`http://localhost:3001/confirm/${this.changeId}`, { action: 'modify', newDate: this.newDate, newTime: this.newTime, email: this.email, phone: this.phone }).subscribe({
      next: (response: any) => {
        this.message = response.message;
        this.showOptions = false; // Ocultar opciones
        setTimeout(() => {
          this.router.navigate(['/']); // Redirigir al home después de 2 segundos
        }, 6000);
      },
      error: (error) => {
        this.message = error.error || 'Hubo un error al modificar su cita.';
      }
    });
  }

  cancelAppointment(): void {
    this.http.put(`http://localhost:3001/confirm/${this.changeId}`, { action: 'cancel', email: this.email }).subscribe({
      next: (response: any) => {
        this.message = response.message;
        this.showOptions = false; // Ocultar opciones
        setTimeout(() => {
          this.router.navigate(['/']); // Redirigir al home después de 2 segundos
        }, 6000);
      },
      error: (error) => {
        this.message = error.error || 'Hubo un error al cancelar su cita.';
      }
    });
  }
}