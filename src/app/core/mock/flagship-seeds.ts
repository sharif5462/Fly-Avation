/**
 * Hand-authored seed data for the flagship (hand-built, non-generic) pages.
 * Everything else in the app seeds procedurally from EntityConfig — see
 * fake-data.ts — but these resources back a real domain-specific UI, so they
 * get realistic values instead.
 */

const AIRCRAFT_REGS = ['N101AV', 'N102AV', 'N204SK', 'N305SK', 'G-ABCP', 'G-XLRJ', 'D-AIBX', 'A6-EQF', 'VT-ANL', 'B-KQC'];
const AIRPORT_PAIRS: [string, string][] = [
  ['JFK', 'LHR'], ['DXB', 'SIN'], ['ORD', 'DFW'], ['CDG', 'FRA'], ['HND', 'ICN'],
  ['SYD', 'AKL'], ['GRU', 'EZE'], ['DEL', 'BOM'], ['AMS', 'IST'], ['HKG', 'NRT']
];
export const AIRLINES = [
  'Biman Bangladesh Airlines',
  'US-Bangla Airlines',
  'Novoair',
  'Emirates',
  'Qatar Airways',
  'Singapore Airlines',
  'British Airways',
  'Turkish Airlines',
  'Etihad Airways',
  'Cathay Pacific'
];
export const FLIGHT_TYPES = ['Passenger', 'Cargo', 'Charter', 'Private'];

export function seedFlights() {
  const statuses = ['Scheduled', 'Boarding', 'Departed', 'In Air', 'Landed', 'Delayed', 'Cancelled'];
  return AIRPORT_PAIRS.map(([origin, destination], i) => {
    const dep = new Date(Date.now() + (i - 4) * 3 * 3600000);
    const arr = new Date(dep.getTime() + (4 + (i % 6)) * 3600000);
    return {
      id: `flt-${String(i + 1).padStart(4, '0')}`,
      flightNo: `AV${100 + i * 7}`,
      airline: AIRLINES[i % AIRLINES.length],
      flightType: i % 5 === 0 ? 'Cargo' : i % 7 === 0 ? 'Charter' : i % 11 === 0 ? 'Private' : 'Passenger',
      origin,
      destination,
      aircraftReg: AIRCRAFT_REGS[i % AIRCRAFT_REGS.length],
      departureTime: dep.toISOString(),
      arrivalTime: arr.toISOString(),
      gate: `${String.fromCharCode(65 + (i % 6))}${(i % 20) + 1}`,
      status: statuses[i % statuses.length],
      remarks: i % 5 === 0 ? 'Weather monitoring in effect' : ''
    };
  });
}

