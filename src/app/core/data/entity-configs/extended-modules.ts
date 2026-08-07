import { EntityConfig } from '../../models/entity-config.model';
import { choice, date, datetime, entity, f, money, num, optional, statusField } from './builders';

/**
 * Entity configs for the modules added after the original 25 — the aviation
 * and ERP capabilities a reviewer expects to find in a system of this scope:
 * load control, revenue management and accounting, disruption handling,
 * approvals, CAMO, leasing, flight planning, crew training, special services,
 * aviation security, ground handling contracts, sustainability, ancillary
 * revenue, distribution, portals and integration.
 *
 * Two conventions worth knowing before adding to this file:
 *
 * 1. **`optional(...)` for anything a user may leave blank.** `f(...)` marks a
 *    field required, and that flag is what the database's NOT NULL constraints
 *    will be generated from. Free-text notes, findings and secondary dates use
 *    `optional`, so a record can be opened before every detail is known.
 * 2. **Reuse a key rather than copying an entity.** Several items below are
 *    deliberately absent because they reuse a key defined elsewhere —
 *    `incident-reporting`, `audit-management`, `training-records`,
 *    `ad-compliance`, `service-bulletin-management`, `delay-management`,
 *    `waste-management` and `physical-security-systems` are each one record
 *    type reached from several desks, not several copies.
 */

const OPEN_CLOSED: [string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'][] = [
  ['Open', 'danger'],
  ['In Progress', 'warn'],
  ['Closed', 'success']
];

