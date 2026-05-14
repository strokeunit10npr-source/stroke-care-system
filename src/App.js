import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, ClipboardCheck, FileText, Plus, Search, 
  AlertTriangle, Activity, Heart, Calendar, CheckCircle2, Save, ChevronRight, Home, UserPlus
} from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const APP_TOKEN = process.env.NEXT_PUBLIC_APP_TOKEN;

const App = () => {
  const [view, setView] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ฟิลด์ข้อมูลฟอร์มที่ล้อตามหัวตารางใหม่ 28 คอลัมน์
  const [formData, setFormData] = useState({
    hn: '', an: '', fullName: '', age: '', gender: 'ชาย',
    diagnosis: '', strokeType: 'Ischemic', onsetTime: '', arrivalTime: '',
    doorToNeedleTime: '', nihss: '', ctBrainResult: '', thrombolysis: 'ไม่ได้ให้',
    thrombectomy: 'ไม่ได้ทำ', admitDate: new Date().toISOString().split('T')[0],
    dischargeDate: '', outcome: 'กำลังรักษา', complication: 'ไม่มี',
    riskFactors: '', followUp: '', doctor: '', nurse: '', remark: ''
  });

  const fetchPatients = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getPatients&token=${APP_TOKEN}`);
      const result = await res.json();
      if (result.status === 'success') setPatients(result.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const stats = useMemo(() => {
    const total = patients.length;
    const typeCount = patients.reduce((acc, p) => {
      const t = p.strokeType || 'ไม่ระบุ';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.keys(typeCount).map(k => ({ name: k, value: typeCount[k] }));
    const fastTrackCount = patients.filter(p => p.thrombolysis === 'ให้ rt-PA').length;
    return { total, pieData, fastTrackCount };
  }, [patients]);

  const filteredPatients = patients.filter(p => 
    (p.fullName && p.fullName.includes(searchTerm)) || 
    (p.hn && p.hn.includes(searchTerm)) || 
    (p.an && p.an.includes(searchTerm))
  );

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hn || !formData.an || !formData.fullName) {
      alert('กรุณากรอกข้อมูลสำคัญ (HN, AN, ชื่อ-นามสกุล) ให้ครบถ้วนครับ');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ action: 'addPatient', token: APP_TOKEN, ...formData })
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert('🎉 บันทึกข้อมูลเข้าสเปรดชีตสำเร็จเรียบร้อยครับ!');
        fetchPatients();
        setView('registry');
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.message);
      }
    } catch (error) {
      alert('กรุณาเช็กสิทธิ์และการตั้งค่า API_URL บน Vercel ครับ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-600 antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#1e3a8a] p-2 rounded-xl text-white"><Activity size={20} /></div>
          <div>
            <h2 className="text-sm font-black text-slate-800 leading-tight">Nopparat Rajathanee Hospital</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Stroke Registry System</p>
          </div>
        </div>
        <button onClick={() => setView('add')} className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all">
          <Plus size={14} /> <span>รับเข้าผู้ป่วยใหม่</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col p-4 space-y-1">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12px] font-black transition-all ${view === 'dashboard' ? 'bg-[#1e3a8a] text-white' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutDashboard size={16} /> แดชบอร์ดภาพรวม</button>
          <button onClick={() => setView('registry')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12px] font-black transition-all ${view === 'registry' ? 'bg-[#1e3a8a] text-white' : 'text-slate-500 hover:bg-slate-50'}`}><Users size={16} /> ทะเบียนผู้ป่วย</button>
          <button onClick={() => setView('add')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12px] font-black transition-all ${view === 'add' ? 'bg-[#1e3a8a] text-white' : 'text-slate-500 hover:bg-slate-50'}`}><UserPlus size={16} /> บันทึกเคสผู้ป่วยใหม่</button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Home size={10} /> Home <ChevronRight size={8} /> {view}</div>

            {view === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-blue-600 border-l-[6px]">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">ผู้ป่วยสะสม</p><h3 className="text-2xl font-black text-blue-900">{stats.total} ราย</h3></div>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-amber-500 border-l-[6px]">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">ได้รับยา rt-PA</p><h3 className="text-2xl font-black text-amber-600">{stats.fastTrackCount} ราย</h3></div>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-green-500 border-l-[6px]">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">สถานะระบบ</p><h3 className="text-2xl font-black text-green-600">ออนไลน์</h3></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-800 text-sm mb-6 uppercase tracking-wider">สัดส่วนประเภท Stroke</h4>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.pieData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {stats.pieData.map((_, i) => <Cell key={i} fill={['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'][i % 4]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {view === 'add' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-[#1e3a8a] p-5 text-white">
                  <h3 className="font-black text-base uppercase tracking-wider">Stroke Patient Admission Form</h3>
                  <p className="text-[10px] opacity-70">บันทึกเวชระเบียนและตัวชี้วัดคุณภาพหอผู้ป่วยโรคหลอดเลือดสมอง</p>
                </div>
                <div className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">HN *</label>
                      <input type="text" required value={formData.hn} onChange={(e) => handleInputChange('hn', e.target.value)} className="w-full border-2 border-slate-100 p-2 rounded-xl bg-slate-50 text-xs font-bold outline-none focus:border-blue-500" placeholder="67-xxxx" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">AN *</label>
                      <input type="text" required value={formData.an} onChange={(e) => handleInputChange('an', e.target.value)} className="w-full border-2 border-slate-100 p-2 rounded-xl bg-slate-50 text-xs font-bold outline-none focus:border-blue-500" placeholder="Axxxxx" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">ชื่อ - นามสกุล *</label>
                      <input type="text" required value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className="w-full border-2 border-slate-100 p-2 rounded-xl bg-slate-50 text-xs font-bold outline-none focus:border-blue-500" placeholder="ระบุชื่อผู้ป่วย" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">อายุ (ปี)</label>
                      <input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} className="w-full border-2 border-slate-100 p-2 rounded-xl bg-slate-50 text-xs font-bold outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">เพศ</label>
                      <select value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} className="w-full border-2 border-slate-100 p-2 rounded-xl bg-slate-50 text-xs font-bold outline-none">
                        <option value="ชาย">ชาย</option><option value="หญิง">หญิง</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Stroke Type</label>
                      <select value={formData.strokeType} onChange={(e) => handleInputChange('strokeType', e.target.value)} className="w-full border-2 border-slate-100 p-2 rounded-xl bg-slate-50 text-xs font-bold outline-none">
                        <option value="Ischemic">Ischemic</option><option value="Hemorrhagic">Hemorrhagic</option><option value="TIA">TIA</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Door to Needle Time (นาที)</label>
                      <input type="text" value={formData.doorToNeedleTime} onChange={(e) => handleInputChange('doorToNeedleTime', e.target.value)} className="w-full border-2 border-slate-100 p-2 rounded-xl bg-slate-50 text-xs font-bold outline-none" placeholder="เช่น 45" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">NIHSS Score</label>
                      <input type="number" value={formData.nihss} onChange={(e) => handleInputChange('nihss', e.target.value)} className="w-full border-2 border-slate-100 p-2 rounded-xl bg-slate-50 text-xs font-bold outline-none" placeholder="0 - 42" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Thrombolysis</label>
                      <select value={formData.thrombolysis} onChange={(e) => handleInputChange('thrombolysis', e.target.value)} className="w-full border-2 border-slate-100 p-2 rounded-xl bg-slate-50 text-xs font-bold outline-none">
                        <option value="ไม่ได้ให้">ไม่ได้ให้</option><option value="ให้ rt-PA">ให้ rt-PA</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setView('dashboard')} className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold">ยกเลิก</button>
                    <button type="submit" disabled={loading} className="px-8 py-2 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-blue-800 disabled:bg-slate-200">
                      <Save size={14} /> {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลเข้า Google Sheets'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {view === 'registry' && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">ทะเบียนรายชื่อผู้ป่วยในระบบ</h3>
                  <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input type="text" placeholder="ค้นหา..." className="w-full bg-slate-50 border-none rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                      <tr><th className="px-6 py-4">HN / AN</th><th className="px-6 py-4">ชื่อ-นามสกุล</th><th className="px-6 py-4">ประเภท Stroke</th><th className="px-6 py-4">NIHSS</th><th className="px-6 py-4">rt-PA Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredPatients.map((p, i) => (
                        <tr key={i} className="text-xs font-medium">
                          <td className="px-6 py-4 font-mono font-black text-blue-900">{p.hn}<br/><span className="text-slate-400">{p.an}</span></td>
                          <td className="px-6 py-4 font-bold text-slate-800">{p.fullName || p.patientName}</td>
                          <td className="px-6 py-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black">{p.strokeType}</span></td>
                          <td className="px-6 py-4 font-bold">{p.nihss || '-'}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-black ${p.thrombolysis === 'ให้ rt-PA' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{p.thrombolysis}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
