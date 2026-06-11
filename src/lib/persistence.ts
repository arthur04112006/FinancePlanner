import { seedData } from "../data/seed";
import { supabase } from "./supabase";
import type {
  Achievement,
  AppData,
  Bill,
  Budget,
  CalendarEvent,
  FuelLog,
  Goal,
  Ride,
  Transaction,
} from "../types";

const STORAGE_KEY = "motolife:data:v1";
const USER_ID = "demo";

export function loadLocalData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return seedData;

  try {
    return { ...seedData, ...JSON.parse(stored) } as AppData;
  } catch {
    return seedData;
  }
}

export function saveLocalData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetLocalData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return seedData;
}

export async function loadCloudData(): Promise<AppData> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const [
    settings,
    moto,
    budgets,
    bills,
    transactions,
    goals,
    fuelLogs,
    rides,
    calendarEvents,
    achievements,
  ] = await Promise.all([
    supabase.from("monthly_settings").select("*").eq("user_id", USER_ID).limit(1).maybeSingle(),
    supabase.from("moto_profile").select("*").eq("user_id", USER_ID).limit(1).maybeSingle(),
    supabase.from("budgets").select("*").eq("user_id", USER_ID).order("created_at"),
    supabase.from("bills").select("*").eq("user_id", USER_ID).order("due_day"),
    supabase.from("transactions").select("*").eq("user_id", USER_ID).order("occurred_at", { ascending: false }),
    supabase.from("goals").select("*").eq("user_id", USER_ID).order("created_at"),
    supabase.from("fuel_logs").select("*").eq("user_id", USER_ID).order("filled_at", { ascending: false }),
    supabase.from("rides").select("*").eq("user_id", USER_ID).order("ride_date", { ascending: false }),
    supabase.from("calendar_events").select("*").eq("user_id", USER_ID).order("event_date"),
    supabase.from("achievements").select("*").eq("user_id", USER_ID).order("created_at"),
  ]);

  const errors = [settings, moto, budgets, bills, transactions, goals, fuelLogs, rides, calendarEvents, achievements]
    .map((response) => response.error)
    .filter(Boolean);
  if (errors.length) throw new Error(errors[0]?.message);

  return {
    settings: settings.data
      ? {
          salary: Number(settings.data.salary),
          extraIncome: Number(settings.data.extra_income),
          savingsGoal: Number(settings.data.savings_goal),
          dailyFoodCut: Number(settings.data.daily_food_cut),
          currency: settings.data.currency,
          theme: "dark",
        }
      : seedData.settings,
    moto: moto.data
      ? {
          model: moto.data.model,
          year: Number(moto.data.year),
          averageKmL: Number(moto.data.average_km_l),
          tankLiters: Number(moto.data.tank_liters),
          fuelPrice: Number(moto.data.fuel_price),
          odometer: Number(moto.data.odometer),
          nextOilChangeKm: Number(moto.data.next_oil_change_km),
        }
      : seedData.moto,
    budgets: (budgets.data ?? []).map((item): Budget => ({
      id: item.id,
      category: item.category,
      limit: Number(item.budget_limit),
      spent: Number(item.spent),
      color: item.color,
    })),
    bills: (bills.data ?? []).map((item): Bill => ({
      id: item.id,
      name: item.name,
      amount: Number(item.amount),
      dueDay: Number(item.due_day),
      status: item.status,
      category: item.category,
    })),
    transactions: (transactions.data ?? []).map((item): Transaction => ({
      id: item.id,
      description: item.description,
      category: item.category,
      amount: Number(item.amount),
      type: item.type,
      occurredAt: item.occurred_at,
    })),
    goals: (goals.data ?? []).map((item): Goal => ({
      id: item.id,
      name: item.name,
      currentAmount: Number(item.current_amount),
      targetAmount: Number(item.target_amount),
      deadline: item.deadline ?? "",
    })),
    fuelLogs: (fuelLogs.data ?? []).map((item): FuelLog => ({
      id: item.id,
      filledAt: item.filled_at,
      station: item.station,
      liters: Number(item.liters),
      amount: Number(item.amount),
      odometer: Number(item.odometer),
    })),
    rides: (rides.data ?? []).map((item): Ride => ({
      id: item.id,
      destination: item.destination,
      rideDate: item.ride_date,
      distanceKm: Number(item.distance_km),
      cost: Number(item.cost),
      city: item.city,
    })),
    calendarEvents: (calendarEvents.data ?? []).map((item): CalendarEvent => ({
      id: item.id,
      title: item.title,
      eventDate: item.event_date,
      eventTime: item.event_time ?? undefined,
      eventType: item.event_type,
      color: item.color,
    })),
    achievements: (achievements.data ?? []).map((item): Achievement => ({
      id: item.id,
      title: item.title,
      description: item.description,
      completed: item.completed,
    })),
  };
}

