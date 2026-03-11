import Link from 'next/link';
import { useEffect, useState } from 'react';
import AnalyticsSummary from '../../components/Dashboard/AnalyticsSummary';
import ReportDownload from '../../components/Dashboard/ReportDownload';
import SuggestionsPanel from '../../components/Dashboard/SuggestionsPanel';
import { authFetch } from '../../utils/auth';

const theme = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  border: '#E2E6F0',
  text: '#1A1A1A',
  muted: '#6B7280',
  primary: '#1E5EFF',
  success: '#16A34A',
};

export default function ReportsIndexPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const stats = [
    { label: 'Reach', value: '128.4K', delta: '+12%' },
    { label: 'Engagement', value: '14.2K', delta: '+8%' },
    { label: 'Clicks', value: '6.3K', delta: '+5%' },
    { label: 'Conversions', value: '1.2K', delta: '+3%' },
  ];

  const suggestions = [
    'Post Instagram reels between 6–9 PM for higher completion rates.',
    'Refresh the Facebook creative every 10 days to prevent fatigue.',
    'Repurpose top-performing copy into LinkedIn carousel posts.',
  ];

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await authFetch('/api/reports');
        const data = await response.json();
        setReports(
          Array.isArray(data)
            ? data.map((report) => ({
                id: report.id,
                name: report.type || 'Report',
                date: new Date(report.generatedAt).toLocaleDateString(),
                size: report.fileUrl ? 'File available' : 'No file',
                fileUrl: report.fileUrl || '',
                campaignName: report.campaign?.name || report.campaignId,
              }))
            : [],
        );
      } catch {
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ marginBottom: 8 }}>Reports</h1>
              <p style={{ color: theme.muted }}>
                Track campaign performance, export summaries, and share results with clients.
              </p>
            </div>
            <Link href="/" style={{ color: theme.primary, textDecoration: 'none', fontWeight: 600 }}>
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        <AnalyticsSummary stats={stats} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
            gap: 24,
            marginTop: 24,
          }}
        >
          <ReportDownload reports={reports} />
          <SuggestionsPanel items={suggestions} />
        </div>

        <div
          style={{
            marginTop: 32,
            background: theme.surface,
            borderRadius: 12,
            border: `1px solid ${theme.border}`,
            padding: 20,
          }}
        >
          <h3 style={{ marginBottom: 12 }}>Recent report details</h3>
          {loading && <div style={{ color: theme.muted }}>Loading reports...</div>}
          {!loading && reports.length === 0 && (
            <div style={{ color: theme.muted }}>No reports are available for your organizations yet.</div>
          )}
          <div style={{ display: 'grid', gap: 12 }}>
            {reports.map(report => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                style={{
                  textDecoration: 'none',
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{report.name}</div>
                  <div style={{ color: theme.muted, fontSize: 13 }}>{report.date} {report.campaignName ? `· ${report.campaignName}` : ''}</div>
                </div>
                <span style={{ color: theme.primary, fontWeight: 600 }}>View</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