export const EXTENDED_MODULE_ENTITIES: EntityConfig[] = [
  // ═══════════════════ Load Control & Weight/Balance ═══════════════════
  entity('loadsheet', 'Loadsheet', 'Loadsheets', 'pi-file', 'Final loadsheet issued to the flight crew before departure.', [
    f('loadsheetNo', 'Loadsheet No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    datetime('issuedAt', 'Issued At'),
    num('takeoffWeightKg', 'Take-off Weight', { suffix: 'kg' }),
    num('zeroFuelWeightKg', 'Zero Fuel Weight', { suffix: 'kg' }),
    f('preparedBy', 'Prepared By'),
    statusField([['Draft', 'secondary'], ['Issued', 'info'], ['Signed', 'success'], ['Superseded', 'warn']])
  ]),
  entity('trim-sheet', 'Trim Sheet', 'Trim Sheets', 'pi-sliders-h', 'Balance and trim calculation supporting each loadsheet.', [
    f('trimSheetNo', 'Trim Sheet No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    num('macPercent', 'MAC', { suffix: '%' }),
    num('stabTrimSetting', 'Stabiliser Trim'),
    choice('loadingMethod', 'Loading Method', ['Manual', 'Automated', 'Standard Index']),
    statusField([['Within Limits', 'success'], ['Recheck Required', 'warn'], ['Out of Limits', 'danger']])
  ]),
  entity('centre-of-gravity', 'CG Record', 'Centre of Gravity', 'pi-compass', 'Centre-of-gravity envelope checks per flight and configuration.', [
    f('recordNo', 'Record No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('flightNo', 'Flight No.'),
    num('cgPercentMac', 'CG', { suffix: '% MAC' }),
    num('forwardLimit', 'Forward Limit', { suffix: '% MAC' }),
    num('aftLimit', 'Aft Limit', { suffix: '% MAC' }),
    statusField([['In Envelope', 'success'], ['Marginal', 'warn'], ['Out of Envelope', 'danger']])
  ]),
  entity('aircraft-weighing', 'Weighing', 'Aircraft Weighing', 'pi-gauge', 'Periodic aircraft weighing required to keep basic weight data valid.', [
    f('weighingNo', 'Weighing No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('weighingDate', 'Weighing Date'),
    date('nextDueDate', 'Next Due'),
    num('basicEmptyWeightKg', 'Basic Empty Weight', { suffix: 'kg' }),
    f('facility', 'Facility'),
    statusField([['Valid', 'success'], ['Due Soon', 'warn'], ['Overdue', 'danger']])
  ]),
  entity('passenger-load-distribution', 'Distribution', 'Passenger Distribution', 'pi-users', 'Passenger seating distribution by zone used in the balance calculation.', [
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    num('zoneAPax', 'Zone A Pax'),
    num('zoneBPax', 'Zone B Pax'),
    num('zoneCPax', 'Zone C Pax'),
    num('infants', 'Infants'),
    statusField([['Provisional', 'info'], ['Final', 'success'], ['Amended', 'warn']])
  ]),
  entity('uld-load-plan', 'ULD Plan', 'ULD Load Plan', 'pi-box', 'Unit load device positions and weights in the hold.', [
    f('planNo', 'Plan No.'),
    f('flightNo', 'Flight No.'),
    f('uldNo', 'ULD No.'),
    f('holdPosition', 'Hold Position'),
    num('grossWeightKg', 'Gross Weight', { suffix: 'kg' }),
    choice('contentType', 'Content Type', ['Baggage', 'Cargo', 'Mail', 'Empty']),
    statusField([['Planned', 'info'], ['Loaded', 'success'], ['Offloaded', 'warn']])
  ]),
  entity('last-minute-changes', 'LMC', 'Last Minute Changes', 'pi-clock', 'Changes accepted after the loadsheet was issued, within LMC tolerance.', [
    f('lmcNo', 'LMC No.'),
    f('flightNo', 'Flight No.'),
    choice('changeType', 'Change Type', ['Passenger', 'Baggage', 'Cargo', 'Fuel', 'Crew']),
    num('weightChangeKg', 'Weight Change', { suffix: 'kg' }),
    f('authorisedBy', 'Authorised By'),
    optional('remarks', 'Remarks', 'textarea'),
    statusField([['Within Tolerance', 'success'], ['Exceeds Tolerance', 'danger'], ['New Loadsheet Issued', 'warn']])
  ]),
  entity('notoc', 'NOTOC', 'NOTOC', 'pi-exclamation-triangle', 'Notification to Captain of dangerous goods and special loads.', [
    f('notocNo', 'NOTOC No.'),
    f('flightNo', 'Flight No.'),
    f('unNumber', 'UN Number'),
    f('properShippingName', 'Proper Shipping Name'),
    f('holdPosition', 'Hold Position'),
    num('quantityKg', 'Quantity', { suffix: 'kg' }),
    statusField([['Issued', 'info'], ['Acknowledged', 'success'], ['Amended', 'warn']])
  ]),
  entity('load-planning-standards', 'Standard', 'Load Planning Standards', 'pi-book', 'Standard weights and planning rules applied by load control.', [
    f('standardCode', 'Standard Code'),
    f('aircraftType', 'Aircraft Type'),
    num('standardPaxWeightKg', 'Standard Pax Weight', { suffix: 'kg' }),
    num('standardBagWeightKg', 'Standard Bag Weight', { suffix: 'kg' }),
    date('effectiveFrom', 'Effective From'),
    statusField([['Active', 'success'], ['Superseded', 'secondary'], ['Draft', 'info']])
  ]),
  entity('deadload-manifest', 'Manifest', 'Deadload Manifest', 'pi-inbox', 'Cargo, mail and baggage carried as deadload on a flight.', [
    f('manifestNo', 'Manifest No.'),
    f('flightNo', 'Flight No.'),
    num('baggageWeightKg', 'Baggage', { suffix: 'kg' }),
    num('cargoWeightKg', 'Cargo', { suffix: 'kg' }),
    num('mailWeightKg', 'Mail', { suffix: 'kg' }),
    statusField([['Provisional', 'info'], ['Final', 'success']])
  ]),

  // ═══════════════════ Revenue Management & Pricing ═══════════════════
  entity('fare-management', 'Fare', 'Fare Management', 'pi-tag', 'Published fares by route, cabin and booking class.', [
    f('fareBasis', 'Fare Basis'),
    f('origin', 'Origin'),
    f('destination', 'Destination'),
    f('bookingClass', 'Booking Class'),
    money('fareAmount', 'Fare Amount'),
    date('validFrom', 'Valid From'),
    date('validTo', 'Valid To'),
    statusField([['Published', 'success'], ['Pending', 'info'], ['Withdrawn', 'secondary']])
  ]),
  entity('booking-class-inventory', 'Class Inventory', 'Booking Class Inventory', 'pi-th-large', 'Seats authorised per booking class on each flight.', [
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    f('bookingClass', 'Booking Class'),
    num('authorised', 'Authorised'),
    num('sold', 'Sold'),
    num('available', 'Available'),
    statusField([['Open', 'success'], ['Waitlist', 'warn'], ['Closed', 'danger']])
  ]),
  entity('seat-inventory-control', 'Inventory Control', 'Seat Inventory Control', 'pi-sliders-v', 'Nesting and protection rules governing seat availability.', [
    f('controlNo', 'Control No.'),
    f('flightNo', 'Flight No.'),
    choice('controlType', 'Control Type', ['Nested', 'Parallel', 'Protected', 'Free Sale']),
    num('protectedSeats', 'Protected Seats'),
    f('setBy', 'Set By'),
    statusField([['Active', 'success'], ['Expired', 'secondary']])
  ]),
  entity('overbooking-management', 'Overbooking', 'Overbooking Management', 'pi-users', 'Overbooking levels and realised denied boardings by flight.', [
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    num('capacity', 'Capacity'),
    num('overbookingLimit', 'Overbooking Limit'),
    num('noShows', 'No-Shows'),
    num('deniedBoardings', 'Denied Boardings'),
    statusField([['Optimal', 'success'], ['Aggressive', 'warn'], ['Oversold', 'danger']])
  ]),
  entity('demand-forecast', 'Forecast', 'Demand Forecast', 'pi-chart-line', 'Forecast demand by route and departure period.', [
    f('forecastNo', 'Forecast No.'),
    f('route', 'Route'),
    date('departurePeriod', 'Departure Period'),
    num('forecastPax', 'Forecast Pax'),
    num('bookedPax', 'Booked Pax'),
    num('loadFactorPct', 'Load Factor', { suffix: '%' }),
    statusField([['On Track', 'success'], ['Below Forecast', 'warn'], ['Above Forecast', 'info']])
  ]),
  entity('competitor-fare-tracking', 'Competitor Fare', 'Competitor Fare Tracking', 'pi-search', 'Observed competitor pricing on overlapping routes.', [
    f('route', 'Route'),
    f('competitor', 'Competitor'),
    f('bookingClass', 'Booking Class'),
    money('competitorFare', 'Competitor Fare'),
    money('ownFare', 'Own Fare'),
    date('observedDate', 'Observed Date'),
    statusField([['Competitive', 'success'], ['Above Market', 'warn'], ['Below Market', 'info']])
  ]),
  entity('route-profitability', 'Route P&L', 'Route Profitability', 'pi-dollar', 'Contribution and margin by route.', [
    f('route', 'Route'),
    date('periodStart', 'Period Start'),
    money('revenue', 'Revenue'),
    money('directCost', 'Direct Cost'),
    money('contribution', 'Contribution'),
    num('marginPct', 'Margin', { suffix: '%' }),
    statusField([['Profitable', 'success'], ['Break-even', 'warn'], ['Loss-making', 'danger']])
  ]),
  entity('group-booking-quotes', 'Group Quote', 'Group Booking Quotes', 'pi-users', 'Negotiated quotes for group travel requests.', [
    f('quoteNo', 'Quote No.'),
    f('customer', 'Customer'),
    f('route', 'Route'),
    num('paxCount', 'Pax Count'),
    money('quotedFare', 'Quoted Fare per Pax'),
    date('travelDate', 'Travel Date'),
    statusField([['Draft', 'secondary'], ['Sent', 'info'], ['Accepted', 'success'], ['Declined', 'danger']])
  ]),
  entity('dynamic-pricing-rules', 'Pricing Rule', 'Dynamic Pricing Rules', 'pi-cog', 'Automated rules that adjust fares against demand signals.', [
    f('ruleCode', 'Rule Code'),
    f('ruleName', 'Rule Name'),
    f('route', 'Route'),
    choice('trigger', 'Trigger', ['Load Factor', 'Days to Departure', 'Competitor Move', 'Booking Pace']),
    num('adjustmentPct', 'Adjustment', { suffix: '%' }),
    statusField([['Active', 'success'], ['Paused', 'warn'], ['Retired', 'secondary']])
  ]),
  entity('revenue-integrity', 'Integrity Case', 'Revenue Integrity', 'pi-verified', 'Detection of duplicate, speculative and abusive bookings.', [
    f('caseNo', 'Case No.'),
    f('pnr', 'PNR'),
    choice('issueType', 'Issue Type', ['Duplicate Booking', 'Churning', 'Fictitious Name', 'Waitlist Abuse', 'No Ticketing']),
    date('detectedDate', 'Detected Date'),
    money('revenueAtRisk', 'Revenue at Risk'),
    statusField(OPEN_CLOSED)
  ]),

  // ═══════════════════ Revenue Accounting & Settlement ═══════════════════
  entity('passenger-revenue-accounting', 'Coupon', 'Passenger Revenue Accounting', 'pi-ticket', 'Flown-coupon recognition and passenger revenue reconciliation.', [
    f('documentNo', 'Document No.'),
    f('couponNo', 'Coupon No.'),
    f('flightNo', 'Flight No.'),
    date('flownDate', 'Flown Date'),
    money('revenueAmount', 'Revenue Amount'),
    statusField([['Unflown', 'info'], ['Flown', 'success'], ['Refunded', 'warn'], ['Exchanged', 'secondary']])
  ]),
  entity('cargo-revenue-accounting', 'AWB Revenue', 'Cargo Revenue Accounting', 'pi-inbox', 'Air waybill revenue recognition and reconciliation.', [
    f('awbNo', 'AWB No.'),
    f('flightNo', 'Flight No.'),
    date('flownDate', 'Flown Date'),
    num('chargeableWeightKg', 'Chargeable Weight', { suffix: 'kg' }),
    money('revenueAmount', 'Revenue Amount'),
    statusField([['Pending', 'info'], ['Recognised', 'success'], ['Disputed', 'danger']])
  ]),
  entity('interline-billing', 'Interline Invoice', 'Interline Billing', 'pi-sync', 'Billing and rejection handling with interline partners.', [
    f('invoiceNo', 'Invoice No.'),
    f('partnerAirline', 'Partner Airline'),
    choice('direction', 'Direction', ['Receivable', 'Payable']),
    date('billingPeriod', 'Billing Period'),
    money('amount', 'Amount'),
    statusField([['Submitted', 'info'], ['Settled', 'success'], ['Rejected', 'danger'], ['Under Dispute', 'warn']])
  ]),
  entity('proration', 'Proration', 'Proration', 'pi-percentage', 'Allocation of through-fare revenue across carriers.', [
    f('prorationNo', 'Proration No.'),
    f('documentNo', 'Document No.'),
    choice('method', 'Method', ['MPA', 'SPA', 'Straight Rate', 'Prorate Factor']),
    money('totalFare', 'Total Fare'),
    money('ownShare', 'Own Share'),
    statusField([['Calculated', 'info'], ['Agreed', 'success'], ['Challenged', 'warn']])
  ]),
  entity('bsp-settlement', 'BSP Settlement', 'BSP Settlement', 'pi-building-columns', 'IATA Billing and Settlement Plan remittances by market.', [
    f('settlementNo', 'Settlement No.'),
    f('market', 'Market'),
    date('remittancePeriod', 'Remittance Period'),
    money('grossSales', 'Gross Sales'),
    money('commission', 'Commission'),
    money('netRemittance', 'Net Remittance'),
    statusField([['Pending', 'info'], ['Received', 'success'], ['Short Paid', 'danger']])
  ]),
  entity('cass-settlement', 'CASS Settlement', 'CASS Settlement', 'pi-inbox', 'Cargo Accounts Settlement System billing periods.', [
    f('settlementNo', 'Settlement No.'),
    f('market', 'Market'),
    date('billingPeriod', 'Billing Period'),
    money('billedAmount', 'Billed Amount'),
    money('settledAmount', 'Settled Amount'),
    statusField([['Pending', 'info'], ['Settled', 'success'], ['Disputed', 'danger']])
  ]),
  entity('ich-clearing', 'ICH Clearance', 'ICH Clearing', 'pi-refresh', 'IATA Clearing House offsets with partner airlines.', [
    f('clearanceNo', 'Clearance No.'),
    date('clearingPeriod', 'Clearing Period'),
    money('receivables', 'Receivables'),
    money('payables', 'Payables'),
    money('netPosition', 'Net Position'),
    statusField([['Submitted', 'info'], ['Cleared', 'success'], ['Protested', 'warn']])
  ]),
  entity('sales-audit', 'Sales Audit', 'Sales Audit', 'pi-search', 'Audit of agency and direct sales against fare rules.', [
    f('auditNo', 'Audit No.'),
    f('agency', 'Agency'),
    date('auditPeriod', 'Audit Period'),
    num('documentsAudited', 'Documents Audited'),
    num('discrepancies', 'Discrepancies'),
    money('recoveredAmount', 'Recovered Amount'),
    statusField(OPEN_CLOSED)
  ]),
  entity('refund-accounting', 'Refund', 'Refund Accounting', 'pi-replay', 'Refund authorisations and their accounting treatment.', [
    f('refundNo', 'Refund No.'),
    f('documentNo', 'Document No.'),
    date('requestDate', 'Request Date'),
    money('refundAmount', 'Refund Amount'),
    money('cancellationFee', 'Cancellation Fee'),
    statusField([['Requested', 'info'], ['Authorised', 'warn'], ['Paid', 'success'], ['Rejected', 'danger']])
  ]),
  entity('unearned-revenue', 'Forward Sale', 'Unearned Revenue', 'pi-wallet', 'Forward sales held as a liability until the coupon is flown.', [
    f('periodCode', 'Period'),
    date('asOfDate', 'As Of'),
    money('openingBalance', 'Opening Balance'),
    money('salesInPeriod', 'Sales in Period'),
    money('recognisedInPeriod', 'Recognised in Period'),
    money('closingBalance', 'Closing Balance'),
    statusField([['Draft', 'secondary'], ['Reviewed', 'info'], ['Posted', 'success']])
  ]),

  // ═══════════════════ Disruption Management (IROPS) ═══════════════════
  entity('disruption-events', 'Disruption', 'Disruption Events', 'pi-exclamation-triangle', 'Delays, cancellations and diversions requiring recovery action.', [
    f('eventNo', 'Event No.'),
    f('flightNo', 'Flight No.'),
    date('eventDate', 'Event Date'),
    choice('eventType', 'Event Type', ['Delay', 'Cancellation', 'Diversion', 'Return to Stand', 'Aircraft Change']),
    choice('rootCause', 'Root Cause', ['Technical', 'Weather', 'ATC', 'Crew', 'Ground Handling', 'Security', 'Commercial']),
    num('affectedPax', 'Affected Pax'),
    num('delayMinutes', 'Delay', { suffix: 'min' }),
    statusField(OPEN_CLOSED)
  ]),
  entity('passenger-rebooking', 'Rebooking', 'Passenger Rebooking', 'pi-sync', 'Reaccommodation of disrupted passengers onto alternative flights.', [
    f('rebookingNo', 'Rebooking No.'),
    f('pnr', 'PNR'),
    f('originalFlight', 'Original Flight'),
    f('newFlight', 'New Flight'),
    datetime('rebookedAt', 'Rebooked At'),
    choice('rebookingType', 'Type', ['Own Flight', 'Interline', 'Ground Transport', 'Refund']),
    statusField([['Proposed', 'info'], ['Confirmed', 'success'], ['Declined', 'danger']])
  ]),
  entity('hotel-accommodation', 'Accommodation', 'Hotel Accommodation', 'pi-building', 'Hotel nights provided to disrupted passengers and crew.', [
    f('voucherNo', 'Voucher No.'),
    f('pnr', 'PNR'),
    f('hotel', 'Hotel'),
    date('nightOf', 'Night Of'),
    num('rooms', 'Rooms'),
    money('cost', 'Cost'),
    statusField([['Issued', 'info'], ['Used', 'success'], ['Cancelled', 'secondary']])
  ]),
  entity('meal-vouchers', 'Voucher', 'Meal & Transport Vouchers', 'pi-ticket', 'Meal and ground transport vouchers issued during disruption.', [
    f('voucherNo', 'Voucher No.'),
    f('pnr', 'PNR'),
    choice('voucherType', 'Voucher Type', ['Meal', 'Refreshment', 'Taxi', 'Coach']),
    money('value', 'Value'),
    date('issuedDate', 'Issued Date'),
    statusField([['Issued', 'info'], ['Redeemed', 'success'], ['Expired', 'secondary']])
  ]),
  entity('passenger-compensation-claims', 'Claim', 'Compensation Claims', 'pi-dollar', 'Statutory compensation claims (EC261 and equivalents).', [
    f('claimNo', 'Claim No.'),
    f('pnr', 'PNR'),
    f('flightNo', 'Flight No.'),
    choice('regulation', 'Regulation', ['EC261', 'UK261', 'Montreal Convention', 'National Rule', 'Goodwill']),
    money('claimedAmount', 'Claimed Amount'),
    money('paidAmount', 'Paid Amount'),
    date('claimDate', 'Claim Date'),
    statusField([['Received', 'info'], ['Under Review', 'warn'], ['Paid', 'success'], ['Rejected', 'danger']])
  ]),
  entity('crew-recovery', 'Crew Recovery', 'Crew Recovery', 'pi-users', 'Crew reassignment and duty-limit resolution during disruption.', [
    f('recoveryNo', 'Recovery No.'),
    f('crewMember', 'Crew Member'),
    f('originalDuty', 'Original Duty'),
    f('newDuty', 'New Duty'),
    choice('reason', 'Reason', ['Duty Limit', 'Positioning', 'Sickness', 'Aircraft Change', 'Station Closure']),
    statusField([['Proposed', 'info'], ['Assigned', 'success'], ['Declined', 'danger']])
  ]),
  entity('aircraft-recovery', 'Aircraft Recovery', 'Aircraft Recovery', 'pi-send', 'Aircraft reassignment and rotation repair after a disruption.', [
    f('recoveryNo', 'Recovery No.'),
    f('originalAircraft', 'Original Aircraft'),
    f('replacementAircraft', 'Replacement Aircraft'),
    f('affectedRotation', 'Affected Rotation'),
    datetime('decidedAt', 'Decided At'),
    statusField([['Proposed', 'info'], ['Executed', 'success'], ['Abandoned', 'secondary']])
  ]),
  entity('disruption-cost-analysis', 'Cost Analysis', 'Disruption Cost Analysis', 'pi-chart-bar', 'Total cost of a disruption across care, compensation and recovery.', [
    f('analysisNo', 'Analysis No.'),
    f('eventNo', 'Event No.'),
    money('careCost', 'Duty of Care Cost'),
    money('compensationCost', 'Compensation Cost'),
    money('recoveryCost', 'Recovery Cost'),
    money('totalCost', 'Total Cost'),
    statusField([['Draft', 'secondary'], ['Final', 'success']])
  ]),
  entity('passenger-notification-log', 'Notification', 'Passenger Notification Log', 'pi-send', 'Disruption notifications sent to passengers and the channel used.', [
    f('notificationNo', 'Notification No.'),
    f('pnr', 'PNR'),
    choice('channel', 'Channel', ['SMS', 'Email', 'Push', 'Airport Announcement', 'Call']),
    datetime('sentAt', 'Sent At'),
    statusField([['Queued', 'info'], ['Delivered', 'success'], ['Failed', 'danger']])
  ]),

  // ═══════════════════ Workflow & Approvals ═══════════════════
  entity('approval-requests', 'Request', 'Approval Requests', 'pi-check-square', 'Items awaiting approval across every module.', [
    f('requestNo', 'Request No.'),
    choice('documentType', 'Document Type', ['Purchase Order', 'Purchase Request', 'Leave', 'Work Order', 'Payment', 'Contract', 'Access Change']),
    f('documentRef', 'Document Ref.'),
    f('requestedBy', 'Requested By'),
    money('amount', 'Amount'),
    datetime('submittedAt', 'Submitted At'),
    statusField([['Pending', 'warn'], ['Approved', 'success'], ['Rejected', 'danger'], ['Withdrawn', 'secondary']])
  ]),
  entity('my-approvals', 'My Approval', 'My Approvals', 'pi-user-edit', 'Requests currently sitting in the signed-in approver’s queue.', [
    f('requestNo', 'Request No.'),
    f('documentType', 'Document Type'),
    f('requestedBy', 'Requested By'),
    num('stepNo', 'Step'),
    datetime('dueAt', 'Due At'),
    statusField([['Awaiting Me', 'warn'], ['Escalated', 'danger'], ['Actioned', 'success']])
  ]),
  entity('approval-matrix', 'Matrix Rule', 'Approval Matrix', 'pi-table', 'Who approves what, at which value threshold.', [
    f('matrixCode', 'Matrix Code'),
    f('documentType', 'Document Type'),
    money('minAmount', 'From Amount'),
    money('maxAmount', 'To Amount'),
    f('approverRole', 'Approver Role'),
    num('stepNo', 'Step'),
    statusField([['Active', 'success'], ['Draft', 'info'], ['Retired', 'secondary']])
  ]),
  entity('workflow-templates', 'Template', 'Workflow Templates', 'pi-sitemap', 'Reusable approval chains applied to a document type.', [
    f('templateCode', 'Template Code'),
    f('templateName', 'Template Name'),
    f('documentType', 'Document Type'),
    num('stepCount', 'Steps'),
    optional('description', 'Description', 'textarea'),
    statusField([['Active', 'success'], ['Draft', 'info'], ['Retired', 'secondary']])
  ]),
  entity('delegation-rules', 'Delegation', 'Delegation Rules', 'pi-user-plus', 'Temporary transfer of approval authority during absence.', [
    f('delegationNo', 'Delegation No.'),
    f('fromApprover', 'From Approver'),
    f('toApprover', 'To Approver'),
    date('validFrom', 'Valid From'),
    date('validTo', 'Valid To'),
    optional('reason', 'Reason'),
    statusField([['Scheduled', 'info'], ['Active', 'success'], ['Expired', 'secondary']])
  ]),
  entity('escalation-rules', 'Escalation', 'Escalation Rules', 'pi-arrow-up-right', 'What happens when an approval step breaches its deadline.', [
    f('ruleCode', 'Rule Code'),
    f('documentType', 'Document Type'),
    num('escalateAfterHours', 'Escalate After', { suffix: 'hrs' }),
    f('escalateTo', 'Escalate To'),
    choice('action', 'Action', ['Notify', 'Reassign', 'Auto-Approve', 'Auto-Reject']),
    statusField([['Active', 'success'], ['Paused', 'warn']])
  ]),
  entity('approval-history', 'History Entry', 'Approval History', 'pi-history', 'Immutable record of every approval decision taken.', [
    f('entryNo', 'Entry No.'),
    f('requestNo', 'Request No.'),
    f('actionedBy', 'Actioned By'),
    choice('decision', 'Decision', ['Approved', 'Rejected', 'Returned', 'Delegated']),
    datetime('actionedAt', 'Actioned At'),
    optional('comment', 'Comment', 'textarea')
  ]),
  entity('approval-sla', 'SLA', 'Approval SLA', 'pi-stopwatch', 'Turnaround targets and breaches by document type.', [
    f('documentType', 'Document Type'),
    num('targetHours', 'Target', { suffix: 'hrs' }),
    num('averageHours', 'Average', { suffix: 'hrs' }),
    num('breaches', 'Breaches'),
    date('periodStart', 'Period Start'),
    statusField([['Meeting SLA', 'success'], ['At Risk', 'warn'], ['Breached', 'danger']])
  ]),

  // ═══════════════════ Continuing Airworthiness (CAMO) ═══════════════════
  entity('airworthiness-review', 'Review', 'Airworthiness Review', 'pi-verified', 'Annual airworthiness review of each aircraft under Part-M.', [
    f('reviewNo', 'Review No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('reviewDate', 'Review Date'),
    date('validUntil', 'Valid Until'),
    f('reviewer', 'Reviewer'),
    optional('findings', 'Findings', 'textarea'),
    statusField([['Valid', 'success'], ['Due Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('maintenance-programme', 'Programme', 'Maintenance Programme', 'pi-book', 'Approved aircraft maintenance programme and its revisions.', [
    f('programmeNo', 'Programme No.'),
    f('aircraftType', 'Aircraft Type'),
    f('revision', 'Revision'),
    date('approvalDate', 'Approval Date'),
    f('approvedBy', 'Approved By'),
    statusField([['Approved', 'success'], ['Under Revision', 'warn'], ['Superseded', 'secondary']])
  ]),
  entity('technical-records', 'Record', 'Technical Records', 'pi-folder', 'Continuing airworthiness records retained for each aircraft.', [
    f('recordNo', 'Record No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    choice('recordType', 'Record Type', ['Logbook', 'Component Card', 'Modification', 'Repair', 'Weight Schedule']),
    date('recordDate', 'Record Date'),
    date('retainUntil', 'Retain Until'),
    statusField([['Filed', 'success'], ['Pending', 'info'], ['Missing', 'danger']])
  ]),
  entity('deferred-defects', 'Deferred Defect', 'Deferred Defects', 'pi-clock', 'Defects deferred under MEL/CDL with their rectification deadline.', [
    f('defectNo', 'Defect No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('ataChapter', 'ATA Chapter'),
    choice('melCategory', 'MEL Category', ['A', 'B', 'C', 'D']),
    date('raisedDate', 'Raised Date'),
    date('rectifyBy', 'Rectify By'),
    optional('description', 'Description', 'textarea'),
    statusField([['Open', 'warn'], ['Extended', 'info'], ['Rectified', 'success'], ['Overdue', 'danger']])
  ]),
  entity('reliability-data', 'Reliability Record', 'Reliability Data', 'pi-chart-line', 'Component and system reliability metrics feeding the programme.', [
    f('recordNo', 'Record No.'),
    f('aircraftType', 'Aircraft Type'),
    f('ataChapter', 'ATA Chapter'),
    date('periodStart', 'Period Start'),
    num('removals', 'Removals'),
    num('mtburHours', 'MTBUR', { suffix: 'hrs' }),
    statusField([['Within Alert', 'success'], ['Alert Level', 'warn'], ['Above Alert', 'danger']])
  ]),
  entity('camo-exposition', 'Exposition', 'CAMO Exposition', 'pi-file', 'The CAMO exposition (CAME) and its controlled revisions.', [
    f('documentNo', 'Document No.'),
    f('revision', 'Revision'),
    date('effectiveDate', 'Effective Date'),
    f('approvedBy', 'Approved By'),
    optional('changeSummary', 'Change Summary', 'textarea'),
    statusField([['Current', 'success'], ['Under Revision', 'warn'], ['Superseded', 'secondary']])
  ]),
  entity('subcontractor-control', 'Subcontractor', 'Subcontractor Control', 'pi-building', 'Oversight of maintenance organisations working under the CAMO.', [
    f('contractorCode', 'Contractor Code'),
    f('contractorName', 'Contractor Name'),
    f('approvalRef', 'Approval Ref.'),
    choice('scope', 'Scope', ['Line Maintenance', 'Base Maintenance', 'Component', 'NDT', 'Engine']),
    date('auditDueDate', 'Audit Due'),
    statusField([['Approved', 'success'], ['Conditional', 'warn'], ['Suspended', 'danger']])
  ]),
  entity('arc-issuance', 'ARC', 'ARC Issuance', 'pi-verified', 'Airworthiness Review Certificates issued or recommended.', [
    f('arcNo', 'ARC No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('issueDate', 'Issue Date'),
    date('expiryDate', 'Expiry Date'),
    choice('issuedUnder', 'Issued Under', ['CAMO Privilege', 'Authority Issued', 'Recommendation']),
    statusField([['Valid', 'success'], ['Expiring', 'warn'], ['Expired', 'danger']])
  ]),

  // ═══════════════════ Aircraft Leasing & Finance ═══════════════════
  entity('lease-agreements', 'Lease', 'Lease Agreements', 'pi-file-edit', 'Aircraft and engine lease agreements and their key terms.', [
    f('leaseNo', 'Lease No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('lessor', 'Lessor'),
    choice('leaseType', 'Lease Type', ['Operating', 'Finance', 'Wet Lease', 'Damp Lease', 'ACMI']),
    date('leaseStart', 'Lease Start'),
    date('leaseEnd', 'Lease End'),
    money('monthlyRental', 'Monthly Rental'),
    statusField([['Active', 'success'], ['Expiring', 'warn'], ['Ended', 'secondary'], ['Under Negotiation', 'info']])
  ]),
  entity('lessor-management', 'Lessor', 'Lessor Management', 'pi-building-columns', 'Lessors and their portfolio with the airline.', [
    f('lessorCode', 'Lessor Code'),
    f('lessorName', 'Lessor Name'),
    f('contactPerson', 'Contact Person'),
    f('contactEmail', 'Contact Email', 'email'),
    num('aircraftCount', 'Aircraft on Lease'),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('maintenance-reserves', 'Reserve', 'Maintenance Reserves', 'pi-wallet', 'Reserve payments accrued to the lessor against future maintenance.', [
    f('reserveNo', 'Reserve No.'),
    f('leaseNo', 'Lease No.'),
    choice('reserveType', 'Reserve Type', ['Airframe', 'Engine', 'APU', 'Landing Gear', 'Thrust Reverser']),
    date('periodEnd', 'Period End'),
    money('accruedAmount', 'Accrued'),
    money('claimedAmount', 'Claimed'),
    statusField([['Accruing', 'info'], ['Claim Submitted', 'warn'], ['Reimbursed', 'success']])
  ]),
  entity('lease-payments', 'Payment', 'Lease Payments', 'pi-credit-card', 'Rental and supplemental payments due under each lease.', [
    f('paymentNo', 'Payment No.'),
    f('leaseNo', 'Lease No.'),
    date('dueDate', 'Due Date'),
    money('amount', 'Amount'),
    choice('paymentType', 'Payment Type', ['Rental', 'Reserve', 'Security Deposit', 'Adjustment']),
    statusField([['Due', 'info'], ['Paid', 'success'], ['Overdue', 'danger']])
  ]),
  entity('aircraft-delivery', 'Delivery', 'Delivery & Acceptance', 'pi-download', 'Technical acceptance of an aircraft on delivery.', [
    f('deliveryNo', 'Delivery No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('deliveryDate', 'Delivery Date'),
    f('deliveryLocation', 'Delivery Location'),
    f('acceptedBy', 'Accepted By'),
    optional('discrepancies', 'Discrepancies', 'textarea'),
    statusField([['Planned', 'info'], ['Accepted', 'success'], ['Conditional', 'warn']])
  ]),
  entity('redelivery-planning', 'Redelivery', 'Redelivery Planning', 'pi-upload', 'Work required to return an aircraft in contractual condition.', [
    f('redeliveryNo', 'Redelivery No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('plannedDate', 'Planned Date'),
    num('openItems', 'Open Items'),
    money('estimatedCost', 'Estimated Cost'),
    statusField([['Planning', 'info'], ['In Progress', 'warn'], ['Complete', 'success']])
  ]),
  entity('return-conditions', 'Condition', 'Return Conditions', 'pi-list-check', 'Contractual redelivery conditions and their compliance status.', [
    f('conditionNo', 'Condition No.'),
    f('leaseNo', 'Lease No.'),
    choice('category', 'Category', ['Airframe', 'Engine', 'Records', 'Cabin', 'Paint', 'Component']),
    optional('requirement', 'Requirement', 'textarea'),
    statusField([['Compliant', 'success'], ['Gap', 'warn'], ['Non-Compliant', 'danger']])
  ]),
  entity('lease-expiry-tracking', 'Expiry', 'Lease Expiry Tracking', 'pi-calendar-times', 'Upcoming lease expiries and the decision required.', [
    f('leaseNo', 'Lease No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('expiryDate', 'Expiry Date'),
    num('monthsRemaining', 'Months Remaining'),
    choice('decision', 'Decision', ['Extend', 'Return', 'Purchase', 'Undecided']),
    statusField([['On Track', 'success'], ['Decision Due', 'warn'], ['Overdue', 'danger']])
  ]),
  entity('sublease-management', 'Sublease', 'Sublease Management', 'pi-share-alt', 'Aircraft subleased out to another operator.', [
    f('subleaseNo', 'Sublease No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('sublessee', 'Sublessee'),
    date('startDate', 'Start Date'),
    date('endDate', 'End Date'),
    money('monthlyRental', 'Monthly Rental'),
    statusField([['Active', 'success'], ['Ended', 'secondary'], ['Pending Consent', 'warn']])
  ]),
  entity('aircraft-valuation', 'Valuation', 'Aircraft Valuation', 'pi-chart-line', 'Independent market and base value appraisals.', [
    f('valuationNo', 'Valuation No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    date('valuationDate', 'Valuation Date'),
    f('appraiser', 'Appraiser'),
    money('marketValue', 'Market Value'),
    money('baseValue', 'Base Value'),
    statusField([['Current', 'success'], ['Superseded', 'secondary']])
  ]),

  // ═══════════════════ Flight Planning & Dispatch ═══════════════════
  entity('operational-flight-plan', 'OFP', 'Operational Flight Plan', 'pi-file', 'Computed flight plan issued to the crew for each sector.', [
    f('ofpNo', 'OFP No.'),
    f('flightNo', 'Flight No.'),
    f('route', 'Route'),
    datetime('validFrom', 'Valid From'),
    num('tripFuelKg', 'Trip Fuel', { suffix: 'kg' }),
    num('flightLevel', 'Flight Level'),
    f('dispatcher', 'Dispatcher'),
    statusField([['Draft', 'secondary'], ['Filed', 'info'], ['Released', 'success'], ['Superseded', 'warn']])
  ]),
  entity('route-optimization', 'Optimisation', 'Route Optimization', 'pi-map', 'Alternative routings compared on time, fuel and overflight cost.', [
    f('analysisNo', 'Analysis No.'),
    f('route', 'Route'),
    f('proposedRouting', 'Proposed Routing'),
    num('fuelSavingKg', 'Fuel Saving', { suffix: 'kg' }),
    num('timeSavingMinutes', 'Time Saving', { suffix: 'min' }),
    money('costSaving', 'Cost Saving'),
    statusField([['Proposed', 'info'], ['Adopted', 'success'], ['Rejected', 'secondary']])
  ]),
  entity('notam-management', 'NOTAM', 'NOTAM Management', 'pi-megaphone', 'NOTAMs relevant to the network and their operational impact.', [
    f('notamId', 'NOTAM ID'),
    f('airport', 'Airport'),
    choice('category', 'Category', ['Runway', 'Taxiway', 'Navaid', 'Airspace', 'Obstacle', 'Services']),
    datetime('validFrom', 'Valid From'),
    datetime('validTo', 'Valid To'),
    optional('summary', 'Summary', 'textarea'),
    statusField([['Active', 'warn'], ['Expired', 'secondary'], ['Cancelled', 'info']])
  ]),
  entity('weather-briefing', 'Briefing', 'Weather Briefing', 'pi-cloud', 'METAR, TAF and significant weather issued with the flight plan.', [
    f('briefingNo', 'Briefing No.'),
    f('flightNo', 'Flight No.'),
    f('airport', 'Airport'),
    datetime('issuedAt', 'Issued At'),
    choice('conditions', 'Conditions', ['CAVOK', 'Marginal', 'Below Minima', 'Convective', 'Winter Ops']),
    statusField([['Current', 'success'], ['Superseded', 'secondary']])
  ]),
  entity('etops-planning', 'ETOPS Plan', 'ETOPS Planning', 'pi-globe', 'Extended-range operations planning and adequate airport checks.', [
    f('planNo', 'Plan No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    num('etopsThresholdMinutes', 'ETOPS Threshold', { suffix: 'min' }),
    f('adequateAirports', 'Adequate Airports'),
    statusField([['Approved', 'success'], ['Under Review', 'warn'], ['Not Approved', 'danger']])
  ]),
  entity('alternate-airports', 'Alternate', 'Alternate Airports', 'pi-map-marker', 'Destination and en-route alternates with their suitability.', [
    f('airportCode', 'Airport Code'),
    f('airportName', 'Airport Name'),
    choice('alternateType', 'Alternate Type', ['Destination', 'En-route', 'Take-off', 'ETOPS']),
    num('runwayLengthM', 'Runway Length', { suffix: 'm' }),
    f('fireCategory', 'Fire Category'),
    statusField([['Suitable', 'success'], ['Restricted', 'warn'], ['Unsuitable', 'danger']])
  ]),
  entity('payload-range-analysis', 'Analysis', 'Payload/Range Analysis', 'pi-chart-bar', 'Payload achievable against sector distance and conditions.', [
    f('analysisNo', 'Analysis No.'),
    f('aircraftType', 'Aircraft Type'),
    f('route', 'Route'),
    num('distanceNm', 'Distance', { suffix: 'NM' }),
    num('maxPayloadKg', 'Max Payload', { suffix: 'kg' }),
    num('payloadPenaltyKg', 'Payload Penalty', { suffix: 'kg' }),
    statusField([['No Restriction', 'success'], ['Payload Limited', 'warn'], ['Range Limited', 'danger']])
  ]),
  entity('overflight-permits', 'Permit', 'Overflight Permits', 'pi-verified', 'Overflight and landing permits by state.', [
    f('permitNo', 'Permit No.'),
    f('country', 'Country'),
    choice('permitType', 'Permit Type', ['Overflight', 'Landing', 'Technical Stop', 'Charter']),
    date('validFrom', 'Valid From'),
    date('validTo', 'Valid To'),
    money('permitFee', 'Permit Fee'),
    statusField([['Granted', 'success'], ['Applied', 'info'], ['Expired', 'secondary'], ['Refused', 'danger']])
  ]),
  entity('navigation-database', 'NavDB Cycle', 'Navigation Database', 'pi-database', 'AIRAC navigation database cycles loaded to the fleet.', [
    f('cycleNo', 'AIRAC Cycle'),
    date('effectiveFrom', 'Effective From'),
    date('effectiveTo', 'Effective To'),
    num('aircraftLoaded', 'Aircraft Loaded'),
    num('aircraftPending', 'Aircraft Pending'),
    statusField([['Current', 'success'], ['Loading', 'warn'], ['Expired', 'secondary']])
  ]),
  entity('fuel-tankering', 'Tankering', 'Fuel Tankering', 'pi-bolt', 'Carrying extra fuel where uplift is cheaper at origin.', [
    f('analysisNo', 'Analysis No.'),
    f('flightNo', 'Flight No.'),
    f('route', 'Route'),
    num('extraFuelKg', 'Extra Fuel', { suffix: 'kg' }),
    money('netSaving', 'Net Saving'),
    num('extraCo2Kg', 'Extra CO₂', { suffix: 'kg' }),
    statusField([['Recommended', 'success'], ['Marginal', 'warn'], ['Not Recommended', 'danger']])
  ]),

  // ═══════════════════ Crew Training & Licensing ═══════════════════
  entity('training-programme', 'Programme', 'Training Programme', 'pi-book', 'Approved training programmes by fleet and crew role.', [
    f('programmeCode', 'Programme Code'),
    f('programmeName', 'Programme Name'),
    f('aircraftType', 'Aircraft Type'),
    choice('crewRole', 'Crew Role', ['Pilot', 'Cabin Crew', 'Dispatcher', 'Engineer']),
    date('approvalDate', 'Approval Date'),
    statusField([['Approved', 'success'], ['Under Revision', 'warn'], ['Withdrawn', 'secondary']])
  ]),
  entity('simulator-scheduling', 'Sim Session', 'Simulator Scheduling', 'pi-desktop', 'Simulator slots booked against training requirements.', [
    f('sessionNo', 'Session No.'),
    f('simulatorId', 'Simulator'),
    f('crewMember', 'Crew Member'),
    datetime('sessionStart', 'Session Start'),
    num('durationHours', 'Duration', { suffix: 'hrs' }),
    f('instructor', 'Instructor'),
    statusField([['Scheduled', 'info'], ['Completed', 'success'], ['Cancelled', 'secondary'], ['No Show', 'danger']])
  ]),
  entity('recurrent-training', 'Recurrent', 'Recurrent Training', 'pi-refresh', 'Recurring training and checking due per crew member.', [
    f('recordNo', 'Record No.'),
    f('crewMember', 'Crew Member'),
    choice('trainingType', 'Training Type', ['OPC', 'LPC', 'CRM', 'Dangerous Goods', 'SEP', 'Security']),
    date('lastCompleted', 'Last Completed'),
    date('nextDue', 'Next Due'),
    statusField([['Current', 'success'], ['Due Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('type-rating', 'Type Rating', 'Type Rating', 'pi-id-card', 'Aircraft type ratings held by each pilot.', [
    f('ratingNo', 'Rating No.'),
    f('pilotName', 'Pilot'),
    f('aircraftType', 'Aircraft Type'),
    date('issueDate', 'Issue Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring', 'warn'], ['Expired', 'danger']])
  ]),
  entity('line-check', 'Line Check', 'Line Check', 'pi-check-circle', 'Line checks flown under supervision and their outcome.', [
    f('checkNo', 'Check No.'),
    f('crewMember', 'Crew Member'),
    f('flightNo', 'Flight No.'),
    date('checkDate', 'Check Date'),
    f('checkAirman', 'Check Airman'),
    optional('comments', 'Comments', 'textarea'),
    statusField([['Passed', 'success'], ['Partial', 'warn'], ['Failed', 'danger']])
  ]),
  entity('instructor-management', 'Instructor', 'Instructor Management', 'pi-user-edit', 'Instructors and examiners with their authorisations.', [
    f('instructorNo', 'Instructor No.'),
    f('fullName', 'Full Name'),
    choice('qualification', 'Qualification', ['TRI', 'TRE', 'SFI', 'SFE', 'CRMI', 'Line Trainer']),
    date('authorisedUntil', 'Authorised Until'),
    statusField([['Active', 'success'], ['Expiring', 'warn'], ['Withdrawn', 'secondary']])
  ]),
  entity('competency-assessment', 'Assessment', 'Competency Assessment', 'pi-star', 'Evidence-based competency grading per crew member.', [
    f('assessmentNo', 'Assessment No.'),
    f('crewMember', 'Crew Member'),
    choice('competency', 'Competency', ['Knowledge', 'Procedures', 'Communication', 'Leadership', 'Situation Awareness', 'Workload Management']),
    num('score', 'Score', { min: 1, max: 5 }),
    date('assessedDate', 'Assessed Date'),
    statusField([['Meets Standard', 'success'], ['Development Needed', 'warn'], ['Below Standard', 'danger']])
  ]),
  entity('training-cost', 'Training Cost', 'Training Cost', 'pi-dollar', 'Cost of training by programme and crew member.', [
    f('costNo', 'Cost No.'),
    f('programmeCode', 'Programme'),
    f('crewMember', 'Crew Member'),
    date('periodEnd', 'Period End'),
    money('simulatorCost', 'Simulator Cost'),
    money('totalCost', 'Total Cost'),
    statusField([['Budgeted', 'info'], ['Incurred', 'success'], ['Over Budget', 'danger']])
  ]),
  entity('e-learning', 'Course', 'E-Learning', 'pi-desktop', 'Online courses assigned and their completion status.', [
    f('courseCode', 'Course Code'),
    f('courseName', 'Course Name'),
    f('assignedTo', 'Assigned To'),
    date('dueDate', 'Due Date'),
    num('completionPct', 'Completion', { suffix: '%', min: 0, max: 100 }),
    statusField([['Not Started', 'secondary'], ['In Progress', 'info'], ['Completed', 'success'], ['Overdue', 'danger']])
  ]),

  // ═══════════════════ Special Services (SSR/PRM) ═══════════════════
  entity('ssr-requests', 'SSR', 'SSR Requests', 'pi-list', 'Special service requests recorded against a booking.', [
    f('ssrNo', 'SSR No.'),
    f('pnr', 'PNR'),
    f('flightNo', 'Flight No.'),
    f('ssrCode', 'SSR Code'),
    f('passengerName', 'Passenger'),
    optional('remarks', 'Remarks', 'textarea'),
    statusField([['Requested', 'info'], ['Confirmed', 'success'], ['Unable', 'danger']])
  ]),
  entity('prm-assistance', 'PRM', 'PRM Assistance', 'pi-users', 'Assistance for passengers with reduced mobility.', [
    f('requestNo', 'Request No.'),
    f('pnr', 'PNR'),
    f('flightNo', 'Flight No.'),
    choice('assistanceCode', 'Assistance Code', ['WCHR', 'WCHS', 'WCHC', 'BLND', 'DEAF', 'DPNA']),
    f('meetingPoint', 'Meeting Point'),
    statusField([['Requested', 'info'], ['Assigned', 'warn'], ['Delivered', 'success'], ['Missed', 'danger']])
  ]),
  entity('unaccompanied-minor', 'UM', 'Unaccompanied Minor', 'pi-user', 'Unaccompanied minors and their handover arrangements.', [
    f('umNo', 'UM No.'),
    f('pnr', 'PNR'),
    f('childName', 'Child Name'),
    num('age', 'Age', { min: 0, max: 17 }),
    f('guardianAtOrigin', 'Guardian at Origin'),
    f('guardianAtDestination', 'Guardian at Destination'),
    statusField([['Booked', 'info'], ['In Transit', 'warn'], ['Handed Over', 'success']])
  ]),
  entity('medical-clearance', 'MEDIF', 'Medical Clearance', 'pi-heart', 'Medical clearance (MEDIF) for passengers requiring approval to fly.', [
    f('medifNo', 'MEDIF No.'),
    f('pnr', 'PNR'),
    f('passengerName', 'Passenger'),
    date('flightDate', 'Flight Date'),
    f('assessedBy', 'Assessed By'),
    optional('conditions', 'Conditions', 'textarea'),
    statusField([['Submitted', 'info'], ['Cleared', 'success'], ['Cleared with Conditions', 'warn'], ['Denied', 'danger']])
  ]),
  entity('service-animals', 'Service Animal', 'Service Animals', 'pi-heart-fill', 'Assistance and emotional support animals carried in cabin.', [
    f('requestNo', 'Request No.'),
    f('pnr', 'PNR'),
    choice('animalType', 'Animal Type', ['Guide Dog', 'Hearing Dog', 'Service Dog', 'Emotional Support']),
    f('documentationRef', 'Documentation Ref.'),
    date('flightDate', 'Flight Date'),
    statusField([['Requested', 'info'], ['Approved', 'success'], ['Declined', 'danger']])
  ]),
  entity('extra-seat-requests', 'Extra Seat', 'Extra Seat Requests', 'pi-th-large', 'Additional seats booked for comfort, size or equipment.', [
    f('requestNo', 'Request No.'),
    f('pnr', 'PNR'),
    choice('reason', 'Reason', ['Passenger Comfort', 'Medical Equipment', 'Musical Instrument', 'Cabin Baggage']),
    num('seatCount', 'Extra Seats'),
    money('charge', 'Charge'),
    statusField([['Requested', 'info'], ['Confirmed', 'success'], ['Declined', 'danger']])
  ]),
  entity('special-meals', 'Special Meal', 'Special Meals', 'pi-shopping-bag', 'Special meal orders by flight and passenger.', [
    f('orderNo', 'Order No.'),
    f('pnr', 'PNR'),
    f('flightNo', 'Flight No.'),
    f('mealCode', 'Meal Code'),
    num('quantity', 'Quantity'),
    statusField([['Ordered', 'info'], ['Confirmed', 'success'], ['Unavailable', 'danger']])
  ]),
  entity('wheelchair-allocation', 'Allocation', 'Wheelchair Allocation', 'pi-sitemap', 'Wheelchair and buggy resources allocated to assistance requests.', [
    f('allocationNo', 'Allocation No.'),
    f('requestNo', 'Request No.'),
    f('equipmentId', 'Equipment ID'),
    f('agent', 'Agent'),
    datetime('allocatedAt', 'Allocated At'),
    statusField([['Allocated', 'info'], ['In Use', 'warn'], ['Returned', 'success']])
  ]),
  entity('ssr-performance', 'Performance', 'SSR Performance', 'pi-chart-line', 'Delivery performance against assistance service standards.', [
    f('periodCode', 'Period'),
    f('station', 'Station'),
    num('requestsHandled', 'Requests Handled'),
    num('withinStandard', 'Within Standard'),
    num('compliancePct', 'Compliance', { suffix: '%' }),
    statusField([['Meeting Standard', 'success'], ['At Risk', 'warn'], ['Below Standard', 'danger']])
  ]),

  // ═══════════════════ Aviation Security (AVSEC) ═══════════════════
  entity('security-programme', 'Programme', 'Security Programme', 'pi-shield', 'Approved aviation security programme and its revisions.', [
    f('programmeNo', 'Programme No.'),
    f('scope', 'Scope'),
    f('revision', 'Revision'),
    date('approvalDate', 'Approval Date'),
    f('approvedBy', 'Approved By'),
    statusField([['Approved', 'success'], ['Under Revision', 'warn'], ['Superseded', 'secondary']])
  ]),
  entity('background-vetting', 'Vetting', 'Background Vetting', 'pi-user-edit', 'Background checks required for airside and restricted-area access.', [
    f('vettingNo', 'Vetting No.'),
    f('employeeName', 'Employee'),
    choice('checkType', 'Check Type', ['Criminal Record', 'Employment History', 'Identity', 'Right to Work']),
    date('completedDate', 'Completed Date'),
    date('validUntil', 'Valid Until'),
    statusField([['Cleared', 'success'], ['In Progress', 'info'], ['Failed', 'danger'], ['Expired', 'warn']])
  ]),
  entity('restricted-area-permits', 'Permit', 'Restricted Area Permits', 'pi-key', 'Permits granting access to security restricted areas.', [
    f('permitNo', 'Permit No.'),
    f('holderName', 'Holder'),
    f('areaCode', 'Area Code'),
    date('issueDate', 'Issue Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Active', 'success'], ['Expiring', 'warn'], ['Revoked', 'danger'], ['Expired', 'secondary']])
  ]),
  entity('staff-id-cards', 'ID Card', 'Staff ID Cards', 'pi-id-card', 'Airport identification cards issued to staff and contractors.', [
    f('cardNo', 'Card No.'),
    f('holderName', 'Holder'),
    f('company', 'Company'),
    date('issueDate', 'Issue Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Issued', 'success'], ['Expiring', 'warn'], ['Lost', 'danger'], ['Returned', 'secondary']])
  ]),
  entity('security-training', 'Training', 'Security Training', 'pi-graduation-cap', 'AVSEC training completed by staff, with recurrency.', [
    f('recordNo', 'Record No.'),
    f('employeeName', 'Employee'),
    choice('courseType', 'Course Type', ['Security Awareness', 'Screener Initial', 'Screener Recurrent', 'Supervisor', 'Cargo Security']),
    date('completedDate', 'Completed Date'),
    date('nextDue', 'Next Due'),
    statusField([['Current', 'success'], ['Due Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('passenger-screening', 'Screening', 'Passenger Screening', 'pi-search', 'Passenger and cabin baggage screening throughput and alarms.', [
    f('recordNo', 'Record No.'),
    f('checkpoint', 'Checkpoint'),
    date('screeningDate', 'Date'),
    num('passengersScreened', 'Passengers Screened'),
    num('alarms', 'Alarms'),
    num('prohibitedItems', 'Prohibited Items'),
    statusField([['Normal', 'success'], ['Elevated', 'warn'], ['Incident', 'danger']])
  ]),
  entity('cargo-screening', 'Cargo Screening', 'Cargo Screening', 'pi-inbox', 'Screening of cargo and mail before loading.', [
    f('recordNo', 'Record No.'),
    f('awbNo', 'AWB No.'),
    choice('method', 'Method', ['X-Ray', 'EDS', 'ETD', 'Physical Search', 'Known Consignor']),
    datetime('screenedAt', 'Screened At'),
    f('screener', 'Screener'),
    statusField([['Cleared', 'success'], ['Rescreen', 'warn'], ['Rejected', 'danger']])
  ]),
  entity('threat-assessment', 'Assessment', 'Threat Assessment', 'pi-exclamation-triangle', 'Assessed threats and the security level applied in response.', [
    f('assessmentNo', 'Assessment No.'),
    date('assessmentDate', 'Assessment Date'),
    f('scope', 'Scope'),
    choice('threatLevel', 'Threat Level', ['Low', 'Moderate', 'Substantial', 'Severe', 'Critical']),
    optional('measures', 'Measures Applied', 'textarea'),
    statusField([['Active', 'warn'], ['Closed', 'success'], ['Under Review', 'info']])
  ]),

  // ═══════════════════ Ground Handling Agreements ═══════════════════
  entity('sgha-agreements', 'SGHA', 'SGHA Agreements', 'pi-file-edit', 'IATA Standard Ground Handling Agreements with handlers.', [
    f('agreementNo', 'Agreement No.'),
    f('handler', 'Handler'),
    f('station', 'Station'),
    date('effectiveFrom', 'Effective From'),
    date('effectiveTo', 'Effective To'),
    f('sghaVersion', 'SGHA Version'),
    statusField([['Active', 'success'], ['Expiring', 'warn'], ['Terminated', 'secondary'], ['Under Negotiation', 'info']])
  ]),
  entity('handling-service-levels', 'SLA', 'Service Level Agreements', 'pi-stopwatch', 'Agreed service levels and measured performance per station.', [
    f('slaNo', 'SLA No.'),
    f('handler', 'Handler'),
    f('station', 'Station'),
    f('serviceMetric', 'Service Metric'),
    num('targetPct', 'Target', { suffix: '%' }),
    num('achievedPct', 'Achieved', { suffix: '%' }),
    statusField([['Meeting SLA', 'success'], ['At Risk', 'warn'], ['Breached', 'danger']])
  ]),
  entity('handling-rates', 'Rate', 'Handling Rates', 'pi-dollar', 'Contracted handling rates by aircraft type and service.', [
    f('rateNo', 'Rate No.'),
    f('handler', 'Handler'),
    f('station', 'Station'),
    f('aircraftType', 'Aircraft Type'),
    money('turnaroundRate', 'Turnaround Rate'),
    date('validFrom', 'Valid From'),
    statusField([['Active', 'success'], ['Superseded', 'secondary'], ['Draft', 'info']])
  ]),
  entity('station-handling-scope', 'Scope', 'Station Handling Scope', 'pi-list-check', 'Which Annex A services each handler provides at each station.', [
    f('scopeNo', 'Scope No.'),
    f('station', 'Station'),
    f('handler', 'Handler'),
    choice('serviceSection', 'Service Section', ['Representation', 'Load Control', 'Passenger', 'Ramp', 'Cargo', 'Fuel', 'Security', 'Maintenance']),
    statusField([['Contracted', 'success'], ['Excluded', 'secondary'], ['Optional', 'info']])
  ]),
  entity('gse-provision', 'GSE Provision', 'GSE Provision', 'pi-truck', 'Ground support equipment provided under the handling agreement.', [
    f('provisionNo', 'Provision No.'),
    f('handler', 'Handler'),
    f('station', 'Station'),
    f('equipmentType', 'Equipment Type'),
    num('unitsProvided', 'Units Provided'),
    statusField([['Available', 'success'], ['Partial', 'warn'], ['Unavailable', 'danger']])
  ]),
  entity('handler-performance', 'Performance', 'Handler Performance', 'pi-chart-bar', 'Handler performance scorecard by station and period.', [
    f('scorecardNo', 'Scorecard No.'),
    f('handler', 'Handler'),
    f('station', 'Station'),
    date('periodEnd', 'Period End'),
    num('onTimePerformancePct', 'On-Time', { suffix: '%' }),
    num('damageIncidents', 'Damage Incidents'),
    statusField([['Good', 'success'], ['Monitor', 'warn'], ['Underperforming', 'danger']])
  ]),
  entity('handling-invoices', 'Invoice', 'Handling Invoices', 'pi-credit-card', 'Handling invoices matched against contracted rates.', [
    f('invoiceNo', 'Invoice No.'),
    f('handler', 'Handler'),
    f('station', 'Station'),
    date('invoiceDate', 'Invoice Date'),
    money('invoicedAmount', 'Invoiced Amount'),
    money('approvedAmount', 'Approved Amount'),
    statusField([['Received', 'info'], ['Approved', 'success'], ['Disputed', 'danger'], ['Paid', 'secondary']])
  ]),
  entity('handling-disputes', 'Dispute', 'Dispute Management', 'pi-comment', 'Commercial disputes raised against handling invoices or service.', [
    f('disputeNo', 'Dispute No.'),
    f('handler', 'Handler'),
    f('invoiceNo', 'Invoice No.'),
    money('disputedAmount', 'Disputed Amount'),
    date('raisedDate', 'Raised Date'),
    optional('reason', 'Reason', 'textarea'),
    statusField(OPEN_CLOSED)
  ]),
  entity('annex-b-locations', 'Annex B', 'Annex B Locations', 'pi-map-marker', 'Station-specific Annex B addenda to the main agreement.', [
    f('annexNo', 'Annex No.'),
    f('agreementNo', 'Agreement No.'),
    f('station', 'Station'),
    date('effectiveFrom', 'Effective From'),
    optional('specialTerms', 'Special Terms', 'textarea'),
    statusField([['Active', 'success'], ['Superseded', 'secondary']])
  ]),
  entity('handler-audit', 'Audit', 'Handler Audit', 'pi-search', 'Station audits of ground handling providers.', [
    f('auditNo', 'Audit No.'),
    f('handler', 'Handler'),
    f('station', 'Station'),
    date('auditDate', 'Audit Date'),
    num('findings', 'Findings'),
    f('auditor', 'Auditor'),
    statusField([['Passed', 'success'], ['Findings Open', 'warn'], ['Failed', 'danger']])
  ]),

  // ═══════════════════ Sustainability & Emissions ═══════════════════
  entity('emissions-monitoring', 'Emissions Record', 'Emissions Monitoring', 'pi-globe', 'CO₂ emissions computed per flight from fuel burn.', [
    f('recordNo', 'Record No.'),
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    num('fuelBurnKg', 'Fuel Burn', { suffix: 'kg' }),
    num('co2Tonnes', 'CO₂', { suffix: 't' }),
    num('co2PerPaxKm', 'CO₂ per Pax-km', { suffix: 'g' }),
    statusField([['Reported', 'success'], ['Provisional', 'info'], ['Verified', 'contrast']])
  ]),
  entity('corsia-reporting', 'CORSIA Report', 'CORSIA Reporting', 'pi-file', 'Offsetting obligations reported under ICAO CORSIA.', [
    f('reportNo', 'Report No.'),
    f('reportingYear', 'Reporting Year'),
    f('state', 'State'),
    num('co2Tonnes', 'CO₂', { suffix: 't' }),
    num('offsetRequirementTonnes', 'Offset Requirement', { suffix: 't' }),
    date('submissionDate', 'Submission Date'),
    statusField([['Draft', 'secondary'], ['Submitted', 'info'], ['Verified', 'success'], ['Rejected', 'danger']])
  ]),
  entity('eu-ets-reporting', 'ETS Report', 'EU ETS Reporting', 'pi-file', 'Emissions and allowance surrender under the EU ETS.', [
    f('reportNo', 'Report No.'),
    f('reportingYear', 'Reporting Year'),
    num('co2Tonnes', 'CO₂', { suffix: 't' }),
    num('allowancesSurrendered', 'Allowances Surrendered'),
    money('allowanceCost', 'Allowance Cost'),
    statusField([['Draft', 'secondary'], ['Submitted', 'info'], ['Verified', 'success']])
  ]),
  entity('fuel-efficiency', 'Efficiency Record', 'Fuel Efficiency', 'pi-chart-line', 'Fuel efficiency initiatives and the savings achieved.', [
    f('initiativeNo', 'Initiative No.'),
    f('initiativeName', 'Initiative Name'),
    choice('category', 'Category', ['Weight Reduction', 'Route Optimisation', 'Single Engine Taxi', 'APU Reduction', 'Engine Wash']),
    num('fuelSavedTonnes', 'Fuel Saved', { suffix: 't' }),
    money('costSaving', 'Cost Saving'),
    statusField([['Planned', 'info'], ['Active', 'success'], ['Completed', 'contrast']])
  ]),
  entity('saf-tracking', 'SAF Record', 'Sustainable Aviation Fuel', 'pi-bolt', 'SAF uplift, blend ratio and certification by station.', [
    f('recordNo', 'Record No.'),
    f('station', 'Station'),
    date('upliftDate', 'Uplift Date'),
    num('safVolumeLitres', 'SAF Volume', { suffix: 'L' }),
    num('blendPct', 'Blend Ratio', { suffix: '%' }),
    num('co2ReductionTonnes', 'CO₂ Reduction', { suffix: 't' }),
    statusField([['Certified', 'success'], ['Pending Certification', 'warn']])
  ]),
  entity('carbon-offsets', 'Offset', 'Carbon Offsets', 'pi-globe', 'Offset units purchased and retired against emissions.', [
    f('offsetNo', 'Offset No.'),
    f('projectName', 'Project Name'),
    choice('standard', 'Standard', ['Gold Standard', 'VCS', 'CDM', 'CORSIA Eligible']),
    num('unitsTonnes', 'Units', { suffix: 't' }),
    money('cost', 'Cost'),
    date('retirementDate', 'Retirement Date'),
    statusField([['Purchased', 'info'], ['Retired', 'success'], ['Cancelled', 'secondary']])
  ]),
  entity('noise-monitoring', 'Noise Record', 'Noise Monitoring', 'pi-volume-up', 'Noise measurements and quota count against airport limits.', [
    f('recordNo', 'Record No.'),
    f('airport', 'Airport'),
    date('measurementDate', 'Measurement Date'),
    num('noiseLevelDb', 'Noise Level', { suffix: 'dB' }),
    num('quotaCount', 'Quota Count'),
    statusField([['Within Limit', 'success'], ['Near Limit', 'warn'], ['Exceeded', 'danger']])
  ]),
  entity('energy-consumption', 'Consumption', 'Energy Consumption', 'pi-bolt', 'Ground energy consumption by facility and source.', [
    f('recordNo', 'Record No.'),
    f('facility', 'Facility'),
    date('periodEnd', 'Period End'),
    choice('energySource', 'Energy Source', ['Grid Electricity', 'Renewable', 'Natural Gas', 'Diesel']),
    num('consumptionKwh', 'Consumption', { suffix: 'kWh' }),
    num('co2Tonnes', 'CO₂', { suffix: 't' }),
    statusField([['On Target', 'success'], ['Above Target', 'warn']])
  ]),
  entity('esg-reporting', 'ESG Report', 'ESG Reporting', 'pi-chart-bar', 'Environmental, social and governance disclosures.', [
    f('reportNo', 'Report No.'),
    f('reportingPeriod', 'Reporting Period'),
    choice('framework', 'Framework', ['GRI', 'SASB', 'TCFD', 'CSRD', 'Internal']),
    date('publicationDate', 'Publication Date'),
    f('preparedBy', 'Prepared By'),
    statusField([['Draft', 'secondary'], ['Under Review', 'info'], ['Published', 'success']])
  ]),

  // ═══════════════════ Ancillary Revenue & Retailing ═══════════════════
  entity('ancillary-products', 'Product', 'Ancillary Products', 'pi-shopping-bag', 'Catalogue of chargeable ancillary products.', [
    f('productCode', 'Product Code'),
    f('productName', 'Product Name'),
    choice('category', 'Category', ['Seat', 'Baggage', 'Meal', 'Lounge', 'Insurance', 'Upgrade', 'Connectivity']),
    money('price', 'Price'),
    date('validFrom', 'Valid From'),
    statusField([['Active', 'success'], ['Draft', 'info'], ['Withdrawn', 'secondary']])
  ]),
  entity('seat-selection-fees', 'Seat Fee', 'Seat Selection Fees', 'pi-th-large', 'Seat selection revenue by zone and flight.', [
    f('recordNo', 'Record No.'),
    f('flightNo', 'Flight No.'),
    choice('seatZone', 'Seat Zone', ['Extra Legroom', 'Front Cabin', 'Exit Row', 'Standard', 'Rear Cabin']),
    num('seatsSold', 'Seats Sold'),
    money('revenue', 'Revenue'),
    statusField([['Open', 'success'], ['Closed', 'secondary']])
  ]),
  entity('baggage-fees', 'Baggage Fee', 'Baggage Fees', 'pi-briefcase', 'Excess and prepaid baggage revenue.', [
    f('recordNo', 'Record No.'),
    f('pnr', 'PNR'),
    f('flightNo', 'Flight No.'),
    choice('feeType', 'Fee Type', ['Prepaid Bag', 'Excess Weight', 'Extra Piece', 'Oversize', 'Sports Equipment']),
    money('amount', 'Amount'),
    statusField([['Charged', 'success'], ['Waived', 'warn'], ['Refunded', 'secondary']])
  ]),
  entity('upgrade-sales', 'Upgrade', 'Upgrade Sales', 'pi-arrow-up-right', 'Paid and bid cabin upgrades.', [
    f('upgradeNo', 'Upgrade No.'),
    f('pnr', 'PNR'),
    f('flightNo', 'Flight No.'),
    choice('upgradeType', 'Upgrade Type', ['Paid', 'Bid', 'Miles', 'Operational']),
    money('amount', 'Amount'),
    statusField([['Offered', 'info'], ['Accepted', 'success'], ['Declined', 'secondary']])
  ]),
  entity('lounge-access-sales', 'Lounge Sale', 'Lounge Access Sales', 'pi-building', 'Paid lounge access sold at booking or at the airport.', [
    f('saleNo', 'Sale No.'),
    f('pnr', 'PNR'),
    f('lounge', 'Lounge'),
    date('accessDate', 'Access Date'),
    money('amount', 'Amount'),
    statusField([['Sold', 'success'], ['Used', 'contrast'], ['Refunded', 'secondary']])
  ]),
  entity('travel-insurance-sales', 'Insurance Sale', 'Travel Insurance', 'pi-shield', 'Travel insurance policies sold alongside bookings.', [
    f('policyNo', 'Policy No.'),
    f('pnr', 'PNR'),
    f('provider', 'Provider'),
    money('premium', 'Premium'),
    money('commission', 'Commission'),
    statusField([['Sold', 'success'], ['Cancelled', 'secondary'], ['Claimed', 'warn']])
  ]),
  entity('partner-products', 'Partner Product', 'Car & Hotel Partners', 'pi-car', 'Third-party products sold through the booking flow.', [
    f('bookingNo', 'Booking No.'),
    f('pnr', 'PNR'),
    choice('productType', 'Product Type', ['Car Hire', 'Hotel', 'Transfer', 'Activity', 'Parking']),
    f('partner', 'Partner'),
    money('commission', 'Commission'),
    statusField([['Booked', 'success'], ['Cancelled', 'secondary']])
  ]),
  entity('bundles-packages', 'Bundle', 'Bundles & Packages', 'pi-box', 'Bundled fare families and ancillary packages.', [
    f('bundleCode', 'Bundle Code'),
    f('bundleName', 'Bundle Name'),
    f('includedProducts', 'Included Products'),
    money('bundlePrice', 'Bundle Price'),
    num('discountPct', 'Discount', { suffix: '%' }),
    statusField([['Active', 'success'], ['Draft', 'info'], ['Withdrawn', 'secondary']])
  ]),
  entity('ancillary-performance', 'Performance', 'Ancillary Performance', 'pi-chart-line', 'Ancillary revenue per passenger by route and period.', [
    f('periodCode', 'Period'),
    f('route', 'Route'),
    money('ancillaryRevenue', 'Ancillary Revenue'),
    num('passengers', 'Passengers'),
    money('revenuePerPax', 'Revenue per Pax'),
    statusField([['Above Target', 'success'], ['On Target', 'info'], ['Below Target', 'warn']])
  ]),
  entity('commission-management', 'Commission', 'Commission Management', 'pi-percentage', 'Commission owed to partners and agencies on ancillary sales.', [
    f('commissionNo', 'Commission No.'),
    f('partner', 'Partner'),
    date('periodEnd', 'Period End'),
    money('salesValue', 'Sales Value'),
    num('commissionRatePct', 'Rate', { suffix: '%' }),
    money('commissionAmount', 'Commission Amount'),
    statusField([['Accrued', 'info'], ['Paid', 'success'], ['Disputed', 'danger']])
  ]),

  // ═══════════════════ Distribution (GDS / NDC) ═══════════════════
  entity('gds-connectivity', 'GDS Link', 'GDS Connectivity', 'pi-share-alt', 'Global distribution system connections and their status.', [
    f('connectionNo', 'Connection No.'),
    choice('gds', 'GDS', ['Amadeus', 'Sabre', 'Travelport', 'TravelSky']),
    choice('participationLevel', 'Participation Level', ['Full Content', 'Basic Booking', 'Availability Only']),
    date('effectiveFrom', 'Effective From'),
    statusField([['Live', 'success'], ['Testing', 'info'], ['Suspended', 'danger']])
  ]),
  entity('ndc-offers', 'Offer', 'NDC Offers', 'pi-tag', 'NDC offers generated in response to shopping requests.', [
    f('offerId', 'Offer ID'),
    f('requestId', 'Request ID'),
    f('route', 'Route'),
    money('offerPrice', 'Offer Price'),
    datetime('expiresAt', 'Expires At'),
    statusField([['Open', 'info'], ['Accepted', 'success'], ['Expired', 'secondary']])
  ]),
  entity('ndc-orders', 'Order', 'NDC Orders', 'pi-shopping-cart', 'Orders created from accepted NDC offers.', [
    f('orderId', 'Order ID'),
    f('offerId', 'Offer ID'),
    f('pnr', 'PNR'),
    money('orderValue', 'Order Value'),
    datetime('createdAt', 'Created At'),
    statusField([['Created', 'info'], ['Ticketed', 'success'], ['Cancelled', 'secondary'], ['Failed', 'danger']])
  ]),
  entity('channel-management', 'Channel', 'Channel Management', 'pi-sitemap', 'Sales channels, their content rules and cost to serve.', [
    f('channelCode', 'Channel Code'),
    f('channelName', 'Channel Name'),
    choice('channelType', 'Channel Type', ['Direct Web', 'Mobile App', 'Call Centre', 'GDS', 'NDC API', 'Agency Portal']),
    num('sharePct', 'Share of Sales', { suffix: '%' }),
    statusField([['Active', 'success'], ['Restricted', 'warn'], ['Closed', 'secondary']])
  ]),
  entity('agency-management', 'Agency', 'Agency Management', 'pi-building', 'Travel agencies, their IATA numbers and trading terms.', [
    f('agencyCode', 'Agency Code'),
    f('agencyName', 'Agency Name'),
    f('iataNumber', 'IATA Number'),
    f('country', 'Country'),
    num('commissionRatePct', 'Commission', { suffix: '%' }),
    statusField([['Active', 'success'], ['On Hold', 'warn'], ['Terminated', 'danger']])
  ]),
  entity('api-partners', 'API Partner', 'API Partners', 'pi-link', 'Partners consuming the airline’s booking APIs.', [
    f('partnerCode', 'Partner Code'),
    f('partnerName', 'Partner Name'),
    f('contactEmail', 'Contact Email', 'email'),
    num('monthlyCallVolume', 'Monthly Calls'),
    date('agreementDate', 'Agreement Date'),
    statusField([['Live', 'success'], ['Onboarding', 'info'], ['Suspended', 'danger']])
  ]),
  entity('distribution-cost', 'Cost Record', 'Distribution Cost', 'pi-dollar', 'Cost per booking by channel, including GDS and payment fees.', [
    f('recordNo', 'Record No.'),
    f('channelCode', 'Channel'),
    date('periodEnd', 'Period End'),
    num('bookings', 'Bookings'),
    money('totalCost', 'Total Cost'),
    money('costPerBooking', 'Cost per Booking'),
    statusField([['Within Budget', 'success'], ['Above Budget', 'warn']])
  ]),
  entity('booking-source-analysis', 'Source Analysis', 'Booking Source Analysis', 'pi-chart-bar', 'Where bookings originate and how they convert.', [
    f('periodCode', 'Period'),
    f('channelCode', 'Channel'),
    f('market', 'Market'),
    num('bookings', 'Bookings'),
    money('revenue', 'Revenue'),
    num('conversionPct', 'Conversion', { suffix: '%' }),
    statusField([['Growing', 'success'], ['Stable', 'info'], ['Declining', 'warn']])
  ]),
  entity('direct-channel-performance', 'Performance', 'Direct Channel Performance', 'pi-chart-line', 'Website and app performance against direct-sales targets.', [
    f('periodCode', 'Period'),
    choice('channel', 'Channel', ['Website', 'Mobile App', 'Call Centre']),
    num('visits', 'Visits'),
    num('bookings', 'Bookings'),
    num('conversionPct', 'Conversion', { suffix: '%' }),
    money('revenue', 'Revenue'),
    statusField([['Above Target', 'success'], ['On Target', 'info'], ['Below Target', 'warn']])
  ]),
  entity('fare-distribution-rules', 'Filing Rule', 'Fare Filing & Distribution', 'pi-cog', 'Which fares are filed to which channel and market.', [
    f('ruleCode', 'Rule Code'),
    f('fareBasis', 'Fare Basis'),
    f('channelCode', 'Channel'),
    f('market', 'Market'),
    date('filedDate', 'Filed Date'),
    statusField([['Filed', 'success'], ['Pending', 'info'], ['Withdrawn', 'secondary']])
  ]),

  // ═══════════════════ Self-Service Portals ═══════════════════
  entity('employee-self-service', 'ESS Request', 'Employee Self-Service', 'pi-user', 'Requests employees raise for themselves — payslips, details, letters.', [
    f('requestNo', 'Request No.'),
    f('employeeName', 'Employee'),
    choice('requestType', 'Request Type', ['Payslip', 'Leave Balance', 'Address Change', 'Bank Details', 'Employment Letter']),
    date('requestDate', 'Request Date'),
    statusField([['Submitted', 'info'], ['In Progress', 'warn'], ['Completed', 'success'], ['Rejected', 'danger']])
  ]),
  entity('vendor-portal', 'Vendor Account', 'Vendor Portal', 'pi-building', 'Vendor portal accounts and what each may see or submit.', [
    f('accountNo', 'Account No.'),
    f('vendorName', 'Vendor'),
    f('contactEmail', 'Contact Email', 'email'),
    choice('accessLevel', 'Access Level', ['View Orders', 'Submit Invoice', 'Full Self-Service']),
    date('lastLogin', 'Last Login'),
    statusField([['Active', 'success'], ['Locked', 'danger'], ['Pending Activation', 'info']])
  ]),
  entity('customer-portal', 'Customer Account', 'Customer Portal', 'pi-users', 'Corporate customer portal accounts and entitlements.', [
    f('accountNo', 'Account No.'),
    f('customerName', 'Customer'),
    f('contactEmail', 'Contact Email', 'email'),
    choice('accountTier', 'Account Tier', ['Standard', 'Corporate', 'Preferred', 'Strategic']),
    date('lastLogin', 'Last Login'),
    statusField([['Active', 'success'], ['Locked', 'danger'], ['Pending Activation', 'info']])
  ]),
  entity('portal-announcements', 'Announcement', 'Announcements', 'pi-megaphone', 'Notices published to portal audiences.', [
    f('announcementNo', 'Announcement No.'),
    f('title', 'Title'),
    choice('audience', 'Audience', ['Employees', 'Vendors', 'Customers', 'All']),
    date('publishDate', 'Publish Date'),
    date('expiryDate', 'Expiry Date'),
    optional('body', 'Body', 'textarea'),
    statusField([['Draft', 'secondary'], ['Published', 'success'], ['Expired', 'info']])
  ]),
  entity('portal-user-requests', 'Access Request', 'User Requests', 'pi-user-plus', 'Portal access and permission requests awaiting action.', [
    f('requestNo', 'Request No.'),
    f('requesterName', 'Requester'),
    choice('portal', 'Portal', ['Employee', 'Vendor', 'Customer']),
    choice('requestType', 'Request Type', ['New Account', 'Password Reset', 'Permission Change', 'Deactivation']),
    date('requestDate', 'Request Date'),
    statusField([['Pending', 'warn'], ['Approved', 'success'], ['Rejected', 'danger']])
  ]),
  entity('portal-content', 'Content Item', 'Content Management', 'pi-file-edit', 'Pages, documents and links published on the portals.', [
    f('contentNo', 'Content No.'),
    f('title', 'Title'),
    choice('contentType', 'Content Type', ['Page', 'Document', 'Link', 'FAQ', 'Form']),
    f('owner', 'Owner'),
    date('lastUpdated', 'Last Updated'),
    statusField([['Published', 'success'], ['Draft', 'info'], ['Archived', 'secondary']])
  ]),
  entity('portal-feedback', 'Feedback', 'Feedback', 'pi-comments', 'Feedback and ratings submitted through the portals.', [
    f('feedbackNo', 'Feedback No.'),
    f('submittedBy', 'Submitted By'),
    choice('portal', 'Portal', ['Employee', 'Vendor', 'Customer']),
    num('rating', 'Rating', { min: 1, max: 5 }),
    date('submittedDate', 'Submitted Date'),
    optional('comment', 'Comment', 'textarea'),
    statusField([['New', 'info'], ['Reviewed', 'success'], ['Actioned', 'contrast']])
  ]),
  entity('portal-access-log', 'Access Entry', 'Access Log', 'pi-history', 'Portal sign-in activity retained for review.', [
    f('entryNo', 'Entry No.'),
    f('username', 'Username'),
    choice('portal', 'Portal', ['Employee', 'Vendor', 'Customer']),
    datetime('accessedAt', 'Accessed At'),
    f('ipAddress', 'IP Address'),
    statusField([['Success', 'success'], ['Failed', 'danger'], ['Locked Out', 'warn']])
  ]),

  // ═══════════════════ Integration Hub ═══════════════════
  entity('interface-registry', 'Interface', 'Interface Registry', 'pi-sitemap', 'Every system interface, its direction and its owner.', [
    f('interfaceCode', 'Interface Code'),
    f('interfaceName', 'Interface Name'),
    f('counterparty', 'Counterparty'),
    choice('direction', 'Direction', ['Inbound', 'Outbound', 'Bidirectional']),
    choice('protocol', 'Protocol', ['REST', 'SOAP', 'SFTP', 'MQ', 'Type B', 'File Drop']),
    f('owner', 'Owner'),
    statusField([['Live', 'success'], ['Testing', 'info'], ['Retired', 'secondary'], ['Failing', 'danger']])
  ]),
  entity('message-queue-monitor', 'Queue', 'Message Queue Monitor', 'pi-list', 'Queue depth and throughput for asynchronous interfaces.', [
    f('queueName', 'Queue Name'),
    f('interfaceCode', 'Interface'),
    num('depth', 'Depth'),
    num('messagesPerHour', 'Messages/Hour'),
    num('oldestMessageMinutes', 'Oldest Message', { suffix: 'min' }),
    statusField([['Healthy', 'success'], ['Backlog', 'warn'], ['Stalled', 'danger']])
  ]),
  entity('type-b-messaging', 'Type B Message', 'IATA Type B Messaging', 'pi-envelope', 'Teletype messages exchanged with partners and airports.', [
    f('messageId', 'Message ID'),
    f('messageType', 'Message Type'),
    f('sender', 'Sender'),
    f('recipient', 'Recipient'),
    datetime('sentAt', 'Sent At'),
    statusField([['Sent', 'info'], ['Acknowledged', 'success'], ['Rejected', 'danger'], ['Queued', 'warn']])
  ]),
  entity('aidx-messaging', 'AIDX Message', 'AIDX Messaging', 'pi-sync', 'Flight data exchanged with airports in IATA AIDX format.', [
    f('messageId', 'Message ID'),
    f('flightNo', 'Flight No.'),
    f('airport', 'Airport'),
    choice('messageType', 'Message Type', ['Flight Leg', 'Update', 'Cancellation', 'Delay']),
    datetime('exchangedAt', 'Exchanged At'),
    statusField([['Delivered', 'success'], ['Pending', 'info'], ['Failed', 'danger']])
  ]),
  entity('api-endpoints', 'Endpoint', 'API Endpoints', 'pi-link', 'Published API endpoints, their version and consumers.', [
    f('endpointPath', 'Endpoint Path'),
    choice('method', 'Method', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    f('version', 'Version'),
    num('consumers', 'Consumers'),
    num('avgResponseMs', 'Avg Response', { suffix: 'ms' }),
    statusField([['Live', 'success'], ['Deprecated', 'warn'], ['Retired', 'secondary']])
  ]),
  entity('data-mapping', 'Mapping', 'Data Mapping', 'pi-arrow-right-arrow-left', 'Field-level mappings between internal and external formats.', [
    f('mappingCode', 'Mapping Code'),
    f('interfaceCode', 'Interface'),
    f('sourceField', 'Source Field'),
    f('targetField', 'Target Field'),
    optional('transformRule', 'Transform Rule'),
    statusField([['Active', 'success'], ['Draft', 'info'], ['Deprecated', 'secondary']])
  ]),
  entity('integration-errors', 'Error', 'Integration Errors', 'pi-exclamation-triangle', 'Failed exchanges awaiting investigation.', [
    f('errorNo', 'Error No.'),
    f('interfaceCode', 'Interface'),
    datetime('occurredAt', 'Occurred At'),
    choice('severity', 'Severity', ['Critical', 'Major', 'Minor', 'Warning']),
    optional('errorMessage', 'Error Message', 'textarea'),
    statusField(OPEN_CLOSED)
  ]),
  entity('retry-management', 'Retry', 'Retry Management', 'pi-replay', 'Automatic and manual retries of failed messages.', [
    f('retryNo', 'Retry No.'),
    f('messageId', 'Message ID'),
    f('interfaceCode', 'Interface'),
    num('attemptCount', 'Attempts'),
    datetime('nextAttemptAt', 'Next Attempt'),
    statusField([['Scheduled', 'info'], ['Succeeded', 'success'], ['Exhausted', 'danger'], ['Cancelled', 'secondary']])
  ]),
  entity('partner-connections', 'Connection', 'Partner Connections', 'pi-share-alt', 'Connectivity details and credentials rotation per partner.', [
    f('connectionNo', 'Connection No.'),
    f('partnerName', 'Partner'),
    choice('connectionType', 'Connection Type', ['VPN', 'SFTP', 'API Key', 'OAuth', 'MQ Channel']),
    date('credentialExpiry', 'Credential Expiry'),
    statusField([['Connected', 'success'], ['Expiring', 'warn'], ['Disconnected', 'danger']])
  ]),
  entity('etl-jobs', 'ETL Job', 'ETL Jobs', 'pi-database', 'Scheduled extract, transform and load jobs feeding reporting.', [
    f('jobCode', 'Job Code'),
    f('jobName', 'Job Name'),
    f('schedule', 'Schedule'),
    datetime('lastRunAt', 'Last Run'),
    num('durationMinutes', 'Duration', { suffix: 'min' }),
    num('rowsProcessed', 'Rows Processed'),
    statusField([['Succeeded', 'success'], ['Running', 'info'], ['Failed', 'danger'], ['Disabled', 'secondary']])
  ])
];
