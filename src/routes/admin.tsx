import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Mail,
  MailOpen,
  MapPin,
  Phone,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useAuth } from "@/auth/AuthContext";
import {
  SETUP_SQL,
  friendlyDbError,
  isMissingTableError,
  supabaseSqlEditorUrl,
} from "@/lib/setup-sql";
import { staticSettings } from "@/data/catalog";
import { isSupabaseConfigured } from "@/lib/supabase";
import { DEFAULT_LANG } from "@/lib/site";
import { LANGS, type Lang } from "@/i18n/translations";
import type { Loc, SiteSettings } from "@/data/catalog";
import { ASSET_KEYS, resolveImage } from "@/data/asset-map";
import { useRefreshCatalog } from "@/data/useCatalog";
import {
  deleteProduct,
  deleteStat,
  emptyProduct,
  emptyStat,
  fetchAdminCategories,
  fetchAdminProducts,
  fetchAdminStats,
  fetchMessages,
  fetchSiteSettings,
  deleteMessage,
  markMessageRead,
  removeCatalogPdf,
  saveProduct,
  saveSiteSettings,
  saveStat,
  uploadCatalogPdf,
  CATALOG_MAX_BYTES,
  type AdminProduct,
  type AdminStat,
  type ContactMessage,
  type SpecRow,
} from "@/data/admin-api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Boshqaruv paneli — MCITY" },
      // Panel qidiruv tizimlariga tushmasin
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

/* ================================================================== */
/* Kirish nazorati                                                     */
/* ================================================================== */

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Kirmagan foydalanuvchini jimgina bosh sahifaga qaytaramiz —
  // hech qanday login sahifasi ko'rsatilmaydi.
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/$lang", params: { lang: DEFAULT_LANG }, replace: true });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return <AdminDashboard />;
}

/* ================================================================== */
/* Panel                                                               */
/* ================================================================== */

