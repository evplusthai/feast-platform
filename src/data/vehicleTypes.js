export const VEHICLE_TYPES = [
  {
    id: 'toyota_commuter',
    label: 'Toyota Commuter',
    labelTh: 'Toyota Commuter',
    defaultPrice: 1300000,
    seats: 15,
    type: 'diesel',
    fuelConsumption: 7,  // km/L
  },
  {
    id: 'toyota_hiace',
    label: 'Toyota Hiace',
    labelTh: 'Toyota Hiace',
    defaultPrice: 1500000,
    seats: 15,
    type: 'diesel',
    fuelConsumption: 8,
  },
  {
    id: 'hino_bus_40',
    label: 'Hino Bus 40-seat',
    labelTh: 'รถบัส Hino 40 ที่นั่ง',
    defaultPrice: 3500000,
    seats: 40,
    type: 'diesel',
    fuelConsumption: 4,
  },
  {
    id: 'ev_bus_mini',
    label: 'EV Mini Bus',
    labelTh: 'รถ EV มินิบัส',
    defaultPrice: 2800000,
    seats: 20,
    type: 'ev',
    batteryKWh: 100,
    consumptionRate: 0.8, // kWh/km
  },
  {
    id: 'ev_bus_40',
    label: 'EV Bus 40-seat',
    labelTh: 'รถ EV บัส 40 ที่นั่ง',
    defaultPrice: 4500000,
    seats: 40,
    type: 'ev',
    batteryKWh: 250,
    consumptionRate: 1.2,
  },
  {
    id: 'ev_truck_light',
    label: 'EV Light Truck',
    labelTh: 'รถ EV บรรทุกเบา',
    defaultPrice: 2200000,
    seats: 3,
    type: 'ev',
    batteryKWh: 114.5,
    consumptionRate: 0.7,
  },
  {
    id: 'custom',
    label: 'Custom Vehicle',
    labelTh: 'กำหนดเอง',
    defaultPrice: 0,
    seats: 0,
    type: 'diesel',
    fuelConsumption: 5,
  },
];

export function getVehicleById(id) {
  return VEHICLE_TYPES.find(v => v.id === id) || VEHICLE_TYPES[VEHICLE_TYPES.length - 1];
}

