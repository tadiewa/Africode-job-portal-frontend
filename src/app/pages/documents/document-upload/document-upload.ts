// document-upload.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-upload.html',
  styleUrls: ['./document-upload.scss']
})
export class DocumentUpload{
  selectedFile: File | null = null;
  fileName = '';
  loading = false;

  constructor(private apiService: ApiService) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
      console.log('File selected:', file.name);
    }
  }

  onUpload() {
    if (!this.selectedFile) {
      Swal.fire('Error', 'Please select a file to upload.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.loading = true;

    // Using ApiService singleton
    this.apiService.postMultipart('documents/upload', formData).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('Upload success', res);
        Swal.fire('Uploaded!', 'Your file has been uploaded successfully.', 'success');
        this.resetForm();
      },
      error: (err) => {
        this.loading = false;
        console.error('Upload failed', err);
        Swal.fire('Failed', 'File upload failed. Please try again.', 'error');
      }
    });
  }

  resetForm() {
    this.selectedFile = null;
    this.fileName = '';
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
