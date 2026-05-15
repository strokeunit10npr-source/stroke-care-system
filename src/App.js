import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Save,
  ArrowLeft,
  Activity,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL =
  "https://script.google.com/macros/s/AKfycbx6PdVmuYyjtg2s5mC4saBH9uKBo_8Q1RizLo1UdkzOuBacl9o9LEDz6uMQZt-agSbX/exec";

const APP_TOKEN = "stroke2026secure";

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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <p className="text-xs uppercase font-bold text-slate-400">{title}</p>
      <h2 className="text-3xl font-black text-slate-800 mt-2">{value}</h2>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 border rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(createDefaultForm());

  const fetchPatients = async () => {
    setLoading(true);
    setApiError("");

    try {
      const response = await fetch(
        `${API_URL}?action=getPatients&token=${APP_TOKEN}`
      );

      const result = await response.json();

      if (result.status === "success") {
        setPatients(result.data || []);
      } else {
        setApiError(result.message || "Fetch failed");
      }
    } catch (error) {
      console.error(error);
      setApiError("Cannot connect API");
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

    return {
      total,
      fastTrackCount,
      pieData,
    };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    if (!keyword) return patients;

    return patients.filter((p) => {
      const name = (p.fullName || "").toLowerCase();
      const hn = (p.hn || "").toLowerCase();
      const an = (p.an || "").toLowerCase();

      return (
        name.includes(keyword) ||
        hn.includes(keyword) ||
        an.includes(keyword)
      );
    });
  }, [patients, searchTerm]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hn || !formData.an || !formData.fullName) {
      alert("กรุณากรอก HN / AN / ชื่อผู้ป่วย");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        action: "addPatient",
        token: APP_TOKEN,
        ...formData,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === "success") {
        alert("บันทึกสำเร็จ");

        setFormData(createDefaultForm());

        await fetchPatients();

        setView("registry");
      } else {
        alert(result.message || "Save failed");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 text-white p-3 rounded-xl">
              <Activity size={20} />
            </div>

            <div>
              <h1 className="font-black text-slate-800">
                Stroke Registry System
              </h1>

              <p className="text-xs text-slate-500">
                Nopparat Rajathanee Hospital
              </p>
            </div>
          </div>

          <button
            onClick={() => setView("add")}
            className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold"
          >
            <Plus size={16} />
            เพิ่มผู้ป่วย
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {apiError && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-4 mb-6">
            {apiError}
          </div>
        )}

        {view === "dashboard" && (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <Card title="ผู้ป่วยทั้งหมด" value={`${stats.total} ราย`} />

              <Card
                title="ได้รับ rt-PA"
                value={`${stats.fastTrackCount} ราย`}
              />

              <Card
                title="สถานะระบบ"
                value={apiError ? "ออฟไลน์" : "ออนไลน์"}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6">
              <h2 className="font-black text-lg mb-4">
                Stroke Type Summary
              </h2>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      dataKey="value"
                      outerRadius={100}
                    >
                      {stats.pieData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={
                            ["#1e3a8a", "#2563eb", "#60a5fa", "#93c5fd"][
                              index % 4
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

              <button
                onClick={() => setView("registry")}
                className="mt-6 w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl font-bold"
              >
                เปิด Registry
              </button>
            </div>
          </>
        )}

        {view === "add" && (
          <>
            <button
              onClick={() => setView("dashboard")}
              className="flex items-center gap-2 text-blue-900 font-bold mb-6"
            >
              <ArrowLeft size={16} />
              กลับ
            </button>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6"
            >
              <h2 className="text-xl font-black">Add Patient</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="HN"
                  required
                  value={formData.hn}
                  onChange={(v) => handleInputChange("hn", v)}
                />

                <Input
                  label="AN"
                  required
                  value={formData.an}
                  onChange={(v) => handleInputChange("an", v)}
                />

                <Input
                  label="ชื่อผู้ป่วย"
                  required
                  value={formData.fullName}
                  onChange={(v) => handleInputChange("fullName", v)}
                />

                <Input
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(v) => handleInputChange("age", v)}
                />

                <Input
                  label="NIHSS"
                  type="number"
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

                <Input
                  label="Thrombolysis"
                  value={formData.thrombolysis}
                  onChange={(v) =>
                    handleInputChange("thrombolysis", v)
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />

                {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </form>
          </>
        )}

        {view === "registry" && (
          <>
            <button
              onClick={() => setView("dashboard")}
              className="flex items-center gap-2 text-blue-900 font-bold mb-6"
            >
              <ArrowLeft size={16} />
              กลับ
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-black">Registry</h2>

                <div className="relative w-72">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ค้นหาผู้ป่วย..."
                    className="w-full bg-slate-50 rounded-xl pl-10 pr-4 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">HN / AN</th>
                      <th className="px-6 py-4">ชื่อผู้ป่วย</th>
                      <th className="px-6 py-4">Stroke Type</th>
                      <th className="px-6 py-4">NIHSS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p, index) => (
                        <tr
                          key={index}
                          className="border-t border-slate-100 text-sm"
                        >
                          <td className="px-6 py-4">
                            {p.hn}
                            <br />
                            <span className="text-slate-400">{p.an}</span>
                          </td>

                          <td className="px-6 py-4 font-bold">
                            {p.fullName}
                          </td>

                          <td className="px-6 py-4">
                            {p.strokeType}
                          </td>

                          <td className="px-6 py-4">
                            {p.nihss}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-10 text-slate-400"
                        >
                          No patients found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