function AdminDashboard() {
  const { user, signOut } = useAuth();
  const refreshCatalog = useRefreshCatalog();

  // Xato bo'lsa qayta-qayta urinmaymiz — panel darrov holatni ko'rsatsin
  const q = { retry: false as const, refetchOnWindowFocus: false };

  const categories = useQuery({ queryKey: ["admin", "categories"], queryFn: fetchAdminCategories, ...q });
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: fetchAdminProducts, ...q });
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: fetchAdminStats, ...q });
  const siteSettings = useQuery({ queryKey: ["admin", "settings"], queryFn: fetchSiteSettings, ...q });
  const messages = useQuery({ queryKey: ["admin", "messages"], queryFn: fetchMessages, ...q });

  const unread = (messages.data ?? []).filter((m) => !m.is_read).length;

  const [tab, setTab] = useState("products");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [editingStat, setEditingStat] = useState<AdminStat | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);

  const reloadAll = async () => {
    await Promise.all([
      products.refetch(),
      stats.refetch(),
      categories.refetch(),
      siteSettings.refetch(),
      messages.refetch(),
    ]);
    refreshCatalog();
  };

  const categoryName = (id: string | null) => {
    const c = categories.data?.find((x) => x.id === id);
    return c ? c.name.uz || c.slug : "—";
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold uppercase">Supabase ulanmagan</h1>
        <p className="mt-4 text-muted-foreground">
          Panel ishlashi uchun avval Lovable'da <strong>Supabase → Connect</strong> tugmasini bosing
          va <code>supabase/migrations</code> papkasidagi migratsiyani ishga tushiring.
        </p>
      </div>
    );
  }

  const firstError = products.error || stats.error || categories.error || siteSettings.error;

  // Jadval hali yaratilmagan bo'lsa — bu xato emas, shunchaki baza sozlanmagan.
  // Panel baribir to'liq ochiladi: shakllar ko'rinadi, hech narsa aylanmaydi.
  const setupNeeded = isMissingTableError(firstError);
  const realError = firstError && !setupNeeded ? (firstError as Error) : null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Yuqori panel */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="mr-auto">
            <p className="font-display text-lg font-extrabold uppercase tracking-wide">
              MCITY boshqaruvi
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <Button variant="outline" size="sm" onClick={reloadAll}>
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Yangilash</span>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Saytni ko'rish</span>
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {realError && <ErrorBox error={realError} />}

        {setupNeeded && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-sm border bg-muted/40 p-3 text-sm">
            <Database className="h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="min-w-[12rem] flex-1 text-muted-foreground">
              Baza hali sozlanmagan — saqlash ishlamaydi. Bir marta sozlab olsangiz, keyin
              hamma narsa ishlaydi.
            </p>
            <Button variant="industrial" size="sm" onClick={() => setTab("setup")}>
              Bazani sozlash
            </Button>
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="products">Texnika</TabsTrigger>
            <TabsTrigger value="stats">Raqamlar</TabsTrigger>
            <TabsTrigger value="messages">
              Xabarlar
              {unread > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
                  {unread}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Sayt ma'lumotlari</TabsTrigger>
            <TabsTrigger value="catalog-pdf">PDF katalog</TabsTrigger>
            <TabsTrigger value="setup">Sozlash</TabsTrigger>
          </TabsList>

          {/* ---------------------- TEXNIKA ---------------------- */}
          <TabsContent value="products" className="mt-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {products.data?.length ?? 0} ta texnika
              </p>
              <Button
                variant="industrial"
                size="sm"
                onClick={() => setEditing(emptyProduct((products.data?.length ?? 0) + 1))}
              >
                <Plus className="h-4 w-4" /> Yangi texnika
              </Button>
            </div>

            {products.isLoading ? (
              <Loading />
            ) : products.error ? (
              <EmptyBox text="Ro'yxatni o'qib bo'lmadi — sababi yuqorida yozilgan." />
            ) : (products.data?.length ?? 0) === 0 ? (
              <EmptyBox text="Hozircha texnika qo'shilmagan. «Yangi texnika» tugmasi bilan qo'shing." />
            ) : (
              <div className="space-y-2">
                {products.data?.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center gap-3 rounded-sm border bg-background p-3"
                  >
                    <img
                      src={resolveImage(p.image_url)}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-sm object-cover"
                    />
                    <div className="min-w-[10rem] flex-1">
                      <p className="font-semibold leading-tight">{p.name.uz || p.slug}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryName(p.category_id)} · {p.slug}
                        {!p.is_published && " · yashirilgan"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing({ ...p })}>
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline">Tahrirlash</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(p)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ---------------------- RAQAMLAR --------------------- */}
          <TabsContent value="stats" className="mt-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Bosh sahifadagi raqamlar (2019 / 40+ / 100%)
              </p>
              <Button
                variant="industrial"
                size="sm"
                onClick={() => setEditingStat(emptyStat((stats.data?.length ?? 0) + 1))}
              >
                <Plus className="h-4 w-4" /> Yangi raqam
              </Button>
            </div>

            {stats.isLoading ? (
              <Loading />
            ) : stats.error ? (
              <EmptyBox text="Ro'yxatni o'qib bo'lmadi — sababi yuqorida yozilgan." />
            ) : (stats.data?.length ?? 0) === 0 ? (
              <EmptyBox text="Hozircha raqam qo'shilmagan. «Yangi raqam» tugmasi bilan qo'shing." />
            ) : (
              <div className="space-y-2">
                {stats.data?.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center gap-3 rounded-sm border bg-background p-3"
                  >
                    <p className="font-display text-2xl font-extrabold">{s.value}</p>
                    <p className="mr-auto text-sm text-muted-foreground">{s.label.uz}</p>
                    <Button variant="outline" size="sm" onClick={() => setEditingStat({ ...s })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={async () => {
                        if (!s.id) return;
                        try {
                          await deleteStat(s.id);
                          toast.success("O'chirildi");
                          await reloadAll();
                        } catch (e) {
                          toast.error(friendlyDbError(e));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ---------------------- XABARLAR --------------------- */}
          <TabsContent value="messages" className="mt-4">
            {messages.isLoading ? (
              <Loading />
            ) : messages.error ? (
              <EmptyBox text="Xabarlarni o'qib bo'lmadi — sababi yuqorida yozilgan." />
            ) : (messages.data?.length ?? 0) === 0 ? (
              <EmptyBox text="Hozircha xabar kelmagan. «Bog'lanish» sahifasidagi forma orqali yuborilgan xabarlar shu yerda ko'rinadi." />
            ) : (
              <MessagesList messages={messages.data ?? []} onChanged={reloadAll} />
            )}
          </TabsContent>

          {/* ------------------ SAYT MA'LUMOTLARI ---------------- */}
          <TabsContent value="settings" className="mt-4">
            {siteSettings.isLoading ? (
              <Loading />
            ) : (
              // Ma'lumot o'qilmasa ham shakl ochiladi — bo'sh maydonlar bilan.
              // Foydalanuvchi to'ldirib turaveradi, saqlashda aniq xabar chiqadi.
              <SettingsForm
                initial={siteSettings.data ?? staticSettings}
                onSaved={reloadAll}
              />
            )}
          </TabsContent>

          {/* ------------------- PDF KATALOG --------------------- */}
          <TabsContent value="catalog-pdf" className="mt-4">
            {siteSettings.isLoading ? (
              <Loading />
            ) : (
              <CatalogPdfPanel
                settings={siteSettings.data ?? staticSettings}
                onChanged={reloadAll}
              />
            )}
          </TabsContent>

          {/* ---------------------- SOZLASH ---------------------- */}
          <TabsContent value="setup" className="mt-4">
            <SetupPanel ok={!setupNeeded} onDone={reloadAll} />
          </TabsContent>
        </Tabs>
      </main>

      {editing && (
        <ProductDialog
          product={editing}
          categories={categories.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reloadAll();
          }}
        />
      )}

      {editingStat && (
        <StatDialog
          stat={editingStat}
          onClose={() => setEditingStat(null)}
          onSaved={async () => {
            setEditingStat(null);
            await reloadAll();
          }}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>O'chirilsinmi?</AlertDialogTitle>
            <AlertDialogDescription>
              «{deleting?.name.uz || deleting?.slug}» butunlay o'chiriladi. Bu amalni qaytarib
              bo'lmaydi. Vaqtincha yashirish uchun tahrirlash oynasidagi «Saytda ko'rinsin»
              tugmasini o'chiring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleting?.id) return;
                try {
                  await deleteProduct(deleting.id);
                  toast.success("O'chirildi");
                  setDeleting(null);
                  await reloadAll();
                } catch (e) {
                  toast.error(friendlyDbError(e));
                }
              }}
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Bazadan kelgan xatoni tushunarli qilib ko'rsatadi.
 *
 * Eng ko'p uchraydigan holat — migratsiya ishga tushirilmagan, ya'ni
 * jadval hali yaratilmagan. Shuning uchun nima qilish kerakligini
 * darrov yozib qo'yamiz.
 */
function ErrorBox({ error }: { error: Error }) {
  const msg = error.message ?? "";
  const missingTable = /schema cache|does not exist|not find the table/i.test(msg);
  const table = msg.match(/'public\.([a-z_]+)'/i)?.[1];

  return (
    <div className="mb-4 space-y-2 rounded-sm border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <p className="font-semibold text-destructive">
        {missingTable
          ? `Bazada ${table ? `«${table}»` : "kerakli"} jadval topilmadi`
          : "Bazadan ma'lumot olishda xatolik"}
      </p>

      {missingTable ? (
        <div className="space-y-1.5 text-muted-foreground">
          <p>Migratsiya hali ishga tushirilmagan. Supabase panelida:</p>
          <p>
            <strong>SQL Editor → New query</strong> → loyihadagi{" "}
            <code className="rounded bg-muted px-1">supabase/migrations/</code> papkasidagi
            fayllarni <strong>ketma-ket</strong> ishga tushiring:
          </p>
          <ol className="ml-5 list-decimal space-y-0.5">
            <li>20260907120000_mcity_catalog.sql</li>
            <li>20260907130000_site_settings.sql</li>
            <li>20260907140000_catalog_pdf.sql</li>
          </ol>
          <p>Tartib muhim — keyingilari birinchisidagi funksiyaga tayanadi.</p>
        </div>
      ) : (
        <p className="text-muted-foreground">{msg}</p>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="grid place-items-center py-16">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}

/* ================================================================== */
/* 4 tilli matn maydoni                                                */
/* ================================================================== */

function LocFields({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: Loc;
  onChange: (next: Loc) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {LANGS.map((l) => (
          <div key={l.code} className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {l.label}
            </span>
            {multiline ? (
              <Textarea
                rows={3}
                value={value[l.code as Lang] ?? ""}
                onChange={(e) => onChange({ ...value, [l.code]: e.target.value })}
              />
            ) : (
              <Input
                value={value[l.code as Lang] ?? ""}
                onChange={(e) => onChange({ ...value, [l.code]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Texnikani tahrirlash                                                */
/* ================================================================== */

function ProductDialog({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: AdminProduct;
  categories: { id: string; slug: string; name: Loc }[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<AdminProduct>(product);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof AdminProduct>(key: K, val: AdminProduct[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const preview = useMemo(() => resolveImage(form.image_url), [form.image_url]);

  const updateSpec = (i: number, next: SpecRow) =>
    set(
      "specs",
      form.specs.map((s, idx) => (idx === i ? next : s)),
    );

  const moveSpec = (i: number, dir: -1 | 1) => {
    const next = [...form.specs];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("specs", next);
  };

  const submit = async () => {
    if (!form.slug.trim()) {
      toast.error("Manzil nomi (slug) bo'sh bo'lmasin");
      return;
    }
    if (!form.name.uz.trim()) {
      toast.error("O'zbekcha nom bo'sh bo'lmasin");
      return;
    }

    setBusy(true);
    try {
      await saveProduct(form);
      toast.success("Saqlandi");
      await onSaved();
    } catch (e) {
      toast.error(friendlyDbError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wide">
            {product.id ? "Texnikani tahrirlash" : "Yangi texnika"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Asosiy */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="slug">Manzil nomi (slug)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="fuel-tanker"
              />
              <p className="text-xs text-muted-foreground">
                Sahifa manzili: /products/{form.slug || "..."} — o'zgartirsangiz eski havola
                ishlamay qoladi.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Yo'nalish</Label>
              <select
                id="category"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.category_id ?? ""}
                onChange={(e) => set("category_id", e.target.value || null)}
              >
                <option value="">— tanlanmagan —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name.uz || c.slug}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <LocFields label="Nomi" value={form.name} onChange={(v) => set("name", v)} />
          <LocFields
            label="Tavsifi"
            value={form.description}
            onChange={(v) => set("description", v)}
            multiline
          />

          {/* Rasm */}
          <div className="space-y-2">
            <Label htmlFor="image">Rasm</Label>
            <div className="flex flex-wrap items-start gap-3">
              {preview && (
                <img src={preview} alt="" className="h-24 w-24 rounded-sm border object-cover" />
              )}
              <div className="min-w-[14rem] flex-1 space-y-2">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={ASSET_KEYS.includes((form.image_url ?? "").replace("asset:", "")) ? form.image_url ?? "" : "__custom"}
                  onChange={(e) => {
                    if (e.target.value !== "__custom") set("image_url", e.target.value);
                  }}
                >
                  {ASSET_KEYS.map((k) => (
                    <option key={k} value={`asset:${k}`}>
                      {k}
                    </option>
                  ))}
                  <option value="__custom">Tashqi havola (URL)</option>
                </select>
                <Input
                  id="image"
                  value={form.image_url ?? ""}
                  onChange={(e) => set("image_url", e.target.value)}
                  placeholder="asset:veh-fuel-tanker yoki https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Yangi rasm qo'shish uchun uni Supabase Storage'ga yuklab, to'liq havolasini shu
                  yerga qo'ying.
                </p>
              </div>
            </div>
          </div>

          {/* Xarakteristikalar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Xarakteristikalar</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  set("specs", [
                    ...form.specs,
                    { label: { uz: "", uzc: "", ru: "", en: "" }, value: "" },
                  ])
                }
              >
                <Plus className="h-4 w-4" /> Qator qo'shish
              </Button>
            </div>

            {form.specs.length === 0 && (
              <p className="text-sm text-muted-foreground">Hozircha xarakteristika yo'q.</p>
            )}

            {form.specs.map((s, i) => (
              <div key={i} className="space-y-3 rounded-sm border p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                  <div className="ml-auto flex gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => moveSpec(i, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => moveSpec(i, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        set(
                          "specs",
                          form.specs.filter((_, idx) => idx !== i),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <LocFields
                  label="Nomi (masalan: Sig'imi)"
                  value={s.label}
                  onChange={(label) => updateSpec(i, { ...s, label })}
                />

                <div className="space-y-1.5">
                  <Label>Qiymati</Label>
                  <Input
                    value={s.value}
                    onChange={(e) => updateSpec(i, { ...s, value: e.target.value })}
                    placeholder="10 000 – 25 000 L"
                  />
                  <p className="text-xs text-muted-foreground">
                    Qiymat barcha tillarda bir xil ko'rinadi (raqam va o'lchov birligi).
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Narx va sozlamalar */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Narxi (so'm)</Label>
              <Input
                id="price"
                type="number"
                inputMode="numeric"
                value={form.price_uzs ?? ""}
                onChange={(e) => set("price_uzs", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="Bo'sh qoldirsangiz — «Narx so'rov bo'yicha»"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order">Tartib raqami</Label>
              <Input
                id="order"
                type="number"
                inputMode="numeric"
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Kichik raqam — yuqorida turadi.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.is_published}
                onCheckedChange={(v) => set("is_published", v)}
              />
              Saytda ko'rinsin
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.bestseller} onCheckedChange={(v) => set("bestseller", v)} />
              Bosh sahifada ajratib ko'rsatilsin
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Bekor qilish
          </Button>
          <Button variant="industrial" onClick={submit} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */
/* Raqamni tahrirlash                                                  */
/* ================================================================== */

function StatDialog({
  stat,
  onClose,
  onSaved,
}: {
  stat: AdminStat;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<AdminStat>(stat);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await saveStat(form);
      toast.success("Saqlandi");
      await onSaved();
    } catch (e) {
      toast.error(friendlyDbError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wide">Raqam</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="stat-value">Qiymati</Label>
            <Input
              id="stat-value"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="40+"
            />
          </div>

          <LocFields
            label="Izohi"
            value={form.label}
            onChange={(label) => setForm({ ...form, label })}
          />

          <div className="space-y-1.5">
            <Label htmlFor="stat-order">Tartib raqami</Label>
            <Input
              id="stat-order"
              type="number"
              inputMode="numeric"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={form.is_published}
              onCheckedChange={(v) => setForm({ ...form, is_published: v })}
            />
            Saytda ko'rinsin
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Bekor qilish
          </Button>
          <Button variant="industrial" onClick={submit} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */
/* Sayt ma'lumotlari — footer va "Bog'lanish" sahifasi                 */
/* ================================================================== */

function SettingsForm({
  initial,
  onSaved,
}: {
  initial: SiteSettings;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<SiteSettings>(initial);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const submit = async () => {
    setBusy(true);
    try {
      await saveSiteSettings(form);
      toast.success("Saqlandi");
      await onSaved();
    } catch (e) {
      toast.error(friendlyDbError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 rounded-sm border bg-background p-4 sm:p-6">
      <p className="text-sm text-muted-foreground">
        Bu ma'lumotlar sahifa pastidagi (footer) blokda va «Bog'lanish» sahifasida ko'rinadi.
      </p>

      <LocFields
        label="Kompaniya haqida qisqacha"
        value={form.about}
        onChange={(v) => set("about", v)}
        multiline
      />

      <LocFields label="Manzil" value={form.address} onChange={(v) => set("address", v)} />

      <LocFields label="Shior (tagline)" value={form.tagline} onChange={(v) => set("tagline", v)} />

      {/* Telefon raqamlari — xohlagancha qo'shish mumkin */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Telefon raqamlari</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => set("phones", [...form.phones, ""])}
          >
            <Plus className="h-4 w-4" /> Raqam qo'shish
          </Button>
        </div>

        {form.phones.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Hozircha raqam yo'q. «Raqam qo'shish» tugmasini bosing.
          </p>
        )}

        <div className="space-y-2">
          {form.phones.map((tel, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-xs text-muted-foreground">{i + 1}.</span>
              <Input
                value={tel}
                onChange={(e) =>
                  set(
                    "phones",
                    form.phones.map((v, idx) => (idx === i ? e.target.value : v)),
                  )
                }
                placeholder="+998 71 200 00 00"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Yuqoriga"
                disabled={i === 0}
                onClick={() => {
                  const next = [...form.phones];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  set("phones", next);
                }}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                aria-label="O'chirish"
                onClick={() => set("phones", form.phones.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Birinchi raqam asosiy hisoblanadi. Barchasi saytda — footer va
          «Bog'lanish» sahifasida — ketma-ket ko'rinadi va bosilsa qo'ng'iroq
          qiladi.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="s-email">Email</Label>
        <Input
          id="s-email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="info@mcity.uz"
          className="sm:max-w-md"
        />
      </div>

      <div className="space-y-3">
        <Label>Ijtimoiy tarmoqlar</Label>
        <p className="text-xs text-muted-foreground">
          Bo'sh qoldirsangiz, o'sha belgi saytda umuman ko'rinmaydi.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            ["facebook", "Facebook", "https://facebook.com/mcity"],
            ["instagram", "Instagram", "https://instagram.com/mcity"],
            ["linkedin", "LinkedIn", "https://linkedin.com/company/mcity"],
            ["telegram", "Telegram", "https://t.me/mcity"],
          ] as const).map(([key, label, placeholder]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`s-${key}`}>{label}</Label>
              <Input
                id={`s-${key}`}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Xarita nuqtasi */}
      <div className="space-y-3 rounded-sm border p-3">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Xaritadagi joy
        </Label>
        <p className="text-xs text-muted-foreground">
          «Bog'lanish» sahifasidagi xarita shu nuqtaga belgi qo'yadi. Koordinatani olish:
          Google Maps'da kerakli joyni <strong>o'ng tugma</strong> bilan bosing — birinchi
          qatorda ikkita raqam chiqadi (masalan <code>41.311081, 69.240562</code>).
          Birinchisi kenglik, ikkinchisi uzunlik.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="s-lat">Kenglik (latitude)</Label>
            <Input
              id="s-lat"
              type="number"
              step="any"
              value={form.mapLat}
              onChange={(e) => set("mapLat", Number(e.target.value))}
              placeholder="41.311081"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-lng">Uzunlik (longitude)</Label>
            <Input
              id="s-lng"
              type="number"
              step="any"
              value={form.mapLng}
              onChange={(e) => set("mapLng", Number(e.target.value))}
              placeholder="69.240562"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-zoom">Yaqinlik (zoom)</Label>
            <Input
              id="s-zoom"
              type="number"
              min={1}
              max={19}
              value={form.mapZoom}
              onChange={(e) => set("mapZoom", Number(e.target.value) || 15)}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-sm border">
          <iframe
            title="Xarita ko'rinishi"
            className="aspect-[21/9] w-full"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              form.mapLng - 0.006
            }%2C${form.mapLat - 0.003}%2C${form.mapLng + 0.006}%2C${
              form.mapLat + 0.003
            }&layer=mapnik&marker=${form.mapLat}%2C${form.mapLng}`}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Yuqoridagi ko'rinish darhol yangilanadi — belgi to'g'ri joyda turganini
          shu yerda tekshiring, so'ng saqlang.
        </p>
      </div>

      <div className="flex justify-end">
        <Button variant="industrial" onClick={submit} disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Saqlash
        </Button>
      </div>
    </div>
  );
}


/* ================================================================== */
/* PDF katalogni yuklash                                               */
/* ================================================================== */

function CatalogPdfPanel({
  settings,
  onChanged,
}: {
  settings: SiteSettings;
  onChanged: () => void | Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasPdf = Boolean(settings.catalogPdfUrl);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      await uploadCatalogPdf(file);
      toast.success("PDF katalog yuklandi");
      await onChanged();
    } catch (e) {
      toast.error(friendlyDbError(e));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const updated = settings.catalogPdfUpdatedAt
    ? new Date(settings.catalogPdfUpdatedAt).toLocaleString("uz-UZ", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="max-w-2xl space-y-5 rounded-sm border bg-background p-4 sm:p-6">
      <div>
        <h2 className="font-display text-lg font-bold uppercase tracking-wide">PDF katalog</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bu yerga yuklangan fayl saytdagi «PDF katalogni yuklab olish» tugmasi orqali
          ochiladi. Tugma faqat fayl yuklangan bo'lsa ko'rinadi.
        </p>
      </div>

      {hasPdf ? (
        <div className="flex flex-wrap items-center gap-3 rounded-sm border bg-muted/30 p-3">
          <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
          <div className="min-w-[10rem] flex-1">
            <p className="font-medium leading-tight">
              {settings.catalogPdfName || "catalog.pdf"}
            </p>
            {updated && (
              <p className="text-xs text-muted-foreground">Yuklangan: {updated}</p>
            )}
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={settings.catalogPdfUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Ochish
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <p className="rounded-sm border border-dashed p-4 text-sm text-muted-foreground">
          Hozircha PDF yuklanmagan — saytdagi yuklab olish tugmasi ko'rinmayapti.
        </p>
      )}

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <Button
          variant="industrial"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {hasPdf ? "Boshqa fayl bilan almashtirish" : "PDF faylni tanlash"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Faqat PDF. Maksimal hajm — {Math.round(CATALOG_MAX_BYTES / 1024 / 1024)} MB.
          Yangi fayl eskisining ustiga yoziladi.
        </p>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>PDF katalog o'chirilsinmi?</AlertDialogTitle>
            <AlertDialogDescription>
              Fayl o'chiriladi va saytdagi yuklab olish tugmasi yo'qoladi. Keyin qaytadan
              yuklashingiz mumkin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setBusy(true);
                try {
                  await removeCatalogPdf();
                  toast.success("O'chirildi");
                  setConfirmDelete(false);
                  await onChanged();
                } catch (e) {
                  toast.error(friendlyDbError(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ================================================================== */
/* Bo'sh ro'yxat                                                       */
/* ================================================================== */

function EmptyBox({ text }: { text: string }) {
  return (
    <p className="rounded-sm border border-dashed p-6 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

/* ================================================================== */
/* Bazani sozlash — bir marta bajariladi                               */
/* ================================================================== */

function SetupPanel({ ok, onDone }: { ok: boolean; onDone: () => void | Promise<void> }) {
  const [copied, setCopied] = useState(false);
  const editorUrl = supabaseSqlEditorUrl();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SETUP_SQL);
      setCopied(true);
      toast.success("SQL nusxalandi");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ba'zi brauzerlarda clipboard yopiq bo'ladi — matnni belgilab beramiz
      const area = document.getElementById("setup-sql") as HTMLTextAreaElement | null;
      area?.select();
      toast.info("Ctrl+C bilan nusxalang");
    }
  };

  if (ok) {
    return (
      <div className="max-w-2xl space-y-3 rounded-sm border bg-background p-6">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          <Check className="h-5 w-5 text-accent" /> Baza sozlangan
        </p>
        <p className="text-sm text-muted-foreground">
          Barcha jadvallar joyida. Bu bo'lim boshqa kerak emas — texnika qo'shishingiz,
          sayt ma'lumotlarini tahrirlashingiz va PDF katalog yuklashingiz mumkin.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5 rounded-sm border bg-background p-4 sm:p-6">
      <div>
        <h2 className="font-display text-lg font-bold uppercase tracking-wide">
          Bazani sozlash
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bu bir martalik ish. Jadvallarni brauzerdan yaratib bo'lmaydi — Supabase buni
          faqat o'z SQL oynasidan qabul qiladi. Quyidagi ikkita tugma bilan 30 soniyada
          bajariladi.
        </p>
      </div>

      <ol className="space-y-4">
        <li className="flex flex-wrap items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            1
          </span>
          <span className="min-w-[10rem] flex-1 text-sm">SQL matnini nusxalang</span>
          <Button variant="industrial" size="sm" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Nusxalandi" : "SQL'ni nusxalash"}
          </Button>
        </li>

        <li className="flex flex-wrap items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            2
          </span>
          <span className="min-w-[10rem] flex-1 text-sm">
            Supabase SQL oynasini oching, <strong>Ctrl+V</strong> va <strong>Run</strong>
          </span>
          {editorUrl ? (
            <Button variant="outline" size="sm" asChild>
              <a href={editorUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" /> SQL Editor
              </a>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Supabase → SQL Editor</span>
          )}
        </li>

        <li className="flex flex-wrap items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            3
          </span>
          <span className="min-w-[10rem] flex-1 text-sm">Shu yerga qaytib tekshiring</span>
          <Button variant="outline" size="sm" onClick={() => void onDone()}>
            <RefreshCw className="h-4 w-4" /> Tekshirish
          </Button>
        </li>
      </ol>

      <details className="rounded-sm border bg-muted/30 p-3">
        <summary className="cursor-pointer text-sm font-medium">
          SQL matnini ko'rish
        </summary>
        <textarea
          id="setup-sql"
          readOnly
          value={SETUP_SQL}
          spellCheck={false}
          className="mt-3 h-64 w-full rounded-sm border bg-background p-2 font-mono text-[11px] leading-relaxed"
        />
      </details>

      <p className="text-xs text-muted-foreground">
        Qayta ishga tushirish xavfsiz — mavjud ma'lumotlar o'chmaydi va takrorlanmaydi.
      </p>
    </div>
  );
}

/* ================================================================== */
/* Kelgan xabarlar                                                     */
/* ================================================================== */

function MessagesList({
  messages,
  onChanged,
}: {
  messages: ContactMessage[];
  onChanged: () => void | Promise<void>;
}) {
  const [removing, setRemoving] = useState<ContactMessage | null>(null);

  const when = (iso: string) =>
    new Date(iso).toLocaleString("uz-UZ", { dateStyle: "medium", timeStyle: "short" });

  const toggleRead = async (m: ContactMessage) => {
    try {
      await markMessageRead(m.id, !m.is_read);
      await onChanged();
    } catch (e) {
      toast.error(friendlyDbError(e));
    }
  };

  return (
    <>
      <div className="space-y-3">
        {messages.map((m) => (
          <article
            key={m.id}
            className={`rounded-sm border p-4 ${
              m.is_read ? "bg-background" : "border-primary/40 bg-primary/[0.03]"
            }`}
          >
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-[12rem] flex-1">
                <p className="font-semibold leading-tight">
                  {m.name}
                  {!m.is_read && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      YANGI
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {when(m.created_at)}
                  {m.lang ? ` · ${m.lang.toUpperCase()}` : ""}
                  {m.source === "quote" ? " · narx so'rovi" : ""}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${m.phone.replace(/\s/g, "")}`}>
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">{m.phone}</span>
                  </a>
                </Button>
                {m.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${m.email}`}>
                      <Mail className="h-4 w-4" />
                      <span className="hidden md:inline">{m.email}</span>
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => void toggleRead(m)}>
                  {m.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  <span className="hidden lg:inline">
                    {m.is_read ? "O'qilmagan" : "O'qildi"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setRemoving(m)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="mt-3 whitespace-pre-wrap border-t pt-3 text-sm leading-relaxed">
              {m.message}
            </p>
          </article>
        ))}
      </div>

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xabar o'chirilsinmi?</AlertDialogTitle>
            <AlertDialogDescription>
              «{removing?.name}» dan kelgan xabar butunlay o'chiriladi. Qaytarib
              bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!removing) return;
                try {
                  await deleteMessage(removing.id);
                  toast.success("O'chirildi");
                  setRemoving(null);
                  await onChanged();
                } catch (e) {
                  toast.error(friendlyDbError(e));
                }
              }}
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
