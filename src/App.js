import React from "react";

/* =========================
   ICONS
========================= */

const ICONS = {
  activity: "🫀",
  analytics: "📊",
  registry: "📋",
  users: "👥",
  report: "📄",
};

/* =========================
   SIMPLE CARD
========================= */

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-slate-100 ${className}`}
    >
      {children}
    </div>
  );
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

/* =========================
   SIMPLE BUTTON
========================= */

function Button({
  children,
  className = "",
  variant = "default",
}) {
  const base =
    "px-5 py-3 rounded-2xl font-semibold transition-all";

  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-white hover:bg-slate-50"
      : "bg-slate-900 text-white hover:opacity-90";

  return (
    <button className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

/* =========================
   FEATURE ITEM
========================= */

function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">
        {icon}
      </div>

      <p className="font-medium">{text}</p>
    </div>
  );
}

/* =========================
   MAIN APP
========================= */

export default function StrokeRegistryProWebsite() {
  const stats = [
    {
      title: "ผู้ป่วยทั้งหมด",
      value: "1,248",
      icon: ICONS.users,
    },
    {
      title: "ASA Compliance",
      value: "92.4%",
      icon: ICONS.activity,
    },
    {
      title: "ภาวะแทรกซ้อน",
      value: "38",
      icon: ICONS.analytics,
    },
    {
      title: "รายงานวิจัย",
      value: "12",
      icon: ICONS.report,
    },
  ];

  const features = [
    {
      icon: ICONS.registry,
      text: "Stroke Registry ครบวงจร",
    },
    {
      icon: ICONS.analytics,
      text: "KPI Dashboard และ Analytics",
    },
    {
      icon: ICONS.report,
      text: "Annual Report และ Executive Summary",
    },
    {
      icon: ICONS.users,
      text: "Export ข้อมูลสำหรับงานวิจัย",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}

      <header className="bg-slate-900 text-white px-8 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-2xl">
              {ICONS.activity}
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Stroke Registry Pro
              </h1>

              <p className="text-sm text-slate-300">
                ระบบดูแลผู้ป่วยโรคหลอดเลือดสมองระดับโรงพยาบาล
              </p>
            </div>
          </div>

          <Button>เข้าสู่ระบบ</Button>
        </div>
      </header>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        {/* HERO */}

        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-indigo-600 font-semibold mb-2">
              Professional Research Dashboard
            </p>

            <h2 className="text-4xl font-bold leading-tight mb-4">
              ระบบ Stroke Registry พร้อม Analytics
              และ Executive Summary
            </h2>

            <p className="text-slate-600 mb-6 leading-relaxed">
              ใช้สำหรับติดตามผู้ป่วย วิเคราะห์ KPI
              สรุปรายงานประจำปี
              สนับสนุนงานวิจัยทางคลินิก
              และการนำเสนอข้อมูลระดับผู้บริหาร
            </p>

            <div className="flex gap-4 flex-wrap">
              <Button>เริ่มใช้งาน</Button>

              <Button variant="outline">
                ดูรายงาน
              </Button>
            </div>
          </div>

          {/* FEATURES */}

          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-6">
                ฟีเจอร์หลัก
              </h3>

              <div className="space-y-4">
                {features.map((feature) => (
                  <FeatureItem
                    key={feature.text}
                    icon={feature.icon}
                    text={feature.text}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* STATS */}

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => (
            <Card
              key={item.title}
              className="hover:shadow-md transition-all"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500">
                      {item.title}
                    </p>

                    <h3 className="text-3xl font-bold mt-2">
                      {item.value}
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
