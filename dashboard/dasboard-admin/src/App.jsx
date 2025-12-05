import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import KaryawanPage from "./pages/karyawan/KaryawanPage";
import PrivateRoute from "./components/PrivateRoute";
import NotAuthorized from "./pages/NotAuthorized";
import GradePage from "./pages/grade/GradePage";
import GradeDetailPage from "./pages/grade/GradeDetailPage";
import DivisiPage from "./pages/divisi/DivisiPage";
import DivisiDetailPage from "./pages/divisi/DivisDetailPage";
import UserPage from "./pages/user/UserPage";
import FaceRegister from "./pages/FaceRegister";
import TambahKaryawanPage from "./pages/karyawan/TambahKaryawanPages";
import KehadiranPage from "./pages/kehadiran/kehadiran";
import DetailKehadiranPage from "./pages/kehadiran/detailkehadiran";
import PerizinanPage from "./pages/perizinan/perizinanPage";
import CreatePerizinanPage from "./pages/perizinan/createizin";
import KaryawanDetailPage from "./pages/karyawan/KaryawanDetailPage";

export default function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/" element={<Login />} />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD", "kadiv"]}>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* KARYAWAN */}
      <Route
        path="/karyawan"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD"]}>
            <KaryawanPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/karyawan/:id"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD", "kadiv"]}>
            <KaryawanDetailPage />
          </PrivateRoute>
        }
      />

      {/* GRADE */}
      <Route
        path="/grade"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD", "kadiv"]}>
            <GradePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/grade/:id"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD", "kadiv"]}>
            <GradeDetailPage />
          </PrivateRoute>
        }
      />

      {/* DIVISI */}
      <Route
        path="/divisi"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD"]}>
            <DivisiPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/divisi/:id"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD"]}>
            <DivisiDetailPage />
          </PrivateRoute>
        }
      />

      {/* USERS */}
      <Route
        path="/users"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <UserPage />
          </PrivateRoute>
        }
      />

      {/* NOT AUTH */}
      <Route path="/not-authorized" element={<NotAuthorized />} />

      {/* FACE REGISTER */}
      <Route
        path="/karyawan/:id/face-register"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD"]}>
            <FaceRegister />
          </PrivateRoute>
        }
      />

      <Route
        path="/karyawan/tambah"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD"]}>
            <TambahKaryawanPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/kehadiran"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD", "kadiv"]}>
            <KehadiranPage />
          </PrivateRoute>
        }
      />

      <Route
        path="detail/kehadiran/:id"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD", "kadiv"]}>
            <DetailKehadiranPage />
          </PrivateRoute>
        }
      />

      <Route
        path="perizinan/"
        element={
          <PrivateRoute allowedRoles={["admin", "HRD", "kadiv"]}>
            <PerizinanPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/Perizinan/create"
        element={
          <PrivateRoute allowedRoles={["HRD"]}>
            <CreatePerizinanPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
