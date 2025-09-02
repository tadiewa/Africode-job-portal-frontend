import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import {
  skillsCategories,
  countriesInAfrica,
  availabilityOptions,
  experienceLevels,
  englishLevels,
  hourlyRateRanges
} from '../../../constants/developer-data';

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
  acceptsNda: boolean;
  role: string;
  fullName?: string;
  entries?: number;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-developers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './developers-list.html',
  styleUrls: ['./developers-list.scss']
})
export class DevelopersList implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  error: string | null = null;

  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions: number[] = [10, 20, 30, 50, 100];

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

  countries = countriesInAfrica;
  experienceLevels = experienceLevels;
  englishLevels = englishLevels;
  availabilities = availabilityOptions;
  hourlyRates = hourlyRateRanges;
  availableSkillCategories: string[] = [];
  availableSkills: string[] = [];
  skillLevels = skillLevels;

  expandedUsers = new Set<number>();
  expandedDropdowns = new Set<number>();

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.availableSkillCategories = Object.keys(skillsCategories);
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    this.error = null;
    try {
      const apiUrl = `api/users?page=${this.page - 1}&size=${this.pageSize}`;
      const res = await firstValueFrom(this.api.get<PaginatedResponse<User>>(apiUrl));

      const devs = res.content.filter(u => u.role === 'DEVELOPER');

      this.zone.run(() => {
        this.users = devs.map((u, index) => ({
          ...u,
          fullName: `${u.firstName ?? 'N/A'} ${u.lastName ?? ''}`.trim(),
          email: u.email ?? 'N/A',
          availability: u.availability ?? 'N/A',
          experienceLevel: u.experienceLevel ?? 'N/A',
          primarySkills: u.primarySkills ?? [],
          additionalFrameworks: u.additionalFrameworks ?? [],
          entries: (this.page - 1) * this.pageSize + index + 1
        }));
        this.totalPages = res.totalPages;
        this.applyFilters();
        this.loading = false;

        // Ensure the view updates immediately
        this.cdr.detectChanges();
      });
    } catch (err: any) {
      this.zone.run(() => {
        console.error('Failed to load users:', err);
        this.error = 'Failed to load users';
        this.loading = false;
        this.cdr.detectChanges();
      });
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
      const matchesCountry = !this.filterCountry || u.country?.toLowerCase() === this.filterCountry.toLowerCase();
      const normalize = (str: string | undefined) => (str ?? '').toLowerCase().replace(/\s+/g, '');
      const matchesExperience = !this.filterExperienceLevel ||
        normalize(u.experienceLevel) === normalize(this.filterExperienceLevel);

      const matchesEnglish = !this.filterEnglishLevel || u.englishLevel?.toLowerCase() === this.filterEnglishLevel.toLowerCase();
      const matchesAvailability = !this.filterAvailability || u.availability?.toLowerCase() === this.filterAvailability.toLowerCase();
      const matchesHourlyRate = !this.filterHourlyRate || u.hourlyRate === this.filterHourlyRate;

      const matchesSkills = (!this.filterSkillCategory && !this.filterSkillName && !this.filterSkillLevel) ||
        u.primarySkills.some(s =>
          (!this.filterSkillCategory || s.category === this.filterSkillCategory) &&
          (!this.filterSkillName || s.skill === this.filterSkillName) &&
          (!this.filterSkillLevel || s.level === this.filterSkillLevel)
        );

      return matchesCountry && matchesExperience && matchesEnglish && matchesAvailability && matchesHourlyRate && matchesSkills;
    });

    if (this.sortColumn) {
      const sortDirection = this.sortDirection === 'asc' ? 1 : -1;
      tempUsers.sort((a, b) => {
        const valA = a[this.sortColumn as keyof User];
        const valB = b[this.sortColumn as keyof User];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === 'string' && typeof valB === 'string') return valA.localeCompare(valB) * sortDirection;
        return (valA < valB ? -1 : 1) * sortDirection;
      });
    }

    this.filteredUsers = [...tempUsers];
    this.cdr.detectChanges(); // ensure view updates
  }

  toggleSkills(user: User, event: Event) {
    event.preventDefault();
    const newSet = new Set(this.expandedUsers);
    if (newSet.has(user.id)) {
      newSet.delete(user.id);
    } else {
      newSet.add(user.id);
    }
    this.expandedUsers = newSet;
  }

  toggleDropdown(user: User, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const newSet = new Set(this.expandedDropdowns);
    if (newSet.has(user.id)) {
      newSet.delete(user.id);
    } else {
      newSet.clear();
      newSet.add(user.id);
    }
    this.expandedDropdowns = newSet;
  }

  formatSkill(skill: Skill): string {
    return `${skill.category}: ${skill.skill} (${skill.level})`;
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.applyFilters();
  }

  setSort(column: keyof User) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
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

  viewUser(user: User) {
    console.log('View user clicked', user);
    this.expandedDropdowns.clear();
  }

  editUser(user: User) {
    console.log('Edit clicked', user);
    this.expandedDropdowns.clear();
  }

  deleteUser(user: User) {
    console.log('Delete clicked', user);
    this.expandedDropdowns.clear();
  }
}
