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
  {
    key: 'supplier-management',
    label: 'Supplier & Vendor Management',
    icon: 'pi-building',
    role: 'Supplier',
    items: [
      // ── Who they are, and whether they're allowed to sell to an airline.
      { key: 'supplier-registry', label: 'Supplier Registry', icon: 'pi-building' },
      { key: 'supplier-onboarding', label: 'Onboarding & Prequalification', icon: 'pi-user-plus' },
      { key: 'supplier-categories', label: 'Supplier Category Setup', icon: 'pi-tags' },
      { key: 'supplier-contacts', label: 'Supplier Contacts', icon: 'pi-users' },
      { key: 'supplier-certifications', label: 'Certifications & Approvals', icon: 'pi-verified' },
      { key: 'approved-supplier-list', label: 'Approved Supplier List (ASL)', icon: 'pi-list-check' },
      { key: 'supplier-capability-matrix', label: 'Capability & Part Coverage', icon: 'pi-sitemap' },
      // ── Commercial terms.
      { key: 'supplier-price-list', label: 'Price Lists & Catalogues', icon: 'pi-tag' },
      { key: 'supplier-quotations', label: 'Supplier Quotations', icon: 'pi-file-edit' },
      { key: 'supplier-agreements', label: 'Agreements & SLA', icon: 'pi-file' },
      // Reuses Procurement's RFQ — the request these quotations answer.
      { key: 'rfq', label: 'RFQ to Suppliers', icon: 'pi-file-edit' },
      // ── Performance & risk.
      { key: 'supplier-lead-time', label: 'Lead Time & AOG Response', icon: 'pi-stopwatch' },
      { key: 'supplier-performance-kpi', label: 'Performance Scorecard', icon: 'pi-chart-bar' },
      { key: 'supplier-audit', label: 'Supplier Audit & Surveillance', icon: 'pi-search' },
      { key: 'supplier-nonconformance', label: 'Non-Conformance (SCAR)', icon: 'pi-ban' },
      { key: 'supplier-risk-assessment', label: 'Supplier Risk Assessment', icon: 'pi-exclamation-triangle' },
      { key: 'supplier-blacklist', label: 'Blacklist & Suspension', icon: 'pi-ban' },
      // ── Money & paperwork.
      { key: 'supplier-invoice', label: 'Supplier Invoices', icon: 'pi-file-edit' },
      { key: 'supplier-payment', label: 'Payments & Terms', icon: 'pi-credit-card' },
      { key: 'supplier-credit-debit-note', label: 'Credit & Debit Notes', icon: 'pi-replay' },
      { key: 'supplier-document-vault', label: 'Document Vault', icon: 'pi-folder' },
      { key: 'supplier-portal-access', label: 'Portal Access & Users', icon: 'pi-key' }
    ]
  },
  {
    key: 'sales-buyer-management',
    label: 'Sales & Buyer Management',
    icon: 'pi-users',
    role: 'Sales',
    items: [
      // ── Who buys from us.
      { key: 'buyer-registry', label: 'Buyer Registry', icon: 'pi-users' },
      { key: 'buyer-categories', label: 'Buyer Category Setup', icon: 'pi-tags' },
      { key: 'buyer-contacts', label: 'Buyer Contacts', icon: 'pi-address-book' },
      { key: 'corporate-accounts', label: 'Corporate Accounts', icon: 'pi-building-columns' },
      { key: 'travel-agency-management', label: 'Travel Agents & GSA', icon: 'pi-briefcase' },
      { key: 'cargo-agent-management', label: 'Cargo Agents (CASS)', icon: 'pi-inbox' },
      { key: 'interline-partners', label: 'Interline & Codeshare Partners', icon: 'pi-share-alt' },
      { key: 'credit-limit-management', label: 'Credit Limit & Exposure', icon: 'pi-gauge' },
      // ── Selling to them.
      { key: 'sales-pipeline', label: 'Opportunity Pipeline', icon: 'pi-chart-line' },
      { key: 'sales-quotation', label: 'Sales Quotations', icon: 'pi-file-edit' },
      { key: 'sales-contract', label: 'Sales Contracts', icon: 'pi-file' },
      { key: 'sales-order', label: 'Sales Orders', icon: 'pi-shopping-bag' },
      { key: 'tariff-fare-agreement', label: 'Tariff & Fare Agreements', icon: 'pi-percentage' },
      { key: 'commission-management', label: 'Agent Commission & Incentives', icon: 'pi-dollar' },
      // ── Getting paid.
      { key: 'sales-invoice', label: 'Sales Invoices', icon: 'pi-file-edit' },
      { key: 'sales-receipt', label: 'Receipts & Collections', icon: 'pi-wallet' },
      { key: 'buyer-outstanding', label: 'Outstanding & Ageing', icon: 'pi-clock' },
      { key: 'sales-return-credit', label: 'Sales Return & Credit Notes', icon: 'pi-replay' },
      // ── Selling things other than seats.
      { key: 'third-party-mro-sales', label: 'Third-Party MRO Sales', icon: 'pi-wrench' },
      { key: 'parts-sales-exchange', label: 'Parts Sale / Exchange / Loan', icon: 'pi-box' },
      { key: 'buyer-satisfaction-survey', label: 'Buyer Satisfaction Survey', icon: 'pi-comments' },
      // Reuses CRM's Customer Database — the retail passenger behind an agency booking.
      { key: 'customer-database', label: 'Customer Database', icon: 'pi-database' }
    ]
  },
  {
    key: 'catering-food-services',
    label: 'Catering & Food Services',
    icon: 'pi-shopping-bag',
    role: 'Catering',
    items: [
      // ── Who cooks it.
      { key: 'catering-kitchen-registry', label: 'Flight Kitchen Registry', icon: 'pi-building' },
      { key: 'catering-supplier', label: 'Catering Suppliers & Contracts', icon: 'pi-briefcase' },
      // ── What's on the menu.
      { key: 'menu-planning', label: 'Menu Planning & Cycles', icon: 'pi-calendar' },
      { key: 'recipe-management', label: 'Recipe & Ingredient Master', icon: 'pi-book' },
      { key: 'meal-catalogue', label: 'Meal Catalogue', icon: 'pi-list' },
      { key: 'special-meal-management', label: 'Special Meals (SPML)', icon: 'pi-star' },
      { key: 'dietary-religious-compliance', label: 'Halal / Kosher / Allergen', icon: 'pi-verified' },
      // ── Getting it onto the aircraft.
      { key: 'catering-order', label: 'Catering Order per Flight', icon: 'pi-shopping-cart' },
      { key: 'catering-uplift-downlift', label: 'Uplift & Downlift Records', icon: 'pi-arrow-right-arrow-left' },
      { key: 'galley-loading-plan', label: 'Galley Loading Plan', icon: 'pi-th-large' },
      { key: 'trolley-cart-management', label: 'Trolley & Cart Management', icon: 'pi-box' },
      { key: 'crew-meal-management', label: 'Crew Meals', icon: 'pi-users' },
      // ── Stock, bonded goods and onboard retail.
      { key: 'catering-inventory', label: 'Catering Inventory', icon: 'pi-inbox' },
      { key: 'beverage-management', label: 'Beverage & Bar Stock', icon: 'pi-box' },
      { key: 'bonded-store-management', label: 'Bonded Store & Duty-Free', icon: 'pi-lock' },
      { key: 'onboard-sales', label: 'Onboard Retail Sales', icon: 'pi-shopping-bag' },
      { key: 'lounge-catering', label: 'Lounge F&B Services', icon: 'pi-home' },
      // ── Food safety and the money.
      { key: 'food-safety-haccp', label: 'Food Safety & HACCP', icon: 'pi-shield' },
      { key: 'kitchen-hygiene-audit', label: 'Kitchen Hygiene Audit', icon: 'pi-search' },
      { key: 'food-wastage', label: 'Food Wastage & Variance', icon: 'pi-trash' },
      { key: 'catering-billing', label: 'Catering Billing', icon: 'pi-dollar' },
      { key: 'meal-complaint', label: 'Meal Complaints & Feedback', icon: 'pi-comment' }
    ]
  },
  {
    key: 'irregular-operations',
    label: 'IRROPS & Passenger Care',
    icon: 'pi-exclamation-triangle',
    role: 'Irrops',
    items: [
      // ── The disruption itself.
      { key: 'disruption-event', label: 'Disruption Events', icon: 'pi-exclamation-triangle' },
      { key: 'disruption-cause-code', label: 'Delay & Cancel Cause Codes', icon: 'pi-tags' },
      { key: 'irrops-decision-log', label: 'IRROPS Decision Log', icon: 'pi-book' },
      { key: 'diversion-management', label: 'Diversion & Alternate Handling', icon: 'pi-directions-alt' },
      // Reuses Flight Operations' Delay Management — the ops-side delay record this module reacts to.
      { key: 'delay-management', label: 'Delay Management', icon: 'pi-clock' },
      // ── Moving the passengers.
      { key: 'passenger-impact-list', label: 'Impacted Passenger List', icon: 'pi-users' },
      { key: 'passenger-reaccommodation', label: 'Re-accommodation & Rebooking', icon: 'pi-sync' },
      { key: 'misconnection-management', label: 'Misconnection Management', icon: 'pi-sync' },
      { key: 'denied-boarding', label: 'Denied Boarding & Offload', icon: 'pi-user-minus' },
      { key: 'stranded-passenger-tracking', label: 'Stranded Passenger Tracking', icon: 'pi-map-marker' },
      { key: 'special-assistance-irrops', label: 'Special Assistance (PRM/UM)', icon: 'pi-heart' },
      // ── Where they sleep, eat and how they get there — duty of care.
      { key: 'duty-of-care-entitlement', label: 'Duty of Care Entitlement Rules', icon: 'pi-list-check' },
      { key: 'hotel-partner-registry', label: 'Hotel Partner Registry', icon: 'pi-building' },
      { key: 'hotel-rate-contract', label: 'Hotel Rate Contracts & Allotments', icon: 'pi-file' },
      { key: 'hotel-room-booking', label: 'Passenger Hotel Booking', icon: 'pi-home' },
      { key: 'hotel-room-inventory', label: 'Room Block & Availability', icon: 'pi-th-large' },
      { key: 'passenger-transport', label: 'Passenger Ground Transport', icon: 'pi-car' },
      { key: 'meal-voucher', label: 'Meal & Refreshment Vouchers', icon: 'pi-ticket' },
      { key: 'communication-voucher', label: 'Communication Allowance', icon: 'pi-phone' },
      { key: 'irrops-passenger-notification', label: 'Passenger Notification Log', icon: 'pi-send' },
      // ── What it costs us.
      { key: 'ec261-compensation', label: 'Consumer Compensation Claims', icon: 'pi-dollar' },
      { key: 'irrops-expense-claim', label: 'Disruption Expense Claims', icon: 'pi-file-edit' },
      { key: 'hotel-invoice-reconciliation', label: 'Hotel Invoice Reconciliation', icon: 'pi-file-edit' },
      { key: 'irrops-cost-tracking', label: 'Disruption Cost Tracking', icon: 'pi-chart-bar' }
    ]
  },
  {
    key: 'crew-staff-travel',
    label: 'Crew & Staff Travel (HOTAC)',
    icon: 'pi-briefcase',
    role: 'Travel',
    items: [
      // ── Asking to travel.
      { key: 'travel-request', label: 'Duty Travel Request', icon: 'pi-file-edit' },
      { key: 'travel-approval', label: 'Travel Approval Workflow', icon: 'pi-check-square' },
      { key: 'travel-policy', label: 'Travel Policy & Entitlements', icon: 'pi-book' },
      { key: 'duty-travel-itinerary', label: 'Travel Itinerary', icon: 'pi-map' },
      { key: 'corporate-travel-agency', label: 'Corporate Travel Agency (TMC)', icon: 'pi-briefcase' },
      // ── Crew layovers — the HOTAC core.
      { key: 'crew-hotel-contract', label: 'Crew Hotel Contracts & Rates', icon: 'pi-file' },
      { key: 'crew-layover-hotel', label: 'Crew Layover Hotel', icon: 'pi-home' },
      { key: 'crew-room-allocation', label: 'Crew Room Allocation', icon: 'pi-th-large' },
      { key: 'crew-transport', label: 'Crew Transport', icon: 'pi-car' },
      { key: 'positioning-deadhead', label: 'Positioning / Deadhead Travel', icon: 'pi-send' },
      { key: 'accommodation-facility', label: 'Company Accommodation', icon: 'pi-building' },
      { key: 'crew-rest-facility', label: 'Crew Rest & Fatigue Facility', icon: 'pi-moon' },
      { key: 'hotel-service-quality', label: 'Hotel Service Quality', icon: 'pi-star' },
      // ── Staff concessional travel.
      { key: 'staff-travel-ticket', label: 'Staff Travel Tickets (ID90/ID50)', icon: 'pi-ticket' },
      { key: 'staff-standby-listing', label: 'Staff Standby Listing', icon: 'pi-list' },
      // ── Documents that ground a trip.
      { key: 'visa-passport-tracking', label: 'Visa & Passport Tracking', icon: 'pi-id-card' },
      { key: 'crew-visa-gendec', label: 'Crew Visa & GENDEC', icon: 'pi-file' },
      { key: 'travel-insurance', label: 'Travel Insurance', icon: 'pi-shield' },
      // ── Money.
      { key: 'per-diem-management', label: 'Per Diem & Allowance', icon: 'pi-money-bill' },
      { key: 'travel-advance', label: 'Travel Advance', icon: 'pi-wallet' },
      { key: 'travel-expense-claim', label: 'Travel Expense Claim', icon: 'pi-file-edit' },
      { key: 'travel-expense-settlement', label: 'Expense Settlement', icon: 'pi-check-circle' },
      { key: 'travel-cost-analysis', label: 'Travel Cost Tracking', icon: 'pi-chart-bar' }
    ]
  },
  {
    key: 'ground-handling-services',
    label: 'Ground Handling Services',
    icon: 'pi-truck',
    role: 'GroundHandling',
    items: [
      // ── Who handles us, and on what terms.
      { key: 'gha-registry', label: 'Ground Handler (GHA) Registry', icon: 'pi-building' },
      { key: 'gha-sgha-contract', label: 'SGHA / Annex B Contracts', icon: 'pi-file' },
      { key: 'ground-service-catalogue', label: 'Service Catalogue & Rates', icon: 'pi-list' },
      // ── The turnaround, service by service.
      { key: 'turnaround-service-order', label: 'Turnaround Service Order', icon: 'pi-clipboard' },
      { key: 'ramp-handling', label: 'Ramp Handling Operations', icon: 'pi-car' },
      { key: 'passenger-handling-service', label: 'Passenger Handling Services', icon: 'pi-users' },
      { key: 'pushback-towing', label: 'Pushback & Towing', icon: 'pi-arrow-left' },
      { key: 'aircraft-cleaning', label: 'Aircraft Cleaning & Grooming', icon: 'pi-sparkles' },
      { key: 'lavatory-water-service', label: 'Lavatory & Potable Water', icon: 'pi-filter' },
      { key: 'deicing-service', label: 'De-icing / Anti-icing Service', icon: 'pi-cloud' },
      { key: 'gpu-acu-service', label: 'GPU / ACU / Air Start', icon: 'pi-bolt' },
      { key: 'into-plane-fueling', label: 'Into-Plane Fuelling Service', icon: 'pi-bolt' },
      // ── The equipment and the people.
      { key: 'gse-allocation', label: 'GSE Allocation & Dispatch', icon: 'pi-truck' },
      { key: 'gse-maintenance', label: 'GSE Maintenance', icon: 'pi-wrench' },
      { key: 'gse-fuel-consumption', label: 'GSE Fuel & Charging', icon: 'pi-bolt' },
      { key: 'ground-staff-roster', label: 'Ground Staff Roster', icon: 'pi-table' },
      // Reuses Facilities & Assets' GSE Fleet Registry — the equipment master behind allocation.
      { key: 'gse-fleet-registry', label: 'GSE Fleet Registry', icon: 'pi-truck' },
      // ── Load control.
      { key: 'load-control-sheet', label: 'Load Control & Loadsheet', icon: 'pi-file-edit' },
      { key: 'weight-balance', label: 'Weight & Balance', icon: 'pi-gauge' },
      { key: 'uld-management', label: 'ULD Management & Control', icon: 'pi-box' },
      // ── Safety, performance and billing.
      { key: 'ramp-safety-inspection', label: 'Ramp Safety Inspection', icon: 'pi-shield' },
      { key: 'ground-damage-report', label: 'Ground Damage Report', icon: 'pi-exclamation-triangle' },
      { key: 'gha-sla-performance', label: 'GHA SLA & Performance', icon: 'pi-chart-line' },
      { key: 'ground-handling-billing', label: 'Ground Handling Billing', icon: 'pi-dollar' }
    ]
  },
  {
    key: 'training-academy',
    label: 'Training & Simulator Management',
    icon: 'pi-graduation-cap',
    role: 'Training',
    items: [
      // ── What we teach.
      { key: 'training-course-catalogue', label: 'Course Catalogue', icon: 'pi-book' },
      { key: 'training-curriculum', label: 'Curriculum & Syllabus', icon: 'pi-list' },
      { key: 'training-program-approval', label: 'Regulatory Program Approval', icon: 'pi-verified' },
      { key: 'elearning-module', label: 'E-Learning Modules', icon: 'pi-desktop' },
      // ── Who teaches and who learns.
      { key: 'instructor-management', label: 'Instructor & Examiner Management', icon: 'pi-user-edit' },
      { key: 'trainee-enrollment', label: 'Trainee Enrollment', icon: 'pi-user-plus' },
      { key: 'training-batch', label: 'Training Batch / Class', icon: 'pi-users' },
      // ── Where and when.
      { key: 'training-schedule', label: 'Training Schedule', icon: 'pi-calendar' },
      { key: 'classroom-management', label: 'Classroom & Facility Booking', icon: 'pi-building' },
      { key: 'simulator-registry', label: 'Simulator Registry', icon: 'pi-desktop' },
      { key: 'simulator-slot-booking', label: 'Simulator Slot Booking', icon: 'pi-calendar-clock' },
      { key: 'simulator-maintenance', label: 'Simulator Maintenance & Qualification', icon: 'pi-wrench' },
      // ── Checks and ratings.
      { key: 'type-rating-management', label: 'Type Rating Management', icon: 'pi-id-card' },
      { key: 'line-training-check', label: 'Line Training & Line Check', icon: 'pi-send' },
      { key: 'proficiency-check', label: 'Proficiency Check (LPC/OPC)', icon: 'pi-check-square' },
      { key: 'recurrent-training-plan', label: 'Recurrent Training Plan', icon: 'pi-refresh' },
      { key: 'competency-framework', label: 'Competency (EBT/CBTA) Framework', icon: 'pi-sitemap' },
      // ── Records and outcomes.
      { key: 'training-attendance', label: 'Training Attendance', icon: 'pi-calendar-plus' },
      { key: 'training-assessment', label: 'Assessment & Exam Results', icon: 'pi-check-circle' },
      { key: 'training-certificate-issue', label: 'Certificate Issuance', icon: 'pi-verified' },
      { key: 'training-record-file', label: 'Individual Training File', icon: 'pi-folder' },
      { key: 'training-feedback', label: 'Training Feedback', icon: 'pi-comments' },
      { key: 'training-cost-billing', label: 'Training Cost & Billing', icon: 'pi-dollar' },
      // Reuses Crew Management's Training Records — the crew-side completion history.
      { key: 'training-records', label: 'Crew Training Records', icon: 'pi-graduation-cap' }
    ]
  },
  {
    key: 'charter-leasing',
    label: 'Charter & Aircraft Leasing',
    icon: 'pi-send',
    role: 'Charter',
    items: [
      // ── Selling a charter.
      { key: 'charter-enquiry', label: 'Charter Enquiry', icon: 'pi-inbox' },
      { key: 'charter-quotation', label: 'Charter Quotation', icon: 'pi-file-edit' },
      { key: 'charter-pricing-model', label: 'Charter Pricing & Costing', icon: 'pi-calculator' },
      { key: 'charter-contract', label: 'Charter Contract', icon: 'pi-file' },
      { key: 'charter-flight-schedule', label: 'Charter Flight Schedule', icon: 'pi-calendar' },
      // ── Charter types that need their own handling.
      { key: 'hajj-umrah-operations', label: 'Hajj / Umrah Operations', icon: 'pi-globe' },
      { key: 'vip-special-charter', label: 'VIP & Special Charter', icon: 'pi-star' },
      { key: 'cargo-charter', label: 'Cargo Charter', icon: 'pi-inbox' },
      // ── Operating it.
      { key: 'charter-permit-management', label: 'Overflight & Landing Permits', icon: 'pi-globe' },
      { key: 'charter-ground-arrangement', label: 'Charter Ground Arrangements', icon: 'pi-car' },
      { key: 'charter-settlement', label: 'Charter Settlement & Payment', icon: 'pi-check-circle' },
      // ── Leasing aircraft in and out.
      { key: 'lessor-registry', label: 'Lessor & Lessee Registry', icon: 'pi-building-columns' },
      { key: 'acmi-agreement', label: 'ACMI / Wet Lease Agreement', icon: 'pi-file' },
      { key: 'dry-lease-agreement', label: 'Dry Lease Agreement', icon: 'pi-file-edit' },
      { key: 'lease-rental-invoice', label: 'Lease Rental & Invoicing', icon: 'pi-dollar' },
      { key: 'maintenance-reserve', label: 'Maintenance Reserves', icon: 'pi-wallet' },
      { key: 'insurance-certificate', label: 'Insurance & Certificates', icon: 'pi-shield' },
      // ── Delivery and the expensive end of a lease.
      { key: 'aircraft-delivery-acceptance', label: 'Delivery & Acceptance', icon: 'pi-check-circle' },
      { key: 'aircraft-redelivery', label: 'Redelivery & Return Conditions', icon: 'pi-replay' },
      { key: 'lease-technical-record', label: 'Lease Technical Records', icon: 'pi-folder' }
    ]
  },
  {
    key: 'revenue-accounting',
    label: 'Revenue Accounting & Billing',
    icon: 'pi-calculator',
    role: 'RevenueAccounting',
    items: [
      // ── Recognising what we sold.
      { key: 'passenger-revenue-accounting', label: 'Passenger Revenue Accounting', icon: 'pi-ticket' },
      { key: 'cargo-revenue-accounting', label: 'Cargo Revenue Accounting', icon: 'pi-inbox' },
      { key: 'ticket-coupon-control', label: 'Ticket & Coupon Control', icon: 'pi-list-check' },
      { key: 'flown-revenue-recognition', label: 'Flown Revenue Recognition', icon: 'pi-check-circle' },
      { key: 'unearned-revenue-liability', label: 'Unearned Revenue (ATL)', icon: 'pi-wallet' },
      { key: 'emd-accounting', label: 'EMD & Ancillary Accounting', icon: 'pi-credit-card' },
      { key: 'refund-accounting', label: 'Refund Accounting', icon: 'pi-replay' },
      // ── Splitting and settling with partners.
      { key: 'proration', label: 'Proration', icon: 'pi-percentage' },
      { key: 'interline-billing', label: 'Interline Billing (SIS)', icon: 'pi-share-alt' },
      { key: 'bsp-arc-settlement', label: 'BSP / ARC Settlement', icon: 'pi-building-columns' },
      { key: 'cass-settlement', label: 'CASS Cargo Settlement', icon: 'pi-inbox' },
      { key: 'agent-commission-settlement', label: 'Agent Commission Settlement', icon: 'pi-dollar' },
      { key: 'intercompany-settlement', label: 'Intercompany Settlement', icon: 'pi-arrow-right-arrow-left' },
      // ── Verifying what everyone bills us.
      { key: 'tax-fee-charges', label: 'Taxes, Fees & Charges', icon: 'pi-percentage' },
      { key: 'airport-charges-billing', label: 'Airport & ANSP Charges', icon: 'pi-building' },
      { key: 'navigation-charges', label: 'Route & Navigation Charges', icon: 'pi-map' },
      { key: 'handling-charges-verification', label: 'Handling Invoice Verification', icon: 'pi-check-square' },
      { key: 'fuel-invoice-verification', label: 'Fuel Invoice Verification', icon: 'pi-bolt' },
      // ── Making sure none of it leaked.
      { key: 'revenue-leakage-audit', label: 'Revenue Leakage & Audit', icon: 'pi-search' },
      { key: 'revenue-reconciliation', label: 'Revenue Reconciliation', icon: 'pi-sync' }
    ]
  },
  {
    key: 'environment-sustainability',
    label: 'Environment & Sustainability',
    icon: 'pi-globe',
    role: 'Sustainability',
    items: [
      // ── Carbon: measure it, report it, offset it.
      { key: 'emission-monitoring', label: 'CO2 Emission Monitoring', icon: 'pi-cloud' },
      { key: 'corsia-reporting', label: 'CORSIA Reporting', icon: 'pi-globe' },
      { key: 'ets-compliance', label: 'EU / UK ETS Compliance', icon: 'pi-verified' },
      { key: 'carbon-offset-program', label: 'Carbon Offset Programs', icon: 'pi-heart' },
      { key: 'saf-management', label: 'Sustainable Aviation Fuel (SAF)', icon: 'pi-bolt' },
      { key: 'fuel-efficiency-initiative', label: 'Fuel Efficiency Initiatives', icon: 'pi-chart-line' },
      // ── Local environmental impact.
      { key: 'noise-monitoring', label: 'Noise Monitoring & Abatement', icon: 'pi-bell' },
      { key: 'air-quality-monitoring', label: 'Air Quality Monitoring', icon: 'pi-cloud' },
      { key: 'water-discharge-management', label: 'Water & Discharge Management', icon: 'pi-filter' },
      { key: 'waste-recycling-program', label: 'Waste & Recycling Program', icon: 'pi-trash' },
      { key: 'single-use-plastic-reduction', label: 'Single-Use Plastic Reduction', icon: 'pi-ban' },
      { key: 'energy-consumption-tracking', label: 'Energy Consumption Tracking', icon: 'pi-bolt' },
      { key: 'wildlife-hazard-management', label: 'Wildlife Hazard Management', icon: 'pi-eye' },
      // ── Compliance and disclosure.
      { key: 'environmental-permit', label: 'Environmental Permits & Licences', icon: 'pi-verified' },
      { key: 'environmental-audit', label: 'Environmental Audit', icon: 'pi-search' },
      { key: 'environmental-incident', label: 'Environmental Incident', icon: 'pi-exclamation-triangle' },
      { key: 'sustainability-target', label: 'Sustainability Targets & KPI', icon: 'pi-gauge' },
      { key: 'esg-reporting', label: 'ESG Disclosure', icon: 'pi-file' }
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

export function findModuleByItemKey(itemKey: string): ModuleDef | undefined {
  return MODULES.find((m) => m.items.some((i) => i.key === itemKey));
}
