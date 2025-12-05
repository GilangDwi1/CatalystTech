import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  LogOut,
  AlignEndHorizontal,
  Container,
  User,
  ClipboardPen,
} from "lucide-react";
import logo from "../assets/logo-bsk.webp";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path ? "bg-[#2B484F] text-white" : "text-gray-700";

  const handleLogout = () => {
    // Hapus token dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // kalau kamu simpan info user juga

    // Arahkan ke halaman login
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role; // Misalnya role "admin" atau "user"

  return (
    <div className="w-64 h-screen bg-gray-100 flex flex-col justify-between py-6 shadow-md">
      <div className="flex flex-col items-center">
        <img src={logo} alt="BSK" className="w-32 mb-6" />

        <Link
          to="/dashboard"
          className={`flex items-center gap-2 p-3 w-48 rounded-lg ${isActive(
            "/dashboard"
          )}`}
        >
          <Home /> Home
        </Link>

        <Link
          to="/kehadiran"
          className={`flex items-center gap-2 p-3 w-48 rounded-lg ${isActive(
            "/kehadiran"
          )}`}
        >
          <Calendar /> Kehadiran
        </Link>

        {role === "HRD" && (
          <Link
            to="/perizinan"
            className={`flex items-center gap-2 p-3 w-48 rounded-lg ${isActive(
              "/perizinan"
            )}`}
          >
            <ClipboardPen /> Perizinan
          </Link>
        )}

        <Link
          to="/karyawan"
          className={`flex items-center gap-2 p-3 w-48 rounded-lg ${isActive(
            "/karyawan"
          )}`}
        >
          <Users /> Data Karyawan
        </Link>

        <Link
          to="/grade"
          className={`flex items-center gap-2 p-3 w-48 rounded-lg ${isActive(
            "/grade"
          )}`}
        >
          <AlignEndHorizontal /> Grade
        </Link>

        <Link
          to="/divisi"
          className={`flex items-center gap-2 p-3 w-48 rounded-lg ${isActive(
            "/divisi"
          )}`}
        >
          <Container /> Divisi
        </Link>

        {role === "admin" && (
          <Link
            to="/users"
            className={`flex items-center gap-2 p-3 w-48 rounded-lg ${isActive(
              "/users"
            )}`}
          >
            <User /> User
          </Link>
        )}
      </div>

      {/* Tombol Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 p-3 w-48 mx-auto rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
      >
        <LogOut /> Logout
      </button>
    </div>
  );
}
