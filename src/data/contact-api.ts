import { supabase } from "@/lib/supabase";

/**
 * Saytdan yuborilgan xabarni bazaga yozadi.
 *
 * Mehmonlar faqat YOZA oladi — boshqalarning xabarlarini o'qiy olmaydi
 * (bu bazadagi RLS qoidasi bilan ta'minlangan, brauzerdan aylanib
 * o'tib bo'lmaydi).
 */
export interface NewContactMessage {
  name: string;
  phone: string;
  email: string | null;
  message: string;
  source?: "contact" | "quote";
  lang?: string;
}

export async function sendContactMessage(input: NewContactMessage): Promise<void> {
  if (!supabase) {
    throw new Error(
      "Xabar yuborish vaqtincha ishlamayapti. Iltimos, telefon orqali bog'laning.",
    );
  }

  if (!input.name || !input.phone || !input.message) {
    throw new Error("Ism, telefon va xabar matni to'ldirilishi shart.");
  }

  const { error } = await supabase.from("contact_messages").insert({
    name: input.name.slice(0, 120),
    phone: input.phone.slice(0, 40),
    email: input.email ? input.email.slice(0, 160) : null,
    message: input.message.slice(0, 4000),
    source: input.source ?? "contact",
    lang: input.lang ?? null,
  });

  if (error) {
    // Jadval hali yaratilmagan bo'lsa foydalanuvchiga texnik matn ko'rsatmaymiz
    if (/schema cache|does not exist/i.test(error.message)) {
      throw new Error(
        "Xabar yuborish vaqtincha ishlamayapti. Iltimos, telefon orqali bog'laning.",
      );
    }
    throw new Error(error.message);
  }
}
