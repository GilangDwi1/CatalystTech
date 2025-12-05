export default function DashboardCard({ icon, title, value }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 flex flex-col justify-center items-center">
      <div className="mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}
