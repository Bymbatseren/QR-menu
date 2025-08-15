import { Category, Product, Order, Status } from "./types";

// Categories
export const CATEGORIES: Category[] = [
  { id: "c1", name: "🍻 Ундаа" },
  { id: "c2", name: "🍟 Хоол/Закуска" },
  { id: "c3", name: "☕ Кофе/Бусад" },
];

// Products
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Beer 500ml", price: 6500, categoryId: "c1", img: "https://placehold.co/80x80" },
  { id: "p2", name: "Mojito", price: 8000, categoryId: "c1", img: "https://placehold.co/80x80" },
  { id: "p3", name: "Fries", price: 4500, categoryId: "c2", img: "https://placehold.co/80x80" },
  { id: "p4", name: "Chicken Wings", price: 12000, categoryId: "c2", img: "https://placehold.co/80x80" },
  { id: "p5", name: "Americano", price: 6000, categoryId: "c3", img: "https://placehold.co/80x80" },
];

// Seed orders for StaffScreen demo
export function demoSeedOrders(): Order[] {
  return [
    {
      id: 104,
      tableCode: "T12",
      items: [
        { productId: "p1", name: "Beer 500ml", price: 6500, qty: 2 },
        { productId: "p3", name: "Fries", price: 4500, qty: 1 },
      ],
      total: 17500,
      status: Status.PENDING,
    },
    {
      id: 103,
      tableCode: "T5",
      items: [{ productId: "p2", name: "Mojito", price: 8000, qty: 1 }],
      total: 8000,
      status: Status.IN_PROGRESS,
    },
    {
      id: 101,
      tableCode: "T3",
      items: [{ productId: "p5", name: "Americano", price: 6000, qty: 1 }],
      total: 6000,
      status: Status.SERVED,
    },
  ];
}
