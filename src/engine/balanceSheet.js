import { calcTotalInvestment } from './assumptions.js';

/**
 * Calculate monthly balance sheet snapshots
 */
export function calculateBalanceSheet(a, pnl, depreciation, debtSchedule, cashFlow, totalMonths) {
  const results = [];
  const totalInvestment = calcTotalInvestment(a);
  const equityContribution = totalInvestment * (a.equityPercent / 100);
  const batteryReplacementCost = a.batteryCapacityKWh * a.batteryPricePerKWh * a.vehicleCount;
  const batteryReplacementMonth = a.batteryReplacementYear * 12;

  let retainedEarnings = 0;
  let grossFixedAssets = totalInvestment;

  for (let m = 0; m < totalMonths; m++) {
    const cf = cashFlow[m];
    const dep = depreciation[m];
    const debt = debtSchedule[m];
    const pl = pnl[m];

    // Add battery at replacement year
    if (m === batteryReplacementMonth && batteryReplacementCost > 0) {
      grossFixedAssets += batteryReplacementCost;
    }

    // Assets
    const cash = cf.cumulativeCash;
    const accumulatedDepreciation = dep.totalAccumulatedDep;
    const netFixedAssets = grossFixedAssets - accumulatedDepreciation;
    const totalAssets = cash + netFixedAssets;

    // Liabilities
    const stDebt = debt.stLoanBalance;
    const ltDebt = debt.ltBalanceAfter;
    const totalLiabilities = stDebt + ltDebt;

    // Equity
    retainedEarnings += pl.netProfit;
    const totalEquity = equityContribution + retainedEarnings;

    // Balance check
    const balanceCheck = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1;

    results.push({
      month: m + 1,
      cash,
      grossFixedAssets,
      accumulatedDepreciation,
      netFixedAssets,
      totalAssets,
      stDebt,
      ltDebt,
      totalLiabilities,
      paidInCapital: equityContribution,
      retainedEarnings,
      totalEquity,
      balanceCheck,
    });
  }

  return results;
}
