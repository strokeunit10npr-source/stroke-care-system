import React, { useState, useEffect } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbwlDLKbLNRZ0dLKp5Qh9ira4yfhrVQ9DGAQGP2zMdEo18AkEvYJu9Ahc5gTcvPNgYU8EQ/exec";

function App() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
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
    admitDate: "",
    dischargeDate: "",
    outcome: "กำลังรักษา",
    complication: "",
    riskFactors: "",
    followUp: "",
    doctor: "",
    nurse: "",
    remark: ""
  });

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}?action=getPatients`);
      const json = await res.json();

      if (json.status === "success") {
        setPatients(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const params = new URLSearchParams({
      action: "addPatient",
      ...form
    });

    const res = await fetch(API_URL, {
      method: "POST",
      body: params
    });

    const json = await res.json();

    if (json.status === "success") {
      alert("บันทึกสำเร็จ");
      fetchPatients();
    } else {
      alert(json.message);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Stroke Registry System</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="HN"
          value={form.hn}
          onChange={(e) =>
            handleChange("hn", e.target.value)
          }
        />

        <input
          placeholder="AN"
          value={form.an}
          onChange={(e) =>
            handleChange("an", e.target.value)
          }
        />

        <input
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) =>
            handleChange("fullName", e.target.value)
          }
        />

        <select
          value={form.gender}
          onChange={(e) =>
            handleChange("gender", e.target.value)
          }
        >
          <option>ชาย</option>
          <option>หญิง</option>
        </select>

        <select
          value={form.strokeType}
          onChange={(e) =>
            handleChange("strokeType", e.target.value)
          }
        >
          <option>Ischemic</option>
          <option>Hemorrhagic</option>
          <option>TIA</option>
        </select>

        <select
          value={form.thrombolysis}
          onChange={(e) =>
            handleChange("thrombolysis", e.target.value)
          }
        >
          <option>ไม่ได้ให้</option>
          <option>ให้ rt-PA</option>
        </select>

        <button type="submit">
          Save Patient
        </button>
      </form>

      <hr />

      <h2>Patient List</h2>

      {patients.map((p, i) => (
        <div key={i}>
          {p["Full Name"]} | HN: {p["HN"]} | Stroke: {p["Stroke Type"]}
        </div>
      ))}
    </div>
  );
}

export default App;