export async function saveCloudData(data: AppData) {
  if (!supabase) throw new Error("Supabase nao configurado.");

  await clearCloudData();

  const responses = await Promise.all([
    supabase.from("monthly_settings").insert({
      user_id: USER_ID,
      salary: data.settings.salary,
      extra_income: data.settings.extraIncome,
      savings_goal: data.settings.savingsGoal,
      daily_food_cut: data.settings.dailyFoodCut,
      currency: data.settings.currency,
      theme: data.settings.theme,
    }),
    supabase.from("moto_profile").insert({
      user_id: USER_ID,
      model: data.moto.model,
      year: data.moto.year,
      average_km_l: data.moto.averageKmL,
      tank_liters: data.moto.tankLiters,
      fuel_price: data.moto.fuelPrice,
      odometer: data.moto.odometer,
      next_oil_change_km: data.moto.nextOilChangeKm,
    }),
    supabase.from("budgets").insert(data.budgets.map((item) => ({
      user_id: USER_ID,
      category: item.category,
      budget_limit: item.limit,
      spent: item.spent,
      color: item.color,
    }))),
    supabase.from("bills").insert(data.bills.map((item) => ({
      user_id: USER_ID,
      name: item.name,
      amount: item.amount,
      due_day: item.dueDay,
      status: item.status,
      category: item.category,
    }))),
    supabase.from("transactions").insert(data.transactions.map((item) => ({
      user_id: USER_ID,
      description: item.description,
      category: item.category,
      amount: item.amount,
      type: item.type,
      occurred_at: item.occurredAt,
    }))),
    supabase.from("goals").insert(data.goals.map((item) => ({
      user_id: USER_ID,
      name: item.name,
      current_amount: item.currentAmount,
      target_amount: item.targetAmount,
      deadline: item.deadline || null,
    }))),
    supabase.from("fuel_logs").insert(data.fuelLogs.map((item) => ({
      user_id: USER_ID,
      filled_at: item.filledAt,
      station: item.station,
      liters: item.liters,
      amount: item.amount,
      odometer: item.odometer,
    }))),
    supabase.from("rides").insert(data.rides.map((item) => ({
      user_id: USER_ID,
      destination: item.destination,
      ride_date: item.rideDate,
      distance_km: item.distanceKm,
      cost: item.cost,
      city: item.city,
    }))),
    supabase.from("calendar_events").insert(data.calendarEvents.map((item) => ({
      user_id: USER_ID,
      title: item.title,
      event_date: item.eventDate,
      event_type: item.eventType,
      color: item.color,
    }))),
    supabase.from("achievements").insert(data.achievements.map((item) => ({
      user_id: USER_ID,
      title: item.title,
      description: item.description,
      completed: item.completed,
    }))),
  ]);

  const error = responses.map((response) => response.error).find(Boolean);
  if (error) throw new Error(error.message);
}

async function clearCloudData() {
  const client = supabase;
  if (!client) return;
  const tables = [
    "monthly_settings",
    "moto_profile",
    "budgets",
    "bills",
    "transactions",
    "goals",
    "fuel_logs",
    "rides",
    "calendar_events",
    "achievements",
  ];

  const responses = await Promise.all(tables.map((table) => client.from(table).delete().eq("user_id", USER_ID)));
  const error = responses.map((response) => response.error).find(Boolean);
  if (error) throw new Error(error.message);
}
