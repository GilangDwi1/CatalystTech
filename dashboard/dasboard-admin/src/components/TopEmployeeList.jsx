export default function TopEmployeeList({ employees }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-5">
      <h3 className="font-semibold mb-4">Top 10 Karyawan Ter-Rajin</h3>
      <ol className="list-decimal pl-5 space-y-2">
        {employees.map((e, i) => (
          <li key={e.karyawan_id || i} className="flex justify-between">
            <div>
              <div className="font-medium">{e.nama}</div>
              <div className="text-sm text-gray-500">{e.divisi}</div>
            </div>
            <div className="text-gray-600 self-center">{e.count}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
