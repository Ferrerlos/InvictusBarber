import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarModule, CalendarMonthViewDay } from 'angular-calendar'; // Importa CalendarMonthViewDay
import { startOfDay, addHours, isBefore, isSameDay, addMonths, subMonths } from 'date-fns'; // Importa las funciones necesarias
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment.service';
import { Appointment } from '../models/appointment.model';
import { countryCodes } from '../data/country-codes/country-codes'; // Importa la lista de países
import localeEs from '@angular/common/locales/es';
import { CapitalizeDatePipe } from '../capitalize-date.pipe/capitalize-date.pipe';
registerLocaleData(localeEs);

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    CapitalizeDatePipe
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }, DatePipe]
})
export class CalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  appointments: Appointment[] = [];
  dateSelected: boolean = false;
  selectedDate: Date | null = null;
  clientEmail: string = ''; // Agrega una propiedad para el correo electrónico del cliente
  clientPhone: string = ''; // Agrega una propiedad para el teléfono del cliente
  selectedCountry: any = countryCodes[0]; // País seleccionado por defecto (España)
  countryCodes = countryCodes; // Lista de países
  selectedAppointment: Appointment | null = null; // Agrega una propiedad para la cita seleccionada
  confirmationMessage: string = ''; // Agrega una propiedad para el mensaje de confirmación
  
  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  get fullPhoneNumber(): string {
    return `${this.selectedCountry.dial_code} ${this.clientPhone}`;
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe((appointments) => {
      this.events = appointments.map((appointment) => ({
        start: startOfDay(new Date(appointment.date)),
        title: appointment.title,
      }));
    });
  }

  onDayClicked({ day }: { day: CalendarMonthViewDay }): void {
    const formattedDate = this.formatDate(day.date);
    const currentDate = new Date();
    const ninePM = addHours(startOfDay(currentDate), 21);

    if (isBefore(currentDate, ninePM) || !isSameDay(day.date, currentDate)) {
      if (this.selectedDate && isSameDay(this.selectedDate, day.date)) {
        // Si se hace clic en el mismo día, no hacer nada
        return;
      }

      if (this.dateSelected) {
        this.closeAppointmentsList(() => {
          this.selectedDate = day.date;
          this.loadAppointmentsForDate(formattedDate);
        });
      } else {
        this.selectedDate = day.date;
        this.loadAppointmentsForDate(formattedDate);
      }
    } else {
      this.dateSelected = false;
    }
  }

  loadAppointmentsForDate(date: string): void {
    this.appointmentService.getAppointmentsByDate(date).subscribe((appointments) => {
      this.appointments = appointments.filter(appointment => appointment.status === 'Disponible');
      this.dateSelected = this.appointments.length > 0;
    });
  }

  closeAppointmentsList(callback: () => void): void {
    const appointmentsList = document.querySelector('.appointments-list');
    if (appointmentsList) {
      appointmentsList.classList.add('slide-out');
      appointmentsList.addEventListener('animationend', () => {
        appointmentsList.classList.remove('slide-out');
        callback();
      }, { once: true });
    } else {
      callback();
    }
  }

  onAppointmentClick(appointment: Appointment): void {
    this.selectedAppointment = appointment; // Selecciona la cita en lugar de reservarla directamente
    const appointmentSummary = document.querySelector('.appointment-summary');
    if (appointmentSummary) {
      appointmentSummary.classList.add('active');
    }
  }

  confirmAppointment(): void {
    if (this.clientEmail && this.clientPhone && this.selectedAppointment) {
      this.appointmentService.updateAppointmentStatus(this.selectedAppointment.id, 'Reservado', this.clientEmail, this.fullPhoneNumber).subscribe(() => {
        if (this.selectedAppointment) {
          this.selectedAppointment.status = 'Reservado';
          this.appointments = this.appointments.filter(a => a.id !== this.selectedAppointment?.id);
          this.selectedAppointment = null; // Resetea la cita seleccionada después de confirmar
          this.confirmationMessage = 'Cita confirmada con éxito. Revise su buzón de mensajes, o posiblemente en spam. Para cualquier duda, modificación, o si quiere cancelar, lo tiene todo en dicho mail.';
        }
      });
    } else {
      alert('Please enter your email address and phone number.');
    }
  }

  previousMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}