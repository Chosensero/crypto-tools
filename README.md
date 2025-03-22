# Crypto Exchange Dashboard

## Описание
Приложение для отслеживания данных с криптовалютных бирж в реальном времени. Поддерживает Binance, Bybit и OKX.

## Стек технологий
- **Angular** (Standalone Components)
- **PrimeNG** (UI-компоненты)
- **WebSocket** (получение данных о криптовалютах)

## Установка и запуск

### 1. Клонирование репозитория
```sh
git clone <репозиторий>
cd <папка_проекта>
```

### 2. Установка зависимостей
```sh
npm install
```

### 3. Запуск приложения
```sh
ng serve
```
Приложение запустится на `http://localhost:4200/`.

## Структура проекта
```
src/
├── app/
│   ├── components/
│   │   ├── exchange-selector/       # Выбор биржи
│   │   ├── exchange-time/           # Время сервера
│   │   ├── filter-sort/             # Фильтрация и сортировка
│   │   ├── crypto-table/            # Таблица с крипто-данными
│   ├── types/
│   │   ├── crypto-instrument.ts     # Интерфейс крипто-инструмента
│   │   ├── exchange-option.ts       # Интерфейс биржевых опций
│   ├── utils/
│   │   ├── websocket-handler.ts     # Управление WebSocket-соединением
│   │   ├── exchange-config.ts       # Конфигурация WebSocket для бирж
│   ├── app.component.ts             # Корневой компонент
│   ├── app.component.html           # Шаблон корневого компонента
│   ├── app.component.scss           # Стили корневого компонента
│   ├── app.config.ts                # Конфиг приложения
└── ...
```

## Настройки WebSocket
Конфигурация соединения с биржами находится в `src/app/utils/exchange-config.ts`.

## Лицензия
MIT

