import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private apiUrl = environment.apiUrl;
  private authToken = 'Bearer master123';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', this.authToken);
  }

  obtenerAlumnos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/alumnos`);
  }

  obtenerAlertas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/alumnos/alertas`);
  }

  agregarAlumno(alumno: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/alumnos`, alumno, { headers });
  }

  actualizarAlumno(id: number, alumno: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/alumnos/${id}`, alumno, { headers });
  }

  eliminarAlumno(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/alumnos/${id}`, { headers });
  }

  buscarAlumnos(termino: string): Observable<any[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<any[]>(`${this.apiUrl}/alumnos/buscar`, { params });
  }  

  // login(password: string): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/login`, { password });
  // }
}
