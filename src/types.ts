export type BillStatus = "Pago" | "Proximo" | "Atrasado";
export type TransactionType = "income" | "expense";

export type Settings = {
  salary: number;
  extraIncome: number;
  savingsGoal: number;
  dailyFoodCut: number;
  currency: string;
  theme: "dark";
};

export type MotoProfile = {
  model: string;
  year: number;
  averageKmL: number;
  tankLiters: number;
  fuelPrice: number;
  odometer: number;
  nextOilChangeKm: number;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  color: string;
};

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  status: BillStatus;
  category: string;
};

export type Transaction = {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  occurredAt: string;
};

export type Goal = {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  deadline: string;
};

export type FuelLog = {
  id: string;
  filledAt: string;
  station: string;
  liters: number;
  amount: number;
  odometer: number;
};

export type Ride = {
  id: string;
  destination: string;
  rideDate: string;
  distanceKm: number;
  cost: number;
  city: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  eventDate: string;
  eventType: string;
  color: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

export type AppData = {
  settings: Settings;
  moto: MotoProfile;
  budgets: Budget[];
  bills: Bill[];
  transactions: Transaction[];
  goals: Goal[];
  fuelLogs: FuelLog[];
  rides: Ride[];
  calendarEvents: CalendarEvent[];
  achievements: Achievement[];
};
