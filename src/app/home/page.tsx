"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  quantity: number;
  image: string;
  youtubeUrl: string;
  offerRate: number;
  mrpRate: number;
  createdAt: string;
};

type CartItem = Product & { quantity: number };

const PHONES = [
  { label: "8767646225", wa: "918767646225" },
  { label: "7715047507", wa: "917715047507" },
] as const;

const CATEGORIES = [
  "All",
  "Sparklers",
  "Rockets",
  "Flower Pots",
  "Chakkars",
  "Bombs",
  "Fancy",
] as const;

type Category = (typeof CATEGORIES)[number];

function getCategory(name: string): Category {
  const n = name.toLowerCase();
  if (n.includes("rocket") || n.includes("kuruvi")) return "Rockets";
  if (n.includes("flower") || n.includes("anaar") || n.includes("peacock")) return "Flower Pots";
  if (n.includes("chakkar") || n.includes("spinner")) return "Chakkars";
  if (
    n.includes("bomb") ||
    n.includes("thunder") ||
    n.includes("hydro") ||
    n.includes("bullet") ||
    n.includes("lakshmi")
  ) {
    return "Bombs";
  }
  if (
    n.includes("sparkler") ||
    n.includes("electric") ||
    n.includes("pencil") ||
    n.includes("twinkling") ||
    /\d+\s*cm/.test(n)
  ) {
    return "Sparklers";
  }
  return "Fancy";
}

