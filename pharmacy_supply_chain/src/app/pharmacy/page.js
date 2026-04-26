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
  validateEthAddress,
} from "@/lib/contract";
import { uploadDamageProof } from "@/lib/cloudinary";
import {
  AppShell,
  MetricCard,
  Timeline,
  WalletBanner,
  buttonClass,
  cardClass,
  inputClass,
} from "@/components/dashboard-ui";

export default function PharmacyPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletRole, setWalletRole] = useState("Not connected");
  const [message, setMessage] = useState("Connect MetaMask and use your pharmacy wallet.");
  const [loading, setLoading] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [damageProofFile, setDamageProofFile] = useState(null);
  const [damageProofUrl, setDamageProofUrl] = useState("");

  const [form, setForm] = useState({
    drugId: "",
    receiveQuantity: "",
    receiveAmount: "",
    deliveryTemperature: "",
    packagingIntact: "yes",
    receiveLocation: "",
    customerAddress: "",
    sellQuantity: "",
    sellAmount: "",
    sellLocation: "",
  });

  const [trackDrugId, setTrackDrugId] = useState("");
  const [drugData, setDrugData] = useState(null);
  const [history, setHistory] = useState([]);
  const summary = useMemo(() => summarizeHistory(history), [history]);
  const isPharmacy = walletRole === "Pharmacy";

  const connectWallet = async () => {
    try {
      setLoading(true);
      const { address } = await getWalletContext();
      setWalletAddress(address);
      setWalletRole(resolveRole(address));
      setMessage("Wallet connected. Pharmacy actions are enabled for authorized account.");
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

  const receiveDrug = async () => {
    const quantity = toPositiveInt(form.receiveQuantity);
    const amount = toPositiveInt(form.receiveAmount);
    const recordedTemperature = toInteger(form.deliveryTemperature);
    const packagingIntact = form.packagingIntact !== "no";
    if (!form.drugId || !quantity || form.deliveryTemperature === "") {
      setMessage("Enter drug ID, receive quantity, and delivery temperature.");
      return;
    }

    let proofHash = "";
    if (!packagingIntact) {
      if (damageProofUrl) {
        proofHash = damageProofUrl;
      } else if (damageProofFile) {
        try {
          setUploadingProof(true);
          const uploadResult = await uploadDamageProof(damageProofFile);
          proofHash = uploadResult.secureUrl;
          setDamageProofUrl(uploadResult.secureUrl);
        } catch (error) {
          setMessage(error.message || "Damage proof upload failed");
          return;
        } finally {
          setUploadingProof(false);
        }
      } else {
        setMessage("Packaging is damaged. Upload proof image before receiving the drug.");
        return;
      }
    }

    await withContract(
      (contract) =>
        contract.receiveDrug({
          drugId: form.drugId,
          quantity: quantity,
          amount: amount,
          recordedTemperature: recordedTemperature,
          packagingIntact: packagingIntact,
          damageProofHash: proofHash,
          location: form.receiveLocation || "Pharmacy receiving bay",
        }),
      `Drug ${form.drugId} received with quantity ${quantity}.`
    );
  };

  const uploadProofImage = async () => {
    if (!damageProofFile) {
      setMessage("Select an image file first.");
      return;
    }

    try {
      setUploadingProof(true);
      const uploadResult = await uploadDamageProof(damageProofFile);
      setDamageProofUrl(uploadResult.secureUrl);
      setMessage("Damage proof uploaded successfully. You can now record a damaged package.");
    } catch (error) {
      setMessage(error.message || "Damage proof upload failed");
    } finally {
      setUploadingProof(false);
    }
  };

  const sellDrug = async () => {
    const quantity = toPositiveInt(form.sellQuantity);
    const amount = toPositiveInt(form.sellAmount);

    if (!form.drugId || !form.customerAddress || !quantity) {
      setMessage("Enter drug ID, customer wallet, and sell quantity.");
      return;
    }

    if (!validateEthAddress(form.customerAddress)) {
      setMessage("Customer address is not valid.");
      return;
    }

    await withContract(
      (contract) =>
        contract.sellDrug({
          drugId: form.drugId,
          customer: form.customerAddress,
          quantity: quantity,
          amount: amount,
          location: form.sellLocation || "Pharmacy counter",
        }),
      `Sold ${quantity} units of drug ${form.drugId} to ${form.customerAddress}.`
    );
  };

  const loadTimeline = async () => {
    if (!trackDrugId) {
      setMessage("Enter drug ID to load timeline.");
      return;
    }

    try {
      setLoading(true);
      const { signer } = await getWalletContext();
      const contract = getContractInstance(signer);
      const { drug, history: loadedHistory } = await loadDrugWithHistory(contract, trackDrugId);
      setDrugData(drug);
      setHistory(loadedHistory);
      setMessage(`Loaded pharmacy analytics for ${trackDrugId}.`);
    } catch (error) {
      setDrugData(null);
      setHistory([]);
      setMessage(error.reason || error.shortMessage || error.message || "Unable to load timeline");
    } finally {
      setLoading(false);
    }
  };

  const stockAtStore =
    drugData && (drugData.statusCode === 3 || drugData.statusCode === 4)
      ? drugData.remainingQuantity
      : 0;

  return (
    <AppShell
      title="Pharmacy Dashboard"
      subtitle="Receive with temperature and package verification, upload damage proof, and monitor inventory sales timeline."
    >
      <WalletBanner
        loading={loading}
        walletAddress={walletAddress}
        walletRole={walletRole}
        message={message}
        onConnect={connectWallet}
        formatAddress={formatAddress}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <article className={cardClass}>
          <h2 className="text-xl font-semibold">Receive Drug Shipment</h2>
          <div className="mt-4 grid gap-3">
            <input className={inputClass} placeholder="Drug ID" value={form.drugId} onChange={(e) => setForm((p) => ({ ...p, drugId: e.target.value }))} />
            <input className={inputClass} type="number" min="1" placeholder="Received Quantity" value={form.receiveQuantity} onChange={(e) => setForm((p) => ({ ...p, receiveQuantity: e.target.value }))} />
            <input className={inputClass} type="number" min="0" placeholder="Received Amount" value={form.receiveAmount} onChange={(e) => setForm((p) => ({ ...p, receiveAmount: e.target.value }))} />
            <input className={inputClass} type="number" placeholder="Delivery Temperature (Celsius)" value={form.deliveryTemperature} onChange={(e) => setForm((p) => ({ ...p, deliveryTemperature: e.target.value }))} />
            <select className={inputClass} value={form.packagingIntact} onChange={(e) => setForm((p) => ({ ...p, packagingIntact: e.target.value }))}>
              <option value="yes">Packaging Intact</option>
              <option value="no">Packaging Damaged</option>
            </select>
            <input
              className={inputClass}
              type="file"
              accept="image/*"
              onChange={(e) => setDamageProofFile(e.target.files?.[0] || null)}
            />
            <input className={inputClass} placeholder="Receive Location" value={form.receiveLocation} onChange={(e) => setForm((p) => ({ ...p, receiveLocation: e.target.value }))} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className={buttonClass} onClick={uploadProofImage} disabled={loading || uploadingProof}>
              {uploadingProof ? "Uploading..." : "Upload Damage Proof"}
            </button>
            <button className={buttonClass} onClick={receiveDrug} disabled={loading || !isPharmacy || uploadingProof}>
            Receive Drug
            </button>
          </div>
          {damageProofUrl ? (
            <p className="mt-3 text-xs text-emerald-700 break-all">Damage proof URL: {damageProofUrl}</p>
          ) : null}
        </article>

        <article className={cardClass}>
          <h2 className="text-xl font-semibold">Sell Drug To Customer</h2>
          <div className="mt-4 grid gap-3">
            <input className={inputClass} placeholder="Drug ID" value={form.drugId} onChange={(e) => setForm((p) => ({ ...p, drugId: e.target.value }))} />
            <input className={inputClass} placeholder="Customer Wallet Address" value={form.customerAddress} onChange={(e) => setForm((p) => ({ ...p, customerAddress: e.target.value }))} />
            <input className={inputClass} type="number" min="1" placeholder="Sell Quantity" value={form.sellQuantity} onChange={(e) => setForm((p) => ({ ...p, sellQuantity: e.target.value }))} />
            <input className={inputClass} type="number" min="0" placeholder="Sell Amount" value={form.sellAmount} onChange={(e) => setForm((p) => ({ ...p, sellAmount: e.target.value }))} />
            <input className={inputClass} placeholder="Sell Location" value={form.sellLocation} onChange={(e) => setForm((p) => ({ ...p, sellLocation: e.target.value }))} />
          </div>
          <button className={`${buttonClass} mt-4`} onClick={sellDrug} disabled={loading || !isPharmacy}>
            Sell Drug
          </button>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <article className={`${cardClass} lg:col-span-1`}>
          <h2 className="text-xl font-semibold">Pharmacy Analytics</h2>
          <div className="mt-4 flex gap-2">
            <input className={inputClass} placeholder="Drug ID" value={trackDrugId} onChange={(e) => setTrackDrugId(e.target.value)} />
            <button className={buttonClass} onClick={loadTimeline} disabled={loading}>Load</button>
          </div>
          <div className="mt-4 grid gap-3">
            <MetricCard label="Net Received Qty" value={summary.receivedQty} />
            <MetricCard label="Net Sold Qty" value={summary.soldQty} />
            <MetricCard label="Net Sales Amount" value={summary.soldAmount} />
            <MetricCard label="Stock At Store" value={stockAtStore} />
          </div>
          {drugData ? (
            <div className="mt-4 space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <p>Name: {drugData.drugName}</p>
              <p>Unit: {drugData.unit}</p>
              <p>Status: {drugData.statusLabel}</p>
              <p>Owner: {formatAddress(drugData.currentOwner)}</p>
              <p>Location: {drugData.location || "-"}</p>
              <p>Required Temp Range: {drugData.minRequiredTemp}C to {drugData.maxRequiredTemp}C</p>
              <p>Recorded Delivery Temp: {drugData.temperatureChecked ? `${drugData.recordedDeliveryTemp}C` : "Not recorded"}</p>
              <p>Temperature Validation: {drugData.temperatureChecked ? (drugData.temperatureCompromised ? "Invalid" : "Valid") : "Pending"}</p>
              <p>Packaging Status: {drugData.packagingDamaged ? "Damaged" : "OK"}</p>
              {drugData.packagingDamaged && drugData.damageProofHash ? (
                <a className="text-emerald-700 underline" href={drugData.damageProofHash} target="_blank" rel="noreferrer">
                  View Damage Proof
                </a>
              ) : null}
            </div>
          ) : null}
        </article>

        <article className={`${cardClass} lg:col-span-3`}>
          <h2 className="text-xl font-semibold">Pharmacy Timeline</h2>
          <p className="mt-1 text-sm text-slate-600">All records from receiving to customer sales with quantity and amount.</p>
          <div className="mt-4 max-h-136 overflow-auto pr-2">
            <Timeline history={history} parseUnixToDate={parseUnixToDate} formatAddress={formatAddress} />
          </div>
        </article>
      </section>
    </AppShell>
  );
}
