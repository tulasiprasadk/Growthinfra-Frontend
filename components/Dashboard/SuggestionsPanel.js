const theme = {
  surface: '#FFFFFF',
  border: '#E2E6F0',
  text: '#1A1A1A',
  muted: '#6B7280',
  primary: '#1E5EFF',
};

export default function SuggestionsPanel({ items = [] }) {
  const fallback = [
    'Refresh LinkedIn headline copy for the next publishing cycle.',
    'Schedule Facebook posts for 7–9 PM to lift engagement.',
    'Add a CTA link to the top-performing Instagram carousel.',
  ];
  const list = items.length ? items : fallback;

  return (
    <div
      style={{
        background: theme.surface,
        borderRadius: 12,
        border: `1px solid ${theme.border}`,
        padding: 20,
      }}
    >
      <h3 style={{ marginBottom: 12 }}>Recommendations</h3>
      <div style={{ color: theme.muted, fontSize: 13, marginBottom: 12 }}>
        Actions to improve performance this week.
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {list.map((item, idx) => (
          <div
            key={`${item}-${idx}`}
            style={{
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 600, color: theme.primary }}>Suggestion {idx + 1}</div>
            <div style={{ marginTop: 6 }}>{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
