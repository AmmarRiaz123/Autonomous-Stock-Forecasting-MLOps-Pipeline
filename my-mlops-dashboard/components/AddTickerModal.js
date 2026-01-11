import { useState } from 'react';
import { EXCHANGES } from '../utils/constants';

export default function AddTickerModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    symbol: '',
    exchange: 'NYSE',
    startDate: '',
    forecastHorizon: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.symbol || !formData.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ symbol: '', exchange: 'NYSE', startDate: '', forecastHorizon: 30 });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add ticker');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Ticker</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ticker Symbol *</label>
            <input
              type="text"
              name="symbol"
              className="form-input"
              placeholder="e.g., AAPL"
              value={formData.symbol}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Exchange *</label>
            <select
              name="exchange"
              className="form-select"
              value={formData.exchange}
              onChange={handleChange}
              required
            >
              {EXCHANGES.map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input
              type="date"
              name="startDate"
              className="form-input"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Forecast Horizon (days)</label>
            <input
              type="number"
              name="forecastHorizon"
              className="form-input"
              value={formData.forecastHorizon}
              onChange={handleChange}
              min="1"
              max="365"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Ticker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  error: {
    padding: '0.75rem',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: 6,
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
};
