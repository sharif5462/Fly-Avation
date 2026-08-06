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
      { key: 'baggage-handling-dashboard', label: 'Baggage Handling Dashboard', icon: 'pi-th-large', flagship: true },
      { key: 'baggage-handling', label: 'Baggage Handling', icon: 'pi-briefcase', flagship: true },
      { key: 'baggage-reconciliation', label: 'Baggage Reconciliation (BRS)', icon: 'pi-verified' },
      { key: 'baggage-screening', label: 'Baggage Screening', icon: 'pi-shield' },
      { key: 'mishandled-baggage', label: 'Mishandled Baggage / Lost & Found', icon: 'pi-search' },
      { key: 'ground-handling', label: 'Ground Handling', icon: 'pi-car' },
      { key: 'aircraft-parking', label: 'Aircraft Parking', icon: 'pi-map-marker' },
      { key: 'boarding-management', label: 'Boarding Management', icon: 'pi-users' }
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
