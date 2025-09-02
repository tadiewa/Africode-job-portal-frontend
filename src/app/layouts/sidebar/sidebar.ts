import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../services/auth.service'; // Assuming you have AuthService to get current user role

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements OnInit {
  isSidebarOpen: boolean = true;
  isUsersDropdownOpen: boolean = false;
  role: string = ''; // admin or developer

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService
  ) {}

ngOnInit(): void {
  this.sidebarService.isSidebarOpen$.subscribe(isOpen => {
    this.isSidebarOpen = isOpen;
  });

  // Subscribe to the user role so sidebar updates reactively
  this.authService.userRole$.subscribe(role => {
    this.role = role;
  });
}

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  toggleUsersDropdown(): void {
    this.isUsersDropdownOpen = !this.isUsersDropdownOpen;
  }
}
