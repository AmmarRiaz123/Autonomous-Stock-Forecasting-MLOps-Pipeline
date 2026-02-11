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

export async function getSettings() {
  console.log('📡 API Call: GET /api/settings');
  console.log('   URL:', `${API_BASE_URL}/api/settings`);
  
  const response = await fetch(`${API_BASE_URL}/api/settings`);
  
  if (!response.ok) {
    console.error('❌ Failed to fetch settings, status:', response.status);
    throw new Error('Failed to fetch settings');
  }
  
  const data = await response.json();
  console.log('📥 Raw settings from backend:', JSON.stringify(data, null, 2));
  
  // Validate the data structure
  if (!data || typeof data !== 'object') {
    console.error('❌ Invalid settings data structure:', data);
    throw new Error('Invalid settings data');
  }
  
  // Backend returns snake_case, normalize it
  const normalized = {
    retrain_frequency: data.retrain_frequency || 'Weekly',
    drift_threshold: typeof data.drift_threshold === 'number' ? data.drift_threshold : 0.2,
    enable_auto_deploy: data.enable_auto_deploy ?? true,
    slack_webhook_url: data.slack_webhook_url || '',
    candidate_models: Array.isArray(data.candidate_models) ? data.candidate_models : [],
    exchanges_enabled: Array.isArray(data.exchanges_enabled) ? data.exchanges_enabled : [],
  };
  
  console.log('📦 Normalized settings:', JSON.stringify(normalized, null, 2));
  console.log('   ✓ candidate_models:', normalized.candidate_models);
  console.log('   ✓ exchanges_enabled:', normalized.exchanges_enabled);
  
  return normalized;
}

export async function updateSettings(settings) {
  console.log('📡 API Call: PUT /api/settings');
  console.log('📤 Sending settings:', settings);
  
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Failed to update settings:', error);
    throw new Error(error.detail || 'Failed to update settings');
  }
  
  const data = await response.json();
  console.log('📥 Backend response after save:', data);
  
  // Return normalized settings
  return {
    retrain_frequency: data.retrain_frequency || 'Weekly',
    drift_threshold: data.drift_threshold || 0.2,
    enable_auto_deploy: data.enable_auto_deploy ?? true,
    slack_webhook_url: data.slack_webhook_url || '',
    candidate_models: Array.isArray(data.candidate_models) ? data.candidate_models : [],
    exchanges_enabled: Array.isArray(data.exchanges_enabled) ? data.exchanges_enabled : [],
  };
}

export const retryPipeline = async (ticker) => {
  const response = await fetch(`${API_BASE_URL}/api/pipeline/${ticker}/retry`, {
    method: 'POST'
  });
  return handleResponse(response);
};

export const getPipelineStatus = async (ticker) => {
  const response = await fetch(`${API_BASE_URL}/api/pipeline/${encodeURIComponent(ticker)}/status`);
  return handleResponse(response);
};
