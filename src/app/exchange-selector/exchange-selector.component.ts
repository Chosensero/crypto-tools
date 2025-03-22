import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ExchangeOption } from '../types/exchange-option';

@Component({
  selector: 'app-exchange-selector',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule],
  templateUrl: './exchange-selector.component.html',
  styles: []
})
export class ExchangeSelectorComponent {
  @Output() exchangeSelected = new EventEmitter<string>();

  // Список доступных бирж
  exchanges: ExchangeOption[] = [
    { label: 'Binance', value: 'binance' },
    { label: 'Bybit', value: 'bybit' },
    { label: 'OKX', value: 'okx' }
  ];

  // Выбранная по умолчанию биржа
  selectedExchange: string = 'binance';

  // Обработчик смены биржи
  onExchangeChange(event: any): void {
    const exchange = event.value;
    this.exchangeSelected.emit(exchange);
  }
}
