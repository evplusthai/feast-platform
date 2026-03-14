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
