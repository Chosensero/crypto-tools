// Интерфейс для конфигурации WebSocket-соединения
export interface WebSocketConfig {
  wsUrl: string; // URL WebSocket-сервера
  subscriptionMessage: any; // Сообщение для подписки
}

// Функция получения WebSocket-конфигурации для конкретной биржи
export const getExchangeConfig = (exchange: string): WebSocketConfig => {
  switch (exchange) {
      case 'binance':
          return {
              wsUrl: 'wss://fstream.binance.com/ws',
              subscriptionMessage: { method: 'SUBSCRIBE', params: ['!ticker@arr'], id: 1 },
          };
      case 'bybit':
          return {
              wsUrl: 'wss://stream.bybit.com/v5/public/spot',
              subscriptionMessage: { op: 'subscribe', args: ['tickers.BTCUSDT', 'tickers.ETHUSDT'] },
          };
      case 'okx':
          return {
              wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
              subscriptionMessage: {
                  op: 'subscribe',
                  args: [
                      { channel: 'tickers', instId: 'BTC-USDT' },
                      { channel: 'tickers', instId: 'ETH-USDT' },
                  ],
              },
          };
      default:
          // Значение по умолчанию — Binance
          return {
              wsUrl: 'wss://fstream.binance.com/ws',
              subscriptionMessage: { method: 'SUBSCRIBE', params: ['!ticker@arr'], id: 1 },
          };
  }
};
