import { EntityConfig } from '../models/entity-config.model';
import { choice, date, datetime, entity, f, file, lookup, money, num, statusField } from './entity-field-helpers';

/**
 * Entity configs for the "platform" layer added after the first 35 modules —
 * infrastructure the rest of the ERP leans on rather than another
 * operational desk:
 *
 *   master-data-management     the shared masters (airport, currency, aircraft
 *                               type…) that 'lookup' fields elsewhere reference
 *   workflow-approval-engine   the approval-chain configuration layer
 *   revenue-management         pricing/forecasting — commercially distinct
 *                               from Revenue Accounting's billing/settlement
 *   operations-control-center  the cross-functional live ops room (AOCC)
 *   crew-pairing-optimization  pairing/rostering optimization, distinct from
 *                               Crew Management's day-to-day roster CRUD
 *   slot-atfm-coordination     airport slots and ATFM regulation compliance
 *   integration-hub            management screens for external system
 *                               connections (GDS/NDC, SITA/ARINC, weather) —
 *                               readiness for the real API-binding phase, not
 *                               a live integration itself
 *
 * Plus deepening batches for five modules that were originally quite thin
 * (Notification System, Document Management, Passenger Reservation,
 * Compliance & Safety, Security Management) — see the bottom of this file.
 *
 * Same helpers and shape as entity-configs.ts / entity-configs-extended.ts;
 * concatenated into the same ENTITY_CONFIGS lookup there.
 */

