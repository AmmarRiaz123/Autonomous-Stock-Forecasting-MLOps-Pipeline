import { useState } from 'react';

export default function ModelComparisonTable({ models, onDeploy, currentModel }) {
  const [deploying, setDeploying] = useState(null);

  const handleDeploy = async (modelName) => {
    setDeploying(modelName);
    try {
      await onDeploy(modelName);
    } finally {
      setDeploying(null);
    }
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>MAE</th>
            <th>RMSE</th>
            <th>MAPE</th>
            <th>Training Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {models && models.map((model) => (
            <tr key={model.name}>
              <td>
                <strong>{model.name}</strong>
                {model.name === currentModel && (
                  <span style={styles.currentBadge}>Current</span>
                )}
              </td>
              <td>{model.metrics?.mae?.toFixed(4) || 'N/A'}</td>
              <td>{model.metrics?.rmse?.toFixed(4) || 'N/A'}</td>
              <td>{model.metrics?.mape?.toFixed(2)}%</td>
              <td>{model.trainingTime || 'N/A'}s</td>
              <td>
                <span className={`status-badge status-${model.status}`}>
                  {model.status}
                </span>
              </td>
              <td>
                {model.name !== currentModel && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDeploy(model.name)}
                    disabled={deploying === model.name}
                    style={styles.deployBtn}
                  >
                    {deploying === model.name ? 'Deploying...' : 'Deploy'}
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
  currentBadge: {
    marginLeft: '0.5rem',
    padding: '0.125rem 0.5rem',
    background: '#dbeafe',
    color: '#1e40af',
    borderRadius: 9999,
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  deployBtn: {
    fontSize: '0.8rem',
    padding: '0.4rem 0.8rem',
  },
};
