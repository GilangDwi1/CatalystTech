import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
      const response = await axios.post("http://localhost:3000/auth/login", {
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
    <div className="min-h-screen flex items-center justify-center bg-[#2B484F]">
      <div className="login-bg"></div>
      <div className="flex flex-row w-[1355px] h-[780px] bg-white/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl p-10">
        <div className="bg-white/10 w-[563px] h-[600px] p-10 flex flex-col justify-center rounded-3xl m-15">
          <h2 className="text-3xl font-bold text-[#333333] mb-6">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-[#333333] mb-1">NIP</label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                placeholder="Masukkan NIP"
                className="w-[400px] h-[55px] p-6 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm text-[#333333] mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-[400px] h-[55px] p-6 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <a
                href="#"
                className="text-sm text-yellow-400 hover:underline font-bold"
              >
                Forgot Password?
              </a>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-[400px] h-[55px] bg-yellow-400 text-white font-semibold rounded-md hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <div
          className="flex-1 bg-cover bg-center rounded-3xl"
          style={{ backgroundImage: `url(${bglogin})` }}
        ></div>
      </div>
    </div>
  );
}
