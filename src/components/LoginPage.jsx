import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Store,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTemplate } from "../contexts/TemplateContext";
import { getTemplateColors } from "./TemplateSettings";
import { supabase } from "../config/supabase";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, userRole } = useAuth();
  const { t, lang } = useLanguage();
  const { template } = useTemplate();
  const colors = getTemplateColors(template);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { data, error } = await signIn(form.email, form.password);
        if (error) throw error;

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }

        return;
      } else {
        if (!form.name.trim()) {
          throw new Error(
            lang === "id" ? "Nama wajib diisi" : "Name is required"
          );
        }
        const { data, error } = await signUp(
          form.email,
          form.password,
          form.name,
          form.role
        );
        if (error) throw error;
        setIsLogin(true);
        setError(
          lang === "id"
            ? "Registrasi berhasil! Silakan login."
            : "Registration successful! Please login."
        );
      }
    } catch (err) {
      setError(
        err.message ||
          (lang === "id" ? "Terjadi kesalahan" : "An error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${colors.gradient} flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-md">
        {/* Back to menu */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          {lang === "id" ? "Kembali ke Menu" : "Back to Menu"}
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div
            className={`bg-gradient-to-r ${colors.gradient} p-6 text-white text-center`}
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Store size={32} />
            </div>
            <h1 className="text-2xl font-bold">BookletKu</h1>
            <p className="text-white/80 text-sm">{t.tagline}</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                isLogin
                  ? `text-[${colors.primary}] border-b-2 border-[${colors.primary}]`
                  : "text-gray-500"
              }`}
              style={
                isLogin
                  ? {
                      color: colors.primary,
                      borderBottomColor: colors.primary,
                    }
                  : {}
              }
            >
              {lang === "id" ? "Masuk" : "Login"}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                !isLogin
                  ? `text-[${colors.primary}] border-b-2 border-[${colors.primary}]`
                  : "text-gray-500"
              }`}
              style={
                !isLogin
                  ? {
                      color: colors.primary,
                      borderBottomColor: colors.primary,
                    }
                  : {}
              }
            >
              {lang === "id" ? "Daftar" : "Register"}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang === "id" ? "Nama Lengkap" : "Full Name"}
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 transition-all"
                    style={{ focusRingColor: colors.primary }}
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ focusRingColor: colors.primary }}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ focusRingColor: colors.primary }}
                  placeholder="********"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === "id" ? "Daftar sebagai" : "Register as"}
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange("role", "user")}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={
                      form.role === "user"
                        ? {
                            backgroundColor: colors.primary,
                            color: "white",
                          }
                        : {
                            backgroundColor: "#f3f4f6",
                            color: "#374151",
                          }
                    }
                  >
                    {lang === "id" ? "Pelanggan" : "Customer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("role", "admin")}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={
                      form.role === "admin"
                        ? {
                            backgroundColor: colors.primary,
                            color: "white",
                          }
                        : {
                            backgroundColor: "#f3f4f6",
                            color: "#374151",
                          }
                    }
                  >
                    {lang === "id" ? "Pemilik Toko" : "Store Owner"}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={
                  error.includes("berhasil") || error.includes("successful")
                    ? {
                        backgroundColor: `${colors.primary}20`,
                        color: colors.primary,
                      }
                    : {
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                      }
                }
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-white"
              style={
                loading
                  ? {
                      backgroundColor: colors.primary,
                      opacity: 0.5,
                      cursor: "not-allowed",
                    }
                  : {
                      backgroundColor: colors.primary,
                    }
              }
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = colors.primaryDark;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {isLogin
                ? lang === "id"
                  ? "Masuk"
                  : "Login"
                : lang === "id"
                ? "Daftar"
                : "Register"}
            </button>
          </form>

          {/* Demo Account */}
          <div className="px-6 pb-6">
            <div className="text-center text-xs text-gray-500 border-t pt-4">
              <p className="mb-2">
                {lang === "id" ? "Demo Account:" : "Demo Account:"}
              </p>
              <p>Admin: admin@bookletku.com / admin123</p>
              <p>User: user@bookletku.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
