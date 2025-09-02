// main-layout.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';
import { Sidebar } from '../sidebar/sidebar';
import { SidebarService } from '../../services/sidebar.service';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  // The SidebarComponent is correctly imported here because it's used in main-layout.component.html
  imports: [RouterModule, CommonModule, RouterOutlet, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  currentRoute: string = '/';
  isSidebarOpen: boolean = true;
  private routerSubscription: Subscription = new Subscription();
  private sidebarSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService, 
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Subscribes to the sidebar service to get the latest state
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

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
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
    this.router.navigate(['/login']);
  }
  
  // Conditionally shows the sidebar
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
  
  // Toggles the sidebar via the service
  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }
}
