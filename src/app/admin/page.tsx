"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ProductSummary {
  id: number;
  name: string;
  stock: number;
  sale_price: number;
  total_demand: number;
  form_count: number;
}

interface IntentItem {
  qty: number;
  product_id: number;
  name: string;
  sale_price: number;
}

interface IntentForm {
  id: number;
  email: string;
  customer_name: string | null;
  phone: string | null;
  note: string | null;
  created_at: string;
  items: IntentItem[];
}

export default function AdminPage() {
  const [forms, setForms] = useState<IntentForm[]>([]);
  const [productSummary, setProductSummary] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"forms" | "summary">("summary");

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then((data) => {
        setForms(data.forms);
        setProductSummary(data.productSummary);
        setLoading(false);
      });
  }, []);

  const totalRevenue = forms.reduce(
    (s, f) => s + f.items.reduce((ss, i) => ss + i.qty * i.sale_price, 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">管理後台</h1>
            <p className="text-gray-400 text-sm">一草園扭蛋出清</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            前台
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">意向書總數</div>
            <div className="text-3xl font-bold">{forms.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">意向總金額</div>
            <div className="text-3xl font-bold text-red-600">
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">有需求的商品數</div>
            <div className="text-3xl font-bold">
              {productSummary.filter((p) => p.total_demand > 0).length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab("summary")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "summary" ? "bg-gray-800 text-white" : "bg-white hover:bg-gray-100"}`}
          >
            商品需求總覽
          </button>
          <button
            onClick={() => setTab("forms")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "forms" ? "bg-gray-800 text-white" : "bg-white hover:bg-gray-100"}`}
          >
            意向書列表
          </button>
        </div>

        {tab === "summary" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3">商品名稱</th>
                    <th className="text-center px-4 py-3">庫存</th>
                    <th className="text-center px-4 py-3">出清價</th>
                    <th className="text-center px-4 py-3">意向總數量</th>
                    <th className="text-center px-4 py-3">意向書數</th>
                    <th className="text-center px-4 py-3">意向金額</th>
                    <th className="text-center px-4 py-3">需求/庫存</th>
                  </tr>
                </thead>
                <tbody>
                  {productSummary.map((p) => {
                    const ratio = p.stock > 0 ? p.total_demand / p.stock : 0;
                    return (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{p.name}</td>
                        <td className="text-center px-4 py-2">{p.stock}</td>
                        <td className="text-center px-4 py-2">
                          ${p.sale_price}
                        </td>
                        <td className="text-center px-4 py-2 font-bold">
                          {p.total_demand}
                        </td>
                        <td className="text-center px-4 py-2">
                          {p.form_count}
                        </td>
                        <td className="text-center px-4 py-2">
                          ${(p.total_demand * p.sale_price).toLocaleString()}
                        </td>
                        <td className="text-center px-4 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              ratio > 1
                                ? "bg-red-100 text-red-700"
                                : ratio > 0.5
                                  ? "bg-amber-100 text-amber-700"
                                  : ratio > 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {ratio === 0
                              ? "無需求"
                              : `${Math.round(ratio * 100)}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "forms" && (
          <div className="space-y-4">
            {forms.map((form) => {
              const total = form.items.reduce(
                (s, i) => s + i.qty * i.sale_price,
                0
              );
              return (
                <div key={form.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-bold">#{form.id}</span>
                      {form.customer_name && (
                        <span className="font-medium">{form.customer_name}</span>
                      )}
                      {form.phone && (
                        <span className="text-gray-600">{form.phone}</span>
                      )}
                      <span className="text-blue-600">{form.email}</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(form.created_at).toLocaleString("zh-TW")}
                      </span>
                    </div>
                    <span className="font-bold text-red-600">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <tbody>
                        {form.items.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-1.5">{item.name}</td>
                            <td className="py-1.5 text-center text-gray-500">
                              x{item.qty}
                            </td>
                            <td className="py-1.5 text-right">
                              ${item.qty * item.sale_price}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {form.note && (
                      <p className="mt-2 text-sm text-gray-500">
                        備註：{form.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {forms.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                尚無意向書
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
