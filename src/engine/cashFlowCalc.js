import { calcTotalInvestment } from './assumptions.js';

/**
 * Calculate monthly cash flow statement
 */
export function calculateCashFlow(pnl, depreciation, debtSchedule, a, totalMonths) {
  const results = [];
  const totalInvestment = calcTotalInvestment(a);
  const equityContributionTotal = totalInvestment * (a.equityPercent / 100);
  const batteryReplacementCost = a.batteryCapacityKWh * a.batteryPricePerKWh * a.vehicleCount;
  const batteryReplacementMonth = a.batteryReplacementYear * 12;
  const terminalValue = (a.vehicleUnitPrice + a.vehicleModificationCost) * a.vehicleCount * (a.buyBackPercent / 100);

  let cumulativeCash = 0;

  for (let m = 0; m < totalMonths; m++) {
    const pl = pnl[m];
    const dep = depreciation[m];
    const debt = debtSchedule[m];

    // Operating Activities
    const netProfit = pl.netProfit;
    const addBackDepreciation = dep.totalDepreciation;
    const whtPaid = -(pl.totalRevenue * a.whtRate);
    const operatingCF = netProfit + addBackDepreciation + whtPaid;

    // Investing Activities
    let capitalExpenditure = 0;
    if (m === 0) {
      capitalExpenditure = -totalInvestment;
    }
    if (m === batteryReplacementMonth && batteryReplacementCost > 0) {
      capitalExpenditure += -batteryReplacementCost;
    }

    let termValue = 0;
    if (m === totalMonths - 1 && terminalValue > 0) {
      termValue = terminalValue;
    }
    const investingCF = capitalExpenditure + termValue;

    // Financing Activities
    const equityContribution = m === 0 ? equityContributionTotal : 0;
    const ltLoanDrawdown = debt.ltDrawdown;
    const ltLoanRepayment = -debt.ltPrincipalPayment;
    const stLoanNet = debt.stDrawdown - debt.stRepayment;
    const financingCF = equityContribution + ltLoanDrawdown + ltLoanRepayment + stLoanNet;

    const netCashChange = operatingCF + investingCF + financingCF;
    cumulativeCash += netCashChange;

    results.push({
      month: m + 1,
      netProfit,
      addBackDepreciation,
      whtPaid,
      operatingCF,
      capitalExpenditure,
      terminalValue: termValue,
      investingCF,
      equityContribution,
      ltLoanDrawdown,
      ltLoanRepayment,
      stLoanNet,
      financingCF,
      netCashChange,
      cumulativeCash,
    });
  }

  return results;
}
