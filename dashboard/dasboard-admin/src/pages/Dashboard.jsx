import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AttendanceChart from "../components/AttendanceChart";
import api from "@/api/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Clock,
  BarChart3,
  AlertCircle,
  PieChart as PieIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ambil data dari backend
async function fetchDashboard(date) {
  const params = {};
  if (date) {
    params.tanggal = format(date, "yyyy-MM-dd");
  }
  const res = await api.get("/dashboard", { params });
  return res.data;
}

/* --------------- Summary Card (New Style) ---------------- */
const SummaryCard = ({ label, value, color, icon: Icon, subtext }) => (
  <div
    className={`p-5 rounded-xl text-white flex items-center justify-between shadow-lg ${color}`}
  >
    <div className="flex flex-col">
      <p className="text-sm font-medium opacity-90">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtext && <p className="text-xs mt-1 opacity-80">{subtext}</p>}
    </div>
    {Icon && (
      <div className="p-3 bg-white/20 rounded-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
    )}
  </div>
);

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", selectedDate],
    queryFn: () => fetchDashboard(selectedDate),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 ml-64 p-8 flex justify-center items-center">
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 ml-64 p-8 flex justify-center items-center">
          <p className="text-red-500 font-medium">
            Gagal memuat dashboard:{" "}
            {error?.response?.data?.message || error.message}
          </p>
        </div>
      </div>
    );
  }

  // data dari backend
  const { Jumlah_Karyawan, Terlambat, Hadir, Alpha, Izin } = data || {};

  // data untuk bar chart
  const chartData = [
    { name: "Hadir", value: Hadir || 0 },
    { name: "Terlambat", value: Terlambat || 0 },
    { name: "Alpha", value: Alpha || 0 },
    { name: "Izin", value: Izin || 0 },
  ];

  // data untuk pie chart
  const pieData = [
    { name: "Hadir", value: Hadir || 0 },
    { name: "Terlambat", value: Terlambat || 0 },
    { name: "Alpha", value: Alpha || 0 },
    { name: "Izin", value: Izin || 0 },
  ];

  const COLORS = ["#16a34a", "#facc15", "#dc2626", "#2563eb"];

  const handleCardClick = (type) => {
    const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
    switch (type) {
      case "karyawan":
        navigate("/karyawan");
        break;
      case "hadir":
      case "terlambat":
      case "alpha":
        navigate(`/detail/kehadiran/${dateStr}`);
        break;
      case "izin":
        navigate("/perizinan");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          {/* Kiri: Judul */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Ringkasan data kehadiran karyawan
            </p>
          </div>

          {/* Kanan: Filter Tanggal */}
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter Tanggal"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{
                  textField: { size: "small" },
                }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* SUMMARY CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <div
            onClick={() => handleCardClick("karyawan")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <SummaryCard
              label="Total Karyawan"
              value={Jumlah_Karyawan}
              color="bg-gradient-to-br from-teal-600 to-teal-700"
              icon={Users}
            />
          </div>

          <div
            onClick={() => handleCardClick("hadir")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <SummaryCard
              label="Hadir"
              value={Hadir}
              color="bg-gradient-to-br from-green-600 to-green-700"
              icon={CheckCircle}
            />
          </div>

          <div
            onClick={() => handleCardClick("terlambat")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <SummaryCard
              label="Terlambat"
              value={Terlambat}
              color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              icon={AlertCircle}
            />
          </div>

          <div
            onClick={() => handleCardClick("alpha")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <SummaryCard
              label="Alpha"
              value={Alpha}
              color="bg-gradient-to-br from-red-600 to-red-700"
              icon={XCircle}
            />
          </div>

          <div
            onClick={() => handleCardClick("izin")}
            className="cursor-pointer transform transition hover:scale-105"
          >
            <SummaryCard
              label="Izin / Sakit"
              value={Izin}
              color="bg-gradient-to-br from-blue-600 to-blue-700"
              icon={Clock}
            />
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* BAR CHART */}
          <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-800 text-lg">
                Statistik Kehadiran
              </h2>
              <BarChart3 className="text-gray-400 w-5 h-5" />
            </div>
            <AttendanceChart data={chartData} />
          </div>

          {/* PIE CHART */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-800 text-lg">Persentase</h2>
              <PieIcon className="text-gray-400 w-5 h-5" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
