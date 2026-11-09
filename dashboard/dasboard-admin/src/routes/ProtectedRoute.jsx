import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;

  try {
    const decoded = jwtDecode(token);
    const role = decoded.role || decoded.roles || decoded?.data?.role;
    // jika allowedRoles kosong -> hanya cek autentikasi
    if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
      return children;
    }
    return <Navigate to="/not-authorized" replace />;
  } catch (err) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
}
