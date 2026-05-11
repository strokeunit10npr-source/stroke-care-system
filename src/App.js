import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Users, ClipboardCheck, FileText, Plus, Search, 
  AlertTriangle, Activity, MapPin, Stethoscope, Clock, Printer, 
  Home, UserPlus, BarChart3, LogOut, Settings, Calendar, CheckCircle2, 
  XCircle, Save, ChevronRight, Info, Heart, Trash2, Edit3, ClipboardList
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- Configuration & Constants ---
const STROKE_TYPES = ['Thrombotic', 'Embolic', 'TIA', 'Recurrent Stroke'];
const CASE_STATUS = ['Stroke ทั่วไป', 'ภาวะแทรกซ้อน', 'Readmit จาก Stroke'];
const ADMISSION_SOURCES = ['ER', 'NaICU', 'OPD', 'อื่นๆ'];
const DISCHARGE_STATUS = ['ดีขึ้น', 'เสียชีวิต/Dead', 'ส่งต่อ'];

const COMPLICATION_LIST = [
  { id: 'pneumonia', label: 'Aspiration Pneumonia' },
  { id: 'uti', label: 'UTI (ติดเชื้อทางเดินปัสสาวะ)' },
  { id: 'bedsore', label: 'Bed sore (แผลกดทับ)' },
  { id: 'fall', label: 'Fall (พลัดตกหกล้ม)' },
  { id: 'hemorrhage', label: 'Hemorrhage (เลือดออก)' },
  { id: 'iicp', label: 'IICP (ความดันในกะโหลกสูง)' },
  { id: 'sepsis', label: 'Sepsis (ติดเชื้อในกระแสเลือด)' },
  { id: 'dvt', label: 'DVT (ลิ่มเลือดในหลอดเลือดดำ)' },
];

const KPI_LIST = [
  { id: 'asa48h', label: 'ได้รับ ASA ใน 48 ชม.' },
  { id: 'asaDC', label: 'ได้รับ ASA ขณะจำหน่าย' },
  { id: 'afWarfarin', label: 'AF ได้รับ Anticoagulant' },
  { id: 'pt', label: 'ได้รับการทำกายภาพบำบัด' },
  { id: 'smoke', label: 'ปรึกษา/แนะนำเลิกบุหรี่' },
  { id: 'edu', label: 'ได้รับความรู้เรื่องโรค' },
  { id: 'dcPlan', label: 'มีการวางแผนจำหน่าย (D/C Plan)' },
];

// --- Mock Initial Data ---
const MOCK_PATIENTS = [
  {
    id: '1', hn: '67-00123', an: 'A12345', name: 'นายสมชาย รักดี', age: 68, 
    admitDate: '2024-03-01', strokeType: 'Thrombotic', caseStatus: 'Stroke ทั่วไป',
    kpis: { asa48h: true, pt: true, edu: true, dcPlan: false },
    complications: { pneumonia: true },
    dcStatus: 'ดีขึ้น', dcDate: '2024-03-10', district: 'กันทรวิชัย'
  },
  {
    id: '2', hn: '67-00456', an: 'A45678', name: 'นางวันดี มีสุข', age: 72, 
    admitDate: '2024-03-05', strokeType: 'Embolic', caseStatus: 'ภาวะแทรกซ้อน',
    kpis: { asa48h: true, pt: true, edu: true, dcPlan: true },
    complications: { bedsore: true, uti: true },
    dcStatus: 'เสียชีวิต/Dead', dcDate: '2024-03-08', district: 'เมืองมหาสารคาม'
  }
];

