export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const STATUS_COLORS = {
  healthy: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

export const STATUS_ICONS = {
  healthy: '✅',
  warning: '⚠️',
  error: '❌'
};

export const EXCHANGES = ['NYSE', 'NASDAQ', 'LSE', 'TSE', 'HKEX'];

export const RETRAIN_FREQUENCIES = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly'];

export const AVAILABLE_MODELS = [
  'LSTM',
  'GRU',
  'Transformer',
  'XGBoost',
  'Prophet',
  'ARIMA'
];

export const API_PREFIX = '/api';

export const API_ROUTES = {
  health: `${API_PREFIX}/health`,
  tickers: `${API_PREFIX}/tickers`,
  ticker: (ticker) => `${API_PREFIX}/tickers/${encodeURIComponent(ticker)}`,
  forecast: (ticker) => `${API_PREFIX}/forecast/${encodeURIComponent(ticker)}`,
  models: (ticker) => `${API_PREFIX}/models/${encodeURIComponent(ticker)}`,
  deployModel: (ticker) => `${API_PREFIX}/models/${encodeURIComponent(ticker)}/deploy`,
  logs: `${API_PREFIX}/logs`,
  retryPipeline: (ticker) => `${API_PREFIX}/pipeline/${encodeURIComponent(ticker)}/retry`,
  settings: `${API_PREFIX}/settings`,
};
