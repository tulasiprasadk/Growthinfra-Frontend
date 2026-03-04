import { useRouter } from 'next/router';
import Link from 'next/link';

const theme = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  border: '#E2E6F0',
  text: '#1A1A1A',
  muted: '#6B7280',
  primary: '#1E5EFF',
};

export default function ReportDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Link href="/reports" style={{ color: theme.primary, textDecoration: 'none', fontWeight: 600 }}>
          ← Back to reports
        </Link>

        <div
          style={{
            marginTop: 16,
            background: theme.surface,
            borderRadius: 12,
            border: `1px solid ${theme.border}`,
            padding: 24,
          }}
        >
          <h1 style={{ marginBottom: 8 }}>Report: {id || 'Loading'}</h1>
          <p style={{ color: theme.muted }}>
            Detailed breakdown of campaign performance, channel reach, and engagement trends.
          </p>

          <div style={{ marginTop: 24, display: 'grid', gap: 14 }}>
            {[
              { label: 'Total Reach', value: '128.4K' },
              { label: 'Engagement Rate', value: '4.7%' },
              { label: 'Top Channel', value: 'Instagram' },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ color: theme.muted }}>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <h3>Highlights</h3>
            <ul style={{ marginTop: 8, color: theme.muted }}>
              <li>Instagram reels delivered the highest completion rate.</li>
              <li>Facebook engagement improved with shorter headlines.</li>
              <li>LinkedIn CTR peaked on Wednesday morning posts.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
