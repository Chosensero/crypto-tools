import { Component, OnDestroy, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exchange-time',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exchange-time.component.html',
  styles: [],
})
export class ExchangeTimeComponent implements OnDestroy {
  @Output() updateServerTime = new EventEmitter<void>();
  serverTime = signal<Date | null>(null);
  currentTime = signal<Date>(new Date());
  private intervalId: number | null = null;

  onMouseEnter(): void {
    this.updateServerTime.emit();

    this.stopTimer();

    this.intervalId = window.setInterval(() => {
      this.currentTime.update((time) => new Date(time.getTime() + 1000));
      this.serverTime.update((time) => (time ? new Date(time.getTime() + 1000) : new Date()));
    }, 1000);
  }

  onMouseLeave(): void {
    this.stopTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  setServerTime(time: Date | null): void {
    if (time) {
      this.serverTime.set(new Date(time));
      this.currentTime.set(new Date(time));
    }
  }

  private stopTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /*
   refactor: optimize and improve readability across the project
   * 1. Добавлен onMouseLeave для остановки таймера при уходе мыши — это предотвращает ненужные обновления.
   * 2. Использование Signals упрощает управление состоянием времени.
   * 3. Тип intervalId изменен на number | null для совместимости с window.setInterval.
   */
}