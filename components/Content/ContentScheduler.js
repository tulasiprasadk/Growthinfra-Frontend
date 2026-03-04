import { useState, useContext, createContext, useEffect } from 'react';

// Context for user profile (to be provided by parent)
const UserProfileContext = createContext();

export function UserProfileProvider({ value, children }) {
  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}


export default function ContentScheduler({ latestApproved, connectedPages, organizationName }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [scheduled, setScheduled] = useState(null);
  const [scheduledItems, setScheduledItems] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [publishStatus, setPublishStatus] = useState('');
  const [publishError, setPublishError] = useState('');
  const [publishDetails, setPublishDetails] = useState([]);
  const [showPublishDetails, setShowPublishDetails] = useState(false);
  const [planDays, setPlanDays] = useState(7);
  const [contentMix, setContentMix] = useState({ insights: 60, images: 25, videos: 15 });
  const userProfile = useContext(UserProfileContext);
  const mixTotal = contentMix.insights + contentMix.images + contentMix.videos;

  const buildSchedule = (days, mix) => {
    const rawCounts = {
      insights: Math.round((days * mix.insights) / 100),
      images: Math.round((days * mix.images) / 100),
      videos: Math.round((days * mix.videos) / 100),
    };
    let total = rawCounts.insights + rawCounts.images + rawCounts.videos;
    while (total < days) {
      const next = Object.keys(rawCounts).reduce((a, b) => (rawCounts[a] <= rawCounts[b] ? a : b));
      rawCounts[next] += 1;
      total += 1;
    }
    while (total > days) {
      const next = Object.keys(rawCounts).reduce((a, b) => (rawCounts[a] >= rawCounts[b] ? a : b));
      if (rawCounts[next] > 0) {
        rawCounts[next] -= 1;
        total -= 1;
      } else {
        break;
      }
    }

    const pool = [
      ...Array(rawCounts.insights).fill('Insight'),
      ...Array(rawCounts.images).fill('Image'),
      ...Array(rawCounts.videos).fill('Video'),
    ];
    // Simple rotation to avoid blocks
    const schedule = [];
    let i = 0;
    while (pool.length) {
      schedule.push(pool.splice(i % pool.length, 1)[0]);
      i += 2;
    }
    return schedule.map((type, idx) => ({ day: idx + 1, type }));
  };

  const planSchedule = buildSchedule(planDays, contentMix);
  const planCounts = planSchedule.reduce(
    (acc, item) => {
      acc[item.type] += 1;
      return acc;
    },
    { Insight: 0, Image: 0, Video: 0 },
  );
  const typeIcons = {
    Insight: '💡',
    Image: '🖼️',
    Video: '🎬',
  };
  const statusStyles = {
    scheduled: { border: '#bbf7d0', bg: '#f0fdf4' },
    completed: { border: '#fde68a', bg: '#fffbeb' },
    nearDue: { border: '#fecaca', bg: '#fef2f2' },
    upcoming: { border: '#e5e7eb', bg: '#ffffff' },
  };

  const dateKey = (value) => {
    if (!value) return '';
    try {
      return new Date(value).toISOString().slice(0, 10);
    } catch {
      return String(value);
    }
  };

  const todayKey = dateKey(new Date());
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const scheduleMap = scheduledItems.reduce((acc, item) => {
    if (!item?.date) return acc;
    const key = dateKey(item.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  useEffect(() => {
    if (Array.isArray(connectedPages)) {
      setPages(connectedPages);
      setSelectedPages(connectedPages.map((page) => page.provider));
      return;
    }
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    fetch(`${API_BASE}/api/social/pages`)
      .then(r => r.json())
      .then(async (data) => {
        const list = data || [];
        setPages(list);
        const hasInstagram = list.some(p => p.platform === 'instagram');
        const hasFacebook = list.some(p => p.platform === 'facebook');
        if (!hasInstagram && hasFacebook) {
          try {
            await fetch(`${API_BASE}/api/social/refresh/instagram`, { method: 'POST' });
            const refreshed = await fetch(`${API_BASE}/api/social/pages`).then(r => r.json());
            setPages(refreshed || []);
          } catch {
            // ignore refresh failures
          }
        }
      })
      .catch(() => setPages([]));
  }, [connectedPages]);

  useEffect(() => {
    // Reset scheduled when a new approved item comes in
    setScheduled(null);
  }, [latestApproved]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('sma_scheduled_posts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setScheduledItems(parsed);
      }
    } catch {
      // ignore storage failures
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('sma_scheduler_prefs');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (parsed?.planDays) setPlanDays(parsed.planDays);
      if (parsed?.contentMix) setContentMix(parsed.contentMix);
      if (parsed?.defaultTime) setTime(parsed.defaultTime);
    } catch {
      // ignore storage failures
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        'sma_scheduler_prefs',
        JSON.stringify({ planDays, contentMix, defaultTime: time || '19:00' }),
      );
      window.localStorage.setItem('sma_plan_schedule', JSON.stringify(planSchedule));
    } catch {
      // ignore storage failures
    }
  }, [planDays, contentMix, planSchedule, time]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!latestApproved) return;
    if (mixTotal !== 100) {
      setPublishStatus('error');
      setPublishError('Content mix must total 100%.');
      return;
    }
    const scheduledData = { ...latestApproved, date, time, planDays, contentMix, ...userProfile };
    setScheduled(scheduledData);
    const entry = {
      id: Date.now(),
      organization: organizationName || 'Organisation',
      insight: latestApproved?.insight || '',
      image: latestApproved?.image || '',
      video: latestApproved?.video || '',
      date,
      time,
    };
    setScheduledItems(prev => {
      const next = [entry, ...prev].slice(0, 20);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('sma_scheduled_posts', JSON.stringify(next));
        }
      } catch {
        // ignore storage failures
      }
      return next;
    });
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('sma_last_schedule_time', time || '19:00');
      } catch {
        // ignore storage failures
      }
    }
    setDate('');
    setTime(time || '19:00');
    // Attempt publish after scheduling when a page is selected
    if (selectedPages.length > 0) {
      setPublishStatus('publishing');
      setPublishError('');
      setPublishDetails([]);
      setShowPublishDetails(false);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const message = `${scheduledData.insight}\n\n${scheduledData.tagline || ''}`;
      const imageUrl = scheduledData.image || '';
      const requests = selectedPages.map((pageId) => {
        const selected = pages.find(p => p.provider === pageId);
        const platform = selected?.platform || 'facebook';
        return fetch(`${API_BASE}/api/social/publish/${platform}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId, message, imageUrl }),
        }).then(async (res) => {
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(json?.error || `Publish failed (${res.status})`);
          }
          return { ok: true, platform, pageId, response: json };
        }).catch((err) => ({
          ok: false,
          platform,
          pageId,
          error: err?.message || 'Publish failed',
        }));
      });

      Promise.all(requests)
        .then((results) => {
          setPublishDetails(results);
          const hasError = results.some(r => !r.ok);
          setPublishStatus(hasError ? 'error' : 'success');
          if (hasError) {
            const failed = results.filter(r => !r.ok).map(r => `${r.platform}: ${r.error}`).join(' | ');
            setPublishError(failed || 'Publish failed. Check connections and permissions.');
          }
        });
    } else {
      setPublishStatus('error');
      setPublishError('No connected channels for this organisation.');
    }
  };

  return (
    <div style={{ padding: 8, width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            border: '1px solid #e2e6f0',
            borderRadius: 10,
            padding: 12,
            background: '#fff',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Planner</div>
          <select
            value={planDays}
            onChange={(e) => setPlanDays(Number(e.target.value))}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #d0d7e2', maxWidth: 220 }}
          >
            {[1, 7, 15, 30].map(days => (
              <option key={days} value={days}>
                {days} day{days > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            border: '1px solid #e2e6f0',
            borderRadius: 10,
            padding: 12,
            background: '#fff',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Content mix (%)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            {[
              { key: 'insights', label: 'Insights' },
              { key: 'images', label: 'Images' },
              { key: 'videos', label: 'Videos' },
            ].map(item => (
              <label key={item.key} style={{ fontSize: 13, color: '#333' }}>
                {item.label}
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={contentMix[item.key]}
                  onChange={(e) =>
                    setContentMix(prev => ({ ...prev, [item.key]: Number(e.target.value || 0) }))
                  }
                  style={{ marginTop: 6, width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d0d7e2' }}
                />
              </label>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
            Total: {contentMix.insights + contentMix.images + contentMix.videos}%
          </div>
          {mixTotal !== 100 && (
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 6 }}>
              Please make the total exactly 100% to finalize the plan.
            </div>
          )}
        </div>

        <div
          style={{
            border: '1px solid #e2e6f0',
            borderRadius: 10,
            padding: 12,
            background: '#fff',
            gridColumn: '1 / -1',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Planner schedule</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
            Next up: Day {planSchedule[0]?.day} · {planSchedule[0]?.type}
          </div>
          <div
            style={{
              border: '1px solid #e2e6f0',
              borderRadius: 8,
              padding: 18,
              background: '#f9fafb',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 14 }}>
              {Array.from({ length: planDays }).map((_, idx) => {
                const item = planSchedule[idx];
                if (!item) return null;
                const dayDate = addDays(new Date(), item.day - 1);
                const key = dateKey(dayDate);
                const scheduledForDay = scheduleMap[key] || [];
                let status = 'upcoming';
                if (scheduledForDay.length > 0) {
                  status = key < todayKey ? 'completed' : 'scheduled';
                } else if (key <= dateKey(addDays(new Date(), 3))) {
                  status = 'nearDue';
                }
                const tone = statusStyles[status];
                return (
                  <button
                    key={`day-${item.day}`}
                    type="button"
                    onClick={() => setSelectedDay({ item, date: key, scheduled: scheduledForDay })}
                    style={{
                      background: tone.bg,
                      border: `1px solid ${tone.border}`,
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 14,
                      display: 'grid',
                      gap: 8,
                      minHeight: 110,
                      color: '#111827',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ color: '#6b7280', fontWeight: 600, fontSize: 13 }}>Day {item.day}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 18 }}>{typeIcons[item.type] || '📌'}</span>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{item.type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12 }}>
            <span>● Scheduled</span>
            <span>● Completed</span>
            <span>● Due in 3 days</span>
            <span>● Upcoming</span>
          </div>
          {selectedDay && (
            <div style={{ marginTop: 12, border: '1px solid #e2e6f0', borderRadius: 10, padding: 12, background: '#fff' }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Day {selectedDay.item.day} · {selectedDay.item.type} · {selectedDay.date}
              </div>
              {selectedDay.scheduled.length > 0 ? (
                <div style={{ display: 'grid', gap: 6, fontSize: 12, color: '#374151' }}>
                  {selectedDay.scheduled.map((entry) => (
                    <div key={entry.id}>
                      {entry.organization} · {entry.time} · {entry.insight ? String(entry.insight).slice(0, 120) : 'Scheduled content'}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  Not scheduled yet. Suggested: {selectedDay.item.type}. Use the Schedule Content button to add it.
                </div>
              )}
            </div>
          )}
          <div style={{ marginTop: 10, border: '1px solid #e2e6f0', borderRadius: 10, padding: 10, background: '#fff' }}>
            <div style={{ fontSize: 13, color: '#666' }}>
              Plan for {planDays} days · Total items: {planSchedule.length}
            </div>
            <div style={{ marginTop: 6, fontWeight: 600 }}>
              Next action: Day {planSchedule[0]?.day} · {planSchedule[0]?.type}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
              Insights: {planCounts.Insight} · Images: {planCounts.Image} · Videos: {planCounts.Video}
            </div>
          </div>
        </div>

      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {latestApproved ? (
          <>
            <div style={{ marginBottom: 8 }}>
              <strong>Insight:</strong> {latestApproved.insight}<br />
              {latestApproved.image && <img src={latestApproved.image} alt="insight-img" style={{ maxWidth: 120, borderRadius: 6, margin: '8px 0' }} />}
              {latestApproved.video && <div><a href={latestApproved.video} target="_blank" rel="noopener noreferrer">Watch Video</a></div>}
            </div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
              lang="en-GB"
              step="60"
            />
            <div style={{ border: '1px solid #d0d7e2', borderRadius: 6, padding: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Organisation: {organizationName || 'Selected organisation'}
              </div>
              {pages.length > 0 ? (
                <div style={{ fontSize: 12, color: '#555' }}>
                  Publishing to {pages.length} connected channel{pages.length > 1 ? 's' : ''}.
                </div>
              ) : (
                <div style={{ color: '#666', fontSize: 13 }}>No connected channels for this organisation.</div>
              )}
            </div>
            <button
              type="submit"
              disabled={mixTotal !== 100}
              style={{
                background: mixTotal === 100 ? '#0070f3' : '#9ca3af',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                cursor: mixTotal === 100 ? 'pointer' : 'not-allowed',
              }}
            >
              Schedule Content
            </button>
          </>
        ) : (
          <div style={{ color: '#888' }}>No approved content available for scheduling.</div>
        )}
      </form>
      {publishStatus === 'publishing' && <div style={{ color: 'orange', marginTop: 8 }}>Publishing…</div>}
      {publishStatus === 'success' && <div style={{ color: 'green', marginTop: 8 }}>Published</div>}
      {publishStatus === 'error' && (
        <div style={{ color: 'red', marginTop: 8 }}>
          Publish failed{publishError ? `: ${publishError}` : ''}.
        </div>
      )}
      {publishDetails.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#374151' }}>
          <button
            type="button"
            onClick={() => setShowPublishDetails(prev => !prev)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              padding: 0,
              fontSize: 12,
            }}
          >
            {showPublishDetails ? 'Hide publish details' : 'Show publish details'}
          </button>
          {showPublishDetails && (
            <div style={{ marginTop: 6 }}>
              {publishDetails.map((entry) => (
                <div key={`${entry.platform}-${entry.pageId}`}>
                  {entry.platform}: {entry.ok ? 'Success' : `Failed (${entry.error})`}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {scheduled && (
        <div style={{ marginTop: 12, color: 'green' }}>
          <strong>Scheduled!</strong><br />
          Insight: {scheduled.insight}<br />
          {scheduled.image && <div><img src={scheduled.image} alt="logo" style={{ maxWidth: 60, margin: '8px 0' }} /></div>}
          {scheduled.video && <div><a href={scheduled.video} target="_blank" rel="noopener noreferrer">Watch Video</a></div>}
          Date: {scheduled.date}<br />
          Time: {scheduled.time}<br />
          {scheduled.logo && <div><img src={scheduled.logo} alt="logo" style={{ maxWidth: 60, margin: '8px 0' }} /></div>}
          {scheduled.tagline && <div><strong>Tagline:</strong> {scheduled.tagline}</div>}
          {scheduled.email && <div><strong>Email:</strong> {scheduled.email}</div>}
          {scheduled.contact && <div><strong>Contact:</strong> {scheduled.contact}</div>}
          {scheduled.website && <div><strong>Website:</strong> {scheduled.website}</div>}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Scheduled posts</div>
        {scheduledItems.filter(item => !organizationName || item.organization === organizationName).length === 0 ? (
          <div style={{ color: '#888', fontSize: 13 }}>No scheduled posts yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {scheduledItems
              .filter(item => !organizationName || item.organization === organizationName)
              .map(item => (
                <div key={item.id} style={{ border: '1px solid #e2e6f0', borderRadius: 8, padding: 10, background: '#fff' }}>
                  <div style={{ fontWeight: 600 }}>{item.organization}</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                    {item.insight ? String(item.insight).slice(0, 120) : 'Scheduled content'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {item.date} {item.time}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {latestApproved && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Post preview</div>
          <div style={{ border: '1px solid #e2e6f0', borderRadius: 12, padding: 16, background: '#fff' }}>
            <div style={{ fontSize: 13, color: '#666' }}>Social post preview</div>
            <div style={{ marginTop: 8, fontWeight: 600 }}>{userProfile?.tagline || 'Your brand tagline'}</div>
            <div style={{ marginTop: 8, whiteSpace: 'pre-line' }}>
              {latestApproved.insight}
              {latestApproved.tagline ? `\n\n${latestApproved.tagline}` : ''}
            </div>
            {(latestApproved.image || userProfile?.logo) && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={latestApproved.image || userProfile?.logo}
                  alt="preview"
                  style={{ width: '100%', maxWidth: 420, borderRadius: 10 }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://picsum.photos/seed/preview-fallback/800/500';
                  }}
                />
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: 12, color: '#6B7280' }}>
              {userProfile?.website && `🌐 ${userProfile.website}`} {userProfile?.contact && ` | 📞 ${userProfile.contact}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// fetch pages on mount
ContentScheduler.getInitialProps = async () => null;