export function seedAircraftRegistrations() {
  const models = [
    { manufacturer: 'Boeing', model: 'B737-800', aircraftType: 'Narrow-body', icao: 'B738', iata: '738', seats: 189, engine: ['CFM International', 'CFM56-7B'] },
    { manufacturer: 'Airbus', model: 'A320-200', aircraftType: 'Narrow-body', icao: 'A320', iata: '320', seats: 180, engine: ['CFM International', 'CFM56-5B'] },
    { manufacturer: 'Boeing', model: 'B787-9', aircraftType: 'Wide-body', icao: 'B789', iata: '789', seats: 296, engine: ['General Electric', 'GEnx-1B'] },
    { manufacturer: 'Airbus', model: 'A350-900', aircraftType: 'Wide-body', icao: 'A359', iata: '359', seats: 325, engine: ['Rolls-Royce', 'Trent XWB'] },
    { manufacturer: 'Bombardier', model: 'CRJ900', aircraftType: 'Regional Jet', icao: 'CRJ9', iata: 'CR9', seats: 90, engine: ['General Electric', 'CF34-8C5'] },
    { manufacturer: 'ATR', model: 'ATR 72-600', aircraftType: 'Turboprop', icao: 'AT76', iata: 'AT7', seats: 70, engine: ['Pratt & Whitney Canada', 'PW127M'] }
  ];
  const owners = ['SkyLease Capital', 'Aviation Capital Group', 'GECAS', 'Air Lease Corp', 'Self-owned Fleet'];
  const currentStatuses = ['Active', 'Active', 'Active', 'Maintenance', 'Parked', 'Grounded'];
  const leaseTypes = ['Owned', 'Dry Lease', 'Wet Lease'];
  const flightCategories = ['Domestic', 'International', 'Cargo', 'Charter'];
  const erpStatuses = ['Active', 'Active', 'Active', 'Under Maintenance', 'Inactive', 'Retired'];
  const iso = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 86400000).toISOString().slice(0, 10);

  return AIRCRAFT_REGS.map((reg, i) => {
    const m = models[i % models.length];
    const leaseType = leaseTypes[i % leaseTypes.length];
    const purchasePrice = 45000000 + i * 6250000;
    return {
      id: `ac-${String(i + 1).padStart(4, '0')}`,

      registrationNumber: reg,
      serialNumber: `MSN-${41000 + i * 137}`,
      manufacturer: m.manufacturer,
      model: m.model,
      aircraftType: m.aircraftType,
      icaoCode: m.icao,
      iataCode: m.iata,

      ownerName: owners[i % owners.length],
      operatorName: AIRLINES[i % AIRLINES.length],
      leaseType,
      leaseStartDate: leaseType === 'Owned' ? null : iso(-365 - i * 30),
      leaseEndDate: leaseType === 'Owned' ? null : iso(1460 - i * 30),
      lessorName: leaseType === 'Owned' ? '' : owners[(i + 1) % owners.length],

      engineManufacturer: m.engine[0],
      engineModel: m.engine[1],
      engineCount: m.aircraftType === 'Turboprop' || m.aircraftType === 'Regional Jet' ? 2 : 2,
      engineSerialNumbers: `${894500 + i * 2}, ${894501 + i * 2}`,
      mtow: 60000 + m.seats * 350,
      mlw: 55000 + m.seats * 300,
      mzfw: 52000 + m.seats * 280,
      fuelCapacity: 20000 + m.seats * 60,
      cruiseSpeed: m.aircraftType === 'Turboprop' ? 510 : 850,
      maxRange: m.aircraftType === 'Wide-body' ? 14800 : m.aircraftType === 'Turboprop' ? 1500 : 6000,
      wingspan: m.aircraftType === 'Wide-body' ? 60.1 : m.aircraftType === 'Turboprop' ? 27.05 : 35.8,
      aircraftLength: m.aircraftType === 'Wide-body' ? 62.8 : m.aircraftType === 'Turboprop' ? 27.17 : 39.5,
      aircraftHeight: m.aircraftType === 'Wide-body' ? 17 : 11.76,

      totalSeats: m.seats,
      firstClassSeats: m.aircraftType === 'Wide-body' ? 8 : 0,
      businessSeats: m.aircraftType === 'Wide-body' ? 30 : m.aircraftType === 'Narrow-body' ? 16 : 0,
      economySeats: m.aircraftType === 'Wide-body' ? m.seats - 38 : m.aircraftType === 'Narrow-body' ? m.seats - 16 : m.seats,
      cargoCapacity: m.aircraftType === 'Wide-body' ? 18000 : m.aircraftType === 'Narrow-body' ? 5000 : 1200,
      maxPassengers: m.seats,

      homeBaseAirport: AIRPORT_PAIRS[i % AIRPORT_PAIRS.length][0],
      currentAirport: AIRPORT_PAIRS[i % AIRPORT_PAIRS.length][1],
      currentStatus: currentStatuses[i % currentStatuses.length],
      flightCategory: flightCategories[i % flightCategories.length],

      registrationDate: iso(-2200 - i * 40),
      registrationExpiry: iso(365 - i * 20),
      airworthinessCertNo: `AWC-${5000 + i}`,
      airworthinessExpiry: iso(200 - i * 15),
      insurancePolicyNo: `INS-${73000 + i * 11}`,
      insuranceExpiry: iso(150 - i * 10),
      noiseCertificate: `NC-${3000 + i}`,
      radioLicense: `RL-${9000 + i}`,
      certificateOfRegistration: `COR-${reg}`,

      lastMaintenanceDate: iso(-45 - i * 5),
      nextMaintenanceDate: iso(45 - i * 5),
      lastACheck: iso(-20 - i * 3),
      nextACheck: iso(70 - i * 3),
      lastCCheck: iso(-400 - i * 20),
      nextCCheck: iso(320 - i * 20),
      totalFlightHours: 8000 + i * 1240,
      totalFlightCycles: 4200 + i * 610,
      remainingHours: 3200 - i * 90,
      remainingCycles: 1800 - i * 40,

      transponderCode: `${2000 + i * 111}`,
      eltNumber: `ELT-${6000 + i}`,
      satcomInstalled: i % 2 === 0,
      adsbInstalled: true,
      tcasInstalled: true,
      weatherRadarInstalled: true,

      registrationCertificateFile: `registration-cert-${reg}.pdf`,
      airworthinessCertificateFile: `airworthiness-cert-${reg}.pdf`,
      insuranceCopyFile: `insurance-copy-${reg}.pdf`,
      leaseAgreementFile: leaseType === 'Owned' ? '' : `lease-agreement-${reg}.pdf`,
      maintenanceCertificateFile: `maintenance-cert-${reg}.pdf`,
      aircraftPhotoFile: `${reg}.jpg`,

      purchasePrice,
      currentValue: Math.round(purchasePrice * (0.55 + (i % 5) * 0.06)),
      monthlyLeaseCost: leaseType === 'Owned' ? 0 : 180000 + i * 12000,
      depreciation: Math.round(purchasePrice * 0.045),
      insuranceCost: 220000 + i * 15000,

      erpStatus: erpStatuses[i % erpStatuses.length]
    };
  });
}

