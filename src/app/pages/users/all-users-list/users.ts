import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';

import { TableLayoutComponent, TableButton, Column } from '../../../layouts/table-layout/table-layout';

// Import your constant data
import {
  skillsCategories,
  countriesInAfrica,
  availabilityOptions,
  experienceLevels,
  englishLevels,
  hourlyRateRanges
} from '../../../constants/developer-data';

// Define skill levels
const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

interface Skill {
  category: string;
  skill: string;
  level: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
  experienceLevel: string;
  hourlyRate: string;
  englishLevel: string;
  availability: string;
  preferredTimeZone: string;
  primarySkills: Skill[];
  additionalFrameworks: Skill[];
  github: string;
  linkedIn: string;
  website: string;
  remoteExperience: boolean;
  accedaNda: boolean;
  fullName?: string;
  entries?: number; 
  role?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TableLayoutComponent],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class Users implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  error: string | null = null;

  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions: number[] = [10, 20, 30, 50, 100, 200, 500, 1000];

  sortColumn: keyof User | '' = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  searchTerm = '';

  filterCountry = '';
  filterExperienceLevel = '';
  filterEnglishLevel = '';
  filterAvailability = '';
  filterHourlyRate = '';
  filterSkillCategory = '';
  filterSkillName = '';
  filterSkillLevel = '';
  filterRole = '';

  countries = countriesInAfrica;
  experienceLevels = experienceLevels;
  englishLevels = englishLevels;
  availabilities = availabilityOptions;
  hourlyRates = hourlyRateRanges;
  availableSkillCategories: string[] = [];
  availableSkills: string[] = [];
  skillLevels = skillLevels;
  roles: string[] = ['Admin', 'User', 'Manager'];

  tableTitle = 'All Users';
  columns: Column[] = [
    { header: 'Entries', field: 'entries' },
    { header: 'Full Name', field: 'fullName' },
    { header: 'Email', field: 'email' },
    { header: 'Country', field: 'country' },
    { header: 'Role', field: 'role' },
    { header: 'Experience', field: 'experienceLevel' },
    { header: 'Hourly Rate', field: 'hourlyRate' },
    { header: 'Availability', field: 'availability' },
    { header: 'Actions', field: 'actions' }
  ];

  topButtons: TableButton[] = [];

  rowButtons: TableButton[] = [
    // { label: 'Edit', action: (user: User) => this.editUser(user.id) },
    { label: 'Delete', action: (user: User) => this.deleteUser(user.id) }
  ];

  filters = [
    { model: 'filterCountry', options: this.countries, placeholder: 'Country', iconClass: 'fa-earth-americas', changeFn: () => this.applyFilters(), disabled: false },
    { model: 'filterExperienceLevel', options: this.experienceLevels, placeholder: 'Experience', iconClass: 'fa-medal', changeFn: () => this.applyFilters(), disabled: false },
    { model: 'filterAvailability', options: this.availabilities, placeholder: 'Availability', iconClass: 'fa-calendar-check', changeFn: () => this.applyFilters(), disabled: false },
    { model: 'filterHourlyRate', options: this.hourlyRates, placeholder: 'Hourly Rate', iconClass: 'fa-dollar-sign', changeFn: () => this.applyFilters(), disabled: false },
    { model: 'filterRole', options: this.roles, placeholder: 'Role', iconClass: 'fa-user-tag', changeFn: () => this.applyFilters(), disabled: false },
    { model: 'filterSkillCategory', options: this.availableSkillCategories, placeholder: 'Category', iconClass: 'fa-list-ul', changeFn: () => this.onSkillCategoryChange(), disabled: false },
    { model: 'filterSkillName', options: this.availableSkills, placeholder: 'Skill', iconClass: 'fa-cogs', changeFn: () => this.onSkillNameChange(), disabled: !this.filterSkillCategory },
    { model: 'filterSkillLevel', options: this.skillLevels, placeholder: 'Skill Level', iconClass: 'fa-ranking-star', changeFn: () => this.applyFilters(), disabled: !this.filterSkillName }
  ];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.availableSkillCategories = Object.keys(skillsCategories);
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    this.error = null;
    try {
      const res = await firstValueFrom(
        this.api.get<PaginatedResponse<User>>(`api/users?page=${this.page - 1}&size=${this.pageSize}`)
      );

      this.users = res.content.map((u, index) => ({
        ...u,
        fullName: `${u.firstName} ${u.lastName}`,
        primarySkills: u.primarySkills ?? [],
        additionalFrameworks: u.additionalFrameworks ?? [],
        entries: (this.page - 1) * this.pageSize + index + 1,
        role: u.role ?? 'User'
      }));

      this.totalPages = res.totalPages;
      this.applyFilters();
      this.loading = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error(err);
      this.error = 'Failed to load users';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  applyFilters() {
    let tempUsers = [...this.users];
    const term = this.searchTerm.toLowerCase();
    if (term) {
      tempUsers = tempUsers.filter(u =>
        (u.fullName?.toLowerCase().includes(term) ?? false) ||
        (u.email?.toLowerCase().includes(term) ?? false) ||
        (u.country?.toLowerCase().includes(term) ?? false)
      );
    }

    tempUsers = tempUsers.filter(u => {
      const matchesCountry = !this.filterCountry || u.country === this.filterCountry;
      const matchesExperience = !this.filterExperienceLevel || u.experienceLevel === this.filterExperienceLevel;
      const matchesEnglish = !this.filterEnglishLevel || u.englishLevel === this.filterEnglishLevel;
      const matchesAvailability = !this.filterAvailability || u.availability === this.filterAvailability;
      const matchesHourlyRate = !this.filterHourlyRate || u.hourlyRate === this.filterHourlyRate;
      const matchesRole = !this.filterRole || u.role === this.filterRole;

      const matchesSkills = (!this.filterSkillCategory && !this.filterSkillName && !this.filterSkillLevel) ||
        u.primarySkills.some(s =>
          (!this.filterSkillCategory || s.category === this.filterSkillCategory) &&
          (!this.filterSkillName || s.skill === this.filterSkillName) &&
          (!this.filterSkillLevel || s.level === this.filterSkillLevel)
        );

      return matchesCountry && matchesExperience && matchesEnglish && matchesAvailability && matchesHourlyRate && matchesRole && matchesSkills;
    });

    if (this.sortColumn) {
      const sortDirection = this.sortDirection === 'asc' ? 1 : -1;
      tempUsers.sort((a, b) => {
        const valA = a[this.sortColumn as keyof User];
        const valB = b[this.sortColumn as keyof User];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * sortDirection;
        }
        return (valA < valB ? -1 : 1) * sortDirection;
      });
    }

    this.filteredUsers = tempUsers;
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.applyFilters();
  }

  changeSort(event: string) {
    const sortInfo = JSON.parse(event);
    this.sortColumn = sortInfo.column;
    this.sortDirection = sortInfo.direction;
    this.applyFilters();
  }

  onSkillCategoryChange() {
    this.availableSkills = this.filterSkillCategory
      ? skillsCategories[this.filterSkillCategory as keyof typeof skillsCategories]
      : [];
    this.filterSkillName = '';
    this.filterSkillLevel = '';
    this.applyFilters();
  }

  onSkillNameChange() {
    this.filterSkillLevel = '';
    this.applyFilters();
  }

  goToPage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadUsers();
    }
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.page = 1;
    this.loadUsers();
  }

  // --- NEW: Delete user ---
async deleteUser(userId: number) {
  // Prevent deleting yourself
  const currentUserId = Number(localStorage.getItem('userId')); // adjust based on your auth setup
  if (userId === currentUserId) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'You cannot delete your own account!',
    });
    return;
  }

  // SweetAlert2 confirmation
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (result.isConfirmed) {
    try {
      await firstValueFrom(this.api.delete(`api/users/${userId}`));
      // Remove user from list
      this.users = this.users.filter(u => u.id !== userId);
      this.applyFilters();

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'User has been deleted.',
      });
    } catch (err: any) {
      console.error(err);
      if (err.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Permission Denied',
          text: 'You do not have permission to delete this user.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete user.',
        });
      }
    }
  }
}

  editUser(userId: number) {
    console.log('Edit user', userId);
    // Implement your edit logic
  }
}