export const PLATFORM_ENTITY_LIST: EntityConfig[] = [
  // ═══════════════════════ Master Data Management ═════════════════════════
  entity('airport-master', 'Airport', 'Airport / Station Master', 'pi-map-marker', 'The single record of truth for every airport/station referenced elsewhere in the system.', [
    f('iataCode', 'IATA Code', 'text', { maxLength: 3 }),
    f('icaoCode', 'ICAO Code', 'text', { maxLength: 4 }),
    f('airportName', 'Airport Name'),
    f('city', 'City'),
    lookup('country', 'Country', 'country-region-master', 'countryName'),
    f('timezone', 'Timezone', 'text', { required: false }),
    statusField([['Active', 'success'], ['Seasonal', 'warn'], ['Closed', 'danger']])
  ], 15),
  entity('aircraft-type-master', 'Aircraft Type', 'Aircraft Type Master', 'pi-compass', 'Reference data per aircraft type/variant — the type certificate, not a tail number.', [
    f('typeCode', 'Type Code'),
    f('manufacturer', 'Manufacturer'),
    f('model', 'Model'),
    num('seatingCapacity', 'Typical Seating', { max: 850 }),
    num('maxRangeNm', 'Max Range (NM)', { max: 9000 }),
    statusField([['Active', 'success'], ['Phasing Out', 'warn'], ['Retired', 'secondary']])
  ], 14),
  entity('carrier-airline-master', 'Carrier', 'Carrier / Airline Master', 'pi-send', 'Every airline we codeshare, interline or settle with — including ourselves.', [
    f('carrierCode', 'Carrier Code (IATA)', 'text', { maxLength: 2 }),
    f('icaoCarrierCode', 'Carrier Code (ICAO)', 'text', { required: false, maxLength: 3 }),
    f('carrierName', 'Carrier Name'),
    lookup('country', 'Home Country', 'country-region-master', 'countryName'),
    choice('allianceMembership', 'Alliance', ['None', 'Star Alliance', 'oneworld', 'SkyTeam']),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ], 16),
  entity('country-region-master', 'Country', 'Country & Region Master', 'pi-globe', 'ISO country reference data, with the region and default currency each supplier/buyer/airport rolls up to.', [
    f('countryCode', 'ISO Code', 'text', { maxLength: 2 }),
    f('countryName', 'Country Name'),
    choice('region', 'Region', ['North America', 'South America', 'Europe', 'Middle East', 'Africa', 'Asia', 'Oceania']),
    lookup('currency', 'Default Currency', 'currency-master', 'currencyCode'),
    statusField([['Active', 'success'], ['Restricted', 'warn'], ['Embargoed', 'danger']])
  ], 15),
  entity('currency-master', 'Currency', 'Currency Master', 'pi-dollar', 'ISO currency reference data — the target of every currency lookup and exchange rate in the system.', [
    f('currencyCode', 'Currency Code', 'text', { maxLength: 3 }),
    f('currencyName', 'Currency Name'),
    f('symbol', 'Symbol', 'text', { maxLength: 3 }),
    num('decimalPlaces', 'Decimal Places', { min: 0, max: 4 }),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ], 12),
  entity('exchange-rate-management', 'Exchange Rate', 'Exchange Rate Management', 'pi-sync', 'Daily conversion rates between currencies, for consistent multi-currency reporting.', [
    lookup('fromCurrency', 'From Currency', 'currency-master', 'currencyCode'),
    lookup('toCurrency', 'To Currency', 'currency-master', 'currencyCode'),
    num('rate', 'Rate', { max: 500 }),
    date('effectiveDate', 'Effective Date'),
    choice('source', 'Rate Source', ['Central Bank', 'IATA Rate of Exchange', 'Commercial Bank', 'Manual Entry']),
    statusField([['Current', 'success'], ['Superseded', 'secondary'], ['Pending Approval', 'warn']])
  ], 16),
  entity('unit-of-measure-master', 'UOM', 'Unit of Measure Master', 'pi-calculator', 'Weight, volume, length and count units used consistently across inventory, cargo and fuel.', [
    f('uomCode', 'UOM Code'),
    f('uomName', 'UOM Name'),
    choice('uomCategory', 'Category', ['Weight', 'Volume', 'Length', 'Count', 'Time', 'Temperature']),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ], 12),
  entity('language-locale-master', 'Language', 'Language & Locale Master', 'pi-globe', 'Supported UI languages and their date/number formatting conventions — foundation for future localization.', [
    f('languageCode', 'Language Code', 'text', { maxLength: 5 }),
    f('languageName', 'Language Name'),
    choice('dateFormat', 'Date Format', ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
    choice('numberFormat', 'Number Format', ['1,234.56', '1.234,56', '1 234,56']),
    statusField([['Enabled', 'success'], ['In Translation', 'warn'], ['Disabled', 'secondary']])
  ], 8),
  entity('holiday-calendar', 'Holiday', 'Holiday & Blackout Calendar', 'pi-calendar', 'Public holidays and commercial blackout dates, shared by crew rostering, sales and ops planning.', [
    f('holidayName', 'Holiday Name'),
    lookup('country', 'Country', 'country-region-master', 'countryName'),
    date('holidayDate', 'Date'),
    choice('holidayType', 'Type', ['Public Holiday', 'Religious Observance', 'Company Blackout', 'Peak Season']),
    statusField([['Confirmed', 'success'], ['Provisional', 'warn']])
  ], 16),
  entity('data-change-request', 'Change Request', 'Master Data Change Request', 'pi-file-edit', 'Governance workflow for editing a master record — propose, review, then apply.', [
    f('requestNo', 'Request No.'),
    choice('masterEntity', 'Master Entity', ['Airport', 'Aircraft Type', 'Carrier', 'Country', 'Currency', 'UOM', 'Exchange Rate']),
    f('recordReference', 'Record Reference'),
    f('changeDescription', 'Change Description', 'textarea'),
    f('requestedBy', 'Requested By'),
    file('supportingDocument', 'Supporting Document'),
    statusField([['Pending Review', 'info'], ['Approved', 'success'], ['Rejected', 'danger'], ['Applied', 'secondary']])
  ], 14),
  entity('master-data-audit-log', 'Audit Entry', 'Master Data Audit Log', 'pi-history', 'Who changed a master record and when — errors here cascade everywhere else, so this trail matters.', [
    f('logNo', 'Log No.'),
    choice('masterEntity', 'Master Entity', ['Airport', 'Aircraft Type', 'Carrier', 'Country', 'Currency', 'UOM', 'Exchange Rate']),
    f('recordReference', 'Record Reference'),
    choice('changeType', 'Change Type', ['Create', 'Update', 'Delete']),
    f('changedBy', 'Changed By'),
    datetime('changeTimestamp', 'Timestamp'),
    statusField([['Verified', 'success'], ['Flagged for Review', 'warn']])
  ], 18),

  // ═══════════════════════ Workflow & Approval Engine ══════════════════════
  entity('workflow-template', 'Workflow Template', 'Workflow Template', 'pi-sitemap', 'Reusable multi-step approval flow definitions — which document types use which chain.', [
    f('templateCode', 'Template Code'),
    f('templateName', 'Template Name'),
    f('appliesToModule', 'Applies To Module'),
    num('stepCount', 'Steps', { min: 1, max: 10 }),
    statusField([['Active', 'success'], ['Draft', 'info'], ['Retired', 'secondary']])
  ], 14),
  entity('approval-matrix', 'Approval Matrix', 'Approval Matrix', 'pi-table', 'Who can approve what, up to which value threshold.', [
    f('matrixCode', 'Matrix Code'),
    f('documentType', 'Document Type'),
    f('approverRole', 'Approver Role'),
    money('thresholdAmount', 'Approval Threshold'),
    num('approvalLevel', 'Level', { min: 1, max: 6 }),
    statusField([['Active', 'success'], ['Under Revision', 'warn'], ['Retired', 'secondary']])
  ], 16),
  entity('approval-step-configuration', 'Step Configuration', 'Approval Step Configuration', 'pi-list', 'Individual steps that make up a workflow template, in sequence.', [
    f('templateReference', 'Template Reference'),
    num('stepNumber', 'Step No.', { min: 1, max: 10 }),
    f('stepName', 'Step Name'),
    f('approverRole', 'Approver Role'),
    choice('stepType', 'Step Type', ['Sequential', 'Parallel', 'Conditional']),
    statusField([['Active', 'success'], ['Disabled', 'secondary']])
  ], 14),
  entity('pending-approvals', 'Pending Approval', 'Pending Approvals', 'pi-clock', 'The live worklist — records currently waiting on someone\'s decision.', [
    f('approvalNo', 'Approval No.'),
    f('documentType', 'Document Type'),
    f('recordReference', 'Record Reference'),
    f('pendingWith', 'Pending With'),
    date('submittedDate', 'Submitted Date'),
    num('daysPending', 'Days Pending', { max: 60 }),
    statusField([['Awaiting Action', 'danger'], ['In Review', 'warn'], ['Escalated', 'contrast']])
  ], 18),
  entity('approval-history', 'Approval Decision', 'Approval History', 'pi-verified', 'The audit trail of every decision made — approve, reject or return for revision.', [
    f('approvalNo', 'Approval No.'),
    f('documentType', 'Document Type'),
    f('recordReference', 'Record Reference'),
    f('decidedBy', 'Decided By'),
    datetime('decisionTime', 'Decision Time'),
    f('comments', 'Comments', 'textarea', { required: false, hideInTable: true }),
    statusField([['Approved', 'success'], ['Rejected', 'danger'], ['Returned for Revision', 'warn'], ['Delegated', 'info']], 'decision', 'Decision')
  ], 20),
  entity('delegation-of-authority', 'Delegation', 'Delegation of Authority', 'pi-user-edit', 'Temporary hand-off of approval authority while an approver is unavailable.', [
    f('delegationNo', 'Delegation No.'),
    f('fromApprover', 'From Approver'),
    f('toApprover', 'To Approver'),
    date('startDate', 'Start Date'),
    date('endDate', 'End Date'),
    f('reason', 'Reason', 'text', { required: false }),
    statusField([['Active', 'success'], ['Scheduled', 'info'], ['Ended', 'secondary']])
  ], 10),
  entity('escalation-rule', 'Escalation Rule', 'Escalation Rules', 'pi-exclamation-triangle', 'What happens when an approval sits unactioned too long.', [
    f('ruleCode', 'Rule Code'),
    f('documentType', 'Document Type'),
    num('escalateAfterHours', 'Escalate After (hrs)', { max: 240 }),
    f('escalateTo', 'Escalate To'),
    statusField([['Active', 'success'], ['Disabled', 'secondary']])
  ], 10),
  entity('workflow-instance-tracking', 'Workflow Instance', 'Workflow Instance Tracking', 'pi-sync', 'Live status of one in-flight approval chain against a specific record.', [
    f('instanceNo', 'Instance No.'),
    f('templateReference', 'Template Reference'),
    f('recordReference', 'Record Reference'),
    num('currentStep', 'Current Step', { max: 10 }),
    num('totalSteps', 'Total Steps', { max: 10 }),
    statusField([['In Progress', 'warn'], ['Completed', 'success'], ['Cancelled', 'danger'], ['On Hold', 'info']])
  ], 16),
  entity('rejection-reason-code', 'Reason Code', 'Rejection Reason Codes', 'pi-ban', 'Standardized reasons for sending something back, so rejection data stays analyzable.', [
    f('reasonCode', 'Reason Code'),
    f('description', 'Description'),
    f('appliesToModule', 'Applies To Module'),
    statusField([['Active', 'success'], ['Retired', 'secondary']])
  ], 10),
  entity('sla-timer-configuration', 'SLA Timer', 'Approval SLA Timers', 'pi-stopwatch', 'Target turnaround time per approval step, feeding the escalation rules above.', [
    f('documentType', 'Document Type'),
    f('stepName', 'Step Name'),
    num('targetHours', 'Target (hrs)', { max: 168 }),
    num('actualAvgHours', 'Actual Avg. (hrs)', { max: 300 }),
    statusField([['Within SLA', 'success'], ['At Risk', 'warn'], ['Breached', 'danger']])
  ], 12),

  // ═════════════════════ Revenue Management & Pricing ══════════════════════
  entity('fare-class-inventory', 'Inventory Bucket', 'Fare Class Inventory', 'pi-th-large', 'Seats available per booking class per flight — the core sellable inventory.', [
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    f('bookingClass', 'Booking Class (RBD)'),
    num('allocatedSeats', 'Allocated', { max: 500 }),
    num('bookedSeats', 'Booked', { max: 500 }),
    num('availableSeats', 'Available', { max: 500 }),
    statusField([['Open', 'success'], ['Closed', 'danger'], ['Waitlist Only', 'warn']])
  ], 20),
  entity('booking-class-mapping', 'RBD Mapping', 'Booking Class (RBD) Mapping', 'pi-sitemap', 'Which reservation booking designators roll up to which cabin.', [
    f('bookingClass', 'Booking Class (RBD)'),
    choice('cabin', 'Cabin', ['First', 'Business', 'Premium Economy', 'Economy']),
    num('rank', 'Fare Rank', { min: 1, max: 26 }),
    statusField([['Active', 'success'], ['Retired', 'secondary']])
  ], 16),
  entity('demand-forecast', 'Forecast', 'Demand Forecasting', 'pi-chart-line', 'Predicted booking demand by flight and days-to-departure, driving inventory decisions.', [
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    num('forecastedDemand', 'Forecasted Demand', { max: 600 }),
    num('actualBookingsToDate', 'Actual Bookings', { max: 600 }),
    num('forecastAccuracyPct', 'Accuracy (%)', { max: 100 }),
    statusField([['On Track', 'success'], ['Under-forecast', 'warn'], ['Over-forecast', 'danger']])
  ], 16),
  entity('fare-optimization-rule', 'Optimization Rule', 'Fare Optimization Rules', 'pi-sliders-h', 'Rules driving automated fare adjustment based on load factor and days-to-departure.', [
    f('ruleCode', 'Rule Code'),
    f('routeGroup', 'Route Group'),
    num('loadFactorTriggerPct', 'Load Factor Trigger (%)', { max: 100 }),
    num('fareAdjustmentPct', 'Fare Adjustment (%)', { min: -50, max: 100 }),
    statusField([['Active', 'success'], ['Testing', 'info'], ['Paused', 'warn']])
  ], 14),
  entity('overbooking-strategy', 'Overbooking Rule', 'Overbooking Strategy', 'pi-percentage', 'Deliberate overbooking factors per route, offsetting expected no-shows.', [
    f('flightNo', 'Flight No.'),
    num('physicalCapacity', 'Physical Capacity', { max: 500 }),
    num('authorizedCapacity', 'Authorized (Overbooked)', { max: 550 }),
    num('noShowRatePct', 'Historical No-Show (%)', { max: 30 }),
    statusField([['Active', 'success'], ['Under Review', 'warn']])
  ], 14),
  entity('competitor-fare-monitoring', 'Competitor Fare', 'Competitor Fare Monitoring', 'pi-eye', 'Tracked competitor pricing on our key routes.', [
    f('routeSector', 'Route / Sector'),
    f('competitorCarrier', 'Competitor Carrier'),
    money('competitorFare', 'Competitor Fare'),
    money('ourFare', 'Our Fare'),
    date('observedDate', 'Observed Date'),
    statusField([['Competitive', 'success'], ['Above Market', 'warn'], ['Below Market', 'info']])
  ], 16),
  entity('seasonal-pricing-calendar', 'Pricing Period', 'Seasonal Pricing Calendar', 'pi-calendar', 'Peak/shoulder/off-peak pricing periods by route group.', [
    f('routeGroup', 'Route Group'),
    choice('season', 'Season', ['Peak', 'Shoulder', 'Off-Peak', 'Holiday Surge']),
    date('startDate', 'Start Date'),
    date('endDate', 'End Date'),
    num('fareMultiplierPct', 'Fare Multiplier (%)', { min: 50, max: 300 }),
    statusField([['Active', 'success'], ['Scheduled', 'info'], ['Expired', 'secondary']])
  ], 14),
  entity('yield-performance', 'Yield Record', 'Yield & RASK Performance', 'pi-chart-bar', 'Realized yield and revenue-per-ASK against target, by period.', [
    f('period', 'Period'),
    f('routeGroup', 'Route Group'),
    money('yieldPerRpk', 'Yield per RPK'),
    money('raskValue', 'RASK'),
    num('loadFactorPct', 'Load Factor (%)', { max: 100 }),
    statusField([['Above Target', 'success'], ['On Target', 'info'], ['Below Target', 'danger']])
  ], 14),
  entity('inventory-control-rule', 'Control Rule', 'Inventory Control (Nested/Non-Nested)', 'pi-list-check', 'How booking classes are nested against each other for availability control.', [
    f('ruleCode', 'Rule Code'),
    f('aircraftType', 'Aircraft Type'),
    choice('controlMethod', 'Control Method', ['Fully Nested', 'Partially Nested', 'Non-Nested (Parallel)']),
    statusField([['Active', 'success'], ['Under Review', 'warn']])
  ], 10),
  entity('group-fare-management', 'Group Fare Request', 'Group Fare Management', 'pi-users', 'Negotiated fares for group bookings above the standard threshold size.', [
    f('requestNo', 'Request No.'),
    f('groupName', 'Group Name'),
    f('routeSector', 'Route / Sector'),
    num('groupSize', 'Group Size', { min: 10, max: 400 }),
    money('quotedFarePerSeat', 'Quoted Fare / Seat'),
    date('travelDate', 'Travel Date'),
    statusField([['Quoted', 'info'], ['Confirmed', 'success'], ['Deposit Pending', 'warn'], ['Cancelled', 'danger']])
  ], 14),
  entity('revenue-management-alert', 'RM Alert', 'RM Alerts & Exceptions', 'pi-bell', 'Flights where actual booking pace deviates enough from forecast to need analyst attention.', [
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    choice('alertType', 'Alert Type', ['Booking Pace Deviation', 'Fare Leakage', 'Inventory Closed Early', 'Group Block Expiring']),
    f('details', 'Details', 'textarea', { hideInTable: true }),
    statusField([['New', 'danger'], ['Acknowledged', 'warn'], ['Resolved', 'success']])
  ], 14),

  // ═════════════════ Operations Control Center (AOCC) ══════════════════════
  entity('ops-control-shift-log', 'Shift Log', 'Shift Handover Log', 'pi-book', 'What the outgoing controller hands the incoming one — the room\'s institutional memory.', [
    f('logNo', 'Log No.'),
    choice('shift', 'Shift', ['Day', 'Evening', 'Night']),
    f('dutyController', 'Duty Controller'),
    f('handoverNotes', 'Handover Notes', 'textarea'),
    num('openItemsCount', 'Open Items', { max: 40 }),
    statusField([['Handed Over', 'success'], ['In Progress', 'warn']])
  ], 16),
  entity('network-status-board', 'Network Status Entry', 'Network Status Board', 'pi-desktop', 'Aggregated red/amber/green status per station or route group, as displayed on the ops room board.', [
    f('stationOrRoute', 'Station / Route Group'),
    f('primaryIssue', 'Primary Issue', 'text', { required: false }),
    datetime('lastUpdated', 'Last Updated'),
    statusField([['Normal', 'success'], ['Degraded', 'warn'], ['Disrupted', 'danger'], ['Recovering', 'info']], 'operationalStatus', 'Status')
  ], 18),
  entity('watch-item-tracking', 'Watch Item', 'Watch Items & Escalations', 'pi-eye', 'Things the control room is actively watching that could become a bigger problem.', [
    f('itemNo', 'Item No.'),
    f('description', 'Description'),
    choice('category', 'Category', ['Weather', 'Technical', 'Crew', 'ATC', 'Security', 'Airport Infrastructure']),
    f('owner', 'Owner'),
    choice('severity', 'Severity', ['Low', 'Medium', 'High', 'Critical']),
    statusField([['Watching', 'info'], ['Escalated', 'danger'], ['Stood Down', 'success']])
  ], 16),
  entity('critical-event-briefing', 'Briefing', 'Critical Event Briefing', 'pi-megaphone', 'Structured briefing issued to stakeholders during a significant network event.', [
    f('briefingNo', 'Briefing No.'),
    f('eventTitle', 'Event Title'),
    datetime('issuedTime', 'Issued Time'),
    f('issuedBy', 'Issued By'),
    f('distributionList', 'Distribution List'),
    statusField([['Issued', 'success'], ['Draft', 'info'], ['Superseded', 'secondary']])
  ], 12),
  entity('cross-functional-coordination', 'Coordination Entry', 'Cross-Functional Coordination Log', 'pi-share-alt', 'Handoffs between Ops, Crew, MRO, Catering and Ground Handling during an event.', [
    f('logNo', 'Log No.'),
    f('eventReference', 'Event Reference'),
    choice('coordinatingWith', 'Coordinating With', ['Crew Management', 'MRO', 'Catering', 'Ground Handling', 'Airport Ops', 'Commercial']),
    f('actionRequested', 'Action Requested'),
    datetime('requestedTime', 'Requested Time'),
    statusField([['Requested', 'info'], ['Acknowledged', 'warn'], ['Completed', 'success']])
  ], 14),
  entity('ops-control-directive', 'Directive', 'Operations Control Directive', 'pi-flag', 'A centrally issued instruction that stations must execute — e.g. a network-wide ground stop.', [
    f('directiveNo', 'Directive No.'),
    f('title', 'Title'),
    f('scope', 'Scope (Stations Affected)'),
    f('issuedBy', 'Issued By'),
    datetime('effectiveFrom', 'Effective From'),
    statusField([['Active', 'danger'], ['Rescinded', 'secondary'], ['Scheduled', 'info']])
  ], 10),
  entity('duty-manager-roster', 'Duty Manager', 'Duty Manager Roster', 'pi-user', 'Who is the accountable duty manager in the control center for each shift.', [
    f('dutyManager', 'Duty Manager'),
    date('rosterDate', 'Date'),
    choice('shift', 'Shift', ['Day', 'Evening', 'Night']),
    f('contactNumber', 'Contact Number'),
    statusField([['Confirmed', 'success'], ['Standby Assigned', 'info'], ['Uncovered', 'danger']])
  ], 14),
  entity('weather-advisory-log', 'Weather Advisory', 'Weather Advisory Log', 'pi-cloud', 'Significant weather affecting the network, logged for situational awareness.', [
    f('advisoryNo', 'Advisory No.'),
    f('affectedStations', 'Affected Stations'),
    choice('weatherType', 'Weather Type', ['Thunderstorm', 'Snow/Ice', 'Fog', 'High Wind', 'Volcanic Ash', 'Hurricane/Typhoon']),
    datetime('validFrom', 'Valid From'),
    datetime('validTo', 'Valid To'),
    statusField([['Active', 'danger'], ['Monitoring', 'warn'], ['Expired', 'secondary']])
  ], 14),
  entity('notam-tracking', 'NOTAM', 'NOTAM Tracking', 'pi-exclamation-triangle', 'Notices to Air Missions relevant to our network — logged and tracked for ops awareness.', [
    f('notamNumber', 'NOTAM Number'),
    f('affectedAirport', 'Affected Airport'),
    f('summary', 'Summary'),
    datetime('validFrom', 'Valid From'),
    datetime('validTo', 'Valid To'),
    statusField([['Active', 'warn'], ['Reviewed', 'info'], ['Expired', 'secondary']])
  ], 16),
  entity('contingency-plan-activation', 'Plan Activation', 'Contingency Plan Activation', 'pi-shield', 'Business continuity / contingency plans triggered by a major disruption.', [
    f('activationNo', 'Activation No.'),
    f('planName', 'Plan Name'),
    f('triggerEvent', 'Trigger Event'),
    datetime('activatedTime', 'Activated Time'),
    f('activatedBy', 'Activated By'),
    statusField([['Active', 'danger'], ['Stood Down', 'success'], ['Partial Activation', 'warn']])
  ], 10),

  // ══════════════════ Crew Pairing & Rostering Optimization ════════════════
  entity('crew-pairing-construction', 'Pairing', 'Pairing Construction', 'pi-link', 'Multi-day trip sequences built from individual flights, the base unit of crew scheduling.', [
    f('pairingNo', 'Pairing No.'),
    f('baseAirport', 'Base Airport'),
    num('dutyDays', 'Duty Days', { min: 1, max: 14 }),
    num('flightHours', 'Flight Hours', { max: 100 }),
    date('startDate', 'Start Date'),
    statusField([['Constructed', 'info'], ['Optimized', 'success'], ['Rejected', 'danger']])
  ], 18),
  entity('pairing-optimization-run', 'Optimization Run', 'Optimization Run', 'pi-sync', 'A single execution of the pairing/rostering solver against a schedule period.', [
    f('runNo', 'Run No.'),
    f('schedulePeriod', 'Schedule Period'),
    num('pairingsGenerated', 'Pairings Generated', { max: 5000 }),
    num('costSavingPct', 'Cost Saving vs. Baseline (%)', { max: 30 }),
    datetime('runCompletedTime', 'Completed'),
    statusField([['Completed', 'success'], ['Running', 'warn'], ['Failed', 'danger']])
  ], 10),
  entity('rule-violation-check', 'Violation Check', 'FTL/FDP Rule Violation Check', 'pi-exclamation-triangle', 'Automated check of a pairing or roster against flight/duty time limitation rules.', [
    f('checkNo', 'Check No.'),
    f('pairingOrRosterReference', 'Pairing / Roster Reference'),
    choice('ruleCategory', 'Rule Category', ['Max Flight Duty Period', 'Min Rest', 'Max Flight Hours', 'Consecutive Night Duties', 'Cumulative Duty']),
    num('violationsFound', 'Violations Found', { max: 20 }),
    statusField([['Compliant', 'success'], ['Warning', 'warn'], ['Violation', 'danger']])
  ], 16),
  entity('crew-bidding', 'Bid', 'Crew Bidding (PBS)', 'pi-file-edit', 'Preferential bidding system submissions — what crew members asked for in next month\'s roster.', [
    f('bidNo', 'Bid No.'),
    f('crewMember', 'Crew Member'),
    f('biddingPeriod', 'Bidding Period'),
    num('preferenceRank', 'Preference Rank', { min: 1, max: 20 }),
    statusField([['Submitted', 'info'], ['Awarded', 'success'], ['Not Awarded', 'warn']])
  ], 18),
  entity('roster-publication', 'Published Roster', 'Roster Publication', 'pi-check-circle', 'The finalized roster once published — the version of record crew actually fly.', [
    f('rosterNo', 'Roster No.'),
    f('crewBase', 'Crew Base'),
    f('rosterPeriod', 'Roster Period'),
    datetime('publishedTime', 'Published Time'),
    statusField([['Published', 'success'], ['Draft', 'info'], ['Republished (Amended)', 'warn']])
  ], 12),
  entity('open-time-trip-trade', 'Trade Request', 'Open Time & Trip Trading', 'pi-arrow-right-arrow-left', 'Crew picking up open trips or swapping assignments with each other.', [
    f('requestNo', 'Request No.'),
    f('crewMember', 'Crew Member'),
    choice('requestType', 'Request Type', ['Pick Up Open Trip', 'Trade with Colleague', 'Drop Trip', 'Give Away']),
    f('pairingReference', 'Pairing Reference'),
    statusField([['Requested', 'info'], ['Approved', 'success'], ['Denied', 'danger']])
  ], 16),
  entity('reserve-crew-planning', 'Reserve Assignment', 'Reserve / Standby Crew Planning', 'pi-shield', 'How many reserve crew are held per base per day, and who they are.', [
    f('crewBase', 'Crew Base'),
    date('reserveDate', 'Date'),
    num('reserveCrewRequired', 'Required', { max: 40 }),
    num('reserveCrewAssigned', 'Assigned', { max: 40 }),
    statusField([['Fully Covered', 'success'], ['Short', 'danger'], ['Over-Reserved', 'warn']])
  ], 14),
  entity('crew-cost-optimization', 'Cost Analysis', 'Crew Cost Optimization', 'pi-chart-bar', 'Per-pairing crew cost against the optimizer\'s target, tracked for the finance conversation.', [
    f('pairingReference', 'Pairing Reference'),
    money('actualCost', 'Actual Cost'),
    money('targetCost', 'Target Cost'),
    num('variancePct', 'Variance (%)', { min: -50, max: 100 }),
    statusField([['Within Target', 'success'], ['Over Target', 'warn'], ['Significantly Over', 'danger']])
  ], 14),
  entity('disruption-recovery-crew-plan', 'Recovery Plan', 'Crew Recovery Planning', 'pi-refresh', 'Re-pairing crew after IRROPS breaks the original roster — the crew-side mirror of passenger re-accommodation.', [
    f('planNo', 'Plan No.'),
    f('disruptionEventReference', 'Disruption Event Reference'),
    num('crewAffected', 'Crew Affected', { max: 100 }),
    num('crewReassigned', 'Crew Reassigned', { max: 100 }),
    statusField([['In Progress', 'warn'], ['Resolved', 'success'], ['Legality Risk', 'danger']])
  ], 12),
  entity('base-and-fleet-bidding', 'Bid Award', 'Base & Fleet Assignment Bidding', 'pi-map-marker', 'Seniority-based bidding for which base and fleet a crew member is assigned to.', [
    f('crewMember', 'Crew Member'),
    f('biddingPeriod', 'Bidding Period'),
    f('requestedBase', 'Requested Base'),
    f('requestedFleet', 'Requested Fleet'),
    num('seniorityNumber', 'Seniority No.', { max: 9999 }),
    statusField([['Awarded', 'success'], ['Pending', 'info'], ['Denied', 'danger']])
  ], 12),

  // ═══════════════════ Airport Slot & ATFM Coordination ════════════════════
  entity('slot-request', 'Slot Request', 'Slot Request', 'pi-file-edit', 'Requested arrival/departure slots at Level 3 coordinated airports.', [
    f('requestNo', 'Request No.'),
    f('airport', 'Airport'),
    f('flightNo', 'Flight No.'),
    choice('season', 'Season', ['Summer', 'Winter']),
    datetime('requestedTime', 'Requested Time'),
    statusField([['Submitted', 'info'], ['Confirmed', 'success'], ['Denied', 'danger'], ['On Waitlist', 'warn']])
  ], 18),
  entity('slot-allocation', 'Slot Allocation', 'Slot Allocation (Coordinated Airports)', 'pi-check-square', 'Confirmed slot pairs actually held at each coordinated airport.', [
    f('slotReference', 'Slot Reference'),
    f('airport', 'Airport'),
    f('flightNo', 'Flight No.'),
    datetime('arrivalSlotTime', 'Arrival Slot'),
    datetime('departureSlotTime', 'Departure Slot'),
    statusField([['Held', 'success'], ['Returned', 'secondary'], ['At Risk', 'warn']])
  ], 18),
  entity('slot-compliance-monitoring', 'Compliance Record', 'Slot Compliance (Use-It-or-Lose-It)', 'pi-check-circle', 'The 80/20 usage rule tracked per slot series so historic precedence isn\'t lost next season.', [
    f('slotSeriesReference', 'Slot Series Reference'),
    f('airport', 'Airport'),
    num('slotsHeld', 'Slots Held', { max: 400 }),
    num('slotsUsedPct', 'Usage (%)', { max: 100 }),
    statusField([['Compliant', 'success'], ['At Risk', 'warn'], ['Non-Compliant', 'danger']])
  ], 14),
  entity('atfm-regulation-tracking', 'ATFM Regulation', 'ATFM Regulation Tracking', 'pi-directions-alt', 'Flow management regulations in effect that constrain our departure times.', [
    f('regulationRef', 'Regulation Ref.'),
    f('affectedAirportOrSector', 'Affected Airport / Sector'),
    choice('reason', 'Reason', ['Weather', 'Capacity', 'Staffing', 'Industrial Action', 'Equipment']),
    datetime('validFrom', 'Valid From'),
    datetime('validTo', 'Valid To'),
    statusField([['Active', 'danger'], ['Lifted', 'success'], ['Forecast', 'warn']])
  ], 14),
  entity('ctot-management', 'CTOT', 'CTOT Management', 'pi-clock', 'Calculated take-off times allocated under flow control, and the slack against schedule.', [
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    datetime('scheduledDepartureTime', 'Scheduled Departure'),
    datetime('ctot', 'CTOT'),
    num('slotToleranceMin', 'Tolerance (± min)', { max: 15 }),
    statusField([['On Schedule', 'success'], ['Delayed by CTOT', 'warn'], ['Slot Missed', 'danger']])
  ], 16),
  entity('schedule-facilitated-airport', 'Airport Listing', 'Schedule-Facilitated Airport List', 'pi-list', 'Which airports we operate to are Level 2 (facilitated) vs. Level 3 (coordinated).', [
    f('airport', 'Airport'),
    choice('facilitationLevel', 'IATA Level', ['Level 1 (Non-Coordinated)', 'Level 2 (Facilitated)', 'Level 3 (Coordinated)']),
    f('coordinatorContact', 'Coordinator Contact', 'text', { required: false }),
    statusField([['Current', 'success'], ['Under Review', 'warn']])
  ], 16),
  entity('seasonal-schedule-submission', 'SSIM Submission', 'Seasonal Schedule Submission (IATA SSIM)', 'pi-send', 'Standard Schedules Information Manual filings submitted each season.', [
    f('submissionNo', 'Submission No.'),
    choice('season', 'Season', ['Summer', 'Winter']),
    f('submittedTo', 'Submitted To (Coordinator/Airport)'),
    date('submissionDeadline', 'Submission Deadline'),
    statusField([['Submitted', 'success'], ['Draft', 'info'], ['Amendment Filed', 'warn'], ['Overdue', 'danger']])
  ], 10),
  entity('slot-historic-precedence', 'Precedence Record', 'Historic Precedence Register', 'pi-history', 'The grandfathered slot rights we carry season to season, and what protects them.', [
    f('slotSeriesReference', 'Slot Series Reference'),
    f('airport', 'Airport'),
    date('firstHeldDate', 'First Held'),
    num('consecutiveSeasonsHeld', 'Consecutive Seasons', { max: 40 }),
    statusField([['Protected', 'success'], ['At Risk', 'warn'], ['Lost', 'danger']])
  ], 10),
  entity('airport-coordination-committee', 'Committee Minutes', 'Coordination Committee Minutes', 'pi-book', 'Minutes from the local Airport Coordination Committee meetings we participate in.', [
    f('meetingRef', 'Meeting Ref.'),
    f('airport', 'Airport'),
    date('meetingDate', 'Meeting Date'),
    f('keyTopics', 'Key Topics', 'textarea', { hideInTable: true }),
    statusField([['Attended', 'success'], ['Minutes Pending', 'info'], ['Action Items Open', 'warn']])
  ], 8),

  // ═══════════════════════════ Integration Hub ═════════════════════════════
  entity('external-system-registry', 'External System', 'External System Registry', 'pi-sitemap', 'Every third-party system this ERP is meant to talk to, catalogued in one place.', [
    f('systemCode', 'System Code'),
    f('systemName', 'System Name'),
    choice('systemCategory', 'Category', ['GDS/NDC', 'SITA/ARINC Messaging', 'Weather/NOTAM', 'Payment Gateway', 'Government/Customs', 'Partner Airline', 'IoT/Sensor Feed']),
    f('vendorName', 'Vendor'),
    statusField([['Connected', 'success'], ['Planned', 'info'], ['Deprecated', 'secondary'], ['Failed', 'danger']])
  ], 16),
  entity('integration-endpoint-config', 'Endpoint', 'Integration Endpoint Configuration', 'pi-link', 'Connection details per integration — protocol and environment, not credentials.', [
    f('endpointName', 'Endpoint Name'),
    f('externalSystemReference', 'External System Reference'),
    choice('protocol', 'Protocol', ['REST/JSON', 'SOAP/XML', 'SFTP', 'EDIFACT', 'IATA Type B', 'MQTT']),
    choice('environment', 'Environment', ['Production', 'Staging', 'Sandbox']),
    statusField([['Active', 'success'], ['Inactive', 'secondary'], ['Error', 'danger']])
  ], 14),
  entity('message-mapping', 'Field Mapping', 'Message / Field Mapping', 'pi-table', 'How a field in our data model maps to the equivalent field in an external message format.', [
    f('mappingName', 'Mapping Name'),
    f('externalSystemReference', 'External System Reference'),
    f('internalField', 'Internal Field'),
    f('externalField', 'External Field'),
    statusField([['Active', 'success'], ['Draft', 'info'], ['Deprecated', 'secondary']])
  ], 16),
  entity('iata-type-b-message-log', 'Type B Message', 'IATA Type B Message Log', 'pi-envelope', 'Teletype-style messages exchanged with handlers and other carriers (LDM, PTM, MVT, etc.).', [
    f('messageRef', 'Message Ref.'),
    choice('messageType', 'Message Type', ['LDM', 'PTM', 'MVT', 'CPM', 'BSM', 'BTM', 'FFM']),
    f('originAddress', 'Origin Address'),
    f('destinationAddress', 'Destination Address'),
    datetime('sentTime', 'Sent Time'),
    statusField([['Delivered', 'success'], ['Queued', 'info'], ['Failed', 'danger']])
  ], 20),
  entity('api-integration-log', 'API Call Log', 'API Integration Log', 'pi-history', 'Requests/responses exchanged with external REST/SOAP APIs, kept for troubleshooting.', [
    f('logNo', 'Log No.'),
    f('externalSystemReference', 'External System Reference'),
    f('endpointCalled', 'Endpoint Called'),
    num('responseTimeMs', 'Response Time (ms)', { max: 10000 }),
    num('httpStatusCode', 'HTTP Status', { min: 100, max: 599 }),
    statusField([['Success', 'success'], ['Client Error', 'warn'], ['Server Error', 'danger']])
  ], 18),
  entity('gds-ndc-connection', 'GDS/NDC Connection', 'GDS / NDC Connection', 'pi-share-alt', 'Distribution connections to Amadeus/Sabre/Travelport and NDC-enabled agents.', [
    f('connectionName', 'Connection Name'),
    choice('channelType', 'Channel Type', ['Amadeus GDS', 'Sabre GDS', 'Travelport GDS', 'NDC Level 3', 'NDC Level 4']),
    num('bookingsPerDay', 'Avg. Bookings/Day', { max: 5000 }),
    statusField([['Live', 'success'], ['Certifying', 'warn'], ['Suspended', 'danger']])
  ], 10),
  entity('weather-notam-feed-config', 'Feed Configuration', 'Weather & NOTAM Feed Configuration', 'pi-cloud', 'Live feed subscriptions that will populate the AOCC weather/NOTAM screens once connected.', [
    f('feedName', 'Feed Name'),
    choice('feedType', 'Feed Type', ['METAR/TAF', 'SIGMET', 'NOTAM', 'Volcanic Ash Advisory']),
    f('provider', 'Provider'),
    num('refreshIntervalMin', 'Refresh Interval (min)', { max: 60 }),
    statusField([['Connected', 'success'], ['Configured, Not Live', 'info'], ['Error', 'danger']])
  ], 8),
  entity('integration-error-queue', 'Error Entry', 'Integration Error Queue', 'pi-exclamation-triangle', 'Failed messages waiting on retry or manual intervention.', [
    f('errorNo', 'Error No.'),
    f('externalSystemReference', 'External System Reference'),
    f('errorSummary', 'Error Summary'),
    num('retryCount', 'Retry Count', { max: 20 }),
    datetime('firstOccurred', 'First Occurred'),
    statusField([['Retrying', 'warn'], ['Resolved', 'success'], ['Needs Manual Fix', 'danger']])
  ], 14),
  entity('webhook-subscription', 'Webhook', 'Webhook Subscription', 'pi-bell', 'Outbound event subscriptions other systems have registered against our platform.', [
    f('subscriberName', 'Subscriber Name'),
    f('eventType', 'Event Type'),
    f('callbackUrl', 'Callback URL'),
    date('registeredDate', 'Registered Date'),
    statusField([['Active', 'success'], ['Paused', 'warn'], ['Revoked', 'danger']])
  ], 10),
  entity('data-sync-schedule', 'Sync Job', 'Data Sync Schedule', 'pi-calendar-clock', 'Batch synchronization jobs — master data pushes, nightly reconciliations, and the like.', [
    f('jobName', 'Job Name'),
    f('externalSystemReference', 'External System Reference'),
    choice('frequency', 'Frequency', ['Real-Time', 'Every 15 Min', 'Hourly', 'Daily', 'Weekly']),
    datetime('lastRunTime', 'Last Run'),
    statusField([['Success', 'success'], ['Running', 'info'], ['Failed', 'danger']])
  ], 14),

  // ══════════════ Deepening: Notification System ══════════════
  // Original 5 items were pure delivery logs with no way to configure what
  // gets sent, who owns delivery, or what a user has opted into.
  entity('notification-template', 'Template', 'Notification Templates', 'pi-file-edit', 'Reusable message templates for email/SMS/push alerts, with merge fields.', [
    f('templateCode', 'Template Code'),
    f('templateName', 'Template Name'),
    choice('channel', 'Channel', ['Email', 'SMS', 'Push', 'In-App']),
    f('subjectLine', 'Subject Line', 'text', { required: false }),
    f('bodyTemplate', 'Body Template', 'textarea'),
    statusField([['Active', 'success'], ['Draft', 'info'], ['Retired', 'secondary']])
  ], 16),
  entity('notification-provider-config', 'Provider Config', 'Delivery Provider Configuration', 'pi-cog', 'Which outbound gateway handles each channel — the settings the real API will bind to (e.g. Twilio/SendGrid).', [
    f('providerName', 'Provider Name'),
    choice('channel', 'Channel', ['Email', 'SMS', 'Push']),
    f('providerType', 'Provider Type'),
    num('dailySendLimit', 'Daily Send Limit', { max: 1000000 }),
    statusField([['Active', 'success'], ['Failover', 'warn'], ['Disabled', 'secondary']])
  ], 8),
  entity('notification-delivery-log', 'Delivery Record', 'Delivery Log & Status', 'pi-history', 'Unified delivery log across all channels and templates, for troubleshooting a "didn\'t receive it" complaint.', [
    f('deliveryNo', 'Delivery No.'),
    f('templateReference', 'Template Reference'),
    f('recipient', 'Recipient'),
    choice('channel', 'Channel', ['Email', 'SMS', 'Push', 'In-App']),
    datetime('sentTime', 'Sent Time'),
    statusField([['Delivered', 'success'], ['Bounced', 'danger'], ['Queued', 'info'], ['Opted Out', 'secondary']])
  ], 20),
  entity('notification-escalation-rule', 'Escalation Rule', 'Notification Escalation Rules', 'pi-exclamation-triangle', 'When an alert should re-fire to a supervisor because the first recipient hasn\'t acknowledged it.', [
    f('ruleName', 'Rule Name'),
    f('triggerEvent', 'Trigger Event'),
    num('escalateAfterMinutes', 'Escalate After (min)', { max: 1440 }),
    f('escalateTo', 'Escalate To'),
    statusField([['Active', 'success'], ['Disabled', 'secondary']])
  ], 10),
  entity('notification-subscription-preference', 'Preference', 'User Subscription Preferences', 'pi-user', 'Which alert categories each user has opted into per channel.', [
    f('userName', 'User Name'),
    f('alertCategory', 'Alert Category'),
    choice('preferredChannel', 'Preferred Channel', ['Email', 'SMS', 'Push', 'None']),
    statusField([['Subscribed', 'success'], ['Unsubscribed', 'secondary']])
  ], 14),
  entity('in-app-notification', 'In-App Notification', 'In-App Notification Center', 'pi-bell', 'Notifications surfaced inside the app itself rather than pushed externally.', [
    f('notificationNo', 'Notification No.'),
    f('recipient', 'Recipient'),
    f('message', 'Message'),
    datetime('createdTime', 'Created'),
    statusField([['Unread', 'warn'], ['Read', 'success'], ['Dismissed', 'secondary']])
  ], 18),

  // ══════════════ Deepening: Document Management ══════════════
  // Original 7 items were flat document registers with no version history,
  // approval trail, retention rule, or access log — odd for a module whose
  // whole job is controlling documents.
  entity('document-approval-workflow', 'Document Approval', 'Document Approval Workflow', 'pi-check-square', 'Sign-off required before a controlled document becomes the current revision.', [
    f('documentReference', 'Document Reference'),
    f('submittedBy', 'Submitted By'),
    f('approverRole', 'Approver Role'),
    date('submittedDate', 'Submitted Date'),
    statusField([['Pending Review', 'info'], ['Approved', 'success'], ['Rejected', 'danger']])
  ], 14),
  entity('document-retention-schedule', 'Retention Rule', 'Retention Schedule', 'pi-calendar-times', 'How long each document category must be kept before it can be archived or destroyed.', [
    f('documentCategory', 'Document Category'),
    num('retentionYears', 'Retention (years)', { max: 30 }),
    choice('actionAtExpiry', 'Action at Expiry', ['Archive', 'Destroy', 'Review for Extension']),
    statusField([['Active', 'success'], ['Under Legal Hold', 'warn']])
  ], 10),
  entity('document-access-log', 'Access Log Entry', 'Document Access Log', 'pi-eye', 'Who viewed or downloaded a controlled document, and when.', [
    f('documentReference', 'Document Reference'),
    f('accessedBy', 'Accessed By'),
    choice('accessType', 'Access Type', ['View', 'Download', 'Print', 'Edit']),
    datetime('accessTime', 'Access Time'),
    statusField([['Logged', 'success'], ['Flagged', 'danger']])
  ], 18),
  entity('e-signature-request', 'Signature Request', 'E-Signature Request', 'pi-pencil', 'Documents routed for digital signature, and whether every signatory has signed.', [
    f('requestNo', 'Request No.'),
    f('documentReference', 'Document Reference'),
    f('signatories', 'Signatories'),
    file('signedDocument', 'Signed Document'),
    statusField([['Sent', 'info'], ['Partially Signed', 'warn'], ['Completed', 'success'], ['Declined', 'danger']])
  ], 14),
  entity('document-expiry-tracking', 'Expiry Entry', 'Document Expiry Tracking', 'pi-calendar-times', 'A cross-module view of every document with an expiry date coming due.', [
    f('documentReference', 'Document Reference'),
    f('documentType', 'Document Type'),
    f('ownerModule', 'Owner Module'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ], 16),

  // ══════════════ Deepening: Passenger Reservation ══════════════
  // Original 8 items covered the booking lifecycle but skipped the
  // inventory/fare machinery that makes a PSS a PSS rather than a ticket log.
  entity('fare-rules-engine', 'Fare Rule', 'Fare Rules Engine', 'pi-list-check', 'Change/refund/baggage rules attached to a fare basis code.', [
    f('fareBasisCode', 'Fare Basis Code'),
    choice('changePolicy', 'Change Policy', ['Free Change', 'Change Fee Applies', 'No Changes Permitted']),
    choice('refundPolicy', 'Refund Policy', ['Fully Refundable', 'Partially Refundable', 'Non-Refundable']),
    num('freeBaggageKg', 'Free Baggage (kg)', { max: 40 }),
    statusField([['Active', 'success'], ['Filed, Pending Effective', 'info'], ['Withdrawn', 'secondary']])
  ], 16),
  entity('group-booking', 'Group Booking', 'Group Booking', 'pi-users', 'Bookings for 10+ passengers travelling together, held under a single group PNR.', [
    f('groupPnr', 'Group PNR'),
    f('groupName', 'Group Name'),
    f('flightNo', 'Flight No.'),
    num('groupSize', 'Group Size', { min: 10, max: 400 }),
    date('depositDueDate', 'Deposit Due Date'),
    statusField([['Held', 'info'], ['Deposit Paid', 'warn'], ['Ticketed', 'success'], ['Released', 'danger']])
  ], 14),
  entity('waitlist-management', 'Waitlist Entry', 'Waitlist Management', 'pi-list', 'Passengers queued for a sold-out flight/class, in clearance priority order.', [
    f('waitlistNo', 'Waitlist No.'),
    f('passengerName', 'Passenger Name'),
    f('flightNo', 'Flight No.'),
    num('priorityRank', 'Priority Rank', { max: 99 }),
    statusField([['Waitlisted', 'info'], ['Cleared', 'success'], ['Expired', 'secondary']])
  ], 16),
  entity('ancillary-services-booking', 'Ancillary Booking', 'Ancillary Services Booking', 'pi-plus-circle', 'Paid extras attached to a booking — bags, seats, meals, priority.', [
    f('pnrReference', 'PNR Reference'),
    choice('serviceType', 'Service Type', ['Extra Baggage', 'Seat Selection', 'Priority Boarding', 'Lounge Access', 'Travel Insurance', 'Fast Track Security']),
    money('serviceFee', 'Service Fee'),
    statusField([['Booked', 'success'], ['Refunded', 'warn'], ['Cancelled', 'danger']])
  ], 18),
  entity('seat-map-configuration', 'Seat Map', 'Seat Map Configuration', 'pi-th-large', 'Cabin layout per aircraft type — which rows are which class, which seats are blocked.', [
    f('aircraftType', 'Aircraft Type'),
    choice('cabin', 'Cabin', ['First', 'Business', 'Premium Economy', 'Economy']),
    num('rowFrom', 'Row From', { max: 80 }),
    num('rowTo', 'Row To', { max: 80 }),
    f('seatsPerRow', 'Seats Per Row'),
    statusField([['Active', 'success'], ['Under Revision', 'warn']])
  ], 10),
  entity('pnr-management', 'PNR', 'PNR Management', 'pi-database', 'The master passenger name record tying together booking, seat, baggage and ancillary data.', [
    f('pnrReference', 'PNR Reference'),
    f('leadPassengerName', 'Lead Passenger Name'),
    num('passengerCount', 'Passenger Count', { max: 20 }),
    date('createdDate', 'Created Date'),
    statusField([['Active', 'success'], ['Ticketed', 'info'], ['Cancelled', 'danger'], ['Expired (Unticketed)', 'secondary']])
  ], 18),
  entity('unaccompanied-minor-booking', 'UMNR Booking', 'Unaccompanied Minor Booking', 'pi-user', 'Children travelling alone — the extra handling detail a standard booking doesn\'t carry.', [
    f('pnrReference', 'PNR Reference'),
    f('childName', 'Child Name'),
    num('age', 'Age', { min: 5, max: 17 }),
    f('escortToGate', 'Escort To Gate (Name)'),
    f('receivingPartyName', 'Receiving Party Name'),
    statusField([['Confirmed', 'success'], ['Pending Documentation', 'warn'], ['Travelled', 'secondary']])
  ], 10),

  // ══════════════ Deepening: Compliance & Safety ══════════════
  // Original 6 items tracked compliance status in the abstract with no link
  // to an actual regulator, correspondence, or filing calendar.
  entity('regulatory-report-submission', 'Report Submission', 'Regulatory Report Submission', 'pi-send', 'Reports filed with a specific regulator, tracked against their submission deadline.', [
    f('reportName', 'Report Name'),
    f('regulator', 'Regulator'),
    date('submissionDeadline', 'Submission Deadline'),
    date('submittedDate', 'Submitted Date', { required: false }),
    statusField([['Submitted', 'success'], ['Due Soon', 'warn'], ['Overdue', 'danger'], ['Draft', 'info']])
  ], 16),
  entity('regulator-correspondence', 'Correspondence', 'Regulator Correspondence Log', 'pi-envelope', 'Formal letters/findings exchanged with a regulator outside a scheduled report.', [
    f('referenceNo', 'Reference No.'),
    f('regulator', 'Regulator'),
    choice('direction', 'Direction', ['Inbound', 'Outbound']),
    f('subject', 'Subject'),
    date('correspondenceDate', 'Date'),
    statusField([['Open', 'warn'], ['Responded', 'info'], ['Closed', 'success']])
  ], 14),
  entity('compliance-calendar', 'Calendar Entry', 'Compliance Calendar', 'pi-calendar', 'Every recurring compliance obligation — audits, renewals, filings — on one timeline.', [
    f('obligationName', 'Obligation Name'),
    f('regulator', 'Regulator'),
    date('dueDate', 'Due Date'),
    choice('recurrence', 'Recurrence', ['One-Time', 'Annual', 'Biennial', 'Quarterly', 'Monthly']),
    statusField([['Upcoming', 'info'], ['Due Soon', 'warn'], ['Overdue', 'danger'], ['Completed', 'success']])
  ], 18),
  entity('certificate-of-authorization', 'AOC Item', 'Certificate of Authorization / AOC Tracking', 'pi-verified', 'The Air Operator Certificate and its operations specifications — what we\'re actually licensed to do.', [
    f('certificateNo', 'Certificate No.'),
    f('issuingAuthority', 'Issuing Authority'),
    f('operationsSpecification', 'Operations Specification'),
    date('issueDate', 'Issue Date'),
    date('renewalDate', 'Renewal Date'),
    statusField([['Valid', 'success'], ['Renewal Due', 'warn'], ['Suspended', 'danger']])
  ], 8),
  entity('compliance-finding-tracker', 'Finding', 'Compliance Finding Tracker', 'pi-search', 'Findings raised by any audit or regulator inspection, tracked to closure.', [
    f('findingNo', 'Finding No.'),
    f('source', 'Source (Audit/Inspection)'),
    f('description', 'Description', 'textarea', { hideInTable: true }),
    choice('severity', 'Severity', ['Level 1 (Critical)', 'Level 2 (Major)', 'Level 3 (Minor)', 'Observation']),
    date('dueDate', 'Corrective Action Due'),
    statusField([['Open', 'danger'], ['Corrective Action Submitted', 'warn'], ['Closed', 'success']])
  ], 16),

  // ══════════════ Deepening: Security Management ══════════════
  // Original 5 items (2 flagship) covered auth mechanics but nothing about
  // data governance — retention, privacy requests, or session visibility.
  entity('data-retention-policy', 'Retention Policy', 'Data Retention Policy', 'pi-calendar-times', 'How long personal and operational data categories are kept before deletion/anonymization.', [
    f('dataCategory', 'Data Category'),
    num('retentionMonths', 'Retention (months)', { max: 240 }),
    choice('disposalMethod', 'Disposal Method', ['Hard Delete', 'Anonymize', 'Archive Cold Storage']),
    statusField([['Active', 'success'], ['Under Legal Review', 'warn']])
  ], 10),
  entity('data-subject-request', 'DSR', 'Data Subject Request', 'pi-user', 'GDPR/privacy-style requests — access, correction or deletion of an individual\'s data.', [
    f('requestNo', 'Request No.'),
    f('requesterName', 'Requester Name'),
    choice('requestType', 'Request Type', ['Access', 'Correction', 'Deletion', 'Portability']),
    date('receivedDate', 'Received Date'),
    date('dueDate', 'Statutory Due Date'),
    statusField([['Received', 'info'], ['In Progress', 'warn'], ['Fulfilled', 'success'], ['Overdue', 'danger']])
  ], 12),
  entity('field-level-permission', 'Field Permission', 'Field-Level Permission Matrix', 'pi-lock', 'Which roles can see or edit sensitive fields (salary, passport number, medical data) beyond module-level access.', [
    f('entityName', 'Entity'),
    f('fieldName', 'Field'),
    f('role', 'Role'),
    choice('accessLevel', 'Access Level', ['No Access', 'View Only', 'Edit']),
    statusField([['Active', 'success'], ['Under Review', 'warn']])
  ], 16),
  entity('session-management', 'Active Session', 'Active Session Management', 'pi-desktop', 'Currently signed-in sessions across devices, with the ability to see and revoke them.', [
    f('userName', 'User Name'),
    f('deviceOrBrowser', 'Device / Browser'),
    f('ipAddress', 'IP Address'),
    datetime('loginTime', 'Login Time'),
    statusField([['Active', 'success'], ['Idle', 'warn'], ['Revoked', 'danger']])
  ], 14),
  entity('security-incident-log', 'Security Incident', 'Security Incident Log', 'pi-exclamation-triangle', 'Failed-login clusters, suspicious access patterns and confirmed security events.', [
    f('incidentNo', 'Incident No.'),
    choice('incidentType', 'Incident Type', ['Brute Force Attempt', 'Unusual Location', 'Privilege Escalation Attempt', 'Data Export Anomaly']),
    f('affectedUser', 'Affected User'),
    datetime('detectedTime', 'Detected Time'),
    statusField([['Open', 'danger'], ['Investigating', 'warn'], ['Resolved', 'success'], ['False Positive', 'secondary']])
  ], 12)
];
