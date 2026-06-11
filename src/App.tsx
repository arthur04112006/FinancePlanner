import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bike,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  Fuel,
  GraduationCap,
  HeartPulse,
  Home,
  Lightbulb,
  Menu,
  PiggyBank,
  Pizza,
  Plus,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  Target,
  Trophy,
  Trash2,
  Utensils,
  Wallet,
  Wrench,
} from "lucide-react";
import { Badge } from "./components/ui/badge";
import { Card, SectionTitle } from "./components/ui/card";
import { Progress } from "./components/ui/progress";
import { brl, cn } from "./lib/utils";
import {
  loadLocalData,
  resetLocalData,
  saveLocalData,
} from "./lib/persistence";
import type {
  Achievement,
  AppData,
  Bill,
  BillStatus,
  Budget,
  CalendarEvent,
  FuelLog,
  Goal,
  Ride,
  Transaction,
  TransactionType,
} from "./types";

type Screen =
  | "home"
  | "financas"
  | "moto"
  | "objetivos"
  | "mais"
  | "planejamento"
  | "abastecimentos"
  | "previsor"
  | "roles"
  | "calendario"
  | "insights"
  | "conquistas"
  | "configuracoes";

type DraftKind = "transaction" | "bill" | "goal" | "fuel" | "ride" | "event" | null;
type ConfirmAction = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
} | null;
type DetailAction = {
  label: string;
  onClick: () => void;
  tone?: "primary" | "secondary";
};
type DetailInfo = {
  title: string;
  description?: string;
  rows?: Array<{ label: string; value: string }>;
  actions?: DetailAction[];
} | null;

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "financas", label: "Financas", icon: BarChart3 },
  { id: "moto", label: "Moto", icon: Bike },
  { id: "objetivos", label: "Objetivos", icon: Target },
  { id: "mais", label: "Mais", icon: Menu },
] satisfies Array<{ id: Screen; label: string; icon: React.ElementType }>;

const iconByCategory: Record<string, React.ElementType> = {
  Moradia: Home,
  Mercado: ShoppingBasket,
  Alimentacao: Utensils,
  Moto: Bike,
  Lazer: Trophy,
  Saude: HeartPulse,
  Estudos: GraduationCap,
  Assinaturas: Lightbulb,
  Combustivel: Fuel,
  Manutencao: Wrench,
  Receita: Banknote,
};

const goalIcons = [ShieldCheck, BadgeCheck, PiggyBank, Target];
const DISMISSED_EVENT_ALERTS_KEY = "motolife:dismissed-event-alerts:v1";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [data, setData] = useState<AppData>(() => loadLocalData());
  const [draft, setDraft] = useState<DraftKind>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [detailInfo, setDetailInfo] = useState<DetailInfo>(null);
  const [eventAlert, setEventAlert] = useState<CalendarEvent | null>(null);
  const metrics = useMemo(() => getMetrics(data), [data]);
  const showBackToMore = !tabs.some((tab) => tab.id === screen);

  useEffect(() => {
    saveLocalData(data);
  }, [data]);

  useEffect(() => {
    const checkEvents = () => {
      if (eventAlert) return;
      const dismissed = getDismissedEventAlerts();
      const now = Date.now();
      const dueEvent = data.calendarEvents
        .filter((event) => event.eventTime && !dismissed.has(event.id))
        .sort((a, b) => eventDateTime(a).getTime() - eventDateTime(b).getTime())
        .find((event) => {
          const eventTime = eventDateTime(event).getTime();
          return eventTime <= now && now - eventTime <= 60000;
        });

      if (dueEvent) setEventAlert(dueEvent);
    };

    checkEvents();
    const timer = window.setInterval(checkEvents, 30000);
    return () => window.clearInterval(timer);
  }, [data.calendarEvents, eventAlert]);

  function dismissEventAlert(eventId: string) {
    const dismissed = getDismissedEventAlerts();
    dismissed.add(eventId);
    localStorage.setItem(DISMISSED_EVENT_ALERTS_KEY, JSON.stringify([...dismissed]));
    setEventAlert(null);
  }

  const actions = {
    setData,
    addTransaction: (item: Omit<Transaction, "id">) =>
      setData((current) => ({ ...current, transactions: [{ ...item, id: id("tx") }, ...current.transactions] })),
    deleteTransaction: (idToDelete: string) =>
      setConfirmAction({
        title: "Excluir transacao?",
        description: "Essa transacao sera removida definitivamente.",
        confirmLabel: "Excluir",
        tone: "danger",
        onConfirm: () => setData((current) => ({ ...current, transactions: current.transactions.filter((item) => item.id !== idToDelete) })),
      }),
    addBill: (item: Omit<Bill, "id">) =>
      setData((current) => ({ ...current, bills: [...current.bills, { ...item, id: id("bill") }] })),
    updateBillStatus: (billId: string, status: BillStatus) =>
      setData((current) => ({
        ...current,
        bills: current.bills.map((item) => (item.id === billId ? { ...item, status } : item)),
      })),
    deleteBill: (billId: string) =>
      setConfirmAction({
        title: "Excluir conta?",
        description: "Essa conta sera removida da sua lista.",
        confirmLabel: "Excluir",
        tone: "danger",
        onConfirm: () => setData((current) => ({ ...current, bills: current.bills.filter((item) => item.id !== billId) })),
      }),
    addGoal: (item: Omit<Goal, "id">) =>
      setData((current) => ({ ...current, goals: [...current.goals, { ...item, id: id("goal") }] })),
    addGoalMoney: (goalId: string, amount: number) =>
      setData((current) => ({
        ...current,
        goals: current.goals.map((goal) =>
          goal.id === goalId ? { ...goal, currentAmount: Math.min(goal.targetAmount, goal.currentAmount + amount) } : goal,
        ),
      })),
    deleteGoal: (goalId: string) =>
      setConfirmAction({
        title: "Excluir objetivo?",
        description: "Esse objetivo e seu progresso serao removidos.",
        confirmLabel: "Excluir",
        tone: "danger",
        onConfirm: () => setData((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== goalId) })),
      }),
    addFuel: (item: Omit<FuelLog, "id">) =>
      setData((current) => ({
        ...current,
        fuelLogs: [{ ...item, id: id("fuel") }, ...current.fuelLogs],
        moto: { ...current.moto, odometer: Math.max(current.moto.odometer, item.odometer) },
      })),
    deleteFuel: (fuelId: string) =>
      setConfirmAction({
        title: "Excluir abastecimento?",
        description: "Esse registro de abastecimento sera removido.",
        confirmLabel: "Excluir",
        tone: "danger",
        onConfirm: () => setData((current) => ({ ...current, fuelLogs: current.fuelLogs.filter((item) => item.id !== fuelId) })),
      }),
    addRide: (item: Omit<Ride, "id">) =>
      setData((current) => ({ ...current, rides: [{ ...item, id: id("ride") }, ...current.rides] })),
    deleteRide: (rideId: string) =>
      setConfirmAction({
        title: "Excluir role?",
        description: "Esse registro de role sera removido.",
        confirmLabel: "Excluir",
        tone: "danger",
        onConfirm: () => setData((current) => ({ ...current, rides: current.rides.filter((item) => item.id !== rideId) })),
      }),
    addEvent: (item: Omit<CalendarEvent, "id">) =>
      setData((current) => ({ ...current, calendarEvents: [...current.calendarEvents, { ...item, id: id("event") }] })),
    deleteEvent: (eventId: string) =>
      setConfirmAction({
        title: "Excluir evento?",
        description: "Esse evento sera removido do calendario.",
        confirmLabel: "Excluir",
        tone: "danger",
        onConfirm: () => setData((current) => ({ ...current, calendarEvents: current.calendarEvents.filter((item) => item.id !== eventId) })),
      }),
    toggleAchievement: (achievementId: string) =>
      setData((current) => ({
        ...current,
        achievements: current.achievements.map((item) =>
          item.id === achievementId ? { ...item, completed: !item.completed } : item,
        ),
      })),
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white antialiased">
      <div className="app-ambient" aria-hidden="true">
        <div className="ambient-grid" />
        <div className="ambient-beam ambient-beam-a" />
        <div className="ambient-beam ambient-beam-b" />
        <div className="ambient-noise" />
      </div>
      <main className="app-main relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-3 py-5 sm:px-6">
        <div className="phone-frame">
          <div className="phone-screen">
            <Header
              title={screenTitle(screen)}
              showBack={showBackToMore}
              onBack={() => setScreen("mais")}
              onSettings={() => setScreen("configuracoes")}
            />
            <div className="content-scroll">
              {screen === "home" && <HomeScreen data={data} metrics={metrics} setScreen={setScreen} actions={actions} setDraft={setDraft} openDetail={setDetailInfo} />}
              {screen === "financas" && <FinancasScreen data={data} metrics={metrics} actions={actions} setDraft={setDraft} openDetail={setDetailInfo} />}
              {screen === "moto" && <MotoScreen data={data} metrics={metrics} actions={actions} setDraft={setDraft} openDetail={setDetailInfo} />}
              {screen === "objetivos" && <ObjetivosScreen data={data} metrics={metrics} actions={actions} setDraft={setDraft} openDetail={setDetailInfo} />}
              {screen === "mais" && <MaisScreen setScreen={setScreen} />}
              {screen === "planejamento" && <PlanejamentoScreen data={data} metrics={metrics} actions={actions} setDraft={setDraft} openDetail={setDetailInfo} />}
              {screen === "abastecimentos" && <AbastecimentosScreen data={data} metrics={metrics} actions={actions} setDraft={setDraft} openDetail={setDetailInfo} />}
              {screen === "previsor" && <PrevisorScreen data={data} openDetail={setDetailInfo} />}
              {screen === "roles" && <RolesScreen data={data} metrics={metrics} actions={actions} setDraft={setDraft} openDetail={setDetailInfo} />}
              {screen === "calendario" && <CalendarioScreen data={data} metrics={metrics} actions={actions} setDraft={setDraft} openDetail={setDetailInfo} />}
              {screen === "insights" && <InsightsScreen data={data} metrics={metrics} openDetail={setDetailInfo} />}
              {screen === "conquistas" && <ConquistasScreen data={data} metrics={metrics} actions={actions} setDraft={setDraft} openDetail={setDetailInfo} />}
              {screen === "configuracoes" && (
                <ConfiguracoesScreen
                  data={data}
                  metrics={metrics}
                  actions={actions}
                  setDraft={setDraft}
                  reset={() =>
                    setConfirmAction({
                      title: "Limpar campos?",
                      description: "Os valores serao restaurados para os dados iniciais.",
                      confirmLabel: "Limpar",
                      tone: "primary",
                      onConfirm: () => setData(resetLocalData()),
                    })
                  }
                />
              )}
            </div>
            <BottomNav screen={screen} setScreen={setScreen} />
          </div>
        </div>
      </main>
      <Modal kind={draft} close={() => setDraft(null)} actions={actions} />
      <ConfirmDialog action={confirmAction} close={() => setConfirmAction(null)} />
      <DetailDialog info={detailInfo} close={() => setDetailInfo(null)} />
      <EventAlertDialog event={eventAlert} close={() => eventAlert && dismissEventAlert(eventAlert.id)} />
    </div>
  );
}

