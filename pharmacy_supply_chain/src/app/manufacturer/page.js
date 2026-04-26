"use client";

import { useMemo, useState } from "react";
import {
  formatAddress,
  getContractInstance,
  getWalletContext,
  loadDrugWithHistory,
  parseUnixToDate,
  resolveRole,
  summarizeHistory,
  toInteger,
  toPositiveInt,
  toUnixSeconds,
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

const MAX_BULK_SIZE = 10;

function emptyCreateRow() {
  return {
    drugId: "",
    drugName: "",
    batchNumber: "",
    unit: "Tablets",
    minRequiredTemp: "2",
    maxRequiredTemp: "8",
    totalQuantity: "",
    manufacturingDate: "",
    expiryDate: "",
    location: "",
  };
}

function emptyTransferRow() {
  return {
    drugId: "",
    quantity: "",
    amount: "",
    location: "",
  };
}

export default function ManufacturerPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletRole, setWalletRole] = useState("Not connected");
  const [message, setMessage] = useState("Connect MetaMask and use your manufacturer wallet.");
  const [loading, setLoading] = useState(false);

  const [createRows, setCreateRows] = useState([emptyCreateRow()]);
  const [transferRows, setTransferRows] = useState([emptyTransferRow()]);

  const [trackDrugId, setTrackDrugId] = useState("");
  const [drugData, setDrugData] = useState(null);
  const [history, setHistory] = useState([]);

  const summary = useMemo(() => summarizeHistory(history), [history]);
  const isManufacturer = walletRole === "Manufacturer";

  const connectWallet = async () => {
    try {
      setLoading(true);
      const { address } = await getWalletContext();
      setWalletAddress(address);
      setWalletRole(resolveRole(address));
      setMessage("Wallet connected. Manufacturer actions are enabled for authorized account.");
    } catch (error) {
      setMessage(error?.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const withContract = async (callback, successMessage) => {
    try {
      setLoading(true);
      const { signer, address } = await getWalletContext();
      setWalletAddress(address);
      setWalletRole(resolveRole(address));
      const contract = getContractInstance(signer);
      const tx = await callback(contract);
      await tx.wait();
      setMessage(successMessage);
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const updateCreateRow = (index, key, value) => {
    setCreateRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const updateTransferRow = (index, key, value) => {
    setTransferRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const addCreateRow = () => {
    if (createRows.length >= MAX_BULK_SIZE) {
      setMessage("You can create up to 10 drugs in one blockchain transaction.");
      return;
    }
    setCreateRows((prev) => [...prev, emptyCreateRow()]);
  };

  const removeCreateRow = (index) => {
    setCreateRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const addTransferRow = () => {
    if (transferRows.length >= MAX_BULK_SIZE) {
      setMessage("You can transfer up to 10 drugs in one blockchain transaction.");
      return;
    }
    setTransferRows((prev) => [...prev, emptyTransferRow()]);
  };

  const removeTransferRow = (index) => {
    setTransferRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const createDrugs = async () => {
    const activeRows = createRows.filter(
      (row) => row.drugId || row.drugName || row.batchNumber || row.totalQuantity || row.manufacturingDate || row.expiryDate
    );

    if (activeRows.length === 0) {
      setMessage("Enter at least one drug row to create.");
      return;
    }

    if (activeRows.length > MAX_BULK_SIZE) {
      setMessage("Maximum 10 drugs are allowed per create transaction.");
      return;
    }

    const payload = [];
    for (let i = 0; i < activeRows.length; i += 1) {
      const row = activeRows[i];
      const totalQuantity = toPositiveInt(row.totalQuantity);
      const minRequiredTemp = toInteger(row.minRequiredTemp);
      const maxRequiredTemp = toInteger(row.maxRequiredTemp);
      const manufacturingDate = toUnixSeconds(row.manufacturingDate);
      const expiryDate = toUnixSeconds(row.expiryDate);

      if (!row.drugId || !row.drugName || !row.batchNumber || !row.unit || !totalQuantity || !manufacturingDate || !expiryDate) {
        setMessage(`Create row ${i + 1}: fill all required fields.`);
        return;
      }

      if (maxRequiredTemp < minRequiredTemp) {
        setMessage(`Create row ${i + 1}: max temperature must be >= min temperature.`);
        return;
      }

      payload.push({
        drugId: row.drugId.trim(),
        drugName: row.drugName.trim(),
        batchNumber: row.batchNumber.trim(),
        unit: row.unit.trim(),
        minRequiredTemp,
        maxRequiredTemp,
        totalQuantity,
        manufacturingDate,
        expiryDate,
        location: (row.location || "Manufacturer plant").trim(),
      });
    }

    const ids = payload.map((item) => item.drugId);
    const hasDuplicateIds = new Set(ids).size !== ids.length;
    if (hasDuplicateIds) {
      setMessage("Duplicate Drug ID found in create batch. Use unique IDs.");
      return;
    }

    await withContract(
      (contract) => (payload.length === 1 ? contract.addDrug(payload[0]) : contract.addDrugs(payload)),
      `Created ${payload.length} drug record${payload.length > 1 ? "s" : ""} on-chain.`
    );

    setTrackDrugId(payload[0].drugId);
  };

  const transferDrugs = async () => {
    const activeRows = transferRows.filter((row) => row.drugId || row.quantity || row.amount || row.location);

    if (activeRows.length === 0) {
      setMessage("Enter at least one transfer row.");
      return;
    }

    if (activeRows.length > MAX_BULK_SIZE) {
      setMessage("Maximum 10 drugs are allowed per transfer transaction.");
      return;
    }

    const payload = [];
    for (let i = 0; i < activeRows.length; i += 1) {
      const row = activeRows[i];
      const quantity = toPositiveInt(row.quantity);
      const amount = row.amount ? Math.max(0, toInteger(row.amount)) : 0;

      if (!row.drugId || !quantity) {
        setMessage(`Transfer row ${i + 1}: drug ID and quantity are required.`);
        return;
      }

      payload.push({
        drugId: row.drugId.trim(),
        quantity,
        amount,
        location: (row.location || "Transit route").trim(),
      });
    }

    const ids = payload.map((item) => item.drugId);
    const hasDuplicateIds = new Set(ids).size !== ids.length;
    if (hasDuplicateIds) {
      setMessage("Duplicate Drug ID found in transfer batch. Keep one row per drug.");
      return;
    }

    await withContract(
      (contract) =>
        payload.length === 1
          ? contract.transferDrugToPharmacy(payload[0])
          : contract.transferDrugsToPharmacy(payload),
      `Transferred ${payload.length} drug record${payload.length > 1 ? "s" : ""} to pharmacy.`
    );
  };

  const loadTimeline = async () => {
    if (!trackDrugId) {
      setMessage("Enter a drug ID to load manufacturer timeline.");
      return;
    }

    try {
      setLoading(true);
      const { signer } = await getWalletContext();
      const contract = getContractInstance(signer);
      const { drug, history: loadedHistory } = await loadDrugWithHistory(contract, trackDrugId);
      setDrugData(drug);
      setHistory(loadedHistory);
      setMessage(`Loaded manufacturer analytics for ${trackDrugId}.`);
    } catch (error) {
      setDrugData(null);
      setHistory([]);
      setMessage(error.reason || error.shortMessage || error.message || "Unable to load timeline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Manufacturer Dashboard"
      subtitle="Manage high-volume batch creation and dispatch with secure on-chain records."
    >
      <WalletBanner
        loading={loading}
        walletAddress={walletAddress}
        walletRole={walletRole}
        message={message}
        onConnect={connectWallet}
        formatAddress={formatAddress}
      />

      <section className="rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 via-white to-cyan-50 p-4 text-sm text-slate-700 shadow-sm">
        <p className="font-semibold text-slate-900">Bulk Execution Rules</p>
        <p className="mt-1">You can create or transfer 1 to 10 drug entries in a single blockchain transaction. Duplicate Drug IDs are blocked in each batch for safer execution.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-slate-900">Bulk Drug Creation</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {createRows.length}/{MAX_BULK_SIZE} rows
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {createRows.map((row, index) => (
              <div key={`create-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Drug Row {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeCreateRow(index)}
                    disabled={loading || createRows.length === 1}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputClass} placeholder="Drug ID" value={row.drugId} onChange={(e) => updateCreateRow(index, "drugId", e.target.value)} />
                  <input className={inputClass} placeholder="Drug Name" value={row.drugName} onChange={(e) => updateCreateRow(index, "drugName", e.target.value)} />
                  <input className={inputClass} placeholder="Batch Number" value={row.batchNumber} onChange={(e) => updateCreateRow(index, "batchNumber", e.target.value)} />
                  <input className={inputClass} placeholder="Unit (Tablets/Bottles)" value={row.unit} onChange={(e) => updateCreateRow(index, "unit", e.target.value)} />
                  <input className={inputClass} placeholder="Min Temp (Celsius)" type="number" value={row.minRequiredTemp} onChange={(e) => updateCreateRow(index, "minRequiredTemp", e.target.value)} />
                  <input className={inputClass} placeholder="Max Temp (Celsius)" type="number" value={row.maxRequiredTemp} onChange={(e) => updateCreateRow(index, "maxRequiredTemp", e.target.value)} />
                  <input className={inputClass} placeholder="Total Quantity" type="number" min="1" value={row.totalQuantity} onChange={(e) => updateCreateRow(index, "totalQuantity", e.target.value)} />
                  <input className={inputClass} placeholder="Location" value={row.location} onChange={(e) => updateCreateRow(index, "location", e.target.value)} />
                  <input className={inputClass} type="datetime-local" value={row.manufacturingDate} onChange={(e) => updateCreateRow(index, "manufacturingDate", e.target.value)} />
                  <input className={inputClass} type="datetime-local" value={row.expiryDate} onChange={(e) => updateCreateRow(index, "expiryDate", e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addCreateRow}
              disabled={loading || !isManufacturer || createRows.length >= MAX_BULK_SIZE}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Row
            </button>
            <button className={`${buttonClass}`} onClick={createDrugs} disabled={loading || !isManufacturer}>
              Create On-Chain
            </button>
          </div>
        </article>

        <article className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-slate-900">Bulk Transfer To Pharmacy</h2>
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
              {transferRows.length}/{MAX_BULK_SIZE} rows
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {transferRows.map((row, index) => (
              <div key={`transfer-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Transfer Row {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeTransferRow(index)}
                    disabled={loading || transferRows.length === 1}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputClass} placeholder="Drug ID" value={row.drugId} onChange={(e) => updateTransferRow(index, "drugId", e.target.value)} />
                  <input className={inputClass} placeholder="Transfer Quantity" type="number" min="1" value={row.quantity} onChange={(e) => updateTransferRow(index, "quantity", e.target.value)} />
                  <input className={inputClass} placeholder="Transfer Amount" type="number" min="0" value={row.amount} onChange={(e) => updateTransferRow(index, "amount", e.target.value)} />
                  <input className={inputClass} placeholder="Transfer Location" value={row.location} onChange={(e) => updateTransferRow(index, "location", e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addTransferRow}
              disabled={loading || !isManufacturer || transferRows.length >= MAX_BULK_SIZE}
              className="rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Row
            </button>
            <button className={buttonClass} onClick={transferDrugs} disabled={loading || !isManufacturer}>
              Transfer On-Chain
            </button>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <article className={`${cardClass} lg:col-span-1`}>
          <h2 className="text-xl font-semibold">Timeline Loader</h2>
          <div className="mt-4 flex gap-2">
            <input className={inputClass} placeholder="Drug ID" value={trackDrugId} onChange={(e) => setTrackDrugId(e.target.value)} />
            <button className={buttonClass} onClick={loadTimeline} disabled={loading}>Load</button>
          </div>
          <div className="mt-4 grid gap-3">
            <MetricCard label="Net Transferred Qty" value={summary.transferredQty} />
            <MetricCard label="Net Transferred Amount" value={summary.transferredAmount} />
            <MetricCard label="Net Sold Qty" value={summary.soldQty} />
            <MetricCard label="Remaining Qty" value={drugData?.remainingQuantity ?? "-"} />
          </div>
          {drugData ? (
            <div className="mt-4 space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <p>Name: {drugData.drugName}</p>
              <p>Unit: {drugData.unit}</p>
              <p>Status: {drugData.statusLabel}</p>
              <p>Required Temp Range: {drugData.minRequiredTemp}C to {drugData.maxRequiredTemp}C</p>
              <p>Dispatch Time: {parseUnixToDate(drugData.dispatchTimestamp)}</p>
              <p>Temp Validation: {drugData.temperatureChecked ? (drugData.temperatureCompromised ? "Invalid" : "Valid") : "Pending"}</p>
              <p>Packaging: {drugData.packagingDamaged ? "Damaged" : "OK"}</p>
              <p>Owner: {formatAddress(drugData.currentOwner)}</p>
              <p>Expiry: {parseUnixToDate(drugData.expiryDate)}</p>
            </div>
          ) : null}
        </article>

        <article className={`${cardClass} lg:col-span-3`}>
          <h2 className="text-xl font-semibold">Manufacturer Timeline</h2>
          <p className="mt-1 text-sm text-slate-600">Complete lifecycle records including quantities and amount transferred.</p>
          <div className="mt-4 max-h-136 overflow-auto pr-2">
            <Timeline history={history} parseUnixToDate={parseUnixToDate} formatAddress={formatAddress} />
          </div>
        </article>
      </section>
    </AppShell>
  );
}
