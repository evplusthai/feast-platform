/**
 * Solve for IRR using Newton-Raphson method, with bisection fallback
 * @param {number[]} cashFlows - Array of monthly cash flows
 * @param {number} guess - Initial annualized guess (default 10%)
 * @returns {number} Annualized IRR, or NaN if not solvable
 */
export function solveIRR(cashFlows, guess = 0.10, maxIterations = 1000, tolerance = 1e-7) {
  if (!cashFlows || cashFlows.length === 0) return NaN;

  // Check if all cash flows are same sign (no IRR exists)
  const hasPositive = cashFlows.some(cf => cf > 0);
  const hasNegative = cashFlows.some(cf => cf < 0);
  if (!hasPositive || !hasNegative) return NaN;

  // Newton-Raphson on monthly rate
  let rate = guess / 12;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      const factor = Math.pow(1 + rate, j);
      if (factor === 0 || !isFinite(factor)) break;
      npv += cashFlows[j] / factor;
      dnpv -= j * cashFlows[j] / (factor * (1 + rate));
    }

    if (Math.abs(npv) < tolerance) {
      // Converged - convert monthly rate to annual
      return Math.pow(1 + rate, 12) - 1;
    }

    if (Math.abs(dnpv) < 1e-14) break; // derivative too small

    const newRate = rate - npv / dnpv;
    if (!isFinite(newRate) || newRate < -0.99) break;

    rate = newRate;
  }

  // Bisection fallback
  return bisectionIRR(cashFlows, -0.5, 5.0, maxIterations, tolerance);
}

function bisectionIRR(cashFlows, lo, hi, maxIterations, tolerance) {
  const npvAt = (annualRate) => {
    const monthlyRate = annualRate / 12;
    let npv = 0;
    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + monthlyRate, j);
    }
    return npv;
  };

  let fLo = npvAt(lo);
  let fHi = npvAt(hi);

  if (fLo * fHi > 0) return NaN; // no sign change

  for (let i = 0; i < maxIterations; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npvAt(mid);

    if (Math.abs(fMid) < tolerance || (hi - lo) / 2 < tolerance) {
      return mid;
    }

    if (fMid * fLo < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }

  return (lo + hi) / 2;
}
