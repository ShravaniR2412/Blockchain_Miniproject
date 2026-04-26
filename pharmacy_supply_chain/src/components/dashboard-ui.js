"use client";

import Link from "next/link";

export const cardClass =
  "rounded-2xl border border-slate-200/70 bg-white/85 p-6 shadow-lg shadow-slate-900/5 backdrop-blur";

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export const buttonClass =
  "rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400";

export function AppShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_10%,#d1fae5_0%,transparent_40%),radial-gradient(circle_at_92%_10%,#bfdbfe_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 text-slate-900 sm:px-8 lg:px-12">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/manufacturer">Manufacturer</NavLink>
              <NavLink href="/pharmacy">Pharmacy</NavLink>
              <NavLink href="/customer">Customer</NavLink>
            </nav>
          </div>
        </section>
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
    >
      {children}
    </Link>
  );
}

export function WalletBanner({ loading, walletAddress, walletRole, message, onConnect, formatAddress }) {
  return (
    <section className={`${cardClass} relative overflow-hidden`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-200/60 blur-2xl" />
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onConnect} className={buttonClass} disabled={loading}>
          {loading ? "Please wait..." : "Connect MetaMask"}
        </button>
        <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-100">
          Wallet: {walletAddress ? formatAddress(walletAddress) : "Not connected"}
        </div>
        <div className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800">
          Role: {walletRole}
        </div>
      </div>
      <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p>
    </section>
  );
}

export function Timeline({ history, parseUnixToDate, formatAddress }) {
  if (history.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
        No timeline records loaded yet.
      </p>
    );
  }

  return (
    <div className="relative ml-2 border-l-2 border-emerald-200 pl-5">
      {history.map((tx) => (
        <div key={`${tx.transactionId}-${tx.timestamp}`} className="relative mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <span className="absolute -left-[29px] top-4 h-3 w-3 rounded-full bg-emerald-500" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{tx.action}</p>
            <p className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-100">TX #{tx.transactionId}</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">From: {formatAddress(tx.from)}</p>
          <p className="text-sm text-slate-600">To: {formatAddress(tx.to)}</p>
          <p className="text-sm text-slate-600">Quantity: {tx.quantity}</p>
          <p className="text-sm text-slate-600">Amount: {tx.amount}</p>
          <p className="text-sm text-slate-600">Time: {parseUnixToDate(tx.timestamp)}</p>
        </div>
      ))}
    </div>
  );
}

export function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