function Header({ title, showBack, onBack, onSettings }: { title: string; showBack?: boolean; onBack: () => void; onSettings: () => void }) {
  return (
    <header className="app-header flex items-center justify-between px-5 pb-3 pt-5">
      <div className="flex min-w-0 items-center gap-3">
        {showBack ? (
          <button onClick={onBack} className="glass-icon grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/8 bg-white/6 text-white/80" aria-label="Voltar">
            <ArrowLeft size={19} />
          </button>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[.16em] text-violet-200/70">MotoLife</p>
          <h1 className="mt-1 truncate text-2xl font-semibold tracking-normal">{title}</h1>
        </div>
      </div>
      <button onClick={onSettings} className="glass-icon grid h-11 w-11 place-items-center rounded-2xl border border-white/8 bg-white/6 text-white/80" aria-label="Configuracoes">
        <Settings size={19} />
      </button>
    </header>
  );
}

function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) {
  return (
    <nav className="bottom-nav z-20 px-4 pb-4 pt-3">
      <div className="bottom-nav-shell grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = screen === tab.id || (tab.id === "mais" && !tabs.some((item) => item.id === screen));
          return (
            <button key={tab.id} onClick={() => setScreen(tab.id)} className={cn("nav-item flex h-[58px] flex-col items-center justify-center gap-1 rounded-[18px] text-[10px] font-semibold text-white/42 transition", active && "nav-item-active text-white")}>
              <span className="nav-icon-wrap">
                <Icon size={19} strokeWidth={active ? 2.6 : 2.1} />
              </span>
              <span className="nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function HomeScreen({ data, metrics, setScreen, actions, setDraft, openDetail }: ScreenProps & { setScreen: (screen: Screen) => void }) {
  return (
    <div className="space-y-5">
      <HeroBalance metrics={metrics} openDetail={openDetail} setScreen={setScreen} />
      <MonthlyCockpit data={data} metrics={metrics} openDetail={openDetail} setScreen={setScreen} />
      <FreedomGrid data={data} metrics={metrics} openDetail={openDetail} />
      <div className="responsive-split">
        <DailyLimit metrics={metrics} openDetail={openDetail} setScreen={setScreen} />
        <MotoSummary data={data} metrics={metrics} openDetail={openDetail} setScreen={setScreen} />
      </div>
      <QuickCategories budgets={data.budgets} openDetail={openDetail} setScreen={setScreen} />
      <div className="responsive-split">
        <BillsCard bills={data.bills} actions={actions} setDraft={setDraft} />
        <GoalsPreview goals={data.goals} setScreen={setScreen} />
      </div>
      <AssistantCards metrics={metrics} openDetail={openDetail} setScreen={setScreen} />
      <SurvivalCard metrics={metrics} openDetail={openDetail} setScreen={setScreen} />
      <BudgetRemaining budgets={data.budgets} openDetail={openDetail} setScreen={setScreen} />
      <ExecutiveSummary data={data} metrics={metrics} openDetail={openDetail} setScreen={setScreen} />
    </div>
  );
}

function HeroBalance({ metrics, openDetail, setScreen }: { metrics: Metrics; openDetail?: (info: DetailInfo) => void; setScreen?: (screen: Screen) => void }) {
  return (
    <Card
      onClick={() => openDetail?.({
        title: "Saldo do mes",
        description: "Resumo do dinheiro disponivel depois das despesas do periodo.",
        rows: [
          { label: "Disponivel", value: brl.format(metrics.available) },
          { label: "Projecao", value: brl.format(metrics.projected) },
          { label: "Receitas", value: brl.format(metrics.income) },
          { label: "Despesas", value: brl.format(metrics.expenses) },
          { label: "Orcamento usado", value: `${Math.round(metrics.budgetUsed)}%` },
        ],
        actions: [{ label: "Ver financas", onClick: () => setScreen?.("financas") }],
      })}
      className="hero-card relative overflow-hidden bg-gradient-to-br from-violet via-[#5B2AC9] to-electric p-5 shadow-glow"
    >
      <div className="hero-sheen" />
      <div className="hero-lines" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/70">Saldo disponivel</p>
          <Badge tone={metrics.available >= 0 ? "green" : "red"}>{metrics.available >= 0 ? "Mes saudavel" : "Ajustar gastos"}</Badge>
        </div>
        <p className="mt-3 text-4xl font-semibold tracking-normal">{brl.format(metrics.available)}</p>
        <p className="mt-1 text-sm text-white/70">Projecao para o fim do mes: {brl.format(metrics.projected)}</p>
        <Progress value={metrics.budgetUsed} className="mt-5 bg-white/18" tone={metrics.budgetUsed > 90 ? "red" : "green"} />
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <Metric label="Receitas" value={brl.format(metrics.income)} />
          <Metric label="Despesas" value={brl.format(metrics.expenses)} negative />
          <Metric label="Economizado" value={brl.format(metrics.saved)} positive />
        </div>
      </div>
    </Card>
  );
}

function MonthlyCockpit({ data, metrics, openDetail, setScreen }: { data: AppData; metrics: Metrics; openDetail?: (info: DetailInfo) => void; setScreen?: (screen: Screen) => void }) {
  const stats = [
    { icon: Wallet, label: "Apos contas", value: brl.format(metrics.afterBills), tone: "blue" as const, detail: "Saldo apos considerar contas abertas.", screen: "planejamento" as Screen },
    { icon: Bike, label: "Pode rodar", value: `${metrics.possibleKm} km`, tone: "violet" as const, detail: "Estimativa baseada no preco da gasolina e consumo medio.", screen: "moto" as Screen },
    { icon: Fuel, label: "Tanques", value: metrics.tanks.toFixed(1), tone: "green" as const, detail: "Quantidade aproximada de tanques cheios que o saldo cobre.", screen: "abastecimentos" as Screen },
    { icon: Target, label: "Objetivos", value: brl.format(data.settings.savingsGoal), tone: "blue" as const, detail: "Meta mensal configurada para economia.", screen: "objetivos" as Screen },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <SmallStat
          key={stat.label}
          {...stat}
          onClick={() => openDetail?.({
            title: stat.label,
            description: stat.detail,
            rows: [
              { label: "Valor", value: stat.value },
              { label: "Saldo disponivel", value: brl.format(metrics.available) },
            ],
            actions: [{ label: "Abrir tela", onClick: () => setScreen?.(stat.screen) }],
          })}
        />
      ))}
    </div>
  );
}

