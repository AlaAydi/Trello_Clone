import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SuperAdminService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = environment.apiUrl + '/super-admin';

    private getHeaders() {
        const token = this.authService.user?.token;
        return new HttpHeaders({
            'Authorization': token ? `Bearer ${token}` : ''
        });
    }

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() });
    }

    approveUser(userId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/${userId}/approve`, {}, { headers: this.getHeaders() });
    }

    deleteUser(userId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${userId}`, { headers: this.getHeaders() });
    }

    createUser(user: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/users`, user, { headers: this.getHeaders() });
    }

    updateUser(userId: number, user: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${userId}`, user, { headers: this.getHeaders() });
    }

    getStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
    }
}
