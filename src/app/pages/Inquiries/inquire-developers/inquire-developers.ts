import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';

import {
  projectTimelineOptions,
  projectBudgets,
  projectTypes,
} from '../../../constants/developer-data';

@Component({
  selector: 'app-inquire-developers',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './inquire-developers.html',
  styleUrls: ['./inquire-developers.scss']
})
export class InquireDevelopers implements OnInit {
  inquiryForm: FormGroup;
  loading = false;
  formError: string | null = null;
  developer: any = null;

  projectTimelineOptions = projectTimelineOptions;
  projectBudgets = projectBudgets;
  projectTypes = projectTypes;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.inquiryForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      companyName: ['', Validators.required],
      projectType: ['', Validators.required],
      projectBudget: ['', Validators.required],
      projectTimeline: ['', Validators.required],
      projectDesc: ['', Validators.required],
      additionalNotes: [''],
      developerId: [0], // will set after fetching developer
    });
  }

  ngOnInit() {
    const devId = Number(this.route.snapshot.params['id']);
    if (devId) this.loadDeveloper(devId);
  }

  loadDeveloper(devId: number) {
    this.apiService.get<any>(`api/users/explore/devs?page=0&size=1000`).subscribe({
      next: (data) => {
        this.developer = data.content.find((d: any) => d.id === devId);
        if (!this.developer) {
          Swal.fire('Error', 'Developer not found', 'error');
          this.router.navigate(['/explore-developers']);
        } else {
          // Set the developerId in the form
          this.inquiryForm.patchValue({ developerId: this.developer.id });
          // Force Angular to update view after async change
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Failed to load developers', err)
    });
  }

 onSubmit() {
  this.formError = null;

  if (this.inquiryForm.invalid) {
    this.inquiryForm.markAllAsTouched();
    this.formError = 'Please fill all required fields correctly.';
    return;
  }

  this.loading = true;

  // Prepare sanitized payload
  const formValue = this.inquiryForm.value;

  const payload = {
    fullName: formValue.fullName.trim(),
    email: formValue.email.trim(),
    phone: formValue.phone.trim(),
    companyName: formValue.companyName.trim(),
    projectType: formValue.projectType,
    projectBudget: Number(formValue.projectBudget) || 0, // Convert to number
    projectTimeline: formValue.projectTimeline,
    projectDesc: formValue.projectDesc.trim(),
    additionalNotes: formValue.additionalNotes?.trim() || '',
    developerId: formValue.developerId || 0, // Ensure a number is sent
  };

  // Optional: check if developerId is still 0
  if (payload.developerId === 0) {
    this.loading = false;
    Swal.fire('Error', 'Please select a developer before submitting.', 'error');
    return;
  }

  this.apiService.post('api/inquiries', payload).subscribe({
    next: () => {
      this.loading = false;
      Swal.fire({
        icon: 'success',
        title: 'Inquiry Submitted',
        text: 'Your inquiry has been sent successfully!',
        confirmButtonColor: '#3085d6',
      }).then(() => this.router.navigate(['/explore-developers']));
      this.inquiryForm.reset();
    },
    error: (error: any) => {
      this.loading = false;
      console.error('API error:', error);

      // Show server message if available
      const message = error?.error?.message || 'Failed to submit inquiry. Please try again later.';
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: message,
        confirmButtonColor: '#d33',
      });
    }
  });
}


  onCancel() {
    this.inquiryForm.reset();
  }

  goBack() {
    this.router.navigate(['/explore-developers']);
  }
}
