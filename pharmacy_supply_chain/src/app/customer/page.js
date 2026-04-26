"use client";

import { useMemo, useState } from "react";
import {
  formatAddress,
  getContractInstance,
  getWalletContext,
  isExpired,
  loadDrugWithHistory,
  parseUnixToDate,
  resolveRole,
  summarizeHistory,
} from "@/lib/contract";
import {
  AppShell,
  MetricCard,
  Timeline,
  WalletBanner,
  buttonClass,
  cardClass,
  inputClass,
} from "@/components/dashboard-ui";

export default function CustomerPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletRole, setWalletRole] = useState("Not connected");
  const [message, setMessage] = useState("Connect MetaMask to view trusted blockchain trace data.");
  const [loading, setLoading] = useState(false);

  const [trackDrugId, setTrackDrugId] = useState("");
  const [drugData, setDrugData] = useState(null);
  const [history, setHistory] = useState([]);

  const summary = useMemo(() => summarizeHistory(history), [history]);

  const connectWallet = async () => {
    try {
      setLoading(true);
      const { address } = await getWalletContext();
      setWalletAddress(address);
      setWalletRole(resolveRole(address));
      setMessage("Wallet connected. Tracking mode is available.");
    } catch (error) {
      setMessage(error?.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const trackDrug = async () => {
    if (!trackDrugId) {
      setMessage("Enter a drug ID to track.");
      return;
    }

    try {
      setLoading(true);
      const { signer } = await getWalletContext();
      const contract = getContractInstance(signer);
      try {
        const tx = await contract.refreshExpiryStatus(trackDrugId);
        await tx.wait();
      } catch {
        // Continue even when refresh does not change state.
      }

      const { drug, history: loadedHistory } = await loadDrugWithHistory(contract, trackDrugId);
      setDrugData(drug);
      setHistory(loadedHistory);
      setMessage(`Loaded verified customer tracking details for ${trackDrugId}.`);
    } catch (error) {
      setDrugData(null);
      setHistory([]);
      setMessage(error.reason || error.shortMessage || error.message || "Unable to track this drug");
    } finally {
      setLoading(false);
    }
  };

  const expiryText =
    drugData && (drugData.statusCode === 5 || isExpired(drugData.expiryDate)) ? "Expired" : "Valid";

  return (
    <AppShell
      title="Customer Tracking Dashboard"
      subtitle="View immutable lifecycle, cold-chain verification, packaging integrity, and expiry safety for each drug."
    >
      <WalletBanner
        loading={loading}
        walletAddress={walletAddress}
        walletRole={walletRole}
        message={message}
        onConnect={connectWallet}
        formatAddress={formatAddress}
      />

      <section className="grid gap-6 lg:grid-cols-4">
        <article className={`${cardClass} lg:col-span-1`}>
          <h2 className="text-xl font-semibold">Track Drug</h2>
          <div className="mt-4 flex gap-2">
            <input className={inputClass} placeholder="Drug ID" value={trackDrugId} onChange={(e) => setTrackDrugId(e.target.value)} />
            <button className={buttonClass} onClick={trackDrug} disabled={loading}>Track</button>
          </div>

          <div className="mt-4 grid gap-3">
            <MetricCard label="Total Quantity" value={drugData?.totalQuantity ?? "-"} />
            <MetricCard label="Sold Quantity" value={summary.soldQty} />
            <MetricCard label="Remaining Quantity" value={drugData?.remainingQuantity ?? "-"} />
            <MetricCard label="Expiry Status" value={drugData ? expiryText : "-"} />
            <MetricCard
              label="Temp Validation"
              value={
                drugData
                  ? drugData.temperatureChecked
                    ? drugData.temperatureCompromised
                      ? "Invalid"
                      : "Valid"
                    : "Pending"
                  : "-"
              }
            />
            <MetricCard label="Packaging" value={drugData ? (drugData.packagingDamaged ? "Damaged" : "OK") : "-"} />
          </div>

          {drugData ? (
            <div className="mt-4 space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <p>Name: {drugData.drugName}</p>
              <p>Batch: {drugData.batchNumber}</p>
              <p>Unit: {drugData.unit}</p>
              <p>Status: {drugData.statusLabel}</p>
              <p>Current Owner: {formatAddress(drugData.currentOwner)}</p>
              <p>Manufactured: {parseUnixToDate(drugData.manufacturingDate)}</p>
              <p>Dispatch Time: {parseUnixToDate(drugData.dispatchTimestamp)}</p>
              <p>Received Time: {parseUnixToDate(drugData.receiveTimestamp)}</p>
              <p>Required Temp Range: {drugData.minRequiredTemp}C to {drugData.maxRequiredTemp}C</p>
              <p>Recorded Delivery Temp: {drugData.temperatureChecked ? `${drugData.recordedDeliveryTemp}C` : "Not recorded"}</p>
              <p>Expiry: {parseUnixToDate(drugData.expiryDate)}</p>
              <p>Last Location: {drugData.location || "-"}</p>
              {drugData.packagingDamaged && drugData.damageProofHash ? (
                <a className="text-emerald-700 underline" href={drugData.damageProofHash} target="_blank" rel="noreferrer">
                  View Damage Proof
                </a>
              ) : null}
            </div>
          ) : null}
        </article>

        <article className={`${cardClass} lg:col-span-3`}>
          <h2 className="text-xl font-semibold">Public Trace Timeline</h2>
          <p className="mt-1 text-sm text-slate-600">Transparent record from creation to sale including quantity and transferred amount.</p>
          <div className="mt-4 max-h-152 overflow-auto pr-2">
            <Timeline history={history} parseUnixToDate={parseUnixToDate} formatAddress={formatAddress} />
          </div>
        </article>
      </section>
    </AppShell>
  );
}
