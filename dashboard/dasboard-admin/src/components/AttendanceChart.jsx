import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AttendanceChart({ data }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-5">
      <h3 className="font-semibold text-gray-700 mb-4">
        Statistik Kehadiran Tahunan (2025)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="attendance" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
