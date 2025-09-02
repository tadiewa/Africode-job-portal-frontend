import { Component, OnInit, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api.service';
import { TableLayoutComponent, TableButton, Column } from '../../../layouts/table-layout/table-layout';

interface Inquiry {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  projectType: string;
  projectBudget: number;
  projectTimeline: string;
  projectDesc: string;
  additionalNotes: string;
  developerId: string;
  createdAt: string;
  developerName?: string;
  entries?: number; 
  status?: 'SUBMITTED' | 'INPROGRESS' | 'COMPLETED';
}

interface InquiryColumn extends Column {
  template?: string;
}

interface InquiryResponse {
  content: Inquiry[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

@Component({
  selector: 'app-inquiries-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableLayoutComponent],
  templateUrl: './inquiries-list.html',
  styleUrls: ['./inquiries-list.scss']
})
export class InquiriesList implements OnInit {

  inquiries: Inquiry[] = [];
  loading = false;

  // Pagination
  page = 1;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pageSizeOptions = [5, 10, 20, 50];

  // Sorting
  sortColumn: keyof Inquiry = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Developers mapping
  developersMap: { [id: string]: string } = {};

  // Filters
  companyName = '';
  status: Inquiry['status'] | '' = '';
  startDate = '';
  endDate = '';
  minBudget?: number;
  maxBudget?: number;

  statusOptions: Inquiry['status'][] = ['SUBMITTED', 'INPROGRESS', 'COMPLETED'];

  tableTitle = 'Inquiries';

  columns: InquiryColumn[] = [
    { header: 'Entries', field: 'entries' },
    { header: 'Full Name', field: 'fullName' },
    { header: 'Email', field: 'email' },
    { header: 'Phone', field: 'phone' },
    { header: 'Company', field: 'companyName' },
    { header: 'Developer', field: 'developerName' },
    { header: 'Project Type', field: 'projectType' },
    { header: 'Budget', field: 'projectBudget' },
    { header: 'Timeline', field: 'projectTimeline' },
    { header: 'Status', field: 'status', template: 'status' },
    { header: 'Actions', field: 'actions' }
  ];

  topButtons: TableButton[] = [
    { label: 'Add Inquiry', action: () => console.log('Add Inquiry Clicked') }
  ];

  rowButtons: TableButton[] = [
    { label: 'View', action: (row: Inquiry) => console.log('View', row) },
    { label: 'Delete', action: (row: Inquiry) => console.log('Delete', row) }
  ];

  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchDevelopers();
  }

  fetchDevelopers(): void {
    this.apiService.get<{ content: any[] }>('api/users?page=0&size=100').subscribe({
      next: (res) => {
        console.log('Developers fetched:', res);
        res.content.forEach((dev: any) => {
          this.developersMap[dev.id.toString()] = `${dev.firstName} ${dev.lastName}`;
        });
        this.fetchInquiries();
      },
      error: (err) => {
        console.error('Failed to fetch developers:', err);
        Swal.fire({
          icon: 'error',
          title: 'Failed to load developers',
          text: 'Please try again later.'
        });
      }
    });
  }

fetchInquiries(): void {
  this.loading = true;

  let params = new HttpParams();
  if (this.companyName) params = params.set('companyName', this.companyName);
  if (this.status) params = params.set('status', this.status);
  if (this.startDate) params = params.set('startDate', this.startDate);
  if (this.endDate) params = params.set('endDate', this.endDate);
  if (this.minBudget != null) params = params.set('minBudget', this.minBudget.toString());
  if (this.maxBudget != null) params = params.set('maxBudget', this.maxBudget.toString());

  params = params.set('page', (this.page - 1).toString());
  params = params.set('size', this.pageSize.toString());
  params = params.set('sort', `${this.sortColumn},${this.sortDirection}`);

  this.apiService.get<InquiryResponse>('api/inquiries/allInquiries', { params }).subscribe({
    next: (res) => {
      this.inquiries = res.content.map((i: Inquiry, index: number) => ({
        ...i,
        entries: (this.page - 1) * this.pageSize + index + 1,
        developerName: this.developersMap[i.developerId] || 'N/A'
      }));
      this.totalPages = res.totalPages;
      this.totalElements = res.totalElements;
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        title: 'Failed to load inquiries',
        text: 'Please try again later.'
      });
    }
  });
}


  onFilterChange(): void {
    this.page = 1;
    this.fetchInquiries();
  }

  changeSort(column: string): void {
    const col = column as keyof Inquiry;
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.fetchInquiries();
  }

  goToPage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.fetchInquiries();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.page = 1;
    this.fetchInquiries();
  }

  updateInquiryStatus(inquiry: Inquiry): void {
    const status = inquiry.status;
    const url = `api/inquiries/${inquiry.id}/status?status=${status}`;
    console.log('Updating inquiry status:', url);

    this.apiService.put<Inquiry>(url, {}).subscribe({
      next: (updatedInquiry) => {
        console.log('Inquiry updated:', updatedInquiry);
        const index = this.inquiries.findIndex(i => i.id === inquiry.id);
        if (index !== -1) {
          this.inquiries[index] = {
            ...updatedInquiry,
            developerName: this.developersMap[updatedInquiry.developerId] || 'N/A'
          };
        }
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Inquiry status changed to ${status}`
        });
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Could not update the inquiry status.'
        });
      }
    });
  }

  getStatusInfo(status: Inquiry['status']): { icon: string; label: string } {
    switch (status) {
      case 'SUBMITTED': return { icon: '📝', label: 'Submitted' };
      case 'INPROGRESS': return { icon: '⏳', label: 'In Progress' };
      case 'COMPLETED': return { icon: '✅', label: 'Completed' };
      default: return { icon: '', label: '' };
    }
  }
}
