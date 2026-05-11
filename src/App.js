import React from 'react';

function App() {
  const stats = [
    { label: 'ผู้ป่วยใหม่วันนี้', value: '5', color: '#3b82f6' },
    { label: 'รอกระบวนการ', value: '12', color: '#f59e0b' },
    { label: 'จำหน่ายแล้ว', value: '8', color: '#10b981' }
  ];

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <nav style={{ backgroundColor: '#1e40af', padding: '1rem', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>🏥 Stroke Unit Registry</h1>
        <span>พยาบาลเจ้าของไข้: Admin System</span>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>{stat.label}</p>
              <h2 style={{ margin: '0.5rem 0 0', color: stat.color, fontSize: '1.875rem' }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '2px dashed #d1d5db' }}>
          <h3>ยินดีต้อนรับสู่ระบบ Stroke Care</h3>
          <p style={{ color: '#6b7280' }}>ระบบเชื่อมต่อฐานข้อมูล Google Sheets เรียบร้อยแล้ว</p>
          <button style={{ backgroundColor: '#1e40af', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
            + ลงทะเบียนผู้ป่วยใหม่
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
