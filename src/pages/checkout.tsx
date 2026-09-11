import { L } from "@/components/L";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Landmark, Wallet, ShoppingCart } from "lucide-react";
import { Layout, PageHeader } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/i18n/LanguageContext";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

const payments = [
  { id: "card", Icon: CreditCard, label: "Visa / Mastercard / UzCard" },
  { id: "bank", Icon: Landmark, label: "Bank transfer" },
  { id: "cash", Icon: Wallet, label: "Cash / On delivery" },
];

export function CheckoutPage() {
  const { t, lang, formatPrice } = useLang();
  const { detailed, totalUzs, clear, count } = useCart();
  const navigate = useNavigate();
  const [pay, setPay] = useState("card");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("checkout.success"));
    clear();
    setTimeout(() => navigate({ to: "/$lang", params: { lang } }), 1500);
  };

  return (
    <Layout>
      <PageHeader title={t("checkout.title")} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {count === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center text-muted-foreground">
            <ShoppingCart className="h-14 w-14 opacity-40" />
            <p className="text-lg">{t("cart.empty")}</p>
            <Button asChild variant="industrial"><L page="store">{t("nav.store")}</L></Button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-xl font-bold uppercase">{t("checkout.contact")}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label={t("checkout.name")} required />
                  <Field label={t("checkout.phone")} type="tel" required />
                  <Field label={t("checkout.email")} type="email" />
                  <Field label={t("checkout.company")} />
                </div>
                <div className="mt-4 grid gap-4">
                  <Field label={t("checkout.address")} required />
                  <div>
                    <Label className="mb-1.5 block text-sm">{t("checkout.notes")}</Label>
                    <Textarea rows={3} />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold uppercase">{t("checkout.payment")}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {payments.map(({ id, Icon, label }) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setPay(id)}
                      className={`flex flex-col items-start gap-2 rounded-sm border-2 p-4 text-left transition-colors ${pay === id ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/40"}`}
                    >
                      <Icon className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <aside className="h-fit rounded-sm border border-border bg-card p-6 shadow-card lg:sticky lg:top-20">
              <h2 className="font-display text-xl font-bold uppercase">{t("checkout.summary")}</h2>
              <div className="mt-4 space-y-3">
                {detailed.map(({ product, qty }) => (
                  <div key={product.id} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0"><span className="line-clamp-1 font-medium">{product.name[lang]}</span><span className="text-muted-foreground">× {qty}</span></span>
                    <span className="shrink-0 font-medium">{product.priceUzs ? formatPrice(product.priceUzs * qty) : "—"}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted-foreground">{t("cart.total")}</span>
                <span className="font-display text-2xl font-bold">{formatPrice(totalUzs)}</span>
              </div>
              <Button type="submit" variant="industrial" size="lg" className="mt-6 w-full">{t("checkout.placeOrder")}</Button>
            </aside>
          </form>
        )}
      </div>
    </Layout>
  );
}

function Field({ label, type = "text", required }: { label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">{label}{required && <span className="text-destructive"> *</span>}</Label>
      <Input type={type} required={required} />
    </div>
  );
}
