"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type CartItem = {
  id: number;
  name: string;
  offerRate: number;
  mrpRate: number;
  quantity: number;
};

export default function Checkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // const cartParam = searchParams.get("cart");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  const total = cart.reduce((sum, item) => sum + item.offerRate * item.quantity, 0);

  const handleOrder = async () => {
    if (!name || !contact || !address) {
      alert("Please fill all fields!");
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, address, cart }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create order");

      const orderDetails = `
*🧨 New Order Placed!*
👤 Name: ${name}
📞 Contact: ${contact}
🏠 Address: ${address}

🛒 *Items:*
${cart.map(item => `• ${item.name} x${item.quantity} = ₹${item.offerRate * item.quantity}`).join("\n")}

💰 *Total:* ₹${total}
      `.trim();

      const whatsappNumbers = ["918767646225", "917715047507"];
      whatsappNumbers.forEach((number) => {
        const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(orderDetails)}`;
        window.open(whatsappUrl, "_blank");
      });

      setCart([]);
      setName("");
      setContact("");
      setAddress("");
      alert("✅ Order placed successfully!");
      router.push("/");
    } catch (err: any) {
      console.error("Order error:", err);
      alert(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bgImage min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-6 md:p-8 max-w-xl w-full border border-red-100">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-red-700 drop-shadow">
          🧨 Checkout
        </h1>

        {/* --- Customer Details --- */}
        <div className="space-y-5 mb-8">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 focus:border-red-400 rounded-lg p-3 outline-none transition"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Contact</label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full border border-gray-300 focus:border-red-400 rounded-lg p-3 outline-none transition"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 focus:border-red-400 rounded-lg p-3 outline-none transition"
              rows={3}
              placeholder="Full delivery address"
            />
          </div>
        </div>

        {/* --- Cart Summary --- */}
        <div className="mb-6 border border-gray-200 rounded-2xl p-4 bg-red-50/40 shadow-inner">
          <h2 className="font-semibold mb-3 text-lg text-red-700">🧾 Cart Summary</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-sm">No items in cart.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between mb-1 text-gray-800">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{item.offerRate * item.quantity}</span>
                </div>
              ))}

              <hr className="my-3 border-red-200" />
              <div className="flex justify-between font-bold text-lg text-red-700">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </>
          )}
        </div>

        {/* --- Buttons --- */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="w-1/2 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-orange-500 hover:to-yellow-400 text-white font-semibold shadow-md transition"
          >
            ➕ Add More
          </button>

          <button
            onClick={handleOrder}
            disabled={loading || cart.length === 0}
            className={`w-1/2 py-3 rounded-full font-semibold shadow-md transition ${loading
                ? "bg-gray-400 text-white"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              }`}
          >
            {loading ? "Placing Order..." : "Place Order via WhatsApp"}
          </button>
        </div>
      </div>
    </div>

  );
}