function extractYouTubeId(url: string) {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("All");
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem("cart");
      }
    }
    setCartHydrated(true);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, cartHydrated]);

  const addToCart = (product: Product) => {
    if (product.quantity === 0) {
      alert(`${product.name} is out of stock!`);
      return;
    }

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        alert(`Only ${product.quantity} units available!`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (!existing) return;

    if (existing.quantity === 1) {
      setCart(cart.filter((item) => item.id !== product.id));
    } else {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };

  const getCartQuantity = (productId: number) => {
    const item = cart.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.offerRate * item.quantity, 0);

  const filteredProducts = useMemo(() => {
    if (category === "All") return products;
    return products.filter((p) => getCategory(p.name || "") === category);
  }, [products, category]);

  const availableCategories = useMemo(() => {
    const present = new Set(products.map((p) => getCategory(p.name || "")));
    return CATEGORIES.filter((c) => c === "All" || present.has(c));
  }, [products]);

  return (
    <div className="page-ivory min-h-screen pb-safe-cart">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="font-display gold-text truncate text-sm font-bold tracking-wide sm:text-lg md:text-2xl">
              KUKI&apos;S FIRECRACKERS &amp; FIREWORKS
            </h1>
            <p className="truncate text-[11px] uppercase tracking-[0.18em] text-white/75 sm:text-xs">
              Safe &amp; Sparkling Fun
            </p>
          </div>

          <Link
            href="/checkout"
            className="relative flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-navy shadow-lg transition hover:bg-gold-soft sm:px-5"
            aria-label={`Cart with ${cartCount} items`}
          >
            <span aria-hidden>🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-cta px-1.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <section className="hero-navy overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-0 lg:grid-cols-[1fr_auto]">
          <div className="relative z-10 px-4 py-8 text-center sm:px-6 sm:py-12 lg:py-16 lg:text-left">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gold">
              Festival of Lights
            </p>
            <h2 className="font-script gold-text text-5xl leading-none sm:text-6xl md:text-7xl">
              Happy Diwali
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-white/90 sm:text-lg lg:mx-0">
              Free home delivery from{" "}
              <span className="font-semibold text-gold">Dahisar to Andheri</span>.
              Order online — offer valid till stock lasts.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a href="#products" className="cta-btn rounded-full px-6 py-3 text-sm sm:text-base">
                Shop Now
              </a>
              <a
                href={`tel:${PHONES[0].label}`}
                className="gold-outline rounded-full px-5 py-3 text-sm"
              >
                Call {PHONES[0].label}
              </a>
            </div>
            <p className="mt-4 text-sm text-white/60">
              Also:{" "}
              <a href={`tel:${PHONES[1].label}`} className="text-gold underline-offset-2 hover:underline">
                {PHONES[1].label}
              </a>
            </p>
          </div>

          <div className="hero-photo-wrap flex w-full items-center justify-center lg:h-full">
            <Image
              src="/hero-family.jpg"
              alt="Family celebrating Diwali with Kuki's Firecrackers and Fireworks"
              width={576}
              height={1024}
              className="h-auto w-full object-contain lg:max-h-[90vh] lg:w-auto"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-maroon px-5 py-5 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-display text-lg font-semibold text-gold sm:text-xl">
              Free Home Delivery
            </h3>
            <p className="mt-1 text-sm text-ivory">
              Dahisar → Andheri · WhatsApp orders welcome · Offer till stock lasts
            </p>
          </div>
          <a href="#products" className="cta-btn shrink-0 rounded-full px-5 py-2.5 text-sm">
            Shop Now
          </a>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12">
        <div className="mb-5">
          <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
            Our Crackers
          </h2>
          <p className="text-sm text-muted">Tap a product image to watch a demo video</p>
        </div>

        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {availableCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                category === c
                  ? "bg-navy text-gold"
                  : "border border-gold/30 bg-cream text-charcoal hover:border-gold"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gold/15 bg-white p-3">
                <div className="skeleton mb-3 h-36 rounded-xl sm:h-44" />
                <div className="skeleton mb-2 h-4 w-3/4 rounded" />
                <div className="skeleton mb-3 h-4 w-1/2 rounded" />
                <div className="skeleton h-9 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="rounded-2xl border border-gold/20 bg-cream px-4 py-10 text-center text-muted">
            No products in this category yet. Try another filter.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const outOfStock = product.quantity === 0;
              const hasVideo = !!product.youtubeUrl;
              const qtyInCart = getCartQuantity(product.id);
              const hasDiscount = product.mrpRate > product.offerRate;
              const offPct = hasDiscount
                ? Math.round(((product.mrpRate - product.offerRate) / product.mrpRate) * 100)
                : 0;

              return (
                <article
                  key={product.id}
                  className={`group flex flex-col justify-between rounded-2xl border border-gold/20 bg-white p-3 shadow-sm transition duration-300 hover:border-gold hover:shadow-md sm:p-4 ${
                    outOfStock ? "opacity-70" : ""
                  }`}
                >
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-xl"
                    onClick={() => hasVideo && setSelectedVideo(product.youtubeUrl)}
                    onKeyDown={(e) => {
                      if (hasVideo && (e.key === "Enter" || e.key === " ")) {
                        setSelectedVideo(product.youtubeUrl);
                      }
                    }}
                    role={hasVideo ? "button" : undefined}
                    tabIndex={hasVideo ? 0 : undefined}
                  >
                    {product.image ? (
                      <div className="relative h-36 w-full sm:h-44 md:h-52">
                        <Image
                          src={product.image}
                          alt={product.name || "Product"}
                          fill
                          className="rounded-lg object-cover transition duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center rounded-xl bg-cream text-sm text-muted sm:h-44">
                        No Image
                      </div>
                    )}

                    {hasDiscount && !outOfStock && (
                      <span className="absolute left-2 top-2 rounded-full bg-cta px-2 py-0.5 text-[10px] font-bold text-white sm:text-xs">
                        {offPct}% OFF
                      </span>
                    )}

                    {outOfStock && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-navy/70 text-sm font-bold text-white">
                        Out of Stock
                      </span>
                    )}

                    {hasVideo && !outOfStock && (
                      <span className="absolute bottom-2 right-2 rounded-lg bg-navy px-2 py-1 text-[10px] font-semibold text-white shadow-md sm:text-xs">
                        ▶ Watch
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 sm:mt-3">
                    <h3 className="line-clamp-2 text-sm font-bold text-charcoal sm:text-base">
                      {product.name}
                    </h3>
                    <div className="my-1.5 flex flex-wrap items-center gap-1.5 sm:my-2 sm:gap-2">
                      {hasDiscount && (
                        <span className="text-xs text-muted line-through">₹{product.mrpRate}</span>
                      )}
                      <span className="text-base font-bold text-navy sm:text-lg">
                        ₹{product.offerRate}
                      </span>
                    </div>
                  </div>

                  {!outOfStock && (
                    <div className="mt-auto pt-1">
                      {qtyInCart > 0 ? (
                        <div className="flex items-center justify-between rounded-full border border-navy/10 bg-ivory px-2 py-1.5 sm:px-3 sm:py-2">
                          <button
                            type="button"
                            onClick={() => removeFromCart(product)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon text-lg text-white sm:h-9 sm:w-9"
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>
                          <span className="font-semibold text-navy">{qtyInCart}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-mid text-lg text-white sm:h-9 sm:w-9"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="navy-btn w-full rounded-full py-2.5 text-sm sm:py-2"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {cartCount > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-navy p-3 md:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <Link
            href="/checkout"
            className="cta-btn flex w-full items-center justify-between rounded-full px-5 py-3.5 text-sm"
          >
            <span>View Cart · {cartCount} items</span>
            <span>₹{cartTotal}</span>
          </Link>
        </div>
      )}

      <a
        href={`https://wa.me/${PHONES[0].wa}?text=${encodeURIComponent(
          "Hi! I'd like to ask about crackers / place an order."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-2xl text-white shadow-xl shadow-black/30 transition hover:scale-105 md:bottom-6 md:right-6"
        style={{ marginBottom: cartCount > 0 ? "0.5rem" : undefined }}
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-0 sm:p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative h-full w-full overflow-hidden bg-black sm:h-auto sm:max-w-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-navy"
            >
              ✕ Close
            </button>
            <div className="aspect-video h-full w-full sm:h-auto">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${extractYouTubeId(selectedVideo)}`}
                title="Product Video"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <footer className="bg-navy px-4 py-8 text-center text-sm">
        <p className="font-display text-gold">KUKI&apos;S FIRECRACKERS &amp; FIREWORKS</p>
        <p className="mt-1 text-white/80">Safe &amp; Sparkling Fun · Festival of Lights</p>
        <p className="mt-2 text-muted">
          {PHONES.map((p, i) => (
            <span key={p.label}>
              {i > 0 && " / "}
              <a href={`tel:${p.label}`} className="text-white/80 hover:text-gold">
                {p.label}
              </a>
            </span>
          ))}
        </p>
      </footer>
    </div>
  );
}
