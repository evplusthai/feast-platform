import { DEFAULTS } from '../data/defaults.js';

export function getDefaultAssumptions() {
  return {
    // ── Project Info ──
    projectName: '',
    clientName: '',
    scenarioName: 'Base Case',
    serviceRoute: '',
    projectScope: '',
    contractPeriodYears: 1,
    contractPeriodMonths: 0,
    startDate: new Date().toISOString().split('T')[0],
    vehicleCount: 15,

    // ── Investment ──
    vehicleTypeId: 'toyota_commuter',
    vehicleUnitPrice: 1300000,
    vehicleModificationCost: 0,
    buyBackPercent: 0,
    depreciationYearsVehicle: 0,

    evChargerCount: 0,
    evChargerUnitPrice: 0,
    evChargerInstallCost: 0,
    depreciationYearsCharger: 0,

    infrastructure: {
      office: 0,
      housing: 0,
      serviceVehicles: 0,
      tools: 0,
      logistics: 0,
      cctv: 0,
      parking: 0,
      other: 0,
    },

    batteryReplacementYear: 7,
    batteryCapacityKWh: 0,
    batteryPricePerKWh: 5000,

    // ── Revenue ──
    tripTypes: [
      {
        name: 'normal',
        enabled: true,
        basePrice: 3835,
        markup: 0.0,
        tripsPerDay: 1,
        workingDaysPerMonth: 15.08,
      },
      {
        name: 'field',
        enabled: false,
        basePrice: 2500,
        markup: 0.0,
        tripsPerDay: 1,
        workingDaysPerMonth: 4,
      },
      {
        name: 'staffShuttle',
        enabled: false,
        basePrice: 600,
        markup: 0.0,
        tripsPerDay: 1,
        workingDaysPerMonth: 22,
      },
      {
        name: 'busRent',
        enabled: false,
        basePrice: 2800,
        markup: 0.0,
        tripsPerDay: 1,
        workingDaysPerMonth: 2,
      },
    ],

    vatRate: DEFAULTS.vatRate,
    whtRate: DEFAULTS.whtRate,
    evChargerRentalIncome: 0,
    otherIncome: 0,

    // ── Operating Costs ──
    fuel: {
      distancePerTrip: 100,
      consumptionRate: 0.1429,  // L/km (or kWh/km for EV)
      fuelPrice: 32,            // THB/L or THB/kWh
      wastePercent: 0,
    },

    labor: {
      driverSalary: 15942,
      driverCount: 15,
      monitorSalary: 14293,
      monitorCount: 15,
      supervisorSalary: 16924,
      supervisorSharePercent: 6.67,
    },

    tires: {
      pricePerUnit: 4500,
      tiresPerVehicle: 4,
      replacementKm: 50000,
    },

    insurance: {
      vehicleInsuranceYear1: 9827,
      annualIncrease: 0,
      cargoInsurance: 0,
      accidentAdjustment: 0,
      noClaimDiscount: 0.10,
    },

    expressway: {
      tollPerTrip: 0,
    },

    maintenance: {
      costPerKm: 0.62,
      escalationRate: 0,
    },

    chargerMaintenance: {
      annualCost: 0,
      escalationRate: 0,
    },

    otherCosts: {
      monthlyPerVehicle: 1014,
    },

    // ── Financing ──
    equityPercent: 0,
    ltLoanRate: 0,
    ltLoanTermYears: 5,
    stLoanRate: 0,
    minCashBalance: DEFAULTS.minCashBalance,
    salvageValuePercent: 0,
    wacc: DEFAULTS.wacc,
    inflationRate: DEFAULTS.inflationRate,
    taxRate: DEFAULTS.corporateTaxRate,
  };
}

/**
 * Calculate total investment from assumptions
 */
export function calcTotalInvestment(a) {
  const vehicleTotal = (a.vehicleUnitPrice + a.vehicleModificationCost) * a.vehicleCount;
  const chargerTotal = (a.evChargerUnitPrice * a.evChargerCount) + a.evChargerInstallCost;
  const infraTotal = Object.values(a.infrastructure).reduce((s, v) => s + (v || 0), 0);
  return vehicleTotal + chargerTotal + infraTotal;
}

/**
 * Deep clone assumptions
 */
export function cloneAssumptions(a) {
  return JSON.parse(JSON.stringify(a));
}
