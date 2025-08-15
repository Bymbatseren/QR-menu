import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  tableCode: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  total: number;
  status: "pending" | "in_progress" | "served" | "paid";
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  tableCode: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ["pending","in_progress","served","paid"], default: "pending" },
  createdAt: { type: Date, default: () => new Date() },
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
