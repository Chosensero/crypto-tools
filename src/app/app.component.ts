import { Component, OnDestroy, ViewChild } from '@angular/core';
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
    DividerModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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

  constructor() {
    this.connectWebSocket('binance');
  }

  ngOnDestroy() {
    this.wsHandler?.disconnect();
  }

  // Объединяет новые данные с уже существующими инструментами
  private mergeInstruments(existing: CryptoInstrument[], newData: CryptoInstrument[]): CryptoInstrument[] {
    const result = [...existing];
    newData.forEach((newInst) => {
      const index = result.findIndex((inst) => inst.symbol === newInst.symbol);
      if (index !== -1) {
        result[index] = newInst; // Обновление данных
      } else {
        result.push(newInst); // Добавление нового инструмента
      }
    });
    return result;
  }

  // Применяет фильтрацию и сортировку к инструментам
  private applyFilterAndSort() {
    const instruments = this.allInstruments();
    let filtered = instruments.filter((instrument) =>
      instrument.symbol.toLowerCase().includes(this.filterText().toLowerCase())
    );
    filtered.sort((a, b) =>
      this.sortDirection() === 'asc' ? a.lastPrice - b.lastPrice : b.lastPrice - a.lastPrice
    );

    // Ограничение количества инструментов для Binance
    const maxInstruments = this.currentExchange === 'binance' ? 1000 : filtered.length;
    this.filteredInstruments.set(filtered.slice(0, maxInstruments));
  }

  // Обработчик выбора биржи
  onExchangeSelected(exchange: string) {
    this.currentExchange = exchange;
    this.loading.set(true);
    this.error.set(null);
    this.allInstruments.set([]);
    this.filteredInstruments.set([]);
    this.wsHandler?.disconnect();
    this.connectWebSocket(exchange);
  }

  // Обработчик изменения фильтра
  onFilterChanged(filterText: string) {
    this.filterText.set(filterText);
    this.applyFilterAndSort();
  }

  // Обработчик изменения сортировки
  onSortChanged(sortDirection: 'asc' | 'desc') {
    this.sortDirection.set(sortDirection);
    this.applyFilterAndSort();
  }

  // Обновляет серверное время в компоненте времени
  onUpdateServerTime() {
    if (this.exchangeTimeComponent) {
      this.exchangeTimeComponent.setServerTime(this.lastServerTime);
    }
    if (this.exchangeTimeMobileComponent) {
      this.exchangeTimeMobileComponent.setServerTime(this.lastServerTime);
    }
  }

  // Устанавливает WebSocket-соединение для указанной биржи
  private connectWebSocket(exchange: string) {
    const config = getExchangeConfig(exchange);
    this.wsHandler = new WebSocketHandler(exchange, (instruments, serverTime, error) => {
      this.handleWebSocketData(instruments, serverTime, error);
    });
    this.wsHandler.connect(config);
  }

  // Обрабатывает входящие данные с WebSocket
  private handleWebSocketData(instruments: CryptoInstrument[], serverTime: Date | null, error?: string) {
    if (error) {
      this.error.set(error);
      this.loading.set(false);
      return;
    }

    if (instruments.length > 0) {
      this.allInstruments.update((existing) => this.mergeInstruments(existing, instruments));
      this.lastServerTime = serverTime;
      this.loading.set(false);
      this.error.set(null);
      this.applyFilterAndSort();
    }
  }
}
