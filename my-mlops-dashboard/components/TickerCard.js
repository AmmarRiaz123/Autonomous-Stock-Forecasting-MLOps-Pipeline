import Link from 'next/link';
import { STATUS_COLORS, STATUS_ICONS } from '../utils/constants';

export default function TickerCard({ ticker }) {
  const statusColor = STATUS_COLORS[ticker.status] || STATUS_COLORS.warning;
  const statusIcon = STATUS_ICONS[ticker.status] || STATUS_ICONS.warning;

  return (
    <Link href={`/tickers/${ticker.symbol}`} style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.symbol}>{ticker.symbol}</h3>
        <span style={{ ...styles.status, background: `${statusColor}20`, color: statusColor }}>
          {statusIcon} {ticker.status}
        </span>
      </div>
      <div style={styles.info}>
        <div style={styles.infoItem}>
          <span style={styles.label}>Model:</span>
          <span style={styles.value}>{ticker.currentModel}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.label}>Last Trained:</span>
          <span style={styles.value}>{new Date(ticker.lastTrained).toLocaleDateString()}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.label}>Accuracy:</span>
          <span style={styles.value}>{ticker.accuracy ? `${ticker.accuracy.toFixed(2)}%` : 'N/A'}</span>
        </div>
      </div>
      <div style={styles.miniChart}>
        {/* Placeholder for mini chart */}
        <div style={styles.chartPlaceholder}>📈 Chart</div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    background: 'white',
    borderRadius: 8,
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  symbol: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#111827',
  },
  status: {
    padding: '0.25rem 0.75rem',
    borderRadius: 9999,
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  label: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  value: {
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#111827',
  },
  miniChart: {
    height: 80,
    background: '#f9fafb',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    color: '#9ca3af',
    fontSize: '0.875rem',
  },
};
