import { Component, OnDestroy, ViewChild, computed } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ExchangeSelectorComponent } from './exchange-selector/exchange-selector.component';
import { ExchangeTimeComponent } from './exchange-time/exchange-time.component';
import { FilterSortComponent } from './filter-sort/filter-sort.component';
import { CryptoTableComponent } from './crypto-table/crypto-table.component';
import { WebSocketHandler } from './utils/websocket-handler';
import { getExchangeConfig } from './utils/exchange-config';
import { CryptoInstrument } from './types/crypto-instrument';
import { signal } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';

// Утилита для фильтрации и сортировки инструментов, вынесена для переиспользования
export function filterAndSortInstruments(
  instruments: CryptoInstrument[],
  filterText: string,
  sortDirection: 'asc' | 'desc',
  maxItems: number
): CryptoInstrument[] {
  let filtered = instruments.filter((instrument) =>
    instrument.symbol.toLowerCase().includes(filterText.toLowerCase())
  );
  filtered.sort((a, b) =>
    sortDirection === 'asc' ? a.lastPrice - b.lastPrice : b.lastPrice - a.lastPrice
  );
  return filtered.slice(0, maxItems);
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ExchangeSelectorComponent,
    ExchangeTimeComponent,
    FilterSortComponent,
    CryptoTableComponent,
    ToolbarModule,
    CardModule,
    ProgressSpinnerModule,
    DividerModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  @ViewChild('exchangeTime') exchangeTimeComponent!: ExchangeTimeComponent;
  @ViewChild('exchangeTimeMobile') exchangeTimeMobileComponent!: ExchangeTimeComponent;

  loading = signal(true); 
  error = signal<string | null>(null); 
  filteredInstruments = signal<CryptoInstrument[]>([]); 
  private allInstruments = signal<CryptoInstrument[]>([]); 
  private filterText = signal('');
  private sortDirection = signal<'asc' | 'desc'>('asc'); 
  private wsHandler: WebSocketHandler | null = null; 
  private lastServerTime: Date | null = null; 
  private currentExchange: string = 'binance'; 
  private filterSubject = new Subject<string>();

  // Мемоизация фильтрации и сортировки, чтобы не пересчитывать лишний раз
  private filteredInstrumentsComputed = computed(() => {
    const maxInstruments = this.currentExchange === 'binance' ? 1000 : Infinity; 
    return filterAndSortInstruments(this.allInstruments(), this.filterText(), this.sortDirection(), maxInstruments);
  });

  constructor() {
    // Настраиваем задержку 300 мс для фильтрации, чтобы не нагружать UI при быстром вводе
    this.filterSubject.pipe(debounceTime(300)).subscribe((filterText) => {
      this.filterText.set(filterText);
      this.filteredInstruments.set(this.filteredInstrumentsComputed());
    });
    this.connectWebSocket('binance');
  }

  // Очищаем ресурсы, когда компонент уничтожается
  ngOnDestroy(): void {
    this.wsHandler?.disconnect(); 
    this.filterSubject.complete();
  }

  // Обрабатываем выбор новой биржи пользователем
  onExchangeSelected(exchange: string): void {
    this.currentExchange = exchange;
    this.loading.set(true); 
    this.error.set(null);
    this.allInstruments.set([]); 
    this.filteredInstruments.set([]);
    this.wsHandler?.disconnect(); 
    this.connectWebSocket(exchange); 
  }

  // Передаем текст фильтра для обработки с задержкой
  onFilterChanged(filterText: string): void {
    this.filterSubject.next(filterText);
  }

  // Меняем направление сортировки и обновляем список
  onSortChanged(sortDirection: 'asc' | 'desc'): void {
    this.sortDirection.set(sortDirection);
    this.filteredInstruments.set(this.filteredInstrumentsComputed());
  }

  onUpdateServerTime(): void {
    if (this.exchangeTimeComponent) this.exchangeTimeComponent.setServerTime(this.lastServerTime);
    if (this.exchangeTimeMobileComponent) this.exchangeTimeMobileComponent.setServerTime(this.lastServerTime);
  }

  // Настраиваем WebSocket-соединение для выбранной биржи
  private connectWebSocket(exchange: string): void {
    const config = getExchangeConfig(exchange);
    this.wsHandler = new WebSocketHandler(exchange, (instruments, serverTime, error) =>
      this.handleWebSocketData(instruments, serverTime, error)
    );
    this.wsHandler.connect(config);
  }

  // Обрабатываем данные с WebSocket, обновляем состояние
  private handleWebSocketData(instruments: CryptoInstrument[], serverTime: Date | null, error?: string): void {
    if (error) {
      this.error.set(`Failed to load data from ${this.currentExchange}: ${error}`);
      this.loading.set(false);
      return;
    }
    if (instruments.length > 0) {
      this.allInstruments.update((existing) => this.mergeInstruments(existing, instruments)); // Обновляем инструменты
      this.lastServerTime = serverTime; // Сохраняем время сервера
      this.loading.set(false); // Выключаем загрузку
      this.error.set(null); // Очищаем ошибки
      this.filteredInstruments.set(this.filteredInstrumentsComputed()); // Применяем фильтр и сортировку
    }
  }

  // Обновляем существующий список инструментов новыми данными
  private mergeInstruments(existing: CryptoInstrument[], newData: CryptoInstrument[]): CryptoInstrument[] {
    const result = [...existing];
    newData.forEach((newInst) => {
      const index = result.findIndex((inst) => inst.symbol === newInst.symbol);
      if (index !== -1) result[index] = newInst; 
      else result.push(newInst);
    });
    return result;
  }
}