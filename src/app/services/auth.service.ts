import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private _user: any = null;
    private apiUrl = environment.apiUrl + '/auth';

    constructor() {
        const savedUser = localStorage.getItem('trello_user');
        if (savedUser) {
            this._user = JSON.parse(savedUser);
        }
    }

    get user() {
        return this._user;
    }

    get isLoggedIn(): boolean {
        return !!this._user;
    }

    get isTechLead(): boolean {
        return this._user?.role === 'TECH_LEAD';
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
            tap(response => {
                const userData = {
                    email,
                    token: response.accessToken,
                    role: response.role,
                    fullName: response.fullName
                };
                this._user = userData;
                localStorage.setItem('trello_user', JSON.stringify(userData));
            })
        );
    }

    signUp(fullName: string, email: string, password: string, role: string = 'developer'): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, { fullName, email, password, role });
    }

    logout() {
        this._user = null;
        localStorage.removeItem('trello_user');
    }
}
