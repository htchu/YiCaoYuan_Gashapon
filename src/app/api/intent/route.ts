import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { email, customer_name, phone, items, note } = await req.json();

  if (!email || !items || items.length === 0) {
    return NextResponse.json({ error: "請填寫Email及至少選擇一項商品" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "INSERT INTO intent_forms (email, customer_name, phone, note) VALUES ($1, $2, $3, $4) RETURNING id",
      [email, customer_name || null, phone || null, note || null]
    );
    const formId = rows[0].id;

    for (const item of items) {
      await client.query(
        "INSERT INTO intent_items (intent_form_id, product_id, quantity) VALUES ($1, $2, $3)",
        [formId, item.product_id, item.quantity]
      );
    }
    await client.query("COMMIT");

    // Fetch full details for email
    const { rows: details } = await client.query(
      `SELECT ii.quantity as qty, p.name, p.sale_price
       FROM intent_items ii JOIN products p ON p.id = ii.product_id
       WHERE ii.intent_form_id = $1`,
      [formId]
    );

    const totalAmount = details.reduce((s, d) => s + d.qty * d.sale_price, 0);
    const itemsHtml = details
      .map(
        (d) =>
          `<tr><td style="padding:4px 8px;border:1px solid #ddd">${d.name}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:center">${d.qty}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right">$${d.sale_price}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right">$${d.qty * d.sale_price}</td></tr>`
      )
      .join("");

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "一草園扭蛋出清 <onboarding@resend.dev>",
        to: email,
        subject: `購買意向書確認 #${formId}`,
        html: `
          <h2>一草園扭蛋出清 - 購買意向書</h2>
          <p>感謝您提交購買意向書！以下是您的意向品項：</p>
          <table style="border-collapse:collapse;width:100%">
            <tr style="background:#f0f0f0">
              <th style="padding:4px 8px;border:1px solid #ddd">品項</th>
              <th style="padding:4px 8px;border:1px solid #ddd">數量</th>
              <th style="padding:4px 8px;border:1px solid #ddd">單價</th>
              <th style="padding:4px 8px;border:1px solid #ddd">小計</th>
            </tr>
            ${itemsHtml}
          </table>
          <p style="font-size:18px;font-weight:bold">意向總金額：$${totalAmount}</p>
          ${note ? `<p>備註：${note}</p>` : ""}
          <p style="color:#888;font-size:12px">此為購買意向書，非正式訂單。我們會儘快與您聯繫確認。</p>
        `,
      });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    return NextResponse.json({ id: formId, message: "意向書已送出" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  } finally {
    client.release();
  }
}
