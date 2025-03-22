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
    InputGroupAddonModule
  ],
  templateUrl: `./filter-sort.component.html`,
  styles:  ''
})
export class FilterSortComponent {
  // Текущий текст фильтра
  filterText: string = '';
  
  // Текущее направление сортировки
  sortDirection: 'asc' | 'desc' = 'asc';

  // Событие при изменении фильтра
  @Output() filterChanged = new EventEmitter<string>();

  // Событие при изменении сортировки
  @Output() sortChanged = new EventEmitter<'asc' | 'desc'>();

  // Переключает направление сортировки и эмитит событие
  toggleSort(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortChanged.emit(this.sortDirection);
  }
}