export function seedWorkOrders() {
  const types = ['Scheduled', 'Unscheduled', 'AOG', 'Line Maintenance', 'Base Maintenance'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Open', 'In Progress', 'Awaiting Parts', 'Completed', 'Closed'];
  const techs = ['R. Alvarez', 'K. Novak', 'T. Ibrahim', 'M. Chen', 'S. Okafor', 'L. Fischer'];
  return Array.from({ length: 14 }).map((_, i) => {
    const opened = new Date(Date.now() - (20 - i) * 86400000);
    const due = new Date(opened.getTime() + (3 + (i % 10)) * 86400000);
    return {
      id: `wo-${String(i + 1).padStart(4, '0')}`,
      woNumber: `WO-${2400 + i}`,
      aircraftReg: AIRCRAFT_REGS[i % AIRCRAFT_REGS.length],
      maintenanceType: types[i % types.length],
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      assignedTechnician: techs[i % techs.length],
      openedDate: opened.toISOString().slice(0, 10),
      dueDate: due.toISOString().slice(0, 10),
      description: 'Routine inspection and component check per maintenance schedule.'
    };
  });
}

type ComponentStatus = 'Installed' | 'Removed' | 'In Repair' | 'Quarantine' | 'Scrapped';

export function seedComponentTracking() {
  const iso = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 86400000).toISOString().slice(0, 10);
  const parts: {
    name: string;
    ata: string;
    category: 'Rotable' | 'Life-Limited Part' | 'Repairable' | 'Consumable';
    position: string;
    lifeLimitHours: number | null;
    lifeRemainingPct: number | null;
  }[] = [
    { name: 'CFM56-7B HPT Blade Set', ata: '72-50', category: 'Life-Limited Part', position: 'Engine 1', lifeLimitHours: 20000, lifeRemainingPct: 0.06 },
    { name: 'Landing Gear Actuator', ata: '32-30', category: 'Rotable', position: 'L/H Main Gear', lifeLimitHours: 15000, lifeRemainingPct: 0.42 },
    { name: 'Hydraulic Pump Assembly', ata: '29-10', category: 'Rotable', position: 'Center Hydraulic System', lifeLimitHours: 12000, lifeRemainingPct: 0.18 },
    { name: 'Brake Disc Assembly', ata: '32-40', category: 'Life-Limited Part', position: 'R/H Main Gear', lifeLimitHours: 8000, lifeRemainingPct: 0.09 },
    { name: 'APU Starter Motor', ata: '49-10', category: 'Repairable', position: 'Tail Cone', lifeLimitHours: null, lifeRemainingPct: null },
    { name: 'Avionics Control Module', ata: '34-20', category: 'Repairable', position: 'Avionics Bay', lifeLimitHours: null, lifeRemainingPct: null },
    { name: 'Turbine Blade Set — LPT', ata: '72-53', category: 'Life-Limited Part', position: 'Engine 2', lifeLimitHours: 18000, lifeRemainingPct: 0.63 },
    { name: 'Fuel Filter Element', ata: '28-20', category: 'Consumable', position: 'Engine 1 Fuel System', lifeLimitHours: null, lifeRemainingPct: null },
    { name: 'Wheel Bearing Kit', ata: '32-45', category: 'Consumable', position: 'Nose Gear', lifeLimitHours: null, lifeRemainingPct: null },
    { name: 'Nav Light Assembly', ata: '33-40', category: 'Repairable', position: 'L/H Wingtip', lifeLimitHours: null, lifeRemainingPct: null },
    { name: 'Oxygen Mask Unit', ata: '35-10', category: 'Consumable', position: 'Cabin Zone B', lifeLimitHours: null, lifeRemainingPct: null },
    { name: 'Landing Gear Actuator', ata: '32-30', category: 'Rotable', position: 'Nose Gear', lifeLimitHours: 15000, lifeRemainingPct: 0.81 },
    { name: 'Cabin Air Valve', ata: '21-30', category: 'Consumable', position: 'Cabin Zone A', lifeLimitHours: null, lifeRemainingPct: null },
    { name: 'CFM56-7B HPT Blade Set', ata: '72-50', category: 'Life-Limited Part', position: 'Engine 2', lifeLimitHours: 20000, lifeRemainingPct: 0.29 }
  ];
  const statuses: ComponentStatus[] = ['Installed', 'Installed', 'Installed', 'In Repair', 'Quarantine', 'Removed'];

  return parts.map((p, i) => {
    const lifeRemainingHours = p.lifeLimitHours != null && p.lifeRemainingPct != null ? Math.round(p.lifeLimitHours * p.lifeRemainingPct) : null;
    const status = i % 6 === 3 ? 'In Repair' : i % 9 === 5 ? 'Quarantine' : statuses[i % statuses.length];
    return {
      id: `ct-${String(i + 1).padStart(4, '0')}`,
      componentNo: `CMP-${10200 + i * 17}`,
      componentName: p.name,
      category: p.category,
      ataChapter: p.ata,
      aircraftReg: AIRCRAFT_REGS[i % AIRCRAFT_REGS.length],
      position: p.position,
      serialNumber: `SN-${894000 + i * 231}`,
      installedDate: iso(-900 - i * 45),
      lifeLimitHours: p.lifeLimitHours,
      lifeRemainingHours,
      cyclesRemaining: p.lifeLimitHours != null ? Math.round((lifeRemainingHours ?? 0) * 0.62) : null,
      nextRemovalDue: p.lifeLimitHours != null ? iso(30 + i * 60) : null,
      status
    };
  });
}

