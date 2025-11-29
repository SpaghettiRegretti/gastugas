// src/components/PublicMenu.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  X,
  Minus,
  Plus,
  Image as ImageIcon,
  TrendingUp,
  Award,
  UtensilsCrossed,
  Package as PackageIcon,
  Truck,
  Globe,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";

import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useSupabase } from "../hooks/useSupabase";
import Toast from "./Toast";
import { useTemplate } from "../contexts/TemplateContext";
import { getTemplateColors } from "./TemplateSettings";

/*
  PublicMenu - Blue themed + Dine-in / Takeaway / Delivery
  Layout: Large image cards (A)
*/

const DEFAULT_CATEGORIES = [
  "all",
  "food",
  "drink",
  "snack",
  "dessert",
  "other",
];

function Badge({ children, variant }) {
  const cls =
    variant === "trending"
      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
      : "bg-gradient-to-r from-amber-400 to-orange-500 text-white";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${cls}`}
    >
      {children}
    </span>
  );
}

function MenuItemCardLarge({ item, onClick }) {
  const { t } = useLanguage();
  const isPopular = (item?.views || 0) > 80 && (item?.views || 0) <= 150;
  const isTrending = (item?.views || 0) > 150;

  const formatPrice = (p) =>
    new Intl.NumberFormat("id-ID").format(Number(p || 0));

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border overflow-hidden cursor-pointer hover:shadow-lg active:scale-[0.99] transition-transform duration-150"
    >
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
        {item?.photo ? (
          <img
            src={item.photo}
            alt={item?.name || ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={36} className="text-gray-300" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isTrending && (
            <Badge variant="trending">
              <TrendingUp size={12} /> {t?.trending || "Trending"}
            </Badge>
          )}
          {isPopular && (
            <Badge variant="popular">
              <Award size={12} /> {t?.popularItem || "Popular"}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {item?.name}
        </h3>
        {item?.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <p className=" style={{ color: colors.primary }} font-bold text-lg">
            Rp {formatPrice(item?.price)}
          </p>
          <div className="text-sm text-gray-500">{item?.category}</div>
        </div>
      </div>
    </div>
  );
}

function ItemDetailModal({ item, isOpen, onClose, onAdd, colors }) {
  const { t, lang } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  if (!isOpen || !item) return null;

  const formatPrice = (p) =>
    new Intl.NumberFormat("id-ID").format(Number(p || 0));
  const totalPrice = Number(item.price || 0) * quantity || 0;

  const handleAdd = () => {
    if (onAdd) onAdd(item, quantity, note);
    setQuantity(1);
    setNote("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] bg-gray-100">
          {item.photo ? (
            <img
              src={item.photo}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={48} className="text-gray-300" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {(item.views || 0) > 150 && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="trending">
                <TrendingUp size={12} /> {t?.trending || "Trending"}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
          <p
            className="text-2xl font-bold mt-2"
            style={{ color: colors?.primary || "#666fb8" }}
          >
            Rp {formatPrice(item.price)}
          </p>

          {item.description && (
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              {item.description}
            </p>
          )}

          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === "id" ? "Jumlah Pesanan" : "Quantity"}
            </label>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: colors?.primary || "#666fb8" }}
                aria-label="Decrease"
              >
                <Minus size={18} />
              </button>

              <span className="text-2xl font-bold w-12 text-center">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center border rounded-lg transition-colors"
                style={{ borderColor: colors?.primary || "#666fb8" }}
                aria-label="Increase"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === "id" ? "Catatan (opsional)" : "Note (optional)"}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                lang === "id"
                  ? "Contoh: pedas, tanpa sayur..."
                  : "e.g. spicy, no vegetables..."
              }
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 outline-none transition-all"
              style={{ focusRingColor: colors?.primary || "#666fb8" }}
            />
          </div>

          <button
            onClick={handleAdd}
            className="w-full mt-4 px-4 py-3 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: colors?.primary || "#666fb8" }}
          >
            <ShoppingCart size={18} className="inline mr-2" />
            {lang === "id" ? "Tambah ke Keranjang" : "Add to Cart"} - Rp{" "}
            {formatPrice(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
function OrderTypeModal({ isOpen, onClose, onSelect }) {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  const orderTypes = [
    {
      id: "dine-in",
      icon: UtensilsCrossed,
      label: lang === "id" ? "Makan di Tempat" : "Dine In",
      desc: lang === "id" ? "Nikmati di tempat kami" : "Enjoy at our place",
      color: "from-[#4f46e5] to-[#2b6cb0]",
    },
    {
      id: "takeaway",
      icon: PackageIcon,
      label: lang === "id" ? "Bawa Pulang" : "Takeaway",
      desc: lang === "id" ? "Pesan & bawa pulang" : "Order & take home",
      color: "from-[#2563eb] to-[#06b6d4]",
    },
    {
      id: "delivery",
      icon: Truck,
      label: lang === "id" ? "Antar (Delivery)" : "Delivery",
      desc: lang === "id" ? "Kirim ke alamat Anda" : "Deliver to you",
      color: "from-[#059669] to-[#10b981]",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-[#e9eefc] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={26} style={{ color: colors.primary }} />
          </div>
          <h3 className="text-2xl font-bold mb-1">
            {lang === "id" ? "Pilih Tipe Pesanan" : "Select Order Type"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {lang === "id"
              ? "Bagaimana Anda ingin memesan?"
              : "How would you like to order?"}
          </p>

          <div className="space-y-3">
            {orderTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  if (onSelect) onSelect(type.id);
                }}
                className={`${
                  colors?.button || "bg-blue-500"
                } text-white px-4 py-2 rounded-lg`}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center`}
                >
                  <type.icon size={20} className="text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500">{type.desc}</div>
                </div>
                <div className="text-gray-400">›</div>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className={`${
              colors?.button || "bg-blue-500"
            } text-white px-4 py-2 rounded-lg`}
          >
            {lang === "id" ? "Batal" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PublicMenu() {
  const { items = [], settings = {}, loading, updateItem } = useSupabase();
  const { user } = useAuth();
  // include toggleLang to switch language
  const { t = {}, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const { template } = useTemplate();
  const colors = getTemplateColors(template);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [toast, setToast] = useState(null);

  // Helpful derived values
  const categories = useMemo(() => {
    const derived = [
      "all",
      ...DEFAULT_CATEGORIES.filter((c) =>
        items.some((it) => it.category === c)
      ),
      ...Array.from(
        new Set(
          items
            .map((i) => i.category)
            .filter((c) => !DEFAULT_CATEGORIES.includes(c))
        )
      ),
    ];
    return derived;
  }, [items]);

  const cartTotal = cart.reduce(
    (sum, it) => sum + Number(it.price || 0) * (it.quantity || 0),
    0
  );
  const cartItemsCount = cart.reduce((sum, it) => sum + (it.quantity || 0), 0);

  // Toast helper
  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 2000);
  };

  // Add to cart (item, qty, note)
  const addToCart = (item, qty = 1, note = "") => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (p) => p.id === item.id && (p.note || "") === (note || "")
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex].quantity =
          (copy[existingIndex].quantity || 0) + qty;
        return copy;
      }

      return [...prev, { ...item, quantity: qty, note }];
    });

    showToast(
      t?.addedToCart ||
        (lang === "id" ? "Ditambahkan ke keranjang" : "Added to cart")
    );
  };

  const updateCartQty = (index, newQty) => {
    if (newQty <= 0) return;
    setCart((prev) =>
      prev.map((it, i) => (i === index ? { ...it, quantity: newQty } : it))
    );
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // When user clicks an item (opens detail & increases views)
  const onItemClick = async (item) => {
    setSelectedItem(item);
    try {
      await updateItem(item.id, { views: (item.views || 0) + 1 });
    } catch (e) {
      console.warn("update views failed", e);
    }
  };

  // Order flow
  const handleOrderTypeSelect = (type) => {
    setSelectedOrderType(type);
    setShowOrderTypeModal(false);
    setIsCartOpen(true);
  };

  const generateWhatsAppMessage = () => {
    // Minimal fallback message if translation helpers are missing
    const storeName = settings?.storeName || "Store";
    const lines = [];
    lines.push(`*Order from ${storeName}*`);
    lines.push(`Type: ${selectedOrderType || "unknown"}`);
    lines.push("");
    cart.forEach((it, idx) => {
      lines.push(
        `${idx + 1}. ${it.name} x${it.quantity} - Rp ${Number(
          it.price || 0
        ).toLocaleString("id-ID")}`
      );
      if (it.note) lines.push(`   note: ${it.note}`);
    });
    lines.push("");
    lines.push(`TOTAL: Rp ${Number(cartTotal || 0).toLocaleString("id-ID")}`);
    return lines.join("\n");
  };

  const orderViaWhatsApp = () => {
    const phone = (settings?.whatsappNumber || "").replace(/[^0-9]/g, "");

    if (!phone) {
      showToast(
        lang === "id"
          ? "❌ Nomor WhatsApp belum diatur"
          : "❌ WhatsApp number not set",
        "error"
      );
      return;
    }

    const storeName = settings?.storeName || "BookletKu";
    const lines = [];

    lines.push("🛒 PESANAN BARU 🛒");
    lines.push("");
    lines.push(`*Toko: ${storeName}*`);
    lines.push(
      `*Waktu: ${new Date().toLocaleString(lang === "id" ? "id-ID" : "en-US")}*`
    );
    lines.push("═══════════════════");
    lines.push("");

    if (selectedOrderType) {
      const typeLabels = {
        "dine-in": lang === "id" ? "🍽️ Makan di Tempat" : "🍽️ Dine In",
        takeaway: lang === "id" ? "📦 Bawa Pulang" : "📦 Takeaway",
        delivery: lang === "id" ? "🚗 Delivery" : "🚗 Delivery",
      };
      lines.push(typeLabels[selectedOrderType] || selectedOrderType);
      lines.push("");
    }

    lines.push(lang === "id" ? "*📋 PESANAN:*" : "*📋 ORDER:*");
    lines.push("");

    cart.forEach((item, idx) => {
      const itemTotal = item.price * item.quantity;
      lines.push(`${idx + 1}. *${item.name}*`);
      lines.push(
        `   ${item.quantity}x @ Rp ${Number(item.price || 0).toLocaleString(
          "id-ID"
        )}`
      );
      lines.push(`   = Rp ${itemTotal.toLocaleString("id-ID")}`);
      if (item.note) {
        lines.push(`   📝 ${item.note}`);
      }
      lines.push("");
    });

    lines.push("═══════════════════");
    lines.push(`*TOTAL: Rp ${cartTotal.toLocaleString("id-ID")}*`);
    lines.push(`*(${cartItemsCount} item)*`);
    lines.push("═══════════════════");
    lines.push("");
    lines.push(lang === "id" ? "✅ Terima kasih!" : "✅ Thank you!");
    lines.push("*- BookletKu -*");

    const message = lines.join("\n");
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");

    setTimeout(() => {
      setCart([]);
      setSelectedOrderType(null);
      setIsCartOpen(false);
      showToast(
        lang === "id" ? "✅ Pesanan dikirim!" : "✅ Order sent!",
        "success"
      );
    }, 500);
  };

  // Filtering items
  const filteredGroups = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    const source =
      selectedCategory === "all"
        ? items
        : items.filter((i) => i.category === selectedCategory);
    const filtered = source.filter((i) =>
      (i?.name || "").toLowerCase().includes(q)
    );
    // For layout A, we group by category only when "all"
    if (selectedCategory === "all") {
      const groups = {};
      filtered.forEach((i) => {
        const cat = i.category || "other";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(i);
      });
      return Object.entries(groups).map(([category, items]) => ({
        category,
        items,
      }));
    }
    return [{ category: selectedCategory, items: filtered }];
  }, [items, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {" "}
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {settings?.storeName || "BookletKu"}
            </h1>
            <p className="text-sm text-gray-500">
              {settings?.storeLocation || ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle - Make it white/styled */}
            <button
              onClick={() => toggleLang && toggleLang()}
              title={lang === "id" ? "Ganti bahasa" : "Toggle language"}
              className="p-2 rounded-lg transition-all"
              style={{ backgroundColor: colors.primary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryDark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
              aria-label="Toggle language"
            >
              <Globe size={18} className="text-white" />
            </button>

            {/* Simple 'i' info icon */}
            <button
              onClick={() => setShowStoreDetails((s) => !s)}
              title={lang === "id" ? "Info toko" : "Store info"}
              className="p-2 rounded-md hover:bg-gray-100 transition-all"
              aria-label="Store info"
            >
              <span
                className="w-7 h-7 rounded-full border flex items-center justify-center font-semibold text-sm transition-all"
                style={{
                  color: showStoreDetails ? "white" : colors.primary,
                  backgroundColor: showStoreDetails
                    ? colors.primary
                    : "transparent",
                  borderColor: colors.primary,
                }}
              >
                i
              </span>
            </button>

            {/* Login/Profile (kept as requested) */}
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 transition-all"
            >
              <UserIconFallback colors={colors} />
              <span className="text-sm">
                {user ? t?.profile || "Profile" : t?.login || "Login"}
              </span>
            </button>
          </div>
        </div>

        {showStoreDetails && (
          <div className="bg-white border-t">
            <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-gray-600">
              <div>
                <strong>{t?.location || "Location"}:</strong>{" "}
                {settings?.storeLocation || "-"}
              </div>
              <div>
                <strong>{t?.operatingHours || "Hours"}:</strong>{" "}
                {settings?.operatingHours || "-"}
              </div>
              <div>
                <strong>WhatsApp:</strong>{" "}
                {settings?.whatsappNumber ? `+${settings.whatsappNumber}` : "-"}
              </div>
            </div>
          </div>
        )}
      </header>
      {/* Search */}
      <div className="max-w-5xl mx-auto px-4 pt-5">
        <input
          type="text"
          placeholder={
            t?.searchPlaceholder ||
            (lang === "id" ? "Cari menu..." : "Search menu...")
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#666fb8] outline-none"
        />
      </div>
      {/* Categories */}
      <div className="max-w-5xl mx-auto px-4 py-4 overflow-x-auto flex gap-3 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
              selectedCategory === cat
                ? "${colors.button} text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {t?.categories?.[cat] || capitalize(cat)}
          </button>
        ))}
      </div>
      {/* Content */}
      <main className="max-w-5xl mx-auto px-4">
        {loading && (
          <p className="text-center py-10">
            {t?.loading || (lang === "id" ? "Memuat..." : "Loading...")}
          </p>
        )}

        {filteredGroups.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-500">
            {t?.noItems || (lang === "id" ? "Belum ada menu" : "No items yet")}
          </div>
        )}

        {filteredGroups.map((group) => (
          <section key={group.category} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {t?.categories?.[group.category] || capitalize(group.category)}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.items.map((item) => (
                <MenuItemCardLarge
                  key={item.id}
                  item={item}
                  onClick={() => onItemClick(item)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className={`fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full shadow-lg ${colors.button} text-white font-semibold flex items-center gap-3`}
          aria-label="Open cart"
        >
          🛒 {t?.cart || (lang === "id" ? "Keranjang" : "Cart")} (
          {cartItemsCount})
        </button>
      )}
      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(item, qty, note) => addToCart(item, qty, note)}
          colors={colors}
        />
      )}
      {/* Order Type Modal */}
      {showOrderTypeModal && (
        <OrderTypeModal
          isOpen={showOrderTypeModal}
          onSelect={handleOrderTypeSelect}
          onClose={() => setShowOrderTypeModal(false)}
        />
      )}
      {/* Cart Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="w-full sm:w-[420px] bg-white h-full shadow-xl flex flex-col">
            <header className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {t?.yourCart ||
                    (lang === "id" ? "Keranjang Anda" : "Your Cart")}
                </h3>
                <p className="text-sm text-gray-500">
                  {cartItemsCount}{" "}
                  {t?.items || (lang === "id" ? "item" : "items")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setShowOrderTypeModal(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#eaf0ff]  style={{ color: colors.primary }} text-sm"
                >
                  {t?.chooseType || (lang === "id" ? "Tipe" : "Type")}
                </button>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-500 text-lg p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((it, idx) => (
                <div key={idx} className="flex gap-3 pb-3 border-b">
                  <img
                    src={it.photo || "/placeholder.jpg"}
                    alt={it.name}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{it.name}</h4>
                      <div className="text-sm text-gray-600">
                        Rp {Number(it.price || 0).toLocaleString("id-ID")}
                      </div>
                    </div>

                    {it.note && (
                      <p className="text-xs text-gray-400 mt-1">📝 {it.note}</p>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() =>
                          updateCartQty(idx, (it.quantity || 0) - 1)
                        }
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <span className="px-2">{it.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartQty(idx, (it.quantity || 0) + 1)
                        }
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="ml-auto text-red-500"
                      >
                        ✖
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  {t?.noItemsInCart ||
                    (lang === "id" ? "Keranjang kosong" : "Cart is empty")}
                </p>
              )}
            </div>

            <footer className="p-4 border-t bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">
                    {lang === "id" ? "Total" : "Total"}
                  </p>
                  <p className="text-2xl font-bold">
                    Rp {cartTotal.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {cartItemsCount} {lang === "id" ? "item" : "items"}
                  </p>
                </div>
              </div>

              {!selectedOrderType ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-medium text-amber-800 mb-2">
                    {lang === "id"
                      ? "Pilih tipe pesanan:"
                      : "Select order type:"}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "dine-in",
                        icon: "🍽️",
                        label: lang === "id" ? "Makan" : "Dine-in",
                      },
                      {
                        id: "takeaway",
                        icon: "📦",
                        label: lang === "id" ? "Bawa" : "Takeaway",
                      },
                      {
                        id: "delivery",
                        icon: "🚗",
                        label: lang === "id" ? "Antar" : "Delivery",
                      },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedOrderType(type.id)}
                        className="px-2 py-2 text-xs rounded-lg border bg-white hover:bg-amber-100 transition-colors font-medium"
                      >
                        {type.icon}
                        <br />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 text-center font-medium">
                  ✅{" "}
                  {selectedOrderType === "dine-in"
                    ? lang === "id"
                      ? "Makan di Tempat"
                      : "Dine In"
                    : selectedOrderType === "takeaway"
                    ? lang === "id"
                      ? "Bawa Pulang"
                      : "Takeaway"
                    : "Delivery"}
                </div>
              )}

              <button
                onClick={orderViaWhatsApp}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                <MessageCircle size={20} />
                {lang === "id" ? "Pesan via WhatsApp" : "Order via WhatsApp"}
              </button>

              <button
                onClick={() => {
                  setCart([]);
                  setSelectedOrderType(null);
                  setIsCartOpen(false);
                }}
                className="w-full py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                {lang === "id" ? "Kosongkan" : "Clear"}
              </button>
            </footer>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={2000}
        />
      )}
    </div>
  );
}

/* ----------------- Helpers ----------------- */

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// A tiny fallback user icon (keeps imports minimal in this file)
function UserIconFallback() {
  return (
    <div
      className={
        "w-6 h-6 rounded-full bg-[ ${colors.button} text-white flex items-center justify-center text-xs font-bold"
      }
    >
      U
    </div>
  );
}
