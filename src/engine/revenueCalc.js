/**
 * Calculate monthly revenue over the project lifetime
 */
export function calculateMonthlyRevenue(a, totalMonths) {
  const results = [];

  for (let m = 0; m < totalMonths; m++) {
    const year = Math.floor(m / 12);
    const inflationFactor = Math.pow(1 + a.inflationRate, year);

    let serviceRevenue = 0;
    const tripRevenue = {};

    a.tripTypes.forEach(trip => {
      if (!trip.enabled) {
        tripRevenue[trip.name] = 0;
        return;
      }
      const price = trip.basePrice * (1 + trip.markup) * inflationFactor;
      const rev = price * trip.tripsPerDay * trip.workingDaysPerMonth * a.vehicleCount;
      tripRevenue[trip.name] = rev;
      serviceRevenue += rev;
    });

    const chargerRental = a.evChargerRentalIncome * inflationFactor;
    const otherIncome = a.otherIncome * inflationFactor;
    const totalRevenue = serviceRevenue + chargerRental + otherIncome;

    results.push({
      month: m + 1,
      serviceRevenue,
      chargerRental,
      otherIncome,
      totalRevenue,
      tripRevenue,
    });
  }

  return results;
}
