import { useState, useEffect } from 'react';
import { RETRAIN_FREQUENCIES, AVAILABLE_MODELS } from '../utils/constants';

export default function SettingsForm({ initialSettings, onSave }) {
  const [settings, setSettings] = useState({
    retrainFrequency: 'Daily',
    driftThreshold: 0.1,
    slackWebhook: '',
    candidateModels: ['LSTM', 'GRU', 'Transformer'],
    autoSelectBest: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleModelToggle = (model) => {
    const models = settings.candidateModels.includes(model)
      ? settings.candidateModels.filter((m) => m !== model)
      : [...settings.candidateModels, model];
    setSettings({ ...settings, candidateModels: models });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(settings);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      retrainFrequency: 'Daily',
      driftThreshold: 0.1,
      slackWebhook: '',
      candidateModels: ['LSTM', 'GRU', 'Transformer'],
      autoSelectBest: true,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Retrain Frequency</label>
        <select
          name="retrainFrequency"
          className="form-select"
          value={settings.retrainFrequency}
          onChange={handleChange}
        >
          {RETRAIN_FREQUENCIES.map((freq) => (
            <option key={freq} value={freq}>{freq}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Drift Threshold</label>
        <input
          type="number"
          name="driftThreshold"
          className="form-input"
          value={settings.driftThreshold}
          onChange={handleChange}
          step="0.01"
          min="0"
          max="1"
        />
        <small style={styles.hint}>Threshold for triggering model retraining (0-1)</small>
      </div>

      <div className="form-group">
        <label className="form-label">Slack Webhook URL</label>
        <input
          type="url"
          name="slackWebhook"
          className="form-input"
          placeholder="https://hooks.slack.com/services/..."
          value={settings.slackWebhook}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Candidate Models</label>
        <div style={styles.checkboxGroup}>
          {AVAILABLE_MODELS.map((model) => (
            <label key={model} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                className="form-checkbox"
                checked={settings.candidateModels.includes(model)}
                onChange={() => handleModelToggle(model)}
              />
              {model}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="autoSelectBest"
            className="form-checkbox"
            checked={settings.autoSelectBest}
            onChange={handleChange}
          />
          Auto-select Best Model
        </label>
        <small style={styles.hint}>Automatically deploy the best performing model</small>
      </div>

      <div style={styles.buttonGroup}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={loading}
        >
          Reset
        </button>
        <button
          type="submit"
          className="btn btn-success"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}

const styles = {
  hint: {
    display: 'block',
    marginTop: '0.25rem',
    color: '#6b7280',
    fontSize: '0.8rem',
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2rem',
  },
};
