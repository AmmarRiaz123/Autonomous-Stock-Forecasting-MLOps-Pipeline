import { useState, useEffect } from 'react';
import LogsTable from '../components/LogsTable';
import { getLogs, retryPipeline } from '../utils/api';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ ticker: '', status: 'all' });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await getLogs(filter.ticker || null);
      setLogs(data);
    } catch (error) {
      showNotification('Failed to load logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (ticker) => {
    try {
      await retryPipeline(ticker);
      showNotification('Pipeline retry initiated', 'success');
      loadLogs();
    } catch (error) {
      showNotification('Failed to retry pipeline', 'error');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Ticker', 'Event', 'Status', 'Message'],
      ...logs.map((log) => [
        new Date(log.timestamp).toISOString(),
        log.ticker,
        log.event,
        log.status,
        log.message,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredLogs = logs.filter((log) => {
    if (filter.status !== 'all' && log.status !== filter.status) return false;
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={styles.headerTop}>
          <div>
            <h1 className="page-title">Logs & Alerts</h1>
            <p className="page-subtitle">Monitor pipeline events and system logs</p>
          </div>
          <button className="btn btn-primary" onClick={handleExport}>
            📥 Export Logs
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="form-label">Ticker</label>
          <input
            type="text"
            className="form-input"
            placeholder="Filter by ticker..."
            value={filter.ticker}
            onChange={(e) => setFilter({ ...filter, ticker: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="filter-group" style={styles.refreshBtn}>
          <button className="btn btn-secondary" onClick={loadLogs} style={{ width: '100%' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="card">
          <LogsTable logs={filteredLogs} onRetry={handleRetry} />
        </div>
      )}

      {!loading && filteredLogs.length === 0 && (
        <div className="card" style={styles.emptyState}>
          <p>No logs found.</p>
        </div>
      )}

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
  refreshBtn: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280',
  },
};
