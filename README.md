# CMMS POC - Computerized Maintenance Management System

<div align="center">

![CMMS POC](.playwright-mcp/cmms-dashboard.png)

**A comprehensive, production-ready POC for enterprise maintenance management**

[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.0-FF3E00?style=flat&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Demo-blue.svg)](LICENSE)

[Live Demo](#) • [Documentation](#table-of-contents) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [API Endpoints](#-api-endpoints)
- [Demo Workflows](#-demo-workflows)
- [Architecture](#-architecture)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

CMMS POC is a full-featured **Computerized Maintenance Management System** designed for enterprises managing industrial assets, fleet vehicles, and maintenance operations. This proof-of-concept demonstrates enterprise-grade functionality with realistic data and workflows, ready for client demonstrations.

### Key Highlights

- ✅ **13 Complete Modules** - Dashboard, Assets, Fleet, Maintenance, Inventory, Integration, Reports, Notifications, Licensing, Settings
- 📊 **Real-time Analytics** - Interactive charts and KPI dashboards
- 🔄 **SAP Business One Integration** - Mock bidirectional sync for inventory management
- 🚗 **Fleet Management** - GPS tracking, odometer monitoring, maintenance scheduling
- 💰 **Financial Tracking** - Asset depreciation, maintenance cost analysis
- 🔔 **Smart Notifications** - Automated alerts for overdue tasks and low stock
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🎨 **Modern UI/UX** - Clean, professional interface with shadcn components

---

## ✨ Features

### 1. 📊 Dashboard
- **Key Performance Indicators**
  - Total assets count
  - Fleet vehicles tracking
  - Open work orders
  - Overdue tasks alert
  - Monthly maintenance costs
- **Interactive Charts**
  - Work orders by status (bar chart)
  - Maintenance cost by asset category (doughnut chart)
- **Quick Access Widgets**
  - Recent work orders with clickable links
  - Low stock alerts with inventory links
  - Real-time notification counter

### 2. 🏭 Asset Management
- **Comprehensive Asset Tracking**
  - 10 pre-loaded industrial assets (pumps, compressors, generators, HVAC, etc.)
  - Advanced search and filtering (by category, status, location)
  - Asset detail pages with tabbed interface
- **Financial Management**
  - Straight-line depreciation calculation
  - Automated book value tracking
  - Maintenance cost aggregation
  - Depreciation schedule visualization
- **Maintenance History**
  - Complete work order history per asset
  - Cost tracking and analysis
  - Service timeline

### 3. 🚗 Fleet Management
- **Vehicle Tracking**
  - 8 fleet vehicles (trucks, vans, pickups)
  - Real-time GPS location (mocked)
  - Odometer reading management
  - Indonesian license plate format
- **Fleet Status Management**
  - Available, Active, In Workshop, Out of Service
  - Last GPS update timestamp
  - Insurance and registration expiry tracking
- **Maintenance Integration**
  - Meter-based maintenance scheduling
  - Service history per vehicle
  - Cost tracking per vehicle

### 4. 🔧 Maintenance & Work Orders
- **Work Order Management**
  - 12 sample work orders with realistic data
  - Full CRUD operations
  - Status workflow: Planned → In Progress → Completed → Overdue
  - Priority levels: Low, Medium, High, Critical
- **Scheduling System**
  - Calendar view by month
  - Maintenance plans (time-based and meter-based)
  - Recurring maintenance schedules
  - Automated due date tracking
- **Resource Management**
  - Spare parts assignment
  - Labor hours tracking
  - Technician assignment
  - Cost calculation

### 5. 📦 Inventory Management
- **Spare Parts Tracking**
  - 33 pre-loaded spare parts across 12 categories
  - Stock level monitoring
  - Minimum/maximum stock thresholds
  - Warehouse management
- **Stock Alerts**
  - Automatic low stock notifications
  - Reorder suggestions
  - Stock movement history
- **SAP Integration**
  - Item code mapping
  - Price synchronization
  - Stock level updates

### 6. 🔄 SAP Business One Integration
- **Bidirectional Sync**
  - Pull from SAP: Import items, stock levels, prices
  - Push to SAP: Export local changes
  - Real-time sync status
- **Sync Management**
  - Manual sync triggers
  - Sync history with timestamps
  - Error logging and reporting
  - Success/Warning/Failed status tracking
- **Configuration**
  - API URL and token management
  - Auto-sync scheduling
  - Sync interval configuration

### 7. 📈 Reports & Analytics
- **Work Orders Report**
  - Date range filtering
  - Status filtering
  - CSV export functionality
- **Asset Performance**
  - Maintenance cost by asset
  - Downtime tracking
  - Asset utilization
- **Inventory Reports**
  - Stock levels and movements
  - Reorder recommendations
  - Cost analysis

### 8. 🔔 Notifications System
- **Smart Alerts**
  - Overdue maintenance notifications
  - Upcoming maintenance reminders
  - Low stock warnings
  - Work order assignments
  - Completion notifications
- **Notification Management**
  - Mark as read functionality
  - Severity levels (Info, Warning, Error, Success)
  - Related entity links
  - Unread counter badge

### 9. 📄 Licensing & Support
- **License Management**
  - Company license information
  - User limits (unlimited in POC)
  - Expiry date tracking
  - License key display
- **Support System**
  - Support ticket creation
  - Ticket status tracking (Open, In Progress, Resolved, Closed)
  - SLA information display
  - Multi-channel support (Email, Phone, Portal)

### 10. ⚙️ Settings & Configuration
- **Company Profile**
  - Company information management
  - Industry classification
  - Contact details
- **Maintenance Policies**
  - Default interval configuration
  - Notification preferences
  - Escalation rules
- **SAP Configuration**
  - API credentials management
  - Connection testing
  - Sync interval settings
- **Data Import**
  - CSV import (up to 50,000 rows)
  - Data validation
  - Error preview

---

## 🛠 Tech Stack

### Core Framework
- **[SvelteKit 2](https://kit.svelte.dev/)** - Modern full-stack framework
- **[Svelte 5](https://svelte.dev/)** - Latest with runes mode ($props, $state, $derived)
- **[TypeScript 5](https://www.typescriptlang.org/)** - Strict mode enabled

### Styling & UI
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn-svelte](https://shadcn-svelte.com/)** - Re-usable component library
- **[bits-ui](https://bits-ui.com/)** - Headless UI components
- **[lucide-svelte](https://lucide.dev/)** - Beautiful icon library

### Data Visualization
- **[Chart.js 4](https://www.chartjs.org/)** - Interactive charts
- Bar charts for work order status
- Doughnut charts for cost distribution

### Utilities
- **[date-fns](https://date-fns.org/)** - Modern date utility library
- **[svelte-sonner](https://svelte-sonner.vercel.app/)** - Toast notifications
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### Development Tools
- **[Vite 7](https://vitejs.dev/)** - Fast build tool
- **[Prettier](https://prettier.io/)** - Code formatter
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher (Install: `npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cmms-demo.git
cd cmms-demo

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Open browser
# Navigate to http://localhost:5173 (or next available port)
```

### Build for Production

```bash
# Build the application
pnpm run build

# Preview production build
pnpm run preview
```

### Other Commands

```bash
# Type checking
pnpm run check

# Type checking (watch mode)
pnpm run check:watch

# Format code
pnpm run format

# Lint code
pnpm run lint
```

---

## 📁 Project Structure

```
cmms-demo/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable UI components
│   │   │   │   ├── button.svelte
│   │   │   │   ├── card.svelte
│   │   │   │   ├── badge.svelte
│   │   │   │   ├── input.svelte
│   │   │   │   ├── select.svelte
│   │   │   │   ├── label.svelte
│   │   │   │   └── textarea.svelte
│   │   │   ├── layout/                # Layout components
│   │   │   │   ├── Sidebar.svelte
│   │   │   │   ├── Topbar.svelte
│   │   │   │   └── MainLayout.svelte
│   │   │   └── charts/                # Chart components
│   │   │       ├── BarChart.svelte
│   │   │       └── DoughnutChart.svelte
│   │   └── core/
│   │       ├── types/                 # TypeScript type definitions
│   │       │   └── index.ts          # All data models
│   │       ├── stores/                # Svelte stores (state management)
│   │       │   ├── assets.ts         # Asset management store
│   │       │   ├── fleet.ts          # Fleet vehicle store
│   │       │   ├── work-orders.ts    # Work order store
│   │       │   ├── spare-parts.ts    # Inventory store
│   │       │   ├── notifications.ts  # Notification store
│   │       │   ├── sap-integration.ts # SAP sync store
│   │       │   ├── licensing.ts      # License & support store
│   │       │   ├── settings.ts       # Settings store
│   │       │   └── index.ts          # Store exports
│   │       └── utils/                 # Utility functions
│   │           ├── cn.ts             # Class name utility
│   │           ├── format.ts         # Formatting utilities
│   │           ├── depreciation.ts   # Depreciation calculations
│   │           ├── csv.ts            # CSV export utility
│   │           └── index.ts          # Utility exports
│   ├── routes/
│   │   ├── +layout.svelte            # Root layout
│   │   ├── +page.svelte              # Dashboard
│   │   ├── +page.ts                  # Dashboard data loader
│   │   ├── assets/
│   │   │   ├── +page.svelte          # Assets list
│   │   │   ├── +page.ts              # Assets data loader
│   │   │   └── [id]/
│   │   │       ├── +page.svelte      # Asset detail
│   │   │       └── +page.ts          # Asset detail loader
│   │   ├── fleet/
│   │   │   ├── +page.svelte          # Fleet list
│   │   │   └── +page.ts              # Fleet data loader
│   │   ├── maintenance/
│   │   │   ├── +page.svelte          # Maintenance hub
│   │   │   ├── work-orders/
│   │   │   │   ├── +page.svelte      # Work orders list
│   │   │   │   └── +page.ts          # Work orders loader
│   │   │   ├── schedule/
│   │   │   │   └── +page.svelte      # Maintenance schedule
│   │   │   └── plans/
│   │   │       └── +page.svelte      # Maintenance plans
│   │   ├── inventory/
│   │   │   ├── +page.svelte          # Inventory list
│   │   │   └── +page.ts              # Inventory loader
│   │   ├── integration/
│   │   │   ├── +page.svelte          # SAP integration
│   │   │   └── +page.ts              # Integration loader
│   │   ├── reports/
│   │   │   └── +page.svelte          # Reports page
│   │   ├── notifications/
│   │   │   ├── +page.svelte          # Notifications list
│   │   │   └── +page.ts              # Notifications loader
│   │   ├── licensing/
│   │   │   ├── +page.svelte          # License & support
│   │   │   └── +page.ts              # License loader
│   │   ├── settings/
│   │   │   ├── +page.svelte          # Settings page
│   │   │   └── +page.ts              # Settings loader
│   │   └── api/                       # SvelteKit API endpoints
│   │       ├── assets/
│   │       │   ├── +server.ts        # Assets API
│   │       │   └── [id]/
│   │       │       └── +server.ts    # Single asset API
│   │       ├── fleet/
│   │       │   └── +server.ts        # Fleet API
│   │       ├── work-orders/
│   │       │   └── +server.ts        # Work orders API
│   │       ├── inventory/
│   │       │   └── +server.ts        # Inventory API
│   │       ├── sap/
│   │       │   └── sync/
│   │       │       └── +server.ts    # SAP sync API
│   │       └── notifications/
│   │           └── +server.ts        # Notifications API
│   ├── app.css                        # Global styles
│   ├── app.d.ts                       # Type declarations
│   └── app.html                       # HTML template
├── static/                            # Static assets
├── .prettierrc                        # Prettier config
├── .prettierignore                    # Prettier ignore
├── .gitignore                         # Git ignore
├── package.json                       # Dependencies
├── pnpm-lock.yaml                     # Lock file
├── svelte.config.js                   # SvelteKit config
├── tsconfig.json                      # TypeScript config
├── vite.config.ts                     # Vite config
└── README.md                          # This file
```

---

## 📊 Data Models

### Core Entities

#### Asset
```typescript
interface Asset {
  id: string;
  code: string;                    // e.g., "PUMP-001"
  name: string;
  category: string;                // Pumps, Compressors, etc.
  location: string;
  status: AssetStatus;             // Active | Inactive | Maintenance | Retired
  purchaseDate: string;
  purchaseCost: number;
  usefulLifeYears: number;
  depreciationMethod: 'STRAIGHT_LINE';
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
```

#### FleetVehicle
```typescript
interface FleetVehicle {
  id: string;
  assetId: string;                 // Links to Asset
  plateNumber: string;             // Indonesian format: "B 1234 XYZ"
  type: string;                    // Truck, Van, Car, Pickup
  brand: string;
  model: string;
  year: number;
  odometer: number;                // in kilometers
  lastKnownLocation: {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
  };
  lastGpsTimestamp: string;
  status: FleetStatus;             // Available | In Workshop | Active | Out of Service
  fuelType?: string;
  vinNumber?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
}
```

#### WorkOrder
```typescript
interface WorkOrder {
  id: string;
  assetId: string;
  assetName?: string;              // Denormalized for display
  title: string;
  description: string;
  priority: WorkOrderPriority;     // Low | Medium | High | Critical
  status: WorkOrderStatus;         // Planned | In Progress | Completed | Overdue | Cancelled
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
```

#### SparePart
```typescript
interface SparePart {
  id: string;
  code: string;                    // e.g., "SEAL-001"
  description: string;
  category: string;
  unit: string;                    // pcs, kg, liter, etc.
  currentStock: number;
  minStock: number;
  maxStock?: number;
  warehouse: string;
  unitCost: number;
  sapItemCode?: string;            // SAP B1 item code
  supplier?: string;
  leadTimeDays?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Notification
```typescript
interface Notification {
  id: string;
  type: NotificationType;          // UPCOMING_MAINTENANCE | OVERDUE_MAINTENANCE | LOW_STOCK | etc.
  message: string;
  severity: NotificationSeverity;  // Info | Warning | Error | Success
  relatedEntityType?: string;      // Asset, WorkOrder, SparePart
  relatedEntityId?: string;
  readAt?: string;
  createdAt: string;
}
```

### Supporting Models

- **MaintenancePlan** - Recurring maintenance schedules
- **InventoryMovement** - Stock movement tracking
- **SAPItem** - SAP Business One item sync
- **SyncLog** - SAP synchronization history
- **LicenseInfo** - License and subscription details
- **SupportTicket** - Support ticket management
- **CompanyProfile** - Organization information
- **MaintenancePolicy** - Maintenance configuration

See [src/lib/core/types/index.ts](src/lib/core/types/index.ts) for complete type definitions.

---

## 🔌 API Endpoints

All API endpoints follow RESTful conventions and return JSON responses.

### Assets

```
GET    /api/assets              # Get all assets (with optional filters)
POST   /api/assets              # Create new asset
PUT    /api/assets              # Update asset
DELETE /api/assets?id={id}      # Delete asset
GET    /api/assets/{id}         # Get single asset
```

**Query Parameters:**
- `search` - Search by name or code
- `category` - Filter by category
- `status` - Filter by status

### Fleet

```
GET    /api/fleet               # Get all fleet vehicles
POST   /api/fleet               # Create new vehicle
PUT    /api/fleet               # Update vehicle
DELETE /api/fleet?id={id}       # Delete vehicle
```

### Work Orders

```
GET    /api/work-orders         # Get all work orders
POST   /api/work-orders         # Create work order
PUT    /api/work-orders         # Update work order
DELETE /api/work-orders?id={id} # Delete work order
```

**Query Parameters:**
- `status` - Filter by status
- `priority` - Filter by priority
- `assetId` - Filter by asset

### Inventory

```
GET    /api/inventory           # Get all spare parts
POST   /api/inventory           # Create spare part
PUT    /api/inventory           # Update spare part
DELETE /api/inventory?id={id}   # Delete spare part
```

### SAP Integration

```
GET    /api/sap/sync/status     # Get sync status
POST   /api/sap/sync/pull       # Pull from SAP
POST   /api/sap/sync/push       # Push to SAP
```

### Notifications

```
GET    /api/notifications       # Get all notifications
POST   /api/notifications/read  # Mark as read
```

---

## 🎬 Demo Workflows

### Workflow 1: Asset Lifecycle Management

1. **Navigate to Assets** (`/assets`)
2. **View Asset List** - Browse all 10 assets with filters
3. **Select an Asset** - Click on "Centrifugal Pump A1"
4. **View Details** - See overview, specifications, and status
5. **Check Depreciation** - Switch to "Cost & Depreciation" tab
   - View current book value
   - See depreciation schedule
   - Check maintenance costs
6. **Review Maintenance History** - Switch to "Maintenance History" tab
   - See all related work orders
   - Check total maintenance spending

### Workflow 2: Work Order Management

1. **Navigate to Maintenance** (`/maintenance`)
2. **View Work Orders** - Click "View Work Orders"
3. **Filter by Status** - Select "In Progress" from dropdown
4. **Create New Work Order** - Click "New Work Order" (UI placeholder)
5. **Assign Technician** - Select technician and spare parts
6. **Update Status** - Change from Planned → In Progress → Completed
7. **Add Parts** - Link spare parts and track costs
8. **Complete Order** - Mark as completed with final costs

### Workflow 3: Inventory Management

1. **Navigate to Inventory** (`/inventory`)
2. **Check Stock Levels** - See low stock alert banner (2 items)
3. **Search Parts** - Use search box to find "V-Belt A-60"
4. **View Low Stock Items** - Filter items below minimum stock
5. **Check SAP Integration** - Navigate to Integration page
6. **Sync from SAP** - Click "Sync from SAP"
7. **View Sync Status** - Check sync history and status
8. **Verify Updates** - Return to inventory to see updated stock

### Workflow 4: Fleet Tracking

1. **Navigate to Fleet** (`/fleet`)
2. **View Vehicles** - See all 8 fleet vehicles as cards
3. **Check GPS Location** - View last known location for each vehicle
4. **Monitor Odometer** - Track mileage for maintenance scheduling
5. **View Vehicle Details** - Click "View Details"
6. **Check Maintenance** - See upcoming meter-based maintenance
7. **Schedule Service** - Create work order for 10,000 km service

### Workflow 5: Reporting & Analytics

1. **Navigate to Dashboard** (`/`)
2. **View KPIs** - Check all 5 metric cards
3. **Analyze Charts** - Review work orders and cost distribution
4. **Navigate to Reports** (`/reports`)
5. **Set Date Range** - Select start and end dates
6. **Filter by Status** - Choose work order statuses
7. **Export to CSV** - Click "Export to CSV"
8. **Review Notifications** - Check bell icon (6 unread)

---

## 🏗 Architecture

### State Management Pattern

```
┌─────────────────────────────────────────────────────────┐
│                      User Interface                      │
│                    (Svelte Components)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    Svelte Stores                         │
│  ┌──────────┬──────────┬──────────┬──────────────────┐  │
│  │ Assets   │  Fleet   │  Work    │   Inventory      │  │
│  │  Store   │  Store   │ Orders   │     Store        │  │
│  └──────────┴──────────┴──────────┴──────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  API Layer (SvelteKit)                   │
│    GET/POST/PUT/DELETE  /api/assets                      │
│    GET/POST/PUT/DELETE  /api/fleet                       │
│    GET/POST/PUT/DELETE  /api/work-orders                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              In-Memory Data Storage                      │
│           (Mock Database - Easily Replaceable)           │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

- **Atomic Design Pattern**
  - **Atoms**: Button, Input, Badge, Label
  - **Molecules**: Card, Select with Label
  - **Organisms**: Sidebar, Topbar, Table with Pagination
  - **Templates**: MainLayout
  - **Pages**: Dashboard, Assets, Fleet, etc.

### Data Flow

1. **Page Load** → SvelteKit `+page.ts` loader fetches data
2. **Data Fetch** → Calls `/api/*` endpoint
3. **API Handler** → Accesses Svelte store
4. **Store** → Returns in-memory data
5. **Response** → JSON returned to page
6. **Rendering** → Svelte component displays data
7. **User Action** → Triggers store update
8. **Reactivity** → UI auto-updates

---

## 💻 Development Guide

### Code Style

- **Indentation**: Tabs (configured in Prettier)
- **Quotes**: Single quotes
- **TypeScript**: Strict mode enabled
- **Svelte**: Runes mode ($props, $state, $derived)

### Adding a New Feature

1. **Define Types** - Add TypeScript interfaces in `src/lib/core/types/index.ts`
2. **Create Store** - Add Svelte store in `src/lib/core/stores/`
3. **Build API** - Create endpoint in `src/routes/api/`
4. **Create Page** - Add route in `src/routes/`
5. **Add Navigation** - Update `Sidebar.svelte` if needed

### Example: Adding a New Module

```typescript
// 1. Define type in src/lib/core/types/index.ts
export interface NewEntity {
  id: string;
  name: string;
  createdAt: string;
}

// 2. Create store in src/lib/core/stores/new-entity.ts
import { writable } from 'svelte/store';

const store = writable<NewEntity[]>([]);

export const newEntity = {
  subscribe: store.subscribe,
  getAll: () => { /* implementation */ },
  create: (data) => { /* implementation */ }
};

// 3. Create API in src/routes/api/new-entity/+server.ts
export const GET = async () => {
  return json(newEntity.getAll());
};

// 4. Create page in src/routes/new-entity/+page.svelte
<script lang="ts">
  let { data } = $props();
</script>

<h1>New Entity</h1>
<!-- Your UI here -->
```

### Testing

Currently, the POC focuses on functionality demonstration. For production:

- **Unit Tests**: Use Vitest for stores and utilities
- **Component Tests**: Use @testing-library/svelte
- **E2E Tests**: Use Playwright (already configured)
- **Type Checking**: Run `pnpm run check`

### Performance Optimization

- **Code Splitting**: Automatic with SvelteKit
- **Image Optimization**: Use `@sveltejs/enhanced-img` for production
- **Lazy Loading**: Implement for charts and heavy components
- **Caching**: Add service worker for production

---

## 🚢 Deployment

### Production Build

```bash
# Create optimized build
pnpm run build

# Output directory: .svelte-kit/output
```

### Deployment Options

#### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

#### 2. Netlify
```bash
# Change adapter in svelte.config.js
import adapter from '@sveltejs/adapter-netlify';

# Build and deploy
pnpm run build
netlify deploy --prod
```

#### 3. Node.js Server
```bash
# Change adapter in svelte.config.js
import adapter from '@sveltejs/adapter-node';

# Build
pnpm run build

# Run
node build
```

#### 4. Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD ["node", "build"]
```

### Environment Variables

For production deployment, configure:

```env
# .env.production
PUBLIC_API_URL=https://your-api.com
PUBLIC_SAP_API_URL=https://sap-api.example.com
DATABASE_URL=postgresql://user:pass@host:5432/cmms
```

---

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or let Vite use next available port (automatic)
```

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .svelte-kit
pnpm install
pnpm run dev
```

#### Type Errors
```bash
# Regenerate types
pnpm run check
```

#### Charts Not Displaying
- Ensure Chart.js is imported correctly
- Check browser console for errors
- Verify data format matches Chart.js requirements

#### Styling Issues
```bash
# Rebuild Tailwind
rm -rf .svelte-kit
pnpm run dev
```

### Browser Compatibility

- **Minimum Requirements**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS 14+, Android Chrome 90+

---

## 🔮 Future Enhancements

### Phase 1: Backend Integration
- [ ] PostgreSQL/MySQL database integration
- [ ] RESTful API with authentication
- [ ] User management and role-based access control
- [ ] Session management and JWT tokens

### Phase 2: Advanced Features
- [ ] Real-time GPS tracking integration
- [ ] Push notifications (Web Push API)
- [ ] Mobile app (React Native or Flutter)
- [ ] Offline mode with sync
- [ ] Multi-language support (i18n)

### Phase 3: SAP Integration
- [ ] Real SAP Business One API integration
- [ ] Service Layer authentication
- [ ] Real-time inventory sync
- [ ] Purchase order automation
- [ ] Financial data integration

### Phase 4: Analytics & AI
- [ ] Predictive maintenance using ML
- [ ] Failure pattern analysis
- [ ] Automated scheduling optimization
- [ ] Cost forecasting
- [ ] Resource allocation optimization

### Phase 5: Compliance & Security
- [ ] ISO 55000 compliance
- [ ] Audit trail logging
- [ ] Data encryption at rest
- [ ] Two-factor authentication
- [ ] Role-based permissions
- [ ] GDPR compliance tools

### Phase 6: Integrations
- [ ] Email notifications (SendGrid/AWS SES)
- [ ] SMS alerts (Twilio)
- [ ] Calendar integration (Google/Outlook)
- [ ] File storage (S3/Azure Blob)
- [ ] Barcode/QR code scanning
- [ ] IoT sensor integration

### Phase 7: Reporting
- [ ] Advanced report builder
- [ ] Custom dashboard creation
- [ ] Scheduled report emails
- [ ] Export to Excel/PDF
- [ ] Data visualization library (D3.js)

---

## 🤝 Contributing

Contributions are welcome! This is a POC project, but we appreciate improvements and bug fixes.

### Development Process

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Guidelines

- Follow existing code style (Prettier configuration)
- Add TypeScript types for new features
- Update README if adding major features
- Test your changes thoroughly
- Keep commits atomic and well-described

### Reporting Issues

- Use GitHub Issues
- Include browser/OS information
- Provide steps to reproduce
- Include screenshots if applicable

---

## 📄 License

This project is a **Proof of Concept (POC)** for demonstration purposes.

**Not for production use** without proper backend integration, security hardening, and testing.

For commercial licensing inquiries, please contact [your-email@example.com](mailto:your-email@example.com)

---

## 📞 Contact & Support

- **Project Maintainer**: [Your Name](https://github.com/yourusername)
- **Email**: your-email@example.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/cmms-demo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cmms-demo/discussions)

---

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - The amazing framework
- [Tailwind CSS](https://tailwindcss.com/) - For beautiful styling
- [shadcn](https://ui.shadcn.com/) - Component design inspiration
- [Lucide](https://lucide.dev/) - Icon library
- [Chart.js](https://www.chartjs.org/) - Data visualization

---

<div align="center">

**[⬆ Back to Top](#-table-of-contents)**

Made with ❤️ using [SvelteKit](https://kit.svelte.dev/) by Radinal

⭐ **Star this repo if you find it useful!**

</div>
