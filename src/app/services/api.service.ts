import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string) {
    return firstValueFrom(this.http.get<T>(`${this.baseUrl}/${endpoint}`));
  }

  post<T>(endpoint: string, body: any) {
    return firstValueFrom(this.http.post<T>(`${this.baseUrl}/${endpoint}`, body));
  }

  put<T>(endpoint: string, body: any) {
    return firstValueFrom(this.http.put<T>(`${this.baseUrl}/${endpoint}`, body));
  }

  delete<T>(endpoint: string) {
    return firstValueFrom(this.http.delete<T>(`${this.baseUrl}/${endpoint}`));
  }

  patch<T>(endpoint: string, body: any) {
    return firstValueFrom(this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body));
  }
}