export function seedPilots() {
  const names = [
    'Sam Whitfield', 'Priya Nandy', 'Diego Salas', 'Elena Cross', 'Marcus Lee',
    'Nadia Hussain', 'Chen Wei', 'Fatima Haddad', 'Lucas Ferreira', 'Yuki Tanaka',
    'Henry Osei', 'Layla Kowalski'
  ];
  const licenseTypes = ['ATPL', 'ATPL', 'CPL'];
  const ratingsPool = ['B737', 'A320', 'B787', 'A350', 'E190'];
  const statuses = ['Active', 'Active', 'Active', 'Training', 'On Leave', 'Suspended'];
  return names.map((fullName, i) => ({
    id: `plt-${String(i + 1).padStart(4, '0')}`,
    employeeNo: `PLT-${3100 + i}`,
    fullName,
    licenseNo: `LIC-${90000 + i * 37}`,
    licenseType: licenseTypes[i % licenseTypes.length],
    ratings: `${ratingsPool[i % ratingsPool.length]}, ${ratingsPool[(i + 2) % ratingsPool.length]}`,
    medicalCertExpiry: new Date(Date.now() + (30 + i * 25) * 86400000).toISOString().slice(0, 10),
    totalFlightHours: 1200 + i * 430,
    status: statuses[i % statuses.length]
  }));
}

export function seedSpareParts() {
  const categories = ['Avionics', 'Airframe', 'Engine', 'Landing Gear', 'Hydraulics', 'Cabin Interior'];
  const parts = [
    'Hydraulic Pump Assembly', 'Fuel Filter Element', 'Brake Disc Assembly', 'Nav Light Assembly',
    'Cabin Air Valve', 'Turbine Blade Set', 'Oxygen Mask Unit', 'Wheel Bearing Kit',
    'Avionics Control Module', 'Landing Gear Actuator', 'APU Starter Motor', 'Cockpit Display Unit'
  ];
  return parts.map((description, i) => {
    const qty = 3 + ((i * 7) % 40);
    const min = 5 + (i % 10);
    return {
      id: `sp-${String(i + 1).padStart(4, '0')}`,
      partNo: `PN-${58000 + i * 13}`,
      description,
      category: categories[i % categories.length],
      quantityOnHand: qty,
      minStockLevel: min,
      unitCost: Number((45 + i * 62.5).toFixed(2)),
      warehouseLocation: `WH-${1 + (i % 3)} / Rack ${String.fromCharCode(65 + (i % 6))}${(i % 12) + 1}`,
      status: qty === 0 ? 'Out of Stock' : qty < min ? 'Low Stock' : 'In Stock'
    };
  });
}

