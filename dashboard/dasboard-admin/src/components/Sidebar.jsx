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
  Clock2,
} from "lucide-react";
import logo from "../assets/logo-bsk.webp";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-[#2B484F] text-white"
      : "text-gray-700 hover:bg-gray-200";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-white shadow-md flex flex-col justify-between py-6 z-50">
      {/* ================= TOP ================= */}
      <div className="flex flex-col items-center gap-1 overflow-y-auto">
        <img src={logo} alt="BSK" className="w-32 mb-6" />

        <SidebarLink
          to="/dashboard"
          icon={<Home />}
          label="Dashboard"
          isActive={isActive}
        />
        <SidebarLink
          to="/kehadiran"
          icon={<Calendar />}
          label="Kehadiran"
          isActive={isActive}
        />
        <SidebarLink
          to="/lembur-config-page"
          icon={<Clock2 />}
          label="Lembur"
          isActive={isActive}
        />

        {role === "HRD" && (
          <SidebarLink
            to="/perizinan"
            icon={<ClipboardPen />}
            label="Perizinan"
            isActive={isActive}
          />
        )}

        <SidebarLink
          to="/karyawan"
          icon={<Users />}
          label="Data Karyawan"
          isActive={isActive}
        />
        <SidebarLink
          to="/grade"
          icon={<AlignEndHorizontal />}
          label="Grade"
          isActive={isActive}
        />
        <SidebarLink
          to="/divisi"
          icon={<Container />}
          label="Divisi"
          isActive={isActive}
        />

        {role === "admin" && (
          <SidebarLink
            to="/users"
            icon={<User />}
            label="User"
            isActive={isActive}
          />
        )}
      </div>

      {/* ================= LOGOUT ================= */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 w-48 mx-auto rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}

/* ================= REUSABLE LINK ================= */
function SidebarLink({ to, icon, label, isActive }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 w-48 rounded-lg transition ${isActive(
        to
      )}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
