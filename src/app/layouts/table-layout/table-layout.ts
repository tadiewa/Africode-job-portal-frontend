import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableButton {
  label: string;
  action: (row?: any) => void;
  type?: 'primary' | 'secondary';
}

export interface Column {
  header: string;
  field: string;
  template?: string; // for custom templates
}

@Component({
  selector: 'app-table-layout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-layout.html',
  styleUrls: ['./table-layout.scss']
})
export class TableLayoutComponent {
  @Input() columns: Column[] = [];
  @Input() data: any[] = [];
  @Input() isLoading = false;
  @Input() page = 1;
  @Input() totalPages = 0;
  @Input() tableTitle = '';
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [];
  @Input() topButtons: TableButton[] = [];
  @Input() rowButtons: TableButton[] = [];
  @Input() searchTerm: string = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<string>();
  @Input() templates: { [key: string]: TemplateRef<any> } = {};
@Output() searchTermChange = new EventEmitter<string>(); // for two-way binding


  sortedColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  activeDropdownIndex: number | null = null;
  showPageSizeDropdown: boolean = false;

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
  }

  onSort(columnField: string) {
    if (this.sortedColumn === columnField) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortedColumn = columnField;
      this.sortDirection = 'asc';
    }
    this.sortChange.emit(JSON.stringify({ column: this.sortedColumn, direction: this.sortDirection }));
  }

  onButtonClick(button: TableButton, row?: any) {
    button.action(row);
  }

  goToPage(newPage: number) {
    this.pageChange.emit(newPage);
  }

  prevPage() {
    this.pageChange.emit(this.page - 1);
  }

  nextPage() {
    this.pageChange.emit(this.page + 1);
  }

  selectPageSize(size: number) {
    this.pageSizeChange.emit(size);
    this.showPageSizeDropdown = false;
  }

  togglePageSizeDropdown() {
    this.showPageSizeDropdown = !this.showPageSizeDropdown;
  }

getPageNumbers(): number[] {
  const pages: number[] = [];
  const total = this.totalPages;

  // Always show all page numbers if <= 10 (or your max)
  for (let i = 1; i <= total; i++) pages.push(i);

  return pages;
}


  toggleDropdown(index: number) {
    this.activeDropdownIndex = this.activeDropdownIndex === index ? null : index;
  }

  shouldOpenUp(index: number): boolean {
    return index > this.data.length - 4;
  }
}
