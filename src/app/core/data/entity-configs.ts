import { EntityConfig, EntityField, FieldType, TagSeverity } from '../models/entity-config.model';

/**
 * Field/table/form configuration for every *generic* (non-flagship) sub-item
 * in module-manifest.ts. Consumed by shared/scaffold/feature-list-page to
 * render a real, working CRUD screen for each — table columns, the add/edit
 * dialog form, and validation — without a bespoke component per item.
 *
 * Flagship items (flight-scheduling, aircraft-information, work-orders,
 * pilot-management, spare-parts-inventory, purchase-orders, user-roles,
 * access-control, dashboard) intentionally have no entry here: they have
 * hand-built components under features/ instead.
 */

function f(key: string, label: string, type: FieldType = 'text', extra: Partial<EntityField> = {}): EntityField {
  return { key, label, type, required: true, ...extra };
}

function num(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'number', extra);
}

function money(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'number', { prefix: '$', min: 0, ...extra });
}

function date(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'date', extra);
}

function datetime(key: string, label: string, extra: Partial<EntityField> = {}): EntityField {
  return f(key, label, 'datetime', extra);
}

function statusField(pairs: Array<[string, TagSeverity]>, key = 'status', label = 'Status'): EntityField {
  return {
    key,
    label,
    type: 'select',
    required: true,
    badge: true,
    options: pairs.map(([value, severity]) => ({ label: value, value, severity }))
  };
}

function entity(
  key: string,
  label: string,
  pluralLabel: string,
  icon: string,
  description: string,
  fields: EntityField[],
  seedCount = 10
): EntityConfig {
  return { key, label, pluralLabel, icon, description, fields, seedCount };
}

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
  entity('component-tracking', 'Component', 'Component Tracking', 'pi-microchip', 'Life-limited and rotable component installation history.', [
    f('componentNo', 'Component No.'),
    f('componentName', 'Component Name'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('installedDate', 'Installed Date'),
    num('lifeRemainingHrs', 'Life Remaining (hrs)'),
    statusField([['Installed', 'success'], ['Removed', 'secondary'], ['In Repair', 'warn']])
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

  // ───────────────────────── Procurement ─────────────────────────
  entity('vendor-management', 'Vendor', 'Vendor Management', 'pi-building', 'Approved vendor and supplier master records.', [
    f('vendorCode', 'Vendor Code'),
    f('vendorName', 'Vendor Name'),
    f('contactPerson', 'Contact Person'),
    f('phone', 'Phone'),
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
  entity('baggage-handling', 'Baggage Belt Op', 'Baggage Handling', 'pi-briefcase', 'Baggage belt operations per arriving/departing flight.', [
    f('beltNo', 'Belt No.'),
    f('flightNo', 'Flight No.'),
    f('handler', 'Handler'),
    datetime('startTime', 'Start Time'),
    statusField([['In Progress', 'info'], ['Completed', 'success'], ['Delayed', 'warn']])
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
  entity('safety-management-system', 'SMS Item', 'Safety Management System (SMS)', 'pi-shield', 'Hazard, audit, and policy items under the SMS program.', [
    f('reportNo', 'Report No.'),
    f('category', 'Category', 'select', { options: ['Hazard', 'Audit', 'Policy'].map((v) => ({ label: v, value: v })) }),
    f('description', 'Description'),
    f('owner', 'Owner'),
    statusField([['Open', 'danger'], ['Mitigated', 'warn'], ['Closed', 'success']])
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
  ENTITY_LIST.map((e) => [e.key, e])
);

export function getEntityConfig(key: string): EntityConfig | undefined {
  return ENTITY_CONFIGS[key];
}
