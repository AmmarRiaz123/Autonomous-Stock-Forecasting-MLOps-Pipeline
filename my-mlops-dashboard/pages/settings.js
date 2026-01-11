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
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      showNotification('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newSettings) => {
    try {
      await updateSettings(newSettings);
      showNotification('Settings saved successfully!', 'success');
      setSettings(newSettings);
    } catch (error) {
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
        ) : (
          <SettingsForm initialSettings={settings} onSave={handleSave} />
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
