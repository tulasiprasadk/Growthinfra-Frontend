const theme = {
  surface: '#FFFFFF',
  border: '#E2E6F0',
  text: '#1A1A1A',
  muted: '#6B7280',
  success: '#16A34A',
};

export default function AnalyticsSummary({ stats = [] }) {
  const fallback = [
    { label: 'Reach', value: '98.2K', delta: '+6%' },
    { label: 'Engagement', value: '11.5K', delta: '+4%' },
    { label: 'Clicks', value: '4.8K', delta: '+3%' },
  ];
  const list = stats.length ? stats : fallback;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
      }}
    >
      {list.map(item => (
        <div
          key={item.label}
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: 18,
          }}
        >
          <div style={{ color: theme.muted, fontSize: 12, fontWeight: 600 }}>{item.label}</div>
          <div style={{ fontSize: 24, fontWeight: 600, marginTop: 8 }}>{item.value}</div>
          <div style={{ color: theme.success, marginTop: 6, fontSize: 13 }}>{item.delta}</div>
        </div>
      ))}
    </div>
  );
}
