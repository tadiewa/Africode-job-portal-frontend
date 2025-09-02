// base-table.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  label: string;
  field: string;
  sortable?: boolean;
  render?: (row: any) => string | number | null;  // add this line
}


@Component({
  selector: 'app-base-table',
  templateUrl: './base-table.html',
  styleUrls: ['./base-table.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BaseTableComponent implements OnInit, OnChanges {
  @Input() title = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showExportButtons = true;
  @Input() showSearch = true;
  @Input() loading = false;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{ field: string, direction: 'asc' | 'desc' | '' }>();
  @Output() export = new EventEmitter<string>();

  public searchTerm = '';
  public sortColumn: string = '';
  public sortDirection: 'asc' | 'desc' | '' = '';
  
  // Changed from `private` to `public` to be accessible by the template
  public internalData: any[] = [];

  ngOnInit(): void {
    this.internalData = [...this.data];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.internalData = [...this.data];
      this.applySorting();
    }
    if (changes['currentPage'] || changes['pageSize']) {
        this.applySorting();
    }
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.searchChange.emit(term);
  }

  onPageSizeChange(size: string) {
    this.pageSize = +size;
    this.currentPage = 1;
    this.pageSizeChange.emit(this.pageSize);
  }

  sortData(field: string) {
    if (this.sortColumn === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
    this.sortChange.emit({ field: this.sortColumn, direction: this.sortDirection });
  }

  private applySorting() {
    if (!this.sortColumn || !this.sortDirection) {
      this.internalData = [...this.data];
      return;
    }

    this.internalData.sort((a, b) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
  
  // Pagination Logic
  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.internalData.slice(startIndex, startIndex + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.internalData.length / this.pageSize) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  prevPage() {
      if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  onExport(type: string) {
    this.export.emit(type);
  }
  formatObject(obj: any): string {
  // Adjust formatting for your skills
  if (obj.category && obj.skill && obj.level) {
    return `${obj.category} - ${obj.skill} (${obj.level})`;
  }
  // Default: join all key-values
  return Object.values(obj).join(' - ');
}

}
