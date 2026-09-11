import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthContext";

/**
 * Yashirin kirish oynasi.
 *
 * Saytda hech qanday "Kirish" tugmasi yo'q. Bu oyna faqat header'dagi
 * logotip TEZ IKKI MARTA bosilganda ochiladi (Header.tsx ga qarang).
 *
 * Eslatma: logotipni yashirish — bu himoya emas, shunchaki qulaylik.
 * Haqiqiy himoya — Supabase paroli va RLS qoidalari.
 */

/**
 * Supabase xatolarini odam tushunadigan tilga o'giradi.
 * Quruq inglizcha xabar o'rniga nima qilish kerakligi yoziladi.
 */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "Email yoki parol noto'g'ri. Agar akkaunt hali yaratilmagan bo'lsa, Supabase → Authentication → Users bo'limida yarating.";
  }
  if (m.includes("email not confirmed")) {
    return "Bu akkaunt hali tasdiqlanmagan. Supabase → Authentication → Users da foydalanuvchini oching va «Confirm email» bosing.";
  }
  if (m.includes("too many requests") || m.includes("rate limit")) {
    return "Juda ko'p urinish bo'ldi. Bir necha daqiqadan keyin qayta urinib ko'ring.";
  }
  if (m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed")) {
    return "Serverga ulanib bo'lmadi. Internet aloqasini va Supabase kalitlarini tekshiring.";
  }
  if (m.includes("supabase ulanmagan")) {
    return message;
  }
  return message;
}

export function HiddenLoginDialog() {
  const { loginOpen, setLoginOpen, signIn, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Oyna yopilganda maydonlarni tozalaymiz
  useEffect(() => {
    if (!loginOpen) {
      setPassword("");
      setError(null);
      setBusy(false);
    }
  }, [loginOpen]);

  // Allaqachon kirgan bo'lsa — to'g'ridan-to'g'ri panelga
  useEffect(() => {
    if (loginOpen && user) {
      setLoginOpen(false);
      navigate({ to: "/admin" });
    }
  }, [loginOpen, user, navigate, setLoginOpen]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error: err } = await signIn(email.trim(), password);

    if (err) {
      setError(friendlyAuthError(err));
      setBusy(false);
      return;
    }

    setLoginOpen(false);
    navigate({ to: "/admin" });
  };

  return (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wide">Boshqaruv paneli</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Parol</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" variant="industrial" className="w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Kirish
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
