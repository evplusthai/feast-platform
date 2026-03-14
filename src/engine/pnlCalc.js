/**
 * Assemble monthly P&L statement from component calculations
 */
export function calculatePnL(revenue, costs, depreciation, debtSchedule, a, totalMonths) {
  const results = [];

  for (let m = 0; m < totalMonths; m++) {
    const rev = revenue[m];
    const cost = costs[m];
    const dep = depreciation[m];
    const debt = debtSchedule[m];

    const totalRevenue = rev.totalRevenue;
    const totalCosts = cost.totalCosts;
    const ebitda = totalRevenue - totalCosts;
    const totalDepreciation = dep.totalDepreciation;
    const ebit = ebitda - totalDepreciation;
    const interestExpense = debt.ltInterest + debt.stInterest;
    const ebt = ebit - interestExpense;
    const incomeTax = Math.max(0, ebt * a.taxRate);
    const netProfit = ebt - incomeTax;
    const netProfitMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;

    results.push({
      month: m + 1,
      totalRevenue,
      serviceRevenue: rev.serviceRevenue,
      chargerRental: rev.chargerRental,
      otherIncome: rev.otherIncome,
      fuelCost: cost.fuelCost,
      driverCost: cost.driverCost,
      monitorCost: cost.monitorCost,
      tireCost: cost.tireCost,
      insuranceCost: cost.insuranceCost,
      expresswayCost: cost.expresswayCost,
      maintenanceCost: cost.maintenanceCost,
      chargerMaintenanceCost: cost.chargerMaintenanceCost,
      otherCosts: cost.otherCosts,
      totalCosts,
      ebitda,
      vehicleDepreciation: dep.vehicleDepreciation,
      chargerDepreciation: dep.chargerDepreciation,
      batteryDepreciation: dep.batteryDepreciation,
      totalDepreciation,
      ebit,
      interestExpense,
      ebt,
      incomeTax,
      netProfit,
      netProfitMargin,
    });
  }

  return results;
}
