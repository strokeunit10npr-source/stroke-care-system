import React, { useState, useEffect } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbwlDLKbLNRZ0dLKp5Qh9ira4yfhrVQ9DGAQGP2zMdEo18AkEvYJu9Ahc5gTcvPNgYU8EQ/exec";

export default function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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
    complication: "",
    riskFactors: "",
    followUp: "",
    doctor: "",
    nurse: "",
    remark: "",
  });

  /* =========================
     FETCH PATIENTS
  ========================= */

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}?action=getPatients`
      );

      const json = await response.json();

      if (json.status === "success") {
        setPatients(json.data || []);
      } else {
        setError(json.message || "API Error");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  /* =========================
     SAVE PATIENT
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hn || !formData.an || !formData.fullName) {
      alert("กรุณากรอก HN / AN / Full Name");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        action: "addPatient",
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
          ...formData,
          hn: "",
          an: "",
          fullName: "",
        });

        fetchPatients();
      } else {
        alert(json.message || "Save failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Stroke Registry System</h1>

      {error && (
        <div style={{ color: "red", marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="HN"
          value={formData.hn}
          onChange={(e) =>
            setFormData({
              ...formData,
              hn: e.target.value,
            })
          }
        />

        <input
          placeholder="AN"
          value={formData.an}
          onChange={(e) =>
            setFormData({
              ...formData,
              an: e.target.value,
            })
          }
        />

        <input
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({
              ...formData,
              fullName: e.target.value,
            })
          }
        />

        <button type="submit">
          {loading ? "Saving..." : "Save"}
        </button>
      </form>

      <hr />

      <h2>Patient List ({patients.length})</h2>

      {patients.map((p, i) => (
        <div key={i}>
          {p["Full Name"] || p.fullName} — HN:
          {p["HN"] || p.hn}
        </div>
      ))}
    </div>
  );
}
