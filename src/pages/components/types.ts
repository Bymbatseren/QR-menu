export type Status = "pending" | "in_progress" | "served" | "paid";

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  img: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  _id: string;
  tableCode: string;
  items: CartItem[];
  total: number;
  status: Status;
  createdAt?: string;
}