// ── Cost defaults per vehicle type ──
// Keyed by vehicle id. Custom vehicle is omitted (user fills manually).
export const VEHICLE_COST_DEFAULTS = {
  toyota_commuter: {
    fuel: { distancePerTrip: 100, consumptionRate: 0.1429, fuelPrice: 32, wastePercent: 0 },
    labor: { driverSalary: 15942, monitorSalary: 14293, supervisorSalary: 16924, supervisorSharePercent: 6.67 },
    tires: { pricePerUnit: 4500, tiresPerVehicle: 4, replacementKm: 50000 },
    insurance: { vehicleInsuranceYear1: 9827, annualIncrease: 0, cargoInsurance: 0, accidentAdjustment: 0, noClaimDiscount: 0.10 },
    expressway: { tollPerTrip: 0 },
    maintenance: { costPerKm: 0.62, escalationRate: 0 },
    chargerMaintenance: { annualCost: 0, escalationRate: 0 },
    otherCosts: { monthlyPerVehicle: 1014 },
  },
  toyota_hiace: {
    fuel: { distancePerTrip: 100, consumptionRate: 0.125, fuelPrice: 32, wastePercent: 0 },
    labor: { driverSalary: 15942, monitorSalary: 14293, supervisorSalary: 16924, supervisorSharePercent: 6.67 },
    tires: { pricePerUnit: 5000, tiresPerVehicle: 4, replacementKm: 50000 },
    insurance: { vehicleInsuranceYear1: 12000, annualIncrease: 0, cargoInsurance: 0, accidentAdjustment: 0, noClaimDiscount: 0.10 },
    expressway: { tollPerTrip: 0 },
    maintenance: { costPerKm: 0.70, escalationRate: 0 },
    chargerMaintenance: { annualCost: 0, escalationRate: 0 },
    otherCosts: { monthlyPerVehicle: 1200 },
  },
  hino_bus_40: {
    fuel: { distancePerTrip: 120, consumptionRate: 0.25, fuelPrice: 32, wastePercent: 0 },
    labor: { driverSalary: 17000, monitorSalary: 14293, supervisorSalary: 18000, supervisorSharePercent: 6.67 },
    tires: { pricePerUnit: 8500, tiresPerVehicle: 6, replacementKm: 60000 },
    insurance: { vehicleInsuranceYear1: 25000, annualIncrease: 0, cargoInsurance: 0, accidentAdjustment: 0, noClaimDiscount: 0.10 },
    expressway: { tollPerTrip: 0 },
    maintenance: { costPerKm: 1.20, escalationRate: 0 },
    chargerMaintenance: { annualCost: 0, escalationRate: 0 },
    otherCosts: { monthlyPerVehicle: 2500 },
  },
  ev_bus_mini: {
    fuel: { distancePerTrip: 80, consumptionRate: 0.8, fuelPrice: 6, wastePercent: 0 },
    labor: { driverSalary: 16500, monitorSalary: 14293, supervisorSalary: 17500, supervisorSharePercent: 6.67 },
    tires: { pricePerUnit: 5500, tiresPerVehicle: 4, replacementKm: 55000 },
    insurance: { vehicleInsuranceYear1: 18000, annualIncrease: 0, cargoInsurance: 0, accidentAdjustment: 0, noClaimDiscount: 0.10 },
    expressway: { tollPerTrip: 0 },
    maintenance: { costPerKm: 0.35, escalationRate: 0 },
    chargerMaintenance: { annualCost: 15000, escalationRate: 2 },
    otherCosts: { monthlyPerVehicle: 1200 },
  },
  ev_bus_40: {
    fuel: { distancePerTrip: 100, consumptionRate: 1.2, fuelPrice: 6, wastePercent: 0 },
    labor: { driverSalary: 17000, monitorSalary: 14293, supervisorSalary: 18000, supervisorSharePercent: 6.67 },
    tires: { pricePerUnit: 9000, tiresPerVehicle: 6, replacementKm: 55000 },
    insurance: { vehicleInsuranceYear1: 30000, annualIncrease: 0, cargoInsurance: 0, accidentAdjustment: 0, noClaimDiscount: 0.10 },
    expressway: { tollPerTrip: 0 },
    maintenance: { costPerKm: 0.50, escalationRate: 0 },
    chargerMaintenance: { annualCost: 25000, escalationRate: 2 },
    otherCosts: { monthlyPerVehicle: 2000 },
  },
  ev_truck_light: {
    fuel: { distancePerTrip: 80, consumptionRate: 0.7, fuelPrice: 6, wastePercent: 0 },
    labor: { driverSalary: 15000, monitorSalary: 0, supervisorSalary: 16000, supervisorSharePercent: 6.67 },
    tires: { pricePerUnit: 5000, tiresPerVehicle: 4, replacementKm: 50000 },
    insurance: { vehicleInsuranceYear1: 15000, annualIncrease: 0, cargoInsurance: 5000, accidentAdjustment: 0, noClaimDiscount: 0.10 },
    expressway: { tollPerTrip: 0 },
    maintenance: { costPerKm: 0.30, escalationRate: 0 },
    chargerMaintenance: { annualCost: 12000, escalationRate: 2 },
    otherCosts: { monthlyPerVehicle: 1500 },
  },
};

export function getCostDefaultsForVehicle(id) {
  try {
    const stored = localStorage.getItem('feast_vehicle_costs');
    if (stored) {
      const overrides = JSON.parse(stored);
      if (overrides[id]) return overrides[id];
    }
  } catch (e) { /* ignore parse errors */ }
  return VEHICLE_COST_DEFAULTS[id] || null;
}
