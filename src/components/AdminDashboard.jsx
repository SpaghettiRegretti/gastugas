import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Menu,
  Plus,
  Eye,
  QrCode,
  Share2,
  Globe,
  Settings,
  Loader2,
  X,
  LayoutDashboard,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  LogOut,
  ChevronRight,
  Store,
  BarChart3,
} from "lucide-react";

import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useSupabase } from "../hooks/useSupabase";
import Modal from "./Modal";
import ItemForm from "./ItemForm";
import { MenuCard } from "./MenuCard";
import QRCodeDisplay from "./QRCode";

// Stat Card Component
function StatCard({ icon: Icon, label, value, trend, color }) {
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colors[color]} text-white`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className="flex items-center text-xs text-green-600 font-medium">
            <TrendingUp size={12} className="mr-0.5" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold mt-3">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

// Sidebar/Navbar Component
function Sidebar({ isOpen, onClose, currentPage, onNavigate }) {
  const { t, lang } = useLanguage();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: lang === "id" ? "Dashboard" : "Dashboard",
    },
    {
      id: "menu",
      icon: Package,
      label: lang === "id" ? "Kelola Menu" : "Manage Menu",
    },
    {
      id: "settings",
      icon: Settings,
      label: lang === "id" ? "Pengaturan" : "Settings",
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r z-50 transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">BookletKu</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === item.id
                  ? "bg-green-50 text-green-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
              {currentPage === item.id && (
                <ChevronRight size={16} className="ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="absolute left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users size={18} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email || "Admin"}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm">
              {lang === "id" ? "Keluar" : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Dashboard Overview Page
function DashboardOverview({ items }) {
  const { lang } = useLanguage();

  const totalItems = items.length;
  const totalViews = items.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalRevenue = items.reduce(
    (sum, item) => sum + item.price * (item.views || 0) * 0.1,
    0
  ); // Estimate
  const avgPrice =
    items.length > 0
      ? items.reduce((sum, item) => sum + item.price, 0) / items.length
      : 0;

  const formatPrice = (p) =>
    new Intl.NumberFormat("id-ID").format(Math.round(p));

  const topItems = [...items]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label={lang === "id" ? "Total Menu" : "Total Menu"}
          value={totalItems}
          color="blue"
        />
        <StatCard
          icon={Eye}
          label={lang === "id" ? "Total Dilihat" : "Total Views"}
          value={formatPrice(totalViews)}
          trend="+12%"
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label={lang === "id" ? "Est. Pendapatan" : "Est. Revenue"}
          value={`Rp ${formatPrice(totalRevenue)}`}
          trend="+8%"
          color="purple"
        />
        <StatCard
          icon={BarChart3}
          label={lang === "id" ? "Rata-rata Harga" : "Avg. Price"}
          value={`Rp ${formatPrice(avgPrice)}`}
          color="orange"
        />
      </div>

      {/* Top Items */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-green-600" />
          {lang === "id" ? "Menu Terpopuler" : "Popular Menu"}
        </h3>
        <div className="space-y-3">
          {topItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0
                    ? "bg-yellow-400 text-white"
                    : index === 1
                    ? "bg-gray-300 text-gray-700"
                    : index === 2
                    ? "bg-orange-400 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {index + 1}
              </span>
              {item.photo && (
                <img
                  src={item.photo}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Rp {formatPrice(item.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">
                  {item.views || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {lang === "id" ? "views" : "views"}
                </p>
              </div>
            </div>
          ))}
          {topItems.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              {lang === "id" ? "Belum ada data" : "No data yet"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Settings Page
function SettingsPage({ settings, onSave }) {
  const { t, lang, toggleLang } = useLanguage();
  const [form, setForm] = useState({
    storeName: settings.storeName || "",
    whatsappNumber: settings.whatsappNumber || "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold">
          {lang === "id" ? "Pengaturan Toko" : "Store Settings"}
        </h3>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t.storeName}
          </label>
          <input
            type="text"
            value={form.storeName}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                storeName: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t.whatsappNumber}
          </label>
          <input
            type="text"
            value={form.whatsappNumber}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                whatsappNumber: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            placeholder="628123456789"
          />
          <p className="text-xs text-gray-500 mt-1">Format: 628xxx</p>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            saved
              ? "bg-green-100 text-green-600"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {saved ? (lang === "id" ? "Tersimpan!" : "Saved!") : t.save}
        </button>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold mb-4">
          {lang === "id" ? "Bahasa" : "Language"}
        </h3>
        <button
          onClick={toggleLang}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <Globe size={18} />
          {lang === "id" ? "Indonesia" : "English"}
        </button>
      </div>
    </div>
  );
}

// Main Admin Dashboard
export function AdminDashboard() {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const {
    items,
    settings,
    loading,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    uploadPhoto,
    setSettings,
  } = useSupabase();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState("");

  const menuSlug =
    settings.storeName?.toLowerCase().replace(/\s+/g, "-") || "menu";
  const menuLink = window.location.origin + "/menu/" + menuSlug;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  };
  const copyLink = async () => {
    await navigator.clipboard.writeText(menuLink);
    showNotif(t.linkCopied);
  };

  const handleSaveItem = async (formData) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
        showNotif(t.itemUpdated);
        setEditingItem(null);
      } else {
        await addItem(formData);
        showNotif(t.itemAdded);
        setModal(null);
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      await deleteItem(id);
      showNotif(t.itemDeleted);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      reorderItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Burger Menu - Mobile Only */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <Menu size={20} />
              </button>
              <h2 className="font-semibold text-gray-900">
                {currentPage === "dashboard" &&
                  (lang === "id" ? "Dashboard" : "Dashboard")}
                {currentPage === "menu" &&
                  (lang === "id" ? "Kelola Menu" : "Manage Menu")}
                {currentPage === "settings" &&
                  (lang === "id" ? "Pengaturan" : "Settings")}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Globe size={14} />
                {lang.toUpperCase()}
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                <Eye size={14} />
                {lang === "id" ? "Lihat Menu" : "View Menu"}
              </button>
            </div>
          </div>
        </header>

        {/* Notification */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            {notification}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Dashboard Page */}
          {currentPage === "dashboard" && <DashboardOverview items={items} />}

          {/* Menu Management Page */}
          {currentPage === "menu" && (
            <div className="space-y-4">
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setModal("add")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <Plus size={16} />
                  {t.addItem}
                </button>
                <button
                  onClick={() => setModal("qr")}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  <QrCode size={16} />
                  {t.generateQR}
                </button>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Share2 size={16} />
                  {t.copyLink}
                </button>
              </div>

              {/* Menu Grid */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {t.menuItems} ({items.length})
                </h3>
                <p className="text-xs text-gray-500">{t.dragToReorder}</p>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
                  <Package size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-2">{t.noItems}</p>
                  <button
                    onClick={() => setModal("add")}
                    className="text-green-600 font-medium hover:underline"
                  >
                    {t.addFirstItem}
                  </button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedItems.map((i) => i.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {sortedItems.map((item) => (
                        <MenuCard
                          key={item.id}
                          item={item}
                          onEdit={(item) => {
                            setEditingItem(item);
                            setModal("edit");
                          }}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}

          {/* Settings Page */}
          {currentPage === "settings" && (
            <SettingsPage settings={settings} onSave={setSettings} />
          )}
        </main>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modal === "add"}
        onClose={() => setModal(null)}
        title={t.addItem}
      >
        <ItemForm
          onSave={handleSaveItem}
          onCancel={() => setModal(null)}
          onUploadPhoto={uploadPhoto}
        />
      </Modal>

      <Modal
        isOpen={modal === "edit"}
        onClose={() => {
          setModal(null);
          setEditingItem(null);
        }}
        title={t.editItem}
      >
        {editingItem && (
          <ItemForm
            item={editingItem}
            onSave={handleSaveItem}
            onCancel={() => {
              setModal(null);
              setEditingItem(null);
            }}
            onUploadPhoto={uploadPhoto}
          />
        )}
      </Modal>

      <Modal
        isOpen={modal === "qr"}
        onClose={() => setModal(null)}
        title={t.generateQR}
      >
        <QRCodeDisplay value={menuLink} />
      </Modal>
    </div>
  );
}

export default AdminDashboard;
