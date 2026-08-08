import { EntityConfig } from '../models/entity-config.model';
import { choice, date, datetime, entity, f, file, lookup, money, num, statusField } from './entity-field-helpers';

/**
 * Entity configs for the ten modules added after the original 25 — the
 * commercial and passenger-care side of the airline that the first pass
 * didn't cover:
 *
 *   supplier-management      who we buy from, and whether they're airworthy-approved
 *   sales-buyer-management   who we sell to — agents, corporates, interline, MRO customers
 *   catering-food-services   what goes on the aircraft to eat and drink
 *   irregular-operations     where passengers sleep when the flight doesn't go
 *   crew-staff-travel        where crew and staff sleep when they're away from base
 *   ground-handling-services the turnaround itself, and who is contracted to do it
 *   training-academy         type ratings, sim slots, recurrent checks
 *   charter-leasing          ACMI, wet/dry lease, charter contracts
 *   revenue-accounting       turning coupons and AWBs into recognised revenue
 *   environment-sustainability CORSIA/ETS, SAF, noise, waste
 *
 * Same shape and helpers as entity-configs.ts — this list is concatenated
 * into the single ENTITY_CONFIGS lookup there. Keys are unique across BOTH
 * files because they double as the mock/API resource path.
 */

export const EXTENDED_ENTITY_LIST: EntityConfig[] = [
  // ═════════════════════ Supplier & Vendor Management ═════════════════════
  entity('supplier-registry', 'Supplier', 'Supplier Registry', 'pi-building', 'Master record for every company the airline buys goods or services from.', [
    f('supplierCode', 'Supplier Code'),
    f('supplierName', 'Supplier Name'),
    choice('supplierType', 'Supplier Type', ['OEM', 'Distributor', 'MRO Provider', 'Service Provider', 'Fuel Supplier', 'Catering', 'Logistics']),
    lookup('country', 'Country', 'country-region-master', 'countryName'),
    f('contactPerson', 'Contact Person'),
    f('email', 'Email', 'email'),
    f('phone', 'Phone'),
    statusField([['Approved', 'success'], ['Provisional', 'warn'], ['Suspended', 'danger'], ['Inactive', 'secondary']])
  ], 14),
  entity('supplier-onboarding', 'Onboarding Case', 'Supplier Onboarding', 'pi-user-plus', 'Prequalification and registration workflow for prospective suppliers.', [
    f('caseNo', 'Case No.'),
    f('supplierName', 'Supplier Name'),
    date('applicationDate', 'Application Date'),
    choice('stage', 'Stage', ['Application', 'Document Review', 'Site Assessment', 'Approval', 'Registered']),
    f('assignedBuyer', 'Assigned Buyer'),
    statusField([['In Progress', 'info'], ['On Hold', 'warn'], ['Approved', 'success'], ['Rejected', 'danger']])
  ]),
  entity('supplier-categories', 'Supplier Category', 'Supplier Category Setup', 'pi-tags', 'Commodity categories used to group and route supplier spend.', [
    f('categoryCode', 'Category Code'),
    f('categoryName', 'Category Name'),
    f('parentCategory', 'Parent Category'),
    choice('criticality', 'Criticality', ['Critical', 'Major', 'Standard']),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('supplier-contacts', 'Supplier Contact', 'Supplier Contacts', 'pi-address-book', 'Named contacts per supplier for sales, quality and AOG desks.', [
    f('supplierName', 'Supplier Name'),
    f('contactPerson', 'Contact Person'),
    f('designation', 'Designation'),
    choice('contactType', 'Contact Type', ['Sales', 'Technical', 'Quality', 'AOG Desk', 'Accounts']),
    f('email', 'Email', 'email'),
    f('phone', 'Phone'),
    statusField([['Primary', 'success'], ['Secondary', 'info'], ['Inactive', 'secondary']])
  ]),
  entity('supplier-certifications', 'Certification', 'Certifications & Approvals', 'pi-verified', 'Regulatory and quality approvals a supplier must hold to stay on the ASL.', [
    f('supplierName', 'Supplier Name'),
    choice('certificationType', 'Certification Type', ['AS9100', 'AS9120', 'ISO 9001', 'EASA Part 145', 'EASA Part 21G', 'FAA 145', 'ASA-100']),
    f('certificateNo', 'Certificate No.'),
    f('issuingBody', 'Issuing Body'),
    date('issueDate', 'Issue Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger'], ['Not Provided', 'secondary']])
  ], 14),
  entity('approved-supplier-list', 'ASL Entry', 'Approved Supplier List (ASL)', 'pi-list-check', 'The controlled list of suppliers cleared to provide aviation parts and services.', [
    f('aslRef', 'ASL Ref.'),
    f('supplierName', 'Supplier Name'),
    f('scopeOfApproval', 'Scope of Approval'),
    date('approvedDate', 'Approved Date'),
    date('nextReviewDate', 'Next Review Date'),
    f('approvedBy', 'Approved By'),
    statusField([['Approved', 'success'], ['Conditional', 'warn'], ['Removed', 'danger']])
  ]),
  entity('supplier-capability-matrix', 'Capability', 'Capability & Part Coverage', 'pi-sitemap', 'What each supplier can actually supply or repair, by ATA chapter and part family.', [
    f('supplierName', 'Supplier Name'),
    f('ataChapter', 'ATA Chapter'),
    f('partFamily', 'Part Family'),
    choice('capabilityType', 'Capability Type', ['New Supply', 'Overhaul', 'Repair', 'Exchange', 'Loan']),
    num('avgLeadTimeDays', 'Avg. Lead Time (days)'),
    statusField([['Verified', 'success'], ['Claimed', 'info'], ['Withdrawn', 'secondary']])
  ]),
  entity('supplier-price-list', 'Price List Line', 'Price Lists & Catalogues', 'pi-tag', 'Contracted unit prices per supplier, part and validity window.', [
    f('supplierName', 'Supplier Name'),
    f('partNumber', 'Part Number'),
    f('itemDescription', 'Item Description'),
    money('unitPrice', 'Unit Price'),
    lookup('currency', 'Currency', 'currency-master', 'currencyCode'),
    date('validFrom', 'Valid From'),
    date('validTo', 'Valid To'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ], 14),
  entity('supplier-quotations', 'Supplier Quotation', 'Supplier Quotations', 'pi-file-edit', 'Quotes received from suppliers against an RFQ, with comparison outcome.', [
    f('quotationNo', 'Quotation No.'),
    f('rfqRef', 'RFQ Ref.'),
    f('supplierName', 'Supplier Name'),
    money('quotedAmount', 'Quoted Amount'),
    num('leadTimeDays', 'Lead Time (days)'),
    date('validUntil', 'Valid Until'),
    statusField([['Received', 'info'], ['Under Evaluation', 'warn'], ['Selected', 'success'], ['Rejected', 'danger']])
  ]),
  entity('supplier-agreements', 'Agreement', 'Agreements & SLA', 'pi-file', 'Framework agreements, SLAs and general terms agreed with a supplier.', [
    f('agreementNo', 'Agreement No.'),
    f('supplierName', 'Supplier Name'),
    choice('agreementType', 'Agreement Type', ['Framework', 'Long-Term Agreement', 'Power-by-the-Hour', 'Consignment', 'Exchange Pool', 'NDA']),
    date('startDate', 'Start Date'),
    date('endDate', 'End Date'),
    money('contractValue', 'Contract Value'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger'], ['Draft', 'info']])
  ]),
  entity('supplier-lead-time', 'Lead Time Record', 'Lead Time & AOG Response', 'pi-stopwatch', 'Promised vs. actual turnaround, including AOG response commitments.', [
    f('supplierName', 'Supplier Name'),
    f('partNumber', 'Part Number'),
    num('promisedDays', 'Promised (days)'),
    num('actualDays', 'Actual (days)'),
    num('aogResponseHours', 'AOG Response (hrs)'),
    statusField([['On Time', 'success'], ['Marginal', 'warn'], ['Late', 'danger']])
  ]),
  entity('supplier-performance-kpi', 'Scorecard', 'Performance Scorecard', 'pi-chart-bar', 'Periodic supplier scorecard — delivery, quality and responsiveness.', [
    f('supplierName', 'Supplier Name'),
    f('period', 'Period'),
    num('onTimeDeliveryPct', 'On-Time Delivery (%)', { max: 100 }),
    num('qualityAcceptancePct', 'Quality Acceptance (%)', { max: 100 }),
    num('overallScore', 'Overall Score', { max: 100 }),
    statusField([['Preferred', 'success'], ['Acceptable', 'info'], ['Watchlist', 'warn'], ['Unacceptable', 'danger']])
  ]),
  entity('supplier-audit', 'Supplier Audit', 'Supplier Audit & Surveillance', 'pi-search', 'On-site and desktop audits of supplier quality systems.', [
    f('auditNo', 'Audit No.'),
    f('supplierName', 'Supplier Name'),
    choice('auditType', 'Audit Type', ['Initial', 'Surveillance', 'For-Cause', 'Desktop', 'Re-Approval']),
    date('auditDate', 'Audit Date'),
    f('leadAuditor', 'Lead Auditor'),
    num('findingsCount', 'Findings'),
    statusField([['Planned', 'info'], ['In Progress', 'warn'], ['Closed', 'success'], ['Failed', 'danger']])
  ]),
  entity('supplier-nonconformance', 'SCAR', 'Supplier Non-Conformance (SCAR)', 'pi-ban', 'Supplier corrective action requests raised against defective or late supply.', [
    f('scarNo', 'SCAR No.'),
    f('supplierName', 'Supplier Name'),
    f('partNumber', 'Part Number'),
    choice('defectType', 'Defect Type', ['Wrong Part', 'Damaged', 'Documentation Missing', 'Shelf Life', 'Counterfeit Suspect', 'Late Delivery']),
    date('raisedDate', 'Raised Date'),
    date('responseDueDate', 'Response Due'),
    statusField([['Open', 'danger'], ['Response Received', 'warn'], ['Verified', 'info'], ['Closed', 'success']])
  ]),
  entity('supplier-risk-assessment', 'Risk Assessment', 'Supplier Risk Assessment', 'pi-exclamation-triangle', 'Financial, geographic and single-source risk scoring per supplier.', [
    f('supplierName', 'Supplier Name'),
    choice('riskCategory', 'Risk Category', ['Financial', 'Geopolitical', 'Single Source', 'Capacity', 'Cyber', 'Compliance']),
    date('assessmentDate', 'Assessment Date'),
    num('riskScore', 'Risk Score', { max: 25 }),
    f('mitigationPlan', 'Mitigation Plan', 'textarea'),
    statusField([['Low', 'success'], ['Medium', 'warn'], ['High', 'danger'], ['Critical', 'contrast']])
  ]),
  entity('supplier-invoice', 'Supplier Invoice', 'Supplier Invoices', 'pi-file-edit', 'Invoices received from suppliers, matched against PO and GRN.', [
    f('invoiceNo', 'Invoice No.'),
    f('supplierName', 'Supplier Name'),
    f('poReference', 'PO Reference'),
    money('invoiceAmount', 'Invoice Amount'),
    date('invoiceDate', 'Invoice Date'),
    date('dueDate', 'Due Date'),
    statusField([['Received', 'info'], ['3-Way Matched', 'warn'], ['Approved', 'success'], ['Disputed', 'danger'], ['Paid', 'secondary']])
  ], 14),
  entity('supplier-payment', 'Payment', 'Payments & Terms', 'pi-credit-card', 'Outgoing payments and the credit terms they settle under.', [
    f('paymentNo', 'Payment No.'),
    f('supplierName', 'Supplier Name'),
    f('invoiceReference', 'Invoice Reference'),
    money('paidAmount', 'Paid Amount'),
    choice('paymentTerms', 'Payment Terms', ['Advance', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'LC at Sight']),
    date('paymentDate', 'Payment Date'),
    statusField([['Scheduled', 'info'], ['Processing', 'warn'], ['Paid', 'success'], ['Failed', 'danger']])
  ]),
  entity('supplier-credit-debit-note', 'Credit/Debit Note', 'Credit & Debit Notes', 'pi-replay', 'Adjustments issued to or received from a supplier after invoicing.', [
    f('noteNo', 'Note No.'),
    f('supplierName', 'Supplier Name'),
    choice('noteType', 'Note Type', ['Credit Note', 'Debit Note']),
    money('amount', 'Amount'),
    f('reason', 'Reason'),
    date('issueDate', 'Issue Date'),
    statusField([['Draft', 'info'], ['Issued', 'warn'], ['Settled', 'success']])
  ]),
  entity('supplier-blacklist', 'Blacklist Entry', 'Blacklist & Suspension', 'pi-ban', 'Suppliers barred from award, with the reason and review date.', [
    f('supplierName', 'Supplier Name'),
    choice('actionType', 'Action', ['Warning', 'Suspension', 'Blacklist', 'Reinstated']),
    f('reason', 'Reason'),
    date('effectiveDate', 'Effective Date'),
    date('reviewDate', 'Review Date'),
    f('approvedBy', 'Approved By'),
    statusField([['Active', 'danger'], ['Under Review', 'warn'], ['Lifted', 'success']])
  ]),
  entity('supplier-document-vault', 'Supplier Document', 'Document Vault', 'pi-folder', 'Trade licence, tax, insurance and bank documents held per supplier.', [
    f('supplierName', 'Supplier Name'),
    choice('documentType', 'Document Type', ['Trade Licence', 'Tax Certificate', 'Insurance', 'Bank Details', 'Quality Manual', 'W-9 / Tax Form']),
    f('documentRef', 'Document Ref.'),
    date('uploadDate', 'Upload Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger'], ['Missing', 'secondary']])
  ]),
  entity('supplier-portal-access', 'Portal User', 'Portal Access & Users', 'pi-key', 'Supplier-side logins for the self-service procurement portal.', [
    f('supplierName', 'Supplier Name'),
    f('portalUsername', 'Portal Username'),
    f('contactPerson', 'Contact Person'),
    f('email', 'Email', 'email'),
    choice('accessLevel', 'Access Level', ['View Only', 'Quote Submission', 'Invoice Submission', 'Full']),
    date('lastLoginDate', 'Last Login'),
    statusField([['Active', 'success'], ['Locked', 'warn'], ['Revoked', 'danger']])
  ]),

  // ═══════════════════════ Sales & Buyer Management ═══════════════════════
  entity('buyer-registry', 'Buyer', 'Buyer Registry', 'pi-users', 'Master record for every party the airline sells seats, cargo or services to.', [
    f('buyerCode', 'Buyer Code'),
    f('buyerName', 'Buyer Name'),
    choice('buyerType', 'Buyer Type', ['Corporate', 'Travel Agency', 'Cargo Agent', 'Charter Client', 'Interline Partner', 'MRO Customer', 'Government']),
    lookup('country', 'Country', 'country-region-master', 'countryName'),
    f('contactPerson', 'Contact Person'),
    f('email', 'Email', 'email'),
    f('phone', 'Phone'),
    statusField([['Active', 'success'], ['Prospect', 'info'], ['On Hold', 'warn'], ['Closed', 'secondary']])
  ], 14),
  entity('buyer-categories', 'Buyer Category', 'Buyer Category Setup', 'pi-tags', 'Segmentation used for pricing tiers, commissions and reporting.', [
    f('categoryCode', 'Category Code'),
    f('categoryName', 'Category Name'),
    choice('segment', 'Segment', ['Platinum', 'Gold', 'Silver', 'Standard']),
    num('defaultDiscountPct', 'Default Discount (%)', { max: 100 }),
    statusField([['Active', 'success'], ['Inactive', 'secondary']])
  ]),
  entity('buyer-contacts', 'Buyer Contact', 'Buyer Contacts', 'pi-address-book', 'Named contacts per buyer for booking, accounts and escalation.', [
    f('buyerName', 'Buyer Name'),
    f('contactPerson', 'Contact Person'),
    f('designation', 'Designation'),
    choice('contactType', 'Contact Type', ['Booking', 'Accounts', 'Decision Maker', 'Escalation']),
    f('email', 'Email', 'email'),
    f('phone', 'Phone'),
    statusField([['Primary', 'success'], ['Secondary', 'info'], ['Inactive', 'secondary']])
  ]),
  entity('corporate-accounts', 'Corporate Account', 'Corporate Accounts', 'pi-building-columns', 'Negotiated corporate travel accounts and their annual volume commitments.', [
    f('accountNo', 'Account No.'),
    f('companyName', 'Company Name'),
    f('industry', 'Industry'),
    f('accountManager', 'Account Manager'),
    money('annualCommitment', 'Annual Commitment'),
    num('discountPct', 'Discount (%)', { max: 100 }),
    date('renewalDate', 'Renewal Date'),
    statusField([['Active', 'success'], ['Renewal Due', 'warn'], ['Lapsed', 'danger']])
  ]),
  entity('travel-agency-management', 'Travel Agency', 'Travel Agents & GSA', 'pi-briefcase', 'IATA-accredited agencies and general sales agents selling on our behalf.', [
    f('iataCode', 'IATA Code'),
    f('agencyName', 'Agency Name'),
    choice('agentType', 'Agent Type', ['IATA Agent', 'Non-IATA Agent', 'GSA', 'Online Travel Agent', 'Consolidator']),
    f('territory', 'Territory'),
    num('commissionPct', 'Commission (%)', { max: 100 }),
    money('salesYtd', 'Sales YTD'),
    statusField([['Accredited', 'success'], ['Provisional', 'warn'], ['Suspended', 'danger']])
  ], 14),
  entity('cargo-agent-management', 'Cargo Agent', 'Cargo Agents (CASS)', 'pi-inbox', 'Freight forwarders and cargo agents settling through CASS.', [
    f('cassCode', 'CASS Code'),
    f('agentName', 'Agent Name'),
    f('territory', 'Territory'),
    num('commissionPct', 'Commission (%)', { max: 100 }),
    money('creditLimit', 'Credit Limit'),
    money('outstandingBalance', 'Outstanding'),
    statusField([['Active', 'success'], ['Over Limit', 'warn'], ['Suspended', 'danger']])
  ]),
  entity('interline-partners', 'Interline Partner', 'Interline & Codeshare Partners', 'pi-share-alt', 'Carriers we interline or codeshare with, and the agreement backing it.', [
    f('carrierCode', 'Carrier Code'),
    f('carrierName', 'Carrier Name'),
    choice('agreementType', 'Agreement Type', ['IATA Interline (MITA)', 'Special Prorate (SPA)', 'Codeshare Free Sale', 'Codeshare Block Space', 'Joint Venture']),
    date('effectiveDate', 'Effective Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Active', 'success'], ['Under Negotiation', 'info'], ['Expiring Soon', 'warn'], ['Terminated', 'danger']])
  ]),
  entity('credit-limit-management', 'Credit Limit', 'Credit Limit & Exposure', 'pi-gauge', 'Approved credit lines per buyer and how much is currently drawn.', [
    f('buyerName', 'Buyer Name'),
    money('approvedLimit', 'Approved Limit'),
    money('utilisedAmount', 'Utilised'),
    money('availableAmount', 'Available'),
    date('lastReviewDate', 'Last Review'),
    statusField([['Within Limit', 'success'], ['Near Limit', 'warn'], ['Exceeded', 'danger'], ['Blocked', 'contrast']])
  ]),
  entity('sales-quotation', 'Sales Quotation', 'Sales Quotations', 'pi-file-edit', 'Quotes issued to buyers for seats, cargo capacity or services.', [
    f('quotationNo', 'Quotation No.'),
    f('buyerName', 'Buyer Name'),
    f('productService', 'Product / Service'),
    money('quotedAmount', 'Quoted Amount'),
    date('issueDate', 'Issue Date'),
    date('validUntil', 'Valid Until'),
    statusField([['Draft', 'info'], ['Sent', 'warn'], ['Accepted', 'success'], ['Lost', 'danger'], ['Expired', 'secondary']])
  ]),
  entity('sales-contract', 'Sales Contract', 'Sales Contracts', 'pi-file', 'Signed corporate and agent deals, with value and renewal window.', [
    f('contractNo', 'Contract No.'),
    f('buyerName', 'Buyer Name'),
    choice('contractType', 'Contract Type', ['Corporate Deal', 'Agency Incentive', 'Cargo Capacity', 'Charter', 'MRO Services']),
    date('startDate', 'Start Date'),
    date('endDate', 'End Date'),
    money('contractValue', 'Contract Value'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger'], ['Draft', 'info']])
  ]),
  entity('sales-order', 'Sales Order', 'Sales Orders', 'pi-shopping-bag', 'Confirmed orders raised against a quotation or contract.', [
    f('orderNo', 'Order No.'),
    f('buyerName', 'Buyer Name'),
    f('contractReference', 'Contract Reference'),
    money('orderValue', 'Order Value'),
    date('orderDate', 'Order Date'),
    date('deliveryDate', 'Delivery Date'),
    statusField([['Open', 'info'], ['Partially Delivered', 'warn'], ['Delivered', 'success'], ['Cancelled', 'danger']])
  ]),
  entity('sales-pipeline', 'Opportunity', 'Opportunity Pipeline', 'pi-chart-line', 'Deals in progress, weighted by stage and expected close date.', [
    f('opportunityNo', 'Opportunity No.'),
    f('buyerName', 'Buyer Name'),
    f('accountManager', 'Account Manager'),
    money('estimatedValue', 'Estimated Value'),
    num('winProbabilityPct', 'Win Probability (%)', { max: 100 }),
    date('expectedCloseDate', 'Expected Close'),
    statusField([['Qualification', 'info'], ['Proposal', 'warn'], ['Negotiation', 'contrast'], ['Won', 'success'], ['Lost', 'danger']])
  ], 14),
  entity('tariff-fare-agreement', 'Tariff Agreement', 'Tariff & Fare Agreements', 'pi-percentage', 'Negotiated fare and rate sheets by market and booking class.', [
    f('tariffCode', 'Tariff Code'),
    f('buyerName', 'Buyer Name'),
    f('marketRoute', 'Market / Route'),
    f('bookingClass', 'Booking Class'),
    money('netFare', 'Net Fare'),
    date('validFrom', 'Valid From'),
    date('validTo', 'Valid To'),
    statusField([['Active', 'success'], ['Pending Filing', 'info'], ['Expired', 'danger']])
  ]),
  entity('commission-management', 'Commission', 'Agent Commission & Incentives', 'pi-dollar', 'Commission and incentive accruals payable to agents.', [
    f('commissionNo', 'Commission No.'),
    f('agentName', 'Agent Name'),
    f('period', 'Period'),
    money('salesVolume', 'Sales Volume'),
    num('commissionPct', 'Commission (%)', { max: 100 }),
    money('commissionAmount', 'Commission Amount'),
    statusField([['Accrued', 'info'], ['Approved', 'warn'], ['Paid', 'success'], ['Disputed', 'danger']])
  ]),
  entity('sales-invoice', 'Sales Invoice', 'Sales Invoices', 'pi-file-edit', 'Invoices raised to buyers for seats, cargo and services.', [
    f('invoiceNo', 'Invoice No.'),
    f('buyerName', 'Buyer Name'),
    money('invoiceAmount', 'Invoice Amount'),
    date('invoiceDate', 'Invoice Date'),
    date('dueDate', 'Due Date'),
    statusField([['Issued', 'info'], ['Partially Paid', 'warn'], ['Paid', 'success'], ['Overdue', 'danger'], ['Written Off', 'secondary']])
  ], 14),
  entity('sales-receipt', 'Receipt', 'Receipts & Collections', 'pi-wallet', 'Payments received from buyers and what they settle.', [
    f('receiptNo', 'Receipt No.'),
    f('buyerName', 'Buyer Name'),
    f('invoiceReference', 'Invoice Reference'),
    money('receivedAmount', 'Received Amount'),
    choice('paymentMode', 'Payment Mode', ['Bank Transfer', 'Cheque', 'Credit Card', 'Cash', 'BSP Settlement', 'CASS Settlement']),
    date('receiptDate', 'Receipt Date'),
    statusField([['Cleared', 'success'], ['Pending Clearance', 'warn'], ['Bounced', 'danger']])
  ]),
  entity('buyer-outstanding', 'Outstanding Balance', 'Outstanding & Ageing', 'pi-clock', 'Receivables ageing per buyer, bucketed by days overdue.', [
    f('buyerName', 'Buyer Name'),
    money('totalOutstanding', 'Total Outstanding'),
    money('current', 'Current'),
    money('overdue30', '31-60 Days'),
    money('overdue90', '90+ Days'),
    statusField([['Healthy', 'success'], ['Watch', 'warn'], ['Delinquent', 'danger'], ['Legal', 'contrast']])
  ]),
  entity('sales-return-credit', 'Credit Note', 'Sales Return & Credit Notes', 'pi-replay', 'Credits issued back to buyers for returns, refunds and adjustments.', [
    f('noteNo', 'Note No.'),
    f('buyerName', 'Buyer Name'),
    f('invoiceReference', 'Invoice Reference'),
    money('creditAmount', 'Credit Amount'),
    f('reason', 'Reason'),
    date('issueDate', 'Issue Date'),
    statusField([['Draft', 'info'], ['Issued', 'warn'], ['Applied', 'success']])
  ]),
  entity('third-party-mro-sales', 'MRO Sales Order', 'Third-Party MRO Sales', 'pi-wrench', 'Maintenance sold to other operators using our own hangar capacity.', [
    f('orderNo', 'Order No.'),
    f('buyerName', 'Customer Airline'),
    f('aircraftReg', 'Aircraft Reg.'),
    choice('checkType', 'Check Type', ['Line Maintenance', 'A-Check', 'C-Check', 'Component Overhaul', 'AOG Support']),
    money('contractedValue', 'Contracted Value'),
    date('inductionDate', 'Induction Date'),
    statusField([['Quoted', 'info'], ['In Work', 'warn'], ['Delivered', 'success'], ['Cancelled', 'danger']])
  ]),
  entity('parts-sales-exchange', 'Parts Transaction', 'Parts Sale / Exchange / Loan', 'pi-box', 'Surplus part sales, exchanges and loans to other operators.', [
    f('transactionNo', 'Transaction No.'),
    f('buyerName', 'Buyer Name'),
    f('partNumber', 'Part Number'),
    choice('transactionType', 'Transaction Type', ['Outright Sale', 'Exchange', 'Loan', 'Consignment']),
    money('salePrice', 'Sale Price'),
    date('shipDate', 'Ship Date'),
    date('returnDueDate', 'Return Due'),
    statusField([['Quoted', 'info'], ['Shipped', 'warn'], ['Completed', 'success'], ['Overdue Return', 'danger']])
  ]),
  entity('buyer-satisfaction-survey', 'Survey Response', 'Buyer Satisfaction Survey', 'pi-comments', 'Periodic satisfaction and NPS feedback captured from buyers.', [
    f('surveyNo', 'Survey No.'),
    f('buyerName', 'Buyer Name'),
    f('period', 'Period'),
    num('satisfactionScore', 'Satisfaction Score', { max: 10 }),
    num('npsScore', 'NPS', { min: -100, max: 100 }),
    f('feedback', 'Feedback', 'textarea', { hideInTable: true }),
    statusField([['Promoter', 'success'], ['Passive', 'info'], ['Detractor', 'danger']])
  ]),

  // ═══════════════════════ Catering & Food Services ═══════════════════════
  entity('catering-kitchen-registry', 'Flight Kitchen', 'Flight Kitchen Registry', 'pi-building', 'Catering production units serving each station, with capacity and licence.', [
    f('kitchenCode', 'Kitchen Code'),
    f('kitchenName', 'Kitchen Name'),
    f('station', 'Station'),
    f('operator', 'Operator'),
    num('dailyMealCapacity', 'Daily Meal Capacity', { max: 40000 }),
    date('licenceExpiryDate', 'Licence Expiry'),
    statusField([['Operational', 'success'], ['Limited', 'warn'], ['Suspended', 'danger']])
  ]),
  entity('catering-supplier', 'Catering Supplier', 'Catering Suppliers & Contracts', 'pi-briefcase', 'Contracted caterers per station, with rate basis and validity.', [
    f('supplierCode', 'Supplier Code'),
    f('supplierName', 'Supplier Name'),
    f('station', 'Station'),
    choice('contractBasis', 'Contract Basis', ['Per Meal', 'Per Passenger', 'Fixed Monthly', 'Cost Plus']),
    date('contractStart', 'Contract Start'),
    date('contractEnd', 'Contract End'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('menu-planning', 'Menu Cycle', 'Menu Planning & Cycles', 'pi-calendar', 'Seasonal menu cycles by route group and cabin class.', [
    f('menuCode', 'Menu Code'),
    f('menuName', 'Menu Name'),
    choice('cabinClass', 'Cabin Class', ['First', 'Business', 'Premium Economy', 'Economy']),
    f('routeGroup', 'Route Group'),
    choice('cycleWeek', 'Cycle', ['Week 1', 'Week 2', 'Week 3', 'Week 4']),
    date('effectiveFrom', 'Effective From'),
    date('effectiveTo', 'Effective To'),
    statusField([['Active', 'success'], ['Planned', 'info'], ['Retired', 'secondary']])
  ], 14),
  entity('recipe-management', 'Recipe', 'Recipe & Ingredient Master', 'pi-book', 'Standard recipes with portion size, ingredients and unit cost.', [
    f('recipeCode', 'Recipe Code'),
    f('dishName', 'Dish Name'),
    choice('course', 'Course', ['Appetizer', 'Main', 'Dessert', 'Salad', 'Breakfast', 'Snack']),
    f('mainIngredients', 'Main Ingredients'),
    num('portionGrams', 'Portion (g)', { max: 800 }),
    num('calories', 'Calories', { max: 1500 }),
    money('unitCost', 'Unit Cost'),
    statusField([['Approved', 'success'], ['Under Trial', 'info'], ['Withdrawn', 'secondary']])
  ], 14),
  entity('meal-catalogue', 'Catalogue Item', 'Meal Catalogue', 'pi-list', 'The orderable meal items per cabin class and service type.', [
    f('itemCode', 'Item Code'),
    f('itemName', 'Item Name'),
    choice('cabinClass', 'Cabin Class', ['First', 'Business', 'Premium Economy', 'Economy', 'Crew']),
    choice('serviceType', 'Service Type', ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Refreshment']),
    money('costPerUnit', 'Cost per Unit'),
    statusField([['Available', 'success'], ['Seasonal', 'info'], ['Discontinued', 'secondary']])
  ], 14),
  entity('special-meal-management', 'Special Meal Order', 'Special Meals (SPML)', 'pi-star', 'Pre-ordered special meals per passenger and flight, by IATA meal code.', [
    f('orderNo', 'Order No.'),
    f('flightNo', 'Flight No.'),
    f('pnrReference', 'PNR Reference'),
    f('passengerName', 'Passenger Name'),
    choice('mealCode', 'Meal Code', ['VGML', 'AVML', 'HNML', 'KSML', 'MOML', 'GFML', 'DBML', 'LFML', 'CHML', 'BBML', 'SPML']),
    date('flightDate', 'Flight Date'),
    statusField([['Requested', 'info'], ['Confirmed', 'warn'], ['Loaded', 'success'], ['Not Available', 'danger']])
  ], 14),
  entity('dietary-religious-compliance', 'Compliance Record', 'Halal / Kosher / Allergen', 'pi-verified', 'Certification evidence for religious and allergen-controlled catering.', [
    f('kitchenName', 'Kitchen Name'),
    choice('complianceType', 'Compliance Type', ['Halal', 'Kosher', 'Vegan Certified', 'Nut-Free Line', 'Gluten-Free Line']),
    f('certifyingBody', 'Certifying Body'),
    f('certificateNo', 'Certificate No.'),
    date('validFrom', 'Valid From'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Certified', 'success'], ['Renewal Due', 'warn'], ['Lapsed', 'danger']])
  ]),
  entity('catering-order', 'Catering Order', 'Catering Order per Flight', 'pi-shopping-cart', 'The uplift order raised per flight, driven by booked load.', [
    f('orderNo', 'Order No.'),
    f('flightNo', 'Flight No.'),
    f('station', 'Station'),
    date('flightDate', 'Flight Date'),
    num('bookedPassengers', 'Booked Pax', { max: 500 }),
    num('mealsOrdered', 'Meals Ordered', { max: 600 }),
    money('orderValue', 'Order Value'),
    statusField([['Draft', 'info'], ['Confirmed', 'warn'], ['Delivered', 'success'], ['Amended', 'contrast'], ['Cancelled', 'danger']])
  ], 16),
  entity('catering-uplift-downlift', 'Uplift Record', 'Uplift & Downlift Records', 'pi-arrow-right-arrow-left', 'What was actually loaded on and taken off each aircraft.', [
    f('recordNo', 'Record No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    datetime('upliftTime', 'Uplift Time'),
    num('mealsUplifted', 'Meals Uplifted', { max: 600 }),
    num('mealsDownlifted', 'Meals Downlifted', { max: 300 }),
    statusField([['Completed', 'success'], ['Partial', 'warn'], ['Discrepancy', 'danger']])
  ], 14),
  entity('galley-loading-plan', 'Loading Plan', 'Galley Loading Plan', 'pi-th-large', 'Cart-by-cart galley layout per aircraft type and sector length.', [
    f('planCode', 'Plan Code'),
    f('aircraftType', 'Aircraft Type'),
    f('galleyPosition', 'Galley Position'),
    choice('sectorLength', 'Sector Length', ['Short Haul', 'Medium Haul', 'Long Haul', 'Ultra Long Haul']),
    num('cartCount', 'Carts', { max: 40 }),
    statusField([['Approved', 'success'], ['Draft', 'info'], ['Superseded', 'secondary']])
  ]),
  entity('trolley-cart-management', 'Trolley', 'Trolley & Cart Management', 'pi-box', 'The physical trolley pool — where each unit is and when it was last serviced.', [
    f('trolleyNo', 'Trolley No.'),
    choice('trolleyType', 'Trolley Type', ['Full Size', 'Half Size', 'Standard Unit', 'Oven Rack', 'Ice Drawer']),
    f('currentLocation', 'Current Location'),
    f('assignedFlight', 'Assigned Flight'),
    date('lastServiceDate', 'Last Serviced'),
    statusField([['In Service', 'success'], ['In Transit', 'info'], ['Cleaning', 'warn'], ['Damaged', 'danger'], ['Missing', 'contrast']])
  ], 14),
  entity('bonded-store-management', 'Bonded Stock', 'Bonded Store & Duty-Free Stock', 'pi-lock', 'Customs-bonded liquor and duty-free stock held under seal.', [
    f('stockCode', 'Stock Code'),
    f('itemDescription', 'Item Description'),
    f('bondedWarehouse', 'Bonded Warehouse'),
    num('quantityOnHand', 'Qty on Hand', { max: 5000 }),
    f('customsSealNo', 'Customs Seal No.'),
    date('lastAuditDate', 'Last Audit'),
    statusField([['Sealed', 'success'], ['Open', 'info'], ['Discrepancy', 'danger']])
  ]),
  entity('onboard-sales', 'Onboard Sale', 'Onboard Retail Sales', 'pi-shopping-bag', 'Buy-on-board and duty-free sales reconciled per flight.', [
    f('saleNo', 'Sale No.'),
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    choice('productCategory', 'Product Category', ['Food & Beverage', 'Duty Free', 'Merchandise', 'Wi-Fi / Ancillary']),
    num('unitsSold', 'Units Sold', { max: 400 }),
    money('salesRevenue', 'Sales Revenue'),
    statusField([['Reconciled', 'success'], ['Pending', 'info'], ['Variance', 'danger']])
  ], 14),
  entity('beverage-management', 'Beverage Stock', 'Beverage & Bar Stock', 'pi-glass', 'Bar and beverage inventory held per station.', [
    f('itemCode', 'Item Code'),
    f('beverageName', 'Beverage Name'),
    choice('beverageType', 'Type', ['Soft Drink', 'Juice', 'Water', 'Beer', 'Wine', 'Spirits', 'Hot Beverage']),
    f('station', 'Station'),
    num('stockQuantity', 'Stock Qty', { max: 8000 }),
    date('expiryDate', 'Expiry Date'),
    statusField([['In Stock', 'success'], ['Low Stock', 'warn'], ['Out of Stock', 'danger'], ['Expired', 'contrast']])
  ], 14),
  entity('crew-meal-management', 'Crew Meal', 'Crew Meals', 'pi-users', 'Crew meal entitlement and loading per flight, kept distinct from pax meals.', [
    f('recordNo', 'Record No.'),
    f('flightNo', 'Flight No.'),
    choice('crewType', 'Crew Type', ['Cockpit', 'Cabin', 'Deadhead', 'Positioning']),
    num('mealsRequired', 'Meals Required', { max: 30 }),
    choice('mealPreference', 'Preference', ['Standard', 'Vegetarian', 'Halal', 'Diabetic', 'Gluten-Free']),
    statusField([['Loaded', 'success'], ['Ordered', 'info'], ['Shortfall', 'danger']])
  ]),
  entity('lounge-catering', 'Lounge Service', 'Lounge F&B Services', 'pi-home', 'Food and beverage service levels in airport lounges.', [
    f('serviceNo', 'Service No.'),
    f('loungeName', 'Lounge Name'),
    f('station', 'Station'),
    choice('serviceWindow', 'Service Window', ['Breakfast', 'All Day', 'Lunch', 'Dinner', 'Late Night']),
    num('dailyCovers', 'Daily Covers', { max: 2000 }),
    money('costPerCover', 'Cost per Cover'),
    statusField([['Operational', 'success'], ['Reduced Service', 'warn'], ['Closed', 'danger']])
  ]),
  entity('catering-inventory', 'Catering Item', 'Catering Inventory', 'pi-inbox', 'Consumables, tableware and disposables held for catering.', [
    f('itemCode', 'Item Code'),
    f('itemName', 'Item Name'),
    choice('itemCategory', 'Category', ['Dry Store', 'Chilled', 'Frozen', 'Tableware', 'Disposables', 'Linen']),
    f('station', 'Station'),
    num('quantityOnHand', 'Qty on Hand', { max: 10000 }),
    num('reorderLevel', 'Reorder Level', { max: 2000 }),
    statusField([['Adequate', 'success'], ['Reorder', 'warn'], ['Critical', 'danger']])
  ], 14),
  entity('food-safety-haccp', 'HACCP Check', 'Food Safety & HACCP', 'pi-shield', 'Critical control point checks — temperature, holding time, chain of custody.', [
    f('checkNo', 'Check No.'),
    f('kitchenName', 'Kitchen Name'),
    choice('controlPoint', 'Control Point', ['Receiving Temp', 'Cold Storage', 'Cooking Temp', 'Blast Chilling', 'Holding Time', 'Transport Temp']),
    datetime('checkTime', 'Check Time'),
    num('measuredTempC', 'Measured Temp (°C)', { min: -30, max: 100 }),
    f('checkedBy', 'Checked By'),
    statusField([['Within Limits', 'success'], ['Deviation', 'warn'], ['Critical Failure', 'danger']])
  ], 16),
  entity('kitchen-hygiene-audit', 'Hygiene Audit', 'Kitchen Hygiene Audit', 'pi-search', 'Scheduled hygiene and sanitation audits of catering units.', [
    f('auditNo', 'Audit No.'),
    f('kitchenName', 'Kitchen Name'),
    date('auditDate', 'Audit Date'),
    f('auditor', 'Auditor'),
    num('hygieneScore', 'Hygiene Score', { max: 100 }),
    num('findingsCount', 'Findings', { max: 40 }),
    statusField([['Pass', 'success'], ['Conditional Pass', 'warn'], ['Fail', 'danger']])
  ]),
  entity('food-wastage', 'Wastage Record', 'Food Wastage & Variance', 'pi-trash', 'Meals loaded but not consumed, and the loading variance behind it.', [
    f('recordNo', 'Record No.'),
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    num('mealsLoaded', 'Meals Loaded', { max: 600 }),
    num('mealsConsumed', 'Meals Consumed', { max: 600 }),
    num('wastagePct', 'Wastage (%)', { max: 100 }),
    money('wastageCost', 'Wastage Cost'),
    statusField([['Acceptable', 'success'], ['High', 'warn'], ['Excessive', 'danger']])
  ], 14),
  entity('catering-billing', 'Catering Invoice', 'Catering Billing', 'pi-dollar', 'Caterer invoices verified against uplift records and cost per passenger.', [
    f('invoiceNo', 'Invoice No.'),
    f('supplierName', 'Supplier Name'),
    f('period', 'Period'),
    money('invoiceAmount', 'Invoice Amount'),
    money('costPerPassenger', 'Cost per Pax'),
    date('invoiceDate', 'Invoice Date'),
    statusField([['Received', 'info'], ['Verified', 'warn'], ['Approved', 'success'], ['Disputed', 'danger']])
  ]),
  entity('meal-complaint', 'Meal Complaint', 'Meal Complaints & Feedback', 'pi-comment', 'Passenger complaints about catering, routed back to the responsible kitchen.', [
    f('complaintNo', 'Complaint No.'),
    f('flightNo', 'Flight No.'),
    f('passengerName', 'Passenger Name'),
    choice('complaintType', 'Complaint Type', ['Quality', 'Temperature', 'Wrong Meal', 'Not Loaded', 'Foreign Object', 'Allergen Concern']),
    date('reportedDate', 'Reported Date'),
    f('responsibleKitchen', 'Responsible Kitchen'),
    statusField([['Open', 'danger'], ['Investigating', 'warn'], ['Resolved', 'success']])
  ]),

  // ═════════════════ IRROPS & Passenger Care (Disruption) ═════════════════
  entity('disruption-event', 'Disruption Event', 'Disruption Events', 'pi-exclamation-triangle', 'The delay, cancellation or diversion that triggers everything else in this module.', [
    f('eventNo', 'Event No.'),
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    choice('disruptionType', 'Disruption Type', ['Delay', 'Cancellation', 'Diversion', 'Return to Ramp', 'Return to Base']),
    num('delayMinutes', 'Delay (min)', { max: 2880 }),
    num('affectedPassengers', 'Affected Pax', { max: 600 }),
    f('reasonSummary', 'Reason', 'textarea', { hideInTable: true }),
    statusField([['Open', 'danger'], ['Managing', 'warn'], ['Recovered', 'success'], ['Closed', 'secondary']])
  ], 16),
  entity('disruption-cause-code', 'Cause Code', 'Delay & Cancel Cause Codes', 'pi-tags', 'IATA delay coding used to attribute disruption and decide who pays.', [
    f('causeCode', 'Cause Code'),
    f('description', 'Description'),
    choice('causeCategory', 'Category', ['Airline Controllable', 'Technical', 'Weather', 'ATC / Airport', 'Security', 'Extraordinary Circumstance']),
    choice('compensationLiable', 'Compensation Liable', ['Yes', 'No', 'Case by Case']),
    statusField([['Active', 'success'], ['Retired', 'secondary']])
  ], 14),
  entity('irrops-decision-log', 'Decision', 'IRROPS Decision Log', 'pi-book', 'What Operations Control decided, when, and on whose authority.', [
    f('logNo', 'Log No.'),
    f('eventReference', 'Event Reference'),
    datetime('decisionTime', 'Decision Time'),
    choice('decisionType', 'Decision Type', ['Delay', 'Cancel', 'Divert', 'Aircraft Swap', 'Crew Swap', 'Consolidate Flights', 'Ferry']),
    f('decisionBy', 'Decision By'),
    f('rationale', 'Rationale', 'textarea', { hideInTable: true }),
    statusField([['Executed', 'success'], ['Pending', 'info'], ['Reversed', 'warn']])
  ]),
  entity('passenger-impact-list', 'Impacted Passenger', 'Impacted Passenger List', 'pi-users', 'Every passenger on a disrupted flight, with their onward connection risk.', [
    f('eventReference', 'Event Reference'),
    f('pnrReference', 'PNR Reference'),
    f('passengerName', 'Passenger Name'),
    f('flightNo', 'Flight No.'),
    choice('cabinClass', 'Cabin Class', ['First', 'Business', 'Premium Economy', 'Economy']),
    choice('connectionRisk', 'Connection Risk', ['No Connection', 'At Risk', 'Misconnected']),
    statusField([['Awaiting Action', 'danger'], ['Rebooked', 'success'], ['Accommodated', 'info'], ['Refunded', 'secondary']])
  ], 18),
  entity('passenger-reaccommodation', 'Re-accommodation', 'Re-accommodation & Rebooking', 'pi-sync', 'Where each disrupted passenger was moved to — our flight or an interline partner.', [
    f('caseNo', 'Case No.'),
    f('pnrReference', 'PNR Reference'),
    f('passengerName', 'Passenger Name'),
    f('originalFlight', 'Original Flight'),
    f('newFlight', 'New Flight'),
    choice('rebookingType', 'Rebooking Type', ['Same Carrier', 'Interline (FIM)', 'Next Day', 'Alternate Airport', 'Ground Transport', 'Refund']),
    datetime('newDepartureTime', 'New Departure'),
    statusField([['Proposed', 'info'], ['Confirmed', 'success'], ['Declined', 'warn'], ['Failed', 'danger']])
  ], 16),
  entity('denied-boarding', 'Denied Boarding', 'Denied Boarding & Offload', 'pi-user-minus', 'Voluntary and involuntary denied boarding, with the compensation offered.', [
    f('caseNo', 'Case No.'),
    f('flightNo', 'Flight No.'),
    f('passengerName', 'Passenger Name'),
    choice('boardingDenialType', 'Denial Type', ['Voluntary', 'Involuntary', 'Operational Offload', 'Weight Restriction']),
    money('compensationOffered', 'Compensation Offered'),
    date('incidentDate', 'Incident Date'),
    statusField([['Open', 'danger'], ['Offer Accepted', 'warn'], ['Settled', 'success'], ['Escalated', 'contrast']])
  ]),
  entity('hotel-partner-registry', 'Hotel Partner', 'Hotel Partner Registry', 'pi-building', 'Contracted hotels per station used to accommodate disrupted passengers.', [
    f('hotelCode', 'Hotel Code'),
    f('hotelName', 'Hotel Name'),
    lookup('station', 'Station', 'airport-master', 'iataCode'),
    num('starRating', 'Star Rating', { min: 1, max: 5 }),
    num('distanceFromAirportKm', 'Distance (km)', { max: 60 }),
    num('totalRooms', 'Total Rooms', { max: 800 }),
    f('contactPerson', 'Contact Person'),
    f('phone', 'Phone'),
    statusField([['Contracted', 'success'], ['Standby', 'info'], ['Suspended', 'danger']])
  ], 16),
  entity('hotel-rate-contract', 'Rate Contract', 'Hotel Rate Contracts & Allotments', 'pi-file', 'Negotiated nightly rates and guaranteed room allotments per hotel.', [
    f('contractNo', 'Contract No.'),
    f('hotelName', 'Hotel Name'),
    f('station', 'Station'),
    money('nightlyRate', 'Nightly Rate'),
    num('guaranteedAllotment', 'Guaranteed Rooms', { max: 200 }),
    choice('inclusions', 'Inclusions', ['Room Only', 'Room + Breakfast', 'Half Board', 'Full Board', 'Board + Transfer']),
    date('validFrom', 'Valid From'),
    date('validTo', 'Valid To'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ], 14),
  entity('hotel-room-booking', 'Room Booking', 'Passenger Hotel Booking', 'pi-home', 'The actual room booked for a disrupted passenger — the core HOTAC record.', [
    f('bookingNo', 'Booking No.'),
    f('eventReference', 'Event Reference'),
    f('passengerName', 'Passenger Name'),
    f('pnrReference', 'PNR Reference'),
    f('hotelName', 'Hotel Name'),
    choice('roomType', 'Room Type', ['Single', 'Double', 'Twin', 'Triple', 'Accessible']),
    date('checkInDate', 'Check-in Date'),
    date('checkOutDate', 'Check-out Date'),
    num('nights', 'Nights', { max: 10 }),
    money('roomCost', 'Room Cost'),
    statusField([['Requested', 'info'], ['Confirmed', 'success'], ['Checked In', 'contrast'], ['No Show', 'warn'], ['Cancelled', 'danger']])
  ], 20),
  entity('hotel-room-inventory', 'Room Block', 'Room Block & Availability', 'pi-th-large', 'Live room availability per hotel and date, so the desk knows what it can hold.', [
    f('hotelName', 'Hotel Name'),
    f('station', 'Station'),
    date('inventoryDate', 'Date'),
    num('roomsHeld', 'Rooms Held', { max: 200 }),
    num('roomsUsed', 'Rooms Used', { max: 200 }),
    num('roomsAvailable', 'Rooms Available', { max: 200 }),
    statusField([['Available', 'success'], ['Limited', 'warn'], ['Sold Out', 'danger']])
  ], 14),
  entity('passenger-transport', 'Transport Booking', 'Passenger Ground Transport', 'pi-car', 'Coaches and taxis moving disrupted passengers between airport and hotel.', [
    f('transportNo', 'Transport No.'),
    f('eventReference', 'Event Reference'),
    choice('transportType', 'Transport Type', ['Coach', 'Minibus', 'Taxi', 'Rail Transfer', 'Private Car']),
    f('operator', 'Operator'),
    f('pickupPoint', 'Pickup Point'),
    f('dropPoint', 'Drop Point'),
    datetime('pickupTime', 'Pickup Time'),
    num('passengerCount', 'Passengers', { max: 300 }),
    money('transportCost', 'Cost'),
    statusField([['Booked', 'info'], ['Dispatched', 'warn'], ['Completed', 'success'], ['Cancelled', 'danger']])
  ], 14),
  entity('meal-voucher', 'Meal Voucher', 'Meal & Refreshment Vouchers', 'pi-ticket', 'Vouchers issued to waiting passengers, tracked by value and redemption.', [
    f('voucherNo', 'Voucher No.'),
    f('eventReference', 'Event Reference'),
    f('passengerName', 'Passenger Name'),
    choice('voucherType', 'Voucher Type', ['Refreshment', 'Meal', 'Lounge Access', 'Airport Credit']),
    money('voucherValue', 'Value'),
    date('issueDate', 'Issue Date'),
    statusField([['Issued', 'info'], ['Redeemed', 'success'], ['Expired', 'secondary'], ['Void', 'danger']])
  ], 16),
  entity('communication-voucher', 'Communication Allowance', 'Communication Allowance', 'pi-phone', 'Phone, SMS and Wi-Fi allowances owed to passengers under duty of care.', [
    f('allowanceNo', 'Allowance No.'),
    f('eventReference', 'Event Reference'),
    f('passengerName', 'Passenger Name'),
    choice('allowanceType', 'Allowance Type', ['Phone Call', 'SMS', 'Wi-Fi Voucher', 'Email Credit']),
    money('allowanceValue', 'Value'),
    date('issueDate', 'Issue Date'),
    statusField([['Issued', 'info'], ['Used', 'success'], ['Expired', 'secondary']])
  ]),
  entity('duty-of-care-entitlement', 'Entitlement Rule', 'Duty of Care Entitlement Rules', 'pi-list-check', 'The rule table that decides who gets a hotel, a meal, or nothing.', [
    f('ruleCode', 'Rule Code'),
    choice('regulation', 'Regulation', ['EU 261/2004', 'UK 261', 'US DOT', 'Canada APPR', 'Company Policy']),
    num('delayThresholdHours', 'Delay Threshold (hrs)', { max: 48 }),
    choice('entitlement', 'Entitlement', ['Refreshment', 'Meal', 'Hotel + Transport', 'Rerouting', 'Full Compensation']),
    f('conditions', 'Conditions', 'textarea', { hideInTable: true }),
    statusField([['Active', 'success'], ['Under Review', 'warn'], ['Superseded', 'secondary']])
  ]),
  entity('ec261-compensation', 'Compensation Claim', 'Consumer Compensation Claims', 'pi-dollar', 'Statutory compensation claims (EC261 and equivalents) from disrupted passengers.', [
    f('claimNo', 'Claim No.'),
    f('eventReference', 'Event Reference'),
    f('passengerName', 'Passenger Name'),
    f('flightNo', 'Flight No.'),
    choice('regulation', 'Regulation', ['EU 261/2004', 'UK 261', 'US DOT', 'Canada APPR', 'Montreal Convention']),
    money('claimedAmount', 'Claimed Amount'),
    money('settledAmount', 'Settled Amount'),
    date('claimDate', 'Claim Date'),
    statusField([['Received', 'info'], ['Under Assessment', 'warn'], ['Approved', 'success'], ['Rejected', 'danger'], ['Paid', 'secondary']])
  ], 16),
  entity('irrops-expense-claim', 'Expense Claim', 'Disruption Expense Claims', 'pi-receipt', 'Out-of-pocket costs passengers paid themselves and want reimbursed.', [
    f('claimNo', 'Claim No.'),
    f('eventReference', 'Event Reference'),
    f('passengerName', 'Passenger Name'),
    choice('expenseType', 'Expense Type', ['Hotel', 'Meals', 'Transport', 'Alternate Ticket', 'Communication', 'Other']),
    money('claimedAmount', 'Claimed Amount'),
    money('approvedAmount', 'Approved Amount'),
    date('submissionDate', 'Submitted'),
    statusField([['Submitted', 'info'], ['Under Review', 'warn'], ['Approved', 'success'], ['Rejected', 'danger'], ['Reimbursed', 'secondary']])
  ], 14),
  entity('hotel-invoice-reconciliation', 'Hotel Invoice', 'Hotel Invoice Reconciliation', 'pi-file-edit', 'Hotel bills matched line-by-line against the rooms we actually authorised.', [
    f('invoiceNo', 'Invoice No.'),
    f('hotelName', 'Hotel Name'),
    f('period', 'Period'),
    num('roomNightsBilled', 'Room Nights Billed', { max: 2000 }),
    num('roomNightsAuthorised', 'Room Nights Authorised', { max: 2000 }),
    money('invoiceAmount', 'Invoice Amount'),
    money('varianceAmount', 'Variance'),
    statusField([['Matched', 'success'], ['Variance', 'warn'], ['Disputed', 'danger'], ['Paid', 'secondary']])
  ], 14),
  entity('stranded-passenger-tracking', 'Stranded Passenger', 'Stranded Passenger Tracking', 'pi-map-marker', 'Who is still stuck, where, and for how long — the desk\'s live worklist.', [
    f('trackingNo', 'Tracking No.'),
    f('passengerName', 'Passenger Name'),
    f('pnrReference', 'PNR Reference'),
    f('currentStation', 'Current Station'),
    num('hoursStranded', 'Hours Stranded', { max: 120 }),
    choice('careProvided', 'Care Provided', ['None Yet', 'Refreshment', 'Meal', 'Hotel', 'Hotel + Transport']),
    statusField([['Critical', 'danger'], ['Being Handled', 'warn'], ['Accommodated', 'info'], ['Departed', 'success']])
  ], 16),
  entity('special-assistance-irrops', 'Assistance Case', 'Special Assistance During IRROPS', 'pi-heart', 'PRM, unaccompanied minors and medical cases needing priority in a disruption.', [
    f('caseNo', 'Case No.'),
    f('eventReference', 'Event Reference'),
    f('passengerName', 'Passenger Name'),
    choice('assistanceType', 'Assistance Type', ['WCHR', 'WCHS', 'WCHC', 'Unaccompanied Minor', 'Medical Case', 'Visually Impaired', 'Hearing Impaired']),
    f('assignedAgent', 'Assigned Agent'),
    choice('priorityLevel', 'Priority', ['Critical', 'High', 'Normal']),
    statusField([['Open', 'danger'], ['In Progress', 'warn'], ['Handled', 'success']])
  ]),
  entity('misconnection-management', 'Misconnection', 'Misconnection Management', 'pi-sync', 'Passengers who will miss their onward sector, and what we are doing about it.', [
    f('caseNo', 'Case No.'),
    f('pnrReference', 'PNR Reference'),
    f('passengerName', 'Passenger Name'),
    f('inboundFlight', 'Inbound Flight'),
    f('onwardFlight', 'Onward Flight'),
    num('connectionShortfallMin', 'Shortfall (min)', { max: 600 }),
    f('transferStation', 'Transfer Station'),
    statusField([['At Risk', 'warn'], ['Misconnected', 'danger'], ['Protected', 'success'], ['Made Connection', 'info']])
  ], 14),
  entity('diversion-management', 'Diversion', 'Diversion & Alternate Handling', 'pi-directions-alt', 'Flights put down somewhere unplanned, and the handling arranged there.', [
    f('diversionNo', 'Diversion No.'),
    f('flightNo', 'Flight No.'),
    f('plannedDestination', 'Planned Destination'),
    f('diversionAirport', 'Diversion Airport'),
    choice('diversionReason', 'Reason', ['Weather', 'Medical', 'Technical', 'ATC', 'Security', 'Runway Closure', 'Fuel']),
    datetime('landingTime', 'Landing Time'),
    choice('handlingArranged', 'Handling Arranged', ['Full Handling', 'Technical Stop Only', 'Fuel Only', 'None']),
    statusField([['Active', 'danger'], ['Passengers Disembarked', 'warn'], ['Recovered', 'success']])
  ]),
  entity('irrops-cost-tracking', 'Disruption Cost', 'Disruption Cost Tracking', 'pi-chart-bar', 'What each disruption actually cost, broken down by care category.', [
    f('eventReference', 'Event Reference'),
    f('flightNo', 'Flight No.'),
    money('hotelCost', 'Hotel Cost'),
    money('transportCost', 'Transport Cost'),
    money('voucherCost', 'Voucher Cost'),
    money('compensationCost', 'Compensation Cost'),
    money('totalCost', 'Total Cost'),
    statusField([['Provisional', 'info'], ['Finalised', 'success'], ['Under Review', 'warn']])
  ], 14),
  entity('irrops-passenger-notification', 'Notification', 'Passenger Notification Log', 'pi-send', 'Every message sent to passengers during a disruption, and whether it landed.', [
    f('notificationNo', 'Notification No.'),
    f('eventReference', 'Event Reference'),
    choice('channel', 'Channel', ['SMS', 'Email', 'App Push', 'Airport Announcement', 'Phone Call']),
    f('messageSummary', 'Message'),
    datetime('sentTime', 'Sent Time'),
    num('recipientCount', 'Recipients', { max: 600 }),
    statusField([['Sent', 'success'], ['Queued', 'info'], ['Partially Failed', 'warn'], ['Failed', 'danger']])
  ], 14),

  // ═══════════════════ Crew & Staff Travel (HOTAC) ════════════════════════
  entity('travel-request', 'Travel Request', 'Duty Travel Request', 'pi-file-edit', 'An employee\'s request to travel on company business.', [
    f('requestNo', 'Request No.'),
    f('employeeName', 'Employee Name'),
    f('department', 'Department'),
    choice('travelPurpose', 'Purpose', ['Duty Travel', 'Training', 'Meeting', 'Audit', 'AOG Support', 'Positioning', 'Conference']),
    f('origin', 'Origin'),
    f('destination', 'Destination'),
    date('departureDate', 'Departure Date'),
    date('returnDate', 'Return Date'),
    statusField([['Draft', 'info'], ['Submitted', 'warn'], ['Approved', 'success'], ['Rejected', 'danger'], ['Completed', 'secondary']])
  ], 16),
  entity('travel-approval', 'Approval', 'Travel Approval Workflow', 'pi-check-square', 'Who approved which travel request, at which level, and when.', [
    f('approvalNo', 'Approval No.'),
    f('requestReference', 'Request Reference'),
    f('employeeName', 'Employee Name'),
    choice('approvalLevel', 'Approval Level', ['Line Manager', 'Department Head', 'Finance', 'CEO']),
    f('approverName', 'Approver'),
    datetime('actionDate', 'Action Date'),
    statusField([['Pending', 'info'], ['Approved', 'success'], ['Rejected', 'danger'], ['Returned', 'warn']])
  ], 14),
  entity('travel-policy', 'Policy Rule', 'Travel Policy & Entitlements', 'pi-book', 'Entitlement grades — cabin class, hotel category and per diem by employee band.', [
    f('policyCode', 'Policy Code'),
    f('employeeGrade', 'Employee Grade'),
    choice('cabinEntitlement', 'Cabin Entitlement', ['Economy', 'Premium Economy', 'Business', 'First']),
    choice('hotelCategory', 'Hotel Category', ['3 Star', '4 Star', '5 Star', 'Company Accommodation']),
    money('perDiemRate', 'Per Diem Rate'),
    date('effectiveFrom', 'Effective From'),
    statusField([['Active', 'success'], ['Under Revision', 'warn'], ['Superseded', 'secondary']])
  ]),
  entity('crew-layover-hotel', 'Layover Booking', 'Crew Layover Hotel (HOTAC)', 'pi-home', 'The hotel room booked for crew on a scheduled layover.', [
    f('bookingNo', 'Booking No.'),
    f('crewMember', 'Crew Member'),
    f('dutyPairing', 'Duty Pairing'),
    f('station', 'Station'),
    f('hotelName', 'Hotel Name'),
    date('checkInDate', 'Check-in Date'),
    date('checkOutDate', 'Check-out Date'),
    num('restHours', 'Rest Hours', { max: 72 }),
    money('roomCost', 'Room Cost'),
    statusField([['Confirmed', 'success'], ['Requested', 'info'], ['Checked In', 'contrast'], ['Cancelled', 'danger'], ['No Show', 'warn']])
  ], 20),
  entity('crew-hotel-contract', 'Crew Hotel Contract', 'Crew Hotel Contracts & Rates', 'pi-file', 'Layover hotel agreements — rate, allotment and minimum rest suitability.', [
    f('contractNo', 'Contract No.'),
    f('hotelName', 'Hotel Name'),
    f('station', 'Station'),
    money('nightlyRate', 'Nightly Rate'),
    num('roomAllotment', 'Room Allotment', { max: 120 }),
    choice('restSuitability', 'Rest Suitability', ['Approved for Rest', 'Day Use Only', 'Not Rest Approved']),
    date('validFrom', 'Valid From'),
    date('validTo', 'Valid To'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ], 14),
  entity('crew-room-allocation', 'Rooming List', 'Crew Room Allocation', 'pi-th-large', 'The rooming list sent to the hotel — who is in which room, arriving when.', [
    f('allocationNo', 'Allocation No.'),
    f('hotelName', 'Hotel Name'),
    f('flightNo', 'Flight No.'),
    f('crewMember', 'Crew Member'),
    f('roomNumber', 'Room Number'),
    choice('crewRole', 'Crew Role', ['Captain', 'First Officer', 'Purser', 'Cabin Crew', 'Engineer', 'Deadhead']),
    datetime('arrivalTime', 'Arrival Time'),
    statusField([['Allocated', 'success'], ['Pending', 'info'], ['Changed', 'warn']])
  ], 16),
  entity('crew-transport', 'Crew Transport', 'Crew Transport', 'pi-car', 'Pickup and drop between airport, hotel and crew base.', [
    f('transportNo', 'Transport No.'),
    f('station', 'Station'),
    choice('transportType', 'Transport Type', ['Crew Bus', 'Minibus', 'Taxi', 'Company Car']),
    f('pickupPoint', 'Pickup Point'),
    f('dropPoint', 'Drop Point'),
    datetime('pickupTime', 'Pickup Time'),
    num('crewCount', 'Crew Count', { max: 25 }),
    statusField([['Scheduled', 'info'], ['Dispatched', 'warn'], ['Completed', 'success'], ['Missed', 'danger']])
  ], 14),
  entity('positioning-deadhead', 'Positioning Travel', 'Positioning / Deadhead Travel', 'pi-send', 'Crew flown as passengers to get them where the roster needs them.', [
    f('recordNo', 'Record No.'),
    f('crewMember', 'Crew Member'),
    choice('travelMode', 'Travel Mode', ['Own Metal', 'Other Carrier', 'Rail', 'Road']),
    f('flightNo', 'Flight No.'),
    f('origin', 'Origin'),
    f('destination', 'Destination'),
    datetime('departureTime', 'Departure Time'),
    money('ticketCost', 'Ticket Cost'),
    statusField([['Booked', 'success'], ['Requested', 'info'], ['Travelled', 'secondary'], ['Cancelled', 'danger']])
  ], 14),
  entity('staff-travel-ticket', 'Staff Ticket', 'Staff Travel Tickets (ID90/ID50)', 'pi-ticket', 'Concessional staff and family travel tickets and their rebate level.', [
    f('ticketNo', 'Ticket No.'),
    f('employeeName', 'Employee Name'),
    choice('travellerType', 'Traveller Type', ['Employee', 'Spouse', 'Child', 'Parent', 'Retiree', 'Industry Partner']),
    choice('rebateType', 'Rebate Type', ['ID90', 'ID75', 'ID50', 'Firm Discount', 'Duty Travel']),
    f('routeSector', 'Route / Sector'),
    date('travelDate', 'Travel Date'),
    money('ticketCost', 'Ticket Cost'),
    statusField([['Issued', 'success'], ['Standby', 'info'], ['Used', 'secondary'], ['Refused Boarding', 'warn'], ['Cancelled', 'danger']])
  ], 16),
  entity('staff-standby-listing', 'Standby Listing', 'Staff Standby Listing', 'pi-list', 'The standby queue per flight, ordered by boarding priority.', [
    f('listingNo', 'Listing No.'),
    f('employeeName', 'Employee Name'),
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    num('priorityRank', 'Priority Rank', { max: 99 }),
    num('seniorityYears', 'Seniority (yrs)', { max: 45 }),
    statusField([['Listed', 'info'], ['Cleared', 'success'], ['Not Cleared', 'warn'], ['Offloaded', 'danger']])
  ], 14),
  entity('duty-travel-itinerary', 'Itinerary', 'Travel Itinerary', 'pi-map', 'The full door-to-door plan issued against an approved travel request.', [
    f('itineraryNo', 'Itinerary No.'),
    f('requestReference', 'Request Reference'),
    f('employeeName', 'Employee Name'),
    f('routing', 'Routing'),
    datetime('departureTime', 'Departure Time'),
    datetime('returnTime', 'Return Time'),
    f('hotelName', 'Hotel Name'),
    statusField([['Draft', 'info'], ['Issued', 'success'], ['Amended', 'warn'], ['Cancelled', 'danger']])
  ], 14),
  entity('per-diem-management', 'Per Diem', 'Per Diem & Allowance', 'pi-money-bill', 'Daily subsistence allowance calculated per trip and destination band.', [
    f('perDiemNo', 'Per Diem No.'),
    f('employeeName', 'Employee Name'),
    f('tripReference', 'Trip Reference'),
    f('destinationCountry', 'Destination Country'),
    num('numberOfDays', 'Days', { max: 60 }),
    money('dailyRate', 'Daily Rate'),
    money('totalAllowance', 'Total Allowance'),
    statusField([['Calculated', 'info'], ['Approved', 'warn'], ['Paid', 'success'], ['Recovered', 'danger']])
  ], 14),
  entity('travel-advance', 'Travel Advance', 'Travel Advance', 'pi-wallet', 'Cash advanced before a trip, and how much is still to be settled.', [
    f('advanceNo', 'Advance No.'),
    f('employeeName', 'Employee Name'),
    f('tripReference', 'Trip Reference'),
    money('advanceAmount', 'Advance Amount'),
    money('settledAmount', 'Settled Amount'),
    date('issueDate', 'Issue Date'),
    date('settlementDueDate', 'Settlement Due'),
    statusField([['Issued', 'info'], ['Partially Settled', 'warn'], ['Settled', 'success'], ['Overdue', 'danger']])
  ]),
  entity('travel-expense-claim', 'Expense Claim', 'Travel Expense Claim', 'pi-receipt', 'Line-item expenses claimed after a trip, with receipt status.', [
    f('claimNo', 'Claim No.'),
    f('employeeName', 'Employee Name'),
    f('tripReference', 'Trip Reference'),
    choice('expenseCategory', 'Category', ['Airfare', 'Hotel', 'Meals', 'Local Transport', 'Visa Fee', 'Communication', 'Miscellaneous']),
    money('claimedAmount', 'Claimed Amount'),
    date('submissionDate', 'Submitted'),
    choice('receiptAttached', 'Receipt Attached', ['Yes', 'No', 'Partial']),
    statusField([['Submitted', 'info'], ['Under Review', 'warn'], ['Approved', 'success'], ['Rejected', 'danger']])
  ], 16),
  entity('travel-expense-settlement', 'Settlement', 'Expense Settlement', 'pi-check-circle', 'Final settlement — claim against advance, net payable or recoverable.', [
    f('settlementNo', 'Settlement No.'),
    f('employeeName', 'Employee Name'),
    f('tripReference', 'Trip Reference'),
    money('totalClaimed', 'Total Claimed'),
    money('advanceTaken', 'Advance Taken'),
    money('netPayable', 'Net Payable'),
    date('settlementDate', 'Settlement Date'),
    statusField([['Pending', 'info'], ['Processed', 'warn'], ['Paid', 'success'], ['Recovered from Payroll', 'contrast']])
  ], 14),
  entity('corporate-travel-agency', 'Travel Management Company', 'Corporate Travel Agency (TMC)', 'pi-briefcase', 'The agencies booking our staff travel, and their service terms.', [
    f('agencyCode', 'Agency Code'),
    f('agencyName', 'Agency Name'),
    f('contactPerson', 'Contact Person'),
    f('phone', 'Phone'),
    money('serviceFeePerBooking', 'Service Fee / Booking'),
    date('contractEnd', 'Contract End'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Terminated', 'danger']])
  ]),
  entity('visa-passport-tracking', 'Travel Document', 'Visa & Passport Tracking', 'pi-id-card', 'Passport and visa validity per employee — the thing that grounds a trip.', [
    f('employeeName', 'Employee Name'),
    choice('documentType', 'Document Type', ['Passport', 'Tourist Visa', 'Business Visa', 'Work Permit', 'Residence Permit', 'Transit Visa']),
    f('documentNumber', 'Document Number'),
    f('issuingCountry', 'Issuing Country'),
    date('issueDate', 'Issue Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger'], ['Under Process', 'info']])
  ], 16),
  entity('crew-visa-gendec', 'Crew Document', 'Crew Visa & GENDEC', 'pi-file', 'Crew-specific immigration paperwork per station and flight.', [
    f('recordNo', 'Record No.'),
    f('crewMember', 'Crew Member'),
    f('station', 'Station'),
    choice('documentType', 'Document Type', ['Crew Member Certificate', 'Crew Visa', 'GENDEC', 'Landing Permit']),
    f('flightNo', 'Flight No.'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger'], ['Not Required', 'secondary']])
  ]),
  entity('travel-insurance', 'Insurance Policy', 'Travel Insurance', 'pi-shield', 'Business-travel insurance cover per employee or trip.', [
    f('policyNo', 'Policy No.'),
    f('employeeName', 'Employee Name'),
    f('insurer', 'Insurer'),
    choice('coverageType', 'Coverage Type', ['Individual Trip', 'Annual Multi-Trip', 'Group Policy', 'Crew Loss of Licence']),
    money('coverageAmount', 'Coverage Amount'),
    date('validFrom', 'Valid From'),
    date('validTo', 'Valid To'),
    statusField([['Active', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('accommodation-facility', 'Company Accommodation', 'Company Accommodation', 'pi-building', 'Company-owned or leased housing used instead of hotels.', [
    f('facilityCode', 'Facility Code'),
    f('facilityName', 'Facility Name'),
    f('station', 'Station'),
    choice('facilityType', 'Facility Type', ['Crew Rest House', 'Staff Apartment', 'Leased Villa', 'Training Hostel']),
    num('totalRooms', 'Total Rooms', { max: 200 }),
    num('occupiedRooms', 'Occupied Rooms', { max: 200 }),
    money('monthlyCost', 'Monthly Cost'),
    statusField([['Available', 'success'], ['Full', 'warn'], ['Under Maintenance', 'danger']])
  ]),
  entity('crew-rest-facility', 'Rest Facility', 'Crew Rest & Fatigue Facility', 'pi-moon', 'On-airport rest rooms and quiet areas, and how heavily they are used.', [
    f('facilityCode', 'Facility Code'),
    f('facilityName', 'Facility Name'),
    f('station', 'Station'),
    choice('facilityType', 'Facility Type', ['Nap Room', 'Quiet Room', 'Crew Lounge', 'Bunk Facility']),
    num('capacity', 'Capacity', { max: 60 }),
    num('utilisationPct', 'Utilisation (%)', { max: 100 }),
    statusField([['Operational', 'success'], ['Limited', 'warn'], ['Closed', 'danger']])
  ]),
  entity('travel-cost-analysis', 'Travel Cost Record', 'Travel Cost Tracking', 'pi-chart-bar', 'What travel and accommodation cost per department and period.', [
    f('period', 'Period'),
    f('department', 'Department'),
    money('airfareCost', 'Airfare Cost'),
    money('hotelCost', 'Hotel Cost'),
    money('perDiemCost', 'Per Diem Cost'),
    money('totalCost', 'Total Cost'),
    money('budgetAmount', 'Budget'),
    statusField([['Within Budget', 'success'], ['Near Budget', 'warn'], ['Over Budget', 'danger']])
  ], 14),
  entity('hotel-service-quality', 'Hotel Feedback', 'Hotel Service Quality', 'pi-star', 'Crew and staff ratings of contracted hotels, feeding the next rate review.', [
    f('feedbackNo', 'Feedback No.'),
    f('hotelName', 'Hotel Name'),
    f('station', 'Station'),
    f('submittedBy', 'Submitted By'),
    num('cleanlinessScore', 'Cleanliness', { max: 10 }),
    num('restQualityScore', 'Rest Quality', { max: 10 }),
    num('overallScore', 'Overall', { max: 10 }),
    statusField([['Excellent', 'success'], ['Acceptable', 'info'], ['Below Standard', 'warn'], ['Unacceptable', 'danger']])
  ], 14),

  // ═══════════════════════ Ground Handling Services ═══════════════════════
  entity('gha-registry', 'Ground Handler', 'Ground Handler (GHA) Registry', 'pi-building', 'The handling agents contracted at each station.', [
    f('ghaCode', 'GHA Code'),
    f('ghaName', 'Handler Name'),
    lookup('station', 'Station', 'airport-master', 'iataCode'),
    choice('handlingScope', 'Handling Scope', ['Full Handling', 'Ramp Only', 'Passenger Only', 'Cargo Only', 'Self-Handled']),
    f('stationManager', 'Station Manager'),
    date('licenceExpiryDate', 'Licence Expiry'),
    statusField([['Active', 'success'], ['Probation', 'warn'], ['Terminated', 'danger']])
  ], 14),
  entity('gha-sgha-contract', 'SGHA Contract', 'SGHA / Annex B Contracts', 'pi-file', 'The IATA Standard Ground Handling Agreement and its station-specific Annex B.', [
    f('contractNo', 'Contract No.'),
    f('ghaName', 'Handler Name'),
    f('station', 'Station'),
    choice('sghaVersion', 'SGHA Version', ['SGHA 2013', 'SGHA 2018', 'SGHA 2023', 'Bespoke']),
    date('effectiveDate', 'Effective Date'),
    date('expiryDate', 'Expiry Date'),
    money('annualValue', 'Annual Value'),
    statusField([['Active', 'success'], ['Under Negotiation', 'info'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('ground-service-catalogue', 'Service Rate', 'Service Catalogue & Rates', 'pi-list', 'Priced service lines from Annex B — what each turnaround task costs.', [
    f('serviceCode', 'Service Code'),
    f('serviceName', 'Service Name'),
    f('station', 'Station'),
    choice('chargeBasis', 'Charge Basis', ['Per Turnaround', 'Per Passenger', 'Per Tonne', 'Per Hour', 'Fixed Monthly']),
    money('rate', 'Rate'),
    f('aircraftType', 'Aircraft Type'),
    statusField([['Active', 'success'], ['Under Review', 'warn'], ['Withdrawn', 'secondary']])
  ], 14),
  entity('turnaround-service-order', 'Service Order', 'Turnaround Service Order', 'pi-clipboard', 'The bundle of services ordered for one aircraft turnaround.', [
    f('orderNo', 'Order No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('station', 'Station'),
    datetime('onBlockTime', 'On-Block Time'),
    datetime('offBlockTime', 'Off-Block Time'),
    num('turnaroundMinutes', 'Turnaround (min)', { max: 600 }),
    statusField([['Planned', 'info'], ['In Progress', 'warn'], ['Completed', 'success'], ['Delayed', 'danger']])
  ], 18),
  entity('ramp-handling', 'Ramp Operation', 'Ramp Handling Operations', 'pi-car', 'Loading, unloading and marshalling activity on stand.', [
    f('operationNo', 'Operation No.'),
    f('flightNo', 'Flight No.'),
    f('standNo', 'Stand No.'),
    choice('operationType', 'Operation Type', ['Loading', 'Unloading', 'Marshalling', 'Chocks & Cones', 'Belt Loading', 'Container Transfer']),
    f('teamLeader', 'Team Leader'),
    datetime('startTime', 'Start Time'),
    num('durationMinutes', 'Duration (min)', { max: 240 }),
    statusField([['Scheduled', 'info'], ['In Progress', 'warn'], ['Completed', 'success'], ['Delayed', 'danger']])
  ], 16),
  entity('passenger-handling-service', 'Passenger Service', 'Passenger Handling Services', 'pi-users', 'Check-in, boarding and arrivals services delivered per flight.', [
    f('serviceNo', 'Service No.'),
    f('flightNo', 'Flight No.'),
    choice('serviceType', 'Service Type', ['Check-in', 'Boarding Gate', 'Arrivals', 'Transfer Desk', 'Special Assistance', 'Lost & Found']),
    num('agentsDeployed', 'Agents Deployed', { max: 40 }),
    num('passengersHandled', 'Passengers Handled', { max: 600 }),
    statusField([['Scheduled', 'info'], ['In Progress', 'warn'], ['Completed', 'success'], ['Understaffed', 'danger']])
  ], 14),
  entity('pushback-towing', 'Pushback Job', 'Pushback & Towing', 'pi-arrow-left', 'Pushback and tow jobs, the tug used and who drove it.', [
    f('jobNo', 'Job No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    choice('jobType', 'Job Type', ['Pushback', 'Powerback', 'Maintenance Tow', 'Repositioning Tow']),
    f('tugEquipment', 'Tug Equipment'),
    f('operatorName', 'Operator'),
    datetime('startTime', 'Start Time'),
    statusField([['Scheduled', 'info'], ['In Progress', 'warn'], ['Completed', 'success'], ['Aborted', 'danger']])
  ], 14),
  entity('aircraft-cleaning', 'Cleaning Job', 'Aircraft Cleaning & Grooming', 'pi-sparkles', 'Interior cleaning per turnaround or overnight, with QC outcome.', [
    f('jobNo', 'Job No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    choice('cleaningType', 'Cleaning Type', ['Transit Clean', 'Overnight Clean', 'Deep Clean', 'Disinfection', 'Exterior Wash']),
    num('crewSize', 'Crew Size', { max: 25 }),
    num('durationMinutes', 'Duration (min)', { max: 480 }),
    statusField([['Scheduled', 'info'], ['In Progress', 'warn'], ['Completed', 'success'], ['QC Failed', 'danger']])
  ], 14),
  entity('lavatory-water-service', 'Servicing Record', 'Lavatory & Potable Water', 'pi-filter', 'Toilet servicing and potable water uplift per turnaround.', [
    f('recordNo', 'Record No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    choice('serviceType', 'Service Type', ['Lavatory Service', 'Potable Water Uplift', 'Both']),
    num('waterUpliftedLitres', 'Water Uplifted (L)', { max: 2000 }),
    f('operatorName', 'Operator'),
    statusField([['Completed', 'success'], ['Scheduled', 'info'], ['Skipped', 'warn'], ['Contamination Alert', 'danger']])
  ]),
  entity('deicing-service', 'De-icing Job', 'De-icing / Anti-icing Service', 'pi-cloud', 'De-icing jobs, fluid consumed and the holdover time issued.', [
    f('jobNo', 'Job No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    choice('fluidType', 'Fluid Type', ['Type I', 'Type II', 'Type III', 'Type IV']),
    num('fluidLitres', 'Fluid Used (L)', { max: 6000 }),
    num('holdoverMinutes', 'Holdover (min)', { max: 180 }),
    datetime('completionTime', 'Completion Time'),
    statusField([['Completed', 'success'], ['In Progress', 'warn'], ['Repeat Required', 'danger']])
  ], 14),
  entity('gpu-acu-service', 'Power/Air Service', 'GPU / ACU / Air Start', 'pi-bolt', 'Ground power, air conditioning and air start supplied to parked aircraft.', [
    f('serviceNo', 'Service No.'),
    f('flightNo', 'Flight No.'),
    f('standNo', 'Stand No.'),
    choice('serviceType', 'Service Type', ['Ground Power (GPU)', 'Pre-Conditioned Air', 'Air Start', 'Fixed Electrical Ground Power']),
    num('durationMinutes', 'Duration (min)', { max: 600 }),
    money('serviceCharge', 'Service Charge'),
    statusField([['Completed', 'success'], ['In Progress', 'warn'], ['Equipment Failure', 'danger']])
  ], 14),
  entity('gse-allocation', 'GSE Allocation', 'GSE Allocation & Dispatch', 'pi-truck', 'Which ground support unit is assigned to which flight, and when.', [
    f('allocationNo', 'Allocation No.'),
    f('equipmentNo', 'Equipment No.'),
    choice('equipmentType', 'Equipment Type', ['Belt Loader', 'Pushback Tug', 'Container Loader', 'Passenger Stairs', 'GPU', 'Water Truck', 'Catering Hi-Lift', 'Ambulift']),
    f('flightNo', 'Flight No.'),
    f('assignedOperator', 'Assigned Operator'),
    datetime('allocatedFrom', 'Allocated From'),
    statusField([['Allocated', 'success'], ['In Use', 'info'], ['Released', 'secondary'], ['Breakdown', 'danger']])
  ], 16),
  entity('gse-maintenance', 'GSE Maintenance', 'GSE Maintenance', 'pi-wrench', 'Servicing and repair of the ground fleet, keeping units serviceable.', [
    f('workOrderNo', 'Work Order No.'),
    f('equipmentNo', 'Equipment No.'),
    choice('maintenanceType', 'Maintenance Type', ['Scheduled Service', 'Breakdown Repair', 'Annual Inspection', 'Tyre Change', 'Hydraulic Service']),
    date('serviceDate', 'Service Date'),
    date('nextServiceDue', 'Next Service Due'),
    money('maintenanceCost', 'Cost'),
    statusField([['Open', 'info'], ['In Progress', 'warn'], ['Completed', 'success'], ['Awaiting Parts', 'danger']])
  ], 14),
  entity('gse-fuel-consumption', 'GSE Fuel Record', 'GSE Fuel & Charging', 'pi-bolt', 'Diesel, petrol and electric charging consumed by the ground fleet.', [
    f('recordNo', 'Record No.'),
    f('equipmentNo', 'Equipment No.'),
    choice('energyType', 'Energy Type', ['Diesel', 'Petrol', 'Electric Charge', 'Hydrogen', 'LPG']),
    num('quantityUnits', 'Quantity', { max: 800 }),
    money('cost', 'Cost'),
    date('recordDate', 'Date'),
    statusField([['Recorded', 'success'], ['Pending Verification', 'info'], ['Variance', 'danger']])
  ], 14),
  entity('ground-staff-roster', 'Roster Line', 'Ground Staff Roster', 'pi-table', 'Shift rostering for ramp, passenger and cargo teams.', [
    f('rosterNo', 'Roster No.'),
    f('staffName', 'Staff Name'),
    f('station', 'Station'),
    choice('shift', 'Shift', ['Morning', 'Afternoon', 'Night', 'Split', 'Standby']),
    choice('teamFunction', 'Team', ['Ramp', 'Passenger Services', 'Cargo', 'Baggage', 'Load Control', 'GSE']),
    date('rosterDate', 'Roster Date'),
    statusField([['Published', 'success'], ['Draft', 'info'], ['Swapped', 'warn'], ['Absent', 'danger']])
  ], 16),
  entity('ramp-safety-inspection', 'Safety Inspection', 'Ramp Safety Inspection', 'pi-shield', 'Apron safety walks — FOD, equipment positioning, PPE compliance.', [
    f('inspectionNo', 'Inspection No.'),
    f('station', 'Station'),
    f('standNo', 'Stand No.'),
    date('inspectionDate', 'Inspection Date'),
    f('inspector', 'Inspector'),
    num('findingsCount', 'Findings', { max: 30 }),
    statusField([['Pass', 'success'], ['Observations', 'info'], ['Minor Findings', 'warn'], ['Major Findings', 'danger']])
  ], 14),
  entity('ground-damage-report', 'Damage Report', 'Ground Damage Report', 'pi-exclamation-triangle', 'Aircraft and equipment damage caused during ground operations.', [
    f('reportNo', 'Report No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    choice('damageType', 'Damage Type', ['Aircraft Skin', 'Door / Hinge', 'Engine Cowl', 'GSE Damage', 'Cargo Hold', 'Winglet']),
    f('causingEquipment', 'Causing Equipment'),
    date('incidentDate', 'Incident Date'),
    money('estimatedCost', 'Estimated Cost'),
    statusField([['Reported', 'danger'], ['Under Investigation', 'warn'], ['Repaired', 'info'], ['Closed', 'success']])
  ], 14),
  entity('load-control-sheet', 'Load Sheet', 'Load Control & Loadsheet', 'pi-file-edit', 'The final loadsheet issued to the flight deck for each departure.', [
    f('loadsheetNo', 'Loadsheet No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    num('passengerCount', 'Passengers', { max: 600 }),
    num('baggageWeightKg', 'Baggage (kg)', { max: 25000 }),
    num('cargoWeightKg', 'Cargo (kg)', { max: 60000 }),
    f('loadController', 'Load Controller'),
    statusField([['Draft', 'info'], ['Final', 'success'], ['Amended (LMC)', 'warn'], ['Rejected', 'danger']])
  ], 16),
  entity('weight-balance', 'Weight & Balance', 'Weight & Balance', 'pi-gauge', 'Mass and centre-of-gravity computation checked against aircraft limits.', [
    f('calculationNo', 'Calculation No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    num('zeroFuelWeightKg', 'Zero Fuel Weight (kg)', { max: 250000 }),
    num('takeoffWeightKg', 'Take-off Weight (kg)', { max: 400000 }),
    num('centreOfGravityPct', 'CG (% MAC)', { max: 60 }),
    statusField([['Within Limits', 'success'], ['Near Limit', 'warn'], ['Out of Limits', 'danger']])
  ], 14),
  entity('uld-management', 'ULD', 'ULD Management & Control', 'pi-box', 'Unit load device stock control — where each container and pallet is.', [
    f('uldNumber', 'ULD Number'),
    choice('uldType', 'ULD Type', ['AKE Container', 'AMA Container', 'PMC Pallet', 'PAG Pallet', 'LD3', 'LD7']),
    f('currentStation', 'Current Station'),
    f('assignedFlight', 'Assigned Flight'),
    choice('condition', 'Condition', ['Serviceable', 'Damaged', 'Under Repair', 'Scrapped']),
    date('lastMovementDate', 'Last Movement'),
    statusField([['In Stock', 'success'], ['In Transit', 'info'], ['Overdue Return', 'warn'], ['Lost', 'danger']])
  ], 16),
  entity('into-plane-fueling', 'Fuelling Job', 'Into-Plane Fuelling Service', 'pi-bolt', 'The physical fuel uplift job on stand, and the ticket it generates.', [
    f('jobNo', 'Job No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('fuellingAgent', 'Fuelling Agent'),
    num('upliftLitres', 'Uplift (L)', { max: 200000 }),
    f('fuelTicketNo', 'Fuel Ticket No.'),
    datetime('completionTime', 'Completion Time'),
    statusField([['Completed', 'success'], ['In Progress', 'warn'], ['Aborted', 'danger'], ['Quality Hold', 'contrast']])
  ], 16),
  entity('gha-sla-performance', 'SLA Record', 'GHA SLA & Performance', 'pi-chart-line', 'Contracted service levels vs. what the handler actually delivered.', [
    f('ghaName', 'Handler Name'),
    f('station', 'Station'),
    f('period', 'Period'),
    num('onTimeTurnaroundPct', 'On-Time Turnaround (%)', { max: 100 }),
    num('damageIncidents', 'Damage Incidents', { max: 50 }),
    num('slaScore', 'SLA Score', { max: 100 }),
    money('penaltyAmount', 'Penalty'),
    statusField([['Meeting SLA', 'success'], ['At Risk', 'warn'], ['Breach', 'danger']])
  ], 14),
  entity('ground-handling-billing', 'Handling Invoice', 'Ground Handling Billing', 'pi-dollar', 'Handler invoices verified against the service orders actually raised.', [
    f('invoiceNo', 'Invoice No.'),
    f('ghaName', 'Handler Name'),
    f('station', 'Station'),
    f('period', 'Period'),
    num('turnaroundsBilled', 'Turnarounds Billed', { max: 2000 }),
    money('invoiceAmount', 'Invoice Amount'),
    money('varianceAmount', 'Variance'),
    statusField([['Received', 'info'], ['Verified', 'warn'], ['Approved', 'success'], ['Disputed', 'danger']])
  ], 14),

  // ═════════════════ Training & Simulator Management ══════════════════════
  entity('training-course-catalogue', 'Course', 'Course Catalogue', 'pi-book', 'Every course the academy offers, with duration, validity and regulator category.', [
    f('courseCode', 'Course Code'),
    f('courseTitle', 'Course Title'),
    choice('courseCategory', 'Category', ['Type Rating', 'Recurrent', 'Initial', 'Dangerous Goods', 'CRM', 'SEP', 'Security', 'Technical', 'Ground Handling']),
    num('durationDays', 'Duration (days)', { max: 90 }),
    num('validityMonths', 'Validity (months)', { max: 60 }),
    money('courseFee', 'Course Fee'),
    statusField([['Active', 'success'], ['Under Revision', 'warn'], ['Withdrawn', 'secondary']])
  ], 16),
  entity('training-curriculum', 'Curriculum', 'Curriculum & Syllabus', 'pi-list', 'Module-by-module syllabus behind each course.', [
    f('curriculumCode', 'Curriculum Code'),
    f('courseTitle', 'Course Title'),
    f('moduleTitle', 'Module Title'),
    choice('deliveryMode', 'Delivery Mode', ['Classroom', 'E-Learning', 'Simulator', 'On-the-Job', 'Blended']),
    num('contactHours', 'Contact Hours', { max: 200 }),
    f('version', 'Version'),
    statusField([['Approved', 'success'], ['Draft', 'info'], ['Superseded', 'secondary']])
  ], 14),
  entity('training-program-approval', 'Program Approval', 'Regulatory Program Approval', 'pi-verified', 'Regulator approval of training programs — the ATO/AMO paperwork.', [
    f('approvalNo', 'Approval No.'),
    f('programName', 'Program Name'),
    f('regulator', 'Regulator'),
    choice('approvalType', 'Approval Type', ['ATO Certificate', 'Part 142', 'Part 147', 'Program Amendment', 'Instructor Approval']),
    date('approvalDate', 'Approval Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Approved', 'success'], ['Pending Submission', 'info'], ['Expiring Soon', 'warn'], ['Expired', 'danger']])
  ]),
  entity('instructor-management', 'Instructor', 'Instructor & Examiner Management', 'pi-user-edit', 'Instructors and examiners, their authorisations and currency.', [
    f('instructorNo', 'Instructor No.'),
    f('instructorName', 'Instructor Name'),
    choice('instructorType', 'Instructor Type', ['TRI', 'TRE', 'SFI', 'SFE', 'Line Trainer', 'Ground Instructor', 'CRM Trainer']),
    f('qualifiedOnType', 'Qualified on Type'),
    date('authorisationExpiry', 'Authorisation Expiry'),
    num('teachingHoursYtd', 'Teaching Hours YTD', { max: 1200 }),
    statusField([['Current', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger'], ['Suspended', 'contrast']])
  ], 14),
  entity('trainee-enrollment', 'Enrollment', 'Trainee Enrollment', 'pi-user-plus', 'Who is enrolled on which course, and whether they have paid or been sponsored.', [
    f('enrollmentNo', 'Enrollment No.'),
    f('traineeName', 'Trainee Name'),
    f('courseTitle', 'Course Title'),
    choice('traineeType', 'Trainee Type', ['Employee', 'Cadet', 'External Customer', 'Sponsored', 'Contractor']),
    date('enrollmentDate', 'Enrollment Date'),
    statusField([['Enrolled', 'success'], ['Waitlisted', 'info'], ['Withdrawn', 'warn'], ['Completed', 'secondary']])
  ], 18),
  entity('training-batch', 'Batch', 'Training Batch / Class', 'pi-users', 'A cohort running a course together, with its instructor and headcount.', [
    f('batchCode', 'Batch Code'),
    f('courseTitle', 'Course Title'),
    f('leadInstructor', 'Lead Instructor'),
    date('startDate', 'Start Date'),
    date('endDate', 'End Date'),
    num('enrolledCount', 'Enrolled', { max: 40 }),
    num('capacity', 'Capacity', { max: 40 }),
    statusField([['Scheduled', 'info'], ['Running', 'warn'], ['Completed', 'success'], ['Cancelled', 'danger']])
  ], 14),
  entity('training-schedule', 'Session', 'Training Schedule', 'pi-calendar', 'Individual timetabled sessions — room, instructor and slot.', [
    f('sessionNo', 'Session No.'),
    f('batchCode', 'Batch Code'),
    f('moduleTitle', 'Module Title'),
    f('instructorName', 'Instructor'),
    f('venue', 'Venue'),
    datetime('sessionStart', 'Session Start'),
    num('durationHours', 'Duration (hrs)', { max: 12 }),
    statusField([['Scheduled', 'info'], ['In Progress', 'warn'], ['Completed', 'success'], ['Cancelled', 'danger'], ['Rescheduled', 'contrast']])
  ], 18),
  entity('classroom-management', 'Classroom', 'Classroom & Facility Booking', 'pi-building', 'Training rooms and CBT labs, and how heavily they are booked.', [
    f('roomCode', 'Room Code'),
    f('roomName', 'Room Name'),
    f('location', 'Location'),
    choice('roomType', 'Room Type', ['Classroom', 'CBT Lab', 'Cabin Mock-up', 'Door Trainer', 'Pool / Wet Drill', 'Briefing Room']),
    num('capacity', 'Capacity', { max: 100 }),
    num('utilisationPct', 'Utilisation (%)', { max: 100 }),
    statusField([['Available', 'success'], ['Fully Booked', 'warn'], ['Under Maintenance', 'danger']])
  ]),
  entity('simulator-registry', 'Simulator', 'Simulator Registry', 'pi-desktop', 'The FFS/FTD estate — level, type and qualification validity.', [
    f('simulatorCode', 'Simulator Code'),
    f('aircraftType', 'Aircraft Type'),
    choice('deviceLevel', 'Device Level', ['FFS Level D', 'FFS Level C', 'FTD Level 2', 'FNPT II', 'CEET', 'Door Trainer']),
    f('location', 'Location'),
    f('manufacturer', 'Manufacturer'),
    date('qualificationExpiry', 'Qualification Expiry'),
    statusField([['Qualified', 'success'], ['Recert Due', 'warn'], ['Out of Service', 'danger']])
  ]),
  entity('simulator-slot-booking', 'Sim Slot', 'Simulator Slot Booking', 'pi-calendar-clock', 'Booked simulator time — the scarcest resource in the whole academy.', [
    f('slotNo', 'Slot No.'),
    f('simulatorCode', 'Simulator Code'),
    f('traineeName', 'Trainee Name'),
    f('instructorName', 'Instructor'),
    datetime('slotStart', 'Slot Start'),
    num('slotHours', 'Slot Hours', { max: 8 }),
    choice('sessionType', 'Session Type', ['Type Rating', 'LPC', 'OPC', 'Recurrent', 'LOFT', 'Base Training', 'External Customer']),
    statusField([['Booked', 'success'], ['Available', 'info'], ['Completed', 'secondary'], ['Cancelled', 'danger'], ['No Show', 'warn']])
  ], 20),
  entity('simulator-maintenance', 'Sim Maintenance', 'Simulator Maintenance & Qualification', 'pi-wrench', 'Sim downtime, QTG runs and recurrent evaluation by the regulator.', [
    f('recordNo', 'Record No.'),
    f('simulatorCode', 'Simulator Code'),
    choice('activityType', 'Activity Type', ['Preventive Maintenance', 'Fault Rectification', 'QTG Run', 'Regulator Evaluation', 'Software Update']),
    date('activityDate', 'Activity Date'),
    num('downtimeHours', 'Downtime (hrs)', { max: 200 }),
    statusField([['Completed', 'success'], ['In Progress', 'warn'], ['Deferred', 'info'], ['Sim Unserviceable', 'danger']])
  ], 14),
  entity('type-rating-management', 'Type Rating', 'Type Rating Management', 'pi-id-card', 'Which pilot holds which type rating, and when it lapses.', [
    f('ratingNo', 'Rating No.'),
    f('pilotName', 'Pilot Name'),
    f('aircraftType', 'Aircraft Type'),
    choice('ratingStatus', 'Rating Type', ['Initial Issue', 'Revalidation', 'Renewal', 'Additional Type', 'Restricted']),
    date('issueDate', 'Issue Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Expiring Soon', 'warn'], ['Expired', 'danger'], ['In Training', 'info']])
  ], 16),
  entity('line-training-check', 'Line Training', 'Line Training & Line Check', 'pi-send', 'Supervised line sectors and the line check that releases a pilot to line.', [
    f('recordNo', 'Record No.'),
    f('pilotName', 'Pilot Name'),
    f('aircraftType', 'Aircraft Type'),
    f('lineTrainingCaptain', 'Line Training Captain'),
    num('sectorsCompleted', 'Sectors Completed', { max: 120 }),
    num('sectorsRequired', 'Sectors Required', { max: 120 }),
    date('checkDate', 'Check Date'),
    statusField([['In Progress', 'info'], ['Passed', 'success'], ['Extension Required', 'warn'], ['Failed', 'danger']])
  ], 14),
  entity('proficiency-check', 'Proficiency Check', 'Proficiency Check (LPC/OPC)', 'pi-check-square', 'Licence and operator proficiency checks, and their next-due date.', [
    f('checkNo', 'Check No.'),
    f('crewMember', 'Crew Member'),
    choice('checkType', 'Check Type', ['LPC', 'OPC', 'Line Check', 'SEP Check', 'Low Visibility', 'ETOPS']),
    f('examinerName', 'Examiner'),
    date('checkDate', 'Check Date'),
    date('nextDueDate', 'Next Due'),
    statusField([['Passed', 'success'], ['Partial Pass', 'warn'], ['Failed', 'danger'], ['Scheduled', 'info']])
  ], 18),
  entity('recurrent-training-plan', 'Recurrent Plan', 'Recurrent Training Plan', 'pi-refresh', 'The rolling plan that keeps every crew member legal on their cycle.', [
    f('planNo', 'Plan No.'),
    f('crewMember', 'Crew Member'),
    f('trainingElement', 'Training Element'),
    date('lastCompletedDate', 'Last Completed'),
    date('nextDueDate', 'Next Due'),
    num('daysToExpiry', 'Days to Expiry', { min: -180, max: 365 }),
    statusField([['Current', 'success'], ['Due Soon', 'warn'], ['Overdue', 'danger'], ['Grounded', 'contrast']])
  ], 18),
  entity('training-attendance', 'Attendance', 'Training Attendance', 'pi-calendar-plus', 'Session-by-session attendance, which drives course completion.', [
    f('attendanceNo', 'Attendance No.'),
    f('traineeName', 'Trainee Name'),
    f('sessionReference', 'Session Reference'),
    date('sessionDate', 'Session Date'),
    num('hoursAttended', 'Hours Attended', { max: 12 }),
    statusField([['Present', 'success'], ['Late', 'warn'], ['Absent', 'danger'], ['Excused', 'info']])
  ], 18),
  entity('training-assessment', 'Assessment', 'Assessment & Exam Results', 'pi-file-check', 'Written and practical assessment results per trainee.', [
    f('assessmentNo', 'Assessment No.'),
    f('traineeName', 'Trainee Name'),
    f('courseTitle', 'Course Title'),
    choice('assessmentType', 'Assessment Type', ['Written Exam', 'Oral Exam', 'Practical', 'Simulator Assessment', 'Continuous Assessment']),
    num('scorePct', 'Score (%)', { max: 100 }),
    num('passMarkPct', 'Pass Mark (%)', { max: 100 }),
    date('assessmentDate', 'Assessment Date'),
    statusField([['Pass', 'success'], ['Marginal Pass', 'warn'], ['Fail', 'danger'], ['Retest Scheduled', 'info']])
  ], 18),
  entity('competency-framework', 'Competency', 'Competency (EBT/CBTA) Framework', 'pi-sitemap', 'Evidence-based training competencies and observed behaviour ratings.', [
    f('competencyCode', 'Competency Code'),
    f('competencyName', 'Competency Name'),
    choice('competencyArea', 'Area', ['Knowledge', 'Application of Procedures', 'Communication', 'Flight Path Management', 'Leadership & Teamwork', 'Problem Solving', 'Situation Awareness', 'Workload Management']),
    f('crewMember', 'Crew Member'),
    num('observedRating', 'Observed Rating', { max: 5 }),
    statusField([['Competent', 'success'], ['Developing', 'warn'], ['Below Standard', 'danger']])
  ], 16),
  entity('training-certificate-issue', 'Certificate', 'Certificate Issuance', 'pi-verified', 'Certificates issued on course completion and their validity window.', [
    f('certificateNo', 'Certificate No.'),
    f('traineeName', 'Trainee Name'),
    f('courseTitle', 'Course Title'),
    date('issueDate', 'Issue Date'),
    date('validUntil', 'Valid Until'),
    f('issuedBy', 'Issued By'),
    statusField([['Issued', 'success'], ['Pending', 'info'], ['Expired', 'danger'], ['Revoked', 'contrast']])
  ], 16),
  entity('training-record-file', 'Training File', 'Individual Training File', 'pi-folder', 'The regulator-required personal training file per crew member.', [
    f('fileNo', 'File No.'),
    f('crewMember', 'Crew Member'),
    f('employeeNo', 'Employee No.'),
    num('completedCourses', 'Completed Courses', { max: 120 }),
    num('outstandingItems', 'Outstanding Items', { max: 30 }),
    date('lastAuditDate', 'Last Audit'),
    statusField([['Complete', 'success'], ['Items Outstanding', 'warn'], ['Non-Compliant', 'danger']])
  ], 14),
  entity('elearning-module', 'E-Learning Module', 'E-Learning Modules', 'pi-desktop', 'Online modules, their completion rates and refresh cycle.', [
    f('moduleCode', 'Module Code'),
    f('moduleTitle', 'Module Title'),
    num('durationMinutes', 'Duration (min)', { max: 480 }),
    num('completionRatePct', 'Completion Rate (%)', { max: 100 }),
    date('lastUpdatedDate', 'Last Updated'),
    statusField([['Published', 'success'], ['Draft', 'info'], ['Under Revision', 'warn'], ['Retired', 'secondary']])
  ], 14),
  entity('training-feedback', 'Feedback', 'Training Feedback', 'pi-comments', 'Trainee evaluation of course content, instructor and facilities.', [
    f('feedbackNo', 'Feedback No.'),
    f('courseTitle', 'Course Title'),
    f('traineeName', 'Trainee Name'),
    f('instructorName', 'Instructor'),
    num('contentScore', 'Content Score', { max: 10 }),
    num('instructorScore', 'Instructor Score', { max: 10 }),
    num('overallScore', 'Overall Score', { max: 10 }),
    statusField([['Excellent', 'success'], ['Good', 'info'], ['Needs Improvement', 'warn'], ['Poor', 'danger']])
  ], 14),
  entity('training-cost-billing', 'Training Invoice', 'Training Cost & Billing', 'pi-dollar', 'Internal recharge and external customer billing for training delivered.', [
    f('invoiceNo', 'Invoice No.'),
    f('billedTo', 'Billed To'),
    f('courseTitle', 'Course Title'),
    num('traineeCount', 'Trainees', { max: 60 }),
    money('costPerTrainee', 'Cost per Trainee'),
    money('totalAmount', 'Total Amount'),
    date('invoiceDate', 'Invoice Date'),
    statusField([['Draft', 'info'], ['Issued', 'warn'], ['Paid', 'success'], ['Internal Recharge', 'secondary']])
  ], 14),

  // ═══════════════════ Charter & Aircraft Leasing ═════════════════════════
  entity('charter-enquiry', 'Charter Enquiry', 'Charter Enquiry', 'pi-inbox', 'Incoming charter requests before they become a quote.', [
    f('enquiryNo', 'Enquiry No.'),
    f('clientName', 'Client Name'),
    choice('charterType', 'Charter Type', ['Passenger', 'Cargo', 'VIP', 'Hajj / Umrah', 'Sports Team', 'Government', 'Humanitarian']),
    f('origin', 'Origin'),
    f('destination', 'Destination'),
    date('requestedDate', 'Requested Date'),
    num('passengerCount', 'Passengers', { max: 600 }),
    statusField([['New', 'info'], ['Under Review', 'warn'], ['Quoted', 'contrast'], ['Declined', 'danger']])
  ], 16),
  entity('charter-quotation', 'Charter Quotation', 'Charter Quotation', 'pi-file-edit', 'Priced charter offers issued to a client, with validity.', [
    f('quotationNo', 'Quotation No.'),
    f('enquiryReference', 'Enquiry Reference'),
    f('clientName', 'Client Name'),
    f('aircraftType', 'Aircraft Type'),
    money('quotedAmount', 'Quoted Amount'),
    date('validUntil', 'Valid Until'),
    statusField([['Sent', 'info'], ['Negotiating', 'warn'], ['Accepted', 'success'], ['Declined', 'danger'], ['Expired', 'secondary']])
  ], 14),
  entity('charter-contract', 'Charter Contract', 'Charter Contract', 'pi-file', 'The signed charter agreement and its commercial terms.', [
    f('contractNo', 'Contract No.'),
    f('clientName', 'Client Name'),
    f('aircraftType', 'Aircraft Type'),
    num('numberOfSectors', 'Sectors', { max: 200 }),
    money('contractValue', 'Contract Value'),
    date('startDate', 'Start Date'),
    date('endDate', 'End Date'),
    statusField([['Active', 'success'], ['Draft', 'info'], ['Completed', 'secondary'], ['Terminated', 'danger']])
  ], 14),
  entity('charter-flight-schedule', 'Charter Flight', 'Charter Flight Schedule', 'pi-calendar', 'Individual charter sectors flown under a contract.', [
    f('charterFlightNo', 'Charter Flight No.'),
    f('contractReference', 'Contract Reference'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('origin', 'Origin'),
    f('destination', 'Destination'),
    datetime('departureTime', 'Departure Time'),
    num('passengerCount', 'Passengers', { max: 600 }),
    statusField([['Scheduled', 'info'], ['Operated', 'success'], ['Delayed', 'warn'], ['Cancelled', 'danger']])
  ], 16),
  entity('charter-pricing-model', 'Pricing Model', 'Charter Pricing & Costing', 'pi-calculator', 'The cost build-up behind a charter price — block hours, fuel, crew, handling.', [
    f('modelCode', 'Model Code'),
    f('aircraftType', 'Aircraft Type'),
    money('blockHourRate', 'Block Hour Rate'),
    money('fuelCostEstimate', 'Fuel Cost Estimate'),
    money('crewCost', 'Crew Cost'),
    money('handlingCost', 'Handling Cost'),
    num('marginPct', 'Margin (%)', { max: 100 }),
    statusField([['Active', 'success'], ['Under Review', 'warn'], ['Superseded', 'secondary']])
  ]),
  entity('hajj-umrah-operations', 'Pilgrim Operation', 'Hajj / Umrah Operations', 'pi-globe', 'Seasonal pilgrim charter programmes and their allocated quota.', [
    f('operationNo', 'Operation No.'),
    f('season', 'Season'),
    f('agentOperator', 'Agent / Operator'),
    f('routeSector', 'Route / Sector'),
    num('pilgrimQuota', 'Pilgrim Quota', { max: 20000 }),
    num('flightsPlanned', 'Flights Planned', { max: 400 }),
    statusField([['Planned', 'info'], ['Approved', 'success'], ['Operating', 'warn'], ['Completed', 'secondary']])
  ]),
  entity('vip-special-charter', 'VIP Charter', 'VIP & Special Charter', 'pi-star', 'Head-of-state, VIP and special-mission charters with elevated handling.', [
    f('charterNo', 'Charter No.'),
    f('clientName', 'Client Name'),
    choice('missionType', 'Mission Type', ['Head of State', 'Corporate VIP', 'Medical Evacuation', 'Sports Team', 'Film Crew', 'Humanitarian Relief']),
    f('aircraftReg', 'Aircraft Reg.'),
    date('missionDate', 'Mission Date'),
    choice('securityLevel', 'Security Level', ['Standard', 'Enhanced', 'Maximum']),
    statusField([['Planned', 'info'], ['Confirmed', 'success'], ['Operated', 'secondary'], ['Cancelled', 'danger']])
  ]),
  entity('cargo-charter', 'Cargo Charter', 'Cargo Charter', 'pi-inbox', 'Full-freighter and part-charter cargo movements.', [
    f('charterNo', 'Charter No.'),
    f('clientName', 'Client Name'),
    f('commodity', 'Commodity'),
    num('payloadTonnes', 'Payload (t)', { max: 150 }),
    f('origin', 'Origin'),
    f('destination', 'Destination'),
    money('charterRate', 'Charter Rate'),
    statusField([['Booked', 'success'], ['Quoted', 'info'], ['Operated', 'secondary'], ['Cancelled', 'danger']])
  ], 14),
  entity('acmi-agreement', 'ACMI Agreement', 'ACMI / Wet Lease Agreement', 'pi-file', 'Aircraft, Crew, Maintenance & Insurance leases in or out.', [
    f('agreementNo', 'Agreement No.'),
    f('counterparty', 'Counterparty'),
    choice('leaseDirection', 'Direction', ['Lease In', 'Lease Out']),
    f('aircraftReg', 'Aircraft Reg.'),
    money('blockHourRate', 'Block Hour Rate'),
    num('minimumBlockHours', 'Min. Block Hours / Month', { max: 500 }),
    date('startDate', 'Start Date'),
    date('endDate', 'End Date'),
    statusField([['Active', 'success'], ['Under Negotiation', 'info'], ['Expiring Soon', 'warn'], ['Terminated', 'danger']])
  ], 14),
  entity('dry-lease-agreement', 'Dry Lease', 'Dry Lease Agreement', 'pi-file-edit', 'Aircraft-only leases where the lessee provides crew and maintenance.', [
    f('agreementNo', 'Agreement No.'),
    f('lessorName', 'Lessor'),
    f('lesseeName', 'Lessee'),
    f('aircraftReg', 'Aircraft Reg.'),
    money('monthlyRental', 'Monthly Rental'),
    num('leaseTermMonths', 'Lease Term (months)', { max: 180 }),
    date('deliveryDate', 'Delivery Date'),
    date('redeliveryDate', 'Redelivery Date'),
    statusField([['Active', 'success'], ['Pending Delivery', 'info'], ['Redelivery Due', 'warn'], ['Ended', 'secondary']])
  ]),
  entity('lessor-registry', 'Lessor / Lessee', 'Lessor & Lessee Registry', 'pi-building-columns', 'The leasing counterparties we deal with and our exposure to each.', [
    f('partyCode', 'Party Code'),
    f('partyName', 'Party Name'),
    choice('partyRole', 'Role', ['Lessor', 'Lessee', 'Both']),
    f('country', 'Country'),
    num('aircraftCount', 'Aircraft Count', { max: 60 }),
    f('contactPerson', 'Contact Person'),
    statusField([['Active', 'success'], ['Prospect', 'info'], ['Inactive', 'secondary']])
  ]),
  entity('lease-rental-invoice', 'Rental Invoice', 'Lease Rental & Invoicing', 'pi-dollar', 'Monthly rental and supplemental rent invoices under each lease.', [
    f('invoiceNo', 'Invoice No.'),
    f('agreementReference', 'Agreement Reference'),
    f('counterparty', 'Counterparty'),
    f('period', 'Period'),
    money('rentalAmount', 'Rental Amount'),
    date('dueDate', 'Due Date'),
    statusField([['Issued', 'info'], ['Paid', 'success'], ['Overdue', 'danger'], ['Disputed', 'warn']])
  ], 14),
  entity('maintenance-reserve', 'Maintenance Reserve', 'Maintenance Reserves', 'pi-wallet', 'Supplemental rent accrued per flight hour against future heavy maintenance.', [
    f('reserveNo', 'Reserve No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    choice('reserveType', 'Reserve Type', ['Airframe Check', 'Engine Overhaul', 'Engine LLP', 'APU', 'Landing Gear']),
    money('accruedAmount', 'Accrued Amount'),
    money('claimedAmount', 'Claimed Amount'),
    money('balanceAmount', 'Balance'),
    statusField([['Accruing', 'info'], ['Claim Submitted', 'warn'], ['Reimbursed', 'success'], ['Disputed', 'danger']])
  ]),
  entity('aircraft-delivery-acceptance', 'Delivery Record', 'Delivery & Acceptance', 'pi-check-circle', 'Technical acceptance of an aircraft on lease-in delivery.', [
    f('recordNo', 'Record No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('counterparty', 'Counterparty'),
    date('deliveryDate', 'Delivery Date'),
    f('deliveryLocation', 'Delivery Location'),
    num('openDiscrepancies', 'Open Discrepancies', { max: 200 }),
    statusField([['Accepted', 'success'], ['Accepted with Reservations', 'warn'], ['Rejected', 'danger'], ['In Progress', 'info']])
  ]),
  entity('aircraft-redelivery', 'Redelivery', 'Redelivery & Return Conditions', 'pi-replay', 'Meeting the return conditions when a lease ends — usually the expensive part.', [
    f('redeliveryNo', 'Redelivery No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('lessorName', 'Lessor'),
    date('scheduledRedelivery', 'Scheduled Redelivery'),
    num('openConditionItems', 'Open Condition Items', { max: 200 }),
    money('estimatedCost', 'Estimated Cost'),
    statusField([['Planning', 'info'], ['In Progress', 'warn'], ['Completed', 'success'], ['Overdue', 'danger']])
  ]),
  entity('lease-technical-record', 'Technical Record', 'Lease Technical Records', 'pi-folder', 'The records package a lessor demands — the other expensive part.', [
    f('recordNo', 'Record No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    choice('recordType', 'Record Type', ['Airframe Logbook', 'Engine Records', 'LLP Traceability', 'AD/SB Status', 'Dirty Fingerprint', 'Back-to-Birth Trace']),
    num('completenessPct', 'Completeness (%)', { max: 100 }),
    date('lastVerifiedDate', 'Last Verified'),
    statusField([['Complete', 'success'], ['Gaps Identified', 'warn'], ['Incomplete', 'danger']])
  ], 14),
  entity('insurance-certificate', 'Insurance Certificate', 'Insurance & Certificates', 'pi-shield', 'Hull and liability cover evidenced to lessors and authorities.', [
    f('certificateNo', 'Certificate No.'),
    f('aircraftReg', 'Aircraft Reg.'),
    f('insurer', 'Insurer'),
    choice('coverageType', 'Coverage Type', ['Hull All Risks', 'Hull War', 'Third Party Liability', 'Passenger Liability', 'Spares & Equipment']),
    money('insuredValue', 'Insured Value'),
    date('validFrom', 'Valid From'),
    date('validTo', 'Valid To'),
    statusField([['Valid', 'success'], ['Renewal Due', 'warn'], ['Expired', 'danger']])
  ], 14),
  entity('charter-permit-management', 'Permit', 'Overflight & Landing Permits', 'pi-globe', 'Diplomatic, overflight and landing clearances for charter routings.', [
    f('permitNo', 'Permit No.'),
    f('charterReference', 'Charter Reference'),
    choice('permitType', 'Permit Type', ['Overflight', 'Landing', 'Diplomatic Clearance', 'Traffic Rights', 'Slot Clearance']),
    f('country', 'Country'),
    date('applicationDate', 'Application Date'),
    date('validUntil', 'Valid Until'),
    statusField([['Granted', 'success'], ['Applied', 'info'], ['Pending', 'warn'], ['Refused', 'danger']])
  ], 14),
  entity('charter-ground-arrangement', 'Ground Arrangement', 'Charter Ground Arrangements', 'pi-car', 'Handling, catering and transport arranged at each charter station.', [
    f('arrangementNo', 'Arrangement No.'),
    f('charterReference', 'Charter Reference'),
    f('station', 'Station'),
    choice('serviceScope', 'Service Scope', ['Full Handling', 'Ramp Only', 'Catering Only', 'Transport Only', 'Hotel & Transport']),
    f('serviceProvider', 'Service Provider'),
    money('estimatedCost', 'Estimated Cost'),
    statusField([['Requested', 'info'], ['Confirmed', 'success'], ['Delivered', 'secondary'], ['Cancelled', 'danger']])
  ]),
  entity('charter-settlement', 'Settlement', 'Charter Settlement & Payment', 'pi-check-circle', 'Final reconciliation of a charter — advance, extras and balance due.', [
    f('settlementNo', 'Settlement No.'),
    f('contractReference', 'Contract Reference'),
    f('clientName', 'Client Name'),
    money('contractValue', 'Contract Value'),
    money('advanceReceived', 'Advance Received'),
    money('additionalCharges', 'Additional Charges'),
    money('balanceDue', 'Balance Due'),
    statusField([['Open', 'info'], ['Partially Settled', 'warn'], ['Settled', 'success'], ['Overdue', 'danger']])
  ], 14),

  // ═════════════════ Revenue Accounting & Billing ═════════════════════════
  entity('passenger-revenue-accounting', 'Passenger Revenue', 'Passenger Revenue Accounting', 'pi-ticket', 'Ticket-level revenue captured and recognised per flight and period.', [
    f('batchNo', 'Batch No.'),
    f('flightNo', 'Flight No.'),
    f('period', 'Period'),
    num('couponsProcessed', 'Coupons Processed', { max: 60000 }),
    money('grossRevenue', 'Gross Revenue'),
    money('netRevenue', 'Net Revenue'),
    statusField([['Open', 'info'], ['Processed', 'warn'], ['Closed', 'success'], ['Error', 'danger']])
  ], 16),
  entity('cargo-revenue-accounting', 'Cargo Revenue', 'Cargo Revenue Accounting', 'pi-inbox', 'AWB-level cargo revenue and the charges recognised against it.', [
    f('batchNo', 'Batch No.'),
    f('awbNumber', 'AWB Number'),
    f('period', 'Period'),
    num('chargeableWeightKg', 'Chargeable Weight (kg)', { max: 120000 }),
    money('freightRevenue', 'Freight Revenue'),
    money('surcharges', 'Surcharges'),
    statusField([['Open', 'info'], ['Processed', 'warn'], ['Closed', 'success'], ['Error', 'danger']])
  ], 14),
  entity('ticket-coupon-control', 'Coupon', 'Ticket & Coupon Control', 'pi-list-check', 'The coupon inventory — issued, flown, refunded, exchanged or still open.', [
    f('ticketNumber', 'Ticket Number'),
    num('couponNumber', 'Coupon No.', { max: 4 }),
    f('flightNo', 'Flight No.'),
    date('flightDate', 'Flight Date'),
    money('couponValue', 'Coupon Value'),
    statusField([['Open', 'info'], ['Flown', 'success'], ['Refunded', 'warn'], ['Exchanged', 'contrast'], ['Void', 'secondary']])
  ], 18),
  entity('flown-revenue-recognition', 'Recognition Entry', 'Flown Revenue Recognition', 'pi-check-circle', 'Moving liability to revenue once the sector is actually flown.', [
    f('entryNo', 'Entry No.'),
    f('flightNo', 'Flight No.'),
    date('flownDate', 'Flown Date'),
    money('recognisedAmount', 'Recognised Amount'),
    f('glAccount', 'GL Account'),
    statusField([['Pending', 'info'], ['Posted', 'success'], ['Reversed', 'warn'], ['Error', 'danger']])
  ], 16),
  entity('unearned-revenue-liability', 'ATL Balance', 'Unearned Revenue (ATL)', 'pi-wallet', 'Air Traffic Liability — tickets sold but not yet flown.', [
    f('period', 'Period'),
    money('openingBalance', 'Opening Balance'),
    money('salesAdded', 'Sales Added'),
    money('revenueRecognised', 'Revenue Recognised'),
    money('closingBalance', 'Closing Balance'),
    statusField([['Open', 'info'], ['Reconciled', 'success'], ['Variance', 'danger']])
  ]),
  entity('proration', 'Proration Record', 'Proration', 'pi-percentage', 'Splitting a multi-sector fare between the carriers that flew it.', [
    f('prorationNo', 'Proration No.'),
    f('ticketNumber', 'Ticket Number'),
    f('routing', 'Routing'),
    choice('prorationMethod', 'Method', ['Straight Rate', 'Special Prorate (SPA)', 'Mileage Prorate', 'Bilateral Agreement']),
    money('totalFare', 'Total Fare'),
    money('ourShare', 'Our Share'),
    statusField([['Calculated', 'info'], ['Agreed', 'success'], ['Under Dispute', 'warn']])
  ], 14),
  entity('interline-billing', 'Interline Bill', 'Interline Billing (SIS)', 'pi-share-alt', 'Payables and receivables with partner carriers through IATA SIS.', [
    f('billingNo', 'Billing No.'),
    f('partnerCarrier', 'Partner Carrier'),
    choice('billingType', 'Billing Type', ['Passenger Payable', 'Passenger Receivable', 'Cargo Payable', 'Cargo Receivable', 'Miscellaneous']),
    f('period', 'Period'),
    money('billedAmount', 'Billed Amount'),
    statusField([['Submitted', 'info'], ['Accepted', 'success'], ['Rejected', 'danger'], ['Under Correspondence', 'warn']])
  ], 16),
  entity('bsp-arc-settlement', 'BSP Settlement', 'BSP / ARC Settlement', 'pi-building-columns', 'Agency sales settled through BSP or ARC, by country and period.', [
    f('settlementNo', 'Settlement No.'),
    f('bspCountry', 'BSP Country'),
    f('period', 'Period'),
    money('grossSales', 'Gross Sales'),
    money('commission', 'Commission'),
    money('netRemittance', 'Net Remittance'),
    date('remittanceDate', 'Remittance Date'),
    statusField([['Pending', 'info'], ['Received', 'success'], ['Short Paid', 'warn'], ['Default', 'danger']])
  ], 14),
  entity('cass-settlement', 'CASS Settlement', 'CASS Cargo Settlement', 'pi-inbox', 'Cargo agent sales settled through CASS.', [
    f('settlementNo', 'Settlement No.'),
    f('cassCountry', 'CASS Country'),
    f('period', 'Period'),
    money('grossBillings', 'Gross Billings'),
    money('agentCommission', 'Agent Commission'),
    money('netRemittance', 'Net Remittance'),
    statusField([['Pending', 'info'], ['Received', 'success'], ['Short Paid', 'warn'], ['Default', 'danger']])
  ]),
  entity('agent-commission-settlement', 'Commission Settlement', 'Agent Commission Settlement', 'pi-dollar', 'Settling commission and incentive owed to agents against actual sales.', [
    f('settlementNo', 'Settlement No.'),
    f('agentName', 'Agent Name'),
    f('period', 'Period'),
    money('salesVolume', 'Sales Volume'),
    money('commissionDue', 'Commission Due'),
    money('incentiveDue', 'Incentive Due'),
    statusField([['Calculated', 'info'], ['Approved', 'warn'], ['Settled', 'success'], ['Disputed', 'danger']])
  ], 14),
  entity('refund-accounting', 'Refund Entry', 'Refund Accounting', 'pi-replay', 'Refunds processed against sold coupons, and the penalty retained.', [
    f('refundNo', 'Refund No.'),
    f('ticketNumber', 'Ticket Number'),
    f('passengerName', 'Passenger Name'),
    money('refundAmount', 'Refund Amount'),
    money('penaltyRetained', 'Penalty Retained'),
    date('refundDate', 'Refund Date'),
    statusField([['Requested', 'info'], ['Approved', 'warn'], ['Processed', 'success'], ['Rejected', 'danger']])
  ], 16),
  entity('emd-accounting', 'EMD Record', 'EMD & Ancillary Accounting', 'pi-credit-card', 'Electronic miscellaneous documents — bags, seats, upgrades and services.', [
    f('emdNumber', 'EMD Number'),
    f('passengerName', 'Passenger Name'),
    choice('serviceType', 'Service Type', ['Excess Baggage', 'Seat Selection', 'Upgrade', 'Lounge Access', 'Change Fee', 'Special Service']),
    money('emdValue', 'EMD Value'),
    date('issueDate', 'Issue Date'),
    statusField([['Open', 'info'], ['Used', 'success'], ['Refunded', 'warn'], ['Expired', 'secondary']])
  ], 16),
  entity('tax-fee-charges', 'Tax & Fee', 'Taxes, Fees & Charges', 'pi-percentage', 'Government and airport taxes collected on our behalf and remitted onward.', [
    f('taxCode', 'Tax Code'),
    f('taxName', 'Tax Name'),
    f('country', 'Country'),
    money('collectedAmount', 'Collected'),
    money('remittedAmount', 'Remitted'),
    date('remittanceDueDate', 'Remittance Due'),
    statusField([['Collected', 'info'], ['Remitted', 'success'], ['Overdue', 'danger'], ['Under Query', 'warn']])
  ], 16),
  entity('airport-charges-billing', 'Airport Charge', 'Airport & ANSP Charges', 'pi-building', 'Landing, parking and passenger charges invoiced by airports.', [
    f('invoiceNo', 'Invoice No.'),
    f('airport', 'Airport'),
    choice('chargeType', 'Charge Type', ['Landing', 'Parking', 'Passenger Service', 'Security', 'Aerobridge', 'Noise']),
    f('period', 'Period'),
    money('invoiceAmount', 'Invoice Amount'),
    money('verifiedAmount', 'Verified Amount'),
    statusField([['Received', 'info'], ['Verified', 'warn'], ['Approved', 'success'], ['Disputed', 'danger']])
  ], 16),
  entity('navigation-charges', 'Navigation Charge', 'Route & Navigation Charges', 'pi-map', 'En-route and terminal navigation charges billed by ANSPs.', [
    f('invoiceNo', 'Invoice No.'),
    f('anspName', 'ANSP'),
    f('region', 'Region'),
    f('period', 'Period'),
    num('flightsBilled', 'Flights Billed', { max: 5000 }),
    money('chargeAmount', 'Charge Amount'),
    statusField([['Received', 'info'], ['Verified', 'warn'], ['Paid', 'success'], ['Disputed', 'danger']])
  ], 14),
  entity('handling-charges-verification', 'Handling Invoice Check', 'Handling Invoice Verification', 'pi-check-square', 'Line-by-line audit of handler invoices before they reach AP.', [
    f('verificationNo', 'Verification No.'),
    f('ghaName', 'Handler Name'),
    f('station', 'Station'),
    money('invoicedAmount', 'Invoiced Amount'),
    money('contractedAmount', 'Contracted Amount'),
    money('varianceAmount', 'Variance'),
    statusField([['Matched', 'success'], ['Variance Found', 'warn'], ['Disputed', 'danger'], ['Credit Requested', 'contrast']])
  ], 14),
  entity('fuel-invoice-verification', 'Fuel Invoice Check', 'Fuel Invoice Verification', 'pi-bolt', 'Fuel invoices reconciled against uplift tickets and contracted price formula.', [
    f('verificationNo', 'Verification No.'),
    f('fuelSupplier', 'Fuel Supplier'),
    f('station', 'Station'),
    num('upliftLitres', 'Uplift (L)', { max: 5000000 }),
    money('invoicedAmount', 'Invoiced Amount'),
    money('calculatedAmount', 'Calculated Amount'),
    statusField([['Matched', 'success'], ['Price Variance', 'warn'], ['Volume Variance', 'contrast'], ['Disputed', 'danger']])
  ], 14),
  entity('revenue-leakage-audit', 'Leakage Finding', 'Revenue Leakage & Audit', 'pi-search', 'Fares undercharged, coupons unbilled and other money we did not collect.', [
    f('findingNo', 'Finding No.'),
    choice('leakageType', 'Leakage Type', ['Undercharged Fare', 'Uncollected Tax', 'Unbilled Interline', 'Duplicate Refund', 'Commission Overpaid', 'Missing Coupon']),
    f('period', 'Period'),
    money('leakageAmount', 'Leakage Amount'),
    money('recoveredAmount', 'Recovered Amount'),
    statusField([['Identified', 'danger'], ['Under Recovery', 'warn'], ['Recovered', 'success'], ['Written Off', 'secondary']])
  ], 14),
  entity('revenue-reconciliation', 'Reconciliation', 'Revenue Reconciliation', 'pi-sync', 'Sales system vs. general ledger, reconciled per period.', [
    f('reconciliationNo', 'Reconciliation No.'),
    f('period', 'Period'),
    choice('reconciliationArea', 'Area', ['Passenger Sales', 'Cargo Sales', 'Ancillary', 'Interline', 'Taxes', 'Refunds']),
    money('systemAmount', 'System Amount'),
    money('ledgerAmount', 'Ledger Amount'),
    money('varianceAmount', 'Variance'),
    statusField([['Balanced', 'success'], ['Variance', 'warn'], ['Unreconciled', 'danger']])
  ], 14),
  entity('intercompany-settlement', 'Intercompany Settlement', 'Intercompany Settlement', 'pi-arrow-right-arrow-left', 'Charges settled between group entities — subsidiaries, MRO arm, catering arm.', [
    f('settlementNo', 'Settlement No.'),
    f('counterpartyEntity', 'Counterparty Entity'),
    f('period', 'Period'),
    choice('settlementType', 'Settlement Type', ['Management Fee', 'MRO Services', 'Catering', 'Ground Handling', 'Shared Services', 'Cost Allocation']),
    money('settlementAmount', 'Settlement Amount'),
    statusField([['Open', 'info'], ['Agreed', 'warn'], ['Settled', 'success'], ['Disputed', 'danger']])
  ]),

  // ═════════════════ Environment & Sustainability ═════════════════════════
  entity('emission-monitoring', 'Emission Record', 'CO2 Emission Monitoring', 'pi-cloud', 'Fuel burn converted to CO2 per flight — the base data for every scheme below.', [
    f('recordNo', 'Record No.'),
    f('flightNo', 'Flight No.'),
    f('aircraftType', 'Aircraft Type'),
    date('flightDate', 'Flight Date'),
    num('fuelBurnKg', 'Fuel Burn (kg)', { max: 200000 }),
    num('co2Tonnes', 'CO2 (t)', { max: 700 }),
    num('co2PerPaxKm', 'CO2 per Pax-km (g)', { max: 300 }),
    statusField([['Verified', 'success'], ['Recorded', 'info'], ['Under Review', 'warn'], ['Discrepancy', 'danger']])
  ], 18),
  entity('corsia-reporting', 'CORSIA Report', 'CORSIA Reporting', 'pi-globe', 'ICAO CORSIA emissions reporting and offsetting obligation per year.', [
    f('reportNo', 'Report No.'),
    f('reportingYear', 'Reporting Year'),
    f('stateRoutePair', 'State Pair / Route'),
    num('emissionsTonnes', 'Emissions (t)', { max: 500000 }),
    num('offsettingRequirementTonnes', 'Offset Requirement (t)', { max: 200000 }),
    date('submissionDeadline', 'Submission Deadline'),
    statusField([['Draft', 'info'], ['Verified', 'warn'], ['Submitted', 'success'], ['Overdue', 'danger']])
  ]),
  entity('ets-compliance', 'ETS Record', 'EU / UK ETS Compliance', 'pi-verified', 'Emissions Trading Scheme allowances held, surrendered and still to buy.', [
    f('recordNo', 'Record No.'),
    choice('scheme', 'Scheme', ['EU ETS', 'UK ETS', 'CH ETS', 'Other']),
    f('complianceYear', 'Compliance Year'),
    num('verifiedEmissionsTonnes', 'Verified Emissions (t)', { max: 500000 }),
    num('allowancesHeld', 'Allowances Held', { max: 500000 }),
    num('allowancesSurrendered', 'Allowances Surrendered', { max: 500000 }),
    statusField([['Compliant', 'success'], ['Shortfall', 'warn'], ['Non-Compliant', 'danger'], ['Pending Verification', 'info']])
  ]),
  entity('carbon-offset-program', 'Offset Purchase', 'Carbon Offset Programs', 'pi-heart', 'Offset credits bought, and the project standard behind them.', [
    f('purchaseNo', 'Purchase No.'),
    f('projectName', 'Project Name'),
    choice('offsetStandard', 'Standard', ['Verra VCS', 'Gold Standard', 'ACR', 'CAR', 'CORSIA Eligible']),
    num('creditsTonnes', 'Credits (t)', { max: 200000 }),
    money('purchaseCost', 'Purchase Cost'),
    date('purchaseDate', 'Purchase Date'),
    statusField([['Purchased', 'info'], ['Retired', 'success'], ['Pending', 'warn']])
  ]),
  entity('saf-management', 'SAF Uplift', 'Sustainable Aviation Fuel (SAF)', 'pi-bolt', 'SAF uplifted per station, its blend ratio and lifecycle emission saving.', [
    f('upliftNo', 'Uplift No.'),
    f('station', 'Station'),
    f('supplierName', 'Supplier Name'),
    num('safVolumeLitres', 'SAF Volume (L)', { max: 2000000 }),
    num('blendRatioPct', 'Blend Ratio (%)', { max: 100 }),
    num('emissionSavingTonnes', 'Emission Saving (t)', { max: 5000 }),
    money('premiumCost', 'Premium Cost'),
    statusField([['Delivered', 'success'], ['Contracted', 'info'], ['Certificate Pending', 'warn']])
  ], 14),
  entity('fuel-efficiency-initiative', 'Efficiency Initiative', 'Fuel Efficiency Initiatives', 'pi-chart-line', 'Operational initiatives — single-engine taxi, weight reduction, CDO — and what they saved.', [
    f('initiativeNo', 'Initiative No.'),
    f('initiativeName', 'Initiative Name'),
    choice('initiativeCategory', 'Category', ['Single Engine Taxi', 'Weight Reduction', 'Continuous Descent', 'Route Optimisation', 'APU Reduction', 'Engine Wash']),
    date('startDate', 'Start Date'),
    num('fuelSavedTonnes', 'Fuel Saved (t)', { max: 20000 }),
    money('costSaving', 'Cost Saving'),
    statusField([['Active', 'success'], ['Pilot', 'info'], ['Planned', 'warn'], ['Discontinued', 'secondary']])
  ], 14),
  entity('noise-monitoring', 'Noise Record', 'Noise Monitoring & Abatement', 'pi-volume-up', 'Measured noise levels against airport limits and abatement procedures.', [
    f('recordNo', 'Record No.'),
    f('airport', 'Airport'),
    f('monitoringStation', 'Monitoring Station'),
    f('flightNo', 'Flight No.'),
    num('noiseLevelDb', 'Noise Level (dB)', { max: 130 }),
    num('limitDb', 'Limit (dB)', { max: 130 }),
    datetime('measurementTime', 'Measurement Time'),
    statusField([['Within Limit', 'success'], ['Near Limit', 'warn'], ['Exceedance', 'danger']])
  ], 16),
  entity('air-quality-monitoring', 'Air Quality Reading', 'Air Quality Monitoring', 'pi-cloud', 'Local air quality around the airfield — NOx, PM and VOC readings.', [
    f('readingNo', 'Reading No.'),
    f('monitoringLocation', 'Monitoring Location'),
    choice('pollutant', 'Pollutant', ['NOx', 'PM10', 'PM2.5', 'SO2', 'VOC', 'CO']),
    num('measuredValue', 'Measured Value', { max: 500 }),
    num('thresholdValue', 'Threshold', { max: 500 }),
    date('readingDate', 'Reading Date'),
    statusField([['Within Limit', 'success'], ['Elevated', 'warn'], ['Exceedance', 'danger']])
  ], 14),
  entity('water-discharge-management', 'Discharge Record', 'Water & Discharge Management', 'pi-filter', 'Water consumption and controlled discharge, including de-icing runoff.', [
    f('recordNo', 'Record No.'),
    f('facilityName', 'Facility Name'),
    choice('dischargeType', 'Discharge Type', ['Storm Water', 'De-icing Runoff', 'Wash Bay Effluent', 'Sewage', 'Fuel Interceptor']),
    num('volumeCubicMetres', 'Volume (m³)', { max: 50000 }),
    date('recordDate', 'Record Date'),
    statusField([['Within Consent', 'success'], ['Near Limit', 'warn'], ['Breach', 'danger']])
  ]),
  entity('waste-recycling-program', 'Waste Stream', 'Waste & Recycling Program', 'pi-trash', 'Waste generated by stream, and how much of it is actually recycled.', [
    f('recordNo', 'Record No.'),
    f('facilityName', 'Facility Name'),
    choice('wasteStream', 'Waste Stream', ['Cabin Waste', 'Catering Waste', 'Hazardous', 'General', 'Recyclable', 'International Category 1']),
    num('quantityTonnes', 'Quantity (t)', { max: 5000 }),
    num('recycledPct', 'Recycled (%)', { max: 100 }),
    f('period', 'Period'),
    statusField([['On Target', 'success'], ['Below Target', 'warn'], ['Non-Compliant', 'danger']])
  ], 14),
  entity('single-use-plastic-reduction', 'Plastic Reduction', 'Single-Use Plastic Reduction', 'pi-ban', 'Replacing onboard single-use plastic items, item by item.', [
    f('initiativeNo', 'Initiative No.'),
    f('itemReplaced', 'Item Replaced'),
    f('replacementMaterial', 'Replacement Material'),
    num('unitsEliminatedPerYear', 'Units Eliminated / Year', { max: 5000000 }),
    num('plasticReducedKg', 'Plastic Reduced (kg)', { max: 200000 }),
    date('implementationDate', 'Implementation Date'),
    statusField([['Implemented', 'success'], ['Trial', 'info'], ['Planned', 'warn'], ['Cancelled', 'secondary']])
  ]),
  entity('energy-consumption-tracking', 'Energy Record', 'Energy Consumption Tracking', 'pi-bolt', 'Electricity, gas and renewable generation per facility and period.', [
    f('recordNo', 'Record No.'),
    f('facilityName', 'Facility Name'),
    choice('energyType', 'Energy Type', ['Grid Electricity', 'Natural Gas', 'Solar Generated', 'District Heating', 'Diesel Generator']),
    num('consumptionKwh', 'Consumption (kWh)', { max: 5000000 }),
    num('renewablePct', 'Renewable (%)', { max: 100 }),
    f('period', 'Period'),
    statusField([['On Target', 'success'], ['Above Target', 'warn'], ['Excessive', 'danger']])
  ], 14),
  entity('wildlife-hazard-management', 'Wildlife Record', 'Wildlife Hazard Management', 'pi-eye', 'Bird and wildlife activity, strikes and the control measures deployed.', [
    f('recordNo', 'Record No.'),
    f('airport', 'Airport'),
    choice('speciesGroup', 'Species Group', ['Gulls', 'Raptors', 'Waterfowl', 'Passerines', 'Mammals', 'Reptiles']),
    choice('eventType', 'Event Type', ['Sighting', 'Strike', 'Near Miss', 'Control Action']),
    date('eventDate', 'Event Date'),
    f('controlMeasure', 'Control Measure'),
    statusField([['Logged', 'info'], ['Under Review', 'warn'], ['Action Taken', 'success'], ['Damage Reported', 'danger']])
  ], 16),
  entity('environmental-permit', 'Environmental Permit', 'Environmental Permits & Licences', 'pi-verified', 'Discharge consents, emission permits and waste licences we must hold.', [
    f('permitNo', 'Permit No.'),
    f('permitName', 'Permit Name'),
    f('issuingAuthority', 'Issuing Authority'),
    choice('permitCategory', 'Category', ['Discharge Consent', 'Emission Permit', 'Waste Carrier Licence', 'Fuel Storage', 'Noise Consent']),
    date('issueDate', 'Issue Date'),
    date('expiryDate', 'Expiry Date'),
    statusField([['Valid', 'success'], ['Renewal Due', 'warn'], ['Expired', 'danger'], ['Under Application', 'info']])
  ]),
  entity('environmental-audit', 'Environmental Audit', 'Environmental Audit', 'pi-search', 'ISO 14001 and regulatory environmental audits, and their findings.', [
    f('auditNo', 'Audit No.'),
    f('auditScope', 'Audit Scope'),
    choice('auditType', 'Audit Type', ['ISO 14001', 'Regulatory Inspection', 'Internal', 'Supplier Environmental', 'Energy Audit']),
    date('auditDate', 'Audit Date'),
    f('leadAuditor', 'Lead Auditor'),
    num('findingsCount', 'Findings', { max: 40 }),
    statusField([['Planned', 'info'], ['In Progress', 'warn'], ['Closed', 'success'], ['Major Non-Conformity', 'danger']])
  ]),
  entity('environmental-incident', 'Environmental Incident', 'Environmental Incident', 'pi-exclamation-triangle', 'Spills, leaks and releases — what happened and whether it was reportable.', [
    f('incidentNo', 'Incident No.'),
    f('location', 'Location'),
    choice('incidentType', 'Incident Type', ['Fuel Spill', 'Oil Leak', 'Chemical Release', 'De-icing Overflow', 'Waste Mishandling', 'Air Emission']),
    date('incidentDate', 'Incident Date'),
    num('quantityLitres', 'Quantity (L)', { max: 50000 }),
    choice('reportableToRegulator', 'Reportable', ['Yes', 'No', 'Under Assessment']),
    statusField([['Open', 'danger'], ['Contained', 'warn'], ['Remediated', 'info'], ['Closed', 'success']])
  ], 14),
  entity('sustainability-target', 'Sustainability Target', 'Sustainability Targets & KPI', 'pi-gauge', 'Committed environmental targets and how we are tracking against them.', [
    f('targetCode', 'Target Code'),
    f('targetName', 'Target Name'),
    choice('targetArea', 'Area', ['Carbon Intensity', 'SAF Uptake', 'Waste Diversion', 'Energy Efficiency', 'Water Use', 'Net Zero']),
    f('baselineYear', 'Baseline Year'),
    num('targetValue', 'Target Value', { max: 100000 }),
    num('currentValue', 'Current Value', { max: 100000 }),
    date('targetDate', 'Target Date'),
    statusField([['On Track', 'success'], ['At Risk', 'warn'], ['Off Track', 'danger'], ['Achieved', 'secondary']])
  ], 14),
  entity('esg-reporting', 'ESG Disclosure', 'ESG Disclosure', 'pi-file', 'Reporting packs published under GRI, TCFD, CDP and similar frameworks.', [
    f('reportNo', 'Report No.'),
    choice('framework', 'Framework', ['GRI', 'TCFD', 'CDP', 'SASB', 'CSRD', 'Integrated Report']),
    f('reportingPeriod', 'Reporting Period'),
    date('publicationDate', 'Publication Date'),
    choice('assuranceLevel', 'Assurance Level', ['Not Assured', 'Limited Assurance', 'Reasonable Assurance']),
    statusField([['Published', 'success'], ['In Preparation', 'info'], ['Under Assurance', 'warn'], ['Overdue', 'danger']])
  ])
];

/**
 * Entities filtered to the signed-in user's stationScope (EntityConfig.scopeField
 * — see mock-api.interceptor.ts). Applied by key here, against entities that
 * already carry a `station` field, rather than threading a param through
 * every entity() call above — keeps the full scoped set auditable in one
 * place instead of scattered across ~1000 lines.
 */
const STATION_SCOPED_ENTITIES: string[] = [
  'catering-kitchen-registry', 'catering-supplier', 'catering-order', 'beverage-management',
  'lounge-catering', 'catering-inventory',
  'hotel-partner-registry', 'hotel-rate-contract', 'hotel-room-inventory', 'hotel-service-quality',
  'crew-layover-hotel', 'crew-hotel-contract', 'crew-transport', 'crew-visa-gendec',
  'accommodation-facility', 'crew-rest-facility',
  'gha-registry', 'gha-sgha-contract', 'ground-service-catalogue', 'turnaround-service-order',
  'ground-staff-roster', 'ramp-safety-inspection', 'gha-sla-performance', 'ground-handling-billing',
  'charter-ground-arrangement', 'handling-charges-verification', 'fuel-invoice-verification', 'saf-management'
];

/**
 * Entities that get an optional file-attachment field bolted on — proving
 * out the 'file' field type against real document-centric records without
 * hand-editing every one of their (long) fields arrays above.
 */
const FILE_ATTACHMENT_ENTITIES: Record<string, string> = {
  'supplier-document-vault': 'Document Scan',
  'supplier-certifications': 'Certificate Scan',
  'supplier-audit': 'Audit Report',
  'kitchen-hygiene-audit': 'Audit Report',
  'visa-passport-tracking': 'Document Scan',
  'crew-visa-gendec': 'Document Scan',
  'training-certificate-issue': 'Certificate Scan',
  'lease-technical-record': 'Records Package',
  'insurance-certificate': 'Policy Document',
  'environmental-permit': 'Permit Document'
};

for (const cfg of EXTENDED_ENTITY_LIST) {
  if (STATION_SCOPED_ENTITIES.includes(cfg.key)) cfg.scopeField = 'station';
  const attachmentLabel = FILE_ATTACHMENT_ENTITIES[cfg.key];
  if (attachmentLabel) cfg.fields.push(file('attachmentFile', attachmentLabel));
}
