import { calcTotalInvestment } from './assumptions.js';

/**
 * Calculate monthly debt schedule (LT loan + ST revolving)
 */
export function calculateDebtSchedule(a, totalMonths) {
  const totalInvestment = calcTotalInvestment(a);
  const debtPercent = (100 - a.equityPercent) / 100;
  const ltLoanTotal = totalInvestment * debtPercent;
  const ltTermMonths = a.ltLoanTermYears * 12;
  const ltMonthlyRate = a.ltLoanRate / 12;
  const ltPrincipalPayment = ltTermMonths > 0 ? ltLoanTotal / ltTermMonths : 0;

  const results = [];
  let ltBalance = ltLoanTotal;

  for (let m = 0; m < totalMonths; m++) {
    const ltDrawdown = m === 0 ? ltLoanTotal : 0;
    const ltInterest = ltBalance * ltMonthlyRate;
    const ltPrincipal = (m < ltTermMonths && ltBalance > 0)
      ? Math.min(ltPrincipalPayment, ltBalance)
      : 0;

    ltBalance = Math.max(0, ltBalance - ltPrincipal);

    results.push({
      month: m + 1,
      ltLoanBalance: ltBalance + ltPrincipal, // Balance before payment this month
      ltDrawdown,
      ltPrincipalPayment: ltPrincipal,
      ltInterest,
      stLoanBalance: 0,
      stDrawdown: 0,
      stRepayment: 0,
      stInterest: 0,
      totalDebtService: ltPrincipal + ltInterest,
      ltBalanceAfter: ltBalance,
    });
  }

  return results;
}

/**
 * Update ST revolving loan based on cash position
 * Called after initial cash flow calculation
 */
export function updateSTLoan(debtSchedule, cashPositions, a, totalMonths) {
  const stMonthlyRate = a.stLoanRate / 12;
  let stBalance = 0;

  for (let m = 0; m < totalMonths; m++) {
    const d = debtSchedule[m];
    const cashBefore = cashPositions[m];

    // Need ST loan if cash falls below minimum
    if (cashBefore < a.minCashBalance && a.stLoanRate > 0) {
      const shortfall = a.minCashBalance - cashBefore;
      d.stDrawdown = Math.max(0, shortfall);
      stBalance += d.stDrawdown;
    } else if (stBalance > 0 && cashBefore > a.minCashBalance * 1.5) {
      // Repay ST loan when flush with cash
      const excessCash = cashBefore - a.minCashBalance * 1.2;
      d.stRepayment = Math.min(stBalance, Math.max(0, excessCash));
      stBalance -= d.stRepayment;
    }

    d.stInterest = stBalance * stMonthlyRate;
    d.stLoanBalance = stBalance;
    d.totalDebtService = d.ltPrincipalPayment + d.ltInterest + d.stRepayment + d.stInterest;
  }

  return debtSchedule;
}
