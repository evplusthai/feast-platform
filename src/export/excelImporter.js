import * as XLSX from 'xlsx';
import { getDefaultAssumptions } from '../engine/assumptions.js';

/**
 * Import assumptions from an MTC Feasibility Study Excel template
 * Reads the "SUM ASSP." sheet and maps values to our assumptions format
 */
export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });

        const assumptions = parseWorkbook(wb);
        resolve(assumptions);
      } catch (err) {
        reject(new Error('Failed to parse Excel file: ' + err.message));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

function parseWorkbook(wb) {
  const a = getDefaultAssumptions();
  const sheetNames = wb.SheetNames;

  // Try to find the assumptions sheet
  const assumpSheet = findSheet(wb, ['SUM ASSP.', 'SUM ASSP', 'Assumptions', 'ASSP']);
  if (assumpSheet) {
    parseAssumptionsSheet(assumpSheet, a);
  }

  // Try to find proposal sheet for project info
  const proposalSheet = findSheet(wb, ['Proposal', 'Cover']);
  if (proposalSheet) {
    parseProposalSheet(proposalSheet, a);
  }

  return a;
}

function findSheet(wb, candidates) {
  for (const name of candidates) {
    const idx = wb.SheetNames.findIndex(
      sn => sn.toLowerCase().trim().startsWith(name.toLowerCase())
    );
    if (idx >= 0) {
      return wb.Sheets[wb.SheetNames[idx]];
    }
  }
  return null;
}

function cellVal(sheet, cellRef, defaultVal = 0) {
  const cell = sheet[cellRef];
  if (!cell) return defaultVal;
  if (typeof cell.v === 'number') return cell.v;
  if (typeof cell.v === 'string') {
    const num = parseFloat(cell.v.replace(/,/g, ''));
    return isNaN(num) ? defaultVal : num;
  }
  return defaultVal;
}

function cellStr(sheet, cellRef, defaultVal = '') {
  const cell = sheet[cellRef];
  if (!cell) return defaultVal;
  return String(cell.v || defaultVal).trim();
}

function parseAssumptionsSheet(ws, a) {
  // The MTC template has a specific layout in SUM ASSP.
  // We scan for known labels and grab adjacent values
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z100');
  const labelMap = {};

  // Build a map of all cell values for scanning
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= Math.min(range.e.c, 10); c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      const cell = ws[ref];
      if (cell && typeof cell.v === 'string') {
        const label = cell.v.toLowerCase().trim();
        // Store the row and col for later value extraction
        labelMap[label] = { r, c };
      }
    }
  }

  // Try to extract key values by scanning for keywords
  scanAndSet(ws, labelMap, a, [
    { patterns: ['vehicle count', 'number of vehicle', 'จำนวนรถ'], field: 'vehicleCount', type: 'int' },
    { patterns: ['unit price', 'vehicle price', 'ราคาต่อคัน'], field: 'vehicleUnitPrice', type: 'num' },
    { patterns: ['contract period', 'ระยะเวลาสัญญา'], field: 'contractPeriodYears', type: 'int' },
    { patterns: ['driver salary', 'เงินเดือนคนขับ'], field: 'labor.driverSalary', type: 'num' },
    { patterns: ['driver count', 'number of driver', 'จำนวนคนขับ'], field: 'labor.driverCount', type: 'int' },
    { patterns: ['monitor salary', 'เงินเดือนคนคุมรอบ'], field: 'labor.monitorSalary', type: 'num' },
    { patterns: ['monitor count', 'จำนวนคนคุมรอบ'], field: 'labor.monitorCount', type: 'int' },
    { patterns: ['fuel price', 'ราคาเชื้อเพลิง'], field: 'fuel.fuelPrice', type: 'num' },
    { patterns: ['distance per trip', 'ระยะทาง'], field: 'fuel.distancePerTrip', type: 'num' },
    { patterns: ['consumption rate', 'อัตราสิ้นเปลือง'], field: 'fuel.consumptionRate', type: 'num' },
    { patterns: ['equity', 'ส่วนทุน'], field: 'equityPercent', type: 'percent' },
    { patterns: ['lt loan rate', 'long term', 'ดอกเบี้ยเงินกู้ระยะยาว'], field: 'ltLoanRate', type: 'rate' },
    { patterns: ['wacc'], field: 'wacc', type: 'rate' },
    { patterns: ['tax rate', 'อัตราภาษี'], field: 'taxRate', type: 'rate' },
    { patterns: ['inflation', 'เงินเฟ้อ'], field: 'inflationRate', type: 'rate' },
    { patterns: ['maintenance cost', 'ค่าซ่อมบำรุง'], field: 'maintenance.costPerKm', type: 'num' },
    { patterns: ['tire price', 'ราคายาง'], field: 'tires.pricePerUnit', type: 'num' },
    { patterns: ['insurance', 'ค่าประกัน'], field: 'insurance.vehicleInsuranceYear1', type: 'num' },
  ]);

  // Try to find trip pricing
  scanTripPricing(ws, labelMap, a);
}

