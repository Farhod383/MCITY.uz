import { Link } from "@tanstack/react-router";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useLang } from "@/i18n/LanguageContext";

export function CartSheet() {
  const { open, setOpen, detailed, remove, setQty, totalUzs, count } = useCart();
  const { t, lang, formatPrice } = useLang();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">{t("cart.title")} ({count})</SheetTitle>
        </SheetHeader>

        {detailed.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 opacity-40" />
            <p>{t("cart.empty")}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              {detailed.map(({ product, qty }) => (
                <div key={product.id} className="flex gap-3 rounded-sm border border-border p-3">
                  <img src={product.image} alt={product.name[lang]} width={64} height={64} loading="lazy" className="h-16 w-16 rounded-sm object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{product.name[lang]}</p>
                    <p className="mt-0.5 text-sm text-accent-foreground">
                      {product.priceUzs ? formatPrice(product.priceUzs) : t("product.priceOnRequest")}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(product.id, qty - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-6 text-center text-sm font-medium">{qty}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(product.id, qty + 1)}><Plus className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-destructive" onClick={() => remove(product.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("cart.total")}</span>
                <span className="font-display text-2xl font-bold">{formatPrice(totalUzs)}</span>
              </div>
              <Button asChild variant="industrial" className="w-full" onClick={() => setOpen(false)}>
                <Link to="/checkout">{t("cart.checkout")}</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}