export function EnvUnsupported() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      textAlign: 'center',
      background: '#0a0a0f',
      color: '#e4e4e7',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#f5f5f5' }}>
        Not Supported
      </h2>
      <p style={{ color: '#71717a', fontSize: 14, lineHeight: 1.6 }}>
        This app is designed to run inside Telegram as a Mini App.
        <br />
        Please open it via Telegram.
      </p>
    </div>
  );
}
