import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoInstrument } from '../types/crypto-instrument';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-crypto-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ProgressSpinnerModule,
    TooltipModule,
    InputTextModule,
  ],
  templateUrl: './crypto-table.component.html',
  styleUrls: ['./crypto-table.component.scss'],
})
export class CryptoTableComponent {
  @Input() instruments: CryptoInstrument[] = [];
  @Input() loading: boolean = true;
  @Input() error: string | null = null;

  @ViewChild('dt') dt!: Table;

  // Фильтрация таблицы по глобальному значению
  onFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }

  // Форматирует объём торгов в удобочитаемый вид (K — тысячи, M — миллионы)
  formatVolume(volume: string): string {
    const num = parseFloat(volume);
    if (isNaN(num)) return '0';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
    return num.toFixed(2);
  }

  /*
   refactor: optimize and improve readability across the project
   * 1. Добавлена проверка на наличие dt в onFilter, чтобы избежать ошибок при отсутствии таблицы.
   * 2. Метод formatVolume оптимизирован и безопасен для некорректных данных.
   * 3. Для больших списков можно добавить виртуальный скроллинг через p-table [virtualScroll]="true".
   */
}