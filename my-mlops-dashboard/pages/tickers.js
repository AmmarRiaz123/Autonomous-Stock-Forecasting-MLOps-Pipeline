import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getTickers } from '../utils/api';
import AddTickerModal from '../components/AddTickerModal';
import { addTicker } from '../utils/api';
import { getPipelineStatus } from '../utils/api'; // NEW

export default function Tickers() {
  const router = useRouter();
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [pipeline, setPipeline] = useState(null);

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
        // ignore
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
      loadTickers();
    } catch (error) {
      throw error;
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={styles.headerTop}>
          <div>
            <h1 className="page-title">Tickers</h1>
            <p className="page-subtitle">Manage all tracked stock tickers</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + Add Ticker
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Exchange</th>
                  <th>Current Model</th>
                  <th>Last Trained</th>
                  <th>Status</th>
                  <th>Accuracy</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickers.map((ticker) => (
                  <tr key={ticker.symbol}>
                    <td><strong>{ticker.symbol}</strong></td>
                    <td>{ticker.exchange}</td>
                    <td>{ticker.currentModel}</td>
                    <td>{new Date(ticker.lastTrained).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${ticker.status}`}>
                        {ticker.status}
                      </span>
                    </td>
                    <td>{ticker.accuracy ? `${ticker.accuracy.toFixed(2)}%` : 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        style={styles.viewBtn}
                        onClick={() => router.push(`/tickers/${ticker.symbol}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <div style={{ ...styles.progressFill, width: `${Math.min(100, Math.max(0, pipeline.progress || 0))}%` }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              {Math.round(pipeline.progress || 0)}%
            </div>
          </div>
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
  viewBtn: {
    fontSize: '0.8rem',
    padding: '0.4rem 0.8rem',
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
