import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:3001/appointments';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/${date}`).pipe(
      catchError(this.handleError)
    );
  }

  updateAppointmentStatus(id: number, status: string, email: string, phone: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { status, email, phone }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error!';
    if (error.error && error.error.message) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}