import { Component, OnInit, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { HttpEventType } from '@angular/common/http';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators'; // add this import at top


@Component({
  selector: 'app-developer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './developer-dashboard.html',
  styleUrls: ['./developer-dashboard.scss']
})
export class DeveloperDashboard implements OnInit {
  profile: any = {};
  files: any[] = [];
  inquiries: any[] = [];
  role: string = '';

  uploading = false;
  uploadProgress = 0;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private api: ApiService, private authService: AuthService, private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.role = this.authService.getCurrentRole();
    this.loadProfile();
    this.loadFiles();
    this.loadInquiries();
  }

  profileCompletion(): number {
    if (!this.profile) return 0;
    let completed = 0;
    if (this.profile.name) completed++;
    if (this.profile.title) completed++;
    if (this.profile.skills?.length) completed++;
    if (this.profile.bio) completed++;
    return Math.floor((completed / 4) * 100);
  }

  /** ================= FILE UPLOAD ================= */
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length) this.uploadFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files.length) this.uploadFiles(event.dataTransfer.files);
  }
uploadFiles(files: FileList) {
  if (!files.length) return;

  this.uploading = true;
  this.uploadProgress = 0;

  const formData = new FormData();
  Array.from(files).forEach(file => formData.append('file', file));

  this.api.postMultipart('documents/upload', formData)
    .subscribe({
      next: event => {
        if (event.type === HttpEventType.Response) {
          this.ngZone.run(() => {
            this.uploading = false;
            this.cdr.detectChanges(); // Force a change detection cycle here
            this.loadFiles();
          });

          Swal.fire({
            icon: 'success',
            title: 'Upload Complete!',
            text: 'File(s) uploaded successfully!',
            confirmButtonText: 'OK'
          });
        }
      },
      error: err => {
        this.uploading = false;
        this.cdr.detectChanges(); // Also force change detection on error
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'Please try again.',
          confirmButtonText: 'OK'
        });
        console.error(err);
      }
    });
}


  /** ================= LOAD DATA ================= */
  loadProfile() {
    this.api.get('profile/me').subscribe(res => this.profile = res);
  }

  loadFiles() {
    this.api.get('documents').subscribe((res: any) => this.files = res || []);
  }

  loadInquiries() {
    this.api.get('inquiries').subscribe((res: any) => this.inquiries = res || []);
  }

  /** ================= FILE DELETE ================= */
  deleteFile(fileId: number) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    this.api.delete(`documents/${fileId}`).subscribe({
      next: () => {
        console.log('File deleted:', fileId);
        this.files = this.files.filter(f => f.id !== fileId);
      },
      error: (err) => {
        console.error('Failed to delete file', err);
        alert('Could not delete the file. Try again.');
      }
    });
  }
}
