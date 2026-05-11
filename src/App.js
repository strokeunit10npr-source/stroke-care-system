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
import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    an: '',
    patientName: '',
    admissionDate: '',
    diagnosis: '',
    status: 'Admit'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('บันทึกข้อมูลของ ' + formData.patientName + ' สำเร็จ! (ขั้นตอนถัดไปเราจะเชื่อมเข้า Google Sheets ครับ)');
    // ตรงนี้จะเป็นส่วนที่เราจะใส่โค้ดเชื่อมต่อ API ในอนาคต
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <nav style={{ backgroundColor: '#1e40af', padding: '1rem', color: 'white', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>🏥 Stroke Unit Registry - ระบบบันทึกข้อมูล</h1>
      </nav>

      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#1e293b', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
            ลงทะเบียนผู้ป่วยใหม่
          </h2>
          
          <form onSubmit={handleSubmit}>
            {/* AN Number */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569' }}>เลข AN</label>
              <input 
                type="text" name="an" value={formData.an} onChange={handleChange} required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                placeholder="เช่น 66/12345"
              />
            </div>

            {/* Patient Name */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569' }}>ชื่อ-นามสกุล ผู้ป่วย</label>
              <input 
                type="text" name="patientName" value={formData.patientName} onChange={handleChange} required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                placeholder="ระบุชื่อผู้ป่วย"
              />
            </div>

            {/* Admission Date */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569' }}>วันที่รับตัว (Admission Date)</label>
              <input 
                type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            {/* Diagnosis */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569' }}>การวินิจฉัย (Diagnosis)</label>
              <textarea 
                name="diagnosis" value={formData.diagnosis} onChange={handleChange} rows="3"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                placeholder="เช่น Ischemic Stroke"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              style={{ 
                width: '100%', backgroundColor: '#1e40af', color: 'white', border: 'none', 
                padding: '1rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' 
              }}
            >
              บันทึกข้อมูลลงระบบ
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '1rem', fontSize: '0.8rem' }}>
          * ข้อมูลนี้จะถูกจัดเก็บเข้าสู่ Google Sheets โดยอัตโนมัติ
        </p>
      </div>
    </div>
  );
}

export default App;
export default App;
