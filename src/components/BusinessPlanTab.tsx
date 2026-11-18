import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Coins,
  Compass,
  FileSpreadsheet,
  FileText,
  Flag,
  Layers,
  Rocket,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  BusinessInputs,
  Currency,
  FinancialResults,
  Language,
} from '../types/business';
import { TRANSLATIONS } from '../data/translations';
import {
  calculateFinancials,
  formatUzs,
  getUzbekistanLegalRoadmap,
  USD_RATE_UZS,
} from '../utils/calculations';
import { exportFinancialModelCsv } from '../utils/exportCsv';

interface BusinessPlanTabProps {
  lang: Language;
  currency: Currency;
  inputs: BusinessInputs;
  results: FinancialResults;
  onOpenOwnerPlanPdf?: () => void;
}

type ScenarioId = 'base' | 'optimistic' | 'stress';
type HorizonMode = 'auto' | '12' | '24' | '36';

export const BusinessPlanTab: React.FC<BusinessPlanTabProps> = ({
  lang,
  currency,
  inputs,
  results,
  onOpenOwnerPlanPdf,
}) => {
  const t = TRANSLATIONS[lang];
  const [scenario, setScenario] = useState<ScenarioId>('base');
  const [horizonMode, setHorizonMode] = useState<HorizonMode>('auto');

  const simInputs = useMemo<BusinessInputs>(() => {
    if (scenario === 'optimistic') {
      return {
        ...inputs,
        expectedMonthlyRevenueUzs: Math.round(
          inputs.expectedMonthlyRevenueUzs * 1.2
        ),
      };
    }
    if (scenario === 'stress') {
      return {
        ...inputs,
        expectedMonthlyRevenueUzs: Math.round(
          inputs.expectedMonthlyRevenueUzs * 0.8
        ),
        cogsPercent: Math.min(85, inputs.cogsPercent + 5),
      };
    }
    return inputs;
  }, [inputs, scenario]);

  const simResults = useMemo<FinancialResults>(() => {
    if (scenario === 'base') return results;
    return calculateFinancials(simInputs, currency);
  }, [scenario, simInputs, results, currency]);

  const legalRoadmap = useMemo(
    () => getUzbekistanLegalRoadmap(simInputs, simResults, lang, currency),
    [simInputs, simResults, lang, currency]
  );

  const profitDelta = simResults.netMonthlyProfitUzs - results.netMonthlyProfitUzs;

  const isUsd = currency === 'USD';
  const unitDivisor = isUsd ? USD_RATE_UZS * 1000 : 1_000_000;
  const axisSuffix = isUsd ? 'k' : 'M';
  const unitLabel = isUsd
    ? lang === 'ru'
      ? 'тыс. $'
      : 'ming $'
    : t.mlnUzsUnit;

  const autoHorizonCount =
    simResults.paybackMonths > 12
      ? Math.min(60, simResults.paybackMonths + 4)
      : 12;
  const activeMonthsCount =
    horizonMode === 'auto' ? autoHorizonCount : Number(horizonMode);
  const extendedSource =
    simResults.cashflowExtended && simResults.cashflowExtended.length > 0
      ? simResults.cashflowExtended
      : simResults.cashflow12Months;
  const activeCashflowRows = extendedSource.slice(0, activeMonthsCount);
  const breakEvenVisibleInHorizon =
    simResults.breakEvenMonth !== null &&
    simResults.breakEvenMonth <= activeMonthsCount;

  const chartData = activeCashflowRows.map((item) => ({
    month: item.month,
    revenueVal: Number((item.monthlyRevenue / unitDivisor).toFixed(1)),
    expensesVal: Number((item.monthlyExpenses / unitDivisor).toFixed(1)),
    netVal: Number((item.monthlyNet / unitDivisor).toFixed(1)),
    cumulativeVal: Number((item.cumulativeCashflow / unitDivisor).toFixed(1)),
  }));

  const capexRows = [
    {
      label: `${t.businessPlanTab.capexEquipment} (${simResults.capex.equipmentPercent}%)`,
      value: simResults.capex.equipmentUzs,
      percent: simResults.capex.equipmentPercent,
      color: 'bg-emerald-600',
    },
    {
      label: `${t.businessPlanTab.capexRenovation} (${simResults.capex.renovationPercent}%)`,
      value: simResults.capex.renovationUzs,
      percent: simResults.capex.renovationPercent,
      color: 'bg-indigo-600',
    },
    {
      label: `${t.businessPlanTab.capexInventory} (${simResults.capex.inventoryPercent}%)`,
      value: simResults.capex.inventoryMarketingUzs,
      percent: simResults.capex.inventoryPercent,
      color: 'bg-amber-500',
    },
    {
      label: `${t.businessPlanTab.capexReserve} (${simResults.capex.reservePercent}%)`,
      value: simResults.capex.reserveRegistrationUzs,
      percent: simResults.capex.reservePercent,
      color: 'bg-teal-500',
    },
  ];

  const opexRows = [
    {
      label: t.businessPlanTab.opexRent,
      value: simResults.opex.rentUzs,
    },
    {
      label: `${t.businessPlanTab.opexPayroll} (${simInputs.staffCount} ${t.peopleUnit})`,
      value: simResults.opex.payrollGrossUzs,
    },
    {
      label: `${t.businessPlanTab.opexCogs} (${simInputs.cogsPercent}%)`,
      value: simResults.opex.cogsUzs,
    },
    {
      label: t.businessPlanTab.opexUtilities,
      value: simResults.opex.utilitiesAndMarketingUzs,
    },
    {
      label: `${t.businessPlanTab.opexTax} (${
        lang === 'ru'
          ? simResults.activeTaxRegime.nameRu
          : simResults.activeTaxRegime.nameUz
      })`,
      value: simResults.activeTaxRegime.monthlyTaxUzs,
    },
    {
      label: `${t.businessPlanTab.opexLoan} (${simResults.selectedBankProgramResult.annualRatePercent}%)`,
      value: simResults.selectedBankProgramResult.monthlyPaymentUzs,
    },
  ];

  const revPerSqmUzs = Math.round(
    simInputs.expectedMonthlyRevenueUzs / Math.max(1, simInputs.areaSqm)
  );
  const revPerStaffUzs = Math.round(
    simInputs.expectedMonthlyRevenueUzs / Math.max(1, simInputs.staffCount)
  );
  const netMarginPercent =
    simInputs.expectedMonthlyRevenueUzs > 0
      ? Math.round(
          (simResults.netMonthlyProfitUzs / simInputs.expectedMonthlyRevenueUzs) *
            100
        )
      : 0;
  const month1RevUzs =
    simResults.cashflow12Months[0]?.monthlyRevenue ??
    Math.round(simInputs.expectedMonthlyRevenueUzs * 0.65);
  const month12CumUzs =
    simResults.cashflow12Months[11]?.cumulativeCashflow ?? 0;
  const paybackTargetMonth =
    simResults.paybackMonths > 0 ? simResults.paybackMonths : 12;

  const projectKpis = [
    {
      label: lang === 'ru' ? 'Средний чек' : "O'rtacha chek",
      value: formatUzs(simResults.estimatedAvgCheckUzs, lang, currency),
      sub: lang === 'ru' ? 'Выручка на 1 клиента' : '1 mijozdan tushum',
      tone: 'text-slate-900',
    },
    {
      label: lang === 'ru' ? 'План потока' : 'Mijozlar oqimi',
      value: `~${simResults.dailyCustomersNeeded} ${
        lang === 'ru' ? 'кл./день' : 'mijoz/kun'
      }`,
      sub: `~${simResults.dailyCustomersNeeded * 30} ${
        lang === 'ru' ? 'чеков/мес' : 'chek/oy'
      }`,
      tone: 'text-indigo-700',
    },
    {
      label: lang === 'ru' ? 'Точка безубыточности' : 'Zararsizlik chegarasi',
      value: `~${simResults.breakEvenDailyCustomers} ${
        lang === 'ru' ? 'кл./день' : 'mijoz/kun'
      }`,
      sub: `${formatUzs(simResults.breakEvenMonthlyRevenueUzs, lang, currency)}/${
        lang === 'ru' ? 'мес' : 'oy'
      }`,
      tone: 'text-amber-700',
    },
    {
      label:
        lang === 'ru' ? 'Эффективность площади' : 'Maydon samaradorligi',
      value: `${formatUzs(revPerSqmUzs, lang, currency)}/${t.sqmUnit}`,
      sub: `${simInputs.areaSqm} ${t.sqmUnit}`,
      tone: 'text-slate-900',
    },
    {
      label:
        lang === 'ru' ? 'Выручка на 1 сотрудника' : '1 xodimga tushum',
      value: `${formatUzs(revPerStaffUzs, lang, currency)}`,
      sub: `${simInputs.staffCount} ${t.peopleUnit}`,
      tone: 'text-slate-900',
    },
    {
      label: lang === 'ru' ? 'Чистая маржа и DSCR' : 'Sof marja va DSCR',
      value: `${netMarginPercent}%`,
      sub:
        simInputs.loanAmountUzs > 0
          ? `DSCR ${simResults.dscr.toFixed(2)}x`
          : lang === 'ru'
          ? 'Без кредита'
          : 'Kreditsiz',
      tone: netMarginPercent >= 10 ? 'text-emerald-700' : 'text-amber-700',
    },
  ];

  const projectMilestones = [
    {
      phase: lang === 'ru' ? 'Веха 1 • Месяц 1' : 'Bosqich 1 • 1-oy',
      title:
        lang === 'ru'
          ? 'Регистрация, запуск точки и освоение CAPEX'
          : "Ro'yxatdan o'tish, ishga tushirish va CAPEX",
      details:
        lang === 'ru'
          ? `Оформление (${simResults.activeTaxRegime.nameRu}), аренда ${simInputs.areaSqm} м², найм ${simInputs.staffCount} сотр. и закупка оснащения на ${formatUzs(simResults.capex.totalInvestmentUzs, lang, currency)}.`
          : `Rasmiylashtirish (${simResults.activeTaxRegime.nameUz}), ${simInputs.areaSqm} m² ijara, ${simInputs.staffCount} xodim va ${formatUzs(simResults.capex.totalInvestmentUzs, lang, currency)} sarmoya.`,
      kpiTarget:
        lang === 'ru'
          ? `KPI старта: 65% мощности (${formatUzs(month1RevUzs, lang, currency)}/мес)`
          : `Start KPI: 65% quvvat (${formatUzs(month1RevUzs, lang, currency)}/oy)`,
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    {
      phase: lang === 'ru' ? 'Веха 2 • Месяцы 2–3' : 'Bosqich 2 • 2–3-oylar',
      title:
        lang === 'ru'
          ? 'Выход в ноль и привлечение потока клиентов'
          : 'Zararsizlik nuqtasiga chiqish va mijozlar jalb qilish',
      details:
        lang === 'ru'
          ? `Запуск рекламы в 2GIS, Telegram и уличной навигации; загрузка вырастает с 80% до 95% (минимум ~${simResults.breakEvenDailyCustomers} кл./день).`
          : `2GIS, Telegram va tashqi reklama orqali mijoz oqimini 80–95% ga oshirish (kamida ~${simResults.breakEvenDailyCustomers} mijoz/kun).`,
      kpiTarget:
        lang === 'ru'
          ? `KPI вехи: выручка >= ${formatUzs(simResults.breakEvenMonthlyRevenueUzs, lang, currency)}/мес`
          : `Bosqich KPI: tushum >= ${formatUzs(simResults.breakEvenMonthlyRevenueUzs, lang, currency)}/oy`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      phase: lang === 'ru' ? 'Веха 3 • Месяцы 4–6' : 'Bosqich 3 • 4–6-oylar',
      title:
        lang === 'ru'
          ? '100% мощности и плановое обслуживание кредита'
          : "100% quvvat va kredit to'lovini barqarorlashtirish",
      details:
        lang === 'ru'
          ? `Стабильный поток ~${simResults.dailyCustomersNeeded} кл./день при среднем чеке ${formatUzs(simResults.estimatedAvgCheckUzs, lang, currency)}; переход от льготного периода к основному графику.`
          : `Kuniga ~${simResults.dailyCustomersNeeded} mijoz va ${formatUzs(simResults.estimatedAvgCheckUzs, lang, currency)} chek bilan barqaror savdo, asosiy kredit jadvaliga o'tish.`,
      kpiTarget:
        lang === 'ru'
          ? `KPI вехи: прибыль ${formatUzs(simResults.netMonthlyProfitUzs, lang, currency)}/мес`
          : `Bosqich KPI: sof foyda ${formatUzs(simResults.netMonthlyProfitUzs, lang, currency)}/oy`,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      phase:
        lang === 'ru'
          ? `Веха 4 • Месяц ${paybackTargetMonth}`
          : `Bosqich 4 • ${paybackTargetMonth}-oy`,
      title:
        lang === 'ru'
          ? 'Полная окупаемость вложений и масштабирование'
          : "Sarmoyani to'liq qoplash va biznesni kengaytirish",
      details:
        lang === 'ru'
          ? `Возврат 100% собственного капитала (${formatUzs(simInputs.ownCapitalUzs, lang, currency)}); накопленный кэш-флоу за 12 мес. составляет ${formatUzs(month12CumUzs, lang, currency)}.`
          : `Shaxsiy kapitalni (${formatUzs(simInputs.ownCapitalUzs, lang, currency)}) 100% qaytarish; 12 oylik jamlanma kesh-flou: ${formatUzs(month12CumUzs, lang, currency)}.`,
      kpiTarget:
        lang === 'ru'
          ? `KPI итога: ROI ${simResults.annualRoiPercent}% годовых`
          : `Yakuniy KPI: yillik ROI ${simResults.annualRoiPercent}%`,
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-up tabular-nums">
      {/* Interactive 3-Scenario Simulator ("Что если?") */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              {lang === 'ru'
                ? 'Симулятор сценариев («Что если?»)'
                : 'Ssenariylar simulyatori («Agar... bo‘lsa»)'}
            </span>
            <span className="text-[11px] text-slate-500">
              {lang === 'ru'
                ? 'Мгновенная проверка устойчивости бизнес-плана при росте или кризисе'
                : "Savdo o'sishi yoki inqiroz holatida biznes-reja barqarorligini tekshiring"}
            </span>
          </div>

          {scenario !== 'base' && (
            <div
              className={`text-xs font-bold px-3 py-1 rounded-xl border shrink-0 whitespace-nowrap ${
                profitDelta >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {lang === 'ru' ? 'Разница прибыли:' : 'Foyda farqi:'}{' '}
              {profitDelta >= 0 ? '+' : ''}
              {formatUzs(profitDelta, lang, currency)}/
              {lang === 'ru' ? 'мес' : 'oy'}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setScenario('base')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              scenario === 'base'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>
              {lang === 'ru' ? 'Базовый план (100%)' : 'Asosiy reja (100%)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setScenario('optimistic')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              scenario === 'optimistic'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>
              {lang === 'ru'
                ? 'Высокий спрос (+20%)'
                : "Yuqori talab (+20%)"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setScenario('stress')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              scenario === 'stress'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50/70 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              {lang === 'ru'
                ? 'Кризис (−20% выручка, +5% сырье)'
                : 'Inqiroz (−20% tushum, +5% xomashyo)'}
            </span>
          </button>
        </div>
      </div>

      {/* Break-Even & Daily Unit Economics 3-Row Responsive Strip */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm grid grid-cols-1 gap-3 card-interactive">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>
                {lang === 'ru'
                  ? 'Точка безубыточности (в ноль)'
                  : 'Zararsizlik nuqtasi (0 ga chiqish)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {lang === 'ru'
                ? `Минимум ~${simResults.breakEvenDailyCustomers} клиентов/день чтобы покрыть все расходы`
                : `Xarajatlarni qoplash uchun kuniga kamida ~${simResults.breakEvenDailyCustomers} ta mijoz`}
            </p>
          </div>
          <div className="text-base font-extrabold text-slate-900 whitespace-nowrap shrink-0">
            {formatUzs(simResults.breakEvenMonthlyRevenueUzs, lang, currency)} /{' '}
            {lang === 'ru' ? 'мес' : 'oy'}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {lang === 'ru'
                  ? 'План продаж на 1 день'
                  : '1 kunlik savdo rejasi'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ~{simResults.dailyCustomersNeeded}{' '}
              {lang === 'ru' ? 'клиентов при чеке' : 'mijoz, o‘rtacha chek'}{' '}
              {formatUzs(simResults.estimatedAvgCheckUzs, lang, currency)}
            </p>
          </div>
          <div className="text-base font-extrabold text-emerald-700 whitespace-nowrap shrink-0">
            {formatUzs(simResults.dailyRevenueUzs, lang, currency)} /{' '}
            {lang === 'ru' ? 'день' : 'kun'}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>
                {lang === 'ru'
                  ? 'Запас финансовой прочности'
                  : 'Moliyaviy xavfsizlik zaxirasi'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {simResults.safetyMarginPercent >= 0
                ? lang === 'ru'
                  ? 'На столько можно потерять выручку без ухода в минус'
                  : 'Zararga kirmasdan tushum shuncha foizga kamayishi mumkin'
                : lang === 'ru'
                ? 'Выручка ниже точки безубыточности'
                : 'Tushum zararsizlik nuqtasidan past'}
            </p>
          </div>
          <div
            className={`text-base font-extrabold whitespace-nowrap shrink-0 ${
              simResults.safetyMarginPercent >= 15
                ? 'text-emerald-700'
                : simResults.safetyMarginPercent >= 0
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}
          >
            {simResults.safetyMarginPercent >= 0 ? '+' : ''}
            {simResults.safetyMarginPercent}%
          </div>
        </div>
      </div>

      {/* Both Visual Charts Stacked Full-Width for Crisp Reading */}
      <div className="grid grid-cols-1 gap-5">
        {/* 1. Extended Payback & Cumulative Cashflow AreaChart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm card-interactive">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                {lang === 'ru'
                  ? `Когда вернутся вложенные деньги (${activeMonthsCount} мес., ${
                      isUsd ? 'тыс. $' : 'млн сум'
                    })`
                  : `Tikilgan pul qachon qaytadi (${activeMonthsCount} oy, ${
                      isUsd ? 'ming $' : "mln so'm"
                    })`}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.businessPlanTab.cumulativeChartSub}
              </p>
            </div>
            {simResults.breakEvenMonth && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-auto whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.businessPlanTab.breakEvenReached} M{simResults.breakEvenMonth}
              </span>
            )}
          </div>

          {/* Horizon Mode Switcher: Auto (Until Break-Even) / 12m / 24m / 36m */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {[
              {
                id: 'auto' as HorizonMode,
                label:
                  lang === 'ru'
                    ? `🎯 До выхода в плюс (${autoHorizonCount} мес.)`
                    : `🎯 Foydaga chiqishgacha (${autoHorizonCount} oy)`,
              },
              {
                id: '12' as HorizonMode,
                label: lang === 'ru' ? '12 мес. (1 год)' : '12 oy (1 yil)',
              },
              {
                id: '24' as HorizonMode,
                label: lang === 'ru' ? '24 мес. (2 года)' : '24 oy (2 yil)',
              },
              {
                id: '36' as HorizonMode,
                label: lang === 'ru' ? '36 мес. (3 года)' : '36 oy (3 yil)',
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setHorizonMode(opt.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all whitespace-nowrap ${
                  horizonMode === opt.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="emeraldFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) =>
                    isUsd ? `$${v}${axisSuffix}` : `${v}${axisSuffix}`
                  }
                />
                <Tooltip
                  formatter={(value: number) => [
                    isUsd ? `$${value}k` : `${value} ${unitLabel}`,
                    t.businessPlanTab.legendCumulative,
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <ReferenceLine
                  y={0}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  label={{
                    value: lang === 'ru' ? '0 (Окупаемость)' : '0 (Qoplash)',
                    fill: '#b45309',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
                {breakEvenVisibleInHorizon && (
                  <ReferenceLine
                    x={`M${simResults.breakEvenMonth}`}
                    stroke="#059669"
                    strokeDasharray="3 3"
                    label={{
                      value:
                        lang === 'ru'
                          ? `В плюс: M${simResults.breakEvenMonth}`
                          : `Foyda: M${simResults.breakEvenMonth}`,
                      fill: '#047857',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="cumulativeVal"
                  name={t.businessPlanTab.legendCumulative}
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#emeraldFlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Monthly Revenue vs Expenses vs Profit BarChart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm card-interactive">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-indigo-600" />
              {lang === 'ru'
                ? `Выручка, расходы и прибыль по месяцам (${
                    isUsd ? 'тыс. $' : 'млн сум'
                  })`
                : `Oylik tushum, xarajatlar va foyda (${
                    isUsd ? 'ming $' : "mln so'm"
                  })`}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.businessPlanTab.revExpChartSub}
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) =>
                    isUsd ? `$${v}${axisSuffix}` : `${v}${axisSuffix}`
                  }
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    isUsd ? `$${value}k` : `${value} ${unitLabel}`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="revenueVal"
                  name={t.businessPlanTab.legendRevenue}
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expensesVal"
                  name={t.businessPlanTab.legendExpenses}
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="netVal"
                  name={t.businessPlanTab.legendNetProfit}
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI & Milestones Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-5 card-interactive">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'ru'
                  ? 'KPI и Milestones (Ключевые показатели и дорожная карта вех)'
                  : "KPI va Milestones (Asosiy ko'rsatkichlar va bosqichlar xaritasi)"}
              </h4>
              <p className="text-xs text-slate-500">
                {lang === 'ru'
                  ? 'Операционные нормативы на единицу площади/персонала и 4 контрольные вехи от старта до окупаемости'
                  : "Maydon va xodim samaradorligi me'yorlari hamda startdan qoplashgacha bo'lgan 4 ta nazorat bosqichi"}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap self-start sm:self-auto">
            {lang === 'ru'
              ? `Срок окупаемости: ${
                  simResults.paybackMonths > 0
                    ? `${simResults.paybackMonths} мес.`
                    : 'более 24 мес.'
                }`
              : `Qoplash muddati: ${
                  simResults.paybackMonths > 0
                    ? `${simResults.paybackMonths} oy`
                    : '24 oydan ortiq'
                }`}
          </span>
        </div>

        {/* 6 Operational & Efficiency KPIs */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2.5">
            {lang === 'ru'
              ? 'Ключевые KPI проекта (Unit-экономика)'
              : 'Loyihaning asosiy KPIlari (Unit-iqtisodiyot)'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projectKpis.map((kpi, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between"
              >
                <span className="text-[11px] font-medium text-slate-500">
                  {kpi.label}
                </span>
                <span
                  className={`text-sm font-extrabold mt-1 whitespace-nowrap ${kpi.tone}`}
                >
                  {kpi.value}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 whitespace-nowrap">
                  {kpi.sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Milestones Timeline */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2.5">
            {lang === 'ru'
              ? 'Контрольные вехи запуска (Milestones M1–M12)'
              : 'Loyihani amalga oshirish bosqichlari (Milestones M1–M12)'}
          </div>
          <div className="grid grid-cols-1 gap-3">
            {projectMilestones.map((ms, idx) => (
              <div
                key={idx}
                className="border border-slate-200/90 rounded-xl p-3.5 bg-gradient-to-br from-white to-slate-50/70 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${ms.badgeClass}`}
                    >
                      {ms.phase}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {ms.title}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {ms.details}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-emerald-700 whitespace-nowrap overflow-x-auto">
                  {ms.kpiTarget}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Entrepreneur Personal Path & Uzbekistan Legislation Roadmap (Separate from Bank Pitch) */}
      <div className="bg-white border border-amber-200/90 rounded-2xl p-5 shadow-sm space-y-5 card-interactive">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                {lang === 'ru'
                  ? 'Для самого предпринимателя • Отдельно от презентации банку'
                  : "Tadbirkorning o'zi uchun • Bank taqdimotidan alohida"}
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'ru'
                  ? `План действий и законы РУз для «${legalRoadmap.businessName}»`
                  : `«${legalRoadmap.businessName}» uchun harakat rejasi va O'zR qonunlari`}
              </h4>
            </div>
          </div>

          {onOpenOwnerPlanPdf && (
            <button
              type="button"
              onClick={onOpenOwnerPlanPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {lang === 'ru'
                  ? 'PDF план предпринимателя'
                  : 'Tadbirkor PDF rejasi'}
              </span>
            </button>
          )}
        </div>

        {/* Legal Basis Strip */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
          <Scale className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900">
              {lang === 'ru'
                ? 'Законодательство Республики Узбекистан (2026): '
                : "O'zbekiston Respublikasi qonunchiligi (2026): "}
            </strong>
            {legalRoadmap.registrationBasis}
          </div>
        </div>

        {/* 5 Mandatory Legal Checklist Cards */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2.5">
            {lang === 'ru'
              ? 'Обязательные правовые требования и порталы РУз под вашу нишу'
              : "Sohangiz uchun majburiy O'zR qonunchilik talablari va portallar"}
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {legalRoadmap.requirements.map((req, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">
                    {req.category}: {req.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                    {req.portalOrAuthority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {req.actionRequired}
                </p>
                <div className="text-[10px] font-medium text-slate-400">
                  {req.lawRef}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6-Step Entrepreneur Path */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2.5">
            {lang === 'ru'
              ? 'Пошаговый маршрут предпринимателя (Шаги 1–6 от Дня 1 до окупаемости)'
              : "Tadbirkorning qadam-baqadam yo'li (1-kundan qoplashgacha)"}
          </div>
          <div className="grid grid-cols-1 gap-3">
            {legalRoadmap.pathSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white whitespace-nowrap">
                      {lang === 'ru'
                        ? `Шаг ${step.stepNumber} • ${step.timeframe}`
                        : `${step.stepNumber}-qadam • ${step.timeframe}`}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {step.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {step.targetKpi}
                  </span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-700">
                  {step.actions.map((act, i) => (
                    <li key={i}>• {act}</li>
                  ))}
                </ul>
                <div className="text-[10px] text-amber-900 bg-amber-50/70 rounded-lg px-2.5 py-1.5 border border-amber-200/70">
                  <strong>
                    {lang === 'ru' ? 'Правовая заметка: ' : 'Huquqiy eslatma: '}
                  </strong>
                  {step.legalNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2 Detailed Breakdown Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Startup Money Breakdown with Colored Progress Bars */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between card-interactive">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  {t.businessPlanTab.capexTitle}
                </h4>
              </div>
              <button
                type="button"
                onClick={() =>
                  exportFinancialModelCsv(simInputs, simResults, lang, currency)
                }
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                title={
                  lang === 'ru'
                    ? 'Скачать финмодель в Excel / CSV'
                    : 'Moliyaviy modelni Excel / CSV ga yuklash'
                }
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel / CSV</span>
              </button>
            </div>

            <div className="space-y-3">
              {capexRows.map((row, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-3"
                >
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-700 font-medium">
                      {row.label}
                    </span>
                    <span className="font-bold text-slate-900 whitespace-nowrap shrink-0">
                      {formatUzs(row.value, lang, currency)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${row.color} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between bg-indigo-50 p-3.5 rounded-xl border border-indigo-200 gap-2">
            <span className="text-xs font-bold text-indigo-900">
              {t.businessPlanTab.capexTotal}
            </span>
            <span className="text-base font-extrabold text-indigo-900 whitespace-nowrap">
              {formatUzs(simResults.capex.totalInvestmentUzs, lang, currency)}
            </span>
          </div>
        </div>

        {/* Monthly Budget & Net Profit Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between card-interactive">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  {t.businessPlanTab.opexTitle}
                </h4>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {isUsd
                  ? lang === 'ru'
                    ? '$/мес'
                    : '$/oy'
                  : t.perMonthUnit}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-2.5 flex items-center justify-between text-xs gap-2">
                <span className="text-slate-600 font-medium">
                  {t.businessPlanTab.legendRevenue}
                </span>
                <span className="font-bold text-indigo-700 shrink-0 whitespace-nowrap">
                  +{formatUzs(simInputs.expectedMonthlyRevenueUzs, lang, currency)}
                </span>
              </div>
              {opexRows.map((row, idx) => (
                <div
                  key={idx}
                  className="py-2.5 flex items-center justify-between text-xs gap-2"
                >
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-semibold text-slate-900 shrink-0 whitespace-nowrap">
                    −{formatUzs(row.value, lang, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between transition-colors duration-300 ${
              simResults.netMonthlyProfitUzs >= 0
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
            }`}
          >
            <span
              className={`text-xs font-bold ${
                simResults.netMonthlyProfitUzs >= 0
                  ? 'text-emerald-900'
                  : 'text-rose-900'
              }`}
            >
              {t.businessPlanTab.opexNetProfit}
            </span>
            <span
              className={`text-base font-extrabold whitespace-nowrap ${
                simResults.netMonthlyProfitUzs >= 0
                  ? 'text-emerald-700'
                  : 'text-rose-700'
              }`}
            >
              {formatUzs(simResults.netMonthlyProfitUzs, lang, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Extended Monthly Detailed Cashflow Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm overflow-x-auto card-interactive">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h4 className="text-sm font-bold text-slate-900">
            {lang === 'ru'
              ? `Подробная таблица по месяцам (М1–М${activeMonthsCount})`
              : `Oylar kesimida batafsil jadval (M1–M${activeMonthsCount})`}
          </h4>
          <button
            type="button"
            onClick={() =>
              exportFinancialModelCsv(simInputs, simResults, lang, currency)
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>
              {lang === 'ru'
                ? 'Скачать финмодель (Excel / CSV)'
                : 'Moliyaviy modelni yuklash (Excel / CSV)'}
            </span>
          </button>
        </div>
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
              <th className="py-2.5 px-1.5">
                {lang === 'ru' ? 'Месяц' : 'Oy'}
              </th>
              <th className="py-2.5 px-1.5">
                {lang === 'ru' ? 'Загрузка' : 'Quvvat'}
              </th>
              <th className="py-2.5 px-1.5 text-right">
                {t.businessPlanTab.legendRevenue}
              </th>
              <th className="py-2.5 px-1.5 text-right">
                {t.businessPlanTab.legendExpenses}
              </th>
              <th className="py-2.5 px-1.5 text-right">
                {t.businessPlanTab.legendNetProfit}
              </th>
              <th className="py-2.5 px-1.5 text-right">
                {t.businessPlanTab.legendCumulative}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeCashflowRows.map((row) => {
              const isBreakEven = simResults.breakEvenMonth === row.monthIndex;
              return (
                <tr
                  key={row.month}
                  className={
                    isBreakEven
                      ? 'bg-emerald-50/80 font-semibold'
                      : 'hover:bg-slate-50'
                  }
                >
                  <td className="py-2 px-1.5 font-semibold text-slate-900 whitespace-nowrap">
                    {row.month}
                    {isBreakEven && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white whitespace-nowrap">
                        {lang === 'ru' ? 'Окупился' : 'Qoplandi'}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-1.5 text-slate-500 whitespace-nowrap">
                    {row.rampUpPercent}%
                  </td>
                  <td className="py-2 px-1.5 text-right text-slate-900 whitespace-nowrap">
                    {formatUzs(row.monthlyRevenue, lang, currency)}
                  </td>
                  <td className="py-2 px-1.5 text-right text-slate-600 whitespace-nowrap">
                    {formatUzs(row.monthlyExpenses, lang, currency)}
                  </td>
                  <td
                    className={`py-2 px-1.5 text-right font-semibold whitespace-nowrap ${
                      row.monthlyNet >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {formatUzs(row.monthlyNet, lang, currency)}
                  </td>
                  <td
                    className={`py-2 px-1.5 text-right font-bold whitespace-nowrap ${
                      row.cumulativeCashflow >= 0
                        ? 'text-emerald-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {formatUzs(row.cumulativeCashflow, lang, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};
