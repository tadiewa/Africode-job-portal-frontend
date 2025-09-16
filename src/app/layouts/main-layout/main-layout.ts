import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Sidebar } from '../sidebar/sidebar';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterOutlet, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  currentRoute: string = '/';
  isSidebarOpen: boolean = true;

  // NEW: Mobile menu toggle
  isMobileMenuOpen: boolean = false;

  private routerSubscription: Subscription = new Subscription();
  private sidebarSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Sidebar state
    this.sidebarSubscription = this.sidebarService.isSidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen;
    });

    this.authService.isLoggedIn$.subscribe(loggedInStatus => {
      this.isLoggedIn = loggedInStatus;
    });

    this.authService.isAdmin$.subscribe(adminStatus => {
      this.isAdmin = adminStatus;
    });

    this.currentRoute = this.router.url;

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.closeMobileMenu(); // auto-close on navigation
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.sidebarSubscription.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }

  shouldShowSidebar(): boolean {
    const sidebarRoutes = [
      '/dashboard',
      '/admin/super-dashboard',
      '/admin/users',
      '/admin/inquiries',
      '/admin/developers',
      '/admin/admins'
    ];
    return sidebarRoutes.some(r => this.currentRoute.startsWith(r));
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  showHomeLink(): boolean {
    return this.currentRoute !== '/';
  }

  // Mobile menu helpers
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
