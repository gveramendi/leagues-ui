import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';
import { PageResponse, RoleResponse, RoleService } from '@core';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxDatatableModule, TranslateModule],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
})
export class RoleListComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  rows: RoleResponse[] = [];
  filteredRows: RoleResponse[] = [];
  search = '';
  page = 0;
  size = 10;
  sort = 'name,asc';
  totalElements = 0;
  loading = false;

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.searchRoles(this.search, this.page, this.size, this.sort).subscribe({
      next: (response) => {
        const pageData: PageResponse<RoleResponse> = response.data;
        this.rows = pageData.content;
        this.filteredRows = [...this.rows];
        this.totalElements = pageData.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.loading = false;
      },
    });
  }

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredRows = this.rows.filter((row) => {
      return (
        row.name?.toLowerCase().includes(val) ||
        row.description?.toLowerCase().includes(val) ||
        row.id?.toString().includes(val)
      );
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  onPageChange(pageInfo: any): void {
    this.page = pageInfo.offset;
    this.loadRoles();
  }

  onSort(event: any): void {
    const sortColumn = event.sorts[0];
    const direction = sortColumn.dir === 'asc' ? 'asc' : 'desc';
    this.sort = `${sortColumn.prop},${direction}`;
    this.page = 0;
    this.loadRoles();
  }
}
