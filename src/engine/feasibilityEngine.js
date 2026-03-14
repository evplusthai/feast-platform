import { calcTotalInvestment } from './assumptions.js';
import { calculateMonthlyRevenue } from './revenueCalc.js';
import { calculateMonthlyCosts } from './costCalc.js';
import { calculateDepreciation } from './depreciationCalc.js';
import { calculateDebtSchedule } from './debtCalc.js';
import { calculatePnL } from './pnlCalc.js';
import { calculateCashFlow } from './cashFlowCalc.js';
import { calculateBalanceSheet } from './balanceSheet.js';
import { calculateDCF } from './dcfCalc.js';

/**
 * Run the complete feasibility study calculation
 * @param {Object} assumptions - The full assumptions object
 * @returns {Object} Complete results with all financial statements
 */
export function runFeasibilityStudy(assumptions) {
  const a = assumptions;
  const totalMonths = Math.max(1, a.contractPeriodYears * 12 + a.contractPeriodMonths);

  if (totalMonths > 180) {
    throw new Error('Maximum projection period is 180 months (15 years)');
  }

  // 1. Revenue
  const revenue = calculateMonthlyRevenue(a, totalMonths);

  // 2. Operating Costs
  const costs = calculateMonthlyCosts(a, totalMonths);

  // 3. Depreciation
  const depreciation = calculateDepreciation(a, totalMonths);

  // 4. Debt Schedule (initial pass without ST revolving)
  const debtSchedule = calculateDebtSchedule(a, totalMonths);

  // 5. P&L
  const pnl = calculatePnL(revenue, costs, depreciation, debtSchedule, a, totalMonths);

  // 6. Cash Flow
  const cashFlow = calculateCashFlow(pnl, depreciation, debtSchedule, a, totalMonths);

  // 7. Balance Sheet
  const balanceSheet = calculateBalanceSheet(a, pnl, depreciation, debtSchedule, cashFlow, totalMonths);

  // 8. DCF Analysis
  const dcf = calculateDCF(cashFlow, a, totalMonths);

  // 9. Build summary KPIs
  const totalInvestment = calcTotalInvestment(a);
  const equityRequired = totalInvestment * (a.equityPercent / 100);
  const debtRequired = totalInvestment - equityRequired;

  const totalContractRevenue = revenue.reduce((s, r) => s + r.totalRevenue, 0);
  const totalContractProfit = pnl.reduce((s, p) => s + p.netProfit, 0);
  const totalContractCosts = costs.reduce((s, c) => s + c.totalCosts, 0);

  const yearsCount = totalMonths / 12;
  const avgAnnualRevenue = totalContractRevenue / yearsCount;
  const avgAnnualProfit = totalContractProfit / yearsCount;

  // Year 1 metrics
  const year1Months = Math.min(12, totalMonths);
  const year1Revenue = revenue.slice(0, year1Months).reduce((s, r) => s + r.totalRevenue, 0);
  const year1Costs = costs.slice(0, year1Months).reduce((s, c) => s + c.totalCosts, 0);
  const year1EBITDA = year1Revenue - year1Costs;
  const year1NetProfit = pnl.slice(0, year1Months).reduce((s, p) => s + p.netProfit, 0);
  const year1Margin = year1Revenue > 0 ? year1NetProfit / year1Revenue : 0;

  // Payback
  const paybackYears = dcf.paybackPeriodMonths ? Math.floor(dcf.paybackPeriodMonths / 12) : null;
  const paybackRemainingMonths = dcf.paybackPeriodMonths ? dcf.paybackPeriodMonths % 12 : null;

  // Cost percentage
  const costToRevenueRatio = totalContractRevenue > 0 ? totalContractCosts / totalContractRevenue : 0;

  const summary = {
    totalInvestment,
    equityRequired,
    debtRequired,
    totalContractRevenue,
    totalContractProfit,
    totalContractCosts,
    avgAnnualRevenue,
    avgAnnualProfit,
    npv: dcf.npv,
    irr: dcf.irr,
    paybackPeriodMonths: dcf.paybackPeriodMonths,
    paybackYears,
    paybackRemainingMonths,
    year1Revenue,
    year1EBITDA,
    year1NetProfit,
    year1Margin,
    costToRevenueRatio,
    netProfitPercent: totalContractRevenue > 0 ? totalContractProfit / totalContractRevenue : 0,
  };

  return {
    assumptions: a,
    totalMonths,
    revenue,
    costs,
    depreciation,
    debtSchedule,
    pnl,
    balanceSheet,
    cashFlow,
    dcf,
    summary,
  };
}
