import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Plus,
  Search,
  Activity,
  Save,
  ChevronRight,
  Home,
  UserPlus,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL;
const APP_TOKEN = process.env.REACT_APP_APP_TOKEN || "";

const defaultForm = {
  hn: "",
  an: "",
  fullName: "",
  age: "",
  gender: "ชาย",
  diagnosis: "",
  strokeType: "Ischemic",
  onsetTime: "",
  arrivalTime: "",
  doorToNeedleTime: "",
  nihss: "",
  ctBrainResult: "",
  thrombolysis: "ไม่ได้ให้",
  thrombectomy: "ไม่ได้ทำ",
  admitDate: new Date().toISOString().split("T")[0],
  dischargeDate: "",
  outcome: "กำลังรักษา",
  complication: "ไม่มี",
  riskFactors: "",
  followUp: "",
  doctor: "",
  nurse: "",
  remark: "",
};

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <p className="text-[10px] uppercase font-black text-slate-400">{title}</p>
      <h3 className="text-2xl font-black text-slate-800 mt-2">{value}</h3>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[10px] uppercase font-black text-slate-400">
        {label}
      </label>
      <input
        value={value}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(defaultForm);

  const fetchPatients = async () => {
    if (!API_URL) {
      console.error("REACT_APP_API_URL not found");
      return;
    }

    setLoading(true);

    try {
      const url = `${API_URL}?action=getPatients&token=${APP_TOKEN}`;
      const res = await fetch(url);
      const result = await res.json();

      if (result.status === "success") {
        setPatients(result.data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const stats = useMemo(() => {
    const total = patients.length;

    const fastTrackCount = patients.filter(
      (p) => p.thrombolysis === "ให้ rt-PA"
    ).length;

    const typeMap = patients.reduce((acc, p) => {
      const type = p.strokeType || "ไม่ระบุ";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(typeMap).map((key) => ({
      name: key,
      value: typeMap[key],
    }));

    return { total, fastTrackCount, pieData };
  }, [patients]);

  const filteredPatients = patients.filter((p) => {
    const keyword = searchTerm.toLowerCase();
    return (
      (p.fullName || p.patientName || "").toLowerCase().includes(keyword) ||
      (p.hn || "").toLowerCase().includes(keyword) ||
      (p.an || "").toLowerCase().includes(keyword)
    );
  });

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hn || !formData.an || !formData.fullName) {
      alert("กรุณากรอก HN, AN และชื่อผู้ป่วยให้ครบ");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        action: "addPatient",
        token: APP_TOKEN,
        ...formData,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.status === "success") {
        alert("บันทึกข้อมูลสำเร็จ");
        setFormData(defaultForm);
        fetchPatients();
        setView("registry");
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error(error);
      alert("เชื่อมต่อ API ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 text-white p-3 rounded-xl">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="font-black text-sm text-slate-800">
                Nopparat Rajathanee Hospital
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Stroke Registry System
              </p>
            </div>
          </div>

          <button
            onClick={() => setView("add")}
            className="bg-blue-900 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Plus size={14} />
            รับผู้ป่วยใหม่
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 space-y-6">
        <div className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
          <Home size={10} />
          Home
          <ChevronRight size={10} />
          {view}
        </div>

        {view === "dashboard" && (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <Card title="ผู้ป่วยสะสม" value={`${stats.total} ราย`} />
              <Card title="ได้รับ rt-PA" value={`${stats.fastTrackCount} ราย`} />
              <Card title="สถานะระบบ" value="ออนไลน์" />
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h2 className="font-black text-sm mb-6">Stroke Type Summary</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.pieData} dataKey="value" innerRadius={60} outerRadius={90}>
                      {stats.pieData.map((_, i) => (
                        <Cell key={i} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {view === "add" && (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <h2 className="font-black text-lg">Add Patient</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Input label="HN" value={formData.hn} onChange={(v) => handleInputChange("hn", v)} />
              <Input label="AN" value={formData.an} onChange={(v) => handleInputChange("an", v)} />
              <Input label="ชื่อผู้ป่วย" value={formData.fullName} onChange={(v) => handleInputChange("fullName", v)} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <Save size={14} />
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </form>
        )}

        {view === "registry" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-black text-sm">Registry</h2>
              <div className="relative w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหา..."
                  className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4">HN / AN</th>
                  <th className="px-6 py-4">ชื่อผู้ป่วย</th>
                  <th className="px-6 py-4">Stroke Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">{p.hn}<br />{p.an}</td>
                    <td className="px-6 py-4">{p.fullName || p.patientName}</td>
                    <td className="px-6 py-4">{p.strokeType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
