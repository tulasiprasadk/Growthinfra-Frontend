

import { useState } from 'react';

export default function ContentApproval({ approvalQueue, setApprovalQueue, onApprove }) {
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);

  const getNextPlannedDate = () => {
    if (typeof window === 'undefined') return '';
    try {
      const schedule = JSON.parse(window.localStorage.getItem('sma_plan_schedule') || '[]');
      if (!Array.isArray(schedule) || schedule.length === 0) return '';
      const nextIndex = Number(window.localStorage.getItem('sma_next_schedule_index') || '0');
      const item = schedule[nextIndex % schedule.length];
      const dayOffset = Math.max(0, (item?.day || 1) - 1);
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      const key = d.toISOString().slice(0, 10);
      window.localStorage.setItem('sma_next_schedule_index', String(nextIndex + 1));
      return key;
    } catch {
      return '';
    }
  };

  const getDefaultTime = () => {
    if (typeof window === 'undefined') return '09:00';
    try {
      const stored = window.localStorage.getItem('sma_last_schedule_time');
      return stored || '19:00';
    } catch {
      return '19:00';
    }
  };

  const persistScheduledItem = (item) => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('sma_scheduled_posts');
      const parsed = stored ? JSON.parse(stored) : [];
      const next = Array.isArray(parsed) ? parsed : [];
      next.unshift({
        id: Date.now(),
        organization: item.organization || 'Organisation',
        insight: item.insight || '',
        image: item.image || '',
        video: item.video || '',
        date: item.preferredDate,
        time: item.preferredTime || getDefaultTime(),
      });
      window.localStorage.setItem('sma_scheduled_posts', JSON.stringify(next.slice(0, 50)));
    } catch {
      // ignore storage failures
    }
  };

  const getInsightText = (value) => {
    if (!value) return '';
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return parsed?.text || value;
      } catch {
        return value;
      }
    }
    if (typeof value === 'object') {
      return value.text || JSON.stringify(value);
    }
    return String(value);
  };

  const handleApprove = (id) => {
    const item = approvalQueue.find(item => item.id === id);
    const preferredDate = item?.preferredDate || getNextPlannedDate();
    const updated = preferredDate ? { ...item, preferredDate } : item;
    if (!preferredDate) {
      alert('Please select a schedule date before approving.');
      return;
    }
    setApproved([...approved, id]);
    setApprovalQueue(approvalQueue.filter(item => item.id !== id));
    persistScheduledItem(updated);
    if (onApprove && updated) onApprove(updated);
  };

  const handleReject = (id) => {
    setRejected([...rejected, id]);
    setApprovalQueue(approvalQueue.filter(item => item.id !== id));
  };

  const handleDateChange = (id, value) => {
    setApprovalQueue(approvalQueue.map(item => (
      item.id === id ? { ...item, preferredDate: value } : item
    )));
  };

  return (
    <div style={{ padding: 8 }}>
      <h4>Pending Approval</h4>
      {approvalQueue.length === 0 && <div>No items pending approval.</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {approvalQueue.map(item => (
          <li key={item.id} style={{ marginBottom: 16, border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
            <div><strong>Type:</strong> {item.type || 'insight'}</div>
            <div><strong>Insight:</strong> {getInsightText(item.insight)}</div>
            {item.image && (
              <div style={{ margin: '8px 0' }}>
                <img
                  src={item.image}
                  alt="insight-img"
                  style={{ maxWidth: 120, borderRadius: 6 }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://picsum.photos/seed/approval-fallback/120/90';
                  }}
                />
              </div>
            )}
            {item.video && <div style={{ margin: '8px 0' }}><a href={item.video} target="_blank" rel="noopener noreferrer">Watch Video</a></div>}
            <div style={{ margin: '8px 0' }}>
              <label style={{ fontSize: 12, color: '#555' }}>
                Schedule date
                <input
                  type="date"
                  value={item.preferredDate || ''}
                  onChange={(e) => handleDateChange(item.id, e.target.value)}
                  style={{ marginLeft: 8 }}
                />
              </label>
            </div>
            <button
              onClick={() => handleApprove(item.id)}
              style={{
                marginRight: 8,
                background: 'green',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '4px 12px',
                cursor: 'pointer',
              }}
            >
              Approve
            </button>
            <button onClick={() => handleReject(item.id)} style={{ background: 'red', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Reject</button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16 }}>
        <strong>Approved:</strong> {approved.length}
        <br />
        <strong>Rejected:</strong> {rejected.length}
      </div>
    </div>
  );
}