export function seedPurchaseOrders() {
  const vendors = [
    'Atlas Aerospace Supply Co.', 'Meridian Parts Ltd.', 'Nordic Aviation Systems', 'Summit Logistics Group',
    'Pacific Aero Industries', 'Continental Supply Co.', 'Horizon Aerospace', 'Vertex Aviation Group'
  ];
  const statuses = ['Draft', 'Submitted', 'Approved', 'Received', 'Cancelled'];
  return vendors.concat(vendors.slice(0, 4)).map((vendor, i) => {
    const order = new Date(Date.now() - (25 - i) * 86400000);
    const expected = new Date(order.getTime() + (5 + (i % 15)) * 86400000);
    return {
      id: `po-${String(i + 1).padStart(4, '0')}`,
      poNumber: `PO-${7700 + i}`,
      vendor,
      orderDate: order.toISOString().slice(0, 10),
      expectedDelivery: expected.toISOString().slice(0, 10),
      itemCount: 2 + (i % 9),
      totalAmount: Number((820 + i * 415.25).toFixed(2)),
      status: statuses[i % statuses.length]
    };
  });
}

export function seedItemMaster() {
  const items = [
    { name: 'Hydraulic Pump Assembly', category: 'Hydraulics', type: 'Rotable', unit: 'EA' },
    { name: 'Fuel Filter Element', category: 'Engine', type: 'Consumable', unit: 'BOX' },
    { name: 'Brake Disc Assembly', category: 'Landing Gear', type: 'Rotable', unit: 'EA' },
    { name: 'Nav Light Assembly', category: 'Electrical', type: 'Repairable', unit: 'EA' },
    { name: 'Cabin Air Valve', category: 'Cabin Interior', type: 'Expendable', unit: 'EA' },
    { name: 'Turbine Blade Set', category: 'Engine', type: 'Rotable', unit: 'SET' },
    { name: 'Oxygen Mask Unit', category: 'Safety Equipment', type: 'Consumable', unit: 'EA' },
    { name: 'Wheel Bearing Kit', category: 'Landing Gear', type: 'Consumable', unit: 'PKT' },
    { name: 'Avionics Control Module', category: 'Avionics', type: 'Repairable', unit: 'EA' },
    { name: 'Landing Gear Actuator', category: 'Landing Gear', type: 'Rotable', unit: 'EA' },
    { name: 'APU Starter Motor', category: 'Engine', type: 'Repairable', unit: 'EA' },
    { name: 'Torque Wrench (Calibrated)', category: 'Tools', type: 'Tool', unit: 'EA' }
  ];
  const manufacturers = ['Honeywell', 'Collins Aerospace', 'Safran', 'Parker Hannifin', 'Woodward', 'Meggitt'];
  const suppliers = ['Atlas Aerospace Supply Co.', 'Meridian Parts Ltd.', 'Nordic Aviation Systems', 'Summit Logistics Group'];
  const statuses = ['Active', 'Active', 'Active', 'Under Review', 'Inactive'];
  const iso = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 86400000).toISOString().slice(0, 10);

  return items.map((it, i) => {
    const reorderLevel = 5 + (i % 10);
    const currentStock = i % 4 === 0 ? Math.max(0, reorderLevel - 2) : reorderLevel + 3 + (i % 20);
    const isRotableLike = it.type === 'Rotable' || it.type === 'Repairable';
    return {
      id: `im-${String(i + 1).padStart(4, '0')}`,

      itemCode: `ITM-${10000 + i * 37}`,
      itemName: it.name,
      itemCategory: it.category,
      itemGroup: it.category,
      itemSubGroup: it.type,
      description: `${it.name} — standard warehouse stock item.`,

      itemType: it.type,
      unit: it.unit,
      brand: manufacturers[i % manufacturers.length],
      manufacturer: manufacturers[i % manufacturers.length],
      manufacturerPartNo: `MPN-${58000 + i * 13}`,
      ataChapter: `${20 + i * 4}-00`,

      primarySupplier: suppliers[i % suppliers.length],
      purchasePrice: Number((45 + i * 62.5).toFixed(2)),
      salesPrice: Number((60 + i * 78).toFixed(2)),
      packSize: it.unit === 'BOX' || it.unit === 'PKT' ? 10 + (i % 5) * 5 : 1,
      discountApplicable: i % 3 === 0,
      taxVatPct: 15,

      warehouse: `WH-${1 + (i % 3)}`,
      storeLocation: `Store ${String.fromCharCode(65 + (i % 4))}`,
      rackBin: `Rack ${String.fromCharCode(65 + (i % 6))}${(i % 12) + 1}`,
      reorderLevel,
      reorderQty: reorderLevel * 2,
      minStock: Math.max(1, reorderLevel - 3),
      maxStock: reorderLevel * 5,
      currentStock,

      serialTracked: isRotableLike,
      batchTracked: it.type === 'Consumable' || it.type === 'Expendable',
      shelfLifeTracked: it.type === 'Expendable',
      shelfLifeMonths: it.type === 'Expendable' ? 24 : 0,
      warrantyApplicable: isRotableLike,
      warrantyPeriodMonths: isRotableLike ? 12 : 0,
      calibrationRequired: it.type === 'Tool',
      calibrationIntervalMonths: it.type === 'Tool' ? 6 : 0,
      lifeLimited: it.type === 'Rotable',
      assetFlag: it.type === 'Tool',

      status: statuses[i % statuses.length],
      createdAt: iso(-90 + i * 3)
    };
  });
}

