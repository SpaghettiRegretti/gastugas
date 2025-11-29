import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  ShoppingBag,
  ArrowLeft,
  LogOut,
  Globe,
  Package,
  Edit2,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTemplate } from "../contexts/TemplateContext";
import { getTemplateColors } from "./TemplateSettings";
import { supabase } from "../config/supabase";
import Toast from "./Toast";

export function UserProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, lang, toggleLang } = useLanguage();
  const { template } = useTemplate();
  const colors = getTemplateColors(template);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const [orders] = useState([
    {
      id: 1,
      date: "2024-11-20",
      total: 85000,
      items: 4,
      status: "completed",
    },
    {
      id: 2,
      date: "2024-11-18",
      total: 45000,
      items: 2,
      status: "completed",
    },
    {
      id: 3,
      date: "2024-11-15",
      total: 120000,
      items: 6,
      status: "completed",
    },
  ]);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || user.email?.split("@")[0] || "");
    }
  }, [user]);

  const formatPrice = (p) => new Intl.NumberFormat("id-ID").format(p);
  const formatDate = (d) =>
    new Date(d).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const showMessage = (type, text) => {
    setToast({ message: text, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleUpdateName = async () => {
    if (!name.trim()) {
      showMessage(
        "error",
        lang === "id" ? "Nama tidak boleh kosong" : "Name cannot be empty"
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: name.trim() },
      });

      if (error) throw error;

      await supabase
        .from("user_profiles")
        .update({ name: name.trim() })
        .eq("id", user.id);

      showMessage(
        "success",
        lang === "id"
          ? "Nama berhasil diperbarui!"
          : "Name updated successfully!"
      );
      setIsEditingName(false);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      showMessage(
        "error",
        lang === "id"
          ? "Password minimal 6 karakter"
          : "Password must be at least 6 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        "error",
        lang === "id" ? "Password tidak cocok" : "Passwords do not match"
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      showMessage(
        "success",
        lang === "id"
          ? "Password berhasil diperbarui!"
          : "Password updated successfully!"
      );
      setIsEditingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />

      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4`}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">
            {lang === "id" ? "Profil Saya" : "My Profile"}
          </h1>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={32} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">{name || "User"}</p>
            <p className="text-white/80 text-sm flex items-center gap-1">
              <Mail size={14} />
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 -mt-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <ShoppingBag size={20} style={{ color: colors.primary }} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              <p className="text-xs text-gray-500">
                {lang === "id" ? "Total Pesanan" : "Total Orders"}
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: "#e9d5ff" }}
              >
                <Package size={20} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                Rp {formatPrice(totalSpent)}
              </p>
              <p className="text-xs text-gray-500">
                {lang === "id" ? "Total Belanja" : "Total Spent"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Section */}
      <div className="p-4">
        <h2 className="font-semibold mb-3">
          {lang === "id" ? "Informasi Akun" : "Account Information"}
        </h2>

        {/* Edit Name */}
        <div className="bg-white rounded-xl border p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              {lang === "id" ? "Nama Lengkap" : "Full Name"}
            </label>
            {!isEditingName && (
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <Edit2 size={16} style={{ color: colors.primary }} />
              </button>
            )}
          </div>

          {isEditingName ? (
            <div className="space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 transition-all"
                style={{ focusRingColor: colors.primary }}
                placeholder={lang === "id" ? "Masukkan nama" : "Enter name"}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setName(user?.user_metadata?.name || "");
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                  disabled={loading}
                >
                  <X size={16} className="inline mr-1" />
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  onClick={handleUpdateName}
                  className="flex-1 px-3 py-2 text-white rounded-lg text-sm disabled:opacity-50 transition-all"
                  style={{ backgroundColor: colors.primary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primaryDark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  }}
                  disabled={loading}
                >
                  <Save size={16} className="inline mr-1" />
                  {loading
                    ? lang === "id"
                      ? "Menyimpan..."
                      : "Saving..."
                    : lang === "id"
                    ? "Simpan"
                    : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-900 font-medium">{name || "-"}</p>
          )}
        </div>

        {/* Edit Password */}
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              {lang === "id" ? "Password" : "Password"}
            </label>
            {!isEditingPassword && (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <Edit2 size={16} style={{ color: colors.primary }} />
              </button>
            )}
          </div>

          {isEditingPassword ? (
            <div className="space-y-3">
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ focusRingColor: colors.primary }}
                  placeholder={lang === "id" ? "Password baru" : "New password"}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ focusRingColor: colors.primary }}
                  placeholder={
                    lang === "id" ? "Konfirmasi password" : "Confirm password"
                  }
                  minLength={6}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditingPassword(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                  disabled={loading}
                >
                  <X size={16} className="inline mr-1" />
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  onClick={handleUpdatePassword}
                  className="flex-1 px-3 py-2 text-white rounded-lg text-sm disabled:opacity-50 transition-all"
                  style={{ backgroundColor: colors.primary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primaryDark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  }}
                  disabled={loading}
                >
                  <Save size={16} className="inline mr-1" />
                  {loading
                    ? lang === "id"
                      ? "Menyimpan..."
                      : "Saving..."
                    : lang === "id"
                    ? "Simpan"
                    : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-900 font-medium">••••••••</p>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="p-4">
        <h2 className="font-semibold mb-3">
          {lang === "id" ? "Riwayat Pesanan" : "Order History"}
        </h2>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Order #{order.id}</p>
                <span
                  className="px-2 py-0.5 text-xs rounded-full text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  {order.status === "completed"
                    ? lang === "id"
                      ? "Selesai"
                      : "Completed"
                    : order.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatDate(order.date)}</span>
                <span>{order.items} item</span>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="font-bold" style={{ color: colors.primary }}>
                  Rp {formatPrice(order.total)}
                </p>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-8 bg-white rounded-xl border">
              <ShoppingBag size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">
                {lang === "id" ? "Belum ada pesanan" : "No orders yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4">
        <h2 className="font-semibold mb-3">
          {lang === "id" ? "Pengaturan" : "Settings"}
        </h2>
        <div className="bg-white rounded-xl border overflow-hidden">
          <button
            onClick={toggleLang}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Globe size={20} style={{ color: colors.primary }} />
              <span>{lang === "id" ? "Bahasa" : "Language"}</span>
            </div>
            <span className="text-gray-500">
              {lang === "id" ? "Indonesia" : "English"}
            </span>
          </button>
          <hr />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>{lang === "id" ? "Keluar" : "Logout"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
