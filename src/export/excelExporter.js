import * as XLSX from 'xlsx';
import { calcTotalInvestment } from '../engine/assumptions.js';
import { getLang } from '../i18n.js';

/**
 * Export a feasibility study to multi-sheet Excel workbook
 */
export function exportFeasibilityExcel(results, project) {
  const wb = XLSX.utils.book_new();
  const a = results.assumptions;
  const lang = getLang();
  const scenarioName = project?.scenarios?.[0]?.name || 'Base Case';

  // Sheet 1: Executive Summary
  addSummarySheet(wb, results, a, project);

  // Sheet 2: Assumptions
  addAssumptionsSheet(wb, a);

  // Sheet 3: P&L
  addPnLSheet(wb, results);

  // Sheet 4: Debt Schedule
  addDebtSheet(wb, results);

  // Sheet 5: Depreciation
  addDepreciationSheet(wb, results);

  // Sheet 6: Cash Flow
  addCashFlowSheet(wb, results);

  // Sheet 7: DCF
  addDCFSheet(wb, results);

  // Sheet 8: Balance Sheet
  addBalanceSheetSheet(wb, results);

  // Generate filename
  const projectName = project?.name || a.projectName || 'Feasibility_Study';
  const safeName = projectName.replace(/[^a-zA-Z0-9_\-\u0E00-\u0E7F ]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${safeName}_${dateStr}.xlsx`;

  // Write and download
  XLSX.writeFile(wb, filename);
}

function addSummarySheet(wb, results, a, project) {
  const { summary } = results;
  const totalMonths = results.totalMonths;

  const data = [
    ['FEAST - Feasibility Study Report'],
    [],
    ['Project Information'],
    ['Project Name', a.projectName || project?.name || ''],
    ['Client', a.clientName || ''],
    ['Contract Period', `${a.contractPeriodYears} Years ${a.contractPeriodMonths} Months (${totalMonths} months)`],
    ['Start Date', a.startDate],
    ['Number of Vehicles', a.vehicleCount],
    [],
    ['Investment Summary'],
    ['Total Investment', summary.totalInvestment],
    ['Equity Required', summary.equityRequired],
    ['Debt Required', summary.debtRequired],
    [],
    ['Key Financial Indicators'],
    ['NPV', summary.npv],
    ['IRR (Before Tax)', isNaN(summary.irr) || summary.irr === null ? 'N/A' : summary.irr],
    ['Payback Period', summary.paybackPeriodMonths ? `${summary.paybackYears}Y ${summary.paybackRemainingMonths}M` : 'N/A'],
    [],
    ['Contract Period Totals'],
    ['Total Revenue', summary.totalContractRevenue],
    ['Total Costs', summary.totalContractCosts],
    ['Total Net Profit', summary.totalContractProfit],
    ['Net Profit Margin', summary.netProfitPercent],
    [],
    ['Year 1 Performance'],
    ['Y1 Revenue', summary.year1Revenue],
    ['Y1 EBITDA', summary.year1EBITDA],
    ['Y1 Net Profit', summary.year1NetProfit],
    ['Y1 Net Margin', summary.year1Margin],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Column widths
  ws['!cols'] = [{ wch: 25 }, { wch: 25 }];

  // Format currency cells
  formatCurrencyCells(ws, [
    'B11', 'B12', 'B13', 'B16',
    'B21', 'B22', 'B23',
    'B27', 'B28', 'B29',
  ]);

  // Format percentage cells
  formatPercentCells(ws, ['B17', 'B24', 'B30']);

  XLSX.utils.book_append_sheet(wb, ws, 'Executive Summary');
}

function addAssumptionsSheet(wb, a) {
  const totalInv = calcTotalInvestment(a);

  const data = [
    ['Assumptions Summary'],
    [],
    ['Vehicle Configuration'],
    ['Vehicle Count', a.vehicleCount],
    ['Unit Price (THB)', a.vehicleUnitPrice],
    ['Modification Cost/Unit', a.vehicleModificationCost],
    ['Buy Back %', a.buyBackPercent / 100],
    [],
    ['Revenue Assumptions'],
    ...a.tripTypes.map(trip => [
      trip.name + (trip.enabled ? ' (Enabled)' : ' (Disabled)'),
      trip.enabled ? trip.basePrice * (1 + trip.markup) : 0,
      `${trip.tripsPerDay} trips/day`,
      `${trip.workingDaysPerMonth} days/mo`,
    ]),
    ['EV Charger Rental Income/Month', a.evChargerRentalIncome],
    ['Other Income/Month', a.otherIncome],
    [],
    ['Cost Assumptions'],
    ['Distance/Trip (km)', a.fuel.distancePerTrip],
    ['Fuel Consumption Rate', a.fuel.consumptionRate],
    ['Fuel Price', a.fuel.fuelPrice],
    ['Driver Salary', a.labor.driverSalary],
    ['Driver Count', a.labor.driverCount],
    ['Monitor Salary', a.labor.monitorSalary],
    ['Monitor Count', a.labor.monitorCount],
    ['Maintenance Cost/km', a.maintenance.costPerKm],
    ['Other Cost/Vehicle/Month', a.otherCosts.monthlyPerVehicle],
    [],
    ['Financing'],
    ['Total Investment', totalInv],
    ['Equity %', a.equityPercent / 100],
    ['LT Loan Rate', a.ltLoanRate],
    ['LT Loan Term (Years)', a.ltLoanTermYears],
    ['WACC', a.wacc],
    ['Inflation Rate', a.inflationRate],
    ['Tax Rate', a.taxRate],
    ['Depreciation - Vehicle (Years)', a.depreciationYearsVehicle],
    ['Depreciation - Charger (Years)', a.depreciationYearsCharger],
    ['Salvage Value %', a.salvageValuePercent / 100],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Assumptions');
}

function addPnLSheet(wb, results) {
  const { pnl, totalMonths } = results;
  const numYears = Math.ceil(totalMonths / 12);

  // Header row
  const header = ['P&L Statement'];
  const monthRow = ['Month'];
  const yearRow = ['Year'];

  // Build annual data
  for (let y = 0; y < numYears; y++) {
    monthRow.push(`Y${y + 1}`);
    yearRow.push(y + 1);
  }
  monthRow.push('Total');

  // P&L line items
  const items = [
    { label: 'Service Revenue', key: 'serviceRevenue' },
    { label: 'EV Charger Rental', key: 'chargerRental' },
    { label: 'Other Income', key: 'otherIncome' },
    { label: 'Total Revenue', key: 'totalRevenue', bold: true },
    { label: '', key: null },
    { label: 'Fuel / Energy Cost', key: 'fuelCost' },
    { label: 'Driver Cost', key: 'driverCost' },
    { label: 'Monitor Cost', key: 'monitorCost' },
    { label: 'Tire Replacement', key: 'tireCost' },
    { label: 'Insurance', key: 'insuranceCost' },
    { label: 'Expressway Tolls', key: 'expresswayCost' },
    { label: 'Maintenance', key: 'maintenanceCost' },
    { label: 'Charger Maintenance', key: 'chargerMaintenanceCost' },
    { label: 'Other Costs', key: 'otherCosts' },
    { label: 'Total Costs', key: 'totalCosts', bold: true },
    { label: '', key: null },
    { label: 'EBITDA', key: 'ebitda', bold: true },
    { label: 'Depreciation (Vehicle)', key: 'vehicleDepreciation' },
    { label: 'Depreciation (Charger)', key: 'chargerDepreciation' },
    { label: 'Depreciation (Battery)', key: 'batteryDepreciation' },
    { label: 'Total Depreciation', key: 'totalDepreciation' },
    { label: 'EBIT', key: 'ebit', bold: true },
    { label: 'Interest Expense', key: 'interestExpense' },
    { label: 'EBT', key: 'ebt', bold: true },
    { label: 'Income Tax', key: 'incomeTax' },
    { label: 'Net Profit', key: 'netProfit', bold: true },
  ];

  const data = [header, monthRow];

  items.forEach(item => {
    if (item.key === null) {
      data.push([]);
      return;
    }
    const row = [item.label];
    let total = 0;
    for (let y = 0; y < numYears; y++) {
      const slice = pnl.slice(y * 12, Math.min((y + 1) * 12, totalMonths));
      const val = slice.reduce((s, p) => s + (p[item.key] || 0), 0);
      row.push(val);
      total += val;
    }
    row.push(total);
    data.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 25 }, ...Array(numYears + 1).fill({ wch: 16 })];
  XLSX.utils.book_append_sheet(wb, ws, 'P&L');
}

function addDebtSheet(wb, results) {
  const { debtSchedule, totalMonths } = results;
  const numYears = Math.ceil(totalMonths / 12);

  const header = ['Debt Schedule'];
  const periodRow = ['Period'];
  for (let y = 0; y < numYears; y++) {
    periodRow.push(`Y${y + 1}`);
  }

  const items = [
    { label: 'LT Loan Balance (Start)', key: 'ltLoanBalance' },
    { label: 'LT Drawdown', key: 'ltDrawdown' },
    { label: 'LT Principal Payment', key: 'ltPrincipalPayment' },
    { label: 'LT Interest', key: 'ltInterest' },
    { label: 'LT Balance (End)', key: 'ltBalanceAfter', lastOfYear: true },
    { label: '', key: null },
    { label: 'ST Loan Balance', key: 'stLoanBalance', lastOfYear: true },
    { label: 'ST Drawdown', key: 'stDrawdown' },
    { label: 'ST Repayment', key: 'stRepayment' },
    { label: 'ST Interest', key: 'stInterest' },
    { label: '', key: null },
    { label: 'Total Debt Service', key: 'totalDebtService' },
  ];

  const data = [header, periodRow];

  items.forEach(item => {
    if (item.key === null) {
      data.push([]);
      return;
    }
    const row = [item.label];
    for (let y = 0; y < numYears; y++) {
      if (item.lastOfYear) {
        // Take last month of year
        const lastMonth = Math.min((y + 1) * 12, totalMonths) - 1;
        row.push(debtSchedule[lastMonth][item.key]);
      } else {
        const slice = debtSchedule.slice(y * 12, Math.min((y + 1) * 12, totalMonths));
        row.push(slice.reduce((s, d) => s + (d[item.key] || 0), 0));
      }
    }
    data.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 25 }, ...Array(numYears).fill({ wch: 16 })];
  XLSX.utils.book_append_sheet(wb, ws, 'Debt');
}

function addDepreciationSheet(wb, results) {
  const { depreciation, totalMonths } = results;
  const numYears = Math.ceil(totalMonths / 12);

  const header = ['Depreciation Schedule'];
  const periodRow = ['Period'];
  for (let y = 0; y < numYears; y++) {
    periodRow.push(`Y${y + 1}`);
  }

  const items = [
    { label: 'Vehicle Depreciation', key: 'vehicleDepreciation', sum: true },
    { label: 'Charger Depreciation', key: 'chargerDepreciation', sum: true },
    { label: 'Battery Depreciation', key: 'batteryDepreciation', sum: true },
    { label: 'Total Depreciation', key: 'totalDepreciation', sum: true, bold: true },
    { label: '', key: null },
    { label: 'Accumulated - Vehicle', key: 'vehicleAccumulatedDep', last: true },
    { label: 'Accumulated - Charger', key: 'chargerAccumulatedDep', last: true },
    { label: 'Accumulated - Battery', key: 'batteryAccumulatedDep', last: true },
    { label: 'Total Accumulated', key: 'totalAccumulatedDep', last: true, bold: true },
  ];

  const data = [header, periodRow];

  items.forEach(item => {
    if (item.key === null) {
      data.push([]);
      return;
    }
    const row = [item.label];
    for (let y = 0; y < numYears; y++) {
      if (item.last) {
        const lastMonth = Math.min((y + 1) * 12, totalMonths) - 1;
        row.push(depreciation[lastMonth][item.key]);
      } else {
        const slice = depreciation.slice(y * 12, Math.min((y + 1) * 12, totalMonths));
        row.push(slice.reduce((s, d) => s + (d[item.key] || 0), 0));
      }
    }
    data.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 25 }, ...Array(numYears).fill({ wch: 16 })];
  XLSX.utils.book_append_sheet(wb, ws, 'Depreciation');
}

function addCashFlowSheet(wb, results) {
  const { cashFlow, totalMonths } = results;
  const numYears = Math.ceil(totalMonths / 12);

  const header = ['Cash Flow Statement'];
  const periodRow = ['Period'];
  for (let y = 0; y < numYears; y++) {
    periodRow.push(`Y${y + 1}`);
  }
  periodRow.push('Total');

  const items = [
    { label: 'Operating Activities', key: null, section: true },
    { label: 'Net Profit', key: 'netProfit' },
    { label: 'Add: Depreciation', key: 'addBackDepreciation' },
    { label: 'WHT Paid', key: 'whtPaid' },
    { label: 'Operating Cash Flow', key: 'operatingCF', bold: true },
    { label: '', key: null },
    { label: 'Investing Activities', key: null, section: true },
    { label: 'Capital Expenditure', key: 'capitalExpenditure' },
    { label: 'Terminal Value', key: 'terminalValue' },
    { label: 'Investing Cash Flow', key: 'investingCF', bold: true },
    { label: '', key: null },
    { label: 'Financing Activities', key: null, section: true },
    { label: 'Equity Contribution', key: 'equityContribution' },
    { label: 'LT Loan Drawdown', key: 'ltLoanDrawdown' },
    { label: 'LT Loan Repayment', key: 'ltLoanRepayment' },
    { label: 'ST Loan (Net)', key: 'stLoanNet' },
    { label: 'Financing Cash Flow', key: 'financingCF', bold: true },
    { label: '', key: null },
    { label: 'Net Cash Change', key: 'netCashChange', bold: true },
    { label: 'Cumulative Cash', key: 'cumulativeCash', last: true, bold: true },
  ];

  const data = [header, periodRow];

  items.forEach(item => {
    if (item.key === null) {
      data.push(item.section ? [item.label] : []);
      return;
    }
    const row = [item.label];
    let total = 0;
    for (let y = 0; y < numYears; y++) {
      if (item.last) {
        const lastMonth = Math.min((y + 1) * 12, totalMonths) - 1;
        const val = cashFlow[lastMonth][item.key];
        row.push(val);
      } else {
        const slice = cashFlow.slice(y * 12, Math.min((y + 1) * 12, totalMonths));
        const val = slice.reduce((s, c) => s + (c[item.key] || 0), 0);
        row.push(val);
        total += val;
      }
    }
    if (!item.last) row.push(total);
    data.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 25 }, ...Array(numYears + 1).fill({ wch: 16 })];
  XLSX.utils.book_append_sheet(wb, ws, 'Cash Flow');
}

function addDCFSheet(wb, results) {
  const { dcf, totalMonths } = results;
  const numYears = Math.ceil(totalMonths / 12);

  const header = ['DCF Analysis'];
  const periodRow = ['Period'];
  for (let y = 0; y < numYears; y++) {
    periodRow.push(`Y${y + 1}`);
  }

  const items = [
    { label: 'Free Cash Flow', key: 'freeCashFlow', sum: true },
    { label: 'Discounted Cash Flow', key: 'discountedCF', sum: true },
    { label: 'Cumulative NPV', key: 'cumulativeNPV', last: true },
    { label: 'Cumulative (Undiscounted)', key: 'cumulativeUndiscounted', last: true },
  ];

  const data = [header, periodRow];

  items.forEach(item => {
    const row = [item.label];
    for (let y = 0; y < numYears; y++) {
      if (item.last) {
        const lastMonth = Math.min((y + 1) * 12, totalMonths) - 1;
        row.push(dcf.monthly[lastMonth][item.key]);
      } else {
        const slice = dcf.monthly.slice(y * 12, Math.min((y + 1) * 12, totalMonths));
        row.push(slice.reduce((s, d) => s + (d[item.key] || 0), 0));
      }
    }
    data.push(row);
  });

  // Add summary rows
  data.push([]);
  data.push(['NPV', dcf.npv]);
  data.push(['IRR', dcf.irr === null ? 'N/A' : dcf.irr]);
  data.push(['Payback Period (months)', dcf.paybackPeriodMonths || 'N/A']);
  data.push(['Discounted Payback (months)', dcf.discountedPaybackMonths || 'N/A']);

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 30 }, ...Array(numYears).fill({ wch: 16 })];
  XLSX.utils.book_append_sheet(wb, ws, 'DCF');
}

function addBalanceSheetSheet(wb, results) {
  const { balanceSheet, totalMonths } = results;
  const numYears = Math.ceil(totalMonths / 12);

  const header = ['Balance Sheet'];
  const periodRow = ['Period'];
  for (let y = 0; y < numYears; y++) {
    periodRow.push(`Y${y + 1} End`);
  }

  // All balance sheet items are point-in-time (last month of year)
  const items = [
    { label: 'Assets', key: null, section: true },
    { label: 'Cash & Equivalents', key: 'cash' },
    { label: 'Gross Fixed Assets', key: 'grossFixedAssets' },
    { label: 'Accumulated Depreciation', key: 'accumulatedDepreciation' },
    { label: 'Net Fixed Assets', key: 'netFixedAssets' },
    { label: 'Total Assets', key: 'totalAssets', bold: true },
    { label: '', key: null },
    { label: 'Liabilities', key: null, section: true },
    { label: 'Short-Term Debt', key: 'stDebt' },
    { label: 'Long-Term Debt', key: 'ltDebt' },
    { label: 'Total Liabilities', key: 'totalLiabilities', bold: true },
    { label: '', key: null },
    { label: 'Equity', key: null, section: true },
    { label: 'Paid-in Capital', key: 'paidInCapital' },
    { label: 'Retained Earnings', key: 'retainedEarnings' },
    { label: 'Total Equity', key: 'totalEquity', bold: true },
  ];

  const data = [header, periodRow];

  items.forEach(item => {
    if (item.key === null) {
      data.push(item.section ? [item.label] : []);
      return;
    }
    const row = [item.label];
    for (let y = 0; y < numYears; y++) {
      const lastMonth = Math.min((y + 1) * 12, totalMonths) - 1;
      row.push(balanceSheet[lastMonth][item.key]);
    }
    data.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 25 }, ...Array(numYears).fill({ wch: 16 })];
  XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet');
}

// ── Formatting helpers ──
function formatCurrencyCells(ws, cellRefs) {
  cellRefs.forEach(ref => {
    const cell = ws[ref];
    if (cell && typeof cell.v === 'number') {
      cell.z = '#,##0';
    }
  });
}

function formatPercentCells(ws, cellRefs) {
  cellRefs.forEach(ref => {
    const cell = ws[ref];
    if (cell && typeof cell.v === 'number') {
      cell.z = '0.00%';
    }
  });
}