export function seedAssetMaster() {
  const assets = [
    { name: 'Hangar Door 3 — East Bay', category: 'Hangar Door', critical: true },
    { name: 'Rooftop Chiller Unit 2', category: 'HVAC', critical: false },
    { name: 'Fire Suppression System — Hangar 1', category: 'Fire & Safety', critical: true },
    { name: 'Main Distribution Panel — Terminal A', category: 'Electrical', critical: true },
    { name: 'Passenger Elevator — Terminal B', category: 'Elevator/Lift', critical: true },
    { name: 'Overhead Gantry Crane — Hangar 2', category: 'Crane/Hoist', critical: true },
    { name: 'Standby Diesel Generator 500kW', category: 'Generator', critical: true },
    { name: 'Baggage Hall Conveyor Motor', category: 'Building Infrastructure', critical: false },
    { name: 'Ops Center Server Rack', category: 'IT Equipment', critical: false },
    { name: 'Crew Briefing Room Furniture Set', category: 'Furniture & Fixtures', critical: false },
    { name: 'Pushback Tractor TBL-200', category: 'GSE', critical: false },
    { name: 'Perimeter Fence Section 4', category: 'Other', critical: false }
  ];
  const facilities = ['Hangar 1', 'Hangar 2', 'Hangar 3', 'Terminal A', 'Terminal B', 'Maintenance Base'];
  const manufacturers = ['Carrier', 'Siemens', 'Otis', 'Konecranes', 'Caterpillar', 'Cummins', 'Honeywell'];
  const vendors = ['Atlas Aerospace Supply Co.', 'Meridian Parts Ltd.', 'Nordic Aviation Systems'];
  const conditions = ['Excellent', 'Good', 'Good', 'Fair', 'Poor'];
  const statuses = ['Active', 'Active', 'Active', 'Under Maintenance', 'Out of Service'];
  const iso = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 86400000).toISOString().slice(0, 10);

  return assets.map((a, i) => {
    const purchasePrice = 8000 + i * 15250;
    return {
      id: `am-${String(i + 1).padStart(4, '0')}`,

      assetCode: `AST-${20000 + i * 41}`,
      assetName: a.name,
      assetCategory: a.category,
      assetType: a.category,
      description: `${a.name} — facility asset under scheduled maintenance.`,
      serialNumber: `SN-${770000 + i * 113}`,
      assetTag: `TAG-${i + 1000}`,

      facility: facilities[i % facilities.length],
      building: facilities[i % facilities.length],
      floorZone: `Zone ${String.fromCharCode(65 + (i % 5))}`,
      roomLocation: `Room ${100 + i * 3}`,

      manufacturer: manufacturers[i % manufacturers.length],
      model: `MDL-${300 + i * 7}`,
      purchaseDate: iso(-1800 + i * 45),
      purchasePrice,
      currentValue: Math.round(purchasePrice * (0.4 + (i % 5) * 0.1)),
      depreciationMethod: i % 3 === 0 ? 'None' : 'Straight Line',
      usefulLifeYears: 10 + (i % 10),
      vendor: vendors[i % vendors.length],
      warrantyExpiry: iso(400 - i * 30),
      insurancePolicyNo: `INS-${81000 + i * 17}`,

      condition: conditions[i % conditions.length],
      lastInspectionDate: iso(-40 - i * 4),
      nextInspectionDate: iso(50 - i * 4),
      lastMaintenanceDate: iso(-60 - i * 5),
      nextMaintenanceDate: iso(30 - i * 5),
      maintenanceFrequencyMonths: 3 + (i % 4) * 3,
      assignedTechnician: ['R. Alvarez', 'K. Novak', 'T. Ibrahim', 'M. Chen'][i % 4],

      certificationRequired: a.critical,
      certificationExpiry: a.critical ? iso(60 - i * 8) : null,
      criticalAsset: a.critical,
      status: statuses[i % statuses.length]
    };
  });
}

