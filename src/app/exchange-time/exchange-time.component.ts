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
  // Запрос обновления времени
  @Output() updateServerTime = new EventEmitter<void>(); 
  // Сигнал для серверного времени
  serverTime = signal<Date | null>(null);       
  // Сигнал для текущего времени        
  currentTime = signal<Date>(new Date());               
  private intervalId: any = null;

  onMouseEnter() {
    this.updateServerTime.emit(); // Запрашиваем обновление серверного времени

    // Останавливаем предыдущий таймер
    this.stopTimer();

    // Запускаем новый таймер для обоих значений
    this.intervalId = setInterval(() => {
      this.currentTime.update((time) => new Date(time.getTime() + 1000));
      this.serverTime.update((time) => time ? new Date(time.getTime() + 1000) : new Date());
    }, 1000);
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  setServerTime(time: Date | null) {
    // Метод для обновления serverTime извне
    if (time) {
      this.serverTime.set(new Date(time));
      this.currentTime.set(new Date(time)); // Синхронизируем currentTime
    }
  }

  private stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}