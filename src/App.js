import './App.css';
import { usePolkadotApi } from './hooks/usePolkadotApi';
import NetworkStats from './components/NetworkStats';

function App() {
  const { api, isConnected, isLoading, error } = usePolkadotApi();

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <h2>🔗 Connecting to Polkadot Network...</h2>
        <p>This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <h2>❌ Connection Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.button}>
          Try Again
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div style={styles.loading}>
        <h2>⏳ Connecting...</h2>
      </div>
    );
  }

  return (
    <div className="App">
      <NetworkStats api={api} />
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255, 255, 255, 0.3)',
    borderTop: '5px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  button: {
    marginTop: '20px',
    padding: '12px 30px',
    fontSize: '16px',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default App;