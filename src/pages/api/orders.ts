import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === "GET") {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(orders);
  }

  if (req.method === "POST") {
    try {
      const { tableCode, items } = req.body;

      if (!tableCode || !items || !Array.isArray(items) || !items.length) {
        return res.status(400).json({ error: "tableCode болон items шаардлагатай" });
      }

      const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

      const order = await Order.create({
        tableCode,
        items,
        total,
        status: "pending",
      });

      return res.status(201).json(order);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

