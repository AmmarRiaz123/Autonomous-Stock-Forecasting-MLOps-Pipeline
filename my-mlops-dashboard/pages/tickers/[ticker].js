import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ForecastChart from '../../components/ForecastChart';
import ModelComparisonTable from '../../components/ModelComparisonTable';
import { getTickerDetails, getForecast, getModels, deployModel } from '../../utils/api';

export default function TickerDetail() {
  const router = useRouter();
  const { ticker } = router.query;
  const [tickerData, setTickerData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (ticker) {
      loadTickerData();
    }
  }, [ticker]);

  const loadTickerData = async () => {
    try {
      const [details, forecastData, modelsData] = await Promise.all([
        getTickerDetails(ticker),
        getForecast(ticker, 30),
        getModels(ticker),
      ]);
      setTickerData(details);
      setForecast(forecastData);
      setModels(modelsData);
    } catch (error) {
      showNotification('Failed to load ticker data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (modelName) => {
    try {
      await deployModel(ticker, modelName);
      showNotification(`${modelName} deployed successfully!`, 'success');
      loadTickerData();
    } catch (error) {
      showNotification('Failed to deploy model', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => router.back()} style={styles.backBtn}>
          ← Back
        </button>
        <h1 className="page-title">{ticker}</h1>
        <p className="page-subtitle">
          Current Model: <strong>{tickerData?.currentModel}</strong> | 
          Last Trained: <strong>{new Date(tickerData?.lastTrained).toLocaleDateString()}</strong> |
          Status: <span className={`status-badge status-${tickerData?.status}`}>
            {tickerData?.status}
          </span>
        </p>
      </div>

      <div className="card">
        <h3 style={styles.sectionTitle}>Forecast vs Actual</h3>
        {forecast && (
          <ForecastChart
            actual={forecast.actual}
            forecast={forecast.predicted}
            dates={forecast.dates}
          />
        )}
      </div>

      <div className="card">
        <h3 style={styles.sectionTitle}>Model Comparison</h3>
        <ModelComparisonTable
          models={models}
          currentModel={tickerData?.currentModel}
          onDeploy={handleDeploy}
        />
      </div>

      <div className="card">
        <h3 style={styles.sectionTitle}>Agent Logs</h3>
        <div style={styles.logsContainer}>
          {tickerData?.logs?.map((log, idx) => (
            <div key={idx} style={styles.logEntry}>
              <span style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</span>
              <span style={styles.logMessage}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

const styles = {
  backBtn: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  logsContainer: {
    maxHeight: 400,
    overflowY: 'auto',
  },
  logEntry: {
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '0.875rem',
  },
  logTime: {
    color: '#6b7280',
    minWidth: 150,
  },
  logMessage: {
    flex: 1,
  },
};
