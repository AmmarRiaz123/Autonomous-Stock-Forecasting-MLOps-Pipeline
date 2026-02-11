import { useState, useEffect } from 'react';
import TickerCard from '../components/TickerCard';
import AddTickerModal from '../components/AddTickerModal';
import { getTickers, addTicker, getPipelineStatus } from '../utils/api';

export default function Home() {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState({ status: 'all', model: 'all' });
  const [notification, setNotification] = useState(null);
  const [pipeline, setPipeline] = useState(null); // { ticker, status, stage, progress, message, error }

  useEffect(() => {
    loadTickers();
  }, []);

  useEffect(() => {
    if (!pipeline?.ticker) return;

    let alive = true;
    const ticker = pipeline.ticker;

    const tick = async () => {
      try {
        const s = await getPipelineStatus(ticker);
        if (!alive) return;
        setPipeline((p) => ({ ...(p || {}), ...s }));
        if (s.status === 'success' || s.status === 'error') {
          await loadTickers();
        }
      } catch {
        // ignore transient polling errors
      }
    };

    const id = setInterval(tick, 1500);
    tick();

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [pipeline?.ticker]);

  const loadTickers = async () => {
    try {
      const data = await getTickers();
      setTickers(data);
    } catch (error) {
      showNotification('Failed to load tickers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicker = async (data) => {
    try {
      const t = (data?.ticker || data?.symbol || '').toString().trim().toUpperCase();
      await addTicker({ ...data, ticker: t });
      showNotification('Ticker added. Pipeline started...', 'success');
      setPipeline({ ticker: t, status: 'running', stage: 'queued', progress: 0, message: 'Queued' });
    } catch (error) {
      throw error;
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredTickers = tickers.filter((ticker) => {
    if (filter.status !== 'all' && ticker.status !== filter.status) return false;
    if (filter.model !== 'all' && ticker.currentModel !== filter.model) return false;
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={styles.headerTop}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Monitor all your stock forecasting models</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + Add Ticker
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="all">All</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="form-label">Model</label>
          <select
            className="form-select"
            value={filter.model}
            onChange={(e) => setFilter({ ...filter, model: e.target.value })}
          >
            <option value="all">All Models</option>
            <option value="LSTM">LSTM</option>
            <option value="GRU">GRU</option>
            <option value="Transformer">Transformer</option>
            <option value="XGBoost">XGBoost</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="card-grid">
          {filteredTickers.map((ticker) => (
            <TickerCard key={ticker.symbol} ticker={ticker} />
          ))}
        </div>
      )}

      {!loading && filteredTickers.length === 0 && (
        <div className="card" style={styles.emptyState}>
          <p>No tickers found. Add your first ticker to get started!</p>
        </div>
      )}

      <AddTickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTicker}
      />

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {pipeline?.status === 'running' && (
        <div style={styles.overlay}>
          <div style={styles.overlayCard}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Running pipeline for {pipeline.ticker}
            </div>
            <div style={{ marginBottom: 8, color: '#6b7280' }}>
              {pipeline.stage}: {pipeline.message}
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(100, Math.max(0, pipeline.progress || 0))}%`,
                }}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              {Math.round(pipeline.progress || 0)}%
            </div>
          </div>
        </div>
      )}

      {pipeline?.status === 'error' && (
        <div className="notification notification-error">
          Pipeline failed for {pipeline.ticker}: {pipeline.error || 'Unknown error'}
          <button
            className="btn btn-secondary"
            style={{ marginLeft: 12 }}
            onClick={() => setPipeline(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {pipeline?.status === 'success' && (
        <div className="notification notification-success">
          Pipeline completed for {pipeline.ticker}
          <button
            className="btn btn-secondary"
            style={{ marginLeft: 12 }}
            onClick={() => setPipeline(null)}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  overlayCard: {
    width: 420,
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  progressBar: {
    height: 10,
    background: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#3b82f6',
    transition: 'width 200ms linear',
  },
};