const App = () => {
  const [view, setView] = useState('dashboard');
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    const total = patients.length;
    const typeCount = patients.reduce((acc, p) => {
      acc[p.strokeType] = (acc[p.strokeType] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.keys(typeCount).map(key => ({ name: key, value: typeCount[key] }));
    const complicationStats = COMPLICATION_LIST.map(c => ({
      name: c.label.split(' ')[0],
      count: patients.filter(p => p.complications?.[c.id]).length
    }));
    const kpiRadar = KPI_LIST.map(k => ({
      subject: k.label.substring(0, 10),
      A: (patients.filter(p => p.kpis?.[k.id]).length / (total || 1)) * 100,
      fullMark: 100
    }));
    const missingDCPlan = patients.filter(p => !p.kpis?.dcPlan).length;
    return { total, pieData, complicationStats, kpiRadar, missingDCPlan };
  }, [patients]);

  const filteredPatients = patients.filter(p => 
    p.name.includes(searchTerm) || p.hn.includes(searchTerm) || p.an.includes(searchTerm)
  );

  const Header = () => (
    <header className="bg-[#1e3a8a] text-white p-3 flex justify-between items-center sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1 rounded-full">
          <img src="https://upload.wikimedia.org/wikipedia/th/thumb/0/00/MOPH_Logo.png/220px-MOPH_Logo.png" alt="MOPH Logo" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h1 className="text-sm md:text-base font-black leading-tight uppercase">Stroke Care CMS</h1>
          <p className="text-[10px] opacity-70 font-medium">Mahasarakham Hospital - Ward 3A</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setView('add')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">เพิ่มผู้ป่วย</span>
        </button>
      </div>
    </header>
  );

  const Sidebar = () => (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col h-screen md:h-auto">
      <nav className="p-4 space-y-1">
        <NavItem icon={LayoutDashboard} label="แดชบอร์ดภาพรวม" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
        <NavItem icon={Users} label="ทะเบียนผู้ป่วย" active={view === 'registry'} onClick={() => setView('registry')} />
        <NavItem icon={UserPlus} label="รับเข้าผู้ป่วยใหม่" active={view === 'add'} onClick={() => setView('add')} />
        <NavItem icon={FileText} label="รายงาน PDF" active={view === 'report'} onClick={() => setView('report')} />
      </nav>
    </aside>
  );

  const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${active ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-600 hover:bg-blue-50'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  const Dashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="ผู้ป่วยทั้งหมด" value={stats.total} unit="ราย" color="border-l-blue-600" />
        <StatCard icon={AlertTriangle} label="รอทำ D/C Plan" value={stats.missingDCPlan} unit="ราย" color="border-l-red-500" valueColor="text-red-600" />
        <StatCard icon={CheckCircle2} label="ASA in 48h" value="94.5" unit="%" color="border-l-green-500" valueColor="text-green-600" />
        <StatCard icon={Heart} label="Survival Rate" value="98.2" unit="%" color="border-l-pink-500" valueColor="text-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">ประเภทของ Stroke</h4>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.pieData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">{stats.pieData.map((_, i) => <Cell key={i} fill={['#1e3a8a', '#2563eb', '#60a5fa', '#93c5fd'][i % 4]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">ภาวะแทรกซ้อน</h4>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={stats.complicationStats}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={10} /><Tooltip /><Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={30} /></BarChart></ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, unit, color, valueColor = "text-blue-900" }) => (
    <div className={`bg-white p-5 rounded-3xl border border-l-[6px] shadow-sm flex items-center gap-4 ${color}`}>
      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Icon size={24} /></div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase">{label}</p>
        <div className="flex items-baseline gap-1">
          <h3 className={`text-2xl font-black ${valueColor}`}>{value}</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
        </div>
      </div>
    </div>
  );

  const AdmissionForm = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in zoom-in-95">
      <div className="bg-[#1e3a8a] p-5 text-white">
        <h3 className="font-black text-lg uppercase">Patient Admission</h3>
        <p className="text-[10px] opacity-70">แบบบันทึกการรับเข้าและการประเมินคุณภาพ</p>
      </div>
      <div className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="HN *" placeholder="รหัสผู้ป่วย 67-xxxx" />
          <FormInput label="AN *" placeholder="รหัสรับเข้า Axxxxx" />
          <FormInput label="ชื่อ-นามสกุล *" placeholder="ระบุชื่อและนามสกุล..." />
          <FormInput label="วันที่รับไว้" type="date" />
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={() => setView('dashboard')} className="px-6 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold">ยกเลิก</button>
          <button className="px-10 py-2 rounded-xl bg-[#1e3a8a] text-white font-bold flex items-center gap-2 shadow-lg hover:bg-blue-800 transition-all">
            <Save size={18} /> บันทึกข้อมูล
          </button>
        </div>
      </div>
    </div>
  );

  const FormInput = ({ label, type = "text", placeholder }) => (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-slate-400 uppercase">{label}</label>
      <input type={type} className="w-full border-2 border-slate-100 p-2.5 rounded-xl bg-slate-50 text-sm font-bold focus:border-blue-500 outline-none transition-all" placeholder={placeholder} />
    </div>
  );

  const RegistryTable = () => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-black text-slate-800 uppercase tracking-tight">ทะเบียนผู้ป่วย</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="ค้นหา..." className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
            <tr>
              <th className="px-6 py-4">HN / AN</th>
              <th className="px-6 py-4">ชื่อ-นามสกุล</th>
              <th className="px-6 py-4">ประเภท Stroke</th>
              <th className="px-6 py-4 text-center">KPI ASA</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredPatients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-mono text-[11px] font-black text-blue-900">{p.hn}<br/><span className="text-slate-400">{p.an}</span></td>
                <td className="px-6 py-4 font-black text-slate-800 text-sm">{p.name}</td>
                <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase">{p.strokeType}</span></td>
                <td className="px-6 py-4 text-center">{p.kpis?.asa48h ? <CheckCircle2 size={20} className="text-green-500 mx-auto" /> : <XCircle size={20} className="text-slate-200 mx-auto" />}</td>
                <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity"><button className="p-1.5 text-blue-600"><Edit3 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Home size={12} /> Home <ChevronRight size={10} /> {view}</div>
            {view === 'dashboard' && <Dashboard />}
            {view === 'add' && <AdmissionForm />}
            {view === 'registry' && <RegistryTable />}
            {view === 'report' && <div className="p-12 text-center text-slate-400 font-bold uppercase">Reporting System Coming Soon...</div>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
