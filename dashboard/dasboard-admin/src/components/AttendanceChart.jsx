import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const COLORS = {
  Hadir: "#16a34a", // hijau
  Terlambat: "#facc15", // kuning
  Alpha: "#dc2626", // merah
  Izin: "#2563eb", // biru
};

export default function AttendanceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />

        <Bar dataKey="value">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name] || "#8884d8"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