function FreedomGrid({ metrics, openDetail }: { data: AppData; metrics: Metrics; openDetail?: (info: DetailInfo) => void }) {
  const items = [
    { label: "km disponiveis", value: String(metrics.possibleKm), icon: Bike },
    { label: "tanques", value: metrics.tanks.toFixed(1), icon: Fuel },
    { label: "refeicoes fora", value: String(Math.floor(metrics.available / 32)), icon: Utensils },
    { label: "cafes", value: String(Math.floor(metrics.available / 8)), icon: Coffee },
  ];
  return (
    <section>
      <SectionTitle title="Liberdade do mes" subtitle="Seu dinheiro traduzido para decisoes reais." />
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} onClick={() => openDetail?.({ title: item.label, description: "Conversao pratica do seu saldo disponivel.", rows: [{ label: "Quantidade", value: item.value }, { label: "Saldo usado na conta", value: brl.format(metrics.available) }] })} className="p-3">
              <div className="mb-4 grid h-9 w-9 place-items-center rounded-2xl bg-white/8 text-violet-200"><Icon size={18} /></div>
              <p className="text-2xl font-semibold">{item.value}</p>
              <p className="mt-1 text-xs text-white/48">{item.label}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function DailyLimit({ metrics, openDetail, setScreen }: { metrics: Metrics; openDetail?: (info: DetailInfo) => void; setScreen?: (screen: Screen) => void }) {
  return (
    <Card
      onClick={() => openDetail?.({
        title: "Limite diario",
        description: "Valor seguro para gastar por dia ate o fim do mes.",
        rows: [
          { label: "Limite diario", value: brl.format(metrics.dailyLimit) },
          { label: "Dias restantes", value: String(metrics.daysLeft) },
          { label: "Saldo restante", value: brl.format(metrics.available) },
          { label: "Depois das contas", value: brl.format(metrics.afterBills) },
        ],
        actions: [{ label: "Ajustar planejamento", onClick: () => setScreen?.("planejamento") }],
      })}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/50">Limite diario</p>
          <p className="mt-1 text-3xl font-semibold">{brl.format(metrics.dailyLimit)}</p>
          <p className="mt-1 text-xs text-white/45">por dia ate o final do mes</p>
        </div>
        <div className="relative grid h-24 w-24 place-items-center rounded-full bg-conic">
          <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-panel">
            <span className="text-xl font-semibold">{metrics.daysLeft}</span>
            <span className="-mt-5 text-[10px] text-white/45">dias</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between rounded-2xl bg-white/6 px-3 py-2 text-xs text-white/60">
        <span>Saldo restante</span>
        <strong className="text-white">{brl.format(metrics.available)}</strong>
      </div>
    </Card>
  );
}

function QuickCategories({ budgets, openDetail, setScreen }: { budgets: Budget[]; openDetail?: (info: DetailInfo) => void; setScreen?: (screen: Screen) => void }) {
  return (
    <section>
      <SectionTitle title="Cards rapidos" />
      <div className="grid grid-cols-2 gap-3">
        {budgets.slice(1, 5).map((cat) => {
          const Icon = iconByCategory[cat.category] ?? ShoppingBasket;
          const used = (cat.spent / cat.limit) * 100;
          return (
            <Card
              key={cat.id}
              onClick={() => openDetail?.({
                title: cat.category,
                description: "Acompanhe quanto ja foi usado e ajuste o planejamento se precisar.",
                rows: [
                  { label: "Limite", value: brl.format(cat.limit) },
                  { label: "Gasto", value: brl.format(cat.spent) },
                  { label: "Livre", value: brl.format(Math.max(0, cat.limit - cat.spent)) },
                  { label: "Uso", value: `${Math.round(used)}%` },
                ],
                actions: [{ label: "Editar orcamento", onClick: () => setScreen?.("planejamento") }],
              })}
              className="p-3"
            >
              <div className="flex items-center gap-2"><Icon size={17} className="text-blue-300" /><span className="text-sm font-medium">{cat.category}</span></div>
              <Progress value={used} className="mt-4" tone={used > 85 ? "red" : "blue"} />
              <p className="mt-2 text-xs text-white/48">{brl.format(Math.max(0, cat.limit - cat.spent))} livres</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function BillsCard({ bills, actions, setDraft }: { bills: Bill[]; actions: Actions; setDraft: (kind: DraftKind) => void }) {
  return (
    <section>
      <SectionTitle title="Contas a pagar" />
      <Card className="space-y-3">
        <button onClick={() => setDraft("bill")} className="primary-button"><Plus size={17} /> Nova conta</button>
        {bills.map((bill) => (
          <Row
            key={bill.id}
            title={bill.name}
            subtitle={`Dia ${bill.dueDay} - ${brl.format(bill.amount)}`}
            right={
              <div className="flex items-center gap-2">
                <button onClick={() => actions.updateBillStatus(bill.id, nextStatus(bill.status))}><Badge tone={bill.status === "Pago" ? "green" : bill.status === "Atrasado" ? "red" : "yellow"}>{bill.status}</Badge></button>
                <IconButton onClick={() => actions.deleteBill(bill.id)} icon={Trash2} label="Excluir conta" />
              </div>
            }
          />
        ))}
      </Card>
    </section>
  );
}

function MotoSummary({ data, metrics, openDetail, setScreen }: { data: AppData; metrics: Metrics; openDetail?: (info: DetailInfo) => void; setScreen?: (screen: Screen) => void }) {
  return (
    <section>
      <SectionTitle title="Moto" subtitle={data.moto.model} />
      <Card
        accent="blue"
        onClick={() => openDetail?.({
          title: data.moto.model,
          description: "Resumo operacional da moto e proximas acoes.",
          rows: [
            { label: "Ano", value: String(data.moto.year) },
            { label: "Hodometro", value: `${data.moto.odometer} km` },
            { label: "Autonomia", value: `${metrics.fullTankRange} km` },
            { label: "Prox. abastecimento", value: `${metrics.nextFuelKm} km` },
            { label: "Troca de oleo", value: `${metrics.nextOilKm} km` },
          ],
          actions: [
            { label: "Editar moto", onClick: () => setScreen?.("moto") },
            { label: "Abastecimentos", onClick: () => setScreen?.("abastecimentos"), tone: "secondary" },
          ],
        })}
      >
        <div className="grid grid-cols-2 gap-3">
          <SmallText label="Autonomia atual" value={`${metrics.fullTankRange} km`} />
          <SmallText label="Km no mes" value={`${metrics.rideKm} km`} />
          <SmallText label="Prox. abastecimento" value={`em ${metrics.nextFuelKm} km`} />
          <SmallText label="Troca de oleo" value={`em ${metrics.nextOilKm} km`} />
        </div>
        <Progress value={Math.max(0, 100 - (metrics.nextOilKm / 3000) * 100)} className="mt-4" tone="blue" />
      </Card>
    </section>
  );
}

function GoalsPreview({ goals, setScreen }: { goals: Goal[]; setScreen: (screen: Screen) => void }) {
  return (
    <section>
      <SectionTitle title="Objetivos" />
      <Card className="space-y-4">
        {goals.slice(0, 3).map((goal, index) => {
          const Icon = goalIcons[index % goalIcons.length];
          const percent = goalPercent(goal);
          return (
            <div key={goal.id}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><Icon size={17} className="text-purple-200" /><span>{goal.name}</span></div>
                <span className="text-sm text-white/60">{percent}%</span>
              </div>
              <Progress value={percent} tone="violet" />
            </div>
          );
        })}
        <button onClick={() => setScreen("objetivos")} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/7 py-3 text-sm text-white/80">Ver metas <ChevronRight size={16} /></button>
      </Card>
    </section>
  );
}

function AssistantCards({ metrics, openDetail, setScreen }: { metrics: Metrics; openDetail?: (info: DetailInfo) => void; setScreen?: (screen: Screen) => void }) {
  const items = [
    metrics.fuelSpend < 350 ? "Voce gastou menos combustivel este mes." : "Combustivel passou do ritmo esperado.",
    metrics.foodBudgetUsed > 80 ? "Seu gasto com alimentacao esta em alerta." : "Alimentacao segue controlada.",
    `Voce pode economizar mais ${brl.format(Math.max(0, metrics.projected - metrics.available))} este mes.`,
    `R$ 100 economizados viram cerca de ${metrics.kmPer100} km de rodagem.`,
  ];
  return (
    <section>
      <SectionTitle title="Assistente financeiro" />
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item} onClick={() => openDetail?.({ title: "Insight", description: item, rows: [{ label: "Limite diario", value: brl.format(metrics.dailyLimit) }, { label: "Pode rodar", value: `${metrics.possibleKm} km` }], actions: [{ label: "Ver financas", onClick: () => setScreen?.("financas") }] })} className="p-3">
            <p className="text-sm leading-5 text-white/70">{item}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SurvivalCard({ metrics, openDetail, setScreen }: { metrics: Metrics; openDetail?: (info: DetailInfo) => void; setScreen?: (screen: Screen) => void }) {
  return (
    <Card onClick={() => openDetail?.({ title: "Sobrevivencia financeira", description: "Estimativa de quantos dias seu saldo sustenta o ritmo atual.", rows: [{ label: "Dias", value: String(metrics.survivalDays) }, { label: "Saldo", value: brl.format(metrics.available) }, { label: "Despesas", value: brl.format(metrics.expenses) }], actions: [{ label: "Planejar cortes", onClick: () => setScreen?.("planejamento") }] })} className="overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">Sobrevivencia financeira</p>
          <p className="mt-2 text-4xl font-semibold">{metrics.survivalDays} dias</p>
          <p className="mt-1 text-xs text-white/45">suficiente ate o proximo salario</p>
        </div>
        <div className="h-28 w-28">
          <ResponsiveContainer>
            <AreaChart data={metrics.spark}>
              <Area type="monotone" dataKey="v" stroke="#22C55E" fill="#22C55E33" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

function BudgetRemaining({ budgets, openDetail, setScreen }: { budgets: Budget[]; openDetail?: (info: DetailInfo) => void; setScreen?: (screen: Screen) => void }) {
  return (
    <section>
      <SectionTitle title="Orcamento restante" />
      <Card className="space-y-3">
        {budgets.map((budget) => {
          const Icon = iconByCategory[budget.category] ?? Wallet;
          const used = (budget.spent / budget.limit) * 100;
          return (
            <div
              key={budget.id}
              onClick={() => openDetail?.({
                title: budget.category,
                description: "Detalhes do orcamento desta categoria.",
                rows: [
                  { label: "Limite", value: brl.format(budget.limit) },
                  { label: "Gasto", value: brl.format(budget.spent) },
                  { label: "Livre", value: brl.format(Math.max(0, budget.limit - budget.spent)) },
                  { label: "Uso", value: `${Math.round(used)}%` },
                ],
                actions: [{ label: "Editar orcamento", onClick: () => setScreen?.("planejamento") }],
              })}
              className="clickable-row rounded-2xl p-2"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><Icon size={16} className="text-white/45" />{budget.category}</span>
                <span className="text-white/60">{brl.format(Math.max(0, budget.limit - budget.spent))}</span>
              </div>
              <Progress value={used} tone={used > 85 ? "red" : "violet"} />
            </div>
          );
        })}
      </Card>
    </section>
  );
}

function ExecutiveSummary({ data, metrics, openDetail, setScreen }: { data: AppData; metrics: Metrics; openDetail?: (info: DetailInfo) => void; setScreen?: (screen: Screen) => void }) {
  const topGoal = data.goals[0];
  return (
    <Card
      accent="green"
      className="mb-2"
      onClick={() => openDetail?.({
        title: "Resumo executivo",
        description: "Leitura rapida da situacao atual do mes.",
        rows: [
          { label: "Disponivel", value: brl.format(metrics.available) },
          { label: "Limite diario", value: brl.format(metrics.dailyLimit) },
          { label: "Km possiveis", value: `${metrics.possibleKm} km` },
          { label: "Meta principal", value: topGoal ? `${topGoal.name} (${goalPercent(topGoal)}%)` : "Sem meta" },
        ],
        actions: [{ label: "Ver insights", onClick: () => setScreen?.("insights") }],
      })}
    >
      <SectionTitle title="Resumo executivo" />
      <p className="text-sm leading-6 text-white/72">
        Seu mes esta {metrics.available >= 0 ? "saudavel" : "pressionado"}. Voce tem {brl.format(metrics.available)} disponiveis,
        pode gastar {brl.format(metrics.dailyLimit)} por dia, rodar aproximadamente {metrics.possibleKm} km e
        {topGoal ? ` esta em ${goalPercent(topGoal)}% na meta ${topGoal.name}.` : " pode criar uma nova meta."}
      </p>
    </Card>
  );
}

function FinancasScreen({ data, metrics, actions, setDraft, openDetail }: ScreenProps) {
  const chart = data.budgets.map((item) => ({ name: item.category, value: item.spent, fill: item.color }));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <SmallStat icon={Banknote} label="Receitas" value={brl.format(metrics.income)} tone="green" onClick={() => openDetail?.({ title: "Receitas", rows: [{ label: "Total", value: brl.format(metrics.income) }, { label: "Lancamentos", value: String(data.transactions.filter((item) => item.type === "income").length) }] })} />
        <SmallStat icon={CircleDollarSign} label="Despesas" value={brl.format(metrics.expenses)} tone="red" onClick={() => openDetail?.({ title: "Despesas", rows: [{ label: "Total", value: brl.format(metrics.expenses) }, { label: "Orcamento usado", value: `${Math.round(metrics.budgetUsed)}%` }] })} />
        <SmallStat icon={PiggyBank} label="Economia" value={brl.format(metrics.saved)} tone="blue" onClick={() => openDetail?.({ title: "Economia", rows: [{ label: "Economizado", value: brl.format(metrics.saved) }, { label: "Projecao", value: brl.format(metrics.projected) }] })} />
      </div>
      <Card onClick={() => openDetail?.({ title: "Categorias", description: "Distribuicao dos gastos do mes por categoria.", rows: data.budgets.map((item) => ({ label: item.category, value: brl.format(item.spent) })) })}>
        <SectionTitle title="Categorias" subtitle="Distribuicao do mes" />
        <div className="h-56">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chart}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={86}
                paddingAngle={4}
                stroke="#171A23"
                strokeWidth={3}
                isAnimationActive={false}
              >
                {chart.map((entry) => <Cell key={entry.name} fill={entry.fill} className="donut-slice" />)}
              </Pie>
              <Tooltip cursor={false} content={<CategoryTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="space-y-3">
        <div className="flex items-center justify-between"><SectionTitle title="Transacoes" /><button onClick={() => setDraft("transaction")} className="mini-button"><Plus size={16} /> Nova</button></div>
        {data.transactions.map((tx) => {
          const Icon = iconByCategory[tx.category] ?? Wallet;
          return (
            <Row key={tx.id} title={tx.description} subtitle={`${tx.category} - ${dateBR(tx.occurredAt)}`} left={<Icon size={18} />} right={<div className="flex items-center gap-2"><span className={cn("text-sm font-semibold", tx.type === "income" ? "text-green-300" : "text-red-300")}>{tx.type === "income" ? "+" : "-"}{brl.format(tx.amount)}</span><IconButton onClick={() => actions.deleteTransaction(tx.id)} icon={Trash2} label="Excluir" /></div>} />
          );
        })}
      </Card>
    </div>
  );
}

type CategoryTooltipPayload = {
  name?: string;
  value?: number | string;
  payload?: {
    fill?: string;
    name?: string;
  };
};

function CategoryTooltip({ active, payload }: { active?: boolean; payload?: CategoryTooltipPayload[] }) {
  const item = payload?.[0];
  if (!active || !item) return null;

  const color = item.payload?.fill ?? "#7C3AED";
  const name = item.name ?? item.payload?.name ?? "Categoria";
  const value = Number(item.value ?? 0);

  return (
    <div className="chart-tooltip">
      <div className="flex items-center gap-2">
        <span className="chart-tooltip-dot" style={{ backgroundColor: color }} />
        <span className="chart-tooltip-name">{name}</span>
      </div>
      <strong>{brl.format(value)}</strong>
    </div>
  );
}

function PlanejamentoScreen({ data, metrics, actions }: ScreenProps) {
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <SectionTitle title="Orcamento do mes" subtitle="Toque nos valores para editar" />
        {data.budgets.map((budget) => {
          const used = (budget.spent / budget.limit) * 100;
          return (
            <div key={budget.id}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{budget.category}</span>
                <div className="flex gap-2">
                  <MoneyInline ariaLabel={`Valor usado em ${budget.category}`} value={budget.spent} onChange={(spent) => actions.setData((current) => ({ ...current, budgets: current.budgets.map((item) => item.id === budget.id ? { ...item, spent } : item) }))} />
                  <span className="text-white/35">/</span>
                  <MoneyInline ariaLabel={`Limite de ${budget.category}`} value={budget.limit} onChange={(limit) => actions.setData((current) => ({ ...current, budgets: current.budgets.map((item) => item.id === budget.id ? { ...item, limit } : item) }))} />
                </div>
              </div>
              <Progress value={used} tone={used > 85 ? "red" : "violet"} />
            </div>
          );
        })}
      </Card>
      <DailyLimit metrics={metrics} />
      <Card accent="blue">
        <p className="text-sm text-white/50">Previsao de fechamento</p>
        <p className="mt-2 text-sm text-white/70">Mantendo o ritmo atual:</p>
        <p className="mt-2 text-3xl font-semibold">{brl.format(metrics.projected)}</p>
      </Card>
    </div>
  );
}

function MotoScreen({ data, metrics, actions, openDetail }: ScreenProps) {
  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle title="Cadastro da moto" subtitle="Tudo editavel" />
        <div className="space-y-3">
          <TextInput label="Modelo" value={data.moto.model} onChange={(model) => actions.setData((current) => ({ ...current, moto: { ...current.moto, model } }))} />
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Ano" value={data.moto.year} min={1900} step={1} inputMode="numeric" onChange={(year) => actions.setData((current) => ({ ...current, moto: { ...current.moto, year } }))} />
            <NumberInput label="Km atual" value={data.moto.odometer} min={0} step={1} inputMode="numeric" onChange={(odometer) => actions.setData((current) => ({ ...current, moto: { ...current.moto, odometer } }))} />
            <NumberInput label="Km/l" value={data.moto.averageKmL} min={0} step={0.1} inputMode="decimal" onChange={(averageKmL) => actions.setData((current) => ({ ...current, moto: { ...current.moto, averageKmL } }))} />
            <NumberInput label="Tanque L" value={data.moto.tankLiters} min={0} step={0.1} inputMode="decimal" onChange={(tankLiters) => actions.setData((current) => ({ ...current, moto: { ...current.moto, tankLiters } }))} />
            <MoneyInput label="Gasolina" value={data.moto.fuelPrice} onChange={(fuelPrice) => actions.setData((current) => ({ ...current, moto: { ...current.moto, fuelPrice } }))} />
            <NumberInput label="Prox. oleo" value={data.moto.nextOilChangeKm} min={0} step={1} inputMode="numeric" onChange={(nextOilChangeKm) => actions.setData((current) => ({ ...current, moto: { ...current.moto, nextOilChangeKm } }))} />
          </div>
        </div>
      </Card>
      <MotoSummary data={data} metrics={metrics} />
      <div className="grid grid-cols-2 gap-3">
        <SmallStat icon={Fuel} label="Custo por km" value={brl.format(metrics.costPerKm)} tone="green" onClick={() => openDetail?.({ title: "Custo por km", rows: [{ label: "Custo", value: brl.format(metrics.costPerKm) }, { label: "Gasolina", value: brl.format(data.moto.fuelPrice) }, { label: "Media", value: `${data.moto.averageKmL} km/l` }] })} />
        <SmallStat icon={Bike} label="Tanque cheio" value={`${metrics.fullTankRange} km`} tone="blue" onClick={() => openDetail?.({ title: "Tanque cheio", rows: [{ label: "Autonomia", value: `${metrics.fullTankRange} km` }, { label: "Litros", value: `${data.moto.tankLiters} L` }, { label: "Preco", value: brl.format(data.moto.tankLiters * data.moto.fuelPrice) }] })} />
      </div>
    </div>
  );
}

function AbastecimentosScreen({ data, metrics, actions, setDraft, openDetail }: ScreenProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <SmallStat icon={Bike} label="Media" value={`${data.moto.averageKmL} km/l`} tone="green" onClick={() => openDetail?.({ title: "Media da moto", rows: [{ label: "Consumo", value: `${data.moto.averageKmL} km/l` }, { label: "Autonomia", value: `${metrics.fullTankRange} km` }] })} />
        <SmallStat icon={Fuel} label="Litro" value={brl.format(data.moto.fuelPrice)} tone="blue" onClick={() => openDetail?.({ title: "Preco do litro", rows: [{ label: "Gasolina", value: brl.format(data.moto.fuelPrice) }, { label: "Tanque cheio", value: brl.format(data.moto.tankLiters * data.moto.fuelPrice) }] })} />
        <SmallStat icon={Wallet} label="Mes" value={brl.format(metrics.fuelSpend)} tone="violet" onClick={() => openDetail?.({ title: "Gasto com combustivel", rows: [{ label: "Total no mes", value: brl.format(metrics.fuelSpend) }, { label: "Registros", value: String(data.fuelLogs.length) }] })} />
      </div>
      <button onClick={() => setDraft("fuel")} className="primary-button"><Plus size={18} /> Novo abastecimento</button>
      <Card className="space-y-3">
        {data.fuelLogs.map((fuel) => <Row key={fuel.id} title={fuel.station} subtitle={`${dateBR(fuel.filledAt)} - ${fuel.liters} L - ${fuel.odometer} km`} right={<div className="flex items-center gap-2"><span className="text-sm font-semibold">{brl.format(fuel.amount)}</span><IconButton onClick={() => actions.deleteFuel(fuel.id)} icon={Trash2} label="Excluir" /></div>} />)}
      </Card>
    </div>
  );
}

function PrevisorScreen({ data, openDetail }: { data: AppData; openDetail?: (info: DetailInfo) => void }) {
  const [available, setAvailable] = useState(200);
  const tankPrice = data.moto.tankLiters * data.moto.fuelPrice;
  const tanks = available / tankPrice;
  const km = Math.round(tanks * data.moto.averageKmL * data.moto.tankLiters);
  return (
    <div className="space-y-5">
      <Card accent="violet">
        <MoneyInput label="Valor disponivel" value={available} onChange={setAvailable} />
        <p className="mt-4 text-xs text-white/45">Tanque cheio custa {brl.format(tankPrice)}</p>
      </Card>
      <Card onClick={() => openDetail?.({ title: "Resultado da previsao", rows: [{ label: "Tanques", value: tanks.toFixed(2) }, { label: "Km possiveis", value: `${km} km` }, { label: "Preco do tanque", value: brl.format(tankPrice) }] })}>
        <p className="text-sm text-white/50">Resultado</p>
        <p className="mt-2 text-3xl font-semibold">{tanks.toFixed(2)} tanques</p>
        <p className="mt-1 text-sm text-white/50">{km} km possiveis</p>
        <div className="mt-5 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, index) => <div key={index} className={cn("h-12 rounded-xl border border-white/8", index < Math.min(10, Math.round(tanks * 3)) ? "bg-violet" : "bg-white/6")} />)}
        </div>
      </Card>
    </div>
  );
}

function RolesScreen({ data, metrics, actions, setDraft, openDetail }: ScreenProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <SmallStat icon={Bike} label="Km" value={String(metrics.rideKm)} tone="blue" onClick={() => openDetail?.({ title: "Km rodados", rows: [{ label: "Total", value: `${metrics.rideKm} km` }, { label: "Roles", value: String(data.rides.length) }] })} />
        <SmallStat icon={CalendarDays} label="Roles" value={String(data.rides.length)} tone="violet" onClick={() => openDetail?.({ title: "Roles registrados", rows: [{ label: "Quantidade", value: String(data.rides.length) }, { label: "Custo total", value: brl.format(sum(data.rides.map((ride) => ride.cost))) }] })} />
        <SmallStat icon={Home} label="Cidades" value={String(new Set(data.rides.map((ride) => ride.city)).size)} tone="green" onClick={() => openDetail?.({ title: "Cidades visitadas", rows: [...new Set(data.rides.map((ride) => ride.city))].map((city) => ({ label: city || "Sem cidade", value: "Visitada" })) })} />
      </div>
      <button onClick={() => setDraft("ride")} className="primary-button"><Plus size={18} /> Novo role</button>
      <Card className="space-y-3">
        {data.rides.map((ride) => <Row key={ride.id} title={ride.destination} subtitle={`${dateBR(ride.rideDate)} - ${ride.distanceKm} km`} right={<div className="flex items-center gap-2"><span className="text-sm font-semibold">{brl.format(ride.cost)}</span><IconButton onClick={() => actions.deleteRide(ride.id)} icon={Trash2} label="Excluir" /></div>} />)}
      </Card>
    </div>
  );
}

function CalendarioScreen({ data, actions }: ScreenProps) {
  const today = toDateInput(new Date());
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(today);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    eventType: "Conta",
    eventTime: "09:00",
    color: "#7C3AED",
  });

  const days = calendarDays(month);
  const selectedEvents = data.calendarEvents
    .filter((event) => event.eventDate === selectedDate)
    .sort((a, b) => (a.eventTime ?? "23:59").localeCompare(b.eventTime ?? "23:59"));
  const monthEvents = data.calendarEvents.filter((event) => {
    const eventDate = new Date(`${event.eventDate}T00:00:00`);
    return eventDate.getFullYear() === month.getFullYear() && eventDate.getMonth() === month.getMonth();
  });

  function changeMonth(offset: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    const next = new Date(`${date}T00:00:00`);
    setMonth(startOfMonth(next));
    setShowEventModal(true);
  }

  function addCalendarEvent() {
    actions.addEvent({
      title: eventForm.title.trim() || "Novo evento",
      eventDate: selectedDate,
      eventTime: eventForm.eventTime,
      eventType: eventForm.eventType,
      color: eventForm.color,
    });
    setEventForm((current) => ({ ...current, title: "" }));
    setShowEventModal(false);
  }

  return (
    <div className="space-y-4">
      <Card className="calendar-card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle title={monthTitle(month)} subtitle={`${monthEvents.length} eventos no mes`} />
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="calendar-nav-button" aria-label="Mes anterior">‹</button>
            <button onClick={() => selectDate(today)} className="mini-button">Hoje</button>
            <button onClick={() => changeMonth(1)} className="calendar-nav-button" aria-label="Proximo mes">›</button>
          </div>
        </div>
        <div className="calendar-weekdays">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="calendar-grid">
          {days.map((date) => {
            const dateKey = toDateInput(date);
            const dayEvents = data.calendarEvents.filter((item) => item.eventDate === dateKey);
            const outsideMonth = date.getMonth() !== month.getMonth();
            const selected = dateKey === selectedDate;
            const isToday = dateKey === today;
            const nextEvent = dayEvents[0];
          return (
            <button key={dateKey} onClick={() => selectDate(dateKey)} className={cn("calendar-day", outsideMonth && "calendar-day-muted", selected && "calendar-day-selected", isToday && "calendar-day-today")}>
              <span>{date.getDate()}</span>
              {nextEvent ? <i style={{ backgroundColor: nextEvent.color }} /> : null}
              {dayEvents.length > 1 ? <small>{dayEvents.length}</small> : null}
            </button>
          );
        })}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle title={selectedDateTitle(selectedDate)} subtitle={selectedEvents.length ? `${selectedEvents.length} agendados` : "Nenhum evento nesta data."} />
          <button onClick={() => setShowEventModal(true)} className="mini-button"><Plus size={16} /> Evento</button>
        </div>
        {selectedEvents.map((event) => (
          <Row
            key={event.id}
            title={event.title}
            subtitle={`${event.eventTime ?? "--:--"} - ${event.eventType}`}
            left={<span className="event-color-dot" style={{ backgroundColor: event.color }} />}
            right={<IconButton onClick={() => actions.deleteEvent(event.id)} icon={Trash2} label="Excluir evento" />}
          />
        ))}
      </Card>

      {showEventModal ? (
        <div className="modal-backdrop-blur fixed inset-0 z-50 grid place-items-center bg-black/70 p-3">
          <Card className="event-modal-card w-full max-w-[430px] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <SectionTitle title="Criar evento" subtitle={selectedDateTitle(selectedDate)} />
              <button onClick={() => setShowEventModal(false)} className="text-sm text-white/50">Fechar</button>
            </div>
            <div className="calendar-form-grid">
              <TextInput label="Evento" value={eventForm.title} onChange={(title) => setEventForm((current) => ({ ...current, title }))} />
              <SelectInput label="Tipo" value={eventForm.eventType} options={["Conta", "Moto", "Lazer", "Saude", "Estudos", "Outro"]} onChange={(eventType) => setEventForm((current) => ({ ...current, eventType }))} />
              <TimeInput label="Horario" value={eventForm.eventTime} onChange={(eventTime) => setEventForm((current) => ({ ...current, eventTime }))} />
              <ColorInput label="Cor" value={eventForm.color} onChange={(color) => setEventForm((current) => ({ ...current, color }))} />
            </div>
            <button onClick={addCalendarEvent} className="primary-button"><Plus size={18} /> Criar evento</button>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function ObjetivosScreen({ data, actions, setDraft, openDetail }: ScreenProps) {
  return (
    <div className="space-y-4">
      <button onClick={() => setDraft("goal")} className="primary-button"><Plus size={18} /> Novo objetivo</button>
      {data.goals.map((goal, index) => {
        const Icon = goalIcons[index % goalIcons.length];
        const percent = goalPercent(goal);
        return (
          <Card key={goal.id} onClick={() => openDetail?.({ title: goal.name, description: "Detalhes da meta e progresso atual.", rows: [{ label: "Atual", value: brl.format(goal.currentAmount) }, { label: "Meta", value: brl.format(goal.targetAmount) }, { label: "Progresso", value: `${percent}%` }, { label: "Prazo", value: goal.deadline ? dateBR(goal.deadline) : "Sem prazo" }] })}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet/18 text-purple-200"><Icon size={20} /></div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{goal.name}</p>
                  <p className="mt-1 text-xs text-white/45">{brl.format(goal.currentAmount)} de {brl.format(goal.targetAmount)}</p>
                </div>
              </div>
              <IconButton onClick={() => actions.deleteGoal(goal.id)} icon={Trash2} label="Excluir meta" />
            </div>
            <Progress value={percent} className="mt-4" tone="violet" />
            <div className="mt-3 flex gap-2">
              <button onClick={() => actions.addGoalMoney(goal.id, 50)} className="mini-button">+ R$ 50</button>
              <button onClick={() => actions.addGoalMoney(goal.id, 100)} className="mini-button">+ R$ 100</button>
              <Badge tone="violet">{percent}%</Badge>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function InsightsScreen({ metrics, openDetail }: { data: AppData; metrics: Metrics; openDetail?: (info: DetailInfo) => void }) {
  return (
    <div className="space-y-4">
      {[
        `Seu potencial de economia este mes e ${brl.format(Math.max(0, metrics.projected - metrics.available))}.`,
        `Seu limite diario seguro e ${brl.format(metrics.dailyLimit)}.`,
        `${brl.format(100)} economizados viram aproximadamente ${metrics.kmPer100} km de moto.`,
        metrics.budgetUsed > 85 ? "Seu orcamento esta perto do limite." : "Voce esta dentro do orcamento geral.",
      ].map((item) => <Card key={item} onClick={() => openDetail?.({ title: "Insight", description: item, rows: [{ label: "Disponivel", value: brl.format(metrics.available) }, { label: "Limite diario", value: brl.format(metrics.dailyLimit) }, { label: "Orcamento usado", value: `${Math.round(metrics.budgetUsed)}%` }] })}><p className="text-sm leading-6 text-white/70">{item}</p></Card>)}
    </div>
  );
}

function ConquistasScreen({ data, actions }: ScreenProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {data.achievements.map((item) => (
        <button key={item.id} onClick={() => actions.toggleAchievement(item.id)} className="text-left">
          <Card className={cn("text-center", item.completed ? "border-violet/35 bg-violet/12" : "opacity-60")}>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/8 text-purple-200"><Trophy size={25} /></div>
            <p className="mt-3 text-sm font-semibold">{item.title}</p>
            <p className="mt-1 text-xs text-white/45">{item.completed ? "Concluida" : "Em progresso"}</p>
          </Card>
        </button>
      ))}
    </div>
  );
}

function MaisScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  const items: Array<{ screen: Screen; label: string }> = [
    { screen: "planejamento", label: "Planejamento Mensal" },
    { screen: "abastecimentos", label: "Abastecimentos" },
    { screen: "previsor", label: "Previsor de Tanques" },
    { screen: "roles", label: "Diario de Roles" },
    { screen: "calendario", label: "Calendario" },
    { screen: "insights", label: "Insights" },
    { screen: "conquistas", label: "Conquistas" },
    { screen: "configuracoes", label: "Configuracoes" },
  ];
  return (
    <Card className="space-y-2">
      {items.map((item) => <button key={item.screen} onClick={() => setScreen(item.screen)} className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-3 py-3 text-left text-sm">{item.label}<ChevronRight size={17} className="text-white/40" /></button>)}
    </Card>
  );
}

function ConfiguracoesScreen({ data, actions, reset }: ScreenProps & { reset: () => void }) {
  return (
    <div className="space-y-5">
      <Card className="settings-card space-y-4">
        <div className="flex items-start justify-between gap-3">
          <SectionTitle title="Configuracoes financeiras" />
          <button onClick={reset} className="settings-reset-button" aria-label="Limpar campos">
            <RotateCcw size={17} />
          </button>
        </div>
        <div className="settings-grid">
          <MoneyInput label="Salario" value={data.settings.salary} onChange={(salary) => actions.setData((current) => ({ ...current, settings: { ...current.settings, salary } }))} />
          <MoneyInput label="Renda extra" value={data.settings.extraIncome} onChange={(extraIncome) => actions.setData((current) => ({ ...current, settings: { ...current.settings, extraIncome } }))} />
          <MoneyInput label="Meta de economia" value={data.settings.savingsGoal} onChange={(savingsGoal) => actions.setData((current) => ({ ...current, settings: { ...current.settings, savingsGoal } }))} />
          <MoneyInput label="Corte diario alimentacao" value={data.settings.dailyFoodCut} onChange={(dailyFoodCut) => actions.setData((current) => ({ ...current, settings: { ...current.settings, dailyFoodCut } }))} />
        </div>
      </Card>
    </div>
  );
}

function ConfirmDialog({ action, close }: { action: ConfirmAction; close: () => void }) {
  if (!action) return null;

  function confirm() {
    action?.onConfirm();
    close();
  }

  return (
    <div className="modal-backdrop-blur fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 sm:place-items-center">
      <Card className="confirm-card w-full max-w-[360px] space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{action.title}</h2>
          <p className="mt-1 text-sm leading-5 text-white/55">{action.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={close} className="secondary-button">Cancelar</button>
          <button onClick={confirm} className={action.tone === "danger" ? "danger-button" : "primary-button"}>
            {action.tone === "danger" ? <Trash2 size={17} /> : <RotateCcw size={17} />}
            {action.confirmLabel}
          </button>
        </div>
      </Card>
    </div>
  );
}

function DetailDialog({ info, close }: { info: DetailInfo; close: () => void }) {
  if (!info) return null;

  return (
    <div className="modal-backdrop-blur fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 sm:place-items-center">
      <Card className="detail-card w-full max-w-[430px] space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{info.title}</h2>
            {info.description ? <p className="mt-1 text-sm leading-5 text-white/58">{info.description}</p> : null}
          </div>
          <button onClick={close} className="text-sm text-white/50">Fechar</button>
        </div>
        {info.rows?.length ? (
          <div className="detail-grid">
            {info.rows.map((row) => (
              <div key={`${row.label}-${row.value}`} className="detail-row">
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        ) : null}
        {info.actions?.length ? (
          <div className="grid gap-2">
            {info.actions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  action.onClick();
                  close();
                }}
                className={action.tone === "secondary" ? "secondary-button" : "primary-button"}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function EventAlertDialog({ event, close }: { event: CalendarEvent | null; close: () => void }) {
  if (!event) return null;

  return (
    <div className="modal-backdrop-blur fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 sm:place-items-center">
      <Card className="confirm-card w-full max-w-[380px] space-y-4">
        <div className="flex items-start gap-3">
          <div className="event-alert-icon" style={{ backgroundColor: `${event.color}33`, color: event.color }}>
            <CalendarDays size={22} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Evento agora</h2>
            <p className="mt-1 text-sm leading-5 text-white/60">{event.title}</p>
            <p className="mt-2 text-xs font-semibold text-white/45">{dateBR(event.eventDate)} as {event.eventTime}</p>
          </div>
        </div>
        <button onClick={close} className="primary-button">Entendi</button>
      </Card>
    </div>
  );
}

function Modal({ kind, close, actions }: { kind: DraftKind; close: () => void; actions: Actions }) {
  if (!kind) return null;
  return (
    <div className="modal-backdrop-blur fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 sm:place-items-center">
      <Card className="w-full max-w-[430px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{modalTitle(kind)}</h2>
          <button onClick={close} className="text-sm text-white/50">Fechar</button>
        </div>
        <FormForModal kind={kind} close={close} actions={actions} />
      </Card>
    </div>
  );
}

function FormForModal({ kind, close, actions }: { kind: DraftKind; close: () => void; actions: Actions }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<Record<string, string>>({
    description: "", category: "Moto", amount: "100", type: "expense", date: today,
    name: "", dueDay: "15", status: "Proximo", target: "1000", current: "0",
    station: "", liters: "10", odometer: "28500", destination: "", distance: "100", cost: "30", time: "09:00", color: "#7C3AED",
  });
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  function submit() {
    if (kind === "transaction") actions.addTransaction({ description: form.description || "Lancamento", category: form.category, amount: num(form.amount), type: form.type as TransactionType, occurredAt: form.date });
    if (kind === "bill") actions.addBill({ name: form.name || "Nova conta", amount: num(form.amount), dueDay: num(form.dueDay), status: form.status as BillStatus, category: form.category });
    if (kind === "goal") actions.addGoal({ name: form.name || "Nova meta", currentAmount: num(form.current), targetAmount: num(form.target), deadline: form.date });
    if (kind === "fuel") actions.addFuel({ filledAt: form.date, station: form.station || "Posto", liters: num(form.liters), amount: num(form.amount), odometer: num(form.odometer) });
    if (kind === "ride") actions.addRide({ destination: form.destination || "Role", rideDate: form.date, distanceKm: num(form.distance), cost: num(form.cost), city: form.destination || "Cidade" });
    if (kind === "event") actions.addEvent({ title: form.name || "Evento", eventDate: form.date, eventTime: form.time, eventType: form.category, color: form.color });
    close();
  }

  return (
    <div className="space-y-3">
      {["transaction"].includes(kind ?? "") && <><TextInput label="Descricao" value={form.description} onChange={(v) => update("description", v)} /><TextInput label="Categoria" value={form.category} onChange={(v) => update("category", v)} /><SelectInput label="Tipo" value={form.type} options={[{ value: "expense", label: "Despesa" }, { value: "income", label: "Receita" }]} onChange={(v) => update("type", v)} /></>}
      {["bill", "goal", "event"].includes(kind ?? "") && <TextInput label="Nome" value={form.name} onChange={(v) => update("name", v)} />}
      {kind === "bill" && <><NumberInput label="Dia de vencimento" value={num(form.dueDay)} min={1} max={31} step={1} inputMode="numeric" onChange={(v) => update("dueDay", String(v))} /><SelectInput label="Status" value={form.status} options={["Proximo", "Pago", "Atrasado"]} onChange={(v) => update("status", v)} /></>}
      {kind === "goal" && <><MoneyInput label="Valor atual" value={num(form.current)} onChange={(v) => update("current", String(v))} /><MoneyInput label="Meta final" value={num(form.target)} onChange={(v) => update("target", String(v))} /></>}
      {kind === "fuel" && <><TextInput label="Posto" value={form.station} onChange={(v) => update("station", v)} /><NumberInput label="Litros" value={num(form.liters)} min={0} step={0.1} inputMode="decimal" onChange={(v) => update("liters", String(v))} /><NumberInput label="Quilometragem" value={num(form.odometer)} min={0} step={1} inputMode="numeric" onChange={(v) => update("odometer", String(v))} /></>}
      {kind === "ride" && <><TextInput label="Destino" value={form.destination} onChange={(v) => update("destination", v)} /><NumberInput label="Distancia km" value={num(form.distance)} min={0} step={1} inputMode="numeric" onChange={(v) => update("distance", String(v))} /><MoneyInput label="Custo" value={num(form.cost)} onChange={(v) => update("cost", String(v))} /></>}
      {kind === "event" && <><TextInput label="Tipo" value={form.category} onChange={(v) => update("category", v)} /><TimeInput label="Horario" value={form.time} onChange={(v) => update("time", v)} /><ColorInput label="Cor" value={form.color} onChange={(v) => update("color", v)} /></>}
      {["transaction", "bill", "fuel"].includes(kind ?? "") && <MoneyInput label="Valor" value={num(form.amount)} onChange={(v) => update("amount", String(v))} />}
      {["transaction", "goal", "fuel", "ride", "event"].includes(kind ?? "") && <DateInput label="Data" value={form.date} onChange={(v) => update("date", v)} />}
      <button onClick={submit} className="primary-button"><Save size={18} /> Salvar</button>
    </div>
  );
}

type Metrics = ReturnType<typeof getMetrics>;
type Actions = {
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  addTransaction: (item: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addBill: (item: Omit<Bill, "id">) => void;
  updateBillStatus: (billId: string, status: BillStatus) => void;
  deleteBill: (billId: string) => void;
  addGoal: (item: Omit<Goal, "id">) => void;
  addGoalMoney: (goalId: string, amount: number) => void;
  deleteGoal: (goalId: string) => void;
  addFuel: (item: Omit<FuelLog, "id">) => void;
  deleteFuel: (fuelId: string) => void;
  addRide: (item: Omit<Ride, "id">) => void;
  deleteRide: (rideId: string) => void;
  addEvent: (item: Omit<CalendarEvent, "id">) => void;
  deleteEvent: (eventId: string) => void;
  toggleAchievement: (achievementId: string) => void;
};
type ScreenProps = { data: AppData; metrics: Metrics; actions: Actions; setDraft: (kind: DraftKind) => void; openDetail?: (info: DetailInfo) => void };

function getMetrics(data: AppData) {
  const transactionIncome = sum(data.transactions.filter((item) => item.type === "income").map((item) => item.amount));
  const income = Math.max(transactionIncome, data.settings.salary + data.settings.extraIncome);
  const transactionExpenses = sum(data.transactions.filter((item) => item.type === "expense").map((item) => item.amount));
  const budgetExpenses = sum(data.budgets.map((item) => item.spent));
  const expenses = Math.max(transactionExpenses, budgetExpenses);
  const available = income - expenses;
  const paidBills = sum(data.bills.filter((bill) => bill.status === "Pago").map((bill) => bill.amount));
  const openBills = sum(data.bills.filter((bill) => bill.status !== "Pago").map((bill) => bill.amount));
  const projected = available - openBills + Math.max(0, data.settings.savingsGoal - paidBills * 0.05);
  const daysLeft = Math.max(1, daysInMonth(new Date()) - new Date().getDate());
  const dailyLimit = Math.max(0, available / daysLeft);
  const fullTankRange = Math.round(data.moto.averageKmL * data.moto.tankLiters);
  const costPerKm = data.moto.fuelPrice / data.moto.averageKmL;
  const possibleKm = Math.max(0, Math.round(available / costPerKm));
  const tanks = Math.max(0, available / (data.moto.fuelPrice * data.moto.tankLiters));
  const survivalDays = Math.max(0, Math.floor(available / Math.max(1, expenses / 30)));
  const fuelSpend = sum(data.fuelLogs.map((item) => item.amount));
  const rideKm = Math.round(sum(data.rides.map((item) => item.distanceKm)));
  const nextOilKm = Math.max(0, data.moto.nextOilChangeKm - data.moto.odometer);
  const budgetLimit = sum(data.budgets.map((item) => item.limit));
  const budgetUsed = budgetLimit ? (sum(data.budgets.map((item) => item.spent)) / budgetLimit) * 100 : 0;
  const food = data.budgets.find((item) => item.category === "Alimentacao");
  return {
    income, expenses, available, saved: Math.max(0, income - expenses - openBills), projected, afterBills: available - openBills,
    daysLeft, dailyLimit, fullTankRange, costPerKm, possibleKm, tanks, survivalDays, fuelSpend, rideKm, nextOilKm,
    nextFuelKm: Math.round(fullTankRange * 0.68), budgetUsed, foodBudgetUsed: food ? (food.spent / food.limit) * 100 : 0,
    kmPer100: Math.round(100 / costPerKm),
    spark: [
      { d: "01", v: income - expenses * 0.25 },
      { d: "10", v: income - expenses * 0.5 },
      { d: "20", v: available },
      { d: "30", v: projected },
    ],
  };
}

function SmallStat({ icon: Icon, label, value, tone, onClick }: { icon: React.ElementType; label: string; value: string; tone: "violet" | "blue" | "green" | "red"; onClick?: () => void }) {
  const toneClass = { violet: "text-purple-200 bg-violet/16", blue: "text-blue-200 bg-electric/16", green: "text-green-200 bg-success/16", red: "text-red-200 bg-danger/16" };
  return <Card onClick={onClick} className="metric-card p-3"><div className={cn("mb-3 grid h-9 w-9 place-items-center rounded-2xl", toneClass[tone])}><Icon size={17} /></div><p className="text-[11px] text-white/45">{label}</p><p className="mt-1 text-sm font-semibold leading-tight">{value}</p></Card>;
}

function Metric({ label, value, positive, negative }: { label: string; value: string; positive?: boolean; negative?: boolean }) {
  return <div className="rounded-2xl bg-white/10 p-2"><p className="text-[10px] text-white/55">{label}</p><p className={cn("mt-1 font-semibold", positive && "text-green-200", negative && "text-red-100")}>{value}</p></div>;
}

function SmallText({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/6 p-3"><p className="text-[11px] text-white/42">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}

function Row({ title, subtitle, left, right }: { title: string; subtitle?: string; left?: React.ReactNode; right?: React.ReactNode }) {
  return <div className="interactive-row flex items-center justify-between gap-3 rounded-2xl bg-white/5 p-3"><div className="flex min-w-0 items-center gap-3">{left ? <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white/8 text-white/70">{left}</div> : null}<div className="min-w-0"><p className="truncate text-sm font-medium">{title}</p>{subtitle ? <p className="mt-0.5 truncate text-xs text-white/42">{subtitle}</p> : null}</div></div><div className="shrink-0">{right}</div></div>;
}

function IconButton({ onClick, icon: Icon, label }: { onClick: () => void; icon: React.ElementType; label: string }) {
  return <button onClick={(event) => { event.stopPropagation(); onClick(); }} aria-label={label} className="grid h-8 w-8 place-items-center rounded-xl bg-white/7 text-white/50"><Icon size={15} /></button>;
}

function TextInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: React.HTMLInputTypeAttribute }) {
  return <label className="form-label">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="form-input" /></label>;
}

type NumericInputMode = "numeric" | "decimal";

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  inputMode,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  inputMode?: NumericInputMode;
}) {
  const keyboardMode = inputMode ?? (Number.isInteger(step) ? "numeric" : "decimal");

  return (
    <label className="form-label">
      {label}
      <input type="number" inputMode={keyboardMode} enterKeyHint="done" min={min} max={max} step={step} value={value} onChange={(event) => onChange(num(event.target.value))} className="form-input" />
    </label>
  );
}

function MoneyInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="form-label">
      {label}
      <span className="money-input-wrap">
        <span className="money-prefix">R$</span>
        <input type="number" inputMode="decimal" enterKeyHint="done" min="0" step="0.01" value={value} onChange={(event) => onChange(num(event.target.value))} className="form-input money-input" />
      </span>
    </label>
  );
}

type SelectOption = string | { value: string; label: string };

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: SelectOption[]; onChange: (value: string) => void }) {
  return (
    <label className="form-label">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="form-input form-select">
        {options.map((item) => {
          const option = typeof item === "string" ? { value: item, label: item } : item;
          return <option key={option.value} value={option.value}>{option.label}</option>;
        })}
      </select>
    </label>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="form-label">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="form-input" /></label>;
}

function TimeInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="form-label">{label}<input type="time" value={value} onChange={(event) => onChange(event.target.value)} className="form-input" /></label>;
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="form-label">
      {label}
      <span className="color-input-wrap">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="color-input" />
        <span className="color-value">{value}</span>
      </span>
    </label>
  );
}

function MoneyInline({ value, onChange, ariaLabel }: { value: number; onChange: (value: number) => void; ariaLabel: string }) {
  return (
    <span className="inline-money-wrap">
      <span>R$</span>
      <input aria-label={ariaLabel} value={value} onChange={(event) => onChange(num(event.target.value))} type="number" inputMode="decimal" enterKeyHint="done" min={0} step={0.01} className="form-input inline-number-input" />
    </span>
  );
}

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function num(value: string | number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function goalPercent(goal: Goal) {
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

function dateBR(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function selectedDateTitle(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

function monthTitle(date: Date) {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calendarDays(month: Date) {
  const first = startOfMonth(month);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function eventDateTime(event: CalendarEvent) {
  return new Date(`${event.eventDate}T${event.eventTime ?? "23:59"}:00`);
}

function getDismissedEventAlerts() {
  try {
    const stored = localStorage.getItem(DISMISSED_EVENT_ALERTS_KEY);
    return new Set<string>(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set<string>();
  }
}

function nextStatus(status: BillStatus): BillStatus {
  if (status === "Proximo") return "Pago";
  if (status === "Pago") return "Atrasado";
  return "Proximo";
}

function modalTitle(kind: DraftKind) {
  const titles: Record<Exclude<DraftKind, null>, string> = {
    transaction: "Nova transacao",
    bill: "Nova conta",
    goal: "Novo objetivo",
    fuel: "Novo abastecimento",
    ride: "Novo role",
    event: "Novo evento",
  };
  return kind ? titles[kind] : "";
}

function screenTitle(screen: Screen) {
  const titles: Record<Screen, string> = {
    home: "Meu Mes",
    financas: "Financas",
    moto: "Moto",
    objetivos: "Objetivos",
    mais: "Mais",
    planejamento: "Planejamento",
    abastecimentos: "Abastecimentos",
    previsor: "Previsor",
    roles: "Diario de Roles",
    calendario: "Calendario",
    insights: "Insights",
    conquistas: "Conquistas",
    configuracoes: "Configuracoes",
  };
  return titles[screen];
}