export function seedHazardReports() {
  const hazards = [
    { title: 'FOD observed on Taxiway Bravo apron', category: 'Operational', area: 'Ground Ops' },
    { title: 'Worn tread on pushback tractor tires', category: 'Technical', area: 'Ground Ops' },
    { title: 'Unstable approach trend at high-altitude airports', category: 'Operational', area: 'Flight Ops' },
    { title: 'Inconsistent torque values on wheel bolts', category: 'Technical', area: 'Maintenance' },
    { title: 'Fatigue reports rising on red-eye rotations', category: 'Human Factors', area: 'Flight Ops' },
    { title: 'Fuel spill containment procedure unclear', category: 'Environmental', area: 'Ground Ops' },
    { title: 'Cabin crew door-arming cross-check gaps', category: 'Organizational', area: 'Cabin' },
    { title: 'De-icing fluid holdover time miscalculation risk', category: 'Operational', area: 'Ground Ops' },
    { title: 'GPWS nuisance warnings at Runway 27 approach', category: 'Technical', area: 'Flight Ops' },
    { title: 'Contractor access badge process inconsistency', category: 'Organizational', area: 'Other' },
    { title: 'Lithium battery cargo declaration errors', category: 'Operational', area: 'Ground Ops' },
    { title: 'Runway incursion near-miss during low visibility', category: 'Operational', area: 'ATC' }
  ];
  const sources = ['Line Operations', 'Maintenance', 'Flight Data Monitoring', 'Audit', 'Voluntary Report'];
  const likelihoods = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
  const severities = ['Negligible', 'Minor', 'Major', 'Hazardous', 'Catastrophic'];
  const statuses = ['Open', 'Under Investigation', 'Mitigation In Progress', 'Closed'];
  const iso = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 86400000).toISOString().slice(0, 10);

  const scoreOf = (likelihood: string, severity: string) =>
    (likelihoods.indexOf(likelihood) + 1) * (severities.indexOf(severity) + 1);
  const tolerabilityOf = (score: number) => (score >= 15 ? 'Unacceptable' : score >= 6 ? 'Tolerable' : 'Acceptable');

  return hazards.map((h, i) => {
    const likelihood = likelihoods[i % likelihoods.length];
    const severity = severities[(i * 2) % severities.length];
    const score = scoreOf(likelihood, severity);
    const residualLikelihood = likelihoods[Math.max(0, (i % likelihoods.length) - 2)];
    const residualSeverity = severities[Math.max(0, ((i * 2) % severities.length) - 1)];
    const status = statuses[i % statuses.length];
    return {
      id: `hz-${String(i + 1).padStart(4, '0')}`,

      hazardNo: `HAZ-${4000 + i * 23}`,
      hazardTitle: h.title,
      dateIdentified: iso(-60 - i * 5),
      reportedBy: ['R. Alvarez', 'K. Novak', 'T. Ibrahim', 'M. Chen', 'S. Okafor'][i % 5],
      department: h.area,
      source: sources[i % sources.length],
      description: `${h.title}. Identified via ${sources[i % sources.length].toLowerCase()} and logged for safety risk assessment.`,
      location: ['Hangar 1', 'Terminal A', 'Ramp 3', 'Runway 27', 'Ops Center'][i % 5],

      hazardCategory: h.category,
      affectedArea: h.area,
      aircraftReg: i % 3 === 0 ? ['N101AV', 'N102AV', 'G-ABCP'][i % 3] : '',
      flightPhase: h.area === 'Flight Ops' ? ['Approach', 'Landing', 'Cruise', 'Takeoff'][i % 4] : 'N/A',

      initialLikelihood: likelihood,
      initialSeverity: severity,
      initialRiskScore: score,
      riskTolerability: tolerabilityOf(score),

      mitigationActions: status === 'Open' ? '' : `Mitigation plan assigned — ${h.title.toLowerCase()} addressed via revised procedure and crew briefing.`,
      responsiblePerson: status === 'Open' ? '' : ['Safety Manager', 'Chief Pilot', 'MRO Quality Lead', 'Ground Ops Manager'][i % 4],
      targetCompletionDate: status === 'Closed' ? null : iso(45 - i * 4),
      residualLikelihood: status === 'Closed' ? residualLikelihood : likelihood,
      residualSeverity: status === 'Closed' ? residualSeverity : severity,
      residualRiskScore: status === 'Closed' ? scoreOf(residualLikelihood, residualSeverity) : score,

      status,
      closedDate: status === 'Closed' ? iso(-10 - i * 2) : null,
      closedBy: status === 'Closed' ? 'Safety Manager' : '',
      verifiedEffective: status === 'Closed'
    };
  });
}

