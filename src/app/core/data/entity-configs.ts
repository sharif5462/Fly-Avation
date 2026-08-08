import { EntityConfig, TagSeverity } from '../models/entity-config.model';
import { EXTENDED_ENTITY_LIST } from './entity-configs-extended';
import { date, datetime, entity, f, money, num, statusField } from './entity-field-helpers';

/**
 * Field/table/form configuration for every *generic* (non-flagship) sub-item
 * in module-manifest.ts. Consumed by shared/scaffold/feature-list-page to
 * render a real, working CRUD screen for each — table columns, the add/edit
 * dialog form, and validation — without a bespoke component per item.
 *
 * This file covers the original 25 modules; the ten later modules (supplier,
 * sales/buyer, catering, IRROPS, crew & staff travel, ground handling,
 * training, charter & leasing, revenue accounting, sustainability) live in
 * entity-configs-extended.ts and are concatenated at the bottom. Both use the
 * same helpers from entity-field-helpers.ts, and both feed one flat
 * `ENTITY_CONFIGS` lookup — nothing downstream knows there are two files.
 *
 * Flagship items (flight-scheduling, aircraft-registration, work-orders,
 * mro-dashboard, component-tracking, pilot-management, spare-parts-inventory,
 * purchase-orders, user-roles, access-control, dashboard, warehouse-dashboard,
 * item-master, facility-dashboard, asset-master, sms-dashboard, hazard-reporting,
 * baggage-handling-dashboard, baggage-handling, landside-dashboard, resource-dashboard)
 * intentionally have no entry here: they have hand-built components under features/ instead.
 */

