// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DrugSupplyChain {
    uint256 public constant MAX_BULK_SIZE = 10;

    enum DrugStatus {
        None,
        Manufactured,
        InTransit,
        Delivered,
        Sold,
        Expired
    }

    struct Drug {
        string drugId;
        string drugName;
        string batchNumber;
        string unit;
        int256 minRequiredTemp;
        int256 maxRequiredTemp;
        address manufacturerAddress;
        uint256 manufacturingDate;
        uint256 expiryDate;
        uint256 dispatchTimestamp;
        uint256 receiveTimestamp;
        int256 recordedDeliveryTemp;
        bool temperatureChecked;
        bool temperatureCompromised;
        bool packagingDamaged;
        string damageProofHash;
        uint256 totalQuantity;
        uint256 remainingQuantity;
        uint256 transferredQuantity;
        uint256 soldQuantity;
        address currentOwner;
        DrugStatus status;
        string location;
        bool exists;
    }

    struct SupplyTransaction {
        uint256 transactionId;
        address from;
        address to;
        uint256 timestamp;
        uint256 quantity;
        uint256 amount;
        string action;
    }

    // ✅ NEW: wrap addDrug's 8 params into a struct
    struct AddDrugParams {
        string drugId;
        string drugName;
        string batchNumber;
        string unit;
        int256 minRequiredTemp;
        int256 maxRequiredTemp;
        uint256 totalQuantity;
        uint256 manufacturingDate;
        uint256 expiryDate;
        string location;
    }

    struct TransferParams {
        string drugId;
        uint256 quantity;
        uint256 amount;
        string location;
    }

    struct ReceiveParams {
        string drugId;
        uint256 quantity;
        uint256 amount;
        int256 recordedTemperature;
        bool packagingIntact;
        string damageProofHash;
        string location;
    }

    struct SellParams {
        string drugId;
        address customer;
        uint256 quantity;
        uint256 amount;
        string location;
    }

    mapping(string => Drug) private drugs;
    mapping(string => SupplyTransaction[]) private transactionHistory;

    uint256 private nextTransactionId = 1;

    address public immutable manufacturer;
    address public immutable pharmacy;

    event DrugAdded(string indexed drugId, address indexed manufacturerAddress);
    event DrugTransferred(string indexed drugId, address indexed to);
    event DrugReceived(string indexed drugId, address indexed pharmacyAddress);
    event DrugVerified(
        string indexed drugId,
        int256 recordedTemperature,
        bool temperatureValid,
        bool packagingIntact,
        string damageProofHash
    );
    event DrugSold(string indexed drugId, address indexed customerAddress);
    event DrugExpired(string indexed drugId);

    modifier onlyManufacturer() {
        require(msg.sender == manufacturer, "Only manufacturer");
        _;
    }

    modifier onlyPharmacy() {
        require(msg.sender == pharmacy, "Only pharmacy");
        _;
    }

    modifier drugExists(string calldata drugId) {
        require(drugs[drugId].exists, "Drug does not exist");
        _;
    }

    constructor(address manufacturerAddress, address pharmacyAddress) {
        require(manufacturerAddress != address(0), "Invalid manufacturer address");
        require(pharmacyAddress != address(0), "Invalid pharmacy address");
        manufacturer = manufacturerAddress;
        pharmacy = pharmacyAddress;
    }

    // ✅ CHANGED: flat params → calldata struct
    function addDrug(
        AddDrugParams calldata params
    ) external onlyManufacturer {
        _addDrug(params);
    }

    function addDrugs(
        AddDrugParams[] calldata paramsList
    ) external onlyManufacturer {
        require(paramsList.length > 0, "Empty batch");
        require(paramsList.length <= MAX_BULK_SIZE, "Max 10 drugs per batch");

        for (uint256 i = 0; i < paramsList.length; i++) {
            _addDrug(paramsList[i]);
        }
    }

    function _addDrug(AddDrugParams memory params) internal {
        require(!drugs[params.drugId].exists, "Drug already exists");
        require(params.expiryDate > params.manufacturingDate, "Invalid expiry date");
        require(params.totalQuantity > 0, "Quantity must be greater than zero");
        require(params.maxRequiredTemp >= params.minRequiredTemp, "Invalid temperature range");

        drugs[params.drugId] = Drug({
            drugId: params.drugId,
            drugName: params.drugName,
            batchNumber: params.batchNumber,
            unit: params.unit,
            minRequiredTemp: params.minRequiredTemp,
            maxRequiredTemp: params.maxRequiredTemp,
            manufacturerAddress: msg.sender,
            manufacturingDate: params.manufacturingDate,
            expiryDate: params.expiryDate,
            dispatchTimestamp: 0,
            receiveTimestamp: 0,
            recordedDeliveryTemp: 0,
            temperatureChecked: false,
            temperatureCompromised: false,
            packagingDamaged: false,
            damageProofHash: "",
            totalQuantity: params.totalQuantity,
            remainingQuantity: params.totalQuantity,
            transferredQuantity: 0,
            soldQuantity: 0,
            currentOwner: msg.sender,
            status: DrugStatus.Manufactured,
            location: params.location,
            exists: true
        });

        _addTransaction(params.drugId, address(0), msg.sender, params.totalQuantity, 0, "Created");
        emit DrugAdded(params.drugId, msg.sender);
    }

    // Everything below is unchanged
    function transferDrugToPharmacy(
        TransferParams calldata params
    ) external onlyManufacturer drugExists(params.drugId) {
        _transferDrugToPharmacy(params);
    }

    function transferDrugsToPharmacy(
        TransferParams[] calldata paramsList
    ) external onlyManufacturer {
        require(paramsList.length > 0, "Empty batch");
        require(paramsList.length <= MAX_BULK_SIZE, "Max 10 drugs per batch");

        for (uint256 i = 0; i < paramsList.length; i++) {
            require(drugs[paramsList[i].drugId].exists, "Drug does not exist");
            _transferDrugToPharmacy(paramsList[i]);
        }
    }

    function _transferDrugToPharmacy(TransferParams memory params) internal {
        Drug storage drug = drugs[params.drugId];

        require(drug.currentOwner == msg.sender, "Only current owner can transfer");
        require(drug.status == DrugStatus.Manufactured, "Drug already transferred");
        require(params.quantity > 0 && params.quantity <= drug.remainingQuantity, "Invalid transfer quantity");

        drug.currentOwner = pharmacy;
        drug.status = DrugStatus.InTransit;
        drug.location = params.location;
        drug.transferredQuantity += params.quantity;
        drug.dispatchTimestamp = block.timestamp;

        _addTransaction(params.drugId, msg.sender, pharmacy, params.quantity, params.amount, "Transferred");
        emit DrugTransferred(params.drugId, pharmacy);
    }

    function receiveDrug(
        ReceiveParams calldata params
    ) external onlyPharmacy drugExists(params.drugId) {
        Drug storage drug = drugs[params.drugId];

        require(drug.currentOwner == msg.sender, "Pharmacy is not current owner");
        require(drug.status == DrugStatus.InTransit, "Drug is not in transit");
        require(params.quantity > 0 && params.quantity <= drug.transferredQuantity, "Invalid receive quantity");
        if (!params.packagingIntact) {
            require(bytes(params.damageProofHash).length > 0, "Damage proof hash required");
        }

        bool isTempWithinRange = params.recordedTemperature >= drug.minRequiredTemp &&
            params.recordedTemperature <= drug.maxRequiredTemp;

        drug.status = DrugStatus.Delivered;
        drug.location = params.location;
        drug.receiveTimestamp = block.timestamp;
        drug.recordedDeliveryTemp = params.recordedTemperature;
        drug.temperatureChecked = true;
        drug.temperatureCompromised = !isTempWithinRange;
        drug.packagingDamaged = !params.packagingIntact;
        drug.damageProofHash = params.packagingIntact ? "" : params.damageProofHash;

        _addTransaction(params.drugId, manufacturer, pharmacy, params.quantity, params.amount, "Received");
        emit DrugReceived(params.drugId, msg.sender);
        emit DrugVerified(
            params.drugId,
            params.recordedTemperature,
            isTempWithinRange,
            params.packagingIntact,
            params.packagingIntact ? "" : params.damageProofHash
        );
    }

    function sellDrug(
        SellParams calldata params
    ) external onlyPharmacy drugExists(params.drugId) {
        require(params.customer != address(0), "Invalid customer address");

        Drug storage drug = drugs[params.drugId];

        require(drug.currentOwner == msg.sender, "Only current owner can sell");
        require(
            drug.status == DrugStatus.Delivered || drug.status == DrugStatus.InTransit,
            "Drug must be received by pharmacy first"
        );
        require(params.quantity > 0 && params.quantity <= drug.remainingQuantity, "Invalid sell quantity");

        drug.remainingQuantity -= params.quantity;
        drug.soldQuantity += params.quantity;
        drug.location = params.location;

        if (drug.remainingQuantity == 0) {
            drug.currentOwner = params.customer;
            drug.status = DrugStatus.Sold;
        } else {
            drug.status = DrugStatus.Delivered;
        }

        _addTransaction(params.drugId, msg.sender, params.customer, params.quantity, params.amount, "Sold");
        emit DrugSold(params.drugId, params.customer);
    }

    function refreshExpiryStatus(
        string calldata drugId
    ) external drugExists(drugId) returns (bool changed) {
        Drug storage drug = drugs[drugId];
        changed = _applyExpiryStatus(drugId, drug);
    }

    function getDrug(
        string calldata drugId
    ) external view drugExists(drugId) returns (Drug memory) {
        Drug memory drug = drugs[drugId];
        if (block.timestamp > drug.expiryDate && drug.status != DrugStatus.Expired) {
            drug.status = DrugStatus.Expired;
        }
        return drug;
    }

    function getHistory(
        string calldata drugId
    ) external view drugExists(drugId) returns (SupplyTransaction[] memory) {
        return transactionHistory[drugId];
    }

    function getStatusLabel(uint8 statusCode) external pure returns (string memory) {
        if (statusCode == uint8(DrugStatus.None)) return "None";
        if (statusCode == uint8(DrugStatus.Manufactured)) return "Manufactured";
        if (statusCode == uint8(DrugStatus.InTransit)) return "In Transit";
        if (statusCode == uint8(DrugStatus.Delivered)) return "Delivered";
        if (statusCode == uint8(DrugStatus.Sold)) return "Sold";
        if (statusCode == uint8(DrugStatus.Expired)) return "Expired";
        return "Unknown";
    }

    function _addTransaction(
        string memory drugId,
        address from,
        address to,
        uint256 quantity,
        uint256 amount,
        string memory action
    ) internal {
        transactionHistory[drugId].push(
            SupplyTransaction({
                transactionId: nextTransactionId,
                from: from,
                to: to,
                timestamp: block.timestamp,
                quantity: quantity,
                amount: amount,
                action: action
            })
        );
        nextTransactionId++;
    }

    function _applyExpiryStatus(
        string calldata drugId,
        Drug storage drug
    ) internal returns (bool changed) {
        if (block.timestamp > drug.expiryDate && drug.status != DrugStatus.Expired) {
            drug.status = DrugStatus.Expired;
            _addTransaction(drugId, drug.currentOwner, drug.currentOwner, 0, 0, "Expired");
            emit DrugExpired(drugId);
            return true;
        }
        return false;
    }
}