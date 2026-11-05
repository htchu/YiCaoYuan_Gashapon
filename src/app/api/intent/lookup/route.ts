import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "請提供Email" }, { status: 400 });
  }

  const { rows: forms } = await pool.query(
    "SELECT * FROM intent_forms WHERE email = $1 ORDER BY created_at DESC",
    [email]
  );

  const results = [];
  for (const form of forms) {
    const { rows: items } = await pool.query(
      `SELECT ii.quantity as qty, p.name, p.sale_price, p.photo1
       FROM intent_items ii JOIN products p ON p.id = ii.product_id
       WHERE ii.intent_form_id = $1`,
      [form.id]
    );
    results.push({ ...form, items });
  }

  return NextResponse.json(results);
}
