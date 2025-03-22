import { CryptoInstrument } from '../types/crypto-instrument';
import { WebSocketConfig } from './exchange-config';

export class WebSocketHandler {
  private ws: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private readonly reconnectDelay = 2000; // Задержка перед повторным подключением в мс

  constructor(
    private exchange: string,
    private onData: (instruments: CryptoInstrument[], serverTime: Date | null, error?: string) => void
  ) {}

  // Устанавливает WebSocket-соединение с биржей
  connect(config: WebSocketConfig): void {
    this.ws = new WebSocket(config.wsUrl);

    this.ws.onopen = () => {
      console.log(`WebSocket открыт для ${this.exchange}`);
      this.ws?.send(JSON.stringify(config.subscriptionMessage));
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`Данные от ${this.exchange}:`, data);

        if (data.event || data.code) {
          this.onData([], null, `Ошибка от ${this.exchange}: ${data.event || data.code}`);
          return;
        }

        const { instruments, serverTime } = this.parseData(data);
        this.onData(instruments, serverTime);
      } catch (err) {
        console.error(`Ошибка парсинга данных WebSocket для ${this.exchange}:`, err);
        this.onData([], null, 'Ошибка парсинга данных');
      }
    };

    this.ws.onerror = () => {
      console.error(`Ошибка WebSocket для ${this.exchange}`);
      this.onData([], null, 'Ошибка соединения с WebSocket');
      this.scheduleReconnect(config);
    };

    this.ws.onclose = () => {
      console.log(`WebSocket закрыт для ${this.exchange}`);
      this.scheduleReconnect(config);
    };
  }

  // Закрывает WebSocket-соединение
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // Планирует повторное подключение при ошибке или закрытии
  private scheduleReconnect(config: WebSocketConfig): void {
    if (!this.reconnectTimeout) {
      this.reconnectTimeout = window.setTimeout(() => {
        console.log(`Повторное подключение к ${this.exchange}...`);
        this.connect(config);
      }, this.reconnectDelay);
    }
  }

  // Парсит данные с разных бирж и приводит к общему формату
  private parseData(data: any): { instruments: CryptoInstrument[]; serverTime: Date | null } {
    let instruments: CryptoInstrument[] = [];
    let serverTime: Date | null = null;

    if (this.exchange === 'binance' && Array.isArray(data)) {
      instruments = data.map((item: any) => ({
        symbol: item.s,
        lastPrice: parseFloat(item.c || '0'),
        volume: item.v || '0',
        priceChangePercent: item.P || '0',
        highPrice: item.h || '0',
        lowPrice: item.l || '0',
      }));
      serverTime = data[0]?.E ? new Date(data[0].E) : new Date();
    } else if (this.exchange === 'bybit' && data.topic?.startsWith('tickers')) {
      const item = data.data;
      instruments = [{
        symbol: item.symbol,
        lastPrice: parseFloat(item.lastPrice || '0'),
        volume: item.volume24h || '0',
        priceChangePercent: item.price24hPcnt || '0',
        highPrice: item.highPrice24h || '0',
        lowPrice: item.lowPrice24h || '0',
      }];
      serverTime = data.ts ? new Date(data.ts) : new Date();
    } else if (this.exchange === 'okx' && data.arg?.channel === 'tickers' && Array.isArray(data.data)) {
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

  /*
    refactor: optimize and improve readability across the project
   * 1. Добавлен механизм повторного подключения (reconnect) при ошибке или закрытии соединения — это улучшает надежность.
   * 2. Добавлены проверки на null/undefined в parseFloat и значения по умолчанию ('0'), чтобы избежать NaN.
   * 3. Логирование улучшено для удобства отладки.
   * 4. Метод parseData можно рефакторить в отдельные парсеры для каждой биржи, если логика станет сложнее.
   */
}