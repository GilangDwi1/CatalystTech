import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import api from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";


export default function ListIzin() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [divisi, setDivisi] = useState("");
  const [grade, setGrade] = useState("");
  const [jenis, setJenis] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // DATA UNTUK DROPDOWN
  const [divisiList, setDivisiList] = useState([]);
  const [gradeList, setGradeList] = useState([]);

  const jenisOptions = ["SAKIT", "CUTI", "IZIN", "WFH"];

  // Ambil data izin
  const fetchIzin = async () => {
    try {
      const res = await api.get("/izin");
      setData(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Gagal mengambil data izin:", err);
    } finally {
      setLoading(false);
    }
  };

  // Ambil data divisi & grade
  const fetchMeta = async () => {
    try {
      const resDivisi = await api.get("/divisi");
      const resGrade = await api.get("/grade");

      setDivisiList(resDivisi.data);
      setGradeList(resGrade.data);
    } catch (err) {
      console.error("Gagal load divisi/grade:", err);
    }
  };

  useEffect(() => {
    fetchIzin();
    fetchMeta();
  }, []);

  // 🔍 FILTER LOGIC
  useEffect(() => {
    let result = [...data];

    if (search.trim() !== "") {
      result = result.filter((i) =>
        `${i.karyawan?.nama} ${i.karyawan?.nip}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (divisi !== "") {
      result = result.filter((i) => i.karyawan?.divisi?.id == divisi);
    }

    if (grade !== "") {
      result = result.filter((i) => i.karyawan?.grade?.id == grade);
    }

    if (jenis !== "") {
      result = result.filter((i) => i.jenis === jenis);
    }

    if (startDate !== "") {
      result = result.filter(
        (i) => new Date(i.tanggal_mulai) >= new Date(startDate)
      );
    }

    if (endDate !== "") {
      result = result.filter(
        (i) => new Date(i.tanggal_selesai) <= new Date(endDate)
      );
    }

    setFiltered(result);
  }, [search, divisi, grade, jenis, startDate, endDate, data]);

  // 🧹 RESET FILTER
  const resetFilter = () => {
    setSearch("");
    setDivisi("");
    setGrade("");
    setJenis("");
    setStartDate("");
    setEndDate("");
    setFiltered(data);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Daftar Izin Karyawan</h1>
        <Button
          className="bg-teal-800 hover:bg-teal-900"
          onClick={() => navigate("/Perizinan/create")}
        >
          + Tambah Karyawan
        </Button>

        {/* ================== FILTER AREA ================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            className="border p-2 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Divisi */}
          <select
            className="border p-2 rounded"
            value={divisi}
            onChange={(e) => setDivisi(e.target.value)}
          >
            <option value="">Divisi</option>
            {divisiList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama_divisi}
              </option>
            ))}
          </select>

          {/* Grade */}
          <select
            className="border p-2 rounded"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <option value="">Grade</option>
            {gradeList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.grade}
              </option>
            ))}
          </select>

          {/* Jenis */}
          <select
            className="border p-2 rounded"
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
          >
            <option value="">Jenis Izin</option>
            {jenisOptions.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          {/* Date From */}
          <input
            type="date"
            className="border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          {/* Date To */}
          <input
            type="date"
            className="border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {/* Reset Button */}
          <button
            onClick={resetFilter}
            className="bg-red-600 text-white rounded px-3 py-2 hover:bg-red-700"
          >
            Reset
          </button>
        </div>

        {/* ================== TABLE ================== */}
        <table className="w-full border border-[#2B484F] shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-[#2B484F] text-white">
            <tr>
              <th className="p-2">Nama</th>
              <th className="p-2">NIP</th>
              <th className="p-2">Divisi</th>
              <th className="p-2">Grade</th>
              <th className="p-2">Jenis</th>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Alasan</th>
              <th className="p-2">Lampiran</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  Tidak ada data izin
                </td>
              </tr>
            ) : (
              filtered.map((i) => (
                <tr key={i.id} className="border">
                  <td className="p-2 text-center">{i.karyawan?.nama}</td>
                  <td className="p-2 text-center">{i.karyawan?.NIP}</td>
                  <td className="p-2 text-center">
                    {i.karyawan?.divisi?.nama_divisi}
                  </td>
                  <td className="p-2 text-center">
                    {i.karyawan?.grade?.grade}
                  </td>
                  <td className="p-2 text-center">{i.jenis}</td>
                  <td className="p-2 text-center">
                    {format(new Date(i.tanggal_mulai), "dd-MM-yyyy")} Sampai {" "}
                    {format(new Date(i.tanggal_selesai), "dd-MM-yyyy")}
                  </td>
                  <td className="p-2 text-center">{i.alasan || "-"}</td>
                  <td className="p-2 text-center">
                    {i.lampiran ? (
                      <a
                        href={i.lampiran}
                        className="text-blue-600 underline"
                        target="_blank"
                      >
                        Lihat
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
