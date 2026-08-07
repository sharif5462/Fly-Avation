import { ModuleDef } from '../models/nav-item.model';

/**
 * Single source of truth for navigation + routing. Every module below
 * becomes a top-level route + sidebar group; every item becomes a child
 * route. Items with `flagship: true` are routed to a hand-built component
 * (see flagship-routes.ts); everything else is routed to the generic
 * FeatureListPage, configured by core/data/entity-configs.ts (matched on
 * the same `key`).
 *
 * NOTE: keys are unique across the *entire* manifest (not just per-module)
 * because they double as the mock/API resource path. A few labels repeat
 * across modules (e.g. "Loyalty Program" under both Passenger Reservation
 * and CRM) — those got module-prefixed keys to stay unique; see comments.
 */
export const MODULES: ModuleDef[] = [
  {
    key: 'flight-operations',
    label: 'Flight Operations',
    icon: 'pi-send',
    role: 'FlightOps',
    items: [
      { key: 'flight-scheduling', label: 'Flight Scheduling', icon: 'pi-calendar', flagship: true },
      { key: 'route-planning', label: 'Route Planning', icon: 'pi-map' },
      { key: 'flight-dispatch', label: 'Flight Dispatch', icon: 'pi-directions' },
      { key: 'aircraft-assignment', label: 'Aircraft Assignment', icon: 'pi-link' },
      { key: 'crew-assignment', label: 'Crew Assignment', icon: 'pi-users' },
      { key: 'flight-tracking', label: 'Flight Tracking', icon: 'pi-map-marker' },
      { key: 'delay-management', label: 'Delay Management', icon: 'pi-clock' },
      { key: 'fuel-planning', label: 'Fuel Planning', icon: 'pi-bolt' }
    ]
  },
  {
    key: 'aircraft-maintenance',
    label: 'Aircraft Maintenance (MRO)',
    icon: 'pi-wrench',
    role: 'Maintenance',
    items: [
      { key: 'mro-dashboard', label: 'Dashboard', icon: 'pi-th-large', flagship: true },
      { key: 'preventive-maintenance', label: 'Preventive Maintenance', icon: 'pi-shield' },
      { key: 'corrective-maintenance', label: 'Corrective Maintenance', icon: 'pi-hammer' },
      { key: 'work-orders', label: 'Work Orders', icon: 'pi-clipboard', flagship: true },
      { key: 'maintenance-planning', label: 'Maintenance Planning', icon: 'pi-calendar-clock' },
      { key: 'component-tracking', label: 'Component Tracking', icon: 'pi-microchip', flagship: true },
      { key: 'aircraft-logbook', label: 'Aircraft Logbook', icon: 'pi-book' },
      { key: 'airworthiness-certificate', label: 'Airworthiness Certificate', icon: 'pi-verified' },
      { key: 'service-bulletin-management', label: 'Service Bulletin Management', icon: 'pi-megaphone' },
      { key: 'ad-compliance', label: 'AD (Airworthiness Directive) Compliance', icon: 'pi-exclamation-triangle' },
      { key: 'mel-cdl-tracking', label: 'MEL / CDL Tracking', icon: 'pi-list-check' },
      { key: 'reliability-program', label: 'Reliability Program', icon: 'pi-chart-line' },
      { key: 'tooling-calibration', label: 'Tooling & Calibration', icon: 'pi-wrench' }
    ]
  },
  {
    key: 'fleet-management',
    label: 'Fleet Management',
    icon: 'pi-compass',
    role: 'Fleet',
    items: [
      { key: 'aircraft-registration', label: 'Aircraft Registration', icon: 'pi-id-card', flagship: true },
      { key: 'fleet-availability', label: 'Fleet Availability', icon: 'pi-check-circle' },
      { key: 'aircraft-history', label: 'Aircraft History', icon: 'pi-history' },
      { key: 'aircraft-utilization', label: 'Aircraft Utilization', icon: 'pi-chart-bar' },
      { key: 'engine-tracking', label: 'Engine Tracking', icon: 'pi-cog' },
      { key: 'landing-flight-hours', label: 'Landing & Flight Hours', icon: 'pi-stopwatch' },
      { key: 'flight-cycle-tracking', label: 'Flight Cycle Tracking', icon: 'pi-sync' }
    ]
  },
  {
    key: 'inventory-spare-parts',
    label: 'Inventory & Spare Parts',
    icon: 'pi-box',
    role: 'Inventory',
    items: [
      { key: 'spare-parts-inventory', label: 'Spare Parts Inventory', icon: 'pi-box', flagship: true },
      { key: 'warehouse-management', label: 'Storage Locations', icon: 'pi-warehouse' },
      { key: 'barcode-rfid', label: 'Barcode / RFID', icon: 'pi-qrcode' },
      { key: 'purchase-requests', label: 'Purchase Requests', icon: 'pi-file-edit' },
      { key: 'stock-transfer', label: 'Stock Transfer', icon: 'pi-arrow-right-arrow-left' },
      { key: 'tool-tracking', label: 'Tool Tracking', icon: 'pi-wrench' },
      { key: 'minimum-stock-alerts', label: 'Minimum Stock Alerts', icon: 'pi-bell' },
      { key: 'serial-number-tracking', label: 'Serial Number Tracking', icon: 'pi-tag' }
    ]
  },
  {
    key: 'warehouse-management',
    label: 'Warehouse Management',
    icon: 'pi-warehouse',
    role: 'Inventory',
    items: [
      { key: 'warehouse-dashboard', label: 'Dashboard', icon: 'pi-th-large', flagship: true },
      { key: 'warehouse-management', label: 'Warehouse Setup', icon: 'pi-building' },
      { key: 'store-setup', label: 'Store Setup', icon: 'pi-shop' },
      { key: 'rack-bin-setup', label: 'Rack/Bin Setup', icon: 'pi-th-large' },
      { key: 'item-category', label: 'Item Category', icon: 'pi-tags' },
      { key: 'item-master', label: 'Item Master', icon: 'pi-box', flagship: true },
      { key: 'unit-setup', label: 'Unit Setup', icon: 'pi-calculator' },
      { key: 'brand-setup', label: 'Brand Setup', icon: 'pi-bookmark' },
      { key: 'manufacturer-setup', label: 'Manufacturer Setup', icon: 'pi-industry' },
      // Reuses Procurement's Vendor Management — same real-world supplier record.
      { key: 'vendor-management', label: 'Supplier Setup', icon: 'pi-building' },
      // Reuses Inventory & Spare Parts' Purchase Requests entity.
      { key: 'purchase-requests', label: 'Purchase Request', icon: 'pi-file-edit' },
      // Reuses Procurement's flagship Purchase Orders page/data.
      { key: 'purchase-orders', label: 'Purchase Order', icon: 'pi-shopping-cart', flagship: true },
      // Reuses Procurement's Goods Receiving entity.
      { key: 'goods-receiving', label: 'Goods Receive (GRN)', icon: 'pi-inbox' },
      // Reuses Quality Assurance's Quality Inspection entity.
      { key: 'quality-inspection', label: 'Inspection', icon: 'pi-eye' },
      { key: 'stock-entry', label: 'Stock Entry', icon: 'pi-sign-in' },
      { key: 'stock-issue', label: 'Stock Issue', icon: 'pi-sign-out' },
      { key: 'stock-return', label: 'Stock Return', icon: 'pi-replay' },
      // Reuses Inventory & Spare Parts' Stock Transfer entity.
      { key: 'stock-transfer', label: 'Warehouse Transfer', icon: 'pi-arrow-right-arrow-left' },
      { key: 'aircraft-issue', label: 'Aircraft Issue', icon: 'pi-send' },
      { key: 'component-installation', label: 'Component Installation', icon: 'pi-plus-circle' },
      { key: 'component-removal', label: 'Component Removal', icon: 'pi-minus-circle' },
      { key: 'repair-management', label: 'Repair Management', icon: 'pi-hammer' },
      { key: 'scrap-management', label: 'Scrap Management', icon: 'pi-trash' },
      { key: 'inventory-count', label: 'Inventory Count', icon: 'pi-list-check' },
      { key: 'stock-adjustment', label: 'Stock Adjustment', icon: 'pi-sliders-h' },
      // Reuses Inventory & Spare Parts' Barcode/RFID entity.
      { key: 'barcode-rfid', label: 'Barcode / QR', icon: 'pi-qrcode' },
      // Reuses Inventory & Spare Parts' Serial Number Tracking entity.
      { key: 'serial-number-tracking', label: 'Serial Number Tracking', icon: 'pi-tag' },
      { key: 'batch-tracking', label: 'Batch Tracking', icon: 'pi-clone' },
      { key: 'shelf-life', label: 'Shelf Life', icon: 'pi-calendar-times' },
      { key: 'warranty', label: 'Warranty', icon: 'pi-shield' },
      { key: 'calibration', label: 'Calibration', icon: 'pi-gauge' }
    ]
  },
  {
    key: 'procurement',
    label: 'Procurement',
    icon: 'pi-shopping-cart',
    role: 'Procurement',
    items: [
      { key: 'vendor-management', label: 'Vendor Management', icon: 'pi-building' },
      { key: 'rfq', label: 'RFQ (Request for Quotation)', icon: 'pi-file-edit' },
      { key: 'purchase-orders', label: 'Purchase Orders', icon: 'pi-shopping-cart', flagship: true },
      { key: 'goods-receiving', label: 'Goods Receiving', icon: 'pi-inbox' },
      { key: 'supplier-evaluation', label: 'Supplier Evaluation', icon: 'pi-star' },
      { key: 'contract-management', label: 'Contract Management', icon: 'pi-file' }
    ]
  },
  {
    key: 'crew-management',
    label: 'Crew Management',
    icon: 'pi-id-card',
    role: 'Crew',
    items: [
      { key: 'pilot-management', label: 'Pilot Management', icon: 'pi-id-card', flagship: true },
      { key: 'cabin-crew-management', label: 'Cabin Crew Management', icon: 'pi-users' },
      { key: 'duty-roster', label: 'Duty Roster', icon: 'pi-table' },
      { key: 'crew-scheduling', label: 'Crew Scheduling', icon: 'pi-calendar' },
      { key: 'crew-leave-management', label: 'Leave Management', icon: 'pi-sign-out' },
      { key: 'license-tracking', label: 'License Tracking', icon: 'pi-verified' },
      { key: 'medical-certificate-tracking', label: 'Medical Certificate Tracking', icon: 'pi-heart' },
      { key: 'training-records', label: 'Training Records', icon: 'pi-graduation-cap' },
      { key: 'flight-hours-monitoring', label: 'Flight Hours Monitoring', icon: 'pi-stopwatch' }
    ]
  },
  {
    key: 'passenger-reservation',
    label: 'Passenger Reservation',
    icon: 'pi-ticket',
    role: 'Reservations',
    items: [
      { key: 'ticket-booking', label: 'Ticket Booking', icon: 'pi-ticket' },
      { key: 'seat-reservation', label: 'Seat Reservation', icon: 'pi-th-large' },
      { key: 'check-in', label: 'Check-in', icon: 'pi-check-square' },
      { key: 'boarding-pass', label: 'Boarding Pass', icon: 'pi-id-card' },
      { key: 'baggage-management', label: 'Baggage Management', icon: 'pi-briefcase' },
      { key: 'cancellation', label: 'Cancellation', icon: 'pi-times-circle' },
      { key: 'refund-processing', label: 'Refund Processing', icon: 'pi-replay' },
      { key: 'loyalty-program', label: 'Loyalty Program', icon: 'pi-gift' }
    ]
  },
  {
    key: 'airport-operations',
    label: 'Airport Operations',
    icon: 'pi-building',
    role: 'AirportOps',
    items: [
      { key: 'gate-management', label: 'Gate Management', icon: 'pi-sitemap' },
      { key: 'runway-scheduling', label: 'Runway Scheduling', icon: 'pi-directions-alt' },
      { key: 'terminal-operations', label: 'Terminal Operations', icon: 'pi-building-columns' },
      { key: 'ground-handling', label: 'Ground Handling', icon: 'pi-car' },
      { key: 'aircraft-parking', label: 'Aircraft Parking', icon: 'pi-map-marker' },
      { key: 'boarding-management', label: 'Boarding Management', icon: 'pi-users' }
    ]
  },
  {
    key: 'resource-gate-management',
    label: 'Resource & Gate Management',
    icon: 'pi-sitemap',
    role: 'Resources',
    items: [
      { key: 'resource-dashboard', label: 'Dashboard', icon: 'pi-th-large', flagship: true },
      // ── Resource masters: the physical things that get allocated to flights.
      { key: 'stand-registry', label: 'Stand & Bay Registry', icon: 'pi-map-marker' },
      { key: 'gate-registry', label: 'Gate Registry', icon: 'pi-sitemap' },
      { key: 'boarding-bridge-management', label: 'Boarding Bridges (PBB)', icon: 'pi-arrow-right-arrow-left' },
      { key: 'check-in-desk-management', label: 'Check-in Desks & Kiosks', icon: 'pi-check-square' },
      { key: 'reclaim-belt-management', label: 'Arrivals Reclaim Belts', icon: 'pi-download' },
      { key: 'common-use-systems', label: 'Common-Use Systems (CUPPS)', icon: 'pi-desktop' },
      // ── Allocation & planning: assigning those resources to flights.
      // Reuses Airport Operations' Gate Management — the per-flight gate assignment
      // record; `gate-registry` above is the gate master it points at.
      { key: 'gate-management', label: 'Gate Allocation', icon: 'pi-sitemap' },
      // Reuses Airport Operations' Aircraft Parking — the per-turnaround stand assignment.
      { key: 'aircraft-parking', label: 'Stand Allocation', icon: 'pi-map-marker' },
      { key: 'seasonal-slot-planning', label: 'Seasonal Slot Planning', icon: 'pi-calendar' },
      { key: 'daily-resource-plan', label: 'Daily Resource Plan', icon: 'pi-calendar-clock' },
      { key: 'resource-conflict-management', label: 'Allocation Conflicts', icon: 'pi-exclamation-triangle' },
      { key: 'gate-change-log', label: 'Gate & Stand Changes', icon: 'pi-sync' },
      { key: 'towing-movement-plan', label: 'Towing & Aircraft Movements', icon: 'pi-truck' },
      { key: 'deicing-pad-allocation', label: 'De-icing Pad Allocation', icon: 'pi-cloud' },
      { key: 'remote-stand-bussing', label: 'Remote Stand & Bussing', icon: 'pi-car' },
      // ── Availability & performance.
      { key: 'resource-outage-blocking', label: 'Outages & Blockings', icon: 'pi-ban' },
      { key: 'turnaround-monitoring', label: 'Turnaround Monitoring (A-CDM)', icon: 'pi-stopwatch' },
      { key: 'resource-utilization', label: 'Resource Utilization', icon: 'pi-chart-bar' }
    ]
  },
  {
    key: 'baggage-handling-system',
    label: 'Baggage Handling System (BHS)',
    icon: 'pi-briefcase',
    role: 'Baggage',
    items: [
      { key: 'baggage-handling-dashboard', label: 'Dashboard', icon: 'pi-th-large', flagship: true },
      // ── Bag lifecycle: acceptance → screening → storage → make-up → load → arrival
      { key: 'bag-drop-units', label: 'Check-in & Self Bag Drop', icon: 'pi-sign-in' },
      { key: 'baggage-handling', label: 'Bag Tracking (Res. 753)', icon: 'pi-briefcase', flagship: true },
      { key: 'baggage-screening', label: 'Hold Baggage Screening (HBS)', icon: 'pi-shield' },
      { key: 'hbs-machine-certification', label: 'HBS Machine Certification', icon: 'pi-verified' },
      { key: 'out-of-gauge-baggage', label: 'Out-of-Gauge (OOG) Baggage', icon: 'pi-expand' },
      { key: 'early-bag-storage', label: 'Early Bag Storage (EBS)', icon: 'pi-inbox' },
      { key: 'baggage-makeup', label: 'Make-up & ULD Build', icon: 'pi-box' },
      { key: 'transfer-baggage', label: 'Transfer & Hot Bags', icon: 'pi-sync' },
      { key: 'baggage-reclaim', label: 'Arrivals Reclaim', icon: 'pi-download' },
      // ── Reconciliation & messaging
      { key: 'baggage-reconciliation', label: 'Baggage Reconciliation (BRS)', icon: 'pi-verified' },
      { key: 'baggage-messaging', label: 'IATA Type B Messaging', icon: 'pi-envelope' },
      // ── The machine: equipment, control system, maintenance
      { key: 'bhs-equipment', label: 'BHS Equipment Registry', icon: 'pi-cog' },
      { key: 'bhs-sortation-performance', label: 'Sortation & Read Rate', icon: 'pi-percentage' },
      { key: 'bhs-fault-log', label: 'Fault, Jam & SCADA Alarms', icon: 'pi-exclamation-triangle' },
      { key: 'bhs-maintenance', label: 'BHS Preventive Maintenance', icon: 'pi-wrench' },
      // ── Performance & exceptions
      { key: 'baggage-sla-performance', label: 'SLA & Performance', icon: 'pi-chart-line' },
      { key: 'mishandled-baggage', label: 'Mishandled Baggage / Lost & Found', icon: 'pi-search' },
      { key: 'baggage-claims', label: 'Claims & Compensation', icon: 'pi-dollar' }
    ]
  },
  {
    key: 'landside-operations',
    label: 'Landside Operations',
    icon: 'pi-car',
    role: 'Landside',
    items: [
      { key: 'landside-dashboard', label: 'Dashboard', icon: 'pi-th-large', flagship: true },
      { key: 'curbside-management', label: 'Curbside Management', icon: 'pi-map' },
      { key: 'commercial-vehicle-permits', label: 'Commercial Vehicle Permits', icon: 'pi-id-card' },
      { key: 'ground-transportation-dispatch', label: 'Ground Transportation Dispatch', icon: 'pi-directions-alt' },
      { key: 'public-parking-management', label: 'Public Parking Management', icon: 'pi-car' },
      { key: 'taxi-rideshare-queue', label: 'Taxi & Rideshare Queue', icon: 'pi-users' },
      { key: 'rental-car-facility', label: 'Rental Car Facility', icon: 'pi-building' },
      { key: 'road-traffic-circulation', label: 'Road & Traffic Circulation', icon: 'pi-directions' },
      { key: 'vehicle-checkpoint-screening', label: 'Vehicle Checkpoint Screening', icon: 'pi-shield' },
      { key: 'terminal-curb-access-control', label: 'Terminal Curb Access Control', icon: 'pi-key' },
      { key: 'landside-revenue', label: 'Parking & Curb Revenue', icon: 'pi-dollar' },
      // Reuses Compliance & Safety's Incident Reporting — one incident register, any source.
      { key: 'incident-reporting', label: 'Incident Reporting', icon: 'pi-flag' }
    ]
  },
  {
    key: 'cargo-management',
    label: 'Cargo Management',
    icon: 'pi-inbox',
    role: 'Cargo',
    items: [
      { key: 'cargo-booking', label: 'Cargo Booking', icon: 'pi-inbox' },
      { key: 'shipment-tracking', label: 'Shipment Tracking', icon: 'pi-map-marker' },
      { key: 'warehouse-cargo', label: 'Warehouse Cargo', icon: 'pi-warehouse' },
      { key: 'dangerous-goods-management', label: 'Dangerous Goods Management', icon: 'pi-exclamation-triangle' },
      { key: 'customs-documentation', label: 'Customs Documentation', icon: 'pi-file' },
      { key: 'air-waybill', label: 'Air Waybill (AWB)', icon: 'pi-file-edit' }
    ]
  },
  {
    key: 'facilities-assets',
    label: 'Facilities & Assets',
    icon: 'pi-building',
    role: 'Facilities',
    items: [
      { key: 'facility-dashboard', label: 'Dashboard', icon: 'pi-th-large', flagship: true },
      { key: 'facility-setup', label: 'Facility Setup', icon: 'pi-building' },
      { key: 'building-zone-setup', label: 'Building/Zone Setup', icon: 'pi-sitemap' },
      { key: 'asset-category-setup', label: 'Asset Category Setup', icon: 'pi-tags' },
      { key: 'asset-master', label: 'Asset Master', icon: 'pi-box', flagship: true },
      { key: 'gse-fleet-registry', label: 'GSE Fleet Registry', icon: 'pi-truck' },
      // Reuses Procurement's Vendor Management — same real-world contractor/vendor record.
      { key: 'vendor-management', label: 'Contractor/Vendor Setup', icon: 'pi-building-columns' },
      { key: 'facility-work-orders', label: 'Facility Work Orders', icon: 'pi-clipboard' },
      { key: 'facility-preventive-maintenance', label: 'Preventive Maintenance', icon: 'pi-shield' },
      { key: 'facility-corrective-maintenance', label: 'Corrective Maintenance', icon: 'pi-hammer' },
      { key: 'asset-inspection', label: 'Asset Inspection', icon: 'pi-eye' },
      { key: 'meter-reading', label: 'Meter Reading', icon: 'pi-gauge' },
      { key: 'space-utilization', label: 'Space Utilization', icon: 'pi-th-large' },
      { key: 'lease-contract-management', label: 'Lease & Contract Management', icon: 'pi-file' },
      { key: 'utility-energy-management', label: 'Utility & Energy Management', icon: 'pi-bolt' },
      { key: 'hvac-building-systems', label: 'HVAC & Building Systems', icon: 'pi-cloud' },
      { key: 'fire-safety-systems', label: 'Fire & Safety Systems', icon: 'pi-exclamation-triangle' },
      { key: 'physical-security-systems', label: 'Physical Security Systems', icon: 'pi-video' },
      { key: 'cleaning-janitorial', label: 'Cleaning & Janitorial', icon: 'pi-sparkles' },
      { key: 'waste-management', label: 'Waste Management', icon: 'pi-trash' },
      { key: 'parking-management', label: 'Staff/Vehicle Parking', icon: 'pi-car' },
      { key: 'visitor-management', label: 'Visitor Management', icon: 'pi-user-plus' },
      { key: 'asset-depreciation', label: 'Asset Depreciation', icon: 'pi-chart-line' },
      { key: 'asset-disposal', label: 'Asset Disposal', icon: 'pi-trash' },
      { key: 'insurance-warranty-tracking', label: 'Insurance & Warranty Tracking', icon: 'pi-verified' },
      { key: 'facility-compliance-certification', label: 'Compliance & Certification', icon: 'pi-verified' },
      // Reuses Compliance & Safety's Incident Reporting — one incident register, any source.
      { key: 'incident-reporting', label: 'Incident Reporting', icon: 'pi-flag' },
      { key: 'facility-audit', label: 'Facility Audit', icon: 'pi-search' }
    ]
  },
  {
    key: 'fuel-management',
    label: 'Fuel Management',
    icon: 'pi-bolt',
    role: 'Fuel',
    items: [
      { key: 'fuel-purchase', label: 'Fuel Purchase', icon: 'pi-shopping-cart' },
      { key: 'fuel-consumption', label: 'Fuel Consumption', icon: 'pi-chart-line' },
      { key: 'fuel-cost-analysis', label: 'Fuel Cost Analysis', icon: 'pi-dollar' },
      { key: 'fuel-inventory', label: 'Fuel Inventory', icon: 'pi-box' },
      { key: 'fuel-vendor-management', label: 'Fuel Vendor Management', icon: 'pi-building' }
    ]
  },
  {
    key: 'finance-accounting',
    label: 'Finance & Accounting',
    icon: 'pi-dollar',
    role: 'Finance',
    items: [
      { key: 'general-ledger', label: 'General Ledger', icon: 'pi-book' },
      { key: 'accounts-payable', label: 'Accounts Payable', icon: 'pi-credit-card' },
      { key: 'accounts-receivable', label: 'Accounts Receivable', icon: 'pi-wallet' },
      { key: 'asset-management', label: 'Asset Management', icon: 'pi-box' },
      { key: 'cost-center', label: 'Cost Center', icon: 'pi-sitemap' },
      { key: 'budgeting', label: 'Budgeting', icon: 'pi-percentage' },
      { key: 'revenue-management', label: 'Revenue Management', icon: 'pi-chart-line' },
      { key: 'financial-reports', label: 'Financial Reports', icon: 'pi-file' }
    ]
  },
  {
    key: 'human-resource',
    label: 'Human Resource (HR)',
    icon: 'pi-users',
    role: 'HR',
    items: [
      { key: 'employee-management', label: 'Employee Management', icon: 'pi-user' },
      { key: 'payroll', label: 'Payroll', icon: 'pi-money-bill' },
      { key: 'attendance', label: 'Attendance', icon: 'pi-calendar-plus' },
      { key: 'hr-leave', label: 'Leave', icon: 'pi-sign-out' },
      { key: 'performance-evaluation', label: 'Performance Evaluation', icon: 'pi-star' },
      { key: 'recruitment', label: 'Recruitment', icon: 'pi-user-plus' },
      { key: 'hr-training', label: 'Training', icon: 'pi-graduation-cap' }
    ]
  },
  {
    key: 'compliance-safety',
    label: 'Compliance & Safety',
    icon: 'pi-shield',
    role: 'Compliance',
    items: [
      { key: 'icao-compliance', label: 'ICAO Compliance', icon: 'pi-globe' },
      { key: 'iata-compliance', label: 'IATA Compliance', icon: 'pi-globe' },
      { key: 'risk-assessment', label: 'Risk Assessment', icon: 'pi-exclamation-triangle' },
      { key: 'incident-reporting', label: 'Incident Reporting', icon: 'pi-flag' },
      { key: 'audit-management', label: 'Audit Management', icon: 'pi-search' },
      { key: 'document-control', label: 'Document Control', icon: 'pi-file' }
    ]
  },
  {
    key: 'safety-management-system',
    label: 'Safety Management System (SMS)',
    icon: 'pi-shield',
    role: 'Compliance',
    items: [
      { key: 'sms-dashboard', label: 'Dashboard', icon: 'pi-th-large', flagship: true },
      { key: 'safety-policy-statement', label: 'Safety Policy & Objectives', icon: 'pi-flag' },
      { key: 'safety-accountabilities', label: 'Safety Accountabilities', icon: 'pi-user-edit' },
      { key: 'emergency-response-plan', label: 'Emergency Response Planning', icon: 'pi-phone' },
      // Reuses Compliance & Safety's Document Control — one controlled-document library, any source.
      { key: 'document-control', label: 'SMS Documentation', icon: 'pi-file' },
      { key: 'hazard-reporting', label: 'Hazard Reporting', icon: 'pi-exclamation-circle', flagship: true },
      // Reuses Compliance & Safety's Risk Assessment.
      { key: 'risk-assessment', label: 'Safety Risk Assessment', icon: 'pi-exclamation-triangle' },
      { key: 'safety-risk-register', label: 'Safety Risk Register', icon: 'pi-table' },
      // Reuses Quality Assurance's CAPA — one corrective/preventive action tracker, any source.
      { key: 'capa', label: 'Corrective & Preventive Actions', icon: 'pi-refresh' },
      { key: 'management-of-change', label: 'Management of Change', icon: 'pi-sync' },
      { key: 'safety-performance-indicators', label: 'Safety Performance Indicators', icon: 'pi-gauge' },
      // Reuses Compliance & Safety's Audit Management.
      { key: 'audit-management', label: 'Safety Audits', icon: 'pi-search' },
      // Reuses Compliance & Safety's Incident Reporting — occurrences feed the same register hazards do.
      { key: 'incident-reporting', label: 'Occurrence Reporting', icon: 'pi-flag' },
      { key: 'voluntary-safety-reporting', label: 'Voluntary/Confidential Reporting', icon: 'pi-lock' },
      { key: 'flight-data-monitoring', label: 'Flight Data Monitoring (FOQA)', icon: 'pi-chart-line' },
      { key: 'fatigue-risk-management', label: 'Fatigue Risk Management', icon: 'pi-moon' },
      { key: 'sms-continuous-improvement', label: 'Continuous Improvement', icon: 'pi-arrow-up-right' },
      { key: 'safety-training', label: 'Safety Training & Competency', icon: 'pi-graduation-cap' },
      { key: 'safety-communication', label: 'Safety Communication', icon: 'pi-megaphone' },
      { key: 'safety-culture-survey', label: 'Safety Culture Survey', icon: 'pi-comments' }
    ]
  },
  {
    key: 'quality-assurance',
    label: 'Quality Assurance',
    icon: 'pi-verified',
    role: 'QualityAssurance',
    items: [
      { key: 'internal-audit', label: 'Internal Audit', icon: 'pi-search' },
      { key: 'quality-inspection', label: 'Quality Inspection', icon: 'pi-eye' },
      { key: 'capa', label: 'CAPA (Corrective and Preventive Action)', icon: 'pi-refresh' },
      { key: 'non-conformance-reports', label: 'Non-Conformance Reports', icon: 'pi-ban' }
    ]
  },
  {
    key: 'crm',
    label: 'Customer Relationship Management (CRM)',
    icon: 'pi-heart',
    role: 'CRM',
    items: [
      { key: 'customer-database', label: 'Customer Database', icon: 'pi-database' },
      { key: 'complaint-management', label: 'Complaint Management', icon: 'pi-comment' },
      { key: 'call-center', label: 'Call Center', icon: 'pi-phone' },
      { key: 'crm-loyalty-program', label: 'Loyalty Program', icon: 'pi-gift' },
      { key: 'marketing-campaign', label: 'Marketing Campaign', icon: 'pi-megaphone' }
    ]
  },
  {
    key: 'document-management',
    label: 'Document Management',
    icon: 'pi-file',
    role: 'DocumentControl',
    items: [
      { key: 'aircraft-documents', label: 'Aircraft Documents', icon: 'pi-file' },
      { key: 'pilot-documents', label: 'Pilot Documents', icon: 'pi-file' },
      { key: 'certificates', label: 'Certificates', icon: 'pi-verified' },
      { key: 'contracts', label: 'Contracts', icon: 'pi-file-edit' },
      { key: 'manuals', label: 'Manuals', icon: 'pi-book' },
      { key: 'digital-signature', label: 'Digital Signature', icon: 'pi-pencil' },
      { key: 'version-control', label: 'Version Control', icon: 'pi-history' }
    ]
  },
  {
    key: 'business-intelligence',
    label: 'Business Intelligence (BI)',
    icon: 'pi-chart-bar',
    role: 'BI',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'pi-th-large', flagship: true },
      { key: 'kpi-monitoring', label: 'KPI Monitoring', icon: 'pi-gauge' },
      { key: 'revenue-analysis', label: 'Revenue Analysis', icon: 'pi-chart-line' },
      { key: 'fleet-performance', label: 'Fleet Performance', icon: 'pi-compass' },
      { key: 'flight-performance', label: 'Flight Performance', icon: 'pi-send' },
      { key: 'delay-analysis', label: 'Delay Analysis', icon: 'pi-clock' },
      { key: 'bi-fuel-cost-analysis', label: 'Fuel Cost Analysis', icon: 'pi-bolt' }
    ]
  },
  {
    key: 'security-management',
    label: 'Security Management',
    icon: 'pi-lock',
    role: 'Security',
    items: [
      { key: 'user-roles', label: 'User Roles', icon: 'pi-users', flagship: true },
      { key: 'access-control', label: 'Access Control', icon: 'pi-key', flagship: true },
      { key: 'audit-logs', label: 'Audit Logs', icon: 'pi-history' },
      { key: 'mfa', label: 'Multi-factor Authentication', icon: 'pi-shield' },
      { key: 'data-encryption', label: 'Data Encryption', icon: 'pi-lock' }
    ]
  },
  // ══════════════════════════════════════════════════════════════════════
  //  Modules added after the original 25 — the aviation and ERP capabilities
  //  a domain reviewer expects to find in a system of this scope.
  // ══════════════════════════════════════════════════════════════════════
  {
    key: 'load-control',
    label: 'Load Control & Weight/Balance',
    icon: 'pi-sliders-h',
    role: 'LoadControl',
    items: [
      { key: 'loadsheet', label: 'Loadsheet', icon: 'pi-file' },
      { key: 'trim-sheet', label: 'Trim Sheet', icon: 'pi-sliders-h' },
      { key: 'centre-of-gravity', label: 'Centre of Gravity', icon: 'pi-compass' },
      { key: 'aircraft-weighing', label: 'Aircraft Weighing', icon: 'pi-gauge' },
      { key: 'passenger-load-distribution', label: 'Passenger Distribution', icon: 'pi-users' },
      { key: 'uld-load-plan', label: 'ULD Load Plan', icon: 'pi-box' },
      { key: 'last-minute-changes', label: 'Last Minute Changes (LMC)', icon: 'pi-clock' },
      { key: 'notoc', label: 'NOTOC', icon: 'pi-exclamation-triangle' },
      { key: 'deadload-manifest', label: 'Deadload Manifest', icon: 'pi-inbox' },
      { key: 'load-planning-standards', label: 'Load Planning Standards', icon: 'pi-book' }
    ]
  },
  {
    key: 'revenue-optimization',
    label: 'Revenue Management & Pricing',
    icon: 'pi-chart-line',
    role: 'RevenueManagement',
    items: [
      { key: 'fare-management', label: 'Fare Management', icon: 'pi-tag' },
      { key: 'booking-class-inventory', label: 'Booking Class Inventory', icon: 'pi-th-large' },
      { key: 'seat-inventory-control', label: 'Seat Inventory Control', icon: 'pi-sliders-v' },
      { key: 'overbooking-management', label: 'Overbooking Management', icon: 'pi-users' },
      { key: 'demand-forecast', label: 'Demand Forecast', icon: 'pi-chart-line' },
      { key: 'competitor-fare-tracking', label: 'Competitor Fare Tracking', icon: 'pi-search' },
      { key: 'dynamic-pricing-rules', label: 'Dynamic Pricing Rules', icon: 'pi-cog' },
      { key: 'group-booking-quotes', label: 'Group Booking Quotes', icon: 'pi-users' },
      { key: 'route-profitability', label: 'Route Profitability', icon: 'pi-dollar' },
      { key: 'revenue-integrity', label: 'Revenue Integrity', icon: 'pi-verified' }
    ]
  },
  {
    key: 'revenue-accounting',
    label: 'Revenue Accounting & Settlement',
    icon: 'pi-calculator',
    role: 'Finance',
    items: [
      { key: 'passenger-revenue-accounting', label: 'Passenger Revenue Accounting', icon: 'pi-ticket' },
      { key: 'cargo-revenue-accounting', label: 'Cargo Revenue Accounting', icon: 'pi-inbox' },
      { key: 'proration', label: 'Proration', icon: 'pi-percentage' },
      { key: 'interline-billing', label: 'Interline Billing', icon: 'pi-sync' },
      { key: 'bsp-settlement', label: 'BSP Settlement', icon: 'pi-building-columns' },
      { key: 'cass-settlement', label: 'CASS Settlement', icon: 'pi-inbox' },
      { key: 'ich-clearing', label: 'ICH Clearing', icon: 'pi-refresh' },
      { key: 'sales-audit', label: 'Sales Audit', icon: 'pi-search' },
      { key: 'refund-accounting', label: 'Refund Accounting', icon: 'pi-replay' },
      { key: 'unearned-revenue', label: 'Unearned Revenue', icon: 'pi-wallet' }
    ]
  },
  {
    key: 'disruption-management',
    label: 'Disruption Management (IROPS)',
    icon: 'pi-exclamation-triangle',
    role: 'FlightOps',
    items: [
      { key: 'disruption-events', label: 'Disruption Events', icon: 'pi-exclamation-triangle' },
      // Reuses Flight Operations' Delay Management — the same IATA delay-coded record.
      { key: 'delay-management', label: 'Delay Codes (IATA)', icon: 'pi-clock' },
      { key: 'passenger-rebooking', label: 'Passenger Rebooking', icon: 'pi-sync' },
      { key: 'hotel-accommodation', label: 'Hotel Accommodation', icon: 'pi-building' },
      { key: 'meal-vouchers', label: 'Meal & Transport Vouchers', icon: 'pi-ticket' },
      { key: 'passenger-compensation-claims', label: 'Compensation Claims (EC261)', icon: 'pi-dollar' },
      { key: 'crew-recovery', label: 'Crew Recovery', icon: 'pi-users' },
      { key: 'aircraft-recovery', label: 'Aircraft Recovery', icon: 'pi-send' },
      { key: 'passenger-notification-log', label: 'Passenger Notifications', icon: 'pi-send' },
      { key: 'disruption-cost-analysis', label: 'Disruption Cost Analysis', icon: 'pi-chart-bar' }
    ]
  },
  {
    key: 'workflow-approvals',
    label: 'Workflow & Approvals',
    icon: 'pi-check-square',
    // No `role` — approvals reach every department, so any authenticated user
    // needs their own queue. What they may approve is governed by the approval
    // matrix, not by module access.
    items: [
      { key: 'my-approvals', label: 'My Approvals', icon: 'pi-user-edit' },
      { key: 'approval-requests', label: 'Approval Requests', icon: 'pi-check-square' },
      { key: 'approval-matrix', label: 'Approval Matrix', icon: 'pi-table' },
      { key: 'workflow-templates', label: 'Workflow Templates', icon: 'pi-sitemap' },
      { key: 'delegation-rules', label: 'Delegation Rules', icon: 'pi-user-plus' },
      { key: 'escalation-rules', label: 'Escalation Rules', icon: 'pi-arrow-up-right' },
      { key: 'approval-sla', label: 'Approval SLA', icon: 'pi-stopwatch' },
      { key: 'approval-history', label: 'Approval History', icon: 'pi-history' }
    ]
  },
  {
    key: 'continuing-airworthiness',
    label: 'Continuing Airworthiness (CAMO)',
    icon: 'pi-verified',
    role: 'Maintenance',
    items: [
      { key: 'airworthiness-review', label: 'Airworthiness Review', icon: 'pi-verified' },
      { key: 'arc-issuance', label: 'ARC Issuance', icon: 'pi-id-card' },
      { key: 'maintenance-programme', label: 'Maintenance Programme (AMP)', icon: 'pi-book' },
      // Reuses Aircraft Maintenance's AD Compliance — one directive register.
      { key: 'ad-compliance', label: 'AD Assessment', icon: 'pi-exclamation-triangle' },
      // Reuses Aircraft Maintenance's Service Bulletin Management.
      { key: 'service-bulletin-management', label: 'SB Assessment', icon: 'pi-megaphone' },
      { key: 'deferred-defects', label: 'Deferred Defects', icon: 'pi-clock' },
      { key: 'technical-records', label: 'Technical Records', icon: 'pi-folder' },
      { key: 'reliability-data', label: 'Reliability Data', icon: 'pi-chart-line' },
      { key: 'subcontractor-control', label: 'Subcontractor Control', icon: 'pi-building' },
      { key: 'camo-exposition', label: 'CAMO Exposition', icon: 'pi-file' }
    ]
  },
  {
    key: 'aircraft-leasing',
    label: 'Aircraft Leasing & Finance',
    icon: 'pi-file-edit',
    role: 'Fleet',
    items: [
      { key: 'lease-agreements', label: 'Lease Agreements', icon: 'pi-file-edit' },
      { key: 'lessor-management', label: 'Lessor Management', icon: 'pi-building-columns' },
      { key: 'lease-payments', label: 'Lease Payments', icon: 'pi-credit-card' },
      { key: 'maintenance-reserves', label: 'Maintenance Reserves', icon: 'pi-wallet' },
      { key: 'aircraft-delivery', label: 'Delivery & Acceptance', icon: 'pi-download' },
      { key: 'redelivery-planning', label: 'Redelivery Planning', icon: 'pi-upload' },
      { key: 'return-conditions', label: 'Return Conditions', icon: 'pi-list-check' },
      { key: 'lease-expiry-tracking', label: 'Lease Expiry Tracking', icon: 'pi-calendar-times' },
      { key: 'sublease-management', label: 'Sublease Management', icon: 'pi-share-alt' },
      { key: 'aircraft-valuation', label: 'Aircraft Valuation', icon: 'pi-chart-line' }
    ]
  },
  {
    key: 'flight-planning',
    label: 'Flight Planning & Dispatch',
    icon: 'pi-compass',
    role: 'FlightOps',
    items: [
      { key: 'operational-flight-plan', label: 'Operational Flight Plan (OFP)', icon: 'pi-file' },
      { key: 'route-optimization', label: 'Route Optimization', icon: 'pi-map' },
      { key: 'notam-management', label: 'NOTAM Management', icon: 'pi-megaphone' },
      { key: 'weather-briefing', label: 'Weather Briefing', icon: 'pi-cloud' },
      { key: 'etops-planning', label: 'ETOPS Planning', icon: 'pi-globe' },
      { key: 'alternate-airports', label: 'Alternate Airports', icon: 'pi-map-marker' },
      { key: 'payload-range-analysis', label: 'Payload/Range Analysis', icon: 'pi-chart-bar' },
      { key: 'fuel-tankering', label: 'Fuel Tankering', icon: 'pi-bolt' },
      { key: 'overflight-permits', label: 'Overflight Permits', icon: 'pi-verified' },
      { key: 'navigation-database', label: 'Navigation Database', icon: 'pi-database' }
    ]
  },
  {
    key: 'crew-training',
    label: 'Crew Training & Licensing',
    icon: 'pi-graduation-cap',
    role: 'Crew',
    items: [
      { key: 'training-programme', label: 'Training Programme', icon: 'pi-book' },
      { key: 'simulator-scheduling', label: 'Simulator Scheduling', icon: 'pi-desktop' },
      { key: 'recurrent-training', label: 'Recurrent Training', icon: 'pi-refresh' },
      { key: 'type-rating', label: 'Type Rating', icon: 'pi-id-card' },
      { key: 'line-check', label: 'Line Check', icon: 'pi-check-circle' },
      { key: 'competency-assessment', label: 'Competency Assessment', icon: 'pi-star' },
      { key: 'instructor-management', label: 'Instructor Management', icon: 'pi-user-edit' },
      // Reuses Crew Management's Training Records — one training history per person.
      { key: 'training-records', label: 'Training Records', icon: 'pi-folder' },
      { key: 'e-learning', label: 'E-Learning', icon: 'pi-desktop' },
      { key: 'training-cost', label: 'Training Cost', icon: 'pi-dollar' }
    ]
  },
  {
    key: 'special-services',
    label: 'Special Services (SSR/PRM)',
    icon: 'pi-heart',
    role: 'Reservations',
    items: [
      { key: 'ssr-requests', label: 'SSR Requests', icon: 'pi-list' },
      { key: 'prm-assistance', label: 'PRM Assistance', icon: 'pi-users' },
      { key: 'wheelchair-allocation', label: 'Wheelchair Allocation', icon: 'pi-sitemap' },
      { key: 'unaccompanied-minor', label: 'Unaccompanied Minor', icon: 'pi-user' },
      { key: 'medical-clearance', label: 'Medical Clearance (MEDIF)', icon: 'pi-heart' },
      { key: 'service-animals', label: 'Service Animals', icon: 'pi-heart-fill' },
      { key: 'extra-seat-requests', label: 'Extra Seat Requests', icon: 'pi-th-large' },
      { key: 'special-meals', label: 'Special Meals', icon: 'pi-shopping-bag' },
      { key: 'ssr-performance', label: 'SSR Performance', icon: 'pi-chart-line' }
    ]
  },
  {
    key: 'aviation-security',
    label: 'Aviation Security (AVSEC)',
    icon: 'pi-shield',
    role: 'AviationSecurity',
    items: [
      { key: 'security-programme', label: 'Security Programme', icon: 'pi-shield' },
      { key: 'threat-assessment', label: 'Threat Assessment', icon: 'pi-exclamation-triangle' },
      { key: 'background-vetting', label: 'Background Vetting', icon: 'pi-user-edit' },
      { key: 'restricted-area-permits', label: 'Restricted Area Permits', icon: 'pi-key' },
      { key: 'staff-id-cards', label: 'Staff ID Cards', icon: 'pi-id-card' },
      { key: 'passenger-screening', label: 'Passenger Screening', icon: 'pi-search' },
      { key: 'cargo-screening', label: 'Cargo Screening', icon: 'pi-inbox' },
      { key: 'security-training', label: 'Security Training', icon: 'pi-graduation-cap' },
      // Reuses Facilities' Physical Security Systems — the same CCTV/access estate.
      { key: 'physical-security-systems', label: 'Physical Security Systems', icon: 'pi-video' },
      // Reuses Compliance & Safety's Incident Reporting — one occurrence register.
      { key: 'incident-reporting', label: 'Security Incidents', icon: 'pi-flag' },
      // Reuses Compliance & Safety's Audit Management.
      { key: 'audit-management', label: 'Security Audits', icon: 'pi-search' }
    ]
  },
  {
    key: 'ground-handling-contracts',
    label: 'Ground Handling Agreements',
    icon: 'pi-file',
    role: 'AirportOps',
    items: [
      { key: 'sgha-agreements', label: 'SGHA Agreements', icon: 'pi-file-edit' },
      { key: 'annex-b-locations', label: 'Annex B Locations', icon: 'pi-map-marker' },
      { key: 'station-handling-scope', label: 'Station Handling Scope', icon: 'pi-list-check' },
      { key: 'handling-service-levels', label: 'Service Level Agreements', icon: 'pi-stopwatch' },
      { key: 'handling-rates', label: 'Handling Rates', icon: 'pi-dollar' },
      { key: 'gse-provision', label: 'GSE Provision', icon: 'pi-truck' },
      { key: 'handler-performance', label: 'Handler Performance', icon: 'pi-chart-bar' },
      { key: 'handling-invoices', label: 'Handling Invoices', icon: 'pi-credit-card' },
      { key: 'handling-disputes', label: 'Dispute Management', icon: 'pi-comment' },
      { key: 'handler-audit', label: 'Handler Audit', icon: 'pi-search' }
    ]
  },
  {
    key: 'sustainability-emissions',
    label: 'Sustainability & Emissions',
    icon: 'pi-globe',
    role: 'Sustainability',
    items: [
      { key: 'emissions-monitoring', label: 'Emissions Monitoring', icon: 'pi-globe' },
      { key: 'corsia-reporting', label: 'CORSIA Reporting', icon: 'pi-file' },
      { key: 'eu-ets-reporting', label: 'EU ETS Reporting', icon: 'pi-file' },
      { key: 'carbon-offsets', label: 'Carbon Offsets', icon: 'pi-globe' },
      { key: 'saf-tracking', label: 'Sustainable Aviation Fuel', icon: 'pi-bolt' },
      { key: 'fuel-efficiency', label: 'Fuel Efficiency', icon: 'pi-chart-line' },
      { key: 'noise-monitoring', label: 'Noise Monitoring', icon: 'pi-volume-up' },
      { key: 'energy-consumption', label: 'Energy Consumption', icon: 'pi-bolt' },
      // Reuses Facilities' Waste Management — one waste and recycling register.
      { key: 'waste-management', label: 'Waste & Recycling', icon: 'pi-trash' },
      { key: 'esg-reporting', label: 'ESG Reporting', icon: 'pi-chart-bar' }
    ]
  },
  {
    key: 'ancillary-revenue',
    label: 'Ancillary Revenue & Retailing',
    icon: 'pi-shopping-bag',
    role: 'Reservations',
    items: [
      { key: 'ancillary-products', label: 'Ancillary Products', icon: 'pi-shopping-bag' },
      { key: 'bundles-packages', label: 'Bundles & Packages', icon: 'pi-box' },
      { key: 'seat-selection-fees', label: 'Seat Selection Fees', icon: 'pi-th-large' },
      { key: 'baggage-fees', label: 'Baggage Fees', icon: 'pi-briefcase' },
      { key: 'upgrade-sales', label: 'Upgrade Sales', icon: 'pi-arrow-up-right' },
      { key: 'lounge-access-sales', label: 'Lounge Access Sales', icon: 'pi-building' },
      { key: 'travel-insurance-sales', label: 'Travel Insurance', icon: 'pi-shield' },
      { key: 'partner-products', label: 'Car & Hotel Partners', icon: 'pi-car' },
      { key: 'commission-management', label: 'Commission Management', icon: 'pi-percentage' },
      { key: 'ancillary-performance', label: 'Ancillary Performance', icon: 'pi-chart-line' }
    ]
  },
  {
    key: 'distribution-channels',
    label: 'Distribution (GDS/NDC)',
    icon: 'pi-share-alt',
    role: 'Distribution',
    items: [
      { key: 'channel-management', label: 'Channel Management', icon: 'pi-sitemap' },
      { key: 'gds-connectivity', label: 'GDS Connectivity', icon: 'pi-share-alt' },
      { key: 'ndc-offers', label: 'NDC Offers', icon: 'pi-tag' },
      { key: 'ndc-orders', label: 'NDC Orders', icon: 'pi-shopping-cart' },
      { key: 'agency-management', label: 'Agency Management', icon: 'pi-building' },
      { key: 'api-partners', label: 'API Partners', icon: 'pi-link' },
      { key: 'fare-distribution-rules', label: 'Fare Filing & Distribution', icon: 'pi-cog' },
      { key: 'booking-source-analysis', label: 'Booking Source Analysis', icon: 'pi-chart-bar' },
      { key: 'direct-channel-performance', label: 'Direct Channel Performance', icon: 'pi-chart-line' },
      { key: 'distribution-cost', label: 'Distribution Cost', icon: 'pi-dollar' }
    ]
  },
  {
    key: 'portal-management',
    label: 'Self-Service Portals',
    icon: 'pi-desktop',
    role: 'Portals',
    items: [
      { key: 'employee-self-service', label: 'Employee Self-Service', icon: 'pi-user' },
      { key: 'vendor-portal', label: 'Vendor Portal', icon: 'pi-building' },
      { key: 'customer-portal', label: 'Customer Portal', icon: 'pi-users' },
      { key: 'portal-user-requests', label: 'User Requests', icon: 'pi-user-plus' },
      { key: 'portal-announcements', label: 'Announcements', icon: 'pi-megaphone' },
      { key: 'portal-content', label: 'Content Management', icon: 'pi-file-edit' },
      { key: 'portal-feedback', label: 'Feedback', icon: 'pi-comments' },
      { key: 'portal-access-log', label: 'Access Log', icon: 'pi-history' }
    ]
  },
  {
    key: 'integration-hub',
    label: 'Integration Hub',
    icon: 'pi-sitemap',
    role: 'Integration',
    items: [
      { key: 'interface-registry', label: 'Interface Registry', icon: 'pi-sitemap' },
      { key: 'api-endpoints', label: 'API Endpoints', icon: 'pi-link' },
      { key: 'partner-connections', label: 'Partner Connections', icon: 'pi-share-alt' },
      { key: 'type-b-messaging', label: 'IATA Type B Messaging', icon: 'pi-envelope' },
      { key: 'aidx-messaging', label: 'AIDX Messaging', icon: 'pi-sync' },
      { key: 'data-mapping', label: 'Data Mapping', icon: 'pi-arrow-right-arrow-left' },
      { key: 'message-queue-monitor', label: 'Message Queue Monitor', icon: 'pi-list' },
      { key: 'integration-errors', label: 'Integration Errors', icon: 'pi-exclamation-triangle' },
      { key: 'retry-management', label: 'Retry Management', icon: 'pi-replay' },
      { key: 'etl-jobs', label: 'ETL Jobs', icon: 'pi-database' }
    ]
  },
  {
    key: 'organization',
    label: 'Organization',
    icon: 'pi-building-columns',
    // Admin/SuperAdmin bypass every role check, so naming Admin here means
    // exactly them — which is right for the records that define the group's
    // legal entities and their accounting periods.
    role: 'Admin',
    items: [
      { key: 'companies', label: 'Company Setup', icon: 'pi-building' },
      { key: 'company-branches', label: 'Branches & Divisions', icon: 'pi-sitemap' },
      { key: 'fiscal-year', label: 'Fiscal Year', icon: 'pi-calendar' },
      { key: 'company-tax-registration', label: 'Tax Registrations', icon: 'pi-file' },
      { key: 'company-bank-accounts', label: 'Company Bank Accounts', icon: 'pi-credit-card' },
      { key: 'inter-company-transactions', label: 'Inter-Company Transactions', icon: 'pi-arrow-right-arrow-left' },
      // Reuses Security Management's User Roles — a person exists once across
      // the group and is granted access per company.
      { key: 'user-roles', label: 'Group Users', icon: 'pi-users', flagship: true }
    ]
  },
  {
    key: 'notification-system',
    label: 'Notification System',
    icon: 'pi-bell',
    // No `role` — every authenticated user gets this module, no single team "owns" alerts.
    items: [
      { key: 'email-alerts', label: 'Email Alerts', icon: 'pi-envelope' },
      { key: 'sms-alerts', label: 'SMS Alerts', icon: 'pi-mobile' },
      { key: 'push-notifications', label: 'Push Notifications', icon: 'pi-bell' },
      { key: 'maintenance-reminders', label: 'Maintenance Reminders', icon: 'pi-wrench' },
      { key: 'license-expiry-alerts', label: 'License Expiry Alerts', icon: 'pi-exclamation-triangle' }
    ]
  }
];

/**
 * BI's "Dashboard" sub-item is the one manifest entry that is *not* routed
 * under its own module. It is every user's landing page, so it lives at the
 * top-level `/dashboard` rather than behind `business-intelligence`'s BI role
 * — see app.routes.ts.
 *
 * The rule lives here, once, because three separate places need it: the
 * router (skip generating the child route), the sidebar (skip the nav entry,
 * since a pinned Dashboard link sits above the menu) and the route smoke test
 * (skip asserting a route that intentionally does not exist). It was
 * duplicated as an inline condition in each until the smoke test tripped over
 * the copy it did not have.
 */
export function isRoutedUnderModule(moduleKey: string, itemKey: string): boolean {
  return !(moduleKey === 'business-intelligence' && itemKey === 'dashboard');
}

export function findModuleByItemKey(itemKey: string): ModuleDef | undefined {
  return MODULES.find((m) => m.items.some((i) => i.key === itemKey));
}
