# 🏥 Blockchain Cold-Chain Pharmacy Supply Tracker

<div align="center">

[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia%20Testnet-blue?logo=ethereum)](https://sepolia.etherscan.io/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.2-black?logo=next.js)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-Smart%20Contracts-red?logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A blockchain-based pharmaceutical supply chain management system with **real-time cold-chain monitoring**, **packaging integrity verification**, and **immutable audit trails** for complete transparency and traceability.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Demo Flow](#-demo-flow) • [API Reference](#-api-reference)

</div>

---

## 🌟 Overview

This project revolutionizes pharmaceutical supply chain management by leveraging **Ethereum blockchain technology** to ensure:

- ✅ **Cold-chain compliance** with real-time temperature monitoring and validation
- ✅ **Packaging integrity verification** with damage proof documentation
- ✅ **Complete traceability** from manufacturer to end customer
- ✅ **Immutable audit trails** for regulatory compliance
- ✅ **Role-based access control** for different supply chain participants
- ✅ **Transparent verification** of product authenticity and quality

---

## 🎯 Features

### 🔗 Blockchain Verification
- **Drug Identity & Metadata**: Secure on-chain storage of pharmaceutical batch information
- **Temperature Range Validation**: Min/max temperature requirements per batch with real-time verification
- **Timestamp Tracking**: Dispatch and receive timestamps for complete chronological records
- **Packaging Integrity Status**: Binary OK/Damaged status with photographic evidence
- **Damage Proof Storage**: Cloudinary-hosted images with on-chain hash verification
- **Immutable History**: Complete audit trail for all state changes (Created → Transferred → Received → Sold → Expired)

### 👥 Multi-Role Dashboard
- **Manufacturer Dashboard**: Batch creation, shipment dispatch, temperature range configuration
- **Pharmacy Dashboard**: Delivery verification, temperature recording, packaging inspection, inventory management
- **Customer Portal**: Public product tracking, cold-chain validation, damage evidence review

### 🔐 Security & Authentication
- MetaMask wallet integration for secure authentication
- Role-based access control (RBAC) at smart contract level
- On-chain access authorization
- Ethereum Sepolia testnet for safe testing

### 📸 Media Management
- Cloudinary integration for damage proof imagery
- Client-side image uploads with secure presets
- On-chain proof URL storage for immutable reference

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Blockchain** | Ethereum Sepolia | Smart contract deployment & execution |
| **Smart Contracts** | Solidity | Business logic & state management |
| **Frontend Framework** | Next.js 16.2.2 | Full-stack React application |
| **UI Library** | React 19.2 | Component-based UI development |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Web3 Integration** | ethers.js 6.16 | Ethereum interaction & contract calls |
| **Authentication** | MetaMask | Wallet-based user authentication |
| **Media Storage** | Cloudinary | Damage proof image hosting |
| **Build Tool** | Turbopack | High-performance bundling |

---

## 📋 Project Structure

```
pharmacy_supply_chain/
├── contracts/
│   └── DrugSupplyChain.sol       # Main smart contract (ABI & business logic)
├── src/
│   ├── app/
│   │   ├── layout.js             # Root layout wrapper
│   │   ├── page.js               # Home page
│   │   ├── globals.css           # Global styles
│   │   ├── manufacturer/
│   │   │   └── page.js           # Manufacturer dashboard
│   │   ├── pharmacy/
│   │   │   └── page.js           # Pharmacy dashboard
│   │   └── customer/
│   │       └── page.js           # Customer tracking portal
├── components/
│   └── dashboard-ui.js           # Shared UI components
├── lib/
│   ├── contract.js               # Smart contract interface & ABI
│   ├── cloudinary.js             # Cloudinary upload handler
│   └── ...
├── public/                        # Static assets
├── package.json                   # Dependencies & scripts
├── next.config.mjs               # Next.js configuration
├── postcss.config.mjs            # PostCSS configuration
├── jsconfig.json                 # JS path aliases
└── README.md                      # This file
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- 🔌 [MetaMask](https://metamask.io/) browser extension installed
- 🔗 Access to [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)
- 🪙 Sepolia test ETH (get from [Sepolia Faucet](https://www.alchemy.com/faucet/sepolia))
- 📦 Node.js 18+ and npm installed
- 🖼 Cloudinary account (optional, for damage proof uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pharmacy_supply_chain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Smart Contract
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...          # Deployed contract address
   NEXT_PUBLIC_MANUFACTURER_ADDRESS=0x...      # Manufacturer wallet address
   NEXT_PUBLIC_PHARMACY_ADDRESS=0x...          # Pharmacy wallet address
   
   # Cloudinary (for damage proof uploads)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
   ```

4. **Deploy Smart Contract** (Optional - use existing deployment)
   
   To deploy a new instance:
   ```bash
   # Using Remix: https://remix.ethereum.org/
   # - Compile DrugSupplyChain.sol
   # - Deploy to Sepolia with constructor args:
   #   - manufacturerAddress
   #   - pharmacyAddress
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

---

## 🎮 Dashboard Routes

| Route | User Role | Features |
|-------|-----------|----------|
| `/manufacturer` | 🏭 Manufacturer | • Create drug batches with temperature ranges<br/>• Transfer shipments to pharmacy<br/>• Monitor verification states<br/>• Track batch status |
| `/pharmacy` | 💊 Pharmacy | • Verify delivery temperature<br/>• Inspect packaging integrity<br/>• Upload damage proof images<br/>• Record received inventory<br/>• Process customer sales |
| `/customer` | 👤 Customer | • Track full drug lifecycle<br/>• View cold-chain validity<br/>• Inspect packaging status<br/>• Access damage evidence links<br/>• Verify product authenticity |

---

## 📊 Data Models

### Drug Batch Structure
```javascript
{
  batchId: uint256,              // Unique batch identifier
  drugName: string,              // Medication name
  manufacturer: address,         // Manufacturer wallet
  pharmacy: address,             // Destination pharmacy
  minRequiredTemp: int256,       // Minimum temperature requirement (°C)
  maxRequiredTemp: int256,       // Maximum temperature requirement (°C)
  quantity: uint256,             // Units in batch
  status: uint8,                 // Current state (Created/Transferred/Received/Sold/Expired)
  dispatchTimestamp: uint256,    // When batch left manufacturer
  receiveTimestamp: uint256,     // When batch arrived at pharmacy
  deliveryTemp: int256,          // Actual delivery temperature
  packagingIntact: bool,         // Packaging integrity status
  damageProofHash: string,       // Cloudinary URL or damage evidence hash
  isCompliant: bool              // Cold-chain validation flag
}
```

---

## 🔄 Complete Demo Flow

### Step-by-Step Walkthrough

1. **🏭 Manufacturer: Create Drug Batch**
   - Connect MetaMask wallet to Sepolia
   - Navigate to `/manufacturer`
   - Enter drug details:
     - Drug name & quantity
     - Temperature range (e.g., 2-8°C for refrigerated)
   - Submit transaction (sign with MetaMask)
   - Batch created on blockchain with "Created" status

2. **📦 Manufacturer: Transfer Shipment**
   - Select batch from dashboard
   - Confirm transfer to designated pharmacy
   - Transaction recorded on-chain
   - Batch status → "Transferred"

3. **💊 Pharmacy: Receive & Verify**
   - Connect pharmacy wallet to Sepolia
   - Navigate to `/pharmacy`
   - Record actual delivery temperature
   - Inspect package for damage:
     - ✅ **Intact**: Submit verification
     - ❌ **Damaged**: Upload proof image first

4. **📸 Pharmacy: Upload Damage Proof (if needed)**
   - Capture photos of damage
   - Upload via Cloudinary integration
   - Receipt of proof URL
   - Submit with "Damaged" status

5. **💰 Pharmacy: Process Sale**
   - Record sale to customer
   - Batch status → "Sold"
   - Generate immutable transaction record

6. **🔍 Customer: Verify & Track**
   - Navigate to `/customer`
   - Enter batch ID or tracking code
   - View complete journey:
     - ✅ Manufacturer → Pharmacy pipeline
     - ✅ Cold-chain compliance status
     - ✅ Delivery temperature validation
     - ✅ Packaging integrity report
     - 📸 Damage evidence (if applicable)
   - Full audit trail displayed

---

## 🔐 Smart Contract Details

### Contract Location
```
contracts/DrugSupplyChain.sol
```

### Key Functions

#### Manufacturer Functions
```solidity
createDrug(name, minTemp, maxTemp, quantity) → batchId
transferDrugToPharmacy(batchId, pharmacyAddress)
```

#### Pharmacy Functions
```solidity
receiveDrug(batchId, deliveryTemp, packagingIntact, damageProofHash)
sellDrug(batchId, customerName)
```

#### Query Functions
```solidity
getDrugDetails(batchId) → DrugBatch
getDrugHistory(batchId) → Event[]
isColdChainCompliant(batchId) → bool
getPharmacyInventory(pharmacyAddress) → batchId[]
```

### Deployment Instructions

1. **Compile Contract**
   ```bash
   solc contracts/DrugSupplyChain.sol --optimize
   ```

2. **Deploy on Sepolia**
   - Use [Remix IDE](https://remix.ethereum.org/)
   - Paste `DrugSupplyChain.sol` content
   - Set compiler to Solidity 0.8.x
   - Deploy with constructor:
     - `manufacturerAddress`: 0x...
     - `pharmacyAddress`: 0x...
   - Note the deployed contract address

3. **Update Environment**
   - Copy contract address to `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - Restart development server

---

## 🔌 Environment Configuration Guide

### Required Variables

```env
# Contract Addresses (Required)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_MANUFACTURER_ADDRESS=0xManufacturerWallet
NEXT_PUBLIC_PHARMACY_ADDRESS=0xPharmacyWallet

# Cloudinary Configuration (Required for Damage Proofs)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

### How to Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Go to Dashboard → Settings → Upload
3. Create unsigned upload preset with:
   - **Unsigned**: ✅ Enabled
   - **Resource type**: Image
4. Copy cloud name and preset name to `.env.local`

### Important Notes

⚠️ **DO NOT commit `.env.local` to version control**
- Add to `.gitignore`
- Never share private keys or secrets
- Use test wallets only on testnet

---

## 📱 API Integration Examples

### Initialize Contract Connection
```javascript
import { ethers } from 'ethers';
import contractABI from '@/lib/contract';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  contractABI,
  signer
);
```

### Create Drug Batch
```javascript
const tx = await contract.createDrug(
  'Ibuprofen 200mg',  // name
  2,                  // minTemp (°C)
  8,                  // maxTemp (°C)
  1000                // quantity
);
await tx.wait();
```

### Receive with Damage Proof
```javascript
const tx = await contract.receiveDrug(
  batchId,
  5,                              // actual delivery temp
  false,                          // packaging damaged
  'https://res.cloudinary.com/...' // proof URL
);
await tx.wait();
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **MetaMask not connecting** | Ensure MetaMask is on Sepolia testnet, not mainnet |
| **Insufficient gas** | Get free Sepolia ETH from [faucet](https://www.alchemy.com/faucet/sepolia) |
| **Contract address error** | Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local` |
| **Cloudinary upload fails** | Check unsigned preset is enabled & env vars are correct |
| **Build warning (multiple lockfiles)** | Run `npm install` from `pharmacy_supply_chain` folder only |
| **Transaction reverted** | Check role authorization (must be manufacturer/pharmacy for respective functions) |

---

## 📝 Development Notes

### Important Configuration Details
- 🗂️ Always run npm scripts from `pharmacy_supply_chain` directory, not workspace parent
- 📦 Ensure single lockfile (package-lock.json) to avoid build conflicts
- 🔄 When contract schema changes (new fields/params), redeploy contract and update address
- 🖼️ ABI tuple components must match Solidity struct definitions exactly
- 🔐 Cloudinary preset must be unsigned for client-side uploads

### Performance Optimization
- Turbopack enabled for faster builds
- React Compiler active for optimized rendering
- Tailwind CSS v4 for minimal bundle size

---

## 🚦 Getting Help

### Resources
- 📚 [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- 🔗 [ethers.js Documentation](https://docs.ethers.org/)
- ⚛️ [Next.js Documentation](https://nextjs.org/docs)
- ☂️ [Tailwind CSS Docs](https://tailwindcss.com/docs)
- 🏦 [Sepolia Testnet Faucet](https://www.alchemy.com/faucet/sepolia)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

## 📞 Contact & Support

For questions, issues, or suggestions:
- 📧 Open an issue on GitHub
- 💬 Start a discussion in the repo
- 🐛 Report bugs with detailed reproduction steps

---

<div align="center">

**Made with ❤️ for transparent pharmaceutical supply chains**

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/pharmacy-supply-chain?style=social)](https://github.com/)
[![Twitter Follow](https://img.shields.io/twitter/follow/yourhandle?style=social)](https://twitter.com/)

</div>