const ENTITY_LIST: EntityConfig[] = [
  // ───────────────────────── Flight Operations ─────────────────────────
  entity('route-planning', 'Route', 'Route Planning', 'pi-map', 'Plan and manage flight routes between airport pairs.', [
    f('routeCode', 'Route Code'),
    f('origin', 'Origin Airport'),
    f('destination', 'Destination Airport'),
    num('distanceNm', 'Distance (NM)'),
    f('estFlightTime', 'Est. Flight Time'),
    statusField([['Active', 'success'], ['Under Review', 'warn'], ['Suspended', 'danger']])
  ]),
  entity('flight-dispatch', 'Dispatch Release', 'Flight Dispatch', 'pi-directions', 'Release flights for departure with dispatcher sign-off.', [
    f('dispatchNo', 'Dispatch No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('dispatcher', 'Dispatcher'),
    datetime('releaseTime', 'Release Time'),
    statusField([['Released', 'success'], ['Pending', 'info'], ['Held', 'danger']])
  ]),
  entity('aircraft-assignment', 'Assignment', 'Aircraft Assignment', 'pi-link', 'Assign aircraft tail numbers to scheduled flights.', [
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('assignedDate', 'Assigned Date'),
    f('assignedBy', 'Assigned By'),
    statusField([['Confirmed', 'success'], ['Tentative', 'warn'], ['Cancelled', 'danger']])
  ]),
  entity('crew-assignment', 'Crew Assignment', 'Crew Assignment', 'pi-users', 'Assign cockpit and cabin crew to scheduled flights.', [
    f('flightNo', 'Flight No.'),
    f('crewMember', 'Crew Member'),
    f('role', 'Role', 'select', { options: [{ label: 'Captain', value: 'Captain' }, { label: 'First Officer', value: 'First Officer' }, { label: 'Purser', value: 'Purser' }, { label: 'Flight Attendant', value: 'Flight Attendant' }] }),
    date('assignedDate', 'Assigned Date'),
    statusField([['Confirmed', 'success'], ['Pending', 'info'], ['Swapped', 'warn']])
  ]),
  entity('flight-tracking', 'Tracked Flight', 'Flight Tracking', 'pi-map-marker', 'Live position and status feed for in-progress flights.', [
    f('flightNo', 'Flight No.'),
    f('currentLocation', 'Current Location'),
    num('altitudeFt', 'Altitude (ft)'),
    num('speedKts', 'Speed (kts)'),
    datetime('eta', 'ETA'),
    statusField([['On Time', 'success'], ['Delayed', 'warn'], ['Diverted', 'danger'], ['Landed', 'secondary']])
  ]),
  entity('delay-management', 'Delay Record', 'Delay Management', 'pi-clock', 'Track and resolve flight delays and their root causes.', [
    f('flightNo', 'Flight No.'),
    f('delayReason', 'Delay Reason'),
    num('delayMinutes', 'Delay Duration (min)'),
    f('reportedBy', 'Reported By'),
    statusField([['Open', 'danger'], ['Monitoring', 'warn'], ['Resolved', 'success']])
  ]),
  entity('fuel-planning', 'Fuel Plan', 'Fuel Planning', 'pi-bolt', 'Plan trip and reserve fuel loads per flight.', [
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    num('plannedFuelKg', 'Planned Fuel (kg)'),
    num('reserveFuelKg', 'Reserve Fuel (kg)'),
    statusField([['Draft', 'info'], ['Approved', 'success'], ['Loaded', 'secondary']])
  ]),

  // ───────────────────────── Aircraft Maintenance (MRO) ─────────────────────────
  entity('preventive-maintenance', 'PM Task', 'Preventive Maintenance', 'pi-shield', 'Scheduled maintenance performed on a fixed interval.', [
    f('taskNo', 'Task No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('taskDescription', 'Task Description'),
    f('interval', 'Interval'),
    date('nextDueDate', 'Next Due Date'),
    statusField([['Scheduled', 'info'], ['Due', 'warn'], ['Completed', 'success']])
  ]),
  entity('corrective-maintenance', 'Defect', 'Corrective Maintenance', 'pi-hammer', 'Unscheduled repairs raised against reported defects.', [
    f('defectNo', 'Defect No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('defectDescription', 'Defect Description'),
    f('reportedBy', 'Reported By'),
    statusField([['Open', 'danger'], ['In Progress', 'warn'], ['Rectified', 'success']])
  ]),
  entity('maintenance-planning', 'Maintenance Plan', 'Maintenance Planning', 'pi-calendar-clock', 'Forward schedule of A/B/C/D checks across the fleet.', [
    f('planNo', 'Plan No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('checkType', 'Check Type', 'select', { options: ['A-Check', 'B-Check', 'C-Check', 'D-Check'].map((v) => ({ label: v, value: v })) }),
    date('plannedDate', 'Planned Date'),
    statusField([['Planned', 'info'], ['Confirmed', 'success'], ['Deferred', 'warn']])
  ]),
  entity('aircraft-logbook', 'Logbook Entry', 'Aircraft Logbook', 'pi-book', 'Chronological record of flight and maintenance events per tail.', [
    f('entryNo', 'Entry No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('entryDate', 'Entry Date'),
    f('entryType', 'Entry Type', 'select', { options: ['Flight', 'Maintenance', 'Defect'].map((v) => ({ label: v, value: v })) }),
    f('recordedBy', 'Recorded By')
  ]),
  entity('airworthiness-certificate', 'Certificate', 'Airworthiness Certificates', 'pi-verified', 'Certificate of airworthiness validity per aircraft.', [
    f('certificateNo', 'Certificate No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('issuedDate', 'Issued Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('service-bulletin-management', 'Service Bulletin', 'Service Bulletin Management', 'pi-megaphone', 'Manufacturer service bulletins and fleet applicability.', [
    f('sbNo', 'SB No.'),
    f('title', 'Title'),
    f('manufacturer', 'Manufacturer'),
    f('applicableAircraft', 'Applicable Aircraft'),
    date('complianceDate', 'Compliance Date'),
    statusField([['Open', 'info'], ['Complied', 'success'], ['Not Applicable', 'secondary']])
  ]),
  entity('ad-compliance', 'Airworthiness Directive', 'AD Compliance', 'pi-exclamation-triangle', 'Regulator-mandated airworthiness directive tracking.', [
    f('adNo', 'AD No.'),
    f('title', 'Title'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('complianceDeadline', 'Compliance Deadline'),
    statusField([['Compliant', 'success'], ['Pending', 'warn'], ['Overdue', 'danger']])
  ]),
  entity('mel-cdl-tracking', 'MEL/CDL Item', 'MEL / CDL Tracking', 'pi-list-check', 'Deferred defects flown under the Minimum Equipment List / Configuration Deviation List, with rectification deadlines.', [
    f('melItemNo', 'MEL Item No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('ataChapter', 'ATA Chapter'),
    f('description', 'Item Description'),
    f('category', 'MEL Category', 'select', { badge: true, options: [['Category A', 'danger'], ['Category B', 'warn'], ['Category C', 'info'], ['Category D', 'secondary']].map(([v, s]) => ({ label: v, value: v, severity: s as TagSeverity })) }),
    date('deferredDate', 'Deferred Date'),
    date('rectificationDueDate', 'Rectification Due'),
    statusField([['Deferred', 'warn'], ['Extended', 'info'], ['Rectified', 'success']])
  ]),
  entity('reliability-program', 'Reliability Report', 'Reliability Program', 'pi-chart-line', 'Fleet component and system reliability trend monitoring against manufacturer alert levels.', [
    f('reportNo', 'Report No.'),
    f('systemAta', 'System / ATA Chapter'),
    f('componentName', 'Component / System'),
    f('reportingPeriod', 'Reporting Period'),
    num('removalRate', 'Removal Rate (per 1000 FH)', { min: 0 }),
    f('alertLevel', 'Alert Level', 'select', { badge: true, options: [['Below Alert', 'success'], ['Watch', 'info'], ['Alert', 'warn'], ['Action Required', 'danger']].map(([v, s]) => ({ label: v, value: v, severity: s as TagSeverity })) }),
    statusField([['Monitoring', 'info'], ['Under Review', 'warn'], ['Corrective Action', 'danger'], ['Closed', 'success']])
  ]),
  entity('tooling-calibration', 'Tool', 'Tooling & Calibration', 'pi-wrench', 'Special tools and test equipment tracked against periodic calibration due dates.', [
    f('toolNo', 'Tool No.'),
    f('toolName', 'Tool Name'),
    f('toolType', 'Tool Type', 'select', { options: ['Special Tool', 'Test Equipment', 'Torque Wrench', 'Gauge'].map((v) => ({ label: v, value: v })) }),
    f('custodian', 'Custodian'),
    date('lastCalibratedDate', 'Last Calibrated'),
    date('calibrationDueDate', 'Calibration Due'),
    statusField([['Calibrated', 'success'], ['Due Soon', 'warn'], ['Overdue', 'danger'], ['Out of Service', 'secondary']])
  ]),

  // ───────────────────────── Fleet Management ─────────────────────────
  entity('fleet-availability', 'Availability Record', 'Fleet Availability', 'pi-check-circle', 'Real-time availability status for every tail in the fleet.', [
    f('aircraftReg', 'Aircraft Reg.'),
    f('baseAirport', 'Base Airport'),
    datetime('availableFrom', 'Available From'),
    statusField([['Available', 'success'], ['In Use', 'info'], ['AOG', 'danger'], ['Maintenance', 'warn']])
  ]),
  entity('aircraft-history', 'History Event', 'Aircraft History', 'pi-history', 'Lifetime event log per aircraft — delivery, transfers, incidents.', [
    f('aircraftReg', 'Aircraft Reg.'),
    date('eventDate', 'Event Date'),
    f('eventType', 'Event Type', 'select', { options: ['Delivery', 'Maintenance', 'Incident', 'Transfer'].map((v) => ({ label: v, value: v })) }),
    f('description', 'Description', 'textarea')
  ]),
  entity('aircraft-utilization', 'Utilization Record', 'Aircraft Utilization', 'pi-chart-bar', 'Flight hours and cycles achieved per aircraft per period.', [
    f('aircraftReg', 'Aircraft Reg.'),
    f('period', 'Period'),
    num('flightHours', 'Flight Hours'),
    num('flightCycles', 'Flight Cycles'),
    num('utilizationPct', 'Utilization Rate (%)', { max: 100 })
  ]),
  entity('engine-tracking', 'Engine', 'Engine Tracking', 'pi-cog', 'Engine serial numbers, position, and cycles since new.', [
    f('engineSerialNo', 'Engine Serial No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('position', 'Position', 'select', { options: ['#1', '#2', '#3', '#4'].map((v) => ({ label: v, value: v })) }),
    num('cyclesSinceNew', 'Cycles Since New'),
    statusField([['Installed', 'success'], ['Removed', 'secondary'], ['Overhaul', 'warn']])
  ]),
  entity('landing-flight-hours', 'Utilization Entry', 'Landing & Flight Hours', 'pi-stopwatch', 'Landings and flight hours logged per aircraft per period.', [
    f('aircraftReg', 'Aircraft Reg.'),
    f('period', 'Period'),
    num('landings', 'Landings'),
    num('flightHours', 'Flight Hours')
  ]),
  entity('flight-cycle-tracking', 'Cycle Record', 'Flight Cycle Tracking', 'pi-sync', 'Cumulative and monthly flight cycle counters per aircraft.', [
    f('aircraftReg', 'Aircraft Reg.'),
    num('totalCycles', 'Total Cycles'),
    num('cyclesThisMonth', 'Cycles This Month'),
    date('lastUpdated', 'Last Updated')
  ]),

  // ───────────────────────── Inventory & Spare Parts ─────────────────────────
  entity('warehouse-management', 'Warehouse', 'Warehouse Management', 'pi-warehouse', 'Warehouse locations used for parts and tooling storage.', [
    f('warehouseCode', 'Warehouse Code'),
    f('warehouseName', 'Warehouse Name'),
    f('location', 'Location'),
    num('capacitySqFt', 'Capacity (sq ft)'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('barcode-rfid', 'Tag', 'Barcode / RFID', 'pi-qrcode', 'Barcode and RFID tags bound to inventory items.', [
    f('tagId', 'Tag ID'),
    f('itemDescription', 'Item Description'),
    f('tagType', 'Tag Type', 'select', { options: ['Barcode', 'RFID'].map((v) => ({ label: v, value: v })) }),
    f('assignedLocation', 'Assigned Location'),
    statusField([['Active', 'success'], ['Inactive', 'secondary'], ['Lost', 'danger']])
  ]),
  entity('purchase-requests', 'Purchase Request', 'Purchase Requests', 'pi-file-edit', 'Internal requests to procure parts or materials.', [
    f('requestNo', 'Request No.'),
    f('requestedBy', 'Requested By'),
    f('itemDescription', 'Item Description'),
    num('quantity', 'Quantity'),
    statusField([['Pending', 'info'], ['Approved', 'success'], ['Rejected', 'danger'], ['Fulfilled', 'secondary']])
  ]),
  entity('stock-transfer', 'Stock Transfer', 'Stock Transfer', 'pi-arrow-right-arrow-left', 'Inter-warehouse stock movement records.', [
    f('transferNo', 'Transfer No.'),
    f('fromWarehouse', 'From Warehouse'),
    f('toWarehouse', 'To Warehouse'),
    num('quantity', 'Quantity'),
    date('transferDate', 'Transfer Date'),
    statusField([['Pending', 'info'], ['In Transit', 'warn'], ['Completed', 'success']])
  ]),
  entity('tool-tracking', 'Tool', 'Tool Tracking', 'pi-wrench', 'Calibrated tooling check-out and calibration due dates.', [
    f('toolId', 'Tool ID'),
    f('toolName', 'Tool Name'),
    f('assignedTo', 'Assigned To'),
    date('calibrationDueDate', 'Calibration Due Date'),
    statusField([['Available', 'success'], ['Checked Out', 'info'], ['Calibration Due', 'warn']])
  ]),
  entity('minimum-stock-alerts', 'Stock Alert', 'Minimum Stock Alerts', 'pi-bell', 'Parts that have fallen at or below their reorder point.', [
    f('partNo', 'Part No.'),
    f('description', 'Description'),
    num('quantityOnHand', 'Quantity On Hand'),
    num('minimumLevel', 'Minimum Level'),
    statusField([['OK', 'success'], ['Low', 'warn'], ['Critical', 'danger']])
  ]),
  entity('serial-number-tracking', 'Serialized Item', 'Serial Number Tracking', 'pi-tag', 'Serial-level traceability for tracked parts.', [
    f('serialNo', 'Serial No.'),
    f('itemDescription', 'Item Description'),
    f('currentLocation', 'Current Location'),
    f('installedOn', 'Installed On'),
    statusField([['In Stock', 'success'], ['Installed', 'info'], ['Scrapped', 'danger']])
  ]),

  // ───────────────────────── Warehouse Management ─────────────────────────
  // 'warehouse-management', 'purchase-requests', 'purchase-orders', 'goods-receiving', 'quality-inspection',
  // 'stock-transfer', 'barcode-rfid', 'serial-number-tracking' and 'vendor-management' are shared with other
  // modules above/below — see the comments next to those items in module-manifest.ts.
  entity('store-setup', 'Store', 'Store Setup', 'pi-shop', 'Sub-stores within a warehouse where stock physically sits.', [
    f('storeCode', 'Store Code'),
    f('storeName', 'Store Name'),
    f('warehouse', 'Warehouse'),
    f('storeType', 'Store Type', 'select', { options: ['Main', 'Sub', 'Central', 'Line'].map((v) => ({ label: v, value: v })) }),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('rack-bin-setup', 'Rack/Bin', 'Rack/Bin Setup', 'pi-th-large', 'Shelf-level rack and bin locations within a store.', [
    f('rackBinCode', 'Rack/Bin Code'),
    f('rackBinName', 'Rack/Bin Name'),
    f('warehouse', 'Warehouse'),
    f('aisle', 'Aisle'),
    f('level', 'Level'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('item-category', 'Category', 'Item Category', 'pi-tags', 'Top-level classification used to group items on Item Master.', [
    f('categoryCode', 'Category Code'),
    f('categoryName', 'Category Name'),
    f('description', 'Description', 'textarea'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('unit-setup', 'Unit', 'Unit Setup', 'pi-calculator', 'Units of measure available to Item Master (EA, BOX, KG...).', [
    f('unitCode', 'Unit Code'),
    f('unitName', 'Unit Name'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('brand-setup', 'Brand', 'Brand Setup', 'pi-bookmark', 'Product brand master, linked to a manufacturer.', [
    f('brandCode', 'Brand Code'),
    f('brandName', 'Brand Name'),
    f('manufacturer', 'Manufacturer'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('manufacturer-setup', 'Manufacturer', 'Manufacturer Setup', 'pi-industry', 'Part and equipment manufacturer master.', [
    f('manufacturerCode', 'Manufacturer Code'),
    f('manufacturerName', 'Manufacturer Name'),
    f('contactPerson', 'Contact Person'),
    f('phone', 'Phone'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('stock-entry', 'Stock Entry', 'Stock Entry', 'pi-sign-in', 'Opening and ad-hoc stock entries received into a warehouse.', [
    f('entryNo', 'Entry No.'),
    f('warehouse', 'Warehouse'),
    f('itemDescription', 'Item Description'),
    f('batchNo', 'Batch No.'),
    date('expiryDate', 'Expiry Date'),
    num('receivedQty', 'Received Qty'),
    date('entryDate', 'Entry Date'),
    statusField([['Draft', 'info'], ['Posted', 'success']])
  ]),
  entity('stock-issue', 'Stock Issue', 'Stock Issue', 'pi-sign-out', 'Stock issued from a warehouse against an internal request.', [
    f('issueNo', 'Issue No.'),
    f('warehouse', 'Warehouse'),
    f('issuedTo', 'Issued To'),
    f('itemDescription', 'Item Description'),
    f('serialNo', 'Serial No.'),
    num('issuedQty', 'Issued Qty'),
    date('issueDate', 'Issue Date'),
    statusField([['Pending', 'info'], ['Issued', 'success'], ['Cancelled', 'danger']])
  ]),
  entity('stock-return', 'Stock Return', 'Stock Return', 'pi-replay', 'Unused issued stock returned back into the warehouse.', [
    f('returnNo', 'Return No.'),
    f('warehouse', 'Warehouse'),
    f('itemDescription', 'Item Description'),
    num('returnQty', 'Return Qty'),
    date('returnDate', 'Return Date'),
    f('reason', 'Reason'),
    statusField([['Pending', 'info'], ['Received', 'success']])
  ]),
  entity('aircraft-issue', 'Aircraft Issue', 'Aircraft Issue', 'pi-send', 'Parts issued from the warehouse directly to an aircraft/work order.', [
    f('issueNo', 'Issue No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('workOrderNo', 'Work Order No.'),
    f('itemDescription', 'Item Description'),
    num('quantity', 'Quantity'),
    date('issueDate', 'Issue Date'),
    statusField([['Pending', 'info'], ['Issued', 'success'], ['Cancelled', 'danger']])
  ]),
  entity('component-installation', 'Installation', 'Component Installation', 'pi-plus-circle', 'Rotable/repairable component installations onto an aircraft.', [
    f('installNo', 'Install No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('componentName', 'Component Name'),
    f('componentSerialNo', 'Component Serial No.'),
    date('installedDate', 'Installed Date'),
    f('installedBy', 'Installed By'),
    statusField([['Installed', 'success'], ['Pending', 'info']])
  ]),
  entity('component-removal', 'Removal', 'Component Removal', 'pi-minus-circle', 'Component removals from an aircraft, pending repair or scrap.', [
    f('removalNo', 'Removal No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('componentName', 'Component Name'),
    f('componentSerialNo', 'Component Serial No.'),
    date('removalDate', 'Removal Date'),
    f('removalReason', 'Removal Reason'),
    statusField([['Removed', 'secondary'], ['Sent for Repair', 'warn'], ['Scrapped', 'danger']])
  ]),
  entity('repair-management', 'Repair Order', 'Repair Management', 'pi-hammer', 'Repairable components sent out to a vendor and tracked to return.', [
    f('repairNo', 'Repair No.'),
    f('componentName', 'Component Name'),
    f('componentSerialNo', 'Component Serial No.'),
    f('vendor', 'Repair Vendor'),
    date('sentDate', 'Sent Date'),
    date('expectedReturnDate', 'Expected Return Date'),
    statusField([['Sent', 'info'], ['In Repair', 'warn'], ['Returned', 'success']])
  ]),
  entity('scrap-management', 'Scrap Record', 'Scrap Management', 'pi-trash', 'Items condemned and scrapped out of usable inventory.', [
    f('scrapNo', 'Scrap No.'),
    f('itemDescription', 'Item Description'),
    num('quantity', 'Quantity'),
    f('scrapReason', 'Scrap Reason'),
    f('approvedBy', 'Approved By'),
    date('scrapDate', 'Scrap Date'),
    statusField([['Pending Approval', 'warn'], ['Approved', 'success']])
  ]),
  entity('inventory-count', 'Count Sheet', 'Inventory Count', 'pi-list-check', 'Physical stock counts compared against system quantity on hand.', [
    f('countNo', 'Count No.'),
    f('warehouse', 'Warehouse'),
    date('countDate', 'Count Date'),
    f('countedBy', 'Counted By'),
    num('systemQty', 'System Qty'),
    num('countedQty', 'Counted Qty'),
    statusField([['In Progress', 'info'], ['Completed', 'success'], ['Variance Found', 'warn']])
  ]),
  entity('stock-adjustment', 'Adjustment', 'Stock Adjustment', 'pi-sliders-h', 'Manual stock corrections raised from an inventory count or write-off.', [
    f('adjustmentNo', 'Adjustment No.'),
    f('warehouse', 'Warehouse'),
    f('itemDescription', 'Item Description'),
    f('adjustmentType', 'Adjustment Type', 'select', { options: ['Add', 'Subtract'].map((v) => ({ label: v, value: v })) }),
    num('quantity', 'Quantity'),
    f('reason', 'Reason'),
    statusField([['Pending Approval', 'warn'], ['Approved', 'success']])
  ]),
  entity('batch-tracking', 'Batch', 'Batch Tracking', 'pi-clone', 'Manufacture and expiry tracking per received batch/lot.', [
    f('batchNo', 'Batch No.'),
    f('itemDescription', 'Item Description'),
    date('manufactureDate', 'Manufacture Date'),
    date('expiryDate', 'Expiry Date'),
    num('quantity', 'Quantity'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('shelf-life', 'Shelf-Life Item', 'Shelf Life', 'pi-calendar-times', 'Shelf-life-limited stock nearing or past its expiry date.', [
    f('itemDescription', 'Item Description'),
    f('batchNo', 'Batch No.'),
    date('expiryDate', 'Expiry Date'),
    num('daysRemaining', 'Days Remaining'),
    statusField([['OK', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('warranty', 'Warranty', 'Warranty', 'pi-shield', 'Manufacturer/vendor warranty coverage per serialized item.', [
    f('itemDescription', 'Item Description'),
    f('serialNo', 'Serial No.'),
    date('warrantyStartDate', 'Warranty Start Date'),
    date('warrantyEndDate', 'Warranty End Date'),
    f('vendor', 'Vendor'),
    statusField([['Under Warranty', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('calibration', 'Calibration Record', 'Calibration', 'pi-gauge', 'Calibration due dates for measuring/test equipment held in the warehouse.', [
    f('equipmentName', 'Equipment Name'),
    f('equipmentId', 'Equipment ID'),
    date('lastCalibrationDate', 'Last Calibration Date'),
    date('nextCalibrationDate', 'Next Calibration Date'),
    f('calibratedBy', 'Calibrated By'),
    statusField([['Calibrated', 'success'], ['Due Soon', 'warn'], ['Overdue', 'danger']])
  ]),

  // ───────────────────────── Procurement ─────────────────────────
  entity('vendor-management', 'Vendor', 'Vendor Management', 'pi-building', 'Approved vendor and supplier master records.', [
    f('vendorCode', 'Vendor Code'),
    f('vendorName', 'Vendor Name'),
    f('category', 'Category'),
    f('contactPerson', 'Contact Person'),
    f('phone', 'Phone'),
    f('email', 'Email', 'email'),
    statusField([['Active', 'success'], ['Inactive', 'secondary'], ['Blacklisted', 'danger']])
  ]),
  entity('rfq', 'RFQ', 'RFQ (Request for Quotation)', 'pi-file-edit', 'Requests for quotation issued to vendors.', [
    f('rfqNo', 'RFQ No.'),
    f('title', 'Title'),
    f('vendor', 'Vendor'),
    date('issueDate', 'Issue Date'),
    date('responseDeadline', 'Response Deadline'),
    statusField([['Open', 'info'], ['Closed', 'secondary'], ['Awarded', 'success']])
  ]),
  entity('goods-receiving', 'Goods Receipt', 'Goods Receiving', 'pi-inbox', 'Receipt notes for goods delivered against purchase orders.', [
    f('grnNo', 'GRN No.'),
    f('poNumber', 'PO Number'),
    f('vendor', 'Vendor'),
    date('receivedDate', 'Received Date'),
    statusField([['Pending', 'info'], ['Partially Received', 'warn'], ['Completed', 'success']])
  ]),
  entity('supplier-evaluation', 'Evaluation', 'Supplier Evaluation', 'pi-star', 'Periodic vendor performance scoring.', [
    f('evaluationNo', 'Evaluation No.'),
    f('vendor', 'Vendor'),
    num('score', 'Score (0-100)', { max: 100 }),
    f('evaluatedBy', 'Evaluated By'),
    statusField([['Approved', 'success'], ['Needs Improvement', 'warn'], ['Rejected', 'danger']])
  ]),
  entity('contract-management', 'Contract', 'Contract Management', 'pi-file', 'Vendor contracts and their validity windows.', [
    f('contractNo', 'Contract No.'),
    f('vendor', 'Vendor'),
    date('startDate', 'Start Date'),
    date('endDate', 'End Date'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),

  // ───────────────────────── Crew Management ─────────────────────────
  entity('cabin-crew-management', 'Cabin Crew Member', 'Cabin Crew Management', 'pi-users', 'Cabin crew roster master data.', [
    f('employeeNo', 'Employee No.'),
    f('fullName', 'Full Name'),
    f('baseAirport', 'Base Airport'),
    f('position', 'Position', 'select', { options: ['Purser', 'Flight Attendant'].map((v) => ({ label: v, value: v })) }),
    statusField([['Active', 'success'], ['On Leave', 'warn'], ['Training', 'info']])
  ]),
  entity('duty-roster', 'Roster Entry', 'Duty Roster', 'pi-table', 'Published and draft crew duty rosters.', [
    f('rosterNo', 'Roster No.'),
    f('crewMember', 'Crew Member'),
    date('dutyDate', 'Duty Date'),
    f('dutyType', 'Duty Type', 'select', { options: ['Flight', 'Standby', 'Off', 'Training'].map((v) => ({ label: v, value: v })) }),
    statusField([['Published', 'success'], ['Draft', 'info']])
  ]),
  entity('crew-scheduling', 'Crew Schedule', 'Crew Scheduling', 'pi-calendar', 'Individual crew-to-flight scheduling assignments.', [
    f('scheduleNo', 'Schedule No.'),
    f('crewMember', 'Crew Member'),
    f('flightNo', 'Flight No.'),
    date('scheduledDate', 'Scheduled Date'),
    statusField([['Confirmed', 'success'], ['Pending', 'info'], ['Swapped', 'warn']])
  ]),
  entity('crew-leave-management', 'Leave Request', 'Leave Management', 'pi-sign-out', 'Crew leave requests and approval status.', [
    f('requestNo', 'Request No.'),
    f('crewMember', 'Crew Member'),
    f('leaveType', 'Leave Type', 'select', { options: ['Annual', 'Sick', 'Unpaid', 'Maternity'].map((v) => ({ label: v, value: v })) }),
    date('fromDate', 'From Date'),
    date('toDate', 'To Date'),
    statusField([['Pending', 'info'], ['Approved', 'success'], ['Rejected', 'danger']])
  ]),
  entity('license-tracking', 'License', 'License Tracking', 'pi-verified', 'Crew license issue and expiry tracking.', [
    f('licenseNo', 'License No.'),
    f('crewMember', 'Crew Member'),
    f('licenseType', 'License Type'),
    date('issuedDate', 'Issued Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('medical-certificate-tracking', 'Medical Certificate', 'Medical Certificate Tracking', 'pi-heart', 'Aeromedical certificate class and expiry per crew member.', [
    f('certificateNo', 'Certificate No.'),
    f('crewMember', 'Crew Member'),
    f('class', 'Class', 'select', { options: ['Class 1', 'Class 2'].map((v) => ({ label: v, value: v })) }),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('training-records', 'Training Record', 'Training Records', 'pi-graduation-cap', 'Recurrent and initial crew training completion history.', [
    f('recordNo', 'Record No.'),
    f('crewMember', 'Crew Member'),
    f('trainingCourse', 'Training Course'),
    date('completedDate', 'Completed Date'),
    statusField([['Completed', 'success'], ['Scheduled', 'info'], ['Overdue', 'danger']])
  ]),
  entity('flight-hours-monitoring', 'Flight/Duty Record', 'Flight Hours Monitoring', 'pi-stopwatch', 'FDP monitoring against regulatory flight/duty time limits.', [
    f('crewMember', 'Crew Member'),
    f('period', 'Period'),
    num('flightHours', 'Flight Hours'),
    num('dutyHours', 'Duty Hours'),
    statusField([['Within Limits', 'success'], ['Approaching Limit', 'warn'], ['Exceeded', 'danger']])
  ]),

  // ───────────────────────── Passenger Reservation ─────────────────────────
  entity('ticket-booking', 'Booking', 'Ticket Booking', 'pi-ticket', 'Passenger ticket bookings and fare class.', [
    f('pnr', 'PNR'),
    f('passengerName', 'Passenger Name'),
    f('flightNo', 'Flight No.'),
    date('bookingDate', 'Booking Date'),
    f('fareClass', 'Fare Class', 'select', { options: ['Economy', 'Premium Economy', 'Business', 'First'].map((v) => ({ label: v, value: v })) }),
    statusField([['Confirmed', 'success'], ['Waitlisted', 'warn'], ['Cancelled', 'danger']])
  ]),
  entity('seat-reservation', 'Seat Reservation', 'Seat Reservation', 'pi-th-large', 'Seat map assignments per passenger booking.', [
    f('pnr', 'PNR'),
    f('passengerName', 'Passenger Name'),
    f('flightNo', 'Flight No.'),
    f('seatNo', 'Seat No.'),
    statusField([['Assigned', 'success'], ['Unassigned', 'secondary'], ['Changed', 'info']])
  ]),
  entity('check-in', 'Check-in Record', 'Check-in', 'pi-check-square', 'Passenger check-in status per flight.', [
    f('pnr', 'PNR'),
    f('passengerName', 'Passenger Name'),
    f('flightNo', 'Flight No.'),
    datetime('checkInTime', 'Check-in Time'),
    statusField([['Checked In', 'success'], ['Not Checked In', 'secondary'], ['No Show', 'danger']])
  ]),
  entity('boarding-pass', 'Boarding Pass', 'Boarding Pass', 'pi-id-card', 'Issued boarding passes with gate and time.', [
    f('pnr', 'PNR'),
    f('passengerName', 'Passenger Name'),
    f('flightNo', 'Flight No.'),
    f('gate', 'Gate'),
    datetime('boardingTime', 'Boarding Time'),
    statusField([['Issued', 'info'], ['Boarded', 'success'], ['Void', 'danger']])
  ]),
  entity('baggage-management', 'Baggage Item', 'Baggage Management', 'pi-briefcase', 'Checked baggage tracking from check-in to delivery.', [
    f('tagNo', 'Tag No.'),
    f('passengerName', 'Passenger Name'),
    f('flightNo', 'Flight No.'),
    num('weightKg', 'Weight (kg)'),
    statusField([['Checked In', 'info'], ['Loaded', 'warn'], ['Delivered', 'success'], ['Lost', 'danger']])
  ]),
  entity('cancellation', 'Cancellation', 'Cancellation', 'pi-times-circle', 'Booking cancellation requests and refund linkage.', [
    f('pnr', 'PNR'),
    f('passengerName', 'Passenger Name'),
    f('flightNo', 'Flight No.'),
    date('cancelledDate', 'Cancelled Date'),
    f('reason', 'Reason'),
    statusField([['Requested', 'info'], ['Processed', 'success'], ['Refund Pending', 'warn']])
  ]),
  entity('refund-processing', 'Refund', 'Refund Processing', 'pi-replay', 'Refund requests raised against cancelled bookings.', [
    f('refundNo', 'Refund No.'),
    f('pnr', 'PNR'),
    f('passengerName', 'Passenger Name'),
    money('amount', 'Amount'),
    statusField([['Pending', 'info'], ['Approved', 'success'], ['Paid', 'secondary'], ['Rejected', 'danger']])
  ]),
  entity('loyalty-program', 'Loyalty Member', 'Loyalty Program', 'pi-gift', 'Frequent flyer membership tiers and points balance.', [
    f('memberNo', 'Member No.'),
    f('passengerName', 'Passenger Name'),
    f('tier', 'Tier', 'select', { options: ['Silver', 'Gold', 'Platinum'].map((v) => ({ label: v, value: v })) }),
    num('pointsBalance', 'Points Balance'),
    statusField([['Active', 'success'], ['Suspended', 'danger']])
  ]),

  // ───────────────────────── Airport Operations ─────────────────────────
  entity('gate-management', 'Gate Assignment', 'Gate Management', 'pi-sitemap', 'Terminal gate allocation per flight.', [
    f('gateNo', 'Gate No.'),
    f('terminal', 'Terminal'),
    f('flightNo', 'Flight No.'),
    datetime('assignedTime', 'Assigned Time'),
    statusField([['Available', 'success'], ['Occupied', 'info'], ['Maintenance', 'warn']])
  ]),
  entity('runway-scheduling', 'Runway Slot', 'Runway Scheduling', 'pi-directions-alt', 'Takeoff and landing runway slot allocation.', [
    f('runway', 'Runway'),
    f('flightNo', 'Flight No.'),
    f('operation', 'Operation', 'select', { options: ['Takeoff', 'Landing'].map((v) => ({ label: v, value: v })) }),
    datetime('scheduledTime', 'Scheduled Time'),
    statusField([['Scheduled', 'info'], ['Cleared', 'success'], ['Delayed', 'warn']])
  ]),
  entity('terminal-operations', 'Terminal Area', 'Terminal Operations', 'pi-building-columns', 'Terminal zone status and shift supervision.', [
    f('terminal', 'Terminal'),
    f('area', 'Area'),
    f('supervisor', 'Supervisor'),
    f('shift', 'Shift', 'select', { options: ['Morning', 'Afternoon', 'Night'].map((v) => ({ label: v, value: v })) }),
    statusField([['Normal', 'success'], ['Congested', 'warn'], ['Closed', 'danger']])
  ]),
  entity('ground-handling', 'Ground Service', 'Ground Handling', 'pi-car', 'Pushback, de-icing, catering, and cleaning services per flight.', [
    f('serviceNo', 'Service No.'),
    f('flightNo', 'Flight No.'),
    f('serviceType', 'Service Type', 'select', { options: ['Pushback', 'De-icing', 'Catering', 'Cleaning'].map((v) => ({ label: v, value: v })) }),
    f('provider', 'Provider'),
    statusField([['Scheduled', 'info'], ['In Progress', 'warn'], ['Completed', 'success']])
  ]),
  entity('aircraft-parking', 'Parking Assignment', 'Aircraft Parking', 'pi-map-marker', 'Apron stand allocation per aircraft turnaround.', [
    f('standNo', 'Stand No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    datetime('arrivalTime', 'Arrival Time'),
    datetime('departureTime', 'Departure Time'),
    statusField([['Occupied', 'info'], ['Vacant', 'success'], ['Reserved', 'warn']])
  ]),
  entity('boarding-management', 'Boarding Session', 'Boarding Management', 'pi-users', 'Gate-level boarding progress per flight.', [
    f('flightNo', 'Flight No.'),
    f('gate', 'Gate'),
    datetime('boardingStart', 'Boarding Start'),
    num('passengersBoarded', 'Passengers Boarded'),
    statusField([['Not Started', 'secondary'], ['Boarding', 'info'], ['Completed', 'success']])
  ]),

  // ───────────────────────── Resource & Gate Management ─────────────────────────
  // Ordered resource masters (the physical things allocated) → allocation and
  // planning → availability and performance. Gate Allocation and Stand Allocation
  // aren't here: they reuse Airport Operations' per-flight `gate-management` and
  // `aircraft-parking` assignment records, which point at the masters below.
  entity('stand-registry', 'Stand', 'Stand & Bay Registry', 'pi-map-marker', 'Aircraft stand master — apron, size code, and contact/remote classification.', [
    f('standNo', 'Stand No.'),
    f('apron', 'Apron'),
    f('standType', 'Stand Type', 'select', { options: ['Contact', 'Remote', 'Cargo', 'Maintenance', 'De-icing'].map((v) => ({ label: v, value: v })) }),
    f('maxAircraftCode', 'Max Aircraft Code', 'select', { options: ['Code C', 'Code D', 'Code E', 'Code F'].map((v) => ({ label: v, value: v })) }),
    num('boardingBridges', 'Boarding Bridges', { min: 0, max: 3 }),
    statusField([['Available', 'success'], ['Occupied', 'info'], ['Blocked', 'warn'], ['Out of Service', 'danger']])
  ]),
  entity('gate-registry', 'Gate', 'Gate Registry', 'pi-sitemap', 'Boarding gate master — terminal, pier, holdroom capacity, and gate class.', [
    f('gateNo', 'Gate No.'),
    f('terminal', 'Terminal'),
    f('pier', 'Pier'),
    f('gateType', 'Gate Type', 'select', { options: ['Contact', 'Bus Gate', 'Swing (Domestic/International)', 'Regional'].map((v) => ({ label: v, value: v })) }),
    num('holdroomCapacity', 'Holdroom Capacity', { min: 40, max: 450 }),
    statusField([['Available', 'success'], ['Occupied', 'info'], ['Blocked', 'warn'], ['Out of Service', 'danger']])
  ]),
  entity('boarding-bridge-management', 'Boarding Bridge', 'Boarding Bridges (PBB)', 'pi-arrow-right-arrow-left', 'Passenger boarding bridge units, their assigned stand, and serviceability.', [
    f('bridgeId', 'Bridge ID'),
    f('standNo', 'Stand No.'),
    f('bridgeModel', 'Bridge Model'),
    date('lastServiceDate', 'Last Service Date'),
    num('cyclesThisMonth', 'Cycles This Month', { min: 0, max: 400 }),
    statusField([['Serviceable', 'success'], ['Degraded', 'warn'], ['Under Maintenance', 'warn'], ['Out of Service', 'danger']])
  ]),
  entity('check-in-desk-management', 'Check-in Desk', 'Check-in Desks & Kiosks', 'pi-check-square', 'Check-in counter and self-service kiosk allocation to airlines by time block.', [
    f('deskNo', 'Desk No.'),
    f('terminal', 'Terminal'),
    f('deskType', 'Desk Type', 'select', { options: ['Standard Counter', 'Bag Drop', 'Self-Service Kiosk', 'Premium/Business', 'Oversize Baggage'].map((v) => ({ label: v, value: v })) }),
    f('allocatedAirline', 'Allocated Airline'),
    datetime('allocationStart', 'Allocation Start'),
    datetime('allocationEnd', 'Allocation End'),
    statusField([['Allocated', 'info'], ['Open', 'success'], ['Closed', 'secondary'], ['Out of Service', 'danger']])
  ]),
  entity('reclaim-belt-management', 'Reclaim Belt', 'Arrivals Reclaim Belts', 'pi-download', 'Arrivals baggage reclaim carousel allocation and first/last bag performance.', [
    f('beltNo', 'Belt No.'),
    f('terminal', 'Terminal'),
    f('flightNo', 'Flight No.'),
    f('beltType', 'Belt Type', 'select', { options: ['Domestic', 'International', 'Oversize', 'Priority'].map((v) => ({ label: v, value: v })) }),
    num('firstBagMinutes', 'First Bag (min)', { min: 5, max: 40 }),
    statusField([['Allocated', 'info'], ['Delivering', 'warn'], ['Complete', 'success'], ['Out of Service', 'danger']])
  ]),
  entity('common-use-systems', 'Workstation', 'Common-Use Systems (CUPPS)', 'pi-desktop', 'Shared CUTE/CUPPS workstations and peripherals issued to airlines at desks and gates.', [
    f('workstationId', 'Workstation ID'),
    f('location', 'Location'),
    f('platform', 'Platform', 'select', { options: ['CUPPS', 'CUTE (Legacy)', 'CUSS Kiosk', 'Local Airline Build'].map((v) => ({ label: v, value: v })) }),
    f('assignedAirline', 'Assigned Airline'),
    date('lastPatchDate', 'Last Patch Date'),
    statusField([['Online', 'success'], ['Degraded', 'warn'], ['Offline', 'danger'], ['Retired', 'secondary']])
  ]),
  entity('seasonal-slot-planning', 'Slot Series', 'Seasonal Slot Planning', 'pi-calendar', 'IATA seasonal slot series held per airline, and the gate/stand capacity reserved against them.', [
    f('slotRef', 'Slot Reference'),
    f('season', 'Season', 'select', { options: ['Summer (S25)', 'Winter (W25)', 'Summer (S26)', 'Winter (W26)'].map((v) => ({ label: v, value: v })) }),
    f('airline', 'Airline'),
    f('operation', 'Operation', 'select', { options: ['Arrival', 'Departure', 'Turnaround'].map((v) => ({ label: v, value: v })) }),
    num('weeklyFrequency', 'Weekly Frequency', { min: 1, max: 21 }),
    statusField([['Requested', 'info'], ['Allocated', 'success'], ['Waitlisted', 'warn'], ['Returned', 'secondary']])
  ]),
  entity('daily-resource-plan', 'Plan Entry', 'Daily Resource Plan', 'pi-calendar-clock', 'The published day-of-operation allocation plan covering stands, gates, desks, and belts.', [
    f('planRef', 'Plan Reference'),
    date('operationDate', 'Operation Date'),
    f('resourceType', 'Resource Type', 'select', { options: ['Stand', 'Gate', 'Check-in Desk', 'Reclaim Belt', 'Boarding Bridge', 'De-icing Pad'].map((v) => ({ label: v, value: v })) }),
    f('plannedBy', 'Planned By'),
    num('allocationsPlanned', 'Allocations Planned', { min: 20, max: 400 }),
    statusField([['Draft', 'secondary'], ['Published', 'info'], ['In Effect', 'success'], ['Superseded', 'warn']])
  ]),
  entity('resource-conflict-management', 'Conflict', 'Allocation Conflicts', 'pi-exclamation-triangle', 'Double-bookings, size-code violations, and towing gaps flagged against the allocation plan.', [
    f('conflictRef', 'Conflict Ref.'),
    f('resourceId', 'Resource'),
    f('conflictType', 'Conflict Type', 'select', { options: ['Double Booking', 'Size Code Violation', 'Insufficient Towing Gap', 'Adjacent Stand Restriction', 'Resource Out of Service'].map((v) => ({ label: v, value: v })) }),
    f('severity', 'Severity', 'select', { options: ['Critical', 'Major', 'Minor'].map((v) => ({ label: v, value: v })) }),
    datetime('detectedTime', 'Detected Time'),
    statusField([['Open', 'danger'], ['Being Resolved', 'warn'], ['Resolved', 'success'], ['Accepted Risk', 'secondary']])
  ]),
  entity('gate-change-log', 'Change Record', 'Gate & Stand Changes', 'pi-sync', 'Day-of-operation reallocations, why they happened, and how much notice passengers got.', [
    f('flightNo', 'Flight No.'),
    f('previousAllocation', 'Previous Allocation'),
    f('newAllocation', 'New Allocation'),
    f('changeReason', 'Change Reason', 'select', { options: ['Aircraft Change', 'Delay / Knock-on', 'Resource Failure', 'Towing Requirement', 'Operational Request'].map((v) => ({ label: v, value: v })) }),
    datetime('changeTime', 'Change Time'),
    num('noticeMinutes', 'Passenger Notice (min)', { min: 0, max: 180 }),
    statusField([['Applied', 'success'], ['Pending Approval', 'warn'], ['Reverted', 'secondary']])
  ]),
  entity('towing-movement-plan', 'Movement', 'Towing & Aircraft Movements', 'pi-truck', 'Planned aircraft tows between stands, remote parking, and maintenance bays.', [
    f('movementRef', 'Movement Ref.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('fromStand', 'From Stand'),
    f('toStand', 'To Stand'),
    f('movementType', 'Movement Type', 'select', { options: ['Tow to Remote', 'Tow to Contact', 'Tow to Maintenance', 'Repositioning', 'Return to Service'].map((v) => ({ label: v, value: v })) }),
    datetime('scheduledTime', 'Scheduled Time'),
    statusField([['Planned', 'info'], ['In Progress', 'warn'], ['Completed', 'success'], ['Cancelled', 'secondary']])
  ]),
  entity('deicing-pad-allocation', 'Pad Allocation', 'De-icing Pad Allocation', 'pi-cloud', 'Remote de-icing pad slots, holdover times, and throughput during winter operations.', [
    f('padNo', 'Pad No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    datetime('slotTime', 'Slot Time'),
    num('holdoverMinutes', 'Holdover Time (min)', { min: 10, max: 90 }),
    statusField([['Booked', 'info'], ['In Progress', 'warn'], ['Complete', 'success'], ['Missed Slot', 'danger']])
  ]),
  entity('remote-stand-bussing', 'Bussing Run', 'Remote Stand & Bussing', 'pi-car', 'Apron bus runs connecting remote stands to the terminal, per flight.', [
    f('runRef', 'Run Ref.'),
    f('flightNo', 'Flight No.'),
    f('standNo', 'Stand No.'),
    f('direction', 'Direction', 'select', { options: ['Terminal to Stand (Boarding)', 'Stand to Terminal (Arrival)'].map((v) => ({ label: v, value: v })) }),
    num('busesAssigned', 'Buses Assigned', { min: 1, max: 8 }),
    statusField([['Scheduled', 'info'], ['Running', 'warn'], ['Completed', 'success'], ['Delayed', 'danger']])
  ]),
  entity('resource-outage-blocking', 'Blocking', 'Outages & Blockings', 'pi-ban', 'Stands, gates, and bridges taken out of allocation for works, closures, or defects.', [
    f('blockingRef', 'Blocking Ref.'),
    f('resourceId', 'Resource'),
    f('resourceType', 'Resource Type', 'select', { options: ['Stand', 'Gate', 'Check-in Desk', 'Reclaim Belt', 'Boarding Bridge', 'De-icing Pad'].map((v) => ({ label: v, value: v })) }),
    f('reason', 'Reason', 'select', { options: ['Planned Works', 'Equipment Defect', 'Surface Damage', 'Security Closure', 'Construction Project'].map((v) => ({ label: v, value: v })) }),
    datetime('blockedFrom', 'Blocked From'),
    datetime('blockedUntil', 'Blocked Until'),
    statusField([['Scheduled', 'info'], ['Active', 'danger'], ['Lifted', 'success']])
  ]),
  entity('turnaround-monitoring', 'Turnaround', 'Turnaround Monitoring (A-CDM)', 'pi-stopwatch', 'A-CDM milestone tracking per turnaround — on-block, ready, and off-block against target.', [
    f('flightNo', 'Flight No.'),
    f('standNo', 'Stand No.'),
    datetime('onBlockTime', 'On-Block (AIBT)'),
    datetime('targetOffBlock', 'Target Off-Block (TOBT)'),
    num('turnaroundMinutes', 'Turnaround (min)', { min: 25, max: 240 }),
    statusField([['On Schedule', 'success'], ['At Risk', 'warn'], ['Delayed', 'danger'], ['Completed', 'secondary']])
  ]),
  entity('resource-utilization', 'Utilization Record', 'Resource Utilization', 'pi-chart-bar', 'Daily occupancy and turn counts per resource, used to justify capacity investment.', [
    f('resourceId', 'Resource'),
    f('resourceType', 'Resource Type', 'select', { options: ['Stand', 'Gate', 'Check-in Desk', 'Reclaim Belt', 'Boarding Bridge', 'De-icing Pad'].map((v) => ({ label: v, value: v })) }),
    date('reportDate', 'Report Date'),
    num('occupancyPct', 'Occupancy (%)', { min: 10, max: 99, suffix: '%' }),
    num('turnsHandled', 'Turns Handled', { min: 1, max: 24 }),
    statusField([['Under-utilized', 'info'], ['Optimal', 'success'], ['At Capacity', 'warn'], ['Over Capacity', 'danger']])
  ]),

  // ───────────────────────── Baggage Handling System (BHS) ─────────────────────────
  // Ordered to follow the physical bag journey (acceptance → screening → storage →
  // make-up → transfer → reclaim), then the reconciliation/messaging backbone, then
  // the machine itself (equipment/faults/maintenance), then performance & exceptions.
  entity('bag-drop-units', 'Bag Drop Unit', 'Check-in & Self Bag Drop', 'pi-sign-in', 'Staffed counters, CUSS kiosks, and one-step/two-step self bag drop units at the acceptance front end.', [
    f('unitId', 'Unit ID'),
    f('terminal', 'Terminal'),
    f('unitType', 'Unit Type', 'select', { options: ['Staffed Counter', 'One-Step Self Bag Drop', 'Two-Step Self Bag Drop', 'CUSS Kiosk', 'Oversize Counter'].map((v) => ({ label: v, value: v })) }),
    f('airline', 'Airline'),
    num('bagsAcceptedToday', 'Bags Accepted Today', { min: 0, max: 1200 }),
    statusField([['Operational', 'success'], ['Degraded', 'warn'], ['Offline', 'danger'], ['Maintenance', 'secondary']])
  ]),
  entity('baggage-screening', 'Screening Record', 'Hold Baggage Screening (HBS)', 'pi-shield', 'Multi-level hold baggage screening. Under ECAC Standard 3, CT-based Level 1 absorbs the old Levels 1–3; alarms escalate to image evaluation and trace search.', [
    f('screeningNo', 'Screening No.'),
    f('tagNo', 'Bag Tag No.'),
    f('flightNo', 'Flight No.'),
    f('screeningLevel', 'Screening Level', 'select', { options: ['Level 1 — Automated CT', 'Level 2 — On-Screen Resolution', 'Level 3 — Manual Review', 'Level 4 — 3D Image Evaluation', 'Level 5 — Trace / ETD Search'].map((v) => ({ label: v, value: v })) }),
    f('machineId', 'Machine ID'),
    datetime('screenedAt', 'Screened At'),
    statusField([['Clear', 'success'], ['Alarm', 'danger'], ['Resolved', 'warn'], ['Escalated', 'secondary']], 'result', 'Result')
  ]),
  entity('hbs-machine-certification', 'HBS Machine', 'HBS Machine Certification', 'pi-verified', 'EDS/CT screening machine fleet with ECAC standard approval and certification expiry — Standard 3 compliance is a live regulatory deadline.', [
    f('machineId', 'Machine ID'),
    f('manufacturer', 'Manufacturer', 'select', { options: ['Smiths Detection', 'Rapiscan Systems', 'Leidos', 'Analogic', 'Nuctech'].map((v) => ({ label: v, value: v })) }),
    f('model', 'Model'),
    f('ecacStandard', 'ECAC Standard', 'select', { options: ['Standard 2', 'Standard 3', 'Standard 3.1'].map((v) => ({ label: v, value: v })) }),
    num('falseAlarmRatePct', 'False Alarm Rate', { min: 0, max: 40, suffix: '%' }),
    date('certificationExpiry', 'Certification Expiry'),
    statusField([['Certified', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger'], ['Decommissioned', 'secondary']])
  ]),
  entity('out-of-gauge-baggage', 'OOG Item', 'Out-of-Gauge (OOG) Baggage', 'pi-expand', 'Oversize and odd-size items that cannot travel the standard conveyor path and need a dedicated screening and make-up route.', [
    f('oogNo', 'OOG No.'),
    f('tagNo', 'Bag Tag No.'),
    f('flightNo', 'Flight No.'),
    f('itemType', 'Item Type', 'select', { options: ['Sports Equipment', 'Musical Instrument', 'Wheelchair / Mobility Aid', 'Pet Container', 'Break-Bulk Freight', 'Other Odd-Size'].map((v) => ({ label: v, value: v })) }),
    num('weightKg', 'Weight (kg)', { min: 5, max: 200 }),
    f('screeningPath', 'Screening Path', 'select', { options: ['Dedicated OOG CT', 'Manual Search', 'ETD Swab'].map((v) => ({ label: v, value: v })) }),
    statusField([['Accepted', 'info'], ['Screened', 'warn'], ['At Make-up', 'secondary'], ['Loaded', 'success'], ['Rejected', 'danger']])
  ]),
  entity('early-bag-storage', 'Stored Bag', 'Early Bag Storage (EBS)', 'pi-inbox', 'Buffer store for bags checked in before their flight make-up position opens; released back into sortation on schedule.', [
    f('ebsNo', 'EBS No.'),
    f('tagNo', 'Bag Tag No.'),
    f('flightNo', 'Flight No.'),
    f('storageType', 'Storage Type', 'select', { options: ['Conveyor Lane', 'Lane-Based Store', 'ASRS Rack'].map((v) => ({ label: v, value: v })) }),
    f('rackPosition', 'Rack / Lane Position'),
    datetime('storedAt', 'Stored At'),
    datetime('plannedReleaseAt', 'Planned Release'),
    statusField([['Stored', 'info'], ['Released', 'success'], ['Overdue', 'danger'], ['Manually Retrieved', 'warn']])
  ]),
  entity('baggage-makeup', 'Make-up Record', 'Make-up & ULD Build', 'pi-box', 'Flight make-up positions where sorted bags are built into ULDs or carts for dispatch to the aircraft.', [
    f('makeupNo', 'Make-up No.'),
    f('flightNo', 'Flight No.'),
    f('makeupPosition', 'Make-up Position'),
    f('uldNo', 'ULD / Cart No.'),
    num('bagsLoaded', 'Bags Loaded', { min: 0, max: 300 }),
    f('handler', 'Handler'),
    statusField([['Open', 'info'], ['Building', 'warn'], ['Closed', 'secondary'], ['Dispatched', 'success']])
  ]),
  entity('transfer-baggage', 'Transfer Bag', 'Transfer & Hot Bags', 'pi-sync', 'Connecting bags between inbound and outbound flights. Transfers drive the largest single share of mishandling, so short connections are flagged as hot bags for expedited handling.', [
    f('transferNo', 'Transfer No.'),
    f('tagNo', 'Bag Tag No.'),
    f('inboundFlight', 'Inbound Flight'),
    f('outboundFlight', 'Outbound Flight'),
    num('connectionMinutes', 'Connection Time (min)', { min: 20, max: 240 }),
    f('infeedPoint', 'Transfer Infeed Point'),
    statusField([['On Track', 'success'], ['Short Connection', 'warn'], ['Hot Bag — Expedite', 'danger'], ['Missed Connection', 'danger'], ['Rerouted', 'secondary']])
  ]),
  entity('baggage-reclaim', 'Reclaim Allocation', 'Arrivals Reclaim', 'pi-download', 'Arrivals carousel allocation and delivery performance, measured on first-bag and last-bag times against the service target.', [
    f('reclaimNo', 'Reclaim No.'),
    f('flightNo', 'Flight No.'),
    f('carouselNo', 'Carousel No.'),
    num('firstBagMinutes', 'First Bag (min)', { min: 5, max: 45 }),
    num('lastBagMinutes', 'Last Bag (min)', { min: 10, max: 70 }),
    num('bagsDelivered', 'Bags Delivered', { min: 0, max: 400 }),
    statusField([['Allocated', 'info'], ['Delivering', 'warn'], ['Completed', 'success'], ['SLA Breach', 'danger']])
  ]),
  entity('baggage-reconciliation', 'BRS Record', 'Baggage Reconciliation', 'pi-verified', 'Matches every checked bag to its load authority before departure, per IATA Resolution 753.', [
    f('reconciliationNo', 'Reconciliation No.'),
    f('flightNo', 'Flight No.'),
    f('tagNo', 'Bag Tag No.'),
    f('loadAuthorizedBy', 'Load Authorized By'),
    datetime('reconciledAt', 'Reconciled At'),
    statusField([['Pending', 'info'], ['Matched', 'success'], ['Discrepancy', 'danger'], ['Cleared', 'secondary']])
  ]),
  entity('baggage-messaging', 'Type B Message', 'IATA Type B Messaging', 'pi-envelope', 'The IATA RP 1745 message backbone behind reconciliation and sortation — BSM creates the bag record, BPM reports each processing event, BTM hands transfers between carriers.', [
    f('messageNo', 'Message No.'),
    f('messageType', 'Message Type', 'select', { options: ['BSM — Baggage Source', 'BPM — Baggage Processed', 'BTM — Baggage Transfer', 'BUM — Baggage Unload', 'BNS — Baggage Not Seen', 'BMM — Baggage Manifest'].map((v) => ({ label: v, value: v })) }),
    f('tagNo', 'Bag Tag No.'),
    f('flightNo', 'Flight No.'),
    f('sender', 'Sender Address'),
    datetime('receivedAt', 'Received At'),
    statusField([['Processed', 'success'], ['Pending', 'info'], ['Unmatched', 'warn'], ['Failed', 'danger']])
  ]),
  entity('bhs-equipment', 'BHS Equipment', 'BHS Equipment Registry', 'pi-cog', 'The physical system: conveyors, sorters, tag readers, screening machines, and carousels that move bags through the airport.', [
    f('equipmentId', 'Equipment ID'),
    f('equipmentType', 'Equipment Type', 'select', { options: ['Conveyor', 'Cross-Belt Sorter', 'Tilt-Tray Sorter', 'ATR Array', 'EDS / CT Machine', 'Make-up Carousel', 'Reclaim Carousel', 'Chute', 'DCV / Tote', 'Vertical Lift'].map((v) => ({ label: v, value: v })) }),
    f('zone', 'Zone'),
    f('manufacturer', 'Manufacturer', 'select', { options: ['Vanderlande', 'BEUMER Group', 'Alstef Group', 'Daifuku', 'Siemens Logistics', 'Fives'].map((v) => ({ label: v, value: v })) }),
    num('throughputBagsPerHour', 'Throughput (bags/hr)', { min: 200, max: 6000 }),
    date('installedDate', 'Installed Date'),
    statusField([['Operational', 'success'], ['Degraded', 'warn'], ['Under Maintenance', 'info'], ['Out of Service', 'danger']])
  ]),
  entity('bhs-sortation-performance', 'Sortation Record', 'Sortation & Read Rate', 'pi-percentage', 'Automatic tag reader success rate and sortation accuracy per zone. Dirty photocells and no-reads are the leading causes of missorted bags.', [
    f('recordNo', 'Record No.'),
    f('zone', 'Zone'),
    num('atrReadRatePct', 'ATR Read Rate', { min: 70, max: 100, suffix: '%' }),
    num('noReadCount', 'No-Read Count', { min: 0, max: 500 }),
    num('missortCount', 'Missort Count', { min: 0, max: 120 }),
    num('manualEncodingCount', 'Manual Encoding', { min: 0, max: 400 }),
    date('recordedDate', 'Recorded Date'),
    statusField([['Above Target', 'success'], ['At Target', 'info'], ['Below Target', 'warn'], ['Critical', 'danger']])
  ]),
  entity('bhs-fault-log', 'Fault Record', 'Fault, Jam & SCADA Alarms', 'pi-exclamation-triangle', 'Mechanical faults and control-system alarms. A single jammed sensor can stall an entire pier within minutes, so downtime is tracked per event.', [
    f('faultNo', 'Fault No.'),
    f('equipmentId', 'Equipment ID'),
    f('faultType', 'Fault Type', 'select', { options: ['Bag Jam', 'Photocell Fault', 'VFD Fault Code', 'Motor Overheat', 'Belt Tracking / Slip', 'Emergency Stop', 'Comms Loss', 'Sorter Misfire'].map((v) => ({ label: v, value: v })) }),
    f('severity', 'Severity', 'select', { badge: true, options: [['Critical', 'danger'], ['Major', 'warn'], ['Minor', 'info'], ['Warning', 'secondary']].map(([v, s]) => ({ label: v, value: v, severity: s as TagSeverity })) }),
    datetime('detectedAt', 'Detected At'),
    num('downtimeMinutes', 'Downtime (min)', { min: 0, max: 480 }),
    statusField([['Open', 'danger'], ['Under Repair', 'warn'], ['Cleared', 'success']])
  ]),
  entity('bhs-maintenance', 'PM Task', 'BHS Preventive Maintenance', 'pi-wrench', 'Preventive maintenance scheduled on usage rather than the calendar — belt metres, cycle counts, and bag throughput alongside operating hours.', [
    f('taskNo', 'Task No.'),
    f('equipmentId', 'Equipment ID'),
    f('intervalBasis', 'Interval Basis', 'select', { options: ['Calendar Days', 'Operating Hours', 'Belt Metres', 'Cycle Count', 'Bag Throughput'].map((v) => ({ label: v, value: v })) }),
    num('intervalValue', 'Interval Value', { min: 30, max: 100000 }),
    date('lastPerformed', 'Last Performed'),
    date('nextDue', 'Next Due'),
    f('technician', 'Technician'),
    statusField([['Scheduled', 'info'], ['Due', 'warn'], ['Overdue', 'danger'], ['Completed', 'success']])
  ]),
  entity('baggage-sla-performance', 'Performance Period', 'SLA & Performance', 'pi-chart-line', 'Baggage performance against service targets and industry benchmarks — the global mishandling rate runs around 6.3 bags per 1,000 passengers.', [
    f('periodLabel', 'Period'),
    f('terminal', 'Terminal'),
    num('mishandledPerThousandPax', 'Mishandled / 1,000 Pax', { min: 0, max: 25 }),
    num('systemAvailabilityPct', 'System Availability', { min: 80, max: 100, suffix: '%' }),
    num('throughputBagsPerHour', 'Peak Throughput (bags/hr)', { min: 1000, max: 12000 }),
    num('firstBagAvgMinutes', 'Avg. First Bag (min)', { min: 5, max: 40 }),
    statusField([['Meeting SLA', 'success'], ['At Risk', 'warn'], ['Breached', 'danger']])
  ]),
  entity('mishandled-baggage', 'Baggage Case', 'Mishandled Baggage / Lost & Found', 'pi-search', 'WorldTracer-style tracing file for delayed, damaged, pilfered, or lost baggage. Delayed bags account for roughly three quarters of all mishandling.', [
    f('caseNo', 'Case No.'),
    f('passengerName', 'Passenger Name'),
    f('flightNo', 'Flight No.'),
    f('tagNo', 'Bag Tag No.'),
    f('category', 'Category', 'select', { badge: true, options: [['Delayed', 'warn'], ['Damaged', 'danger'], ['Pilfered', 'danger'], ['Lost', 'contrast']].map(([v, s]) => ({ label: v, value: v, severity: s as TagSeverity })) }),
    f('rootCause', 'Root Cause', 'select', { options: ['Transfer Mishandling', 'Failure to Load', 'Ticketing / Tag Error', 'Loading Error', 'Arrival Mishandling', 'Security Hold', 'Space-Weight Restriction'].map((v) => ({ label: v, value: v })) }),
    date('reportedDate', 'Reported Date'),
    f('aholLocation', 'AHL / Current Location'),
    statusField([['Open', 'danger'], ['Tracing', 'warn'], ['Located', 'info'], ['Delivered', 'success'], ['Closed', 'secondary']])
  ]),
  entity('baggage-claims', 'Claim', 'Claims & Compensation', 'pi-dollar', 'Passenger compensation for delayed, damaged, and lost baggage. Airline liability is capped by the Montreal Convention, and mishandling costs the industry billions each year.', [
    f('claimNo', 'Claim No.'),
    f('caseNo', 'Related Case No.'),
    f('passengerName', 'Passenger Name'),
    f('claimType', 'Claim Type', 'select', { options: ['Delayed Bag Expenses', 'Damaged Bag', 'Lost Bag', 'Pilfered Contents'].map((v) => ({ label: v, value: v })) }),
    f('liabilityBasis', 'Liability Basis', 'select', { options: ['Montreal Convention', 'Warsaw Convention', 'Domestic Tariff', 'Goodwill Payment'].map((v) => ({ label: v, value: v })) }),
    money('claimedAmount', 'Claimed Amount', { max: 3000 }),
    money('settledAmount', 'Settled Amount', { max: 3000 }),
    statusField([['Submitted', 'info'], ['Under Review', 'warn'], ['Approved', 'success'], ['Settled', 'secondary'], ['Rejected', 'danger']])
  ]),

  // ───────────────────────── Landside Operations ─────────────────────────
  entity('curbside-management', 'Curb Zone Log', 'Curbside Management', 'pi-map', 'Curb zone occupancy and dwell-time monitoring at terminal frontage.', [
    f('zoneCode', 'Curb Zone Code'),
    f('terminal', 'Terminal'),
    f('vehicleType', 'Vehicle Type', 'select', { options: ['Private Car', 'Taxi', 'Rideshare', 'Shuttle Bus', 'Limousine', 'Commercial Van'].map((v) => ({ label: v, value: v })) }),
    num('dwellTimeMinutes', 'Dwell Time (min)', { min: 1, max: 60 }),
    f('licensePlate', 'License Plate'),
    statusField([['Within Limit', 'success'], ['Dwell Exceeded', 'warn'], ['Citation Issued', 'danger'], ['Cleared', 'secondary']])
  ]),
  entity('commercial-vehicle-permits', 'Permit', 'Commercial Vehicle Permits', 'pi-id-card', 'Permits for taxis, rideshare, limousines, and commercial operators serving the terminal.', [
    f('permitNo', 'Permit No.'),
    f('operatorCompany', 'Operator Company'),
    f('vehicleType', 'Vehicle Type', 'select', { options: ['Taxi', 'Rideshare', 'Limousine', 'Hotel Shuttle', 'Charter Bus', 'Delivery Van'].map((v) => ({ label: v, value: v })) }),
    f('licensePlate', 'License Plate'),
    date('issuedDate', 'Issued Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Suspended', 'danger'], ['Revoked', 'danger']])
  ]),
  entity('ground-transportation-dispatch', 'Dispatch Run', 'Ground Transportation Dispatch', 'pi-directions-alt', 'Shuttle bus, hotel connector, and rental-car bus scheduling along landside routes.', [
    f('routeCode', 'Route Code'),
    f('vehicleId', 'Vehicle ID'),
    f('driver', 'Driver'),
    f('serviceType', 'Service Type', 'select', { options: ['Terminal Shuttle', 'Hotel Connector', 'Rental Car Shuttle', 'Employee Shuttle', 'Remote Parking Shuttle'].map((v) => ({ label: v, value: v })) }),
    datetime('departureTime', 'Departure Time'),
    statusField([['Scheduled', 'info'], ['En Route', 'warn'], ['Completed', 'success'], ['Delayed', 'danger']])
  ]),
  entity('public-parking-management', 'Parking Facility', 'Public Parking Management', 'pi-car', 'Passenger parking garage and lot occupancy, rates, and facility status.', [
    f('facilityCode', 'Facility Code'),
    f('facilityName', 'Facility Name'),
    f('parkingType', 'Parking Type', 'select', { options: ['Short-Term', 'Long-Term', 'Economy', 'Valet', 'Premium'].map((v) => ({ label: v, value: v })) }),
    num('totalSpaces', 'Total Spaces', { min: 300, max: 3000 }),
    num('occupiedSpaces', 'Occupied Spaces', { min: 50, max: 2800 }),
    money('hourlyRate', 'Hourly Rate', { max: 40 }),
    statusField([['Open', 'success'], ['Near Full', 'warn'], ['Full', 'danger'], ['Closed', 'secondary']])
  ]),
  entity('taxi-rideshare-queue', 'Queue Entry', 'Taxi & Rideshare Queue', 'pi-users', 'Taxi holding-bay and rideshare staging-lot queue order and wait times.', [
    f('queueNo', 'Queue No.'),
    f('vehicleType', 'Vehicle Type', 'select', { options: ['Taxi', 'Rideshare', 'Limousine'].map((v) => ({ label: v, value: v })) }),
    f('licensePlate', 'License Plate'),
    f('driver', 'Driver'),
    num('waitTimeMinutes', 'Wait Time (min)', { min: 1, max: 30 }),
    statusField([['Waiting', 'info'], ['Called Forward', 'warn'], ['Dispatched', 'success'], ['No Show', 'danger']])
  ]),
  entity('rental-car-facility', 'Rental Counter', 'Rental Car Facility', 'pi-building', 'Rental car operator counters, ready/return lots, and shuttle coordination.', [
    f('counterCode', 'Counter Code'),
    f('rentalCompany', 'Rental Company'),
    num('readyLotSpaces', 'Ready Lot Spaces', { min: 10, max: 400 }),
    num('returnLotSpaces', 'Return Lot Spaces', { min: 10, max: 400 }),
    f('shuttleRoute', 'Shuttle Route'),
    statusField([['Operating', 'success'], ['Limited Service', 'warn'], ['Closed', 'secondary']])
  ]),
  entity('road-traffic-circulation', 'Traffic Advisory', 'Road & Traffic Circulation', 'pi-directions', 'Roadway circulation status, congestion advisories, and closures on airport access roads.', [
    f('roadSegment', 'Road Segment'),
    f('advisoryType', 'Advisory Type', 'select', { options: ['Congestion', 'Lane Closure', 'Accident', 'Construction', 'Special Event'].map((v) => ({ label: v, value: v })) }),
    datetime('reportedTime', 'Reported Time'),
    f('reportedBy', 'Reported By'),
    statusField([['Active', 'danger'], ['Monitoring', 'warn'], ['Cleared', 'success']])
  ]),
  entity('vehicle-checkpoint-screening', 'Checkpoint Record', 'Vehicle Checkpoint Screening', 'pi-shield', 'Vehicle inspections at landside security checkpoints prior to terminal frontage access.', [
    f('checkpointId', 'Checkpoint'),
    f('licensePlate', 'License Plate'),
    f('driverName', 'Driver Name'),
    datetime('screeningTime', 'Screening Time'),
    f('screenedBy', 'Screened By'),
    statusField([['Cleared', 'success'], ['Secondary Inspection', 'warn'], ['Denied Entry', 'danger']])
  ]),
  entity('terminal-curb-access-control', 'Access Credential', 'Terminal Curb Access Control', 'pi-key', 'AVI/RFID credentials and gate access for vehicles authorized onto terminal curb roadways.', [
    f('credentialNo', 'Credential No.'),
    f('operatorCompany', 'Operator Company'),
    f('licensePlate', 'License Plate'),
    f('accessZone', 'Access Zone', 'select', { options: ['Departures Curb', 'Arrivals Curb', 'Service Road', 'Cargo Ramp Road'].map((v) => ({ label: v, value: v })) }),
    date('expiryDate', 'Expiry Date'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Deactivated', 'danger']])
  ]),
  entity('landside-revenue', 'Revenue Entry', 'Parking & Curb Revenue', 'pi-dollar', 'Daily revenue collected from parking facilities, curb access fees, and ground transportation concessions.', [
    f('revenueSource', 'Revenue Source', 'select', { options: ['Parking Facility', 'Curb Access Fee', 'Taxi/Rideshare Trip Fee', 'Rental Car Concession', 'Valet Service'].map((v) => ({ label: v, value: v })) }),
    date('transactionDate', 'Transaction Date'),
    money('amount', 'Amount', { max: 5000 }),
    f('collectionMethod', 'Collection Method', 'select', { options: ['Cash', 'Credit Card', 'Mobile Payment', 'Invoice/Account'].map((v) => ({ label: v, value: v })) }),
    statusField([['Recorded', 'info'], ['Reconciled', 'success'], ['Disputed', 'danger']])
  ]),

  // ───────────────────────── Cargo Management ─────────────────────────
  entity('cargo-booking', 'Cargo Booking', 'Cargo Booking', 'pi-inbox', 'Freight space bookings per flight.', [
    f('bookingNo', 'Booking No.'),
    f('shipper', 'Shipper'),
    f('consignee', 'Consignee'),
    f('flightNo', 'Flight No.'),
    num('weightKg', 'Weight (kg)'),
    statusField([['Booked', 'info'], ['Confirmed', 'success'], ['Cancelled', 'danger']])
  ]),
  entity('shipment-tracking', 'Shipment', 'Shipment Tracking', 'pi-map-marker', 'End-to-end cargo shipment tracking by AWB.', [
    f('awbNo', 'AWB No.'),
    f('origin', 'Origin'),
    f('destination', 'Destination'),
    f('currentLocation', 'Current Location'),
    statusField([['In Transit', 'info'], ['Arrived', 'warn'], ['Delivered', 'success'], ['Delayed', 'danger']])
  ]),
  entity('warehouse-cargo', 'Stored Cargo', 'Warehouse Cargo', 'pi-warehouse', 'Cargo held in warehouse pending release.', [
    f('locationCode', 'Location Code'),
    f('cargoDescription', 'Cargo Description'),
    num('weightKg', 'Weight (kg)'),
    date('receivedDate', 'Received Date'),
    statusField([['Stored', 'info'], ['Released', 'success']])
  ]),
  entity('dangerous-goods-management', 'DG Declaration', 'Dangerous Goods Management', 'pi-exclamation-triangle', 'Hazardous cargo classification and approval.', [
    f('dgNo', 'DG No.'),
    f('description', 'Description'),
    f('unNumber', 'UN Number'),
    f('hazardClass', 'Hazard Class'),
    statusField([['Approved', 'success'], ['Pending Review', 'warn'], ['Rejected', 'danger']])
  ]),
  entity('customs-documentation', 'Customs Document', 'Customs Documentation', 'pi-file', 'Import/export documentation per shipment.', [
    f('documentNo', 'Document No.'),
    f('shipmentNo', 'Shipment No.'),
    f('documentType', 'Document Type', 'select', { options: ['Invoice', 'Permit', 'Certificate'].map((v) => ({ label: v, value: v })) }),
    date('issuedDate', 'Issued Date'),
    statusField([['Pending', 'info'], ['Cleared', 'success'], ['Rejected', 'danger']])
  ]),
  entity('air-waybill', 'Air Waybill', 'Air Waybill (AWB)', 'pi-file-edit', 'Air waybill issuance and delivery status.', [
    f('awbNo', 'AWB No.'),
    f('shipper', 'Shipper'),
    f('consignee', 'Consignee'),
    f('flightNo', 'Flight No.'),
    num('weightKg', 'Weight (kg)'),
    statusField([['Issued', 'info'], ['In Transit', 'warn'], ['Delivered', 'success']])
  ]),

  // ───────────────────────── Facilities & Assets ─────────────────────────
  // 'vendor-management' and 'incident-reporting' are shared with Procurement and Compliance & Safety
  // respectively — see the comments next to those items in module-manifest.ts.
  entity('facility-setup', 'Facility', 'Facility Setup', 'pi-building', 'Sites, hangars, terminals, and admin buildings owned or leased by the airline.', [
    f('facilityCode', 'Facility Code'),
    f('facilityName', 'Facility Name'),
    f('facilityType', 'Facility Type', 'select', { options: ['Terminal', 'Hangar', 'Warehouse', 'Admin Building', 'Maintenance Base', 'Fuel Farm', 'Cargo Facility'].map((v) => ({ label: v, value: v })) }),
    f('location', 'Location (Airport Code)'),
    num('totalAreaSqFt', 'Total Area (sq ft)'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('building-zone-setup', 'Zone', 'Building/Zone Setup', 'pi-sitemap', 'Floor- and zone-level subdivisions within a facility.', [
    f('zoneCode', 'Zone Code'),
    f('zoneName', 'Zone Name'),
    f('facility', 'Facility'),
    f('floor', 'Floor'),
    f('zoneType', 'Zone Type', 'select', { options: ['Office', 'Storage', 'Technical', 'Public', 'Restricted'].map((v) => ({ label: v, value: v })) }),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('asset-category-setup', 'Category', 'Asset Category Setup', 'pi-tags', 'Top-level classification used to group items on Asset Master.', [
    f('categoryCode', 'Category Code'),
    f('categoryName', 'Category Name'),
    f('description', 'Description', 'textarea'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('gse-fleet-registry', 'GSE Unit', 'GSE Fleet Registry', 'pi-truck', 'Ground support equipment fleet — tugs, loaders, GPUs, de-icing and fuel trucks.', [
    f('gseId', 'GSE ID'),
    f('gseType', 'GSE Type', 'select', { options: ['Pushback Tractor', 'Belt Loader', 'Baggage Tractor', 'GPU', 'ASU', 'De-icing Truck', 'Fuel Truck', 'Lavatory Truck', 'Potable Water Truck', 'Catering Truck', 'Cargo Loader', 'Boarding Stairs', 'PCA Unit'].map((v) => ({ label: v, value: v })) }),
    f('manufacturer', 'Manufacturer'),
    f('powerSource', 'Power Source', 'select', { options: ['Diesel', 'Electric', 'Hybrid', 'Gasoline'].map((v) => ({ label: v, value: v })) }),
    f('assignedRamp', 'Assigned Ramp/Stand'),
    date('lastServiceDate', 'Last Service Date'),
    statusField([['In Service', 'success'], ['Under Repair', 'warn'], ['Out of Service', 'danger']])
  ]),
  entity('facility-work-orders', 'Work Order', 'Facility Work Orders', 'pi-clipboard', 'Repair and service requests raised against a facility or asset.', [
    f('workOrderNo', 'Work Order No.'),
    f('facility', 'Facility'),
    f('itemDescription', 'Asset/Issue'),
    f('priority', 'Priority', 'select', { options: ['Low', 'Medium', 'High', 'Critical'].map((v) => ({ label: v, value: v })) }),
    f('requestedBy', 'Requested By'),
    date('dueDate', 'Due Date'),
    statusField([['Open', 'danger'], ['In Progress', 'warn'], ['Completed', 'success']])
  ]),
  entity('facility-preventive-maintenance', 'PM Task', 'Preventive Maintenance', 'pi-shield', 'Scheduled maintenance performed on facility assets at a fixed interval.', [
    f('pmNo', 'PM No.'),
    f('itemDescription', 'Asset'),
    f('frequency', 'Frequency'),
    date('nextDueDate', 'Next Due Date'),
    f('assignedTechnician', 'Assigned Technician'),
    statusField([['Scheduled', 'info'], ['Due', 'warn'], ['Completed', 'success']])
  ]),
  entity('facility-corrective-maintenance', 'Fault', 'Corrective Maintenance', 'pi-hammer', 'Unscheduled repairs raised against reported facility/asset faults.', [
    f('faultNo', 'Fault No.'),
    f('itemDescription', 'Asset'),
    f('faultDescription', 'Fault Description'),
    f('reportedBy', 'Reported By'),
    statusField([['Open', 'danger'], ['In Progress', 'warn'], ['Rectified', 'success']])
  ]),
  entity('asset-inspection', 'Inspection', 'Asset Inspection', 'pi-eye', 'Periodic condition inspections performed on facility assets.', [
    f('inspectionNo', 'Inspection No.'),
    f('itemDescription', 'Asset'),
    f('inspector', 'Inspector'),
    date('inspectionDate', 'Inspection Date'),
    f('result', 'Result', 'select', { options: ['Pass', 'Fail', 'Conditional'].map((v) => ({ label: v, value: v })) }),
    statusField([['Open', 'info'], ['Closed', 'success']])
  ]),
  entity('meter-reading', 'Reading', 'Meter Reading', 'pi-gauge', 'Usage readings — hours, odometer, or cycles — logged per asset.', [
    f('itemDescription', 'Asset'),
    f('readingType', 'Reading Type', 'select', { options: ['Hours', 'Odometer', 'Cycles'].map((v) => ({ label: v, value: v })) }),
    num('readingValue', 'Reading Value'),
    date('readingDate', 'Reading Date'),
    f('recordedBy', 'Recorded By')
  ]),
  entity('space-utilization', 'Space Record', 'Space Utilization', 'pi-th-large', 'Occupancy versus capacity per zone, used to plan portfolio consolidation.', [
    f('spaceCode', 'Space Code'),
    f('zone', 'Zone'),
    num('capacity', 'Capacity'),
    num('currentOccupancy', 'Current Occupancy'),
    num('utilizationPct', 'Utilization (%)', { max: 100 }),
    statusField([['Under-utilized', 'warn'], ['Optimal', 'success'], ['Over Capacity', 'danger']])
  ]),
  entity('lease-contract-management', 'Lease', 'Lease & Contract Management', 'pi-file', 'Facility lease agreements and their validity windows.', [
    f('leaseNo', 'Lease No.'),
    f('facility', 'Facility'),
    f('lessor', 'Lessor'),
    date('startDate', 'Start Date'),
    date('endDate', 'End Date'),
    money('monthlyRent', 'Monthly Rent'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('utility-energy-management', 'Utility Bill', 'Utility & Energy Management', 'pi-bolt', 'Electricity, water, and gas consumption and cost per facility.', [
    f('facility', 'Facility'),
    f('utilityType', 'Utility Type', 'select', { options: ['Electricity', 'Water', 'Gas', 'Sewage'].map((v) => ({ label: v, value: v })) }),
    f('billingPeriod', 'Billing Period'),
    num('consumption', 'Consumption'),
    money('cost', 'Cost'),
    statusField([['Pending', 'info'], ['Paid', 'success'], ['Overdue', 'danger']])
  ]),
  entity('hvac-building-systems', 'System', 'HVAC & Building Systems', 'pi-cloud', 'Air handling units, chillers, and boilers serving a facility.', [
    f('systemId', 'System ID'),
    f('facility', 'Facility'),
    f('systemType', 'System Type', 'select', { options: ['AHU', 'Chiller', 'Boiler', 'Split Unit'].map((v) => ({ label: v, value: v })) }),
    date('lastServiceDate', 'Last Service Date'),
    date('nextServiceDate', 'Next Service Date'),
    statusField([['Operational', 'success'], ['Needs Service', 'warn'], ['Down', 'danger']])
  ]),
  entity('fire-safety-systems', 'System', 'Fire & Safety Systems', 'pi-exclamation-triangle', 'Sprinklers, alarms, extinguishers, and suppression systems per facility.', [
    f('systemId', 'System ID'),
    f('facility', 'Facility'),
    f('systemType', 'System Type', 'select', { options: ['Sprinkler', 'Fire Alarm', 'Extinguisher', 'Suppression'].map((v) => ({ label: v, value: v })) }),
    date('lastInspectionDate', 'Last Inspection Date'),
    date('nextInspectionDate', 'Next Inspection Date'),
    statusField([['Compliant', 'success'], ['Due Soon', 'warn'], ['Non-Compliant', 'danger']])
  ]),
  entity('physical-security-systems', 'System', 'Physical Security Systems', 'pi-video', 'CCTV, access control hardware, and perimeter security per facility.', [
    f('systemId', 'System ID'),
    f('facility', 'Facility'),
    f('systemType', 'System Type', 'select', { options: ['CCTV', 'Access Control', 'Intrusion Alarm', 'Perimeter Fence'].map((v) => ({ label: v, value: v })) }),
    date('lastCheckedDate', 'Last Checked Date'),
    statusField([['Operational', 'success'], ['Needs Attention', 'warn'], ['Down', 'danger']])
  ]),
  entity('cleaning-janitorial', 'Task', 'Cleaning & Janitorial', 'pi-sparkles', 'Scheduled cleaning tasks per facility and zone.', [
    f('taskNo', 'Task No.'),
    f('facility', 'Facility'),
    f('zone', 'Zone'),
    date('scheduledDate', 'Scheduled Date'),
    f('assignedTo', 'Assigned To'),
    statusField([['Scheduled', 'info'], ['Completed', 'success'], ['Missed', 'danger']])
  ]),
  entity('waste-management', 'Pickup', 'Waste Management', 'pi-trash', 'Scheduled waste pickups by type and disposal vendor.', [
    f('pickupNo', 'Pickup No.'),
    f('facility', 'Facility'),
    f('wasteType', 'Waste Type', 'select', { options: ['General', 'Hazardous', 'Recyclable', 'E-Waste'].map((v) => ({ label: v, value: v })) }),
    num('quantity', 'Quantity'),
    date('pickupDate', 'Pickup Date'),
    f('vendor', 'Vendor'),
    statusField([['Scheduled', 'info'], ['Collected', 'success']])
  ]),
  entity('parking-management', 'Permit', 'Staff/Vehicle Parking', 'pi-car', 'Staff and contractor vehicle parking permits by zone.', [
    f('permitNo', 'Permit No.'),
    f('holderName', 'Holder Name'),
    f('vehicleRegNo', 'Vehicle Reg. No.'),
    f('parkingZone', 'Parking Zone'),
    date('validFrom', 'Valid From'),
    date('validTo', 'Valid To'),
    statusField([['Active', 'success'], ['Expired', 'danger'], ['Suspended', 'warn']])
  ]),
  entity('visitor-management', 'Visitor', 'Visitor Management', 'pi-user-plus', 'Visitor check-in/check-out log per facility.', [
    f('visitorNo', 'Visitor No.'),
    f('visitorName', 'Visitor Name'),
    f('hostEmployee', 'Host Employee'),
    f('facility', 'Facility'),
    datetime('checkInTime', 'Check-in Time'),
    statusField([['Checked In', 'success'], ['Checked Out', 'secondary']])
  ]),
  entity('asset-depreciation', 'Depreciation Entry', 'Asset Depreciation', 'pi-chart-line', 'Period depreciation postings and net book value per asset.', [
    f('itemDescription', 'Asset'),
    money('acquisitionCost', 'Acquisition Cost'),
    money('accumulatedDepreciation', 'Accumulated Depreciation'),
    money('netBookValue', 'Net Book Value'),
    date('depreciationDate', 'Depreciation Date')
  ]),
  entity('asset-disposal', 'Disposal', 'Asset Disposal', 'pi-trash', 'End-of-life asset disposals — sold, scrapped, donated, or traded in.', [
    f('disposalNo', 'Disposal No.'),
    f('itemDescription', 'Asset'),
    f('disposalMethod', 'Disposal Method', 'select', { options: ['Sold', 'Scrapped', 'Donated', 'Traded-in'].map((v) => ({ label: v, value: v })) }),
    date('disposalDate', 'Disposal Date'),
    f('approvedBy', 'Approved By'),
    statusField([['Pending Approval', 'warn'], ['Approved', 'success']])
  ]),
  entity('insurance-warranty-tracking', 'Coverage', 'Insurance & Warranty Tracking', 'pi-verified', 'Insurance and warranty coverage windows per asset.', [
    f('itemDescription', 'Asset'),
    f('policyNo', 'Policy/Warranty No.'),
    f('provider', 'Provider'),
    f('coverageType', 'Coverage Type', 'select', { options: ['Insurance', 'Warranty'].map((v) => ({ label: v, value: v })) }),
    date('expiryDate', 'Expiry Date'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('facility-compliance-certification', 'Certificate', 'Compliance & Certification', 'pi-verified', 'Facility-level certificates — fire safety, elevator, occupancy — and their validity.', [
    f('certificateNo', 'Certificate No.'),
    f('facility', 'Facility'),
    f('certificateType', 'Certificate Type'),
    date('issuedDate', 'Issued Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('facility-audit', 'Audit', 'Facility Audit', 'pi-search', 'Scheduled facility condition and compliance audits.', [
    f('auditNo', 'Audit No.'),
    f('facility', 'Facility'),
    f('auditor', 'Auditor'),
    date('auditDate', 'Audit Date'),
    f('findings', 'Findings', 'textarea'),
    statusField([['Scheduled', 'info'], ['In Progress', 'warn'], ['Completed', 'success']])
  ]),

  // ───────────────────────── Fuel Management ─────────────────────────
  entity('fuel-purchase', 'Fuel Purchase', 'Fuel Purchase', 'pi-shopping-cart', 'Fuel uplift purchase orders per vendor.', [
    f('poNo', 'PO No.'),
    f('vendor', 'Vendor'),
    num('quantityLiters', 'Quantity (L)'),
    money('unitPrice', 'Unit Price'),
    date('purchaseDate', 'Purchase Date'),
    statusField([['Ordered', 'info'], ['Delivered', 'success'], ['Invoiced', 'secondary']])
  ]),
  entity('fuel-consumption', 'Consumption Record', 'Fuel Consumption', 'pi-chart-line', 'Actual fuel burn recorded per flight.', [
    f('aircraftReg', 'Aircraft Reg.'),
    f('flightNo', 'Flight No.'),
    num('fuelUsedLiters', 'Fuel Used (L)'),
    date('date', 'Date')
  ]),
  entity('fuel-cost-analysis', 'Cost Summary', 'Fuel Cost Analysis', 'pi-dollar', 'Period fuel spend and unit cost trends.', [
    f('period', 'Period'),
    money('totalCost', 'Total Cost'),
    num('totalVolumeLiters', 'Total Volume (L)'),
    money('avgCostPerLiter', 'Avg. Cost/Liter')
  ]),
  entity('fuel-inventory', 'Storage Tank', 'Fuel Inventory', 'pi-box', 'Bulk fuel storage tank levels by location.', [
    f('storageTank', 'Storage Tank'),
    f('location', 'Location'),
    num('currentVolumeLiters', 'Current Volume (L)'),
    num('capacityLiters', 'Capacity (L)'),
    statusField([['Normal', 'success'], ['Low', 'warn'], ['Critical', 'danger']])
  ]),
  entity('fuel-vendor-management', 'Fuel Vendor', 'Fuel Vendor Management', 'pi-building', 'Contracted fuel suppliers by airport.', [
    f('vendorCode', 'Vendor Code'),
    f('vendorName', 'Vendor Name'),
    f('contractAirport', 'Contract Airport'),
    f('contact', 'Contact'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),

  // ───────────────────────── Finance & Accounting ─────────────────────────
  entity('general-ledger', 'GL Entry', 'General Ledger', 'pi-book', 'Double-entry ledger postings across all accounts.', [
    f('entryNo', 'Entry No.'),
    f('account', 'Account'),
    f('description', 'Description'),
    money('debit', 'Debit'),
    money('credit', 'Credit'),
    date('date', 'Date')
  ]),
  entity('accounts-payable', 'Payable Invoice', 'Accounts Payable', 'pi-credit-card', 'Vendor invoices owed by the airline.', [
    f('invoiceNo', 'Invoice No.'),
    f('vendor', 'Vendor'),
    money('amount', 'Amount'),
    date('dueDate', 'Due Date'),
    statusField([['Unpaid', 'warn'], ['Paid', 'success'], ['Overdue', 'danger']])
  ]),
  entity('accounts-receivable', 'Receivable Invoice', 'Accounts Receivable', 'pi-wallet', 'Customer/agency invoices owed to the airline.', [
    f('invoiceNo', 'Invoice No.'),
    f('customer', 'Customer'),
    money('amount', 'Amount'),
    date('dueDate', 'Due Date'),
    statusField([['Outstanding', 'warn'], ['Paid', 'success'], ['Overdue', 'danger']])
  ]),
  entity('asset-management', 'Asset', 'Asset Management', 'pi-box', 'Fixed asset register and depreciation status.', [
    f('assetNo', 'Asset No.'),
    f('assetName', 'Asset Name'),
    f('category', 'Category'),
    money('purchaseValue', 'Purchase Value'),
    statusField([['In Use', 'success'], ['Under Repair', 'warn'], ['Disposed', 'secondary']])
  ]),
  entity('cost-center', 'Cost Center', 'Cost Center', 'pi-sitemap', 'Departmental cost center budget ownership.', [
    f('centerCode', 'Center Code'),
    f('centerName', 'Center Name'),
    f('department', 'Department'),
    money('budget', 'Budget'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('budgeting', 'Budget Line', 'Budgeting', 'pi-percentage', 'Departmental budget allocations by fiscal year.', [
    f('budgetNo', 'Budget No.'),
    f('department', 'Department'),
    f('fiscalYear', 'Fiscal Year'),
    money('allocatedAmount', 'Allocated Amount'),
    statusField([['Draft', 'info'], ['Approved', 'success'], ['Closed', 'secondary']])
  ]),
  entity('revenue-management', 'Revenue Entry', 'Revenue Management', 'pi-chart-line', 'Revenue recognized by source and period.', [
    f('period', 'Period'),
    f('source', 'Source', 'select', { options: ['Ticket Sales', 'Cargo', 'Ancillary'].map((v) => ({ label: v, value: v })) }),
    money('revenue', 'Revenue'),
    statusField([['Projected', 'info'], ['Actual', 'success']])
  ]),
  entity('financial-reports', 'Report', 'Financial Reports', 'pi-file', 'Generated financial statements and management reports.', [
    f('reportNo', 'Report No.'),
    f('title', 'Title'),
    f('period', 'Period'),
    date('generatedDate', 'Generated Date'),
    statusField([['Draft', 'info'], ['Final', 'success'], ['Published', 'secondary']])
  ]),

  // ───────────────────────── Human Resource (HR) ─────────────────────────
  entity('employee-management', 'Employee', 'Employee Management', 'pi-user', 'Company-wide employee master data.', [
    f('employeeNo', 'Employee No.'),
    f('fullName', 'Full Name'),
    f('department', 'Department'),
    f('position', 'Position'),
    statusField([['Active', 'success'], ['On Leave', 'warn'], ['Terminated', 'danger']])
  ]),
  entity('payroll', 'Payslip', 'Payroll', 'pi-money-bill', 'Employee payroll runs and net pay.', [
    f('payslipNo', 'Payslip No.'),
    f('employee', 'Employee'),
    f('period', 'Period'),
    money('netPay', 'Net Pay'),
    statusField([['Draft', 'info'], ['Processed', 'warn'], ['Paid', 'success']])
  ]),
  entity('attendance', 'Attendance Entry', 'Attendance', 'pi-calendar-plus', 'Daily clock-in/clock-out attendance records.', [
    f('employee', 'Employee'),
    date('date', 'Date'),
    f('checkIn', 'Check In'),
    f('checkOut', 'Check Out'),
    statusField([['Present', 'success'], ['Absent', 'danger'], ['Late', 'warn'], ['Leave', 'info']])
  ]),
  entity('hr-leave', 'Leave Request', 'Leave', 'pi-sign-out', 'Employee leave requests and approvals.', [
    f('requestNo', 'Request No.'),
    f('employee', 'Employee'),
    f('leaveType', 'Leave Type', 'select', { options: ['Annual', 'Sick', 'Unpaid'].map((v) => ({ label: v, value: v })) }),
    date('fromDate', 'From Date'),
    date('toDate', 'To Date'),
    statusField([['Pending', 'info'], ['Approved', 'success'], ['Rejected', 'danger']])
  ]),
  entity('performance-evaluation', 'Evaluation', 'Performance Evaluation', 'pi-star', 'Periodic employee performance review scores.', [
    f('evaluationNo', 'Evaluation No.'),
    f('employee', 'Employee'),
    f('period', 'Period'),
    num('score', 'Score (0-100)', { max: 100 }),
    statusField([['Draft', 'info'], ['Completed', 'success'], ['Acknowledged', 'secondary']])
  ]),
  entity('recruitment', 'Requisition', 'Recruitment', 'pi-user-plus', 'Open positions and applicant pipeline.', [
    f('requisitionNo', 'Requisition No.'),
    f('position', 'Position'),
    f('department', 'Department'),
    num('applicants', 'Applicants'),
    statusField([['Open', 'info'], ['Interviewing', 'warn'], ['Closed', 'secondary'], ['Filled', 'success']])
  ]),
  entity('hr-training', 'Training Course', 'Training', 'pi-graduation-cap', 'Company-wide employee training courses.', [
    f('courseNo', 'Course No.'),
    f('courseTitle', 'Course Title'),
    f('department', 'Department'),
    date('scheduledDate', 'Scheduled Date'),
    statusField([['Scheduled', 'info'], ['Ongoing', 'warn'], ['Completed', 'success']])
  ]),

  // ───────────────────────── Compliance & Safety ─────────────────────────
  entity('icao-compliance', 'ICAO Requirement', 'ICAO Compliance', 'pi-globe', 'ICAO Annex requirements and review cadence.', [
    f('requirementNo', 'Requirement No.'),
    f('description', 'Description'),
    f('category', 'Category'),
    date('reviewDate', 'Review Date'),
    statusField([['Compliant', 'success'], ['Non-Compliant', 'danger'], ['Under Review', 'warn']])
  ]),
  entity('iata-compliance', 'IATA Requirement', 'IATA Compliance', 'pi-globe', 'IOSA and other IATA requirements tracking.', [
    f('requirementNo', 'Requirement No.'),
    f('description', 'Description'),
    f('category', 'Category'),
    date('reviewDate', 'Review Date'),
    statusField([['Compliant', 'success'], ['Non-Compliant', 'danger'], ['Under Review', 'warn']])
  ]),
  entity('risk-assessment', 'Risk Assessment', 'Risk Assessment', 'pi-exclamation-triangle', 'Operational risk register with severity ratings.', [
    f('assessmentNo', 'Assessment No.'),
    f('area', 'Area'),
    f('riskLevel', 'Risk Level', 'select', { options: [{ label: 'Low', value: 'Low', severity: 'success' as TagSeverity }, { label: 'Medium', value: 'Medium', severity: 'info' as TagSeverity }, { label: 'High', value: 'High', severity: 'warn' as TagSeverity }, { label: 'Critical', value: 'Critical', severity: 'danger' as TagSeverity }], badge: true }),
    f('assessedBy', 'Assessed By'),
    statusField([['Open', 'danger'], ['Mitigated', 'warn'], ['Closed', 'success']])
  ]),
  entity('incident-reporting', 'Incident', 'Incident Reporting', 'pi-flag', 'Safety, security, and operational incident reports.', [
    f('incidentNo', 'Incident No.'),
    date('date', 'Date'),
    f('category', 'Category', 'select', { options: ['Safety', 'Security', 'Operational'].map((v) => ({ label: v, value: v })) }),
    f('description', 'Description', 'textarea'),
    statusField([['Reported', 'info'], ['Investigating', 'warn'], ['Closed', 'success']])
  ]),
  entity('audit-management', 'Audit', 'Audit Management', 'pi-search', 'Scheduled compliance and safety audits.', [
    f('auditNo', 'Audit No.'),
    f('area', 'Area'),
    f('auditor', 'Auditor'),
    date('auditDate', 'Audit Date'),
    statusField([['Scheduled', 'info'], ['In Progress', 'warn'], ['Completed', 'success']])
  ]),
  entity('document-control', 'Controlled Document', 'Document Control', 'pi-file', 'Revision-controlled compliance documentation.', [
    f('documentNo', 'Document No.'),
    f('title', 'Title'),
    f('category', 'Category'),
    f('revision', 'Revision'),
    statusField([['Draft', 'info'], ['Approved', 'success'], ['Obsolete', 'secondary']])
  ]),

  // ───────────────────────── Safety Management System (SMS) ─────────────────────────
  // 'document-control', 'risk-assessment', 'capa', 'audit-management' and 'incident-reporting' are shared
  // with Compliance & Safety / Quality Assurance — see the comments next to those items in module-manifest.ts.
  entity('safety-policy-statement', 'Policy', 'Safety Policy & Objectives', 'pi-flag', 'The airline’s safety policy statement and its revision history.', [
    f('policyNo', 'Policy No.'),
    f('title', 'Title'),
    f('version', 'Version'),
    f('approvedBy', 'Approved By'),
    date('effectiveDate', 'Effective Date'),
    statusField([['Draft', 'info'], ['Approved', 'success'], ['Under Review', 'warn']])
  ]),
  entity('safety-accountabilities', 'Accountability', 'Safety Accountabilities', 'pi-user-edit', 'Key safety roles, their accountable person, and scope of responsibility.', [
    f('role', 'Safety Role'),
    f('accountablePerson', 'Accountable Person'),
    f('department', 'Department'),
    f('responsibilities', 'Responsibilities', 'textarea'),
    statusField([['Active', 'success'], ['Vacant', 'danger']])
  ]),
  entity('emergency-response-plan', 'ERP Scenario', 'Emergency Response Planning', 'pi-phone', 'Emergency response scenarios and their drill/exercise schedule.', [
    f('scenarioNo', 'Scenario No.'),
    f('scenarioName', 'Scenario Name'),
    f('responseTeam', 'Response Team'),
    date('lastDrillDate', 'Last Drill Date'),
    date('nextDrillDate', 'Next Drill Date'),
    statusField([['Current', 'success'], ['Drill Due', 'warn'], ['Overdue', 'danger']])
  ]),
  entity('safety-risk-register', 'Risk Entry', 'Safety Risk Register', 'pi-table', 'Consolidated risk matrix of identified hazards, scored by likelihood × severity.', [
    f('hazardDescription', 'Hazard Description'),
    f('riskCategory', 'Risk Category', 'select', { options: ['Operational', 'Technical', 'Organizational', 'Environmental'].map((v) => ({ label: v, value: v })) }),
    f('likelihood', 'Likelihood', 'select', { options: ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'].map((v) => ({ label: v, value: v })) }),
    f('severity', 'Severity', 'select', { options: ['Negligible', 'Minor', 'Major', 'Hazardous', 'Catastrophic'].map((v) => ({ label: v, value: v })) }),
    num('riskScore', 'Risk Score', { min: 1, max: 25 }),
    statusField([['Open', 'danger'], ['Mitigated', 'warn'], ['Closed', 'success']])
  ]),
  entity('management-of-change', 'MOC Record', 'Management of Change', 'pi-sync', 'Formal safety impact assessment for organizational or operational changes.', [
    f('mocNo', 'MOC No.'),
    f('changeDescription', 'Change Description', 'textarea'),
    f('initiatedBy', 'Initiated By'),
    f('riskImpact', 'Risk Impact', 'select', { options: [{ label: 'Low', value: 'Low', severity: 'success' as TagSeverity }, { label: 'Medium', value: 'Medium', severity: 'warn' as TagSeverity }, { label: 'High', value: 'High', severity: 'danger' as TagSeverity }], badge: true }),
    date('implementationDate', 'Implementation Date'),
    statusField([['Proposed', 'info'], ['Under Review', 'warn'], ['Approved', 'success'], ['Rejected', 'danger']])
  ]),
  entity('safety-performance-indicators', 'SPI', 'Safety Performance Indicators', 'pi-gauge', 'Tracked safety performance indicators (SPIs) against target vs. actual.', [
    f('spiName', 'SPI Name'),
    num('targetValue', 'Target Value'),
    num('actualValue', 'Actual Value'),
    f('period', 'Period'),
    f('trend', 'Trend', 'select', { options: [{ label: 'Improving', value: 'Improving', severity: 'success' as TagSeverity }, { label: 'Stable', value: 'Stable', severity: 'info' as TagSeverity }, { label: 'Declining', value: 'Declining', severity: 'danger' as TagSeverity }], badge: true })
  ]),
  entity('voluntary-safety-reporting', 'Voluntary Report', 'Voluntary/Confidential Reporting', 'pi-lock', 'Non-punitive confidential air safety reports (ASR/VDR) submitted by staff.', [
    f('reportNo', 'Report No.'),
    f('category', 'Category', 'select', { options: ['Operational', 'Maintenance', 'Ground Handling', 'ATC', 'Other'].map((v) => ({ label: v, value: v })) }),
    f('description', 'Description', 'textarea'),
    date('submittedDate', 'Submitted Date'),
    statusField([['Received', 'info'], ['Under Review', 'warn'], ['Closed', 'success']])
  ]),
  entity('flight-data-monitoring', 'FDM Event', 'Flight Data Monitoring (FOQA)', 'pi-chart-line', 'Flight data exceedance events captured from onboard quick-access recorders.', [
    f('eventNo', 'Event No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('exceedanceType', 'Exceedance Type', 'select', { options: ['Hard Landing', 'Unstable Approach', 'High Speed', 'GPWS Warning', 'Other'].map((v) => ({ label: v, value: v })) }),
    date('eventDate', 'Event Date'),
    statusField([['New', 'danger'], ['Under Review', 'warn'], ['Closed', 'success']])
  ]),
  entity('fatigue-risk-management', 'FRMS Report', 'Fatigue Risk Management', 'pi-moon', 'Crew fatigue self-reports and duty period exposure under the FRMS program.', [
    f('crewMember', 'Crew Member'),
    num('dutyPeriodHours', 'Duty Period (hrs)'),
    num('fatigueScore', 'Fatigue Score', { min: 1, max: 10 }),
    date('reportedDate', 'Reported Date'),
    statusField([['Open', 'danger'], ['Reviewed', 'warn'], ['Closed', 'success']])
  ]),
  entity('sms-continuous-improvement', 'Review', 'Continuous Improvement', 'pi-arrow-up-right', 'Periodic SMS effectiveness reviews and lessons-learned actions.', [
    f('reviewNo', 'Review No.'),
    f('area', 'Area'),
    f('findings', 'Findings', 'textarea'),
    date('reviewDate', 'Review Date'),
    statusField([['Open', 'info'], ['Action Assigned', 'warn'], ['Closed', 'success']])
  ]),
  entity('safety-training', 'Training Course', 'Safety Training & Competency', 'pi-graduation-cap', 'SMS-specific training courses and completion tracking by role.', [
    f('courseNo', 'Course No.'),
    f('courseTitle', 'Course Title'),
    f('targetAudience', 'Target Audience'),
    date('completedDate', 'Completed Date'),
    statusField([['Scheduled', 'info'], ['Completed', 'success'], ['Overdue', 'danger']])
  ]),
  entity('safety-communication', 'Bulletin', 'Safety Communication', 'pi-megaphone', 'Safety bulletins, alerts, and lessons-learned shared across the organization.', [
    f('bulletinNo', 'Bulletin No.'),
    f('title', 'Title'),
    f('audience', 'Audience'),
    date('publishedDate', 'Published Date'),
    statusField([['Draft', 'info'], ['Published', 'success'], ['Archived', 'secondary']])
  ]),
  entity('safety-culture-survey', 'Survey', 'Safety Culture Survey', 'pi-comments', 'Periodic staff surveys measuring organizational safety culture maturity.', [
    f('surveyNo', 'Survey No.'),
    f('department', 'Department'),
    num('participationRate', 'Participation Rate (%)', { max: 100 }),
    num('averageScore', 'Average Score', { max: 10 }),
    date('surveyDate', 'Survey Date'),
    statusField([['Planned', 'info'], ['In Progress', 'warn'], ['Completed', 'success']])
  ]),

  // ───────────────────────── Quality Assurance ─────────────────────────
  entity('internal-audit', 'Internal Audit', 'Internal Audit', 'pi-search', 'Internally scheduled quality audits by department.', [
    f('auditNo', 'Audit No.'),
    f('department', 'Department'),
    f('auditor', 'Auditor'),
    date('auditDate', 'Audit Date'),
    statusField([['Scheduled', 'info'], ['In Progress', 'warn'], ['Completed', 'success']])
  ]),
  entity('quality-inspection', 'Inspection', 'Quality Inspection', 'pi-eye', 'Quality control inspections and pass/fail outcome.', [
    f('inspectionNo', 'Inspection No.'),
    f('area', 'Area'),
    f('inspector', 'Inspector'),
    date('inspectionDate', 'Inspection Date'),
    statusField([['Pass', 'success'], ['Fail', 'danger'], ['Pending', 'info']])
  ]),
  entity('capa', 'CAPA', 'CAPA (Corrective and Preventive Action)', 'pi-refresh', 'Corrective and preventive actions tracked to closure.', [
    f('capaNo', 'CAPA No.'),
    f('description', 'Description', 'textarea'),
    f('rootCause', 'Root Cause'),
    f('owner', 'Owner'),
    statusField([['Open', 'danger'], ['In Progress', 'warn'], ['Closed', 'success']])
  ]),
  entity('non-conformance-reports', 'NCR', 'Non-Conformance Reports', 'pi-ban', 'Non-conformances raised against process or product quality.', [
    f('ncrNo', 'NCR No.'),
    f('description', 'Description', 'textarea'),
    f('severity', 'Severity', 'select', { options: [{ label: 'Minor', value: 'Minor', severity: 'info' as TagSeverity }, { label: 'Major', value: 'Major', severity: 'warn' as TagSeverity }, { label: 'Critical', value: 'Critical', severity: 'danger' as TagSeverity }], badge: true }),
    f('reportedBy', 'Reported By'),
    statusField([['Open', 'danger'], ['Under Review', 'warn'], ['Closed', 'success']])
  ]),

  // ───────────────────────── CRM ─────────────────────────
  entity('customer-database', 'Customer', 'Customer Database', 'pi-database', 'Central customer contact database.', [
    f('customerNo', 'Customer No.'),
    f('fullName', 'Full Name'),
    f('email', 'Email', 'email'),
    f('phone', 'Phone'),
    f('country', 'Country'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('complaint-management', 'Complaint', 'Complaint Management', 'pi-comment', 'Customer complaints from intake to resolution.', [
    f('complaintNo', 'Complaint No.'),
    f('customer', 'Customer'),
    f('category', 'Category'),
    date('dateFiled', 'Date Filed'),
    statusField([['Open', 'danger'], ['In Progress', 'warn'], ['Resolved', 'success']])
  ]),
  entity('call-center', 'Call Log', 'Call Center', 'pi-phone', 'Inbound/outbound customer call center logs.', [
    f('callNo', 'Call No.'),
    f('customer', 'Customer'),
    f('agent', 'Agent'),
    datetime('callDate', 'Call Date'),
    statusField([['Open', 'info'], ['Resolved', 'success'], ['Escalated', 'danger']])
  ]),
  entity('crm-loyalty-program', 'Loyalty Member', 'Loyalty Program', 'pi-gift', 'Customer-facing loyalty tier and points administration.', [
    f('memberNo', 'Member No.'),
    f('customerName', 'Customer Name'),
    f('tier', 'Tier', 'select', { options: ['Silver', 'Gold', 'Platinum'].map((v) => ({ label: v, value: v })) }),
    num('pointsBalance', 'Points Balance'),
    statusField([['Active', 'success'], ['Suspended', 'danger']])
  ]),
  entity('marketing-campaign', 'Campaign', 'Marketing Campaign', 'pi-megaphone', 'Marketing campaigns across channels.', [
    f('campaignNo', 'Campaign No.'),
    f('title', 'Title'),
    f('channel', 'Channel', 'select', { options: ['Email', 'SMS', 'Social', 'Print'].map((v) => ({ label: v, value: v })) }),
    date('startDate', 'Start Date'),
    statusField([['Planned', 'info'], ['Active', 'success'], ['Completed', 'secondary']])
  ]),

  // ───────────────────────── Document Management ─────────────────────────
  entity('aircraft-documents', 'Aircraft Document', 'Aircraft Documents', 'pi-file', 'Aircraft-specific document library.', [
    f('documentNo', 'Document No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('title', 'Title'),
    f('category', 'Category'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('pilot-documents', 'Pilot Document', 'Pilot Documents', 'pi-file', 'Pilot-specific document library.', [
    f('documentNo', 'Document No.'),
    f('pilot', 'Pilot'),
    f('title', 'Title'),
    f('category', 'Category'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('certificates', 'Certificate', 'Certificates', 'pi-verified', 'General organizational certificates.', [
    f('certificateNo', 'Certificate No.'),
    f('title', 'Title'),
    f('issuedTo', 'Issued To'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('contracts', 'Contract', 'Contracts', 'pi-file-edit', 'Company-wide contract repository.', [
    f('contractNo', 'Contract No.'),
    f('title', 'Title'),
    f('counterparty', 'Counterparty'),
    date('endDate', 'End Date'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('manuals', 'Manual', 'Manuals', 'pi-book', 'Operations and maintenance manuals.', [
    f('manualNo', 'Manual No.'),
    f('title', 'Title'),
    f('category', 'Category'),
    f('revision', 'Revision'),
    statusField([['Current', 'success'], ['Superseded', 'secondary']])
  ]),
  entity('digital-signature', 'Signature Request', 'Digital Signature', 'pi-pencil', 'E-signature requests and completion status.', [
    f('documentNo', 'Document No.'),
    f('signedBy', 'Signed By'),
    date('signedDate', 'Signed Date'),
    statusField([['Signed', 'success'], ['Pending', 'info'], ['Rejected', 'danger']])
  ]),
  entity('version-control', 'Document Version', 'Version Control', 'pi-history', 'Document version history and current/archived state.', [
    f('documentNo', 'Document No.'),
    f('title', 'Title'),
    f('version', 'Version'),
    date('updatedDate', 'Updated Date'),
    statusField([['Latest', 'success'], ['Archived', 'secondary']])
  ]),

  // ───────────────────────── Business Intelligence ─────────────────────────
  entity('kpi-monitoring', 'KPI', 'KPI Monitoring', 'pi-gauge', 'Tracked KPIs against target vs. actual.', [
    f('kpiName', 'KPI Name'),
    f('category', 'Category'),
    num('target', 'Target'),
    num('actual', 'Actual'),
    statusField([['On Target', 'success'], ['Below Target', 'danger'], ['Above Target', 'info']])
  ]),
  entity('revenue-analysis', 'Revenue Segment', 'Revenue Analysis', 'pi-chart-line', 'Revenue broken down by business segment.', [
    f('period', 'Period'),
    f('segment', 'Segment'),
    money('revenue', 'Revenue'),
    num('growthPct', 'Growth (%)')
  ]),
  entity('fleet-performance', 'Fleet Performance', 'Fleet Performance', 'pi-compass', 'Fleet-wide utilization and dispatch reliability.', [
    f('aircraftReg', 'Aircraft Reg.'),
    f('period', 'Period'),
    num('utilizationPct', 'Utilization (%)', { max: 100 }),
    num('dispatchReliabilityPct', 'Dispatch Reliability (%)', { max: 100 })
  ]),
  entity('flight-performance', 'Flight Performance', 'Flight Performance', 'pi-send', 'On-time performance and load factor by flight.', [
    f('flightNo', 'Flight No.'),
    f('period', 'Period'),
    num('onTimePerformancePct', 'On-Time Performance (%)', { max: 100 }),
    num('loadFactorPct', 'Load Factor (%)', { max: 100 })
  ]),
  entity('delay-analysis', 'Delay Cause', 'Delay Analysis', 'pi-clock', 'Delay counts and average duration by cause category.', [
    f('period', 'Period'),
    f('causeCategory', 'Cause Category'),
    num('delayCount', 'Delay Count'),
    num('avgDelayMinutes', 'Avg. Delay (min)')
  ]),
  entity('bi-fuel-cost-analysis', 'Fuel Spend Summary', 'Fuel Cost Analysis', 'pi-bolt', 'Executive rollup of fuel spend trends.', [
    f('period', 'Period'),
    money('totalSpend', 'Total Spend'),
    money('avgPricePerLiter', 'Avg. Price/Liter'),
    f('trend', 'Trend', 'select', { options: [{ label: 'Up', value: 'Up', severity: 'danger' as TagSeverity }, { label: 'Down', value: 'Down', severity: 'success' as TagSeverity }, { label: 'Stable', value: 'Stable', severity: 'info' as TagSeverity }], badge: true })
  ]),

  // ───────────────────────── Security Management ─────────────────────────
  entity('audit-logs', 'Audit Log', 'Audit Logs', 'pi-history', 'System-wide user action audit trail.', [
    f('logNo', 'Log No.'),
    f('user', 'User'),
    f('action', 'Action'),
    datetime('timestamp', 'Timestamp'),
    statusField([['Success', 'success'], ['Failed', 'danger']])
  ]),
  entity('mfa', 'MFA Enrollment', 'Multi-factor Authentication', 'pi-shield', 'Per-user multi-factor authentication enrollment.', [
    f('user', 'User'),
    f('method', 'Method', 'select', { options: ['SMS', 'Authenticator App', 'Email'].map((v) => ({ label: v, value: v })) }),
    date('enrolledDate', 'Enrolled Date'),
    statusField([['Enabled', 'success'], ['Disabled', 'secondary']])
  ]),
  entity('data-encryption', 'Encrypted Asset', 'Data Encryption', 'pi-lock', 'Encryption method and key rotation status per asset.', [
    f('asset', 'Asset'),
    f('encryptionType', 'Encryption Type', 'select', { options: ['AES-256', 'RSA-2048', 'TLS 1.3'].map((v) => ({ label: v, value: v })) }),
    date('lastRotated', 'Last Rotated'),
    statusField([['Compliant', 'success'], ['Non-Compliant', 'danger']])
  ]),

  // ───────────────────────── Notification System ─────────────────────────
  entity('email-alerts', 'Email Alert', 'Email Alerts', 'pi-envelope', 'Outbound email alert delivery log.', [
    f('alertNo', 'Alert No.'),
    f('recipient', 'Recipient'),
    f('subject', 'Subject'),
    datetime('sentDate', 'Sent Date'),
    statusField([['Sent', 'success'], ['Failed', 'danger'], ['Queued', 'info']])
  ]),
  entity('sms-alerts', 'SMS Alert', 'SMS Alerts', 'pi-mobile', 'Outbound SMS alert delivery log.', [
    f('alertNo', 'Alert No.'),
    f('recipientPhone', 'Recipient Phone'),
    f('message', 'Message'),
    datetime('sentDate', 'Sent Date'),
    statusField([['Sent', 'success'], ['Failed', 'danger'], ['Queued', 'info']])
  ]),
  entity('push-notifications', 'Push Notification', 'Push Notifications', 'pi-bell', 'Mobile app push notification broadcasts.', [
    f('alertNo', 'Alert No.'),
    f('targetGroup', 'Target Group'),
    f('title', 'Title'),
    datetime('sentDate', 'Sent Date'),
    statusField([['Sent', 'success'], ['Failed', 'danger'], ['Scheduled', 'info']])
  ]),
  entity('maintenance-reminders', 'Reminder', 'Maintenance Reminders', 'pi-wrench', 'Upcoming maintenance due-date reminders.', [
    f('reminderNo', 'Reminder No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('dueDate', 'Due Date'),
    f('description', 'Description'),
    statusField([['Pending', 'info'], ['Sent', 'warn'], ['Acknowledged', 'success']])
  ]),
  entity('license-expiry-alerts', 'Expiry Alert', 'License Expiry Alerts', 'pi-exclamation-triangle', 'Upcoming license/certificate expiry reminders.', [
    f('alertNo', 'Alert No.'),
    f('holder', 'Holder'),
    f('licenseType', 'License Type'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Pending', 'info'], ['Sent', 'warn'], ['Acknowledged', 'success']])
  ])
];

export const ENTITY_CONFIGS: Record<string, EntityConfig> = Object.fromEntries(
  [...ENTITY_LIST, ...EXTENDED_ENTITY_LIST].map((e) => [e.key, e])
);

export function getEntityConfig(key: string): EntityConfig | undefined {
  return ENTITY_CONFIGS[key];
}
