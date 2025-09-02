import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private isAdmin = new BehaviorSubject<boolean>(false);
  private userRole = new BehaviorSubject<string>('developer'); // default

  isLoggedIn$ = this.loggedIn.asObservable();
  isAdmin$ = this.isAdmin.asObservable();
  userRole$ = this.userRole.asObservable(); // new observable for role

  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole') || 'developer';
      if (token) {
        this.loggedIn.next(true);
        this.isAdmin.next(role === 'admin');
        this.userRole.next(role);
      }
    }
  }

  login(userRole: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userRole', userRole);
      this.loggedIn.next(true);
      this.isAdmin.next(userRole === 'admin');
      this.userRole.next(userRole);
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      this.loggedIn.next(false);
      this.isAdmin.next(false);
      this.userRole.next('developer'); // reset
    }
  }

  // New: get current role (sync)
  getCurrentRole(): string {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('userRole') || 'developer' : 'developer';
  }
}