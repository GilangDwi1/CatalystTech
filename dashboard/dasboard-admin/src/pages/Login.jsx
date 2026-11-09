import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import bglogin from "../assets/bg-login.webp";
import "./index.css";

export default function Login() {
  const [formData, setFormData] = useState({ nip: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        nip: formData.nip,
        password: formData.password,
      });

      // ambil token dan user dari backend
      const token = response.data.access_token || response.data.token;
      const user = response.data.user;

      if (token) {
        localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        navigate("/dashboard");
      } else {
        setError("Token tidak ditemukan di response!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Login gagal. Periksa NIP dan Password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2B484F] p-4">
      <div className="login-bg fixed inset-0 z-0"></div>

      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-6xl h-auto md:h-[700px] bg-white/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
        {/* Bagian Form (Kiri) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white/30">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-[#333333] mb-2">Login</h2>
            <p className="text-gray-700 mb-8">
              Selamat datang kembali! Silakan login.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-1">
                  NIP
                </label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  onChange={handleChange}
                  placeholder="Masukkan NIP"
                  className="w-full h-[50px] px-4 rounded-lg bg-white border border-transparent focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full h-[50px] px-4 rounded-lg bg-white border border-transparent focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all"
                />
                <div className="flex justify-end mt-2">
                  <a
                    href="#"
                    className="text-sm text-yellow-600 hover:text-yellow-700 font-semibold hover:underline"
                  >
                    Lupa Password?
                  </a>
                </div>
              </div>

              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <span className="block sm:inline text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] bg-yellow-400 text-[#333333] font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Sedang Masuk..." : "Masuk"}
              </button>
            </form>
          </div>
        </div>

        {/* Bagian Gambar (Kanan) */}
        <div
          className="hidden md:block w-1/2 bg-cover bg-center"
          style={{ backgroundImage: `url(${bglogin})` }}
        >
          <div className="h-full w-full bg-black/10"></div>
        </div>
      </div>
    </div>
  );
}
