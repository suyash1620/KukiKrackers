"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CartItem = {
  id: number;
  name: string;
  offerRate: number;
  mrpRate: number;
  quantity: number;
  stock?: number;
};

const WHATSAPP_OPTIONS = [
  { label: "8767646225", wa: "918767646225" },
  { label: "7715047507", wa: "917715047507" },
] as const;

type FieldErrors = {
  name?: string;
  contact?: string;
  address?: string;
};

function persistCart(next: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(next));
}

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [whatsappTo, setWhatsappTo] = useState<string>(WHATSAPP_OPTIONS[0].wa);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        localStorage.removeItem("cart");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistCart(cart);
  }, [cart, hydrated]);

  const total = cart.reduce((sum, item) => sum + item.offerRate * item.quantity, 0);

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = item.quantity + delta;
          if (nextQty < 1) return item;
          return { ...item, quantity: nextQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedContact = contact.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || trimmedName.length < 2) {
      next.name = "Please enter your full name.";
    }
    if (!/^[6-9]\d{9}$/.test(trimmedContact)) {
      next.contact = "Enter a valid 10-digit Indian mobile number.";
    }
    if (!trimmedAddress || trimmedAddress.length < 10) {
      next.address = "Please enter a complete delivery address.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleOrder = async () => {
    if (!validate()) return;
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          address: address.trim(),
          cart: cart.map((item) => ({
            id: item.id,
            name: item.name,
            offerRate: item.offerRate,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create order");

      const orderDetails = `
*🧨 New Order — Kuki's Krakers*
👤 Name: ${name.trim()}
📞 Contact: ${contact.trim()}
🏠 Address: ${address.trim()}

🛒 *Items:*
${cart
  .map(
    (item) =>
      `• ${item.name} x${item.quantity} = ₹${item.offerRate * item.quantity}`
  )
  .join("\n")}

💰 *Total:* ₹${total}
      `.trim();

      const whatsappUrl = `https://wa.me/${whatsappTo}?text=${encodeURIComponent(orderDetails)}`;
      window.open(whatsappUrl, "_blank");

      setCart([]);
      localStorage.removeItem("cart");
      setName("");
      setContact("");
      setAddress("");
      setErrors({});
      alert("✅ Order placed! Complete the WhatsApp message to confirm.");
      router.push("/");
    } catch (err: unknown) {
      console.error("Order error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to place order. Please try again.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="festive-bg min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-cream/70 transition hover:text-gold"
        >
          ← Back to shop
        </Link>

        <div className="rounded-3xl border border-gold/25 bg-cream p-5 shadow-2xl shadow-navy-deep/40 sm:p-8">
          <h1 className="font-display gold-text mb-1 text-center text-2xl font-bold sm:text-3xl">
            Checkout
          </h1>
          <p className="mb-6 text-center text-sm text-navy/60">
            Review your cart &amp; place order via WhatsApp
          </p>

          {/* Customer Details */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy-deep">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl border bg-white p-3 text-navy-deep outline-none transition focus:border-gold ${
                  errors.name ? "border-burst" : "border-navy/15"
                }`}
                placeholder="Enter your full name"
                autoComplete="name"
              />
              {errors.name && <p className="mt-1 text-xs text-burst">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy-deep">Contact</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={contact}
                onChange={(e) => setContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className={`w-full rounded-xl border bg-white p-3 text-navy-deep outline-none transition focus:border-gold ${
                  errors.contact ? "border-burst" : "border-navy/15"
                }`}
                placeholder="10-digit mobile number"
                autoComplete="tel"
              />
              {errors.contact && <p className="mt-1 text-xs text-burst">{errors.contact}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-navy-deep">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full rounded-xl border bg-white p-3 text-navy-deep outline-none transition focus:border-gold ${
                  errors.address ? "border-burst" : "border-navy/15"
                }`}
                rows={3}
                placeholder="Full delivery address (landmark helps)"
                autoComplete="street-address"
              />
              {errors.address && <p className="mt-1 text-xs text-burst">{errors.address}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-navy-deep">
                Send order on WhatsApp to
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                {WHATSAPP_OPTIONS.map((opt) => (
                  <label
                    key={opt.wa}
                    className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                      whatsappTo === opt.wa
                        ? "border-gold bg-gold/15 font-semibold text-navy-deep"
                        : "border-navy/15 bg-white text-navy/80"
                    }`}
                  >
                    <input
                      type="radio"
                      name="whatsapp"
                      checked={whatsappTo === opt.wa}
                      onChange={() => setWhatsappTo(opt.wa)}
                      className="accent-amber-600"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="mb-6 rounded-2xl border border-gold/20 bg-navy/[0.03] p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-navy-deep">
              Cart Summary
            </h2>
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500">
                No items in cart.{" "}
                <Link href="/" className="font-medium text-amber-700 underline">
                  Browse products
                </Link>
              </p>
            ) : (
              <>
                <ul className="space-y-3">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-2 border-b border-navy/10 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-navy-deep">{item.name}</p>
                        <p className="text-xs text-slate-500">₹{item.offerRate} each</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div className="flex items-center gap-2 rounded-full border border-navy/10 bg-white px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, -1)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-burst text-white"
                            aria-label="Decrease"
                          >
                            –
                          </button>
                          <span className="min-w-6 text-center font-semibold text-navy-deep">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white"
                            aria-label="Increase"
                          >
                            +
                          </button>
                        </div>
                        <span className="min-w-[4.5rem] text-right font-semibold text-navy-deep">
                          ₹{item.offerRate * item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-slate-400 hover:text-burst"
                          aria-label={`Remove ${item.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <hr className="my-3 border-gold/30" />
                <div className="flex justify-between text-lg font-bold text-navy-deep">
                  <span>Total</span>
                  <span className="text-amber-700">₹{total}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded-full border-2 border-gold/50 bg-white py-3 font-semibold text-navy-deep transition hover:bg-gold-soft sm:w-1/2"
            >
              Add More
            </button>

            <button
              type="button"
              onClick={handleOrder}
              disabled={loading || cart.length === 0}
              className={`w-full rounded-full py-3 font-semibold shadow-md transition sm:w-1/2 ${
                loading || cart.length === 0
                  ? "cursor-not-allowed bg-slate-300 text-slate-500"
                  : "gold-btn"
              }`}
            >
              {loading ? "Placing Order..." : "Place Order via WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
