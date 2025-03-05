import { Routes } from '@angular/router';
import { AlumnosComponent } from './components/alumnos/alumnos.component';
import { MembresiasComponent } from './components/membresias/membresias.component';
import { InicioComponent } from './components/inicio/inicio.component';

export const appRoutes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'alumnos', component: AlumnosComponent },
  { path: 'membresias', component: MembresiasComponent },
  { path: '', component: InicioComponent }
];
