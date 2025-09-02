import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly BASE_URL = 'https://africode8.onrender.com';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') ?? '' : '';
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.BASE_URL}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  get<T>(endpoint: string, options?: { params?: any }): Observable<T> {
    return this.http.get<T>(`${this.BASE_URL}/${endpoint}`, {
      headers: this.getHeaders(),
      ...options
    });
  }

  /** File upload with progress */
  postMultipart(endpoint: string, formData: FormData): Observable<HttpEvent<any>> {
    const req = new HttpRequest('POST', `${this.BASE_URL}/${endpoint}`, formData, {
      headers: this.getHeaders(), // DO NOT set Content-Type manually
      reportProgress: true,
    });
    return this.http.request(req);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.BASE_URL}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.BASE_URL}/${endpoint}`, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }
}
