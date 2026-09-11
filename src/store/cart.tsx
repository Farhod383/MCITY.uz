import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Product } from "@/data/catalog";
import { useCatalog } from "@/data/useCatalog";

export interface CartItem {
  productId: string;
  qty: number;
}

interface Ctx {
  items: CartItem[];
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  detailed: { product: Product; qty: number }[];
  totalUzs: number;
  open: boolean;
  setOpen: (o: boolean) => void;
}

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("cart");
    if (raw) {
      try { setItems(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add = (id: string, qty = 1) =>
    setItems((prev) => {
      const ex = prev.find((i) => i.productId === id);
      if (ex) return prev.map((i) => (i.productId === id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { productId: id, qty }];
    });
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.productId !== id));
  const setQty = (id: string, qty: number) =>
    setItems((prev) => prev.map((i) => (i.productId === id ? { ...i, qty: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);

  const detailed = useMemo(
    () =>
      items
        .map((i) => {
          const product = products.find((p) => p.id === i.productId);
          return product ? { product, qty: i.qty } : null;
        })
        .filter(Boolean) as { product: Product; qty: number }[],
    [items, products],
  );

  const count = items.reduce((a, i) => a + i.qty, 0);
  const totalUzs = detailed.reduce((a, d) => a + (d.product.priceUzs ?? 0) * d.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, detailed, totalUzs, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}