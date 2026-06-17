import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-sidebar-foreground md:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mt-3 max-w-2xl text-sidebar-foreground/70">{subtitle}</p>}
        <div className="mt-5 h-1 w-20 gradient-accent" />
      </div>
    </div>
  );
}