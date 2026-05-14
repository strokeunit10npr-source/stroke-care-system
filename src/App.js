const API_URL = import.meta.env.VITE_API_URL;
const APP_TOKEN = import.meta.env.VITE_APP_TOKEN || "";
```javascript
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
  UserPlus
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from "recharts";

/**
 * IMPORTANT FOR VERCEL + VITE
 *
 * Environment Variables on Vercel must be:
 *
 * VITE_API_URL
 * VITE_APP_TOKEN
 *
 * Example:
 * VITE_API_URL=https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec
 * VITE_APP_TOKEN=your_token_here
 */

const API_URL = import.meta.env.VITE_API_URL;
const APP_TOKEN = import.meta.env.VITE_APP_TOKEN || "";

const App = () => {
  const [view, setView] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    remark: ""
  };

  const [formData, setFormData] = useState(defaultForm);

  /**
   * FETCH ALL PATIENTS
   */
  const fetchPatients = async () => {
    if (!API_URL) {
      console.error("VITE_API_URL not found");
      return;
    }

    setLoading(true);

    try {
      const url = `${API_URL}?action=getPatients&token=${APP_TOKEN}`;

      const res = await fetch(url);
      const result = await res.json();

      if (result.status === "success") {
        setPatients(result.data || []);
      } else {
        console.error(result);
      }
    } catch (error) {
      console.error("Fetch patients error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  /**
   * DASHBOARD STATS
   */
  const stats = useMemo(() => {
    const total = patients.length;

    const typeCount = patients.reduce((acc, patient) => {
      const type = patient.strokeType || "ไม่ระบุ";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(typeCount).map((key) => ({
      name: key,
      value: typeCount[key]
    }));

    const fastTrackCount = patients.filter(
      (p) => p.thrombolysis === "ให้ rt-PA"
    ).length;

    return {
      total,
      pieData,
      fastTrackCount
    };
  }, [patients]);

  /**
   * SEARCH FILTER
   */
  const filteredPatients = patients.filter((p) => {
    const keyword = searchTerm.toLowerCase();

    return (
      (p.fullName || p.patientName || "")
        .toLowerCase()
        .includes(keyword) ||
      (p.hn || "").toLowerCase().includes(keyword) ||
      (p.an || "").toLowerCase().includes(keyword)
    );
  });

  /**
   * INPUT CHANGE
   */
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * SAVE PATIENT
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!API_URL) {
      alert("ไม่พบ VITE_API_URL บนระบบ Vercel");
      return;
    }

    if (!formData.hn || !formData.an || !formData.fullName) {
      alert("กรุณากรอก HN, AN และชื่อผู้ป่วยให้ครบ");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        action: "addPatient",
        token: APP_TOKEN,
        ...formData
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.status === "success") {
        alert("บันทึกข้อมูลสำเร็จ");

        setFormData(defaultForm);
        await fetchPatients();
        setView("registry");
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
        console.error(result);
      }
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถเชื่อมต่อ API ได้ กรุณาตรวจสอบ Google Apps Script และ Vercel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 text-white p-3 rounded-xl">
              <Activity size={20} />
            </div>

            <div>
              <h1 className="font-black text-slate-800 text-sm">
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

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white border-r border-slate-100 min-h-screen p-4 space-y-2">
          <button
            onClick={() => setView("dashboard")}
            className={`w-full rounded-2xl px-4 py-3 text-left text-xs font-black flex items-center gap-3 ${
              view === "dashboard"
                ? "bg-blue-900 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>

          <button
            onClick={() => setView("registry")}
            className={`w-full rounded-2xl px-4 py-3 text-left text-xs font-black flex items-center gap-3 ${
              view === "registry"
                ? "bg-blue-900 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Users size={16} />
            Registry
          </button>

          <button
            onClick={() => setView("add")}
            className={`w-full rounded-2xl px-4 py-3 text-left text-xs font-black flex items-center gap-3 ${
              view === "add"
                ? "bg-blue-900 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <UserPlus size={16} />
            Add Patient
          </button>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
              <Home size={10} />
              Home
              <ChevronRight size={10} />
              {view}
            </div>

            {/* DASHBOARD */}
            {view === "dashboard" && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card
                    title="ผู้ป่วยสะสม"
                    value={`${stats.total} ราย`}
                  />

                  <Card
                    title="ได้รับ rt-PA"
                    value={`${stats.fastTrackCount} ราย`}
                  />

                  <Card
                    title="สถานะระบบ"
                    value="ออนไลน์"
                  />
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h2 className="font-black text-sm mb-6">
                    Stroke Type Summary
                  </h2>

                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.pieData}
                          dataKey="value"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                        >
                          {stats.pieData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={
                                ["#1e3a8a", "#2563eb", "#60a5fa", "#93c5fd"][
                                  i % 4
                                ]
                              }
                            />
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

            {/* ADD PATIENT */}
            {view === "add" && (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="bg-blue-900 text-white p-6">
                  <h2 className="font-black text-lg">
                    Stroke Patient Admission Form
                  </h2>
                </div>

                <div className="p-8 grid md:grid-cols-3 gap-6">
                  <Input
                    label="HN *"
                    value={formData.hn}
                    onChange={(v) => handleInputChange("hn", v)}
                  />

                  <Input
                    label="AN *"
                    value={formData.an}
                    onChange={(v) => handleInputChange("an", v)}
                  />

                  <Input
                    label="ชื่อ-นามสกุล *"
                    value={formData.fullName}
                    onChange={(v) => handleInputChange("fullName", v)}
                  />

                  <Input
                    label="อายุ"
                    value={formData.age}
                    onChange={(v) => handleInputChange("age", v)}
                  />

                  <Input
                    label="NIHSS"
                    value={formData.nihss}
                    onChange={(v) => handleInputChange("nihss", v)}
                  />

                  <Input
                    label="Door to Needle Time"
                    value={formData.doorToNeedleTime}
                    onChange={(v) =>
                      handleInputChange("doorToNeedleTime", v)
                    }
                  />
                </div>

                <div className="p-8 pt-0 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
                  >
                    <Save size={14} />
                    {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </button>
                </div>
              </form>
            )}

            {/* REGISTRY */}
            {view === "registry" && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="font-black text-sm">
                    Registry
                  </h2>

                  <div className="relative w-72">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value)
                      }
                      placeholder="ค้นหาผู้ป่วย..."
                      className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black">
                    <tr>
                      <th className="px-6 py-4">HN / AN</th>
                      <th className="px-6 py-4">ชื่อผู้ป่วย</th>
                      <th className="px-6 py-4">Stroke Type</th>
                      <th className="px-6 py-4">NIHSS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPatients.map((p, i) => (
                      <tr
                        key={i}
                        className="border-t border-slate-50 text-xs"
                      >
                        <td className="px-6 py-4">
                          {p.hn}
                          <br />
                          {p.an}
                        </td>

                        <td className="px-6 py-4 font-bold">
                          {p.fullName || p.patientName}
                        </td>

                        <td className="px-6 py-4">
                          {p.strokeType}
                        </td>

                        <td className="px-6 py-4">
                          {p.nihss || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <p className="text-[10px] uppercase font-black text-slate-400">
        {title}
      </p>

      <h3 className="text-2xl font-black text-slate-800 mt-2">
        {value}
      </h3>
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
        className="w-full mt-2 border-2 border-slate-100 rounded-xl p-3 bg-slate-50 text-sm font-medium outline-none"
      />
    </div>
  );
}

export default App;
```
