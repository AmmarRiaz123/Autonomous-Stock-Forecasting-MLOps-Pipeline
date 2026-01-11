import { API_BASE_URL } from './constants';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `Error: ${response.status}`);
  }
  return response.json();
};

export const getTickers = async () => {
  const response = await fetch(`${API_BASE_URL}/api/tickers`);
  return handleResponse(response);
};

export const getTickerDetails = async (ticker) => {
  const response = await fetch(`${API_BASE_URL}/api/tickers/${ticker}`);
  return handleResponse(response);
};

export const addTicker = async (data) => {
  const response = await fetch(`${API_BASE_URL}/api/tickers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const getForecast = async (ticker, horizon) => {
  const response = await fetch(`${API_BASE_URL}/api/forecast/${ticker}?horizon=${horizon}`);
  return handleResponse(response);
};

export const getModels = async (ticker) => {
  const response = await fetch(`${API_BASE_URL}/api/models/${ticker}`);
  return handleResponse(response);
};

export const deployModel = async (ticker, model) => {
  const response = await fetch(`${API_BASE_URL}/api/models/${ticker}/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model })
  });
  return handleResponse(response);
};

export const getLogs = async (ticker = null) => {
  const url = ticker 
    ? `${API_BASE_URL}/api/logs?ticker=${ticker}`
    : `${API_BASE_URL}/api/logs`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const getMonitoringStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/api/monitoring/status`);
  return handleResponse(response);
};

export const updateSettings = async (data) => {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const getSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/api/settings`);
  return handleResponse(response);
};

export const retryPipeline = async (ticker) => {
  const response = await fetch(`${API_BASE_URL}/api/pipeline/${ticker}/retry`, {
    method: 'POST'
  });
  return handleResponse(response);
};
