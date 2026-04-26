import { BrowserProvider, Contract, isAddress } from "ethers";

export const SEPOLIA_CHAIN_ID = "0xaa36a7";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
export const MANUFACTURER_ROLE_ADDRESS =
  process.env.NEXT_PUBLIC_MANUFACTURER_ADDRESS || "";
export const PHARMACY_ROLE_ADDRESS = process.env.NEXT_PUBLIC_PHARMACY_ADDRESS || "";

export const DRUG_SUPPLY_CHAIN_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "manufacturerAddress", type: "address", internalType: "address" },
      { name: "pharmacyAddress", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addDrug",
    inputs: [
      {
        name: "params",
        type: "tuple",
        internalType: "struct DrugSupplyChain.AddDrugParams",
        components: [
          { name: "drugId", type: "string", internalType: "string" },
          { name: "drugName", type: "string", internalType: "string" },
          { name: "batchNumber", type: "string", internalType: "string" },
          { name: "unit", type: "string", internalType: "string" },
          { name: "minRequiredTemp", type: "int256", internalType: "int256" },
          { name: "maxRequiredTemp", type: "int256", internalType: "int256" },
          { name: "totalQuantity", type: "uint256", internalType: "uint256" },
          { name: "manufacturingDate", type: "uint256", internalType: "uint256" },
          { name: "expiryDate", type: "uint256", internalType: "uint256" },
          { name: "location", type: "string", internalType: "string" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addDrugs",
    inputs: [
      {
        name: "paramsList",
        type: "tuple[]",
        internalType: "struct DrugSupplyChain.AddDrugParams[]",
        components: [
          { name: "drugId", type: "string", internalType: "string" },
          { name: "drugName", type: "string", internalType: "string" },
          { name: "batchNumber", type: "string", internalType: "string" },
          { name: "unit", type: "string", internalType: "string" },
          { name: "minRequiredTemp", type: "int256", internalType: "int256" },
          { name: "maxRequiredTemp", type: "int256", internalType: "int256" },
          { name: "totalQuantity", type: "uint256", internalType: "uint256" },
          { name: "manufacturingDate", type: "uint256", internalType: "uint256" },
          { name: "expiryDate", type: "uint256", internalType: "uint256" },
          { name: "location", type: "string", internalType: "string" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferDrugToPharmacy",
    inputs: [
      {
        name: "params",
        type: "tuple",
        internalType: "struct DrugSupplyChain.TransferParams",
        components: [
          { name: "drugId", type: "string", internalType: "string" },
          { name: "quantity", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "location", type: "string", internalType: "string" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferDrugsToPharmacy",
    inputs: [
      {
        name: "paramsList",
        type: "tuple[]",
        internalType: "struct DrugSupplyChain.TransferParams[]",
        components: [
          { name: "drugId", type: "string", internalType: "string" },
          { name: "quantity", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "location", type: "string", internalType: "string" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "receiveDrug",
    inputs: [
      {
        name: "params",
        type: "tuple",
        internalType: "struct DrugSupplyChain.ReceiveParams",
        components: [
          { name: "drugId", type: "string", internalType: "string" },
          { name: "quantity", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "recordedTemperature", type: "int256", internalType: "int256" },
          { name: "packagingIntact", type: "bool", internalType: "bool" },
          { name: "damageProofHash", type: "string", internalType: "string" },
          { name: "location", type: "string", internalType: "string" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sellDrug",
    inputs: [
      {
        name: "params",
        type: "tuple",
        internalType: "struct DrugSupplyChain.SellParams",
        components: [
          { name: "drugId", type: "string", internalType: "string" },
          { name: "customer", type: "address", internalType: "address" },
          { name: "quantity", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "location", type: "string", internalType: "string" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "refreshExpiryStatus",
    inputs: [{ name: "drugId", type: "string", internalType: "string" }],
    outputs: [{ name: "changed", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getDrug",
    inputs: [{ name: "drugId", type: "string", internalType: "string" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct DrugSupplyChain.Drug",
        components: [
          { name: "drugId", type: "string", internalType: "string" },
          { name: "drugName", type: "string", internalType: "string" },
          { name: "batchNumber", type: "string", internalType: "string" },
          { name: "unit", type: "string", internalType: "string" },
          { name: "minRequiredTemp", type: "int256", internalType: "int256" },
          { name: "maxRequiredTemp", type: "int256", internalType: "int256" },
          { name: "manufacturerAddress", type: "address", internalType: "address" },
          { name: "manufacturingDate", type: "uint256", internalType: "uint256" },
          { name: "expiryDate", type: "uint256", internalType: "uint256" },
          { name: "dispatchTimestamp", type: "uint256", internalType: "uint256" },
          { name: "receiveTimestamp", type: "uint256", internalType: "uint256" },
          { name: "recordedDeliveryTemp", type: "int256", internalType: "int256" },
          { name: "temperatureChecked", type: "bool", internalType: "bool" },
          { name: "temperatureCompromised", type: "bool", internalType: "bool" },
          { name: "packagingDamaged", type: "bool", internalType: "bool" },
          { name: "damageProofHash", type: "string", internalType: "string" },
          { name: "totalQuantity", type: "uint256", internalType: "uint256" },
          { name: "remainingQuantity", type: "uint256", internalType: "uint256" },
          { name: "transferredQuantity", type: "uint256", internalType: "uint256" },
          { name: "soldQuantity", type: "uint256", internalType: "uint256" },
          { name: "currentOwner", type: "address", internalType: "address" },
          { name: "status", type: "uint8", internalType: "enum DrugSupplyChain.DrugStatus" },
          { name: "location", type: "string", internalType: "string" },
          { name: "exists", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getHistory",
    inputs: [{ name: "drugId", type: "string", internalType: "string" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct DrugSupplyChain.SupplyTransaction[]",
        components: [
          { name: "transactionId", type: "uint256", internalType: "uint256" },
          { name: "from", type: "address", internalType: "address" },
          { name: "to", type: "address", internalType: "address" },
          { name: "timestamp", type: "uint256", internalType: "uint256" },
          { name: "quantity", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "action", type: "string", internalType: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
];

export const STATUS_LABELS = {
  0: "None",
  1: "Manufactured",
  2: "In Transit",
  3: "Delivered",
  4: "Sold",
  5: "Expired",
};

export function formatAddress(value = "") {
  if (!value || value.length < 10) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function parseUnixToDate(unixSeconds) {
  const value = Number(unixSeconds ?? 0);
  if (!value) return "-";
  return new Date(value * 1000).toLocaleString();
}

export function toUnixSeconds(dateInput) {
  if (!dateInput) return 0;
  return Math.floor(new Date(dateInput).getTime() / 1000);
}

export function isExpired(expiryUnix) {
  if (!expiryUnix) return false;
  const now = Math.floor(Date.now() / 1000);
  return now > Number(expiryUnix);
}

export async function getWalletContext() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected. Install MetaMask to continue.");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new BrowserProvider(window.ethereum);

  const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
  if (currentChainId !== SEPOLIA_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "SEP",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw new Error("Please approve switching MetaMask to Sepolia Testnet.");
      }
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

export function getContractInstance(signerOrProvider) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local");
  }

  if (!isAddress(CONTRACT_ADDRESS)) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not a valid Ethereum address");
  }

  return new Contract(CONTRACT_ADDRESS, DRUG_SUPPLY_CHAIN_ABI, signerOrProvider);
}

export function resolveRole(address) {
  const normalized = (address || "").toLowerCase();
  if (normalized && normalized === MANUFACTURER_ROLE_ADDRESS.toLowerCase()) {
    return "Manufacturer";
  }
  if (normalized && normalized === PHARMACY_ROLE_ADDRESS.toLowerCase()) {
    return "Pharmacy";
  }
  return "Customer";
}

export function validateEthAddress(address) {
  return isAddress(address || "");
}

export function toPositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return 0;
  return parsed;
}

export function toInteger(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}

export function mapDrug(rawDrug) {
  return {
    drugId: rawDrug.drugId,
    drugName: rawDrug.drugName,
    batchNumber: rawDrug.batchNumber,
    unit: rawDrug.unit,
    minRequiredTemp: Number(rawDrug.minRequiredTemp),
    maxRequiredTemp: Number(rawDrug.maxRequiredTemp),
    manufacturerAddress: rawDrug.manufacturerAddress,
    manufacturingDate: Number(rawDrug.manufacturingDate),
    expiryDate: Number(rawDrug.expiryDate),
    dispatchTimestamp: Number(rawDrug.dispatchTimestamp),
    receiveTimestamp: Number(rawDrug.receiveTimestamp),
    recordedDeliveryTemp: Number(rawDrug.recordedDeliveryTemp),
    temperatureChecked: Boolean(rawDrug.temperatureChecked),
    temperatureCompromised: Boolean(rawDrug.temperatureCompromised),
    packagingDamaged: Boolean(rawDrug.packagingDamaged),
    damageProofHash: rawDrug.damageProofHash,
    totalQuantity: Number(rawDrug.totalQuantity),
    remainingQuantity: Number(rawDrug.remainingQuantity),
    transferredQuantity: Number(rawDrug.transferredQuantity),
    soldQuantity: Number(rawDrug.soldQuantity),
    currentOwner: rawDrug.currentOwner,
    statusCode: Number(rawDrug.status),
    statusLabel: STATUS_LABELS[Number(rawDrug.status)] || "Unknown",
    location: rawDrug.location,
  };
}

export function mapHistory(rawHistory) {
  return rawHistory.map((item) => ({
    transactionId: Number(item.transactionId),
    from: item.from,
    to: item.to,
    timestamp: Number(item.timestamp),
    quantity: Number(item.quantity),
    amount: Number(item.amount),
    action: item.action,
  }));
}

export function summarizeHistory(history) {
  const summary = {
    transferredQty: 0,
    transferredAmount: 0,
    receivedQty: 0,
    receivedAmount: 0,
    soldQty: 0,
    soldAmount: 0,
  };

  history.forEach((tx) => {
    if (tx.action === "Transferred") {
      summary.transferredQty += tx.quantity;
      summary.transferredAmount += tx.amount;
    }
    if (tx.action === "Received") {
      summary.receivedQty += tx.quantity;
      summary.receivedAmount += tx.amount;
    }
    if (tx.action === "Sold") {
      summary.soldQty += tx.quantity;
      summary.soldAmount += tx.amount;
    }
  });

  return summary;
}

export async function loadDrugWithHistory(contract, drugId) {
  const drug = mapDrug(await contract.getDrug(drugId));
  const history = mapHistory(await contract.getHistory(drugId));
  const summary = summarizeHistory(history);
  return { drug, history, summary };
}
