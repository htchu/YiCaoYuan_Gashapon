"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface IntentItem {
  qty: number;
  name: string;
  sale_price: number;
  photo1: string | null;
}

interface IntentForm {
  id: number;
  email: string;
  note: string | null;
  created_at: string;
  items: IntentItem[];
}

function LookupContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [forms, setForms] = useState<IntentForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get("email")) {
      handleSearch(searchParams.get("email")!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (searchEmail?: string) => {
    const e = searchEmail || email;
    if (!e) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/intent/lookup?email=${encodeURIComponent(e)}`);
      const data = await res.json();
      setForms(data);
    } catch {
      alert("查詢失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-amber-500 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">查詢意向書</h1>
          <Link href="/" className="text-amber-100 hover:text-white text-sm">
            回到商品列表
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-2">
            請輸入您的 Gmail 帳號查詢
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="your@gmail.com"
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? "查詢中..." : "查詢"}
            </button>
          </div>
        </div>

        {searched && !loading && forms.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            查無此 Email 的意向書紀錄
          </div>
        )}

        {forms.map((form) => {
          const total = form.items.reduce(
            (s, i) => s + i.qty * i.sale_price,
            0
          );
          return (
            <div key={form.id} className="bg-white rounded-lg shadow mb-4 overflow-hidden">
              <div className="bg-amber-50 px-4 py-3 border-b flex justify-between items-center">
                <div>
                  <span className="font-bold">意向書 #{form.id}</span>
                  <span className="text-gray-500 text-sm ml-3">
                    {new Date(form.created_at).toLocaleString("zh-TW")}
                  </span>
                </div>
                <span className="font-bold text-red-600">${total}</span>
              </div>
              <div className="p-4 space-y-2">
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 bg-gray-100 rounded relative flex-shrink-0">
                      {item.photo1 && (
                        <Image
                          src={`/products/${encodeURIComponent(item.photo1)}`}
                          alt={item.name}
                          fill
                          className="object-contain"
                          sizes="40px"
                        />
                      )}
                    </div>
                    <span className="flex-1">{item.name}</span>
                    <span className="text-gray-500">x{item.qty}</span>
                    <span className="font-medium w-20 text-right">
                      ${item.qty * item.sale_price}
                    </span>
                  </div>
                ))}
              </div>
              {form.note && (
                <div className="px-4 pb-3 text-sm text-gray-500">
                  備註：{form.note}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense>
      <LookupContent />
    </Suspense>
  );
}
