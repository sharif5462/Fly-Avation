/**
 * Hand-authored seed data for the flagship (hand-built, non-generic) pages.
 * Everything else in the app seeds procedurally from EntityConfig — see
 * fake-data.ts — but these resources back a real domain-specific UI, so they
 * get realistic values instead.
 */

const AIRCRAFT_REGS = ['N101AV', 'N102AV', 'N204SK', 'N305SK', 'G-ABCP', 'G-XLRJ', 'D-AIBX', 'A6-EQF', 'VT-ANL', 'B-KQC'];
const AIRPORT_PAIRS: Array<[string, string]> = [
  ['JFK', 'LHR'], ['DXB', 'SIN'], ['ORD', 'DFW'], ['CDG', 'FRA'], ['HND', 'ICN'],
  ['SYD', 'AKL'], ['GRU', 'EZE'], ['DEL', 'BOM'], ['AMS', 'IST'], ['HKG', 'NRT']
];

export function seedFlights() {
  const statuses = ['Scheduled', 'Boarding', 'Departed', 'In Air', 'Landed', 'Delayed', 'Cancelled'];
  return AIRPORT_PAIRS.map(([origin, destination], i) => {
    const dep = new Date(Date.now() + (i - 4) * 3 * 3600000);
    const arr = new Date(dep.getTime() + (4 + (i % 6)) * 3600000);
    return {
      id: `flt-${String(i + 1).padStart(4, '0')}`,
      flightNo: `AV${100 + i * 7}`,
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

export function seedAircraft() {
  const types = [
    { type: 'Boeing 737-800', mfr: 'Boeing', capacity: 189 },
    { type: 'Airbus A320neo', mfr: 'Airbus', capacity: 180 },
    { type: 'Boeing 787-9', mfr: 'Boeing', capacity: 296 },
    { type: 'Airbus A350-900', mfr: 'Airbus', capacity: 325 },
    { type: 'Embraer E190', mfr: 'Embraer', capacity: 100 },
    { type: 'ATR 72-600', mfr: 'ATR', capacity: 70 }
  ];
  const statuses = ['Active', 'Active', 'Active', 'In Maintenance', 'Stored', 'Grounded'];
  return AIRCRAFT_REGS.map((reg, i) => {
    const t = types[i % types.length];
    return {
      id: `ac-${String(i + 1).padStart(4, '0')}`,
      registration: reg,
      aircraftType: t.type,
      manufacturer: t.mfr,
      capacity: t.capacity,
      yearBuilt: 2008 + (i % 15),
      baseAirport: AIRPORT_PAIRS[i % AIRPORT_PAIRS.length][0],
      totalFlightHours: 8000 + i * 1240,
      status: statuses[i % statuses.length]
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
