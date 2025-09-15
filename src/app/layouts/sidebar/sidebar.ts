import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../services/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements OnInit {
  isSidebarOpen = false;
  isUsersDropdownOpen = false;
  screenIsLarge = false;
  role: string | null = null;

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();

    // Subscribe to userRole$ Observable
    this.authService.userRole$.subscribe(role => {
      this.role = role;
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleUsersDropdown(): void {
    this.isUsersDropdownOpen = !this.isUsersDropdownOpen;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.screenIsLarge = window.innerWidth >= 1024; // lg breakpoint in Tailwind
    if (this.screenIsLarge) {
      this.isSidebarOpen = true; // always open on desktop
    } else {
      this.isSidebarOpen = false; // closed by default on mobile
    }
  }
}
