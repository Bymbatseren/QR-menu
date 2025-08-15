import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const ADMIN_PIN = process.env.ADMIN_PIN || "1234";
const SECRET = process.env.JWT_SECRET || "secret";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(401).json({ message: "PIN буруу" });

  const token = jwt.sign({ role: "staff" }, SECRET, { expiresIn: "7d" });
  res.status(200).json({ token });
}