type BaggageStatus = 'Checked In' | 'Screened' | 'Sorted' | 'Loaded' | 'In Transfer' | 'Arrived' | 'Delivered' | 'Mishandled';
type BagRouteType = 'Origin' | 'Transfer' | 'Transit';
type BagType = 'Checked' | 'Priority' | 'Oversize' | 'Fragile';

export function seedBaggageHandling() {
  const iso = (hoursFromNow: number) => new Date(Date.now() + hoursFromNow * 3600000).toISOString();
  const passengers = [
    'J. Whitfield', 'P. Nandy', 'D. Salas', 'E. Cross', 'M. Lee', 'N. Hussain',
    'C. Wei', 'F. Haddad', 'L. Ferreira', 'Y. Tanaka', 'H. Osei', 'L. Kowalski', 'S. Okafor', 'R. Alvarez'
  ];
  const flights = ['AV107', 'AV114', 'AV121', 'AV128', 'AV135', 'AV142', 'AV149'];
  const bagTypes: BagType[] = ['Checked', 'Checked', 'Priority', 'Checked', 'Oversize', 'Checked', 'Fragile'];
  const routeTypes: BagRouteType[] = ['Origin', 'Origin', 'Transfer', 'Origin', 'Transit', 'Transfer', 'Origin'];

  const rows: {
    status: BaggageStatus;
    hasLoaded: boolean;
    hasTransfer: boolean;
    hasArrived: boolean;
  }[] = [
    { status: 'Delivered', hasLoaded: true, hasTransfer: false, hasArrived: true },
    { status: 'Arrived', hasLoaded: true, hasTransfer: false, hasArrived: true },
    { status: 'In Transfer', hasLoaded: true, hasTransfer: true, hasArrived: false },
    { status: 'Loaded', hasLoaded: true, hasTransfer: false, hasArrived: false },
    { status: 'Sorted', hasLoaded: false, hasTransfer: false, hasArrived: false },
    { status: 'Screened', hasLoaded: false, hasTransfer: false, hasArrived: false },
    { status: 'Checked In', hasLoaded: false, hasTransfer: false, hasArrived: false },
    { status: 'Delivered', hasLoaded: true, hasTransfer: false, hasArrived: true },
    { status: 'Mishandled', hasLoaded: true, hasTransfer: false, hasArrived: false },
    { status: 'In Transfer', hasLoaded: true, hasTransfer: false, hasArrived: false },
    { status: 'Arrived', hasLoaded: true, hasTransfer: false, hasArrived: true },
    { status: 'Delivered', hasLoaded: true, hasTransfer: false, hasArrived: true },
    { status: 'Mishandled', hasLoaded: true, hasTransfer: true, hasArrived: false },
    { status: 'Loaded', hasLoaded: true, hasTransfer: false, hasArrived: false }
  ];

  return rows.map((r, i) => {
    const routeType = routeTypes[i % routeTypes.length];
    const checkedInTime = iso(-6 - i * 0.4);
    return {
      id: `bag-${String(i + 1).padStart(4, '0')}`,
      tagNo: `0125-${840000 + i * 733}`,
      passengerName: passengers[i % passengers.length],
      pnr: `PNR${100 + i * 7}`,
      flightNo: flights[i % flights.length],
      bagType: bagTypes[i % bagTypes.length],
      routeType,
      beltNo: `Belt ${1 + (i % 6)}`,
      weightKg: Number((14 + ((i * 3.7) % 15)).toFixed(1)),
      checkedInTime,
      loadedTime: r.hasLoaded ? iso(-4 - i * 0.3) : null,
      transferTime: r.hasTransfer && routeType === 'Transfer' ? iso(-2 - i * 0.2) : null,
      arrivedTime: r.hasArrived ? iso(-1) : null,
      status: r.status
    };
  });
}
