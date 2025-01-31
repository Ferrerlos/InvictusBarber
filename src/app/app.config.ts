import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { CalendarModule, DateAdapter } from 'angular-calendar'; // Importa DateAdapter
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns'; // Importa adapterFactory

// Registrar los datos de localización para el idioma español
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }) // Proveer DateAdapter
    ),
    provideHttpClient(withFetch(), withInterceptorsFromDi())
  ]
};