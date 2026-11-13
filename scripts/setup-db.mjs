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
      ["尚芳超級兌幣機(換10元)", "machine", 1, 30000, 10000, "尚芳兌幣機.jpg", "兌幣機.jpg", "5成新"],
      ["迷你兌幣機(換50)", "machine", 1, 18000, 12000, "陽升兌幣機.jpg", "迷你兌幣機.jpg", "6成新"],
      ["東匯150元開關(轉幣器)", "parts", 18, 1200, 600, "東匯原廠開關.jpg", null, ""],
      ["東匯200元開關(轉幣器)", "parts", 6, 1200, 600, "東匯原廠開關.jpg", null, ""],
      ["東匯三格扭蛋機(黑黃)", "machine", 6, 10000, 4000, "扭蛋機台-黑黃.jpg", null, "全收20000"],
      ["東匯三格扭蛋機(粉紅)", "machine", 2, 10000, 2000, "扭蛋機台-其他.jpg", null, "全收3000 (一台的鎖有故障)"],
      ["東匯三格扭蛋機(藍黃)", "machine", 2, 10000, 3000, "扭蛋機台-其他.jpg", null, "全收5000"],
      ["東匯二格扭蛋機(藍黃)", "machine", 1, 10000, 2000, "扭蛋機台-其他.jpg", null, ""],
      // --- 扭蛋商品 R1C1 ---
      ["迪士尼造型公仔夾P2", "gashapon", 38, 150, 60, "002203030 迪士尼造型公仔夾P2.jpg", null, "R1C1"],
      ["鬼滅之刃捏捏串連吊飾P3", "gashapon", 34, 150, 60, "002223004 鬼滅之刃捏捏串連吊飾P3.jpg", null, "R1C1"],
      ["皮克斯充電線公仔", "gashapon", 36, 150, 60, "002203088 皮克斯充電線公仔.jpg", null, "R1C1"],
      ["精靈寶可夢軟膠吊飾Ｐ22", "gashapon", 34, 150, 60, "002233198 精靈寶可夢軟膠吊飾Ｐ22.jpg", null, "R1C1"],
      ["迪士尼朋友Q版造型公仔", "gashapon", 22, 150, 60, "007712770_迪士尼朋友Q版造型公仔.jpg", null, "R1C1"],
      ["七龍珠超 UDM BURST 42", "gashapon", 3, 100, 50, "002202018 七龍珠超 UDM BURST 42.jpg", null, "R1C1"],
      // --- 扭蛋商品 R2C1 ---
      ["鬼滅之刃坐姿公仔P1", "gashapon", 20, 200, 80, "002204028 鬼滅之刃坐姿公仔P1.jpg", null, "R2C1"],
      ["麵包超人軟膠磁鐵", "gashapon", 34, 100, 40, "002232009 麵包超人軟膠磁鐵.jpg", null, "R2C1"],
      ["名偵探柯南公仔-柯南隊", "gashapon", 69, 200, 80, "002194021 名偵探柯南公仔-柯南隊.jpg", null, "R2C1"],
      ["哆啦A夢可動造型轉蛋", "gashapon", 37, 150, 60, "207361 哆啦A夢可動造型轉蛋.jpg", null, "R2C1"],
      ["可吉可吉X三麗鷗軟膠吊飾", "gashapon", 38, 150, 60, "002223228 可吉可吉X三麗鷗軟膠吊飾.jpg", null, "R2C1"],
      ["進擊的巨人 生日小蛋糕", "gashapon", 27, 200, 80, "035234018 進擊的巨人 生日小蛋糕.jpg", null, "R2C1"],
      // --- 扭蛋商品 R3C1 ---
      ["圓圓貓咪珠鍊吊飾-人氣貓咪大集合", "gashapon", 37, 60, 30, "001232019 圓圓貓咪珠鍊吊飾-人氣貓咪大集合.jpg", null, "R3C1"],
      ["SNOOPY爵士樂公仔", "gashapon", 26, 100, 50, "001193100 SNOOPY爵士樂公仔.jpg", null, "R3C1"],
      ["精靈寶可夢Q版造型公仔", "gashapon", 105, 150, 60, "002193172精靈寶可夢Q版造型公仔.jpg", null, "R3C1"],
      ["精靈寶可夢Q版造型公仔P4", "gashapon", 70, 150, 60, "002203123 精靈寶可夢Q版造型公仔P4.jpg", null, "R3C1"],
      ["史努比排隊公仔P2", "gashapon", 34, 150, 60, "002213184 史努比排隊公仔P2.jpg", null, "R3C1"],
      // --- 扭蛋商品 C7R1 ---
      ["動物大鬧便利商店坐姿公仔", "gashapon", 21, 100, 40, "001213007 動物大鬧便利商店坐姿公仔.jpg", null, "C7R1"],
      ["庫洛魔法使充電線公仔", "gashapon", 28, 150, 60, "002203112 庫洛魔法使充電線公仔.jpg", null, "C7R1"],
      ["光之美少女吊飾SP", "gashapon", 21, 150, 60, "002233252 美味PARTY光之美少女吊飾SP.jpg", null, "C7R1"],
      // --- 扭蛋商品 C7R2 ---
      ["SNOOPY公仔", "gashapon", 10, 100, 50, "001203120 SNOOPY公仔.jpg", null, "C7R2"],
      ["玩具總動員疊疊公仔吊飾P2", "gashapon", 31, 100, 50, "001223160 玩具總動員疊疊公仔吊飾P2.jpg", null, "C7R2"],
      ["精靈寶可夢扁扁公仔吊飾-一般屬性篇", "gashapon", 29, 60, 30, "001232016 精靈寶可夢扁扁公仔吊飾-一般屬性篇.jpg", null, "C7R2"],
      ["精靈寶可夢扁扁公仔吊飾-鬼屬性篇", "gashapon", 30, 60, 30, "001232024 精靈寶可夢扁扁公仔吊飾-鬼屬性篇.jpg", null, "C7R2"],
      ["邊緣午後休息-貓咪篇P2", "gashapon", 18, 60, 30, "024232105 邊緣午後休息-貓咪篇P2.jpg", null, "C7R2"],
      // --- 扭蛋商品 C7R3 ---
      ["夏目友人帳粿子吊飾", "gashapon", 4, 60, 30, "001232010 夏目友人帳粿子吊飾.jpg", null, "C7R3"],
      ["貪吃可愛動物們", "gashapon", 13, 60, 30, "001212060 貪吃可愛動物們.jpg", null, "C7R3"],
      ["三麗鷗扁扁公仔吊飾-白隊篇", "gashapon", 20, 60, 30, "001222019 三麗鷗扁扁公仔吊飾-白隊篇.jpg", null, "C7R3"],
      ["精靈寶可夢大頭戒指P4", "gashapon", 38, 60, 30, "001232021 精靈寶可夢大頭戒指P4.jpg", null, "C7R3"],
      ["圓眼水族館造型筆袋", "gashapon", 40, 60, 30, "024232119 圓眼水族館造型筆袋.jpg", null, "C7R3"],
      // --- 扭蛋商品 蠟筆小新區 ---
      ["蠟筆小新軟膠磁鐵P2", "gashapon", 23, 100, 40, "002232012 蠟筆小新軟膠磁鐵P2.jpg", null, "蠟筆小新區"],
      ["小熊維尼手牽手公仔", "gashapon", 15, 120, 48, "CA06093 T-ARTS 小熊維尼手牽手公仔.jpg", null, "蠟筆小新區"],
      ["天竺鼠車車排隊人偶", "gashapon", 18, 150, 60, "BD66085天竺鼠車車排隊人偶.jpg", null, "蠟筆小新區"],
      ["哈姆太郎排隊人偶", "gashapon", 15, 150, 60, "BD63339 哈姆太郎排隊人偶.jpg", null, "蠟筆小新區"],
      ["蠟筆小新軟膠造型夾P2", "gashapon", 40, 150, 66, "002243002 蠟筆小新軟膠造型夾P2.jpg", null, "蠟筆小新區"],
      ["怪獸電力公司躲貓貓公仔", "gashapon", 11, 200, 80, "001224034 怪獸電力公司躲貓貓公仔.jpg", null, "蠟筆小新區"],
      ["蠟筆小新Q版造型公仔", "gashapon", 38, 150, 60, "002193187蠟筆小新Q版造型公仔.jpg", null, "蠟筆小新區"],
      ["精靈寶可夢大頭戒指P3", "gashapon", 50, 60, 30, "001232011 精靈寶可夢大頭戒指P3.jpg", null, "蠟筆小新區"],
      ["精靈寶可夢 寶貝球造型零錢包", "gashapon", 37, 150, 60, "BD362418 精靈寶可夢 寶貝球造型零錢包.jpg", null, "蠟筆小新區"],
      ["三麗鷗角色環保扭蛋第4彈", "gashapon", 18, 150, 60, "000007236三麗鷗角色環保扭蛋第 4 彈.jpg", null, "蠟筆小新區"],
      ["進擊的巨人THE FINAL SEASON等待中軟膠吊飾", "gashapon", 40, 150, 66, "002233119 進擊的巨人THE FINAL SEASON等待中軟膠吊飾.jpg", null, "蠟筆小新區"],
      ["七龍珠超Q版造型公仔04", "gashapon", 32, 150, 70, "002203028 七龍珠超Q版造型公仔04.jpg", null, "蠟筆小新區"],
      // --- 扭蛋商品 多啦A夢區 ---
      ["多啦A夢 雙面印花環保袋", "gashapon", 38, 250, 100, "1000151653哆啦A夢環保袋.jpg", null, "多啦A夢區"],
      ["哆啦A夢造型小物包P2", "gashapon", 73, 150, 60, "002193054哆啦A夢造型小物包P2.jpg", null, "多啦A夢區"],
      ["哆啦A夢 充氣飲料架", "gashapon", 14, 150, 60, "000009515哆啦A夢 充氣飲料架.jpg", null, "多啦A夢區"],
      ["哆啦A夢軟膠公仔P6", "gashapon", 17, 150, 60, "002213202 哆啦A夢軟膠公仔P6.jpg", null, "多啦A夢區"],
      ["哆啦A夢悄悄話公仔", "gashapon", 29, 200, 80, "001234005哆啦A夢悄悄話公仔.jpg", null, "多啦A夢區"],
      ["哆啦A夢熟睡公仔", "gashapon", 29, 200, 80, "001234005哆啦A夢熟睡公仔.jpg", null, "多啦A夢區"],
      // --- 扭蛋商品 新增 ---
      ["鬼滅之刃等待中公仔", "gashapon", 15, 250, 100, "1000178177_鬼滅之刃等待中公仔.jpg", null, ""],
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
