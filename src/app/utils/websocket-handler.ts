import { CryptoInstrument } from '../types/crypto-instrument';
import { WebSocketConfig } from './exchange-config';

export class WebSocketHandler {
  private ws: WebSocket | null = null;
  private exchange: string;

  constructor(exchange: string, private onData: (instruments: CryptoInstrument[], serverTime: Date | null, error?: string) => void) {
    this.exchange = exchange;
  }

  // Устанавливает WebSocket-соединение с биржей
  connect(config: WebSocketConfig) {
    this.ws = new WebSocket(config.wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket открыт для', this.exchange);
      this.ws?.send(JSON.stringify(config.subscriptionMessage));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Данные от', this.exchange, data);

        // Обрабатываем ошибочные события
        if (data.event || data.code) {
          this.onData([], null, `Ошибка от ${this.exchange}: ${data.event || data.code}`);
          return;
        }

        // Парсим и передаем данные
        const { instruments, serverTime } = this.parseData(data);
        console.log('Спарсенные инструменты:', instruments, 'Серверное время:', serverTime);
        this.onData(instruments, serverTime);
      } catch (err) {
        console.error('Ошибка парсинга данных WebSocket:', err);
        this.onData([], null, 'Ошибка парсинга данных');
      }
    };

    this.ws.onerror = (error) => {
      console.error('Ошибка WebSocket для', this.exchange, error);
      this.onData([], null, 'Ошибка соединения с WebSocket');
    };
  }

  // Закрывает WebSocket-соединение
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Парсит данные с разных бирж и приводит к общему формату
  private parseData(data: any): { instruments: CryptoInstrument[]; serverTime: Date | null } {
    let instruments: CryptoInstrument[] = [];
    let serverTime: Date | null = null;

    if (this.exchange === 'binance' && Array.isArray(data)) {
      // Парсинг данных Binance
      instruments = data.map((item: any) => ({
        symbol: item.s,
        lastPrice: parseFloat(item.c),
        volume: item.v,
        priceChangePercent: item.P,
        highPrice: item.h,
        lowPrice: item.l,
      }));
      serverTime = data[0]?.E ? new Date(data[0].E) : new Date();
    } else if (this.exchange === 'bybit' && data.topic?.startsWith('tickers')) {
      // Парсинг данных Bybit
      const item = data.data;
      instruments = [{
        symbol: item.symbol,
        lastPrice: parseFloat(item.lastPrice),
        volume: item.volume24h,
        priceChangePercent: item.price24hPcnt || '0',
        highPrice: item.highPrice24h,
        lowPrice: item.lowPrice24h,
      }];
      serverTime = data.ts ? new Date(data.ts) : new Date();
    } else if (this.exchange === 'okx' && data.arg?.channel === 'tickers' && Array.isArray(data.data)) {
      // Парсинг данных OKX
      instruments = data.data.map((item: any) => {
        const last = parseFloat(item.last || '0');
        const open24h = parseFloat(item.open24h || last);
        const priceChangePercent = open24h !== 0 ? (((last - open24h) / open24h) * 100).toFixed(2) : '0';
        return {
          symbol: item.instId,
          lastPrice: last,
          volume: item.vol24h || '0',
          priceChangePercent,
          highPrice: item.high24h || '0',
          lowPrice: item.low24h || '0',
        };
      });
      serverTime = data.data[0]?.ts ? new Date(parseInt(data.data[0].ts)) : new Date();
    }

    return { instruments, serverTime };
  }
}
