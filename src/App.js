import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Save,
  ChevronRight,
  Home,
  ArrowLeft,
} from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = process.env.REACT_APP_API_URL;
const APP_TOKEN = process.env.REACT_APP_APP_TOKEN;

const createDefaultForm = () => ({
  hn: "",
  an: "",
  fullName: "",
  age: "",
  gender: "ชาย",
  strokeType: "Ischemic",
  nihss: "",
  doorToNeedleTime: "",
  thrombolysis: "ไม่ได้ให้",
  admitDate: new Date().toISOString().split("T")[0],
  dischargeDate: "",
  outcome: "กำลังรักษา",
  remark: "",
});

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <p className="text-[10px] uppercase font-black text-slate-400">{title}</p>
      <h3 className="text-2xl font-black text-slate-800 mt-2">{value}</h3>
    </div>
  );
}

function Input({ label, value, onChange, required = false, type = "text" }) {
  return (
    <div>
      <label className="text-[10px] uppercase font-black text-slate-400">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 border-2 border-slate-100 rounded-xl p-3 bg-slate-50 text-sm outline-none"
      />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(createDefaultForm());

  const fetchPatients = async () => {
    if (!API_URL) return setApiError("API URL not set");

    setLoading(true);
    setApiError(null);

    try {
      const params = new URLSearchParams({ action: "getPatients" });
      if (APP_TOKEN) params.append("token", APP_TOKEN);

      const res = await fetch(`${API_URL}?${params.toString()}`);
      const json = await res.json();

      if (json.status === "success") {
        setPatients(json.data || []);
      } else {
        setApiError(json.message || "Failed to fetch patients");
        setPatients([]);
      }
    } catch (err) {
      console.error(err);
      setApiError("Cannot connect to API");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const stats = useMemo(() => {
    const total = patients.length;
    const fastTrackCount = patients.filter(p => p.thrombolysis === "ให้ rt-PA").length;
    const typeMap = patients.reduce((acc, p) => {
      const t = p.strokeType || "ไม่ระบุ";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.keys(typeMap).map(k => ({ name: k, value: typeMap[k] }));
    return { total, fastTrackCount, pieData };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    if (!keyword) return patients;
    return patients.filter(p => 
      (p.fullName || "").toLowerCase().includes(keyword) ||
      (p.hn || "").toLowerCase().includes(keyword) ||
      (p.an || "").toLowerCase().includes(keyword)
    );
  }, [patients, searchTerm]);

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hn || !formData.an || !formData.fullName) {
      alert("กรุณากรอก HN, AN และชื่อผู้ป่วยให้ครบ");
      return;
    }

    setLoading(true);
    try {
      const payload = { action: "addPatient", ...formData };
      if (APP_TOKEN) payload.token = APP_TOKEN;

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.status === "success") {
        alert("บันทึกสำเร็จ");
        setFormData(createDefaultForm());
        await fetchPatients();
        setView("registry");
      } else {
        alert(json.message || "API error");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อ API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
      <header className="bg-white p-4 md:p-6 flex justify-between items-center shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-900 text-white p-3 rounded-xl"><Activity size={20} /></div>
          <div>
            <h1 className="font-black text-sm text-slate-800">Nopparat Rajathanee Hospital</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Stroke Registry System</p>
          </div>
        </div>
        <button onClick={() => setView("add")} className="bg-blue-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-blue-800 transition">
          <Plus size={14} /> เพิ่มผู้ป่วย
        </button>
      </header>

      {apiError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mt-4">
          <p className="text-red-600 font-bold">API Error: {apiError}</p>
        </div>
      )}

      {view === "dashboard" && (
        <div className="mt-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card title="ผู้ป่วยสะสม" value={`${stats.total} ราย`} />
            <Card title="ได้รับ rt-PA" value={`${stats.fastTrackCount} ราย`} />
            <Card title="สถานะระบบ" value={apiError ? "ออฟไลน์" : "ออนไลน์"} />
          </div>

          {stats.pieData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mt-4">
              <h2 className="font-black text-sm mb-4">Stroke Type Summary</h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.pieData} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={4}>
                      {stats.pieData.map((_, i) => <Cell key={i} fill={["#1e3a8a","#2563eb","#60a5fa","#93c5fd"][i % 4]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {view === "add" && (
        <div className="mt-6">
          <button onClick={() => setView("dashboard")} className="text-blue-900 flex items-center gap-2 mb-4"><ArrowLeft size={16}/> Back</button>
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="font-black text-lg">Add Patient</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Input label="HN" value={formData.hn} required onChange={v => handleInputChange("hn", v)} />
              <Input label="AN" value={formData.an} required onChange={v => handleInputChange("an", v)} />
              <Input label="ชื่อผู้ป่วย" value={formData.fullName} required onChange={v => handleInputChange("fullName", v)} />
              <Input label="Age" type="number" value={formData.age} onChange={v => handleInputChange("age", v)} />
              <Input label="NIHSS" type="number" value={formData.nihss} onChange={v => handleInputChange("nihss", v)} />
              <Input label="Door to Needle Time" value={formData.doorToNeedleTime} onChange={v => handleInputChange("doorToNeedleTime", v)} />
              <Input label="Thrombolysis" value={formData.thrombolysis} onChange={v => handleInputChange("thrombolysis", v)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-800 disabled:opacity-50 transition">
              <Save size={14}/> {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </form>
        </div>
      )}

      {view === "registry" && (
        <div className="mt-6">
          <button onClick={() => setView("dashboard")} className="text-blue-900 flex items-center gap-2 mb-4"><ArrowLeft size={16}/> Back</button>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-black text-sm">Registry</h2>
              <div className="relative w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="ค้นหาผู้ป่วย..." className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none focus:border-2 focus:border-blue-500"/>
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black sticky top-0">
                <tr>
                  <th className="px-4 md:px-6 py-4">HN / AN</th>
                  <th className="px-4 md:px-6 py-4">ชื่อผู้ป่วย</th>
                  <th className="px-4 md:px-6 py-4">Stroke Type</th>
                  <th className="px-4 md:px-6 py-4">NIHSS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? filteredPatients.map((p, i) => (
                  <tr key={`${p.hn || "row"}-${i}`} className="border-t border-slate-50 text-xs hover:bg-slate-50 transition">
                    <td className="px-4 md:px-6 py-4">{p.hn || "-"}<br/><span className="text-slate-400">{p.an || "-"}</span></td>
                    <td className="px-4 md:px-6 py-4 font-bold">{p.fullName || "-"}</td>
                    <td className="px-4 md:px-6 py-4">{p.strokeType || "-"}</td>
                    <td className="px-4 md:px-6 py-4">{p.nihss || "-"}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-4 md:px-6 py-8 text-center text-slate-400">No patients found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
