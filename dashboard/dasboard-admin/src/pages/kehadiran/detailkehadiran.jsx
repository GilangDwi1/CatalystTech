import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import api from "@/api/axiosInstance";
import { format } from "date-fns";

export default function DetailKehadiran() {
  const { id } = useParams(); // id_config
  const [data, setData] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get(`/absen/by-config/${id}`);
      setData(res.data);
      if (res.data.length > 0) {
        setConfig(res.data[0].config);
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-3">Detail Kehadiran</h1>

        {config && (
          <div className="mb-4 border p-4 rounded shadow">
            <p>
              <strong>Tanggal:</strong>{" "}
              {format(new Date(config.tanggal), "dd-MM-yyyy")}
            </p>
            <p>
              <strong>Jenis:</strong> {config.jenis}
            </p>
            <p>
              <strong>Jam Mulai:</strong>{" "}
              {format(new Date(config.jam_mulai), "HH:mm")}
            </p>
            <p>
              <strong>Jam Selesai:</strong>{" "}
              {format(new Date(config.jam_selesai), "HH:mm")}
            </p>
          </div>
        )}

        <table className="w-full border border-[#2B484F] shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-[#2B484F] text-white">
            <tr>
              <th className="p-2">Nama</th>
              <th className="p-2">Divisi</th>
              <th className="p-2">Grade</th>
              <th className="p-2">Jenis</th>
              <th className="p-2">Status</th>
              <th className="p-2">Waktu</th>
              <th className="p-2">Lokasi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  Tidak ada data absen
                </td>
              </tr>
            ) : (
              data.map((a) => (
                <tr key={a.id} className="border">
                  <td className="p-2 text-center">{a.karyawan.nama}</td>
                  <td className="p-2 text-center">
                    {a.karyawan.divisi?.nama_divisi}
                  </td>
                  <td className="p-2 text-center">{a.karyawan.grade?.grade}</td>
                  <td className="p-2 text-center">{a.jenis}</td>
                  <td className="p-2 text-center">{a.status}</td>
                  <td className="p-2 text-center">
                    {format(new Date(a.waktu), "dd-MM-yyyy HH:mm")}
                  </td>
                  <td className="p-2 text-center">{a.lokasi || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
