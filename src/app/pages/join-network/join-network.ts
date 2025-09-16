import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import * as countries from 'i18n-iso-countries';
import * as enLocale from 'i18n-iso-countries/langs/en.json';
import * as moment from 'moment-timezone';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApiService } from '../../services/api.service';
import { HttpClientModule } from '@angular/common/http';

import {
  experienceLevels,
  englishLevels,
  hourlyRateRanges,
  availabilityOptions,
  countriesInAfrica,
  skillsCategories,
  roles,
} from '../../constants/developer-data';

@Component({
  selector: 'app-join-network',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgSelectModule, HttpClientModule],
  templateUrl: './join-network.html',
  styleUrls: ['./join-network.scss']
})
export class JoinNetworkComponent {
  joinForm: FormGroup;
  timezones: { label: string; value: string }[] = [];
  africanCountries = countriesInAfrica.map(name => {
    return { code: name, name };
  });

  experienceLevels = experienceLevels;
  englishLevels = englishLevels;
  hourlyRateRanges = hourlyRateRanges;
  roles=roles;
  availabilityOptions = availabilityOptions;
  skillLevels: string[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert']; // Define skill levels

  skillsCategories = skillsCategories;
  skillCategoriesKeys: string[] = Object.keys(skillsCategories);

  primarySkillsOptions: string[] = [];
  frameworksOptions: string[] = [];

  loading = false;
  formError = '';

constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService) {
  // Register the English locale for countries
  countries.registerLocale(enLocale);

  this.joinForm = this.fb.group({
    firstName: ['', Validators.required], // Added firstName
    lastName: ['', Validators.required],  // Added lastName
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]], // Added password
    phoneNumber: [''], // Renamed from 'phone'
    country: ['', Validators.required],
    experienceLevel: ['', Validators.required],
    hourlyRate: ['', Validators.required],
    role:['',Validators.required],
    availability: ['', Validators.required],
    englishLevel: ['', Validators.required],
    preferredTimeZone: ['Africa/Johannesburg', Validators.required], // Renamed from 'timezone'

    // FormArrays for dynamic skills with category, skill, and level
    primarySkills: this.fb.array([], Validators.required), // Added Validators.required for FormArray
    additionalFrameworks: this.fb.array([]), // Renamed from 'frameworks'

    github: ['', Validators.required],
    website: [''], // Renamed from 'portfolio'
    linkedIn: [''], // Renamed from 'linkedin'

    remoteExperience: [false],
    acceptsNda: [false], // Renamed from 'ndaReady'

    // New temporary form controls for category, skill, and level selection
    selectedPrimaryCategory: [''],
    selectedPrimarySkill: [''],
    selectedPrimarySkillLevel: [''], // Added skill level
    selectedFrameworkCategory: [''],
    selectedFrameworkSkill: [''],
    selectedFrameworkSkillLevel: [''] // Added skill level
  });

  // Initially disable dependent skill and level selects
  this.joinForm.get('selectedPrimarySkill')?.disable();
  this.joinForm.get('selectedPrimarySkillLevel')?.disable();
  this.joinForm.get('selectedFrameworkSkill')?.disable();
  this.joinForm.get('selectedFrameworkSkillLevel')?.disable();

  // Populate timezone dropdown with abbreviation and GMT offset
  const uniqueZonesMap = new Map<string, { label: string; value: string }>();
  moment.tz.names().forEach(tz => {
    const offsetMinutes = moment.tz(tz).utcOffset();
    const offsetHours = offsetMinutes / 60;
    const sign = offsetHours >= 0 ? '+' : '-';
    const formattedOffset = `GMT${sign}${Math.abs(offsetHours)}`;
    const abbreviation = moment.tz(tz).format('z') || 'GMT';
    const label = `${abbreviation} (${formattedOffset})`;

    if (!uniqueZonesMap.has(label)) {
      uniqueZonesMap.set(label, { label, value: tz });
    }
  });
  this.timezones = Array.from(uniqueZonesMap.values()).sort((a, b) => a.label.localeCompare(b.label));

  // React to selectedPrimaryCategory changes
  this.joinForm.get('selectedPrimaryCategory')?.valueChanges.subscribe(category => {
    if (category) {
      this.primarySkillsOptions = this.skillsCategories[category as keyof typeof this.skillsCategories];
      this.joinForm.get('selectedPrimarySkill')?.enable();
    } else {
      this.primarySkillsOptions = [];
      this.joinForm.get('selectedPrimarySkill')?.setValue('');
      this.joinForm.get('selectedPrimarySkill')?.disable();

      this.joinForm.get('selectedPrimarySkillLevel')?.setValue('');
      this.joinForm.get('selectedPrimarySkillLevel')?.disable();
    }
  });

  // React to selectedPrimarySkill changes
  this.joinForm.get('selectedPrimarySkill')?.valueChanges.subscribe(skill => {
    if (skill) {
      this.joinForm.get('selectedPrimarySkillLevel')?.enable();
    } else {
      this.joinForm.get('selectedPrimarySkillLevel')?.setValue('');
      this.joinForm.get('selectedPrimarySkillLevel')?.disable();
    }
  });

  // React to selectedFrameworkCategory changes
  this.joinForm.get('selectedFrameworkCategory')?.valueChanges.subscribe(category => {
    if (category) {
      this.frameworksOptions = this.skillsCategories[category as keyof typeof this.skillsCategories];
      this.joinForm.get('selectedFrameworkSkill')?.enable();
    } else {
      this.frameworksOptions = [];
      this.joinForm.get('selectedFrameworkSkill')?.setValue('');
      this.joinForm.get('selectedFrameworkSkill')?.disable();

      this.joinForm.get('selectedFrameworkSkillLevel')?.setValue('');
      this.joinForm.get('selectedFrameworkSkillLevel')?.disable();
    }
  });

  // React to selectedFrameworkSkill changes
  this.joinForm.get('selectedFrameworkSkill')?.valueChanges.subscribe(skill => {
    if (skill) {
      this.joinForm.get('selectedFrameworkSkillLevel')?.enable();
    } else {
      this.joinForm.get('selectedFrameworkSkillLevel')?.setValue('');
      this.joinForm.get('selectedFrameworkSkillLevel')?.disable();
    }
  });
}

  // Getters for easier access to FormArrays in the template
  get primarySkillsArray() {
    return this.joinForm.get('primarySkills') as FormArray;
  }

  get additionalFrameworksArray() {
    return this.joinForm.get('additionalFrameworks') as FormArray;
  }

  // Method to add a skill to a FormArray with category, skill, and level
  addSkill(formArray: FormArray, skillControlName: string, levelControlName: string, categoryControlName: string) {
    const category = this.joinForm.get(categoryControlName)?.value;
    const skill = this.joinForm.get(skillControlName)?.value;
    const level = this.joinForm.get(levelControlName)?.value;

    if (category && skill && level) {
      const newSkill = { category, skill, level };
      // Prevent duplicates based on skill name
      if (!formArray.value.some((s: any) => s.skill === newSkill.skill)) {
        formArray.push(this.fb.group(newSkill)); // Push a FormGroup for each skill object
        this.joinForm.get(skillControlName)?.setValue(''); // Clear selected skill
        this.joinForm.get(levelControlName)?.setValue(''); // Clear selected level
        this.joinForm.get(categoryControlName)?.setValue(''); // Clear selected category
        // Reset options as category is cleared
        if (categoryControlName === 'selectedPrimaryCategory') {
          this.primarySkillsOptions = [];
        } else if (categoryControlName === 'selectedFrameworkCategory') {
          this.frameworksOptions = [];
        }
      }
    }
  }

  // Method to remove a skill from a FormArray
  removeSkill(formArray: FormArray, index: number) {
    formArray.removeAt(index);
  }

  onSubmit() {
    // Mark all controls as touched to display validation errors
    this.joinForm.markAllAsTouched();

    // Custom validation for primarySkillsArray length
    if (this.primarySkillsArray.length === 0) {
      this.formError = 'At least one primary skill is required.';
      return;
    }

    if (this.joinForm.invalid) {
      this.formError = 'Please fill in all required fields and correct any errors.';
      return;
    }

    this.loading = true;
    this.formError = '';

    // Prepare payload by picking only the fields expected by Swagger
    const payload = {
      email: this.joinForm.value.email,
      password: this.joinForm.value.password,
      firstName: this.joinForm.value.firstName,
      lastName: this.joinForm.value.lastName,
      country: this.joinForm.value.country,
      role: this.joinForm.value.role,
      phoneNumber: this.joinForm.value.phoneNumber,
      experienceLevel: this.joinForm.value.experienceLevel,
      hourlyRate: this.joinForm.value.hourlyRate,
      englishLevel: this.joinForm.value.englishLevel,
      availability: this.joinForm.value.availability,
      preferredTimeZone: this.joinForm.value.preferredTimeZone,
      primarySkills: this.joinForm.value.primarySkills,
      additionalFrameworks: this.joinForm.value.additionalFrameworks,
      github: this.joinForm.value.github,
      linkedIn: this.joinForm.value.linkedIn,
      website: this.joinForm.value.website,
      remoteExperience: this.joinForm.value.remoteExperience,
      acceptsNda: this.joinForm.value.acceptsNda
    };
this.apiService.post("api/auth/register/user", payload).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading = false;
        this.router.navigate(['/login']); // Redirect on success
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.formError = 'Submission failed. Please try again.';
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.joinForm.reset();
    // Clear FormArrays as well
    this.primarySkillsArray.clear();
    this.additionalFrameworksArray.clear();
    // Reset temporary skill selection controls
    this.joinForm.get('selectedPrimaryCategory')?.setValue('');
    this.joinForm.get('selectedPrimarySkill')?.setValue('');
    this.joinForm.get('selectedPrimarySkillLevel')?.setValue('');
    this.joinForm.get('selectedFrameworkCategory')?.setValue('');
    this.joinForm.get('selectedFrameworkSkill')?.setValue('');
    this.joinForm.get('selectedFrameworkSkillLevel')?.setValue('');
    this.primarySkillsOptions = [];
    this.frameworksOptions = [];

    this.router.navigate(['/']);
  }
  onClose() {
    this.router.navigate(['/']);
  }
}
