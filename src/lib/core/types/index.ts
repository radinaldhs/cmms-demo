/**
 * Core type definitions for CMMS POC
 * These types represent the data models for the entire system
 */

// ===== Enums and Status Types =====

export type AssetStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Retired';
export type FleetStatus = 'Available' | 'In Workshop' | 'Active' | 'Out of Service';
export type WorkOrderStatus = 'Planned' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';
export type WorkOrderPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceType = 'TIME_BASED' | 'METER_BASED';
export type DepreciationMethod = 'STRAIGHT_LINE';
export type InventoryMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';
export type NotificationSeverity = 'Info' | 'Warning' | 'Error' | 'Success';
export type NotificationType =
	| 'UPCOMING_MAINTENANCE'
	| 'OVERDUE_MAINTENANCE'
	| 'LOW_STOCK'
	| 'WORK_ORDER_ASSIGNED'
	| 'WORK_ORDER_COMPLETED';
export type SyncStatus = 'Success' | 'Warning' | 'Failed' | 'Pending';
export type SupportTicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

// ===== Asset & Fleet =====

export interface Asset {
	id: string;
	code: string;
	name: string;
	category: string;
	location: string;
	status: AssetStatus;
	purchaseDate: string;
	purchaseCost: number;
	usefulLifeYears: number;
	depreciationMethod: DepreciationMethod;
	residualValue: number;
	tags: string[];
	assignedTo?: string;
	isFleet: boolean;
	description?: string;
	manufacturer?: string;
	model?: string;
	serialNumber?: string;
	warrantyExpiry?: string;
	imageUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export type InspectionStatus = 'Passed' | 'Failed' | 'Needs Attention' | 'Pending';

export interface AssetInspection {
	id: string;
	assetId: string;
	assetName?: string; // Denormalized for display
	inspectionDate: string;
	inspectedBy: string;
	status: InspectionStatus;
	checklistItems: InspectionChecklistItem[];
	photos: InspectionPhoto[];
	findings: string;
	recommendations?: string;
	nextInspectionDate?: string;
	createdAt: string;
	updatedAt: string;
}

export interface InspectionChecklistItem {
	id: string;
	item: string;
	status: 'OK' | 'Not OK' | 'N/A';
	notes?: string;
}

export interface InspectionPhoto {
	id: string;
	url: string;
	caption?: string;
	uploadedAt: string;
}

export type DocumentType = 'Manual' | 'Certificate' | 'Warranty' | 'Drawing' | 'Photo' | 'Condition Report' | 'Maintenance Record' | 'Other';

export interface AssetDocument {
	id: string;
	assetId: string;
	assetName?: string; // Denormalized for display
	title: string;
	description?: string;
	type: DocumentType;
	fileUrl: string;
	fileName: string;
	fileSize: number; // in bytes
	mimeType: string;
	uploadedBy: string;
	tags?: string[];
	expiryDate?: string; // For certificates, warranties, etc.
	version?: string;
	relatedWorkOrderId?: string; // Link to maintenance work order
	assetConditionScore?: number; // 1-10 scale for condition tracking
	capturedDate?: string; // For photos/condition reports
	createdAt: string;
	updatedAt: string;
}

export interface AssetDocumentationSummary {
	assetId: string;
	totalDocuments: number;
	totalMaintenanceRecords: number;
	totalPhotos: number;
	conditionTrend: 'improving' | 'stable' | 'declining';
	firstDocumentDate: string;
	lastDocumentDate: string;
	averageConditionScore?: number;
	documentsByType: Record<DocumentType, number>;
}

export interface FleetVehicle {
	id: string;
	assetId: string;
	plateNumber: string;
	type: string; // e.g., "Truck", "Van", "Car"
	brand: string;
	model: string;
	year: number;
	odometer: number;
	lastKnownLocation: {
		lat: number;
		lng: number;
		address?: string;
		city?: string;
	};
	lastGpsTimestamp: string;
	status: FleetStatus;
	fuelType?: string;
	vinNumber?: string;
	insuranceExpiry?: string;
	registrationExpiry?: string;
}

// ===== Maintenance & Work Orders =====

export interface WorkOrder {
	id: string;
	assetId: string;
	assetName?: string; // Denormalized for display
	title: string;
	description: string;
	priority: WorkOrderPriority;
	status: WorkOrderStatus;
	requestedBy: string;
	assignedTo?: string;
	scheduledDate: string;
	dueDate: string;
	completedDate?: string;
	cost: number;
	sparePartsUsed: SparePartUsage[];
	laborHours?: number;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface SparePartUsage {
	partId: string;
	partCode: string;
	partName: string;
	quantity: number;
	unitCost: number;
	totalCost: number;
}

export interface MaintenancePlan {
	id: string;
	assetId: string;
	assetName?: string;
	type: MaintenanceType;
	intervalDays?: number; // For TIME_BASED
	intervalMeter?: number; // For METER_BASED (e.g., km for vehicles)
	lastExecutionDate?: string;
	nextDueDate: string;
	taskDescription: string;
	isActive: boolean;
	estimatedDuration?: number; // in hours
	requiredParts?: string[]; // Part IDs
	createdAt: string;
	updatedAt: string;
}

// ===== Inventory & Spare Parts =====

export type WarehouseLocationType = 'CENTRAL' | 'SITE';

export interface WarehouseLocation {
	id: string;
	code: string;
	name: string;
	type: WarehouseLocationType;
	region?: string; // For CENTRAL warehouses
	factory?: string; // For SITE warehouses
	address: string;
	city: string;
	country: string;
	isActive: boolean;
	capacity?: number;
	manager?: string;
	phone?: string;
	createdAt: string;
	updatedAt: string;
}

export interface SparePart {
	id: string;
	code: string;
	description: string;
	category: string;
	unit: string; // e.g., "pcs", "kg", "liter"
	currentStock: number;
	minStock: number;
	maxStock?: number;
	warehouse: string; // Deprecated: kept for backward compatibility
	warehouseLocationId: string; // Link to WarehouseLocation
	warehouseLocationName?: string; // Denormalized for display
	unitCost: number;
	sapItemCode?: string; // Link to SAP B1
	supplier?: string;
	leadTimeDays?: number;
	imageUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface InventoryMovement {
	id: string;
	partId: string;
	partCode: string;
	partName: string;
	type: InventoryMovementType;
	quantity: number;
	unitCost: number;
	totalCost: number;
	referenceWorkOrderId?: string;
	warehouse: string; // Deprecated: kept for backward compatibility
	warehouseLocationId?: string; // Link to WarehouseLocation
	warehouseLocationName?: string; // Denormalized for display
	performedBy: string;
	notes?: string;
	createdAt: string;
}

// ===== Notifications =====

export interface Notification {
	id: string;
	type: NotificationType;
	message: string;
	severity: NotificationSeverity;
	relatedEntityType?: string; // e.g., "Asset", "WorkOrder", "SparePart"
	relatedEntityId?: string;
	readAt?: string;
	createdAt: string;
}

// ===== SAP Integration =====

export interface SAPItem {
	itemCode: string;
	itemName: string;
	itemGroup: string;
	unitPrice: number;
	onHand: number;
	warehouse: string;
	lastUpdated: string;
}

export interface SAPWarehouse {
	warehouseCode: string;
	warehouseName: string;
	location: string;
	isActive: boolean;
}

export interface SAPStockLevel {
	itemCode: string;
	warehouse: string;
	quantity: number;
	committedQty: number;
	availableQty: number;
}

export interface SyncLog {
	id: string;
	direction: 'PULL' | 'PUSH';
	status: SyncStatus;
	itemsSynced: number;
	errors: number;
	startedAt: string;
	completedAt: string;
	errorDetails?: string[];
}

export interface IntegrationSettings {
	apiUrl: string;
	apiToken: string;
	isEnabled: boolean;
	lastSyncTime?: string;
	autoSyncEnabled: boolean;
	syncIntervalMinutes: number;
}

// ===== Licensing & Support =====

export interface LicenseInfo {
	licenseKey: string;
	companyName: string;
	expiryDate: string;
	maxUsers: number | null; // null = unlimited
	supportEmail: string;
	supportPhone: string;
	slaResponseTime: string; // e.g., "24 hours"
	supportChannel: string; // e.g., "Email, Phone, Portal"
	isActive: boolean;
	activatedAt: string;
}

export interface SupportTicket {
	id: string;
	ticketNumber: string;
	subject: string;
	description: string;
	status: SupportTicketStatus;
	priority: WorkOrderPriority;
	category: string;
	submittedBy: string;
	assignedTo?: string;
	createdAt: string;
	updatedAt: string;
	resolvedAt?: string;
	comments: TicketComment[];
}

export interface TicketComment {
	id: string;
	ticketId: string;
	author: string;
	content: string;
	isInternal: boolean;
	createdAt: string;
}

// ===== Settings & Configuration =====

export interface CompanyProfile {
	name: string;
	address: string;
	city: string;
	country: string;
	phone: string;
	email: string;
	website?: string;
	logo?: string;
	taxId?: string;
	industry: string;
}

export interface MaintenancePolicy {
	id: string;
	name: string;
	description: string;
	defaultIntervalDays: number;
	requireApproval: boolean;
	notifyBeforeDays: number;
	escalateOverdueDays: number;
	isActive: boolean;
}

// ===== Dashboard & Reports =====

export interface DashboardMetrics {
	totalAssets: number;
	totalFleetVehicles: number;
	openWorkOrders: number;
	overdueWorkOrders: number;
	maintenanceCostCurrentMonth: number;
	maintenanceCostCurrentYear: number;
	averageCompletionTime: number; // in days
	assetsInMaintenance: number;
}

export interface WorkOrdersByStatus {
	status: WorkOrderStatus;
	count: number;
}

export interface CostByCategory {
	category: string;
	cost: number;
}

export interface ReportFilter {
	dateFrom?: string;
	dateTo?: string;
	assetCategories?: string[];
	workOrderStatuses?: WorkOrderStatus[];
	priority?: WorkOrderPriority[];
	assignedTo?: string[];
}

// ===== Depreciation Calculation =====

export interface DepreciationSchedule {
	year: number;
	startingValue: number;
	depreciation: number;
	endingValue: number;
}

export interface AssetFinancials {
	purchaseCost: number;
	accumulatedDepreciation: number;
	bookValue: number;
	annualDepreciation: number;
	depreciationSchedule: DepreciationSchedule[];
	maintenanceCostYTD: number;
	maintenanceCostTotal: number;
}

// ===== Pagination & Filtering =====

export interface PaginationParams {
	page: number;
	limit: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// ===== Reports Module =====

export type ReportType =
	| 'WORK_ORDERS'
	| 'ASSET_PERFORMANCE'
	| 'INVENTORY_STATUS'
	| 'FLEET_TRACKING'
	| 'MAINTENANCE_COSTS';

export interface ReportMetadata {
	id: string;
	type: ReportType;
	name: string;
	description: string;
	generatedAt: string;
	generatedBy: string;
	filters: ReportFilter;
	recordCount: number;
}

export interface WorkOrderReportData {
	id: string;
	title: string;
	assetId: string;
	assetName: string;
	assetCategory: string;
	status: WorkOrderStatus;
	priority: WorkOrderPriority;
	assignedTo: string;
	scheduledDate: string;
	dueDate: string;
	completedDate?: string;
	cost: number;
	laborHours: number;
	partsCount: number;
	partsCost: number;
	daysToComplete?: number;
}

export interface AssetPerformanceReportData {
	assetId: string;
	assetCode: string;
	assetName: string;
	category: string;
	location: string;
	status: AssetStatus;
	purchaseDate: string;
	purchaseCost: number;
	bookValue: number;
	accumulatedDepreciation: number;
	maintenanceCount: number;
	maintenanceCostTotal: number;
	maintenanceCostYTD: number;
	lastMaintenanceDate?: string;
	avgMaintenanceCost: number;
	utilizationRate: number;
}

export interface InventoryStatusReportData {
	partId: string;
	partCode: string;
	description: string;
	category: string;
	currentStock: number;
	minStock: number;
	maxStock: number;
	stockStatus: 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'OVERSTOCKED';
	warehouse: string;
	unitCost: number;
	totalValue: number;
	lastMovementDate?: string;
	movementsCount: number;
	supplier?: string;
	leadTimeDays?: number;
	reorderNeeded: boolean;
	reorderQuantity: number;
}

export interface FleetTrackingReportData {
	vehicleId: string;
	assetId: string;
	plateNumber: string;
	type: string;
	brand: string;
	model: string;
	status: FleetStatus;
	odometer: number;
	lastLocation: string;
	lastGpsTimestamp: string;
	maintenanceCount: number;
	maintenanceCostTotal: number;
	fuelType?: string;
	insuranceExpiry?: string;
	nextServiceDue?: string;
	avgMonthlyMileage: number;
	costPerKm: number;
}

export interface MaintenanceCostReportData {
	period: string;
	assetCategory: string;
	workOrderCount: number;
	totalCost: number;
	laborCost: number;
	partsCost: number;
	avgCostPerWorkOrder: number;
	completedCount: number;
	pendingCount: number;
	overdueCount: number;
}

export interface ReportSummary {
	totalRecords: number;
	dateRange: {
		from: string;
		to: string;
	};
	totalCost?: number;
	avgCost?: number;
	additionalMetrics?: Record<string, number | string>;
}

// ===== User & Role Management =====

export type UserStatus = 'Active' | 'Inactive' | 'Pending';
export type UserRole = 'Admin' | 'Manager' | 'Technician' | 'Viewer';

export interface Permission {
	id: string;
	name: string;
	description: string;
	module: string; // e.g., 'assets', 'fleet', 'work-orders'
}

export interface Role {
	id: string;
	name: string;
	description: string;
	permissions: string[]; // Permission IDs
	isSystemRole: boolean; // Cannot be deleted/modified
	userCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	roleId: string;
	roleName?: string; // Denormalized for display
	status: UserStatus;
	phone?: string;
	department?: string;
	lastLoginAt?: string;
	createdAt: string;
	updatedAt: string;
}

// ===== CSV Import =====

export interface CSVImportResult {
	success: boolean;
	imported: number;
	failed: number;
	errors: CSVImportError[];
	data?: Asset[]; // Imported assets
}

export interface CSVImportError {
	row: number;
	field: string;
	message: string;
}
