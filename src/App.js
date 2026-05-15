import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Activity,
  Save,
  ChevronRight,
  Home,
  ArrowLeft,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = https://script.google.com/macros/s/AKfycbyOdU9fk4vIvofSmGr0BAMXYB4qdxp_EWqasctBeve3CdPtNgDy8W7_wJldghqkvE6w/exec

const APP_TOKEN = "stroke2026secure";

const createDefaultForm = () => ({
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
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 border-2 border-slate-100 rounded-xl p-3 bg-slate-50 text-sm outline-none focus:border-blue-500 transition"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, required = false }) {
  return (
    <div>
      <label className="text-[10px] uppercase font-black text-slate-400">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 border-2 border-slate-100 rounded-xl p-3 bg-slate-50 text-sm outline-none focus:border-blue-500 transition"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
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

  const safeJsonFetch = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || `HTTP ${response.status}`);
      }

      if (!text) {
        return { status: "success", data: [] };
      }

      try {
        return JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      setApiError(error.message);
      throw error;
    }
  };

  const fetchPatients = async () => {
    if (!API_URL) {
      setApiError("API_URL not configured");
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      const params = new URLSearchParams({
        action: "getPatients",
      });

      if (APP_TOKEN) {
        params.append("token", APP_TOKEN);
      }

      const result = await safeJsonFetch(`${API_URL}?${params.toString()}`);

      if (result.status === "success") {
        setPatients(Array.isArray(result.data) ? result.data : []);
      } else {
        setApiError(result.message || "Failed to fetch patients");
        setPatients([]);
      }
    } catch (error) {
      console.error("Fetch error:", error.message);
      setApiError("Unable to connect to API. Check your internet connection.");
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

    const fastTrackCount = patients.filter(
      (patient) => patient?.thrombolysis === "ให้ rt-PA"
    ).length;

    const typeMap = patients.reduce((acc, patient) => {
      const type = patient?.strokeType || "ไม่ระบุ";
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
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return patients;
    }

    return patients.filter((patient) => {
      const name = (patient?.fullName || patient?.patientName || "")
        .toString()
        .toLowerCase();
      const hn = (patient?.hn || "").toString().toLowerCase();
      const an = (patient?.an || "").toString().toLowerCase();

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.hn.trim() || !formData.an.trim() || !formData.fullName.trim()) {
      alert("กรุณากรอก HN, AN และชื่อผู้ป่วยให้ครบ");
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      const payload = {
        action: "addPatient",
        ...formData,
      };

      if (APP_TOKEN) {
        payload.token = APP_TOKEN;
      }

      const result = await safeJsonFetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (result.status === "success") {
        alert("บันทึกข้อมูลสำเร็จ");
        setFormData(createDefaultForm());
        await fetchPatients();
        setView("registry");
      } else {
        alert(result.message || "เกิดข้อผิดพลาดจาก API");
      }
    } catch (error) {
      console.error("Save error:", error.message);
      alert("บันทึกข้อมูลไม่สำเร็จ กรุณาตรวจสอบ API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 text-white p-3 rounded-xl">
              <Activity size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-sm text-slate-800">
                Nopparat Rajathanee Hospital
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Stroke Registry System
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setView("add")}
            className="bg-blue-900 text-white px-4 md:px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-800 transition"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">รับผู้ป่วยใหม่</span>
            <span className="sm:hidden">เพิ่ม</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Breadcrumb */}
        <div className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
          <Home size={10} />
          Home
          <ChevronRight size={10} />
          <span className="capitalize">{view}</span>
        </div>

        {/* Error Alert */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">API Error</p>
              <p className="text-xs text-red-600 mt-1">{apiError}</p>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {view === "dashboard" && (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <Card title="ผู้ป่วยสะสม" value={`${stats.total} ราย`} />
              <Card title="ได้รับ rt-PA" value={`${stats.fastTrackCount} ราย`} />
              <Card title="สถานะระบบ" value={apiError ? "ออฟไลน์" : "ออนไลน์"} />
            </div>

            {stats.pieData.length > 0 ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-black text-sm mb-6">Stroke Type Summary</h2>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.pieData}
                        dataKey="value"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                      >
                        {stats.pieData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={[
                              "#1e3a8a",
                              "#2563eb",
                              "#60a5fa",
                              "#93c5fd",
                            ][index % 4]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
                <p className="text-slate-500">No patient data available</p>
              </div>
            )}

            <button
              onClick={() => setView("registry")}
              className="w-full bg-blue-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-800 transition"
            >
              View Registry
            </button>
          </>
        )}

        {view === "add" && (
          <>
            <button
              onClick={() => setView("dashboard")}
              className="flex items-center gap-2 text-blue-900 hover:text-blue-800 font-bold mb-4"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6"
            >
              <h2 className="font-black text-lg">Add Patient</h2>

              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  label="HN"
                  value={formData.hn}
                  required
                  onChange={(value) => handleInputChange("hn", value)}
                />

                <Input
                  label="AN"
                  value={formData.an}
                  required
                  onChange={(value) => handleInputChange("an", value)}
                />

                <Input
                  label="ชื่อผู้ป่วย"
                  value={formData.fullName}
                  required
                  onChange={(value) => handleInputChange("fullName", value)}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(value) => handleInputChange("age", value)}
                />

                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(value) => handleInputChange("gender", value)}
                  options={["ชาย", "หญิง"]}
                />

                <Input
                  label="Diagnosis"
                  value={formData.diagnosis}
                  onChange={(value) => handleInputChange("diagnosis", value)}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Select
                  label="Stroke Type"
                  value={formData.strokeType}
                  onChange={(value) => handleInputChange("strokeType", value)}
                  options={["Ischemic", "Hemorrhagic", "TIA"]}
                />

                <Input
                  label="NIHSS"
                  type="number"
                  value={formData.nihss}
                  onChange={(value) => handleInputChange("nihss", value)}
                />

                <Input
                  label="Admit Date"
                  type="date"
                  value={formData.admitDate}
                  onChange={(value) => handleInputChange("admitDate", value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-800 disabled:opacity-50 transition"
              >
                <Save size={14} />
                {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </form>
          </>
        )}

        {view === "registry" && (
          <>
            <button
              onClick={() => setView("dashboard")}
              className="flex items-center gap-2 text-blue-900 hover:text-blue-800 font-bold mb-4"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h2 className="font-black text-sm">Registry</h2>

                <div className="relative w-full md:w-72">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ค้นหาผู้ป่วย..."
                    className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none focus:border-2 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
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
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient, index) => (
                        <tr
                          key={`${patient?.hn || "row"}-${index}`}
                          className="border-t border-slate-50 text-xs hover:bg-slate-50 transition"
                        >
                          <td className="px-4 md:px-6 py-4">
                            {patient?.hn || "-"}
                            <br />
                            <span className="text-slate-400">{patient?.an || "-"}</span>
                          </td>
                          <td className="px-4 md:px-6 py-4 font-bold">
                            {patient?.fullName || patient?.patientName || "-"}
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            {patient?.strokeType || "-"}
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            {patient?.nihss || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 md:px-6 py-8 text-center text-slate-400"
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
