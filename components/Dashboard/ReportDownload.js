const theme = {
  surface: '#FFFFFF',
  border: '#E2E6F0',
  text: '#1A1A1A',
  muted: '#6B7280',
  primary: '#1E5EFF',
};

export default function ReportDownload({ reports = [] }) {
  const fallback = [
    { id: 'weekly', name: 'Weekly Summary', date: 'Jan 12, 2026', size: '2.4 MB' },
    { id: 'campaign', name: 'Campaign Performance', date: 'Jan 10, 2026', size: '3.1 MB' },
  ];
  const list = reports.length ? reports : fallback;

  return (
    <div
      style={{
        background: theme.surface,
        borderRadius: 12,
        border: `1px solid ${theme.border}`,
        padding: 20,
      }}
    >
      <h3 style={{ marginBottom: 16 }}>Downloads</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        {list.map(report => (
          <div
            key={report.id}
            style={{
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{report.name}</div>
              <div style={{ fontSize: 13, color: theme.muted }}>
                {report.date} · {report.size}
              </div>
            </div>
            <button
              type="button"
              style={{
                background: theme.primary,
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
