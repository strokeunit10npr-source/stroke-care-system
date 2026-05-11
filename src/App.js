import React from 'react';

function App() {
  const stats = [
    { label: 'ผู้ป่วย Admit วันนี้', value: '3', color: '#3b82f6' },
    { label: 'รอกระบวนการ (Pending)', value: '8', color: '#f59e0b' },
    { label: 'จำหน่าย (Discharge)', value: '5', color: '#10b981' }
  ];

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header Bar */}
      <nav style={{ backgroundColor: '#1e40af', padding: '1rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>🏥 Stroke Unit Registry</h1>
        <div style={{ fontSize: '0.9rem' }}>
           ผู้ใช้งาน: Primary Nurse (Super User)
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* สถิติเบื้องต้น */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>{stat.label}</p>
              <h2 style={{ margin: '0.5rem 0 0', color: stat.color, fontSize: '2.25rem' }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        {/* ส่วนการทำงานหลัก */}
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '20px', textAlign: 'center', border: '2px dashed #cbd5e1' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>พร้อมสำหรับบันทึกข้อมูลผู้ป่วย</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>ระบบพร้อมเชื่อมต่อกับ Google Sheets เพื่อจัดเก็บข้อมูล clinical data แล้วครับ</p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button style={{ backgroundColor: '#1e40af', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
              + ลงทะเบียนผู้ป่วยใหม่
            </button>
            <button style={{ backgroundColor: 'white', color: '#1e40af', border: '1px solid #1e40af', padding: '0.8rem 2rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem' }}>
              ดูรายชื่อผู้ป่วยทั้งหมด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
