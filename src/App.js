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
