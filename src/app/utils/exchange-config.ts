// Интерфейс для конфигурации WebSocket-соединения
export interface WebSocketConfig {
  wsUrl: string; // URL WebSocket-сервера
  subscriptionMessage: any; // Сообщение для подписки (можно сделать более строгим позже)
}

// Функция получения WebSocket-конфигурации для конкретной биржи
export const getExchangeConfig = (exchange: string): WebSocketConfig => {
  // Используем объект вместо switch для более компактного и масштабируемого кода
  const configs: Record<string, WebSocketConfig> = {
    binance: {
      wsUrl: 'wss://fstream.binance.com/ws',
      subscriptionMessage: { method: 'SUBSCRIBE', params: ['!ticker@arr'], id: 1 },
    },
    bybit: {
      wsUrl: 'wss://stream.bybit.com/v5/public/spot',
      subscriptionMessage: { op: 'subscribe', args: ['tickers.BTCUSDT', 'tickers.ETHUSDT'] },
    },
    okx: {
      wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
      subscriptionMessage: {
        op: 'subscribe',
        args: [
          { channel: 'tickers', instId: 'BTC-USDT' },
          { channel: 'tickers', instId: 'ETH-USDT' },
        ],
      },
    },
  };

  // Возвращаем конфигурацию или значение по умолчанию (Binance), если биржа неизвестна
  return configs[exchange] || configs['binance'];
};

/*
  refactor: optimize and improve readability across the project
 * 1. Заменил switch на объект для упрощения добавления новых бирж и уменьшения дублирования кода.
 * 2. Тип `subscriptionMessage` оставлен как `any`, но в идеале стоит создать интерфейсы для каждого типа сообщения (BinanceSubscription, BybitSubscription и т.д.).
 * 3. Значение по умолчанию возвращается через объект, а не дублируется, что снижает вероятность ошибок при изменениях.
 */