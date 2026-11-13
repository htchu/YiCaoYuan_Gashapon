import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: "ep-aged-wind-bcvpixh0-pooler.c-16.us-east-1.aws.neon.tech",
  user: "neondb_owner",
  database: "neondb",
  password: "npg_Wyx4Ud7RtOpe",
  ssl: { rejectUnauthorized: false },
});

async function setup() {
  const client = await pool.connect();
  try {
    // Create tables
    await client.query(`
      DROP TABLE IF EXISTS intent_items CASCADE;
      DROP TABLE IF EXISTS intent_forms CASCADE;
      DROP TABLE IF EXISTS products CASCADE;

      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'gashapon',
        quantity INT NOT NULL,
        original_price INT NOT NULL,
        sale_price INT NOT NULL,
        photo1 TEXT,
        photo2 TEXT,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE intent_forms (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        customer_name TEXT,
        phone TEXT,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE intent_items (
        id SERIAL PRIMARY KEY,
        intent_form_id INT NOT NULL REFERENCES intent_forms(id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(id),
        quantity INT NOT NULL DEFAULT 1
      );
    `);
    console.log("Tables created.");

    // Seed products
    const products = [
      // --- 機台 / 零件 ---
      ["尚芳超級兌幣機(換10元)", "machine", 1, 30000, 10000, "p1.jpg", "p2.jpg", "5成新"],
      ["迷你兌幣機(換50)", "machine", 1, 18000, 12000, "p3.jpg", "p4.jpg", "6成新"],
      ["東匯150元開關(轉幣器)", "parts", 18, 1200, 600, "p5.jpg", null, ""],
      ["東匯200元開關(轉幣器)", "parts", 6, 1200, 600, "p5.jpg", null, ""],
      ["東匯三格扭蛋機(黑黃)", "machine", 6, 10000, 4000, "p6.jpg", null, "全收20000"],
      ["東匯三格扭蛋機(粉紅)", "machine", 2, 10000, 2000, "p7.jpg", null, "全收3000 (一台的鎖有故障)"],
      ["東匯三格扭蛋機(藍黃)", "machine", 2, 10000, 3000, "p7.jpg", null, "全收5000"],
      ["東匯二格扭蛋機(藍黃)", "machine", 1, 10000, 2000, "p7.jpg", null, ""],
      // --- 扭蛋商品 R1C1 ---
      ["迪士尼造型公仔夾P2", "gashapon", 38, 150, 60, "p8.jpg", null, "R1C1"],
      ["鬼滅之刃捏捏串連吊飾P3", "gashapon", 34, 150, 60, "p9.jpg", null, "R1C1"],
      ["皮克斯充電線公仔", "gashapon", 36, 150, 60, "p10.jpg", null, "R1C1"],
      ["精靈寶可夢軟膠吊飾Ｐ22", "gashapon", 34, 150, 60, "p11.jpg", null, "R1C1"],
      ["迪士尼朋友Q版造型公仔", "gashapon", 22, 150, 60, "p12.jpg", null, "R1C1"],
      ["七龍珠超 UDM BURST 42", "gashapon", 3, 100, 50, "p13.jpg", null, "R1C1"],
      // --- 扭蛋商品 R2C1 ---
      ["鬼滅之刃坐姿公仔P1", "gashapon", 20, 200, 80, "p14.jpg", null, "R2C1"],
      ["麵包超人軟膠磁鐵", "gashapon", 34, 100, 40, "p15.jpg", null, "R2C1"],
      ["名偵探柯南公仔-柯南隊", "gashapon", 69, 200, 80, "p16.jpg", null, "R2C1"],
      ["哆啦A夢可動造型轉蛋", "gashapon", 37, 150, 60, "p17.jpg", null, "R2C1"],
      ["可吉可吉X三麗鷗軟膠吊飾", "gashapon", 38, 150, 60, "p18.jpg", null, "R2C1"],
      ["進擊的巨人 生日小蛋糕", "gashapon", 27, 200, 80, "p19.jpg", null, "R2C1"],
      // --- 扭蛋商品 R3C1 ---
      ["圓圓貓咪珠鍊吊飾-人氣貓咪大集合", "gashapon", 37, 60, 30, "p20.jpg", null, "R3C1"],
      ["SNOOPY爵士樂公仔", "gashapon", 26, 100, 50, "p21.jpg", null, "R3C1"],
      ["精靈寶可夢Q版造型公仔", "gashapon", 105, 150, 60, "p22.jpg", null, "R3C1"],
      ["精靈寶可夢Q版造型公仔P4", "gashapon", 70, 150, 60, "p23.jpg", null, "R3C1"],
      ["史努比排隊公仔P2", "gashapon", 34, 150, 60, "p24.jpg", null, "R3C1"],
      // --- 扭蛋商品 C7R1 ---
      ["動物大鬧便利商店坐姿公仔", "gashapon", 21, 100, 40, "p25.jpg", null, "C7R1"],
      ["庫洛魔法使充電線公仔", "gashapon", 28, 150, 60, "p26.jpg", null, "C7R1"],
      ["光之美少女吊飾SP", "gashapon", 21, 150, 60, "p27.jpg", null, "C7R1"],
      // --- 扭蛋商品 C7R2 ---
      ["SNOOPY公仔", "gashapon", 10, 100, 50, "p28.jpg", null, "C7R2"],
      ["玩具總動員疊疊公仔吊飾P2", "gashapon", 31, 100, 50, "p29.jpg", null, "C7R2"],
      ["精靈寶可夢扁扁公仔吊飾-一般屬性篇", "gashapon", 29, 60, 30, "p30.jpg", null, "C7R2"],
      ["精靈寶可夢扁扁公仔吊飾-鬼屬性篇", "gashapon", 30, 60, 30, "p31.jpg", null, "C7R2"],
      ["邊緣午後休息-貓咪篇P2", "gashapon", 18, 60, 30, "p32.jpg", null, "C7R2"],
      // --- 扭蛋商品 C7R3 ---
      ["夏目友人帳粿子吊飾", "gashapon", 4, 60, 30, "p33.jpg", null, "C7R3"],
      ["貪吃可愛動物們", "gashapon", 13, 60, 30, "p34.jpg", null, "C7R3"],
      ["三麗鷗扁扁公仔吊飾-白隊篇", "gashapon", 20, 60, 30, "p35.jpg", null, "C7R3"],
      ["精靈寶可夢大頭戒指P4", "gashapon", 38, 60, 30, "p36.jpg", null, "C7R3"],
      ["圓眼水族館造型筆袋", "gashapon", 40, 60, 30, "p37.jpg", null, "C7R3"],
      // --- 扭蛋商品 蠟筆小新區 ---
      ["蠟筆小新軟膠磁鐵P2", "gashapon", 23, 100, 40, "p38.jpg", null, "蠟筆小新區"],
      ["小熊維尼手牽手公仔", "gashapon", 15, 120, 48, "p39.jpg", null, "蠟筆小新區"],
      ["天竺鼠車車排隊人偶", "gashapon", 18, 150, 60, "p40.jpg", null, "蠟筆小新區"],
      ["哈姆太郎排隊人偶", "gashapon", 15, 150, 60, "p41.jpg", null, "蠟筆小新區"],
      ["蠟筆小新軟膠造型夾P2", "gashapon", 40, 150, 66, "p42.jpg", null, "蠟筆小新區"],
      ["怪獸電力公司躲貓貓公仔", "gashapon", 11, 200, 80, "p43.jpg", null, "蠟筆小新區"],
      ["蠟筆小新Q版造型公仔", "gashapon", 38, 150, 60, "p44.jpg", null, "蠟筆小新區"],
      ["精靈寶可夢大頭戒指P3", "gashapon", 50, 60, 30, "p45.jpg", null, "蠟筆小新區"],
      ["精靈寶可夢 寶貝球造型零錢包", "gashapon", 37, 150, 60, "p46.jpg", null, "蠟筆小新區"],
      ["三麗鷗角色環保扭蛋第4彈", "gashapon", 18, 150, 60, "p47.jpg", null, "蠟筆小新區"],
      ["進擊的巨人THE FINAL SEASON等待中軟膠吊飾", "gashapon", 40, 150, 66, "p48.jpg", null, "蠟筆小新區"],
      ["七龍珠超Q版造型公仔04", "gashapon", 32, 150, 70, "p49.jpg", null, "蠟筆小新區"],
      // --- 扭蛋商品 多啦A夢區 ---
      ["多啦A夢 雙面印花環保袋", "gashapon", 38, 250, 100, "p50.jpg", null, "多啦A夢區"],
      ["哆啦A夢造型小物包P2", "gashapon", 73, 150, 60, "p51.jpg", null, "多啦A夢區"],
      ["哆啦A夢 充氣飲料架", "gashapon", 14, 150, 60, "p52.jpg", null, "多啦A夢區"],
      ["哆啦A夢軟膠公仔P6", "gashapon", 17, 150, 60, "p53.jpg", null, "多啦A夢區"],
      ["哆啦A夢悄悄話公仔", "gashapon", 29, 200, 80, "p54.jpg", null, "多啦A夢區"],
      ["哆啦A夢熟睡公仔", "gashapon", 29, 200, 80, "p55.jpg", null, "多啦A夢區"],
      // --- 扭蛋商品 新增 ---
      ["鬼滅之刃等待中公仔", "gashapon", 15, 250, 100, "p56.jpg", null, ""],
    ];

    for (const p of products) {
      await client.query(
        `INSERT INTO products (name, category, quantity, original_price, sale_price, photo1, photo2, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        p
      );
    }
    console.log(`Seeded ${products.length} products.`);
  } finally {
    client.release();
    await pool.end();
  }
}

setup().catch(console.error);
