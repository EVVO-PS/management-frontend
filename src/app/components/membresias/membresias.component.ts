import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlumnoService } from '../../service/alumno.service';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-membresias',
  templateUrl: './membresias.component.html',
  styleUrls: ['./membresias.component.css']
})
export class MembresiasComponent implements OnInit {
  alumnos: any[] = [];
  alumnosFiltrados: any[] = [];
  filtro: string = '';
  alumnoSeleccionado: any = null;
  contactoEmergencia: any = null;

  constructor(
    private alumnoService: AlumnoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  cargarAlumnos(): void {
    this.alumnoService.obtenerAlumnos().subscribe(
      (data) => {
        this.alumnos = this.procesarAlumnos(data);
        this.alumnosFiltrados = [...this.alumnos];
      },
      (error) => {
        console.error('Error al cargar alumnos', error);
      }
    );
  }

  procesarAlumnos(alumnos: any[]): any[] {
    return alumnos.map(alumno => ({
      ...alumno,
      documento: alumno.documento || 'Sin documento',
      diasRestantes: this.calcularDiasRestantes(alumno.membresia_vencimiento),
      diasAbonados: this.calcularDiasAbonados(alumno.fecha_inscripcion, alumno.membresia_vencimiento),
      editando: false,
      telefono_emergencia: {
        nombre_contacto: alumno.telefono_emergencia?.nombre_contacto || 'No disponible',
        telefono: alumno.telefono_emergencia?.telefono || 'No disponible',
        relacion: alumno.telefono_emergencia?.relacion || 'No disponible'
      },
      domicilio: {
        calle: alumno.domicilio?.calle || 'No disponible'
      }
    }));
  }

  calcularDiasRestantes(fechaVencimiento: string): number {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diferencia / (1000 * 3600 * 24)));
  }

  calcularDiasAbonados(fechaInscripcion: string, fechaVencimiento: string): number {
    const inscripcion = new Date(fechaInscripcion);
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = vencimiento.getTime() - inscripcion.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  volverAAlumnos(): void {
    this.router.navigate(['/alumnos']);
  }

  abrirBuscador(): void {
    Swal.fire({
      title: 'Buscar Alumno',
      input: 'text',
      inputPlaceholder: 'Ingrese nombre o documento',
      showCancelButton: true,
      confirmButtonText: 'Buscar',
      showLoaderOnConfirm: true,
      preConfirm: (termino) => {
        return this.alumnoService.buscarAlumnos(termino).toPromise()
          .then(response => {
            if (!response || response.length === 0) {
              throw new Error('No se encontraron alumnos');
            }
            return response;
          })
          .catch(error => {
            Swal.showValidationMessage(`Error en la búsqueda: ${error}`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.alumnosFiltrados = this.procesarAlumnos(result.value); // Procesa y actualiza la lista de alumnos filtrados
        if (this.alumnosFiltrados.length === 1) {
          Swal.fire('Éxito', 'Se encontró 1 alumno', 'success');
        } else {
          Swal.fire('Éxito', `Se encontraron ${this.alumnosFiltrados.length} alumnos`, 'success');
        }
      }
    });
  }

  limpiarBusqueda(): void {
    this.alumnosFiltrados = [...this.alumnos]; // Restablece la lista completa de alumnos
    Swal.fire('Búsqueda limpiada', 'Se muestran todos los alumnos', 'info');
  }

  habilitarEdicion(alumno: any): void {
    Swal.fire({
      title: 'Ingrese el token de autorización',
      input: 'password',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Autorizar',
      showLoaderOnConfirm: true,
      preConfirm: (token) => {
        if (token !== 'master123') {
          Swal.showValidationMessage('Token incorrecto');
        }
        return token;
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        alumno.editando = true;
        alumno.backup = { ...alumno }; // Guarda una copia de respaldo del alumno
      }
    });
  }

  cancelarEdicion(alumno: any): void {
    Object.assign(alumno, alumno.backup); // Restaura los datos del alumno desde la copia de respaldo
    delete alumno.backup; // Elimina la copia de respaldo
    alumno.editando = false;
  }


  actualizarFechaVencimiento(alumno: any): void {
    if (alumno.editando) {
      const fechaInscripcion = new Date(alumno.fecha_inscripcion);
      fechaInscripcion.setDate(fechaInscripcion.getDate() + alumno.diasAbonados);
      alumno.membresia_vencimiento = fechaInscripcion.toISOString().split('T')[0];
      alumno.diasRestantes = this.calcularDiasRestantes(alumno.membresia_vencimiento);
    }
  }

  guardarCambios(alumno: any): void {
    this.actualizarFechaVencimiento(alumno);
    this.alumnoService.actualizarAlumno(alumno.id, alumno).subscribe(
      (response) => {
        Swal.fire('Éxito', 'Alumno actualizado correctamente', 'success');
        alumno.editando = false;
        this.cargarAlumnos(); // Recargar los datos para asegurar que todo esté actualizado
      },
      (error) => {
        console.error('Error al actualizar alumno', error);
        Swal.fire('Error', 'No se pudo actualizar el alumno', 'error');
        // Revertir cambios si hay un error
        alumno.fecha_inscripcion = alumno.fechaInscripcionOriginal;
        alumno.diasAbonados = alumno.diasAbonadosOriginal;
        delete alumno.backup; // Elimina la copia de respaldo
        alumno.editando = false;
        this.actualizarFechaVencimiento(alumno);
      }
    );
  }

  darDeBaja(alumno: any): void {
    Swal.fire({
      title: 'Ingrese el token de autorización',
      input: 'password',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Autorizar',
      showLoaderOnConfirm: true,
      preConfirm: (token) => {
        if (token !== 'master123') {
          Swal.showValidationMessage('Token incorrecto');
        }
        return token;
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.alumnoService.eliminarAlumno(alumno.id).subscribe(
          (response) => {
            Swal.fire('Éxito', 'Alumno dado de baja correctamente', 'success');
            this.cargarAlumnos();
          },
          (error) => {
            console.error('Error al dar de baja al alumno', error);
            Swal.fire('Error', 'No se pudo dar de baja al alumno', 'error');
          }
        );
      }
    });
  }

  mostrarContactoEmergencia(alumno: any): void {
    console.log('Datos del alumno:', alumno);

    this.contactoEmergencia = {
      nombre_contacto: alumno.telefono_emergencia?.nombre_contacto || 'No disponible',
      telefono: alumno.telefono_emergencia?.telefono || 'No disponible',
      relacion: alumno.telefono_emergencia?.relacion || 'No disponible',
      domicilio: {
        calle: alumno.domicilio?.calle || 'No disponible'
      }
    };

    console.log('Contacto de emergencia:', this.contactoEmergencia);

    if (typeof document !== 'undefined') {
      const modalElement = document.getElementById('contactoEmergenciaModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      } else {
        console.error('Modal element not found');
      }
    }
  }
}