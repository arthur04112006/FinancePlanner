import {
  BadgeCheck,
  Banknote,
  Bike,
  CalendarDays,
  CarFront,
  Coffee,
  Fuel,
  GraduationCap,
  HeartPulse,
  Home,
  Lightbulb,
  PiggyBank,
  Pizza,
  ShieldCheck,
  ShoppingBasket,
  Target,
  Trophy,
  Utensils,
  Wrench,
} from "lucide-react";

export const month = {
  available: 487.5,
  income: 4250,
  expenses: 3552.5,
  saved: 210,
  projected: 712,
  dailyLimit: 18.4,
  daysLeft: 12,
  survivalDays: 12,
  budgetUsed: 78,
};

export const freedom = [
  { label: "km disponiveis", value: "1432", icon: Bike, tone: "violet" },
  { label: "tanques", value: "3", icon: Fuel, tone: "blue" },
  { label: "refeicoes fora", value: "24", icon: Utensils, tone: "green" },
  { label: "cafes", value: "60", icon: Coffee, tone: "yellow" },
];

export const quickCategories = [
  { name: "Combustivel", spent: 318, limit: 520, icon: Fuel },
  { name: "Manutencao", spent: 140, limit: 400, icon: Wrench },
  { name: "Alimentacao", spent: 760, limit: 910, icon: Pizza },
  { name: "Mercado", spent: 580, limit: 800, icon: ShoppingBasket },
];

export const bills = [
  { name: "Luz", value: 120, due: "12 Jun", status: "Proximo" },
  { name: "Internet", value: 99, due: "15 Jun", status: "Pago" },
  { name: "Condominio", value: 350, due: "18 Jun", status: "Proximo" },
  { name: "Seguro da moto", value: 120, due: "07 Jun", status: "Atrasado" },
];

export const moto = {
  model: "Yamaha Fazer FZ25",
  year: 2023,
  average: "31 km/l",
  tank: "14 L",
  fuelPrice: 5.79,
  currentRange: 465,
  monthKm: 1432,
  nextFuel: 320,
  nextMaintenance: 720,
  costPerKm: 0.19,
};

export const goals = [
  { name: "Capacete novo", current: 480, target: 1000, percent: 48, icon: ShieldCheck, months: 5 },
  { name: "Jaqueta", current: 270, target: 1000, percent: 27, icon: BadgeCheck, months: 8 },
  { name: "Reserva", current: 1830, target: 3000, percent: 61, icon: PiggyBank, months: 4 },
  { name: "Viagem para Foz", current: 920, target: 2400, percent: 38, icon: CarFront, months: 7 },
];

export const insights = [
  { title: "Combustivel controlado", text: "Voce gastou 12% menos combustivel este mes.", tone: "green" },
  { title: "Alimentacao em alerta", text: "Seu gasto com alimentacao aumentou 12%.", tone: "red" },
  { title: "Economia possivel", text: "Voce pode economizar mais R$ 180 este mes.", tone: "blue" },
  { title: "Meta antecipada", text: "Mantendo este ritmo, o capacete chega 2 meses antes.", tone: "violet" },
];

export const budgets = [
  { name: "Moradia", remaining: 420, used: 66, icon: Home },
  { name: "Mercado", remaining: 220, used: 73, icon: ShoppingBasket },
  { name: "Alimentacao", remaining: 150, used: 84, icon: Utensils },
  { name: "Moto", remaining: 280, used: 58, icon: Bike },
  { name: "Lazer", remaining: 90, used: 70, icon: Trophy },
  { name: "Saude", remaining: 160, used: 46, icon: HeartPulse },
  { name: "Estudos", remaining: 110, used: 38, icon: GraduationCap },
  { name: "Assinaturas", remaining: 42, used: 77, icon: Lightbulb },
];

export const categoryChart = [
  { name: "Moradia", value: 980, fill: "#7C3AED" },
  { name: "Mercado", value: 580, fill: "#3B82F6" },
  { name: "Alimentacao", value: 760, fill: "#EF4444" },
  { name: "Moto", value: 458, fill: "#22C55E" },
  { name: "Lazer", value: 210, fill: "#F59E0B" },
  { name: "Outros", value: 564.5, fill: "#94A3B8" },
];

export const transactions = [
  { name: "Posto Shell", category: "Moto", value: -95, icon: Fuel },
  { name: "Salario", category: "Receita", value: 3900, icon: Banknote },
  { name: "Mercado Dia", category: "Mercado", value: -184.2, icon: ShoppingBasket },
  { name: "Cinema", category: "Lazer", value: -54, icon: Trophy },
];

export const fuelHistory = [
  { date: "09 Jun", station: "Shell Centro", liters: 12.4, value: 71.8, km: 28440 },
  { date: "01 Jun", station: "Ipiranga Norte", liters: 10.8, value: 62.5, km: 28108 },
  { date: "23 Mai", station: "BR Via Sul", liters: 11.1, value: 65.3, km: 27762 },
];

export const rides = [
  { destination: "Morretes", date: "08 Jun", distance: 178, cost: 34 },
  { destination: "Lapa", date: "25 Mai", distance: 132, cost: 25 },
  { destination: "Antonina", date: "12 Mai", distance: 205, cost: 39 },
];

export const calendarEvents = [
  { day: 7, label: "Seguro", tone: "red" },
  { day: 12, label: "Luz", tone: "yellow" },
  { day: 15, label: "Internet", tone: "blue" },
  { day: 18, label: "Condominio", tone: "violet" },
  { day: 24, label: "Oleo", tone: "green" },
];

export const achievements = [
  { title: "1000 km rodados", icon: Bike, done: true },
  { title: "Primeira meta", icon: Target, done: true },
  { title: "30 dias no orcamento", icon: CalendarDays, done: false },
  { title: "Reserva criada", icon: PiggyBank, done: false },
];
