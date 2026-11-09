import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import api from "@/api/axiosInstance";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Briefcase,
  Search,
  ListFilter,
} from "lucide-react";

/* ---------------- Badge Warna Status Utama ---------------- */
const MainStatusBadge = ({ status }) => {
  let label = status;
  let colorClass = "bg-gray-100 text-gray-700";

  if (["HADIR", "TERLAMBAT", "PULANG_CEPAT"].includes(status)) {
    label = "HADIR";
    colorClass = "bg-green-100 text-green-700 border border-green-200";
  } else if (status === "ALPHA") {
    label = "ALPHA";
    colorClass = "bg-red-100 text-red-700 border border-red-200";
  } else if (["IZIN", "SAKIT", "CUTI"].includes(status)) {
    label = "IZIN";
    colorClass = "bg-blue-100 text-blue-700 border border-blue-200";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${colorClass}`}
    >
      {label}
    </span>
  );
};

/* ---------------- Badge Atribut (Lembur/Terlambat) ---------------- */
const AttributeBadges = ({ status, lembur }) => {
  const attributes = [];

  if (status === "TERLAMBAT") {
    attributes.push(
      <span
        key="late"
        className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1"
      >
        <Clock className="w-3 h-3" /> Terlambat
      </span>
    );
  }

  if (status === "PULANG_CEPAT") {
    attributes.push(
      <span
        key="early"
        className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200"
      >
        Pulang Cepat
      </span>
    );
  }

  if (lembur > 0) {
    attributes.push(
      <span
        key="overtime"
        className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1"
      >
        <Briefcase className="w-3 h-3" /> Lembur {lembur}m
      </span>
    );
  }

  if (attributes.length === 0) return <span className="text-gray-400">-</span>;

  return <div className="flex flex-wrap gap-2">{attributes}</div>;
};

/* --------------- Summary Card ---------------- */
const SummaryCard = ({ label, value, color, icon: Icon, subtext, onClick, isActive }) => (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl text-white flex items-center justify-between shadow-lg cursor-pointer transition-all duration-300 ${color} ${isActive ? 'ring-4 ring-offset-2 ring-white/80 scale-105' : 'hover:scale-105 hover:shadow-2xl'}`}
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

export default function DetailKehadiran() {
  const { tanggal } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and Sort State
  const [nameFilter, setNameFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortField, setSortField] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");

  /* ---------------- Fetch Data ---------------- */
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/absensi-config/detail`, {
          params: { tanggal },
        });

        setSummary(res.data.summary);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [tanggal]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filtering by name
    if (nameFilter) {
      result = result.filter((item) =>
        item.nama.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    
    // Filtering by active card
    if (activeFilter !== "all") {
        switch (activeFilter) {
          case 'hadir':
            result = result.filter(item => ['HADIR', 'TERLAMBAT', 'PULANG_CEPAT'].includes(item.status));
            break;
          case 'izin':
            result = result.filter(item => ['IZIN', 'SAKIT', 'CUTI'].includes(item.status));
            break;
          case 'alpha':
            result = result.filter(item => item.status === 'ALPHA');
            break;
          case 'terlambat':
            result = result.filter(item => item.terlambat === true);
            break;
          case 'lembur':
            result = result.filter(item => item.lembur_menit > 0);
            break;
          default:
            break;
        }
      }

    // Sorting
    result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];

      let comparison = 0;
      if (fieldA === null || fieldA === undefined) comparison = 1;
      else if (fieldB === null || fieldB === undefined) comparison = -1;
      else {
        if (sortField === "datang" || sortField === "pulang") {
          comparison = new Date(fieldA) - new Date(fieldB);
        } else {
          comparison = String(fieldA).localeCompare(String(fieldB));
        }
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [data, nameFilter, activeFilter, sortField, sortOrder]);


  const formatTanggal = (dateStr, options) => {
    const [year, month, day] = dateStr.split("T")[0].split("-");

    return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      ...options,
    });
  };

  const formatJam = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* --------------- Sorting Function ---------------- */
    const handleSort = (field) => {
        if (field === sortField) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
        setSortField(field);
        setSortOrder("asc");
        }
    };


  /* ---------------- Export Excel ---------------- */
  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Kehadiran");

    // Header
    worksheet.columns = [
      { header: "Nama", key: "nama", width: 25 },
      { header: "Status Utama", key: "main_status", width: 15 },
      { header: "Atribut (Terlambat/Lembur)", key: "attributes", width: 30 },
      { header: "Jam Datang", key: "datang", width: 15 },
      { header: "Jam Pulang", key: "pulang", width: 15 },
      { header: "Durasi Lembur (Menit)", key: "lembur", width: 20 },
    ];

    // Isi data
    filteredAndSortedData.forEach((item) => {
      let mainStatus = item.status;
      if (["HADIR", "TERLAMBAT", "PULANG_CEPAT"].includes(item.status))
        mainStatus = "HADIR";
      if (["IZIN", "SAKIT"].includes(item.status)) mainStatus = "IZIN";

      let attributes = [];
      if (item.status === "TERLAMBAT") attributes.push("Terlambat");
      if (item.status === "PULANG_CEPAT") attributes.push("Pulang Cepat");
      if (item.lembur_menit > 0) attributes.push("Lembur");

      worksheet.addRow({
        nama: item.nama,
        main_status: mainStatus,
        attributes: attributes.join(", ") || "-",
        datang: item.datang ? new Date(item.datang).toLocaleTimeString() : "-",
        pulang: item.pulang ? new Date(item.pulang).toLocaleTimeString() : "-",
        lembur: item.lembur_menit || 0,
      });
    });

    // Styling header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B484F" },
      };
    });

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `kehadiran-${tanggal}.xlsx`);
  };

  if (loading)
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 ml-64 flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );

  // Hitung total untuk summary cards
  const totalHadir = (summary?.hadir || 0)
  const totalIzin = (summary?.izin || 0) + (summary?.sakit || 0);
  const totalAlpha = summary?.alpha || 0;
  const totalTerlambat = summary?.terlambat || 0;
  const totalLembur = summary?.lembur || 0;
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Detail Kehadiran
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {formatTanggal(tanggal)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportExcel}
              className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" /> Export Excel
            </button>

            <button
              onClick={() => navigate("/kehadiran")}
              className="bg-gray-500 border border-gray-300 text-white hover:bg-gray-400 px-4 py-2 rounded-lg shadow-sm transition"
            >
              ← Kembali
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <SummaryCard
              label="Total Hadir"
              value={totalHadir}
              color="bg-gradient-to-br from-green-600 to-green-700"
              icon={CheckCircle}
              onClick={() => setActiveFilter("hadir")}
              isActive={activeFilter === "hadir"}
            />
            <SummaryCard
              label="Izin / Sakit"
              value={totalIzin}
              color="bg-gradient-to-br from-blue-600 to-blue-700"
              icon={Clock}
              onClick={() => setActiveFilter("izin")}
              isActive={activeFilter === "izin"}
            />
            <SummaryCard
              label="Alpha"
              value={totalAlpha}
              color="bg-gradient-to-br from-red-600 to-red-700"
              icon={XCircle}
              onClick={() => setActiveFilter("alpha")}
              isActive={activeFilter === "alpha"}
            />
            <SummaryCard
              label="Terlambat"
              value={totalTerlambat}
              color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              icon={AlertCircle}
              subtext="Atribut Kehadiran"
              onClick={() => setActiveFilter("terlambat")}
              isActive={activeFilter === "terlambat"}
            />
            <SummaryCard
              label="Lembur"
              value={totalLembur}
              color="bg-gradient-to-br from-purple-600 to-purple-700"
              icon={Briefcase}
              subtext="Atribut Kehadiran"
              onClick={() => setActiveFilter("lembur")}
              isActive={activeFilter === "lembur"}
            />
          </div>
        )}

        {/* Tabel Absensi */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                Daftar Karyawan
              </h2>
              <span className="text-sm text-gray-500">
                Menampilkan: {filteredAndSortedData.length} Karyawan
              </span>
            </div>
            {/* Filter Inputs */}
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama karyawan..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition shadow"
                >
                  <ListFilter className="w-4 h-4" />
                  Tampilkan Semua
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2B484F] text-white font-semibold border-b">
                <tr>
                  <th
                    className="p-4 cursor-pointer hover:text-teal-700 transition"
                    onClick={() => handleSort("nama")}
                  >
                    Nama Karyawan
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:text-teal-700 transition"
                    onClick={() => handleSort("status")}
                  >
                    Status Utama
                  </th>
                  <th className="p-4">Waktu (Datang - Pulang)</th>
                  <th className="p-4">Durasi Lembur</th>
                  <th className="p-4">Atribut & Keterangan</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      Tidak ada karyawan yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedData.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="p-4 font-medium text-gray-900">
                        {item.nama}
                      </td>

                      <td className="p-4">
                        <MainStatusBadge status={item.status} />
                      </td>

                      <td className="p-4 text-gray-600">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2">
                            <span className="w-16 text-xs uppercase tracking-wider text-gray-400">
                              Datang
                            </span>
                            <span className="font-medium">
                              {formatJam(item.datang)}
                            </span>
                            {item.terlambat === true && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
                                Terlambat
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-2 mt-1">
                            <span className="w-16 text-xs uppercase tracking-wider text-gray-400">
                              Pulang
                            </span>
                            <span className="font-medium">
                              {formatJam(item.pulang)}
                            </span>
                            {item.lembur_menit > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                                Lembur
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-gray-700">
                        {item.lembur_menit ? `${item.lembur_menit} Menit` : "-"}
                      </td>

                      <td className="p-4">
                        <AttributeBadges
                          status={item.status}
                          lembur={item.lembur_menit}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
