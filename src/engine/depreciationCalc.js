import { calcTotalInvestment } from './assumptions.js';

/**
 * Calculate monthly depreciation schedule
 */
export function calculateDepreciation(a, totalMonths) {
  const results = [];

  // Vehicle depreciation: straight-line
  const vehicleTotalCost = (a.vehicleUnitPrice + a.vehicleModificationCost) * a.vehicleCount;
  const vehicleSalvage = vehicleTotalCost * (a.salvageValuePercent / 100);
  const vehicleDepreciable = vehicleTotalCost - vehicleSalvage;
  const vehicleDepMonths = a.depreciationYearsVehicle > 0 ? a.depreciationYearsVehicle * 12 : 0;
  const vehicleMonthlyDep = vehicleDepMonths > 0 ? vehicleDepreciable / vehicleDepMonths : 0;

  // Charger depreciation: straight-line
  const chargerTotalCost = (a.evChargerUnitPrice * a.evChargerCount) + a.evChargerInstallCost;
  const chargerSalvage = chargerTotalCost * (a.salvageValuePercent / 100);
  const chargerDepreciable = chargerTotalCost - chargerSalvage;
  const chargerDepMonths = a.depreciationYearsCharger > 0 ? a.depreciationYearsCharger * 12 : 0;
  const chargerMonthlyDep = chargerDepMonths > 0 ? chargerDepreciable / chargerDepMonths : 0;

  // Battery depreciation: starts at battery replacement year
  const batteryTotalCost = a.batteryCapacityKWh * a.batteryPricePerKWh * a.vehicleCount;
  const batteryStartMonth = a.batteryReplacementYear * 12;
  const batteryDepMonths = totalMonths > batteryStartMonth ? totalMonths - batteryStartMonth : 0;
  const batteryMonthlyDep = batteryDepMonths > 0 && batteryTotalCost > 0 ? batteryTotalCost / batteryDepMonths : 0;

  let vehicleAccum = 0;
  let chargerAccum = 0;
  let batteryAccum = 0;

  for (let m = 0; m < totalMonths; m++) {
    const vDep = (m < vehicleDepMonths) ? vehicleMonthlyDep : 0;
    const cDep = (m < chargerDepMonths) ? chargerMonthlyDep : 0;
    const bDep = (m >= batteryStartMonth && batteryMonthlyDep > 0) ? batteryMonthlyDep : 0;

    vehicleAccum += vDep;
    chargerAccum += cDep;
    batteryAccum += bDep;

    results.push({
      month: m + 1,
      vehicleDepreciation: vDep,
      chargerDepreciation: cDep,
      batteryDepreciation: bDep,
      totalDepreciation: vDep + cDep + bDep,
      vehicleAccumulatedDep: vehicleAccum,
      chargerAccumulatedDep: chargerAccum,
      batteryAccumulatedDep: batteryAccum,
      totalAccumulatedDep: vehicleAccum + chargerAccum + batteryAccum,
    });
  }

  return results;
}
