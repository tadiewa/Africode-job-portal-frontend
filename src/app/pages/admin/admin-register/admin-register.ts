import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';
import { countriesInAfrica } from '../../../constants/developer-data';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-register.html',
  styleUrls: ['./admin-register.scss']
})
export class AdminRegister implements OnChanges {
  @Input() adminData: any = null; // If null, it's a new registration
  @Output() closeModal = new EventEmitter<void>();

  countries = countriesInAfrica;
  isEditMode = false;
  isSubmitting = false;

  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      country: ['', Validators.required],
      phoneNumber: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['adminData'] && this.adminData) {
      this.isEditMode = true;
      this.registerForm.patchValue({
        firstName: this.adminData.firstName,
        lastName: this.adminData.lastName,
        email: this.adminData.email,
        country: this.adminData.country,
        phoneNumber: this.adminData.phoneNumber,
      });

      // Clear password validators for edit
      this.setPasswordValidators(false);
    } else {
      this.isEditMode = false;
      this.registerForm.reset();
      this.setPasswordValidators(true);
    }
  }

  private setPasswordValidators(required: boolean) {
    const passControl = this.registerForm.get('password');
    const confirmControl = this.registerForm.get('confirmPassword');

    if (required) {
      passControl?.setValidators([Validators.required, Validators.minLength(6)]);
      confirmControl?.setValidators([Validators.required]);
    } else {
      passControl?.clearValidators();
      confirmControl?.clearValidators();
    }

    passControl?.updateValueAndValidity();
    confirmControl?.updateValueAndValidity();
  }

  passwordMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notMatching: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.registerForm.value;

    if (this.isEditMode) {
      const updateData = {
        id: this.adminData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
      };

      this.api.put(`api/users/${this.adminData.id}`, updateData).subscribe({
        next: () => {
          Swal.fire('Success', 'Admin updated successfully!', 'success');
          this.isSubmitting = false;
          this.closeModal.emit();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'Update failed.', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      const newAdminData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
      };

      this.api.post('api/auth/register/admin', newAdminData).subscribe({
        next: () => {
          Swal.fire('Success', 'Admin created successfully!', 'success');
          this.registerForm.reset();
          this.isSubmitting = false;
          this.closeModal.emit();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'Registration failed.', 'error');
          this.isSubmitting = false;
        }
      });
    }
  }
}
