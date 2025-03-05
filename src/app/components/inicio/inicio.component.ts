import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient, private router: Router) {}


  ingresar() {
    this.router.navigate(['/alumnos']);
  }
}

//   ingresar() {
//     Swal.fire({
//       title: 'Iniciar Sesión',
//       html: `
//         <input id="swal-username" class="swal2-input" placeholder="Usuario">
//         <input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña">
//       `,
//       confirmButtonText: 'Ingresar',
//       confirmButtonColor: '#0d6efd',
//       showCancelButton: true,
//       cancelButtonText: 'Cancelar',
//       cancelButtonColor: '#dc3545',
//       allowOutsideClick: false,
//       preConfirm: () => {
//         if (typeof document !== 'undefined') {
//           const username = (document.getElementById('swal-username') as HTMLInputElement).value;
//           const password = (document.getElementById('swal-password') as HTMLInputElement).value;

//           if (!username || !password) {
//             Swal.showValidationMessage('Todos los campos son obligatorios');
//             return false;
//           }
//           return { username, password };
//         }
//         return false;
//       }
//     }).then((result) => {
//       if (result.isConfirmed && result.value) {
//         const { username, password } = result.value; // Destructure the value
//         this.http.post(`${this.apiUrl}/login`, { username, password }).subscribe({
//           next: (response) => {
//             Swal.fire('Éxito', 'Inicio de sesión correcto', 'success');
//             this.router.navigate(['/alumnos']);
//           },
//           error: (error) => {
//             let errorMessage = 'Ocurrió un error inesperado'; // Default message
//             if (error.status === 401) {
//               errorMessage = 'Usuario o contraseña incorrectos';
//             } else if (error.status === 0) {
//               errorMessage = 'No se pudo conectar con el servidor';
//             }
//             Swal.fire('Error', errorMessage, 'error');
//             console.error('Error de inicio de sesión:', error);
//           }
//         });
//       }
//     });
//   }
// }