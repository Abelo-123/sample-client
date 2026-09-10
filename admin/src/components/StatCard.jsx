export default function StatCard({ label, value, icon, color, accentFrom, accentTo }) {
  return (
    <div className="glass-card stat-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value" style={{ color: color || 'var(--text)' }}>
        {value ?? <span style={{ fontSize: 20 }}>—</span>}
      </div>
      <div
        className="stat-card-accent"
        style={{
          background: `linear-gradient(90deg, ${accentFrom || 'var(--accent)'}, ${accentTo || 'var(--violet)'})`
        }}
      />
    </div>
  );
}
