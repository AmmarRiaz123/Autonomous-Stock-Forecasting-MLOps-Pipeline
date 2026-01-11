import { useState, useEffect } from 'react';
import { RETRAIN_FREQUENCIES, AVAILABLE_MODELS, EXCHANGES } from '../utils/constants';

export default function SettingsForm({ initialSettings, onSave }) {
  const [settings, setSettings] = useState({
    retrainFrequency: 'Weekly',
    driftThreshold: 0.2,
    enableAutoDeploy: true,
    slackWebhookUrl: '',
    candidateModels: [],
    exchangesEnabled: [],
  });
  const [loading, setLoading] = useState(false);

  // Sync state when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      console.log('🔄 SettingsForm received initialSettings:', initialSettings);
      setSettings({
        retrainFrequency: initialSettings.retrain_frequency || 'Weekly',
        driftThreshold: initialSettings.drift_threshold ?? 0.2,
        enableAutoDeploy: initialSettings.enable_auto_deploy ?? true,
        slackWebhookUrl: initialSettings.slack_webhook_url || '',
        candidateModels: Array.isArray(initialSettings.candidate_models)
          ? initialSettings.candidate_models
          : [],
        exchangesEnabled: Array.isArray(initialSettings.exchanges_enabled)
          ? initialSettings.exchanges_enabled
          : [],
      });
      console.log('✅ SettingsForm state updated');
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
    const models = settings.candidateModels || [];
    setSettings({
      ...settings,
      candidateModels: models.includes(model)
        ? models.filter((m) => m !== model)
        : [...models, model],
    });
  };

  const handleExchangeToggle = (exchange) => {
    const exchanges = settings.exchangesEnabled || [];
    setSettings({
      ...settings,
      exchangesEnabled: exchanges.includes(exchange)
        ? exchanges.filter((e) => e !== exchange)
        : [...exchanges, exchange],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      retrain_frequency: settings.retrainFrequency,
      drift_threshold: settings.driftThreshold,
      enable_auto_deploy: settings.enableAutoDeploy,
      slack_webhook_url: settings.slackWebhookUrl,
      candidate_models: settings.candidateModels || [],
      exchanges_enabled: settings.exchangesEnabled || [],
    });
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
    <form onSubmit={handleSubmit} style={styles.form}>
      <div className="form-group">
        <label className="form-label">Retrain Frequency</label>
        <select
          className="form-select"
          value={settings.retrainFrequency}
          onChange={(e) => setSettings({ ...settings, retrainFrequency: e.target.value })}
        >
          {RETRAIN_FREQUENCIES.map((freq) => (
            <option key={freq} value={freq}>
              {freq}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">
          Drift Threshold ({settings.driftThreshold?.toFixed(2) || '0.20'})
        </label>
        <input
          type="range"
          className="form-range"
          min="0"
          max="1"
          step="0.05"
          value={settings.driftThreshold || 0.2}
          onChange={(e) =>
            setSettings({ ...settings, driftThreshold: parseFloat(e.target.value) })
          }
        />
        <small style={styles.hint}>
          Trigger retraining when model drift exceeds this threshold
        </small>
      </div>

      <div className="form-group">
        <label className="form-label">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={settings.enableAutoDeploy}
            onChange={(e) => setSettings({ ...settings, enableAutoDeploy: e.target.checked })}
          />
          Enable Auto-Deploy
        </label>
        <small style={styles.hint}>
          Automatically deploy models that outperform the current production model
        </small>
      </div>

      <div className="form-group">
        <label className="form-label">Slack Webhook URL</label>
        <input
          type="url"
          className="form-input"
          placeholder="https://hooks.slack.com/services/..."
          value={settings.slackWebhookUrl}
          onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
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
                checked={(settings.candidateModels || []).includes(model)}
                onChange={() => handleModelToggle(model)}
              />
              {model}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Enabled Exchanges</label>
        <div style={styles.checkboxGroup}>
          {EXCHANGES.map((exchange) => (
            <label key={exchange} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                className="form-checkbox"
                checked={(settings.exchangesEnabled || []).includes(exchange)}
                onChange={() => handleExchangeToggle(exchange)}
              />
              {exchange}
            </label>
          ))}
        </div>
      </div>

      <div style={styles.actions}>
        <button type="submit" className="btn btn-primary">
          💾 Save Settings
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
