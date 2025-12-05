import React, { Suspense } from "react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import TopEmployeeList from "../components/TopEmployeeList";
import AttendanceChart from "../components/AttendanceChart";
import axios from "../api/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { Users, Clock, Calendar, BarChart3 } from "lucide-react";

async function fetchSummary() {
  // Panggil beberapa endpoint sekaligus (backend endpoints seperti di spec)
  const [karyawanRes, absensiRes, perizinanRes] = await Promise.all([
    axios.get("/karyawan"),
    axios.get("/izin"),
  ]);

  // Hitung summary dengan efisien di frontend (atau gunakan endpoint summary di backend idealnya)
  const totalKaryawan = karyawanRes.data.length;
  const hadirBulan = absensiRes.data.filter((a) => {
    // asumsi ada field date, dan status hadir
    const d = new Date(a.tanggal || a.created_at || a.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && a.status === "hadir";
  }).length;

  const terlambatHari = absensiRes.data.filter((a) => {
    const d = new Date(a.tanggal || a.created_at || a.date);
    const now = new Date();
    // contoh: bandingkan jam masuk
    const isSameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    return isSameDay && a.is_late;
  }).length;

  const terlambatBulan = absensiRes.data.filter(
    (a) =>
      a.is_late &&
      new Date(a.tanggal || a.date).getMonth() === new Date().getMonth()
  ).length;

  // Top 10 karyawan berdasar attendance (server-side lebih baik)
  const topMap = {};
  absensiRes.data.forEach((a) => {
    if (!topMap[a.karyawan_id]) topMap[a.karyawan_id] = 0;
    if (a.status === "hadir") topMap[a.karyawan_id]++;
  });

  // Map to array and join with karyawan data
  const topArray = Object.entries(topMap)
    .map(([karyawan_id, count]) => {
      const k = karyawanRes.data.find(
        (x) => String(x.id) === String(karyawan_id)
      );
      return {
        karyawan_id,
        count,
        nama: k?.nama || "Unknown",
        divisi: k?.divisi?.nama || k?.divisi || "—",
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // chart data: group by month for current year
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const monthly = months.map((m, idx) => {
    const attendance = absensiRes.data.filter((a) => {
      const dt = new Date(a.tanggal || a.date || a.created_at);
      return (
        dt.getMonth() === idx &&
        dt.getFullYear() === new Date().getFullYear() &&
        a.status === "hadir"
      );
    }).length;
    return { month: m, attendance };
  });

  return {
    totalKaryawan,
    hadirBulan,
    terlambatHari,
    terlambatBulan,
    topArray,
    monthly,
  };
}

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: fetchSummary,
    staleTime: 1000 * 60 * 1,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (isError) return <div className="p-8">Gagal memuat data dashboard.</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-6">
          <DashboardCard
            icon={<Users />}
            title="Jumlah Karyawan masuk"
            value={data.totalKaryawan}
          />
          <DashboardCard
            icon={<Clock />}
            title="Terlambat Hari ini"
            value={data.terlambatHari}
          />
          <DashboardCard
            icon={<BarChart3 />}
            title="Terlambat Bulan ini"
            value={data.terlambatBulan}
          />
          <DashboardCard
            icon={<Calendar />}
            title="Jumlah Hadir bulan ini"
            value={data.hadirBulan}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <AttendanceChart data={data.monthly} />
          </div>
          <TopEmployeeList employees={data.topArray} />
        </div>
      </main>
    </div>
  );
}
