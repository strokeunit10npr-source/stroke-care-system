import React, { useState, useEffect } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbw3YTAI5oFaNpPOZfBnSxeSOX5QmwcaLL-6sT3J5QyVqunpTVZ9GUqyWJgdZHPQg3j0aQ/exec";

const APP_TOKEN = "stroke2026secure";

export default function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    hn: "",
    an: "",
    fullName: "",
    age: "",
    gender: "ชาย",
    strokeType: "Ischemic",
    nihss: "",
    thrombolysis: "ไม่ได้ให้",
    admitDate: new Date().toISOString().split("T")[0],
    remark: "",
  });

  /* =========================
     FETCH PATIENTS
  ========================= */

  const fetchPatients = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}?action=getPatients&token=${APP_TOKEN}`
      );

      const json = await response.json();

      if (json.status === "success") {
        setPatients(json.data || []);
      } else {
        alert(json.message || "API Error");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  /* =========================
     INPUT CHANGE
  ========================= */

  const handleChange = (key, value) => {
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
      alert("กรุณากรอก HN / AN / Full Name");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        action: "addPatient",
        token: APP_TOKEN,
        ...formData,
      });

      const response = await fetch(API_URL, {
        method: "POST",
        body: params,
      });

      const json = await response.json();

      if (json.status === "success") {
        alert("บันทึกสำเร็จ");

        setFormData({
          hn: "",
          an: "",
          fullName: "",
          age: "",
          gender: "ชาย",
          strokeType: "Ischemic",
          nihss: "",
          thrombolysis: "ไม่ได้ให้",
          admitDate: new Date().toISOString().split("T")[0],
          remark: "",
        });

        fetchPatients();
      } else {
        alert(json.message || "Save failed");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Stroke Registry System
        </h1>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-sm mb-8 space-y-4"
        >
          <h2 className="text-xl font-bold">
            เพิ่มผู้ป่วย
          </h2>

          <input
            placeholder="HN"
            value={formData.hn}
            onChange={(e) =>
              handleChange("hn", e.target.value)
            }
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="AN"
            value={formData.an}
            onChange={(e) =>
              handleChange("an", e.target.value)
            }
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) =>
              handleChange("fullName", e.target.value)
            }
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Age"
            value={formData.age}
            onChange={(e) =>
              handleChange("age", e.target.value)
            }
            className="w-full border p-3 rounded-xl"
          />

          <button
            type="submit"
            className="bg-slate-900 text-white px-6 py-3 rounded-xl"
          >
            {loading ? "Saving..." : "บันทึกข้อมูล"}
          </button>
        </form>

        {/* TABLE */}

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">
            รายชื่อผู้ป่วย
          </h2>

          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">HN</th>
                <th>AN</th>
                <th>ชื่อ</th>
                <th>อายุ</th>
                <th>Stroke Type</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((p, index) => (
                <tr
                  key={index}
                  className="border-b"
                >
                  <td className="py-2">{p.hn}</td>
                  <td>{p.an}</td>
                  <td>{p.fullName}</td>
                  <td>{p.age}</td>
                  <td>{p.strokeType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
