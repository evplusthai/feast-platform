/**
 * Calculate monthly operating costs over the project lifetime
 */
export function calculateMonthlyCosts(a, totalMonths) {
  const results = [];

  for (let m = 0; m < totalMonths; m++) {
    const year = Math.floor(m / 12);
    const inflationFactor = Math.pow(1 + a.inflationRate, year);

    // 1. Fuel / Energy
    let totalTripsPerMonth = 0;
    a.tripTypes.forEach(trip => {
      if (trip.enabled) {
        totalTripsPerMonth += trip.tripsPerDay * trip.workingDaysPerMonth;
      }
    });
    const distancePerTrip = a.fuel.distancePerTrip * (1 + a.fuel.wastePercent / 100);
    const totalDistancePerVehicle = distancePerTrip * totalTripsPerMonth;
    const fuelCostPerVehicle = totalDistancePerVehicle * a.fuel.consumptionRate * a.fuel.fuelPrice * inflationFactor;
    const fuelCost = fuelCostPerVehicle * a.vehicleCount;

    // 2. Labor
    const driverCost = a.labor.driverSalary * a.labor.driverCount * inflationFactor;
    const monitorCost = a.labor.monitorSalary * a.labor.monitorCount * inflationFactor;

    // 3. Tire replacement (spread evenly)
    const totalMonthlyKm = totalDistancePerVehicle * a.vehicleCount;
    const tireCost = a.tires.replacementKm > 0
      ? (totalMonthlyKm * a.tires.tiresPerVehicle * a.tires.pricePerUnit) / a.tires.replacementKm
      : 0;

    // 4. Insurance
    const annualIncreaseFactor = Math.pow(1 + a.insurance.annualIncrease / 100, year);
    const accidentFactor = 1 + (a.insurance.accidentAdjustment / 100) * (year > 0 ? 1 : 0);
    const vehicleInsurance = (a.insurance.vehicleInsuranceYear1 * a.vehicleCount * annualIncreaseFactor * accidentFactor) / 12;
    const cargoInsurance = (a.insurance.cargoInsurance * a.vehicleCount) / 12;
    const insuranceCost = vehicleInsurance + cargoInsurance;

    // 5. Expressway
    const expresswayCost = a.expressway.tollPerTrip * totalTripsPerMonth * a.vehicleCount;

    // 6. Maintenance
    const maintEscalation = Math.pow(1 + a.maintenance.escalationRate / 100, year);
    const maintenanceCost = a.maintenance.costPerKm * totalMonthlyKm * maintEscalation;

    // 7. EV Charger maintenance
    const chargerEscalation = Math.pow(1 + a.chargerMaintenance.escalationRate / 100, year);
    const chargerMaintenanceCost = (a.chargerMaintenance.annualCost * a.evChargerCount * chargerEscalation) / 12;

    // 8. Other costs
    const otherCosts = a.otherCosts.monthlyPerVehicle * a.vehicleCount * inflationFactor;

    const totalCosts = fuelCost + driverCost + monitorCost + tireCost + insuranceCost +
                       expresswayCost + maintenanceCost + chargerMaintenanceCost + otherCosts;

    results.push({
      month: m + 1,
      fuelCost,
      driverCost,
      monitorCost,
      tireCost,
      insuranceCost,
      expresswayCost,
      maintenanceCost,
      chargerMaintenanceCost,
      otherCosts,
      totalCosts,
    });
  }

  return results;
}
