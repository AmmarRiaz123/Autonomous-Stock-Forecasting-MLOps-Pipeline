import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getTickers } from '../utils/api';
import AddTickerModal from '../components/AddTickerModal';
import { addTicker } from '../utils/api';

export default function Tickers() {
  const router = useRouter();
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
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
      showNotification('Ticker added successfully!', 'success');
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
};
