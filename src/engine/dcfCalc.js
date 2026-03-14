import { solveIRR } from './irrSolver.js';

/**
 * Calculate DCF analysis: NPV, IRR, payback period
 */
export function calculateDCF(cashFlow, a, totalMonths) {
  const monthlyWacc = a.wacc / 12;
  const monthly = [];
  let cumulativeNPV = 0;
  let paybackPeriodMonths = null;
  let discountedPaybackMonths = null;
  let cumulativeUndiscounted = 0;

  // Build FCF array for IRR calculation
  const fcfArray = [];

  for (let m = 0; m < totalMonths; m++) {
    const cf = cashFlow[m];

    // Free Cash Flow = Operating CF + Investing CF (exclude financing)
    const freeCashFlow = cf.operatingCF + cf.investingCF;
    fcfArray.push(freeCashFlow);

    // Discount factor
    const discountFactor = 1 / Math.pow(1 + monthlyWacc, m + 1);
    const discountedCF = freeCashFlow * discountFactor;
    cumulativeNPV += discountedCF;
    cumulativeUndiscounted += freeCashFlow;

    // Payback period (undiscounted)
    if (paybackPeriodMonths === null && cumulativeUndiscounted >= 0 && m > 0) {
      paybackPeriodMonths = m + 1;
    }

    // Discounted payback
    if (discountedPaybackMonths === null && cumulativeNPV >= 0 && m > 0) {
      discountedPaybackMonths = m + 1;
    }

    monthly.push({
      month: m + 1,
      freeCashFlow,
      discountFactor,
      discountedCF,
      cumulativeNPV,
      cumulativeUndiscounted,
    });
  }

  // IRR calculation
  const irr = solveIRR(fcfArray);

  return {
    monthly,
    npv: cumulativeNPV,
    irr: isNaN(irr) ? null : irr,
    paybackPeriodMonths,
    discountedPaybackMonths,
  };
}