function scanAndSet(ws, labelMap, a, mappings) {
  for (const mapping of mappings) {
    for (const pattern of mapping.patterns) {
      const found = Object.keys(labelMap).find(k => k.includes(pattern));
      if (found) {
        const { r, c } = labelMap[found];
        // Look for value in the next columns (c+1 to c+5)
        for (let vc = c + 1; vc <= c + 5; vc++) {
          const valRef = XLSX.utils.encode_cell({ r, c: vc });
          const val = cellVal(ws, valRef, null);
          if (val !== null && val !== 0) {
            setNestedField(a, mapping.field, val, mapping.type);
            break;
          }
        }
        break;
      }
    }
  }
}

function setNestedField(obj, path, value, type) {
  const parts = path.split('.');
  let target = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    target = target[parts[i]];
    if (!target) return;
  }

  const field = parts[parts.length - 1];
  switch (type) {
    case 'int':
      target[field] = Math.round(value);
      break;
    case 'num':
      target[field] = value;
      break;
    case 'percent':
      // Could be 0-100 or 0-1
      target[field] = value > 1 ? value : value * 100;
      break;
    case 'rate':
      // Could be 0-100 or 0-1
      target[field] = value > 1 ? value / 100 : value;
      break;
    default:
      target[field] = value;
  }
}

function scanTripPricing(ws, labelMap, a) {
  // Look for trip-related keywords
  const tripPatterns = {
    normal: ['normal trip', 'เที่ยวปกติ', 'regular'],
    field: ['field trip', 'เที่ยวพิเศษ', 'special'],
    staffShuttle: ['staff shuttle', 'รับส่งบุคลากร', 'shuttle'],
    busRent: ['bus rent', 'เช่ารถบัส', 'charter'],
  };

  for (const [tripName, patterns] of Object.entries(tripPatterns)) {
    const trip = a.tripTypes.find(t => t.name === tripName);
    if (!trip) continue;

    for (const pattern of patterns) {
      const found = Object.keys(labelMap).find(k => k.includes(pattern));
      if (found) {
        const { r, c } = labelMap[found];
        // Look for price value nearby
        for (let vc = c + 1; vc <= c + 5; vc++) {
          const val = cellVal(ws, XLSX.utils.encode_cell({ r, c: vc }), null);
          if (val !== null && val > 0) {
            trip.basePrice = val;
            trip.enabled = true;
            break;
          }
        }
        break;
      }
    }
  }
}

function parseProposalSheet(ws, a) {
  // Scan for project name and client in proposal sheet
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z50');

  for (let r = range.s.r; r <= Math.min(range.e.r, 50); r++) {
    for (let c = range.s.c; c <= Math.min(range.e.c, 5); c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      const cell = ws[ref];
      if (!cell || typeof cell.v !== 'string') continue;

      const label = cell.v.toLowerCase().trim();

      if (label.includes('project name') || label.includes('ชื่อโปรเจกต์')) {
        const valRef = XLSX.utils.encode_cell({ r, c: c + 1 });
        a.projectName = cellStr(ws, valRef, a.projectName);
      }

      if (label.includes('client') || label.includes('ลูกค้า') || label.includes('company')) {
        const valRef = XLSX.utils.encode_cell({ r, c: c + 1 });
        a.clientName = cellStr(ws, valRef, a.clientName);
      }
    }
  }
}
