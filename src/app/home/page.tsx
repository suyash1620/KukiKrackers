"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

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

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    // Load products
    useEffect(() => {
        fetch("/api/products")
            .then((res) => res.json())
            .then((data: Product[]) => setProducts(data))
            .catch((err) => console.error("Error fetching products:", err));
    }, []);

    // Load cart from localStorage
    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) setCart(JSON.parse(storedCart));
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // Add to cart
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
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    // Remove from cart
    const removeFromCart = (product: Product) => {
        const existing = cart.find((item) => item.id === product.id);
        if (!existing) return;

        if (existing.quantity === 1) {
            setCart(cart.filter((item) => item.id !== product.id));
        } else {
            setCart(
                cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
            );
        }
    };

    const getCartQuantity = (productId: number) => {
        const item = cart.find((i) => i.id === productId);
        return item ? item.quantity : 0;
    };

    const extractYouTubeId = (url: string) => {
        const regex =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    return (
        <>


            <div className="flex justify-between items-center bg-gradient-to-r from-orange-600 via-red-600 to-yellow-500 text-white px-6 py-4  shadow-lg border border-white/20">
                {/* Logo / Title */}
                <div className="flex flex-col">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide drop-shadow-lg">
                        🎇 KUKI'S KRAKER'S
                    </h1>
                    <p className="text-sm md:text-base font-light text-white/80">
                        Spark the joy this festive season!
                    </p>
                </div>

                {/* Cart Button */}
                <a
                    href={`/checkout?cart=${encodeURIComponent(JSON.stringify(cart))}`}
                    className="relative bg-white text-red-600 font-semibold py-2 px-6 rounded-full shadow-lg flex items-center gap-2 hover:bg-yellow-100 transition"
                >
                    🛒
                    <span>Cart</span>
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                        {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                </a>
            </div>



            <div className="b bg-white-300 text-white ">
                {/* Delivery Section */}
                <div className="relative flex flex-col md:flex-row items-center justify-between   p-8  overflow-hidden">

                    {/* Background Sparkles */}
                    <div className="absolute inset-0 bg-[url('/images/spark-bg.png')] bg-cover bg-center opacity-10"></div>

                    {/* Text Side */}
                    <div className="flex-1 relative z-10 text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-orange-700 mb-4">
                         Free Home Delivery
                        </h2>
                        <p className="text-lg md:text-xl text-gray-800 mb-2">
                            <span className="font-semibold">From Dahisar to Andheri</span>
                        </p>
                        <p className="text-lg md:text-xl text-gray-700">
                            Contact: <span className="font-semibold text-orange-700">8767646225 / 7715047507</span>
                        </p>


                    </div>

                    {/* Image Side */}
                    <div className="flex-1 flex justify-center md:justify-end"> <Image src="/images/bgImage/load.jpg" alt="Delivery" width={400} height={400} className=" object-contain" /> </div>
                </div>









                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
                    {products.map((product) => {
                        const outOfStock = product.quantity === 0;
                        const hasVideo = !!product.youtubeUrl;
                        const qtyInCart = getCartQuantity(product.id);

                        return (
                            <div
                                key={product.id}
                                className={`relative group rounded-2xl border border-orange-200 shadow-lg p-4 flex flex-col justify-between bg-gradient-to-br from-yellow-50 to-orange-100 hover:from-orange-100 hover:to-yellow-50 transition-all duration-300 hover:shadow-2xl ${outOfStock ? "opacity-70" : ""
                                    }`}
                            >
                                {/* Image Section */}
                                <div
                                    className="relative cursor-pointer overflow-hidden rounded-xl"
                                    onClick={() => hasVideo && setSelectedVideo(product.youtubeUrl)}
                                >
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-40 w-full object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="h-40 w-full bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                                            No Image
                                        </div>
                                    )}

                                    {/* Overlay for Out of Stock */}
                                    {outOfStock && (
                                        <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg rounded-xl">
                                            Out of Stock
                                        </span>
                                    )}

                                    {/* Watch Video Badge */}
                                    {hasVideo && !outOfStock && (
                                        <span className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-lg shadow-md group-hover:scale-110 transition">
                                            ▶ Watch
                                        </span>
                                    )}

                                    {/* Subtle spark effect on hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[url('/images/spark-bg.png')] bg-cover bg-center transition"></div>
                                </div>

                                {/* Product Info */}
                                <div className="mt-3">
                                    <h2 className="font-bold text-lg text-gray-800 line-clamp-2">{product.name}</h2>

                                    {/* Price Section */}
                                    <div className="my-2 flex items-center gap-2">
                                        {product.mrpRate > product.offerRate && (
                                            <span className="text-gray-500 line-through text-sm">₹MRP :{product.mrpRate}</span>
                                        )}
                                        <span className="text-green-700 font-bold text-lg">₹{product.offerRate}</span>
                                    </div>
                                </div>

                                {/* Cart Controls */}
                                {!outOfStock && (
                                    <div className="mt-3">
                                        {qtyInCart > 0 ? (
                                            <div className="flex items-center justify-between bg-white rounded-full px-3 py-2 shadow-inner border border-gray-200">
                                                <button
                                                    onClick={() => removeFromCart(product)}
                                                    className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg transition"
                                                >
                                                    –
                                                </button>
                                                <span className="font-semibold text-gray-700">{qtyInCart}</span>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold w-full py-2 rounded-full shadow-md transition"
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>


                {/* Floating Checkout Button */}


                {/* YouTube Modal */}
                {selectedVideo && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl relative">
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-600"
                            >
                                ✕
                            </button>

                            <div className="aspect-video">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${extractYouTubeId(
                                        selectedVideo
                                    )}`}
                                    title="Product Video"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>


        </>
    );
}

