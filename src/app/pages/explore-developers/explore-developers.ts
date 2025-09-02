import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { skillsCategories, countriesInAfrica, hourlyRateRanges } from '../../constants/developer-data';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface Skill {
  category: string;
  skill: string;
  level: string;
}

interface Developer {
  id: number;
  firstName: string;
  country: string;
  experienceLevel: string;
  hourlyRate: string;
  englishLevel: string;
  primarySkills: Skill[];
}

@Component({
  selector: 'app-explore-developers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './explore-developers.html',
  styleUrls: ['./explore-developers.scss']
})
export class ExploreDevelopersComponent implements OnInit {
  developers: Developer[] = [];
  filteredDevelopers: Developer[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  itemsPerPage = 10;

  // Filters
  searchTerm = '';
  selectedCategory = 'All Categories';
  selectedSkill = '';
  selectedCountry = 'All Countries';
  selectedRate: string | null = null;

  expandedSkills: { [devId: number]: boolean } = {};
  uniqueSkillsList: string[] = [];

  // Constants
  skillCategories = Object.keys(skillsCategories);
  countries = countriesInAfrica;
  rates = hourlyRateRanges;

  private searchSubject = new Subject<void>();

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Debounce API calls
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 0;
      this.loadDevelopers();
    });

    this.updateUniqueSkills();
    this.loadDevelopers();
  }

  onFilterChange(): void {
    this.updateUniqueSkills();
    this.searchSubject.next();
  }

  updateUniqueSkills(): void {
    if (this.selectedCategory && this.selectedCategory !== 'All Categories') {
      const key = this.selectedCategory as keyof typeof skillsCategories;
      this.uniqueSkillsList = skillsCategories[key] || [];
    } else {
      this.uniqueSkillsList = [];
    }

    if (!this.uniqueSkillsList.includes(this.selectedSkill)) {
      this.selectedSkill = '';
    }
  }

  loadDevelopers(): void {
    const params = new URLSearchParams();
    params.set('page', this.currentPage.toString());
    params.set('size', this.itemsPerPage.toString());

    if (this.selectedCategory && this.selectedCategory !== 'All Categories') params.set('category', this.selectedCategory);
    if (this.selectedSkill) params.set('primarySkill', this.selectedSkill);
    if (this.selectedCountry && this.selectedCountry !== 'All Countries') params.set('country', this.selectedCountry);
    if (this.selectedRate) params.set('hourlyRate', this.selectedRate);

    this.apiService.get<any>(`api/users/explore/devs?${params.toString()}`).subscribe({
      next: (data) => {
        this.developers = (data.content || []).map((dev: Partial<Developer>) => ({
          ...dev,
          primarySkills: dev.primarySkills || []
        })) as Developer[];

        // Filter client-side by name (partial search)
        this.filteredDevelopers = this.developers.filter(dev =>
          dev.firstName.toLowerCase().includes(this.searchTerm.trim().toLowerCase())
        );

        this.totalElements = data.totalElements || 0;
        this.totalPages = data.totalPages || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load developers', err)
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadDevelopers();
  }

  toggleSkills(devId: number): void {
    this.expandedSkills[devId] = !this.expandedSkills[devId];
  }
}
