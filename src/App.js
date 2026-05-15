import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Save,
  Home,
  ChevronRight,
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <p className="text-xs text-slate-500 font-bold uppercase">{title}</p>
      <h2 className="text-2xl font-black mt-2">{value}</h2>
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
        className="w-full mt-2 p-3 rounded-xl border bg-slate-50"
      />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(createDefaultForm());
  const [apiError, setApiError] = useState("");

  const fetchPatients = async () => {
    setLoading(true);
    setApiError("");

    try {
      const url = `${API_URL}?action=getPatients&token=${APP_TOKEN}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.status === "success") {
        setPatients(result.data || []);
      } else {
        setApiError(result.message || "Fetch failed");
      }
    } catch (error) {
      console.error(error);
      setApiError("Cannot connect to API");
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
    const keyword = searchTerm.toLowerCase();

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
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="bg-white rounded-2xl p-6 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity />
          <div>
            <h1 className="font-black">Stroke Registry System</h1>
            <p className="text-sm text-slate-500">
              Nopparat Rajathanee Hospital
            </p>
          </div>
        </div>

        <button
          onClick={() => setView("add")}
          className="bg-blue-900 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={16} />
          เพิ่มผู้ป่วย
        </button>
      </header>

      {apiError && (
        <div className="mt-4 bg-red-100 text-red-700 p-4 rounded-xl">
          {apiError}
        </div>
      )}

      <div className="mt-6">
        {view === "dashboard" && (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <Card title="ผู้ป่วยทั้งหมด" value={`${stats.total} ราย`} />
              <Card title="ได้รับ rt-PA" value={`${stats.fastTrackCount} ราย`} />
              <Card title="สถานะระบบ" value="ออนไลน์" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
              <h2 className="font-bold mb-4">Stroke Type Summary</h2>

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
          </>
        )}

        {view === "add" && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
          >
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

            <button
              type="submit"
              className="bg-blue-900 text-white px-6 py-3 rounded-xl flex items-center gap-2"
            >
              <Save size={16} />
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
