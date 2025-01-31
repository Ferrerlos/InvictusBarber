import { Routes } from '@angular/router';
import { ConfirmComponent } from './pages/confirm/confirm.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [

    { path: '', component: HomeComponent },
    { path: 'confirm/:id', component: ConfirmComponent },

];
