import { Component, OnInit } from '@angular/core';
import { AlumnoService } from '../../service/alumno.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-alertas',
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.css']
})
export class AlertasComponent implements OnInit {
  constructor(private alumnoService: AlumnoService) {}

  ngOnInit(): void {
    this.verificarMembresiaVencidas();
  }

  verificarMembresiaVencidas(): void {
    this.alumnoService.obtenerAlertas().subscribe(
      (alertas) => {
        if (alertas.length > 0) {
          const vencidas = alertas.filter(a => a.estado === 'VENCIDO');
          if (vencidas.length > 0) {
            this.mostrarAlerta(vencidas.length);
          }
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
}