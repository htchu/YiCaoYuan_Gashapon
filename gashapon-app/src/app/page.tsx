"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  original_price: number;
  sale_price: number;
  photo1: string | null;
  photo2: string | null;
  description: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const categoryLabels: Record<string, string> = {
  machine: "扭蛋機 / 兌幣機",
  parts: "零件 / 轉幣器",
  gashapon: "扭蛋商品",
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [showCheckout, setShowCheckout] = useState(false);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<number | null>(null);
  const [preview, setPreview] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { product, quantity: product.quantity }];
    });
  };

  const updateCartQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((c) =>
          c.product.id === productId ? { ...c, quantity: qty } : c
        )
      );
    }
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const cartTotal = cart.reduce(
    (s, c) => s + c.product.sale_price * c.quantity,
    0
  );

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const filtered =
    filter === "all"
      ? products
      : products.filter((p) => p.category === filter);

  const grouped = filtered.reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<string, Product[]>
  );

  const handleSubmit = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert("請輸入有效的Email地址");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          note,
          items: cart.map((c) => ({
            product_id: c.product.id,
            quantity: c.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(data.id);
        setCart([]);
        setShowCheckout(false);
        setShowCart(false);
      } else {
        alert(data.error || "提交失敗");
      }
    } catch {
      alert("網路錯誤，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center p-8">
        <div className="text-6xl mb-4 text-green-500">&#10003;</div>
        <h1 className="text-2xl font-bold mb-4">意向書已送出！</h1>
        <p className="text-gray-600 mb-2">意向書編號：#{submitted}</p>
        <p className="text-gray-600 mb-6">
          確認信已寄送至 {email}，感謝您的購買意向！
        </p>
        <div className="space-x-4">
          <button
            onClick={() => {
              setSubmitted(null);
              setEmail("");
              setNote("");
            }}
            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600"
          >
            繼續選購
          </button>
          <Link
            href={`/lookup?email=${encodeURIComponent(email)}`}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 inline-block"
          >
            查看意向書
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-amber-500 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">一草園扭蛋出清</h1>
            <p className="text-amber-100 text-sm">購買意向書</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/lookup"
              className="text-amber-100 hover:text-white text-sm"
            >
              查詢意向書
            </Link>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              購物車
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 py-2 overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === "all" ? "bg-amber-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            全部
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === key ? "bg-amber-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Product listing */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-amber-700 border-b-2 border-amber-200 pb-2">
              {categoryLabels[cat] || cat}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((p) => {
                const inCart = cart.find((c) => c.product.id === p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div
                      className="aspect-square relative bg-gray-100 cursor-pointer"
                      onClick={() => setPreview(p)}
                    >
                      {p.photo1 ? (
                        <Image
                          src={`/products/${encodeURIComponent(p.photo1)}`}
                          alt={p.name}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          無照片
                        </div>
                      )}
                      {p.original_price > p.sale_price && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                          {Math.round((p.sale_price / p.original_price) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h3 className="text-sm font-medium leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
                        {p.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-red-600 font-bold">
                          ${p.sale_price}
                        </span>
                        {p.original_price > p.sale_price && (
                          <span className="text-gray-400 text-xs line-through">
                            ${p.original_price}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        庫存 {p.quantity} · {p.description || ""}
                      </p>
                      {inCart ? (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() =>
                              updateCartQty(p.id, inCart.quantity - 1)
                            }
                            className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQty(
                                p.id,
                                Math.min(inCart.quantity + 1, p.quantity)
                              )
                            }
                            className="w-7 h-7 rounded bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(p)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm py-1.5 rounded"
                        >
                          加入購物車
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Image preview modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold">{preview.name}</h3>
                <button
                  onClick={() => setPreview(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="flex gap-4 mb-4">
                {preview.photo1 && (
                  <div className="flex-1 relative aspect-square bg-gray-100 rounded">
                    <Image
                      src={`/products/${encodeURIComponent(preview.photo1)}`}
                      alt={preview.name}
                      fill
                      className="object-contain p-2"
                      sizes="50vw"
                    />
                  </div>
                )}
                {preview.photo2 && (
                  <div className="flex-1 relative aspect-square bg-gray-100 rounded">
                    <Image
                      src={`/products/${encodeURIComponent(preview.photo2)}`}
                      alt={preview.name}
                      fill
                      className="object-contain p-2"
                      sizes="50vw"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">原價：</span>
                  <span className="line-through">${preview.original_price}</span>
                </p>
                <p>
                  <span className="text-gray-500">出清價：</span>
                  <span className="text-red-600 font-bold text-lg">
                    ${preview.sale_price}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">庫存：</span>
                  {preview.quantity}
                </p>
                {preview.description && (
                  <p>
                    <span className="text-gray-500">說明：</span>
                    {preview.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  addToCart(preview);
                  setPreview(null);
                }}
                className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg"
              >
                加入購物車
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCart(false)}
          />
          <div className="relative bg-white w-full max-w-md h-full overflow-auto shadow-xl">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold">購物車 ({cartCount})</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            {cart.length === 0 ? (
              <div className="p-8 text-center text-gray-400">購物車是空的</div>
            ) : (
              <>
                <div className="p-4 space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 items-start border-b pb-3"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded relative flex-shrink-0">
                        {item.product.photo1 && (
                          <Image
                            src={`/products/${encodeURIComponent(item.product.photo1)}`}
                            alt={item.product.name}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-red-600 text-sm font-bold">
                          ${item.product.sale_price}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() =>
                              updateCartQty(
                                item.product.id,
                                item.quantity - 1
                              )
                            }
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateCartQty(
                                item.product.id,
                                Math.min(
                                  item.quantity + 1,
                                  item.product.quantity
                                )
                              )
                            }
                            className="w-6 h-6 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="ml-auto text-gray-400 hover:text-red-500 text-xs"
                          >
                            移除
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-right">
                        ${item.product.sale_price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t sticky bottom-0 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">意向總金額</span>
                    <span className="text-xl font-bold text-red-600">
                      ${cartTotal}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold"
                  >
                    填寫意向書
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto p-6">
            <h2 className="text-xl font-bold mb-4">送出購買意向書</h2>
            <div className="mb-4">
              <h3 className="font-medium mb-2">購買品項：</h3>
              <div className="bg-gray-50 rounded p-3 space-y-1 text-sm max-h-40 overflow-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      ${item.product.sale_price * item.quantity}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-1 font-bold flex justify-between">
                  <span>合計</span>
                  <span className="text-red-600">${cartTotal}</span>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Gmail 帳號 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@gmail.com"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                用於接收確認信及查詢意向書
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                備註 (選填)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="如有特殊需求請在此說明..."
                className="w-full border rounded-lg px-3 py-2 h-20 resize-none focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg"
              >
                返回
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg font-bold disabled:opacity-50"
              >
                {submitting ? "送出中..." : "確認送出"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              此為購買意向書，非正式訂單
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
