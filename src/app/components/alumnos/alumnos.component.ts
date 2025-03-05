import { Component, OnInit } from '@angular/core';
import { AlumnoService } from '../../service/alumno.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-alumnos',
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  alumno = {
    nombre: '',
    documento: null,
    email: '',
    telefono: '',
    membresia: '30',
    fecha_inscripcion: new Date().toISOString().split('T')[0],
    domicilio: {
      calle: '',
    },
    telefono_emergencia: {
      nombre_contacto: '',
      telefono: '',
      relacion: ''
    }
  }
  constructor(private alumnoService: AlumnoService, private router: Router) {}

  ngOnInit(): void {
    this.verificarMembresiasVencidas();
  }

  verMembresias(): void {
    this.router.navigate(['/membresias']);
  }

  registrarAlumno() {
    if (!this.alumno.documento || isNaN(this.alumno.documento)) {
      Swal.fire({
        title: 'Error',
        text: 'El documento es obligatorio y debe ser un número.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    const fechaInscripcion = new Date(this.alumno.fecha_inscripcion);
    const fechaVencimiento = new Date(fechaInscripcion);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + parseInt(this.alumno.membresia));

    const alumnoData = {
      ...this.alumno,
      membresia_vencimiento: fechaVencimiento.toISOString().split('T')[0],
      domicilio: {
        calle: this.alumno.domicilio.calle
      },
      telefono_emergencia: {
        nombre_contacto: this.alumno.telefono_emergencia.nombre_contacto,
        telefono: this.alumno.telefono_emergencia.telefono,
        relacion: this.alumno.telefono_emergencia.relacion
      }
    };

    this.alumnoService.agregarAlumno(alumnoData).subscribe(
      (response) => {
        console.log("Alumno registrado:", response);
        Swal.fire({
          title: 'Éxito',
          text: 'Alumno registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#0d6efd'

        });
        this.limpiarFormulario();
      },
      (error) => {
        console.error("Error al registrar alumno:", error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar el alumno. Por favor, intente de nuevo.',
          icon: 'error',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#dc3545'

        });
      }
    );
  }

  limpiarFormulario() {
    this.alumno = {
      nombre: '',
      documento: null,
      email: '',
      telefono: '',
      membresia: '30',
      fecha_inscripcion: new Date().toISOString().split('T')[0],
      domicilio: {
        calle: '',
      },
      telefono_emergencia: {
        nombre_contacto: '',
        telefono: '',
        relacion: ''
      }
    };
  }

  verificarMembresiaVencidas(): void {
    this.alumnoService.obtenerAlertas().subscribe(
      (alertas) => {
        const vencidas = alertas.filter(a => a.estado === 'VENCIDO');
        if (vencidas.length > 0) {
          this.mostrarAlerta(vencidas.length);
        }
      },
      (error) => {
        console.error('Error al obtener alertas', error);
      }
    );
  }

  mostrarAlerta(cantidad: number): void {
    Swal.fire({
      title: '¡Atención!',
      text: `Hay ${cantidad} alumno(s) con membresía vencida.`,
      icon: 'warning',
      confirmButtonText: 'Entendido'
    });
  }

  cerrarSesion() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Seguro que deseas salir?',
      icon: 'warning',
      iconColor: '#dc3545',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      confirmButtonColor: '#0d6efd',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/inicio']); 
        Swal.fire('Sesión cerrada', 'Has salido del sistema.', 'success');
      }
    });
  }
  verificarMembresiasVencidas(): void {
    this.alumnoService.obtenerAlumnos().subscribe(
      (data) => {
        const alumnosConMembresiaVencida = data.filter(alumno => {
          const fechaVencimiento = new Date(alumno.membresia_vencimiento);
          return fechaVencimiento < new Date();
        });

        if (alumnosConMembresiaVencida.length > 0) {
          setTimeout(() => {
            Swal.fire({
              title: 'Alerta',
              text: `Hay ${alumnosConMembresiaVencida.length} alumnos con membresía vencida.`,
              icon: 'warning',
              confirmButtonText: 'Ok',
              confirmButtonColor: '#0d6efd'
            });
          }, 100);
        }
      },
      (error) => {
        console.error('Error al verificar membresías vencidas', error);
      }
    );
  }

}