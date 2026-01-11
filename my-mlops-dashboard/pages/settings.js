import { useState, useEffect } from 'react';
import SettingsForm from '../components/SettingsForm';
import { getSettings, updateSettings } from '../utils/api';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    console.log('🔄 Loading settings from API...');
    setLoading(true);
    try {
      const data = await getSettings();
      console.log('✅ Loaded settings from backend:', data);
      console.log('   → candidate_models:', data.candidate_models);
      console.log('   → exchanges_enabled:', data.exchanges_enabled);
      setSettings(data);
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      showNotification('Failed to load settings', 'error');
      // Set default settings on error
      const defaults = {
        retrain_frequency: 'Weekly',
        drift_threshold: 0.2,
        enable_auto_deploy: true,
        slack_webhook_url: '',
        candidate_models: [],
        exchanges_enabled: [],
      };
      console.log('⚠️ Using default settings:', defaults);
      setSettings(defaults);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newSettings) => {
    console.log('💾 Saving settings to backend:', newSettings);
    try {
      const updatedSettings = await updateSettings(newSettings);
      console.log('✅ Settings saved, backend response:', updatedSettings);
      showNotification('Settings saved successfully!', 'success');
      
      // Force reload from database to confirm persistence
      console.log('🔄 Reloading settings from database...');
      await loadSettings();
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      showNotification('Failed to save settings', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your MLOps pipeline settings</p>
      </div>

      <div className="card" style={styles.settingsCard}>
        {loading ? (
          <div className="spinner"></div>
        ) : settings ? (
          <SettingsForm initialSettings={settings} onSave={handleSave} />
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Failed to load settings. Please refresh the page.</p>
            <button className="btn btn-primary" onClick={loadSettings}>
              🔄 Retry
            </button>
          </div>
        )}
      </div>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

const styles = {
  settingsCard: {
    maxWidth: 800,
    margin: '0 auto',
  },
};
