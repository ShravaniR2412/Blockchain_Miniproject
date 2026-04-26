"use client";

import Link from "next/link";
import { AppShell, cardClass } from "@/components/dashboard-ui";

const roleCards = [
  {
    title: "Manufacturer Dashboard",
    href: "/manufacturer",
    text: "Create batches with required temperature range, dispatch inventory, and monitor transfer verification analytics.",
    badge: "Create + Dispatch",
  },
  {
    title: "Pharmacy Dashboard",
    href: "/pharmacy",
    text: "Verify delivery temperature, inspect packaging, upload damage proof, then receive and sell safely.",
    badge: "Verify + Receive + Sell",
  },
  {
    title: "Customer Dashboard",
    href: "/customer",
    text: "Track any drug by ID with immutable cold-chain compliance, damage evidence, and expiry validation.",
    badge: "Track + Verify",
  },
];

export default function Home() {
  return (
    <AppShell
      title="PharmaChain Control Center"
      subtitle="Role-based blockchain dashboards for end-to-end pharmaceutical supply tracking on Sepolia."
    >
      <section className="grid gap-6 lg:grid-cols-3">
        {roleCards.map((card) => (
          <article key={card.href} className={`${cardClass} flex flex-col justify-between`}>
            <div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {card.badge}
              </span>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{card.text}</p>
            </div>
            <Link
              href={card.href}
              className="mt-6 inline-flex w-fit rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Open Dashboard
            </Link>
          </article>
        ))}
      </section>

      <section className={`${cardClass}`}>
        <h3 className="text-xl font-semibold">What Changed In This Extended Version</h3>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3">Manufacturer records required minimum and maximum transport temperature.</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3">Pharmacy verifies delivery temperature and packaging integrity on-chain.</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3">Damaged packages store a Cloudinary proof URL as immutable evidence.</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3">Customers can inspect compliance status and proof from the public timeline view.</p>
        </div>
      </section>
    </AppShell>
  );
}
