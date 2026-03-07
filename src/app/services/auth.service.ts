import { Injectable } from '@angular/core';
import { delay, of, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _user: any = null;

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

    login(email: string, password: string): Observable<any> {
        // Simulating API call
        return of({ id: '1', email, fullName: 'Demo User' }).pipe(
            delay(1500),
            tap(user => {
                this._user = user;
                localStorage.setItem('trello_user', JSON.stringify(user));
            })
        );
    }

    signUp(fullName: string, email: string, password: string, role: string = 'developer'): Observable<any> {
        // Simulating API call
        return of({ id: '2', email, fullName, role }).pipe(
            delay(1500),
            tap(user => {
                this._user = user;
                localStorage.setItem('trello_user', JSON.stringify(user));
            })
        );
    }

    logout() {
        this._user = null;
        localStorage.removeItem('trello_user');
    }
}
