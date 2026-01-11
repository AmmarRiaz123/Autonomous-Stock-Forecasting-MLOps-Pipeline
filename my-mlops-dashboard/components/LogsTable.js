import { useState } from 'react';

export default function LogsTable({ logs, onRetry }) {
  const [retrying, setRetrying] = useState(null);

  const handleRetry = async (logId, ticker) => {
    setRetrying(logId);
    try {
      await onRetry(ticker);
    } finally {
      setRetrying(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'success') return 'status-healthy';
    if (status === 'error' || status === 'failed') return 'status-error';
    return 'status-warning';
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Ticker</th>
            <th>Event</th>
            <th>Status</th>
            <th>Message</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {logs && logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td><strong>{log.ticker}</strong></td>
              <td>{log.event}</td>
              <td>
                <span className={`status-badge ${getStatusClass(log.status)}`}>
                  {log.status}
                </span>
              </td>
              <td style={styles.message}>{log.message}</td>
              <td>
                {(log.status === 'error' || log.status === 'failed') && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleRetry(log.id, log.ticker)}
                    disabled={retrying === log.id}
                    style={styles.retryBtn}
                  >
                    {retrying === log.id ? '⟳' : '🔄'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  message: {
    maxWidth: 300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  retryBtn: {
    fontSize: '0.8rem',
    padding: '0.4rem 0.8rem',
  },
};
