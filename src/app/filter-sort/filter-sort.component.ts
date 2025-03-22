import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-filter-sort',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  templateUrl: './filter-sort.component.html',
  styles: '',
})
export class FilterSortComponent {
  filterText: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  @Output() filterChanged = new EventEmitter<string>();
  @Output() sortChanged = new EventEmitter<'asc' | 'desc'>();

  // Обработчик изменения текста фильтра (ngModelChange вызывает его)
  onFilterChange(): void {
    this.filterChanged.emit(this.filterText);
  }

  toggleSort(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortChanged.emit(this.sortDirection);
  }

  /*
   refactor: optimize and improve readability across the project
   * 1. Добавлен явный метод onFilterChange для обработки изменений фильтра через ngModelChange в шаблоне.
   */
}