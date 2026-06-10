import type { AppData } from "../types";

export const seedData: AppData = {
  settings: {
    salary: 3900,
    extraIncome: 350,
    savingsGoal: 500,
    dailyFoodCut: 4,
    currency: "BRL",
    theme: "dark",
  },
  moto: {
    model: "Yamaha Fazer FZ25",
    year: 2023,
    averageKmL: 31,
    tankLiters: 14,
    fuelPrice: 5.79,
    odometer: 28440,
    nextOilChangeKm: 29160,
  },
  budgets: [
    { id: "budget-moradia", category: "Moradia", limit: 1400, spent: 980, color: "#7C3AED" },
    { id: "budget-mercado", category: "Mercado", limit: 800, spent: 580, color: "#3B82F6" },
    { id: "budget-alimentacao", category: "Alimentacao", limit: 910, spent: 760, color: "#EF4444" },
    { id: "budget-moto", category: "Moto", limit: 738, spent: 458, color: "#22C55E" },
    { id: "budget-lazer", category: "Lazer", limit: 300, spent: 210, color: "#F59E0B" },
    { id: "budget-saude", category: "Saude", limit: 300, spent: 140, color: "#14B8A6" },
    { id: "budget-estudos", category: "Estudos", limit: 180, spent: 70, color: "#A855F7" },
    { id: "budget-assinaturas", category: "Assinaturas", limit: 180, spent: 138, color: "#94A3B8" },
  ],
  bills: [
    { id: "bill-luz", name: "Luz", amount: 120, dueDay: 12, status: "Proximo", category: "Energia" },
    { id: "bill-internet", name: "Internet", amount: 99, dueDay: 15, status: "Pago", category: "Internet" },
    { id: "bill-condominio", name: "Condominio", amount: 350, dueDay: 18, status: "Proximo", category: "Moradia" },
    { id: "bill-seguro", name: "Seguro da moto", amount: 120, dueDay: 7, status: "Atrasado", category: "Moto" },
  ],
  transactions: [
    { id: "tx-salario", description: "Salario", category: "Receita", amount: 3900, type: "income", occurredAt: "2026-06-01" },
    { id: "tx-extra", description: "Renda extra", category: "Receita", amount: 350, type: "income", occurredAt: "2026-06-06" },
    { id: "tx-posto", description: "Posto Shell", category: "Moto", amount: 95, type: "expense", occurredAt: "2026-06-09" },
    { id: "tx-mercado", description: "Mercado Dia", category: "Mercado", amount: 184.2, type: "expense", occurredAt: "2026-06-08" },
    { id: "tx-cinema", description: "Cinema", category: "Lazer", amount: 54, type: "expense", occurredAt: "2026-06-07" },
  ],
  goals: [
    { id: "goal-capacete", name: "Capacete novo", currentAmount: 480, targetAmount: 1000, deadline: "2026-11-10" },
    { id: "goal-jaqueta", name: "Jaqueta", currentAmount: 270, targetAmount: 1000, deadline: "2027-02-10" },
    { id: "goal-reserva", name: "Reserva de emergencia", currentAmount: 1830, targetAmount: 3000, deadline: "2026-10-10" },
    { id: "goal-foz", name: "Viagem para Foz", currentAmount: 920, targetAmount: 2400, deadline: "2027-01-10" },
  ],
  fuelLogs: [
    { id: "fuel-1", filledAt: "2026-06-09", station: "Shell Centro", liters: 12.4, amount: 71.8, odometer: 28440 },
    { id: "fuel-2", filledAt: "2026-06-01", station: "Ipiranga Norte", liters: 10.8, amount: 62.5, odometer: 28108 },
    { id: "fuel-3", filledAt: "2026-05-23", station: "BR Via Sul", liters: 11.1, amount: 65.3, odometer: 27762 },
  ],
  rides: [
    { id: "ride-morretes", destination: "Morretes", rideDate: "2026-06-08", distanceKm: 178, cost: 34, city: "Morretes" },
    { id: "ride-lapa", destination: "Lapa", rideDate: "2026-05-25", distanceKm: 132, cost: 25, city: "Lapa" },
    { id: "ride-antonina", destination: "Antonina", rideDate: "2026-05-12", distanceKm: 205, cost: 39, city: "Antonina" },
  ],
  calendarEvents: [
    { id: "event-seguro", title: "Seguro da moto", eventDate: "2026-06-07", eventType: "Conta", color: "#EF4444" },
    { id: "event-luz", title: "Luz", eventDate: "2026-06-12", eventType: "Conta", color: "#F59E0B" },
    { id: "event-internet", title: "Internet", eventDate: "2026-06-15", eventType: "Conta", color: "#3B82F6" },
    { id: "event-condominio", title: "Condominio", eventDate: "2026-06-18", eventType: "Conta", color: "#7C3AED" },
    { id: "event-oleo", title: "Troca de oleo", eventDate: "2026-06-24", eventType: "Moto", color: "#22C55E" },
  ],
  achievements: [
    { id: "ach-km", title: "1000 km rodados", description: "Voce registrou mais de 1000 km.", completed: true },
    { id: "ach-meta", title: "Primeira meta", description: "Uma meta financeira foi iniciada.", completed: true },
    { id: "ach-orcamento", title: "30 dias no orcamento", description: "Fechar um mes sem ultrapassar o orcamento.", completed: false },
    { id: "ach-reserva", title: "Reserva criada", description: "Criar e manter uma reserva de emergencia.", completed: false },
  ],
};
