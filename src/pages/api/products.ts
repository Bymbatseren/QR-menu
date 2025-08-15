import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import products from "@/models/product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
await connectToDatabase()

  if (req.method === "GET") {
    const product = await products.find().sort({ createdAt: -1 });
    return res.status(200).json(products);
  }

  if (req.method === "POST") {
    const { name, price, categoryId, img } = req.body;
    const product = new products({ name, price, categoryId, img });
    const saved = await product.save();
    return res.status(201).json(saved);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
