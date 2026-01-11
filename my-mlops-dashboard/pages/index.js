import { useState, useEffect } from 'react';
import TickerCard from '../components/TickerCard';
import AddTickerModal from '../components/AddTickerModal';
import { getTickers, addTicker } from '../utils/api';

export default function Home() {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState({ status: 'all', model: 'all' });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadTickers();
  }, []);

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
      await addTicker(data);
      showNotification('Ticker added successfully! Training in progress...', 'success');
      loadTickers();
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
};
