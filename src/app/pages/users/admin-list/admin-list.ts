import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { TableLayoutComponent, TableButton, Column } from '../../../layouts/table-layout/table-layout';
import { AdminRegister } from '../../admin/admin-register/admin-register';
import Swal from 'sweetalert2';

interface Admin {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber?: string;
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
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableLayoutComponent, AdminRegister],
  templateUrl: './admin-list.html',
  styleUrls: ['./admin-list.scss']
})
export class AdminList implements OnInit {
  users: Admin[] = [];
  filteredUsers: Admin[] = [];
  loading = false;
  error: string | null = null;

  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions: number[] = [10, 20, 30, 50, 100, 200, 500, 1000];

  sortColumn: keyof Admin | '' = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  searchTerm = '';
  filterCountry = '';

  showRegisterModal = false;
  selectedAdmin: Admin | null = null;

  tableTitle = 'Admins';
  columns: Column[] = [
    { header: 'Entries', field: 'entries' },
    { header: 'Full Name', field: 'fullName' },
    { header: 'Email', field: 'email' },
    { header: 'Country', field: 'country' },
    { header: 'Role', field: 'role' },
    { header: 'Actions', field: 'actions' }
  ];

  topButtons: TableButton[] = [
    { label: 'Add Admin', action: () => this.openRegisterModal() }
  ];

  rowButtons: TableButton[] = [
    { label: 'Edit', action: (user: Admin) => this.editAdmin(user) },
    { label: 'Delete', action: (user: Admin) => this.deleteAdmin(user) }
  ];

  countries = ['Zimbabwe', 'South Africa', 'Kenya', 'Nigeria'];

  filters = [
    {
      model: 'filterCountry',
      options: this.countries,
      placeholder: 'Country',
      iconClass: 'fa-earth-americas',
      changeFn: () => this.applyFilters(),
      disabled: false
    }
  ];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit() {
    this.loadAdmins();
  }

  async loadAdmins() {
    this.loading = true;
    this.error = null;

    try {
      const res = await firstValueFrom(
        this.api.get<PaginatedResponse<Admin>>(
          `api/users?page=${this.page - 1}&size=${this.pageSize}&role=Admin`
        )
      );

      this.zone.run(() => {
        this.users = res.content.map((u, index) => ({
          ...u,
          fullName: `${u.firstName} ${u.lastName}`,
          entries: (this.page - 1) * this.pageSize + index + 1,
          role: 'Admin'
        }));

        this.totalPages = res.totalPages;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      });
    } catch (err) {
      this.zone.run(() => {
        console.error(err);
        this.error = 'Failed to load admins';
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

    tempUsers = tempUsers.filter(u => !this.filterCountry || u.country === this.filterCountry);

    if (this.sortColumn) {
      const sortDirection = this.sortDirection === 'asc' ? 1 : -1;
      tempUsers.sort((a, b) => {
        const valA = a[this.sortColumn as keyof Admin];
        const valB = b[this.sortColumn as keyof Admin];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * sortDirection;
        }
        return (valA < valB ? -1 : 1) * sortDirection;
      });
    }

    this.filteredUsers = [...tempUsers];
    this.cdr.detectChanges();
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

  goToPage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadAdmins();
    }
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.page = 1;
    this.loadAdmins();
  }

  openRegisterModal() {
    this.selectedAdmin = null;
    this.showRegisterModal = true;
  }

  closeRegisterModal() {
    this.showRegisterModal = false;
    this.selectedAdmin = null;
    this.loadAdmins();
  }

  editAdmin(user: Admin) {
    this.selectedAdmin = user;
    this.showRegisterModal = true;
  }

  async deleteAdmin(user: Admin) {
    // Check if the admin has related inquiries first
    const hasInquiries = await firstValueFrom(
      this.api.get<boolean>(`api/users/${user.id}/has-inquiries`)
    ).catch(() => false);

    if (hasInquiries) {
      Swal.fire({
        title: 'Cannot Delete',
        text: `This admin has inquiries and cannot be deleted.`,
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        // Optionally reload table even after warning
        this.loadAdmins();
      });
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${user.fullName}?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (!result.isConfirmed) return;

    try {
      await firstValueFrom(this.api.delete(`api/users/${user.id}`));

      Swal.fire({
        title: 'Deleted!',
        text: `${user.fullName} has been deleted.`,
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        // Reload the table after user clicks OK
        this.loadAdmins();
      });

    } catch (err: any) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete admin.', 'error');
    }
  }
}
