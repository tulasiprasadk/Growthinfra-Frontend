import LoginForm from '../components/Auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="brand-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="brand-surface" style={{ width: '100%', maxWidth: '1080px', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 420px)', overflow: 'hidden' }}>
        <div style={{ padding: '42px', background: 'linear-gradient(135deg, rgba(7,89,133,0.96), rgba(15,23,42,0.98) 58%, rgba(30,41,59,0.96) 100%)', color: '#fff' }}>
          <div className="brand-pill" style={{ background: 'rgba(255,255,255,0.12)', color: '#e0f2fe', borderColor: 'rgba(186,230,253,0.2)' }}>GrowthInfra Access</div>
          <img src="/growthinfra-logo.png" alt="GrowthInfra" style={{ width: '240px', maxWidth: '100%', height: 'auto', marginTop: '24px' }} />
          <h1 style={{ fontSize: '42px', lineHeight: 1.05, margin: '20px 0 10px' }}>Operate every social lane from one GrowthInfra workspace.</h1>
          <p style={{ margin: 0, color: 'rgba(226,232,240,0.92)', lineHeight: 1.7, fontSize: '17px' }}>
            Sign in to manage accounts, schedule content, and control access across your connected business channels.
          </p>
        </div>
        <div style={{ padding: '30px' }}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
