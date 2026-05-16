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
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* =========================
   CONFIG
========================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxyHAZRA6RYav_0PoL9ZO_heBQB7-uWCBQnB9Kvc83L1Dux69ZgT9JGfd_ZhUlW8hAG/exec";

const APP_TOKEN = "stroke2026secure";

/* =========================
   DEFAULT FORM
========================= */

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

/* =========================
   CARD
========================= */

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

/* =========================
   INPUT
========================= */

function Input({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}) {
  return (
    <div>
      <label className="text-[10px] uppercase font-black text-slate-400">
        {label}

        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
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

/* =========================
   APP
========================= */

export default function App() {
  const [view, setView] = useState("dashboard");

  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(false);

  const [apiError, setApiError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState(
    createDefaultForm()
  );

  /* =========================
     FETCH PATIENTS
  ========================= */

  const fetchPatients = async () => {
    setLoading(true);

    setApiError(null);

    try {
      const url = `${API_URL}?action=getPatients&token=${APP_TOKEN}`;

      const response = await fetch(url);

      const json = await response.json();

      if (json.status === "success") {
        setPatients(json.data || []);
      } else {
        setApiError(json.message || "API ERROR");
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

  /* =========================
     STATS
  ========================= */

  const stats = useMemo(() => {
    const total = patients.length;

    const fastTrackCount = patients.filter(
      (p) => p.thrombolysis === "ให้ rt-PA"
    ).length;

    const typeMap = {};

    patients.forEach((p) => {
      const type = p.strokeType || "Unknown";

      typeMap[type] = (typeMap[type] || 0) + 1;
    });

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

  /* =========================
     FILTER
  ========================= */

  const filteredPatients = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return patients.filter((p) => {
      return (
        (p.fullName || "")
          .toLowerCase()
          .includes(keyword) ||

        (p.hn || "")
          .toLowerCase()
          .includes(keyword) ||

        (p.an || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [patients, searchTerm]);

  /* =========================
     INPUT CHANGE
  ========================= */

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.hn ||
      !formData.an ||
      !formData.fullName
    ) {
      alert("กรุณากรอกข้อมูลให้ครบ");

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

      const json = await response.json();

      if (json.status === "success") {
        alert("บันทึกสำเร็จ");

        setFormData(createDefaultForm());

        await fetchPatients();

        setView("registry");
      } else {
        alert(json.message || "Save failed");
      }
    } catch (error) {
      console.error(error);

      alert("เชื่อม API ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* HEADER */}

      <header className="bg-white p-4 md:p-6 flex justify-between items-center rounded-3xl shadow-sm">
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
          className="bg-blue-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold"
        >
          <Plus size={14} />
          เพิ่มผู้ป่วย
        </button>
      </header>

      {/* API ERROR */}

      {apiError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mt-4">
          <p className="text-red-600 font-bold">
            API ERROR : {apiError}
          </p>
        </div>
      )}

      {/* DASHBOARD */}

      {view === "dashboard" && (
        <>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
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
              value={apiError ? "OFFLINE" : "ONLINE"}
            />
          </div>

          {/* PIE CHART */}

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mt-6">
            <h2 className="font-black text-sm mb-4">
              Stroke Type Summary
            </h2>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    dataKey="value"
                    outerRadius={90}
                    innerRadius={50}
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          [
                            "#1e3a8a",
                            "#2563eb",
                            "#60a5fa",
                            "#93c5fd",
                          ][index % 4]
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
        <div className="mt-6">
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-2 mb-4 text-blue-900 font-bold"
          >
            <ArrowLeft size={16} />
            กลับ
          </button>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-3xl shadow-sm space-y-4"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="HN"
                value={formData.hn}
                required
                onChange={(v) =>
                  handleInputChange("hn", v)
                }
              />

              <Input
                label="AN"
                value={formData.an}
                required
                onChange={(v) =>
                  handleInputChange("an", v)
                }
              />

              <Input
                label="ชื่อผู้ป่วย"
                value={formData.fullName}
                required
                onChange={(v) =>
                  handleInputChange("fullName", v)
                }
              />

              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(v) =>
                  handleInputChange("age", v)
                }
              />

              <Input
                label="NIHSS"
                type="number"
                value={formData.nihss}
                onChange={(v) =>
                  handleInputChange("nihss", v)
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Save size={14} />

              {loading
                ? "กำลังบันทึก..."
                : "บันทึกข้อมูล"}
            </button>
          </form>
        </div>
      )}

      {/* REGISTRY */}

      {view === "registry" && (
        <div className="mt-6">
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-2 mb-4 text-blue-900 font-bold"
          >
            <ArrowLeft size={16} />
            กลับ
          </button>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-black">
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
                  className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left">
                    HN
                  </th>

                  <th className="p-4 text-left">
                    ชื่อผู้ป่วย
                  </th>

                  <th className="p-4 text-left">
                    Stroke Type
                  </th>

                  <th className="p-4 text-left">
                    NIHSS
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((p, index) => (
                  <tr
                    key={index}
                    className="border-t"
                  >
                    <td className="p-4">
                      {p.hn}
                    </td>

                    <td className="p-4">
                      {p.fullName}
                    </td>

                    <td className="p-4">
                      {p.strokeType}
                    </td>

                    <td className="p-4">
                      {p.nihss}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
