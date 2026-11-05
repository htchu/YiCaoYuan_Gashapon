import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  // All intent forms with items
  const { rows: forms } = await pool.query(
    "SELECT * FROM intent_forms ORDER BY created_at DESC"
  );

  const formsWithItems = [];
  for (const form of forms) {
    const { rows: items } = await pool.query(
      `SELECT ii.quantity as qty, ii.product_id, p.name, p.sale_price
       FROM intent_items ii JOIN products p ON p.id = ii.product_id
       WHERE ii.intent_form_id = $1`,
      [form.id]
    );
    formsWithItems.push({ ...form, items });
  }

  // Aggregated product demand
  const { rows: productSummary } = await pool.query(
    `SELECT p.id, p.name, p.quantity as stock, p.sale_price,
            COALESCE(SUM(ii.quantity), 0)::int as total_demand,
            COUNT(DISTINCT ii.intent_form_id)::int as form_count
     FROM products p
     LEFT JOIN intent_items ii ON ii.product_id = p.id
     GROUP BY p.id
     ORDER BY total_demand DESC`
  );

  return NextResponse.json({ forms: formsWithItems, productSummary });
}
