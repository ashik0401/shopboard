import fs from "fs";
import path from "path";

export async function POST(req) {
  const body = await req.json();
  const filePath = path.join(process.cwd(), "src/api/productsData.json");
  const products = JSON.parse(fs.readFileSync(filePath));
  products.push({ ...body, id: Date.now() });
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function GET() {
  const filePath = path.join(process.cwd(), "src/api/productsData.json");
  const products = JSON.parse(fs.readFileSync(filePath));
  return new Response(JSON.stringify(products), { status: 200 });
}
