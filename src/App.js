import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, ClipboardCheck, FileText, Plus, Search, 
  AlertTriangle, Activity, MapPin, Stethoscope, Clock, Printer, 
  Home, UserPlus, BarChart3, LogOut, Settings, Calendar, CheckCircle2, 
  XCircle, Save, ChevronRight, Info, Heart, Trash2, Edit3, ClipboardList
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

// --- Configuration ---
// ระบบจะดึงค่าลิงก์และรหัสความปลอดภัยจาก Environment Variables ของ Vercel ที่ตั้งไว้
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL;
const APP_TOKEN = process.env.NEXT_PUBLIC_APP_TOKEN || process.env.REACT_APP_APP_TOKEN;

const App = () => {
  const [view, setView] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // สเตตัสฟอร์มสำหรับการรับเข้าผู้ป่วยใหม่
  const [formData, setFormData] = useState({
    hn: '',
    an: '',
    patientName: '',
    admitDate: new Date().toISOString().split('T')[0], // กำหนดค่าเริ่มต้นเป็นวันปัจจุบัน
    age: '',
    gender: 'ชาย',
    strokeType: 'Thrombotic',
    diagnosis: '',
    thrombolysis: 'ไม่ได้ให้',
    tia: 'ไม่ใช่',
    readmission: 'ไม่ใช่',
    dischargeStatus: 'กำลังรักษา'
  });

  // ฟังก์ชันดึงข้อมูลจาก Google Sheets
  const fetchPatients = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=getPatients&token=${APP_TOKEN}`);
      const result = await response.json();
      if (result.status === 'success') {
        setPatients(result.data);
      } else {
        console.error('Error from API:', result.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // เรียกโหลดข้อมูลทันทีเมื่อเปิดแอปพลิเคชันขึ้นมาครั้งแรก
  useEffect(() => {
    fetchPatients();
  }, []);

  // คำนวณสถิติเพื่อนำไปทำแดชบอร์ด
  const stats = useMemo(() => {
    const total = patients.length;
    
    const typeCount = patients.reduce((acc, p) => {
      const type = p.strokeType || 'ไม่ระบุ';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const pieData = Object.keys(typeCount).map(key => ({ name: key, value: typeCount[key] }));
    
    // นับสถิติกรณี Thrombolysis (รับยาละลายลิ่มเลือด)
    const strokeRecurrent = patients.filter(p => p.readmission === 'ใช่').length;

    return { total, pieData, strokeRecurrent };
  }, [patients]);

  const filteredPatients = patients.filter(p => 
    (p.patientName && p.patientName.includes(searchTerm)) || 
    (p.hn && p.hn.includes(searchTerm)) || 
    (p.an && p.an.includes(searchTerm))
  );

  // ฟังก์ชันควบคุมการพิมพ์ฟอร์ม
  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // ฟังก์ชันส่งบันทึกข้อมูลไปยัง Google Sheets หลังบ้าน
  const handleSubmitNewPatient = async (e) => {
    e.preventDefault();
    if (!formData.hn || !formData.an || !formData.patientName) {
      alert('กรุณากรอกข้อมูลช่องที่มีเครื่องหมาย * ให้ครบถ้วนครับ');
      return;
    }

    if (!API_URL) {
      alert('ไม่พบลิงก์เชื่อมต่อ API_URL กรุณาเช็ก Environment Variables ใน Vercel');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'addPatient',
          token: APP_TOKEN,
          ...formData
        })
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        alert('🎉 บันทึกข้อมูลผู้ป่วยลงระบบ Google Sheets สำเร็จเรียบร้อยครับ!');
        // รีเซ็ตฟอร์มกลับเป็นค่าว่าง
        setFormData({
          hn: '',
          an: '',
          patientName: '',
          admitDate: new Date().toISOString().split('T')[0],
          age: '',
          gender: 'ชาย',
          strokeType: 'Thrombotic',
          diagnosis: '',
          thrombolysis: 'ไม่ได้ให้',
          tia: 'ไม่ใช่',
          readmission: 'ไม่ใช่',
          dischargeStatus: 'กำลังรักษา'
        });
        // โหลดข้อมูลล่าสุดมาอัปเดตในตารางกับแดชบอร์ดทันที
        await fetchPatients();
        setView('registry'); // เปลี่ยนหน้าสลับไปดูตารางทะเบียนผู้ป่วย
      } else {
        alert('เกิดข้อผิดพลาดจากระบบหลังบ้าน: ' + result.message);
      }
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบสิทธิ์เปิดสาธารณะของ Google Apps Script');
    } finally {
      setLoading(false);
    }
  };

  const Header = () => (
    <header className="bg-white border-b border-slate-200 p-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-blue-900 p-1.5 rounded-xl text-white">
          <Activity size={20} />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-800 leading-tight">Nopparat Rajathanee Hospital</h2>
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Stroke Unit Management System</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setView('add')} className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all">
          <Plus size={14} /> <span>เพิ่มผู้ป่วยใหม่</span>
        </button>
      </div>
    </header>
  );

  const Sidebar = () => (
    <aside className="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col p-4 space-y-1">
      <NavItem icon={LayoutDashboard} label="แดชบอร์ดภาพรวม" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
      <NavItem icon={Users} label="ทะเบียนผู้ป่วย" active={view === 'registry'} onClick={() => setView('registry')} />
      <NavItem icon={UserPlus} label="รับเข้าผู้ป่วยใหม่" active={view === 'add'} onClick={() => setView('add')} />
      <NavItem icon={FileText} label="รายงาน PDF" active={view === 'report'} onClick={() => setView('report')} />
    </aside>
  );

  const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12px] font-black transition-all ${active ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-900/10' : 'text-slate-500 hover:bg-slate-50'}`}>
      <Icon size={16} /> {label}
    </button>
  );

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="ผู้ป่วยสะสมทั้งหมด" value={stats.total} unit="ราย" color="border-l-blue-600" />
        <StatCard icon={AlertTriangle} label="ผู้ป่วย Readmission" value={stats.strokeRecurrent} unit="ราย" color="border-l-amber-500" valueColor="text-amber-600" />
        <StatCard icon={CheckCircle2} label="สถานะการเชื่อมโยงระบบ" value={loading ? "กำลังโหลด..." : "ออนไลน์"} unit="" color="border-l-green-500" valueColor="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-black text-slate-800 text-sm mb-6 uppercase tracking-wider">ประเภทของ Stroke ในหอผู้ป่วย</h4>
          <div className="h-[280px]">
            {stats.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.pieData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {stats.pieData.map((_, i) => <Cell key={i} fill={['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'][i % 4]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">ไม่มีข้อมูลสถิติให้แสดงผล</div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
          <Heart size={48} className="text-red-500 animate-pulse mb-3" />
          <h4 className="font-black text-slate-800 text-sm uppercase">Stroke Care Integration</h4>
          <p className="text-xs text-slate-400 max-w-xs mt-2 font-medium">เชื่อมต่อระบบจัดเก็บบันทึกข้อมูลตัวชี้วัดผ่านฐานข้อมูลระบบคลาวด์โรงพยาบาลนพรัตนราชธานีได้อย่างมั่นใจ ปลอดภัย และเป็นเรียลไทม์</p>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, unit, color, valueColor = "text-blue-900" }) => (
    <div className={`bg-white p-5 rounded-3xl border-l-[6px] border border-slate-100 shadow-sm flex items-center gap-4 ${color}`}>
      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Icon size={20} /></div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1">
          <h3 className={`text-2xl font-black tracking-tight ${valueColor}`}>{value}</h3>
          {unit && <span className="text-[10px] font-black text-slate-400">{unit}</span>}
        </div>
      </div>
    </div>
  );

  const AdmissionForm = () => (
    <form onSubmit={handleSubmitNewPatient} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-[#1e3a8a] p-5 text-white">
        <h3 className="font-black text-base uppercase tracking-wider">Patient Admission Form</h3>
        <p className="text-[10px] opacity-70 font-medium">แบบบันทึกเวชระเบียนแรกรับเข้าและการประเมินหอผู้ป่วยโรคหลอดเลือดสมอง</p>
      </div>
      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase">HN (รหัสผู้ป่วย) *</label>
            <input type="text" required value={formData.hn} onChange={(e) => handleInputChange('hn', e.target.value)} className="w-full border-2 border-slate-100 p-2.5 rounded-xl bg-slate-50 text-sm font-bold focus:border-blue-500 outline-none" placeholder="67-xxxx" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase">AN (รหัสรับเข้า) *</label>
            <input type="text" required value={formData.an} onChange={(e) => handleInputChange('an', e.target.value)} className="w-full border-2 border-slate-100 p-2.5 rounded-xl bg-slate-50 text-sm font-bold focus:border-blue-500 outline-none" placeholder="Axxxxx" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase">ชื่อ - นามสกุล ผู้ป่วย *</label>
            <input type="text" required value={formData.patientName} onChange={(e) => handleInputChange('patientName', e.target.value)} className="w-full border-2 border-slate-100 p-2.5 rounded-xl bg-slate-50 text-sm font-bold focus:border-blue-500 outline-none" placeholder="ระบุชื่อและนามสกุล..." />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase">วันที่ Admit</label>
            <input type="date" value={formData.admitDate} onChange={(e) => handleInputChange('admitDate', e.target.value)} className="w-full border-2 border-slate-100 p-2.5 rounded-xl bg-slate-50 text-sm font-bold focus:border-blue-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase">อายุ (ปี)</label>
            <input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} className="w-full border-2 border-slate-100 p-2.5 rounded-xl bg-slate-50 text-sm font-bold focus:border-blue-500 outline-none" placeholder="ระบุอายุเป็นตัวเลข" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase">ประเภทของ Stroke</label>
            <select value={formData.strokeType} onChange={(e) => handleInputChange('strokeType', e.target.value)} className="w-full border-2 border-slate-100 p-2.5 rounded-xl bg-slate-50 text-sm font-bold focus:border-blue-500 outline-none">
              <option value="Thrombotic">Thrombotic</option>
              <option value="Embolic">Embolic</option>
              <option value="Hemorrhagic">Hemorrhagic</option>
              <option value="TIA">TIA</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          <button type="button" onClick={() => setView('dashboard')} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs">ยกเลิก</button>
          <button type="submit" disabled={loading} className="px-10 py-2.5 rounded-xl bg-[#1e3a8a] text-white font-bold flex items-center gap-2 shadow-md hover:bg-blue-800 disabled:bg-slate-300 transition-all text-xs">
            <Save size={16} /> {loading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลเข้า Google Sheets'}
          </button>
        </div>
      </div>
    </form>
  );

  const RegistryTable = () => (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">ทะเบียนรายชื่อผู้ป่วยในระบบ</h3>
          <p className="text-[10px] text-slate-400 font-bold">ข้อมูลอัปเดตเรียลไทม์จากฐานข้อมูลกลางโรงพยาบาล</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input type="text" placeholder="ค้นหาด้วย HN, AN หรือชื่อ..." className="w-full bg-slate-50 border-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {loading && patients.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">กำลังดึงข้อมูลสดจากระบบกรุณารอสักครู่...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">ไม่พบรายชื่อหรือข้อมูลผู้ป่วยที่ค้นหาใน Google Sheets</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">HN / AN</th>
                <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4">ประเภท Stroke</th>
                <th className="px-6 py-4">สถานะการรักษา</th>
                <th className="px-6 py-4 text-center">ยาละลายลิ่มเลือด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.map((p, idx) => (
                <tr key={p.id || idx} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[11px] font-black text-blue-900">
                    {p.hn || '-'}<br/><span className="text-slate-400 font-medium">{p.an || '-'}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-800 text-xs">{p.patientName || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase">
                      {p.strokeType || 'ไม่ระบุ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600 text-xs">{p.dischargeStatus || 'กำลังรักษา'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${p.thrombolysis === 'ให้' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.thrombolysis || 'ไม่ได้ให้'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans antialiased text-slate-600">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <Home size={10} /> Home <ChevronRight size={8} /> {view}
            </div>
            
            {view === 'dashboard' && <Dashboard />}
            {view === 'add' && <AdmissionForm />}
            {view === 'registry' && <RegistryTable />}
            {view === 'report' && <div className="bg-white p-12 text-center text-slate-400 text-xs font-black uppercase border border-slate-100 rounded-3xl">Reporting & PDF Systems Coming Soon...</div>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
