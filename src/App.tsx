import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Clock,
  CreditCard,
  ExternalLink,
  Landmark,
  MapPin,
  Percent,
  PhoneCall,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import {
  BankProgramId,
  BusinessInputs,
  ChatMessage,
  Currency,
  DistrictId,
  Language,
  LegalFormId,
  SavedProject,
  SubscriptionPlanId,
} from './types/business';
import { DEMO_PRESETS } from './data/presets';
import { TASHKENT_DISTRICTS } from './data/tashkentDistricts';
import { TRANSLATIONS } from './data/translations';
import {
  calculateFinancials,
  formatMln,
  formatUzs,
  getBusinessDisplayName,
  USD_RATE_UZS,
} from './utils/calculations';
import {
  askFinancialConsultant,
  buildInitialExecutiveSummary,
  extractAgentActionsFromPrompt,
} from './utils/aiEngine';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { MarketAnalysisTab } from './components/MarketAnalysisTab';
import { BusinessPlanTab } from './components/BusinessPlanTab';
import { TaxCalculatorTab } from './components/TaxCalculatorTab';
import { CreditMatcherTab } from './components/CreditMatcherTab';
import { BankPdfModal, DocMode } from './components/BankPdfModal';
import { PricingModal } from './components/PricingModal';

type ActiveTabId = 'params' | 'businessPlan' | 'credit' | 'taxes' | 'market';

const SAVED_PROJECTS_KEY = 'biznes_maslahatchi_saved_projects';
const PLAN_STORAGE_KEY = 'biznes_maslahatchi_plan';
const ATTEMPTS_STORAGE_KEY = 'biznes_maslahatchi_free_attempts_v3';
const MAX_FREE_ATTEMPTS = 15;

export function App() {
  const [lang, setLang] = useState<Language>('ru');
  const [currency, setCurrency] = useState<Currency>('UZS');
  const [inputs, setInputs] = useState<BusinessInputs>(DEMO_PRESETS[0].inputs);
  const [activeTab, setActiveTab] = useState<ActiveTabId>('params');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfDocMode, setPdfDocMode] = useState<DocMode>('teo');
  const [plan, setPlan] = useState<SubscriptionPlanId>(() => {
    try {
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      return saved === 'pro' ? 'pro' : 'free';
    } catch {
      return 'free';
    }
  });
  const [freeAttemptsLeft, setFreeAttemptsLeft] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
      if (raw !== null) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed) && parsed >= 0) {
          return Math.min(MAX_FREE_ATTEMPTS, Math.round(parsed));
        }
      }
    } catch {
      // ignore localStorage read errors
    }
    return MAX_FREE_ATTEMPTS;
  });
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [limitReachedTrigger, setLimitReachedTrigger] = useState<boolean>(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [lastAiChangesRu, setLastAiChangesRu] = useState<string[]>([]);
  const [lastAiChangesUz, setLastAiChangesUz] = useState<string[]>([]);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_PROJECTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const results = useMemo(
    () => calculateFinancials(inputs, currency),
    [inputs, currency]
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialResults = calculateFinancials(DEMO_PRESETS[0].inputs, 'UZS');
    return [
      {
        id: 'init-1',
        role: 'assistant',
        content: buildInitialExecutiveSummary(
          DEMO_PRESETS[0].inputs,
          initialResults,
          'ru',
          'UZS'
        ),
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ];
  });
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  useEffect(() => {
    const freshSummary = buildInitialExecutiveSummary(
      inputs,
      results,
      lang,
      currency
    );
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'init-1',
            role: 'assistant',
            content: freshSummary,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ];
      }
      return prev.map((m) =>
        m.id === 'init-1' ? { ...m, content: freshSummary } : m
      );
    });
  }, [inputs, results, lang, currency]);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, plan);
    } catch {
      // ignore localStorage write errors
    }
  }, [plan]);

  useEffect(() => {
    try {
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, String(freeAttemptsLeft));
    } catch {
      // ignore localStorage write errors
    }
  }, [freeAttemptsLeft]);

  const consumeFreeAttempt = (): boolean => {
    if (plan === 'pro') return true;
    if (freeAttemptsLeft <= 0) {
      setLimitReachedTrigger(true);
      setIsPricingModalOpen(true);
      return false;
    }
    setFreeAttemptsLeft((prev) => Math.max(0, prev - 1));
    return true;
  };

  const handleOpenPdfModal = (mode: DocMode = 'teo') => {
    if (!consumeFreeAttempt()) return;
    setPdfDocMode(mode);
    setIsPdfModalOpen(true);
  };

  const handleUpdateInputs = (updated: Partial<BusinessInputs>) => {
    setInputs((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!consumeFreeAttempt()) {
      setPendingPrompt(promptText);
      return;
    }
    const extraction = extractAgentActionsFromPrompt(
      promptText,
      inputs,
      lang,
      currency
    );
    const hasActions = Object.keys(extraction.updatedInputs).length > 0;
    const nextInputs = hasActions
      ? { ...inputs, ...extraction.updatedInputs }
      : inputs;
    if (hasActions) {
      setInputs(nextInputs);
      setLastAiChangesRu(extraction.appliedChangesRu);
      setLastAiChangesUz(extraction.appliedChangesUz);
    }
    const nextResults = hasActions
      ? calculateFinancials(nextInputs, currency)
      : results;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    const reply = await askFinancialConsultant(
      promptText,
      nextInputs,
      nextResults,
      lang,
      currency
    );

    const changes =
      lang === 'ru' ? extraction.appliedChangesRu : extraction.appliedChangesUz;
    const agentBanner =
      hasActions && changes.length > 0
        ? `⚡ **${
            lang === 'ru'
              ? 'ИИ-Агент обновил параметры проекта:'
              : 'AI-Agent loyiha parametrlarini yangiladi:'
          }** ${changes.join(' · ')}\n\n`
        : '';

    const aiMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: `${agentBanner}${reply}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsAiLoading(false);
  };

  useEffect(() => {
    if (
      pendingPrompt &&
      !isAiLoading &&
      (plan === 'pro' || freeAttemptsLeft > 0)
    ) {
      const promptToRun = pendingPrompt;
      setPendingPrompt(null);
      void handleSendPrompt(promptToRun);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt, plan, freeAttemptsLeft, isAiLoading]);

  const handleResetFreeAttempts = () => {
    setFreeAttemptsLeft(MAX_FREE_ATTEMPTS);
    setLimitReachedTrigger(false);
  };

  const handleActivatePro = () => {
    setPlan('pro');
    setLimitReachedTrigger(false);
  };

  const handleResetChat = () => {
    const freshSummary = buildInitialExecutiveSummary(
      inputs,
      results,
      lang,
      currency
    );
    setMessages([
      {
        id: 'init-1',
        role: 'assistant',
        content: freshSummary,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const persistProjects = (projects: SavedProject[]) => {
    setSavedProjects(projects);
    try {
      localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(projects));
    } catch {
      // ignore localStorage errors
    }
  };

  const handleSaveCurrentProject = () => {
    const districtObj = TASHKENT_DISTRICTS[inputs.district];
    const districtLabel =
      lang === 'ru'
        ? districtObj.nameRu.replace(' район', '')
        : districtObj.nameUz.replace(' tumani', '');
    const displayName = getBusinessDisplayName(inputs, lang);
    const newProject: SavedProject = {
      id: `proj-${Date.now()}`,
      name: `${displayName} (${districtLabel})`,
      savedAt: new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      inputs: { ...inputs },
      netMonthlyProfitUzs: results.netMonthlyProfitUzs,
    };
    persistProjects([newProject, ...savedProjects].slice(0, 12));
  };

  const handleLoadProject = (proj: SavedProject) => {
    setInputs({ ...proj.inputs });
  };

  const handleDeleteProject = (id: string) => {
    persistProjects(savedProjects.filter((p) => p.id !== id));
  };

  const loanPillText =
    inputs.loanAmountUzs <= 0
      ? lang === 'ru'
        ? 'Без кредита'
        : 'Kreditsiz'
      : results.approvalStatus === 'High'
      ? `${t.statusApproved} (${results.approvalProbabilityPercent}%)`
      : results.approvalStatus === 'Medium'
      ? `${t.statusCollateral} (${results.approvalProbabilityPercent}%)`
      : `${t.statusRisk} (${results.approvalProbabilityPercent}%)`;

  const isProfitable = results.netMonthlyProfitUzs >= 0;

  return (
    <div className="min-h-screen text-slate-900 flex flex-col">
      {/* Polished Glassmorphic Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenPdfModal={() => handleOpenPdfModal('teo')}
        plan={plan}
        freeAttemptsLeft={freeAttemptsLeft}
        maxFreeAttempts={MAX_FREE_ATTEMPTS}
        onOpenPricingModal={() => {
          setLimitReachedTrigger(false);
          setIsPricingModalOpen(true);
        }}
        savedProjects={savedProjects}
        onSaveCurrentProject={handleSaveCurrentProject}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* 52% Left Workspace (KPIs + 5 Step Tabs) | 48% Right Sticky AI Copilot */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 flex-1 flex flex-col lg:flex-row gap-5 items-start no-print">
        {/* LEFT MAIN COLUMN (52% width) */}
        <div className="w-full lg:w-[52%] min-w-0 flex flex-col gap-5">
          {/* Compact Live 4 KPI Summary Strip */}
          <section className="space-y-2.5 animate-fade-up">
            <div className="grid grid-cols-2 gap-3">
              {/* KPI 1: Standout Hero Net Profit Card */}
              <div
                className={`card-interactive min-w-0 rounded-2xl p-4 relative overflow-hidden text-white ${
                  isProfitable
                    ? 'bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 shadow-md shadow-emerald-600/20'
                    : 'bg-gradient-to-br from-rose-600 to-rose-700 shadow-md shadow-rose-600/20'
                }`}
              >
                <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
                <div className="flex items-center justify-between mb-2 relative">
                  <span className="text-xs font-semibold text-white/90">
                    {t.kpiNetProfit}
                  </span>
                  <div className="p-1.5 rounded-lg bg-white/15 text-white border border-white/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-extrabold tracking-tight tabular-nums relative whitespace-nowrap">
                  {formatUzs(results.netMonthlyProfitUzs, lang, currency)}
                </div>
                <p className="text-[11px] text-white/80 mt-1 relative">
                  {t.kpiNetProfitSub}
                </p>
              </div>

              {/* KPI 2: Payback & ROI */}
              <div className="card-interactive bg-white border border-slate-200/90 border-t-[3px] border-t-indigo-500 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500">
                    {t.kpiPayback}
                  </span>
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                {results.paybackMonths > 0 ? (
                  <div className="flex items-baseline gap-2 tabular-nums flex-wrap">
                    <span className="text-lg font-extrabold text-slate-900 whitespace-nowrap">
                      {results.paybackMonths} {t.monthsUnit}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                      ROI {results.annualRoiPercent}%
                    </span>
                  </div>
                ) : (
                  <div className="text-sm font-extrabold text-rose-600">
                    {lang === 'ru'
                      ? 'Не окупается (Убыток)'
                      : "O'zini oqlamaydi (Zarar)"}
                  </div>
                )}
                <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
                  {lang === 'ru' ? 'Вложения:' : 'Sarmoya:'}{' '}
                  {formatMln(results.capex.totalInvestmentUzs, lang, currency)}
                </p>
              </div>

              {/* KPI 3: Loan Payment & Interactive Hover Hint */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab('credit')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab('credit');
                  }
                }}
                className="group card-interactive cursor-pointer bg-white border border-slate-200/90 border-t-[3px] border-t-amber-500 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500">
                    {t.kpiLoanPayment}
                  </span>
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                    <Landmark className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg font-extrabold text-slate-900 tabular-nums whitespace-nowrap">
                  {formatUzs(
                    results.selectedBankProgramResult.monthlyPaymentUzs,
                    lang,
                    currency
                  )}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums whitespace-nowrap ${
                      inputs.loanAmountUzs <= 0
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : results.approvalStatus === 'High'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : results.approvalStatus === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {loanPillText}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-indigo-600 flex items-center gap-0.5 shrink-0">
                    {lang === 'ru' ? 'Открыть' : 'Ochish'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* KPI 4: Monthly Tax & Interactive Hover Hint */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab('taxes')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab('taxes');
                  }
                }}
                className="group card-interactive cursor-pointer bg-white border border-slate-200/90 border-t-[3px] border-t-teal-500 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl p-4 shadow-sm"
                title={
                  lang === 'ru'
                    ? 'Нажмите, чтобы выбрать налоговый режим'
                    : 'Soliq rejimini tanlash uchun bosing'
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500">
                    {t.kpiOptimalTax}
                  </span>
                  <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg font-extrabold text-slate-900 tabular-nums whitespace-nowrap">
                  {formatUzs(
                    results.activeTaxRegime.monthlyTaxUzs,
                    lang,
                    currency
                  )}
                </div>
                <div className="flex items-center justify-between mt-1 gap-1.5">
                  <span className="text-[11px] text-emerald-700 font-semibold truncate">
                    {lang === 'ru'
                      ? results.activeTaxRegime.nameRu
                      : results.activeTaxRegime.nameUz}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 shrink-0 tabular-nums group-hover:hidden">
                    {results.activeTaxRegime.effectiveRatePercent}%
                  </span>
                  <span className="hidden group-hover:flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 shrink-0">
                    {lang === 'ru' ? 'Открыть' : 'Ochish'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 5-Step Guided Workspace Tabs */}
          <section className="space-y-4">
            <div className="bg-slate-200/70 border border-slate-200/90 p-1.5 rounded-2xl grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <button
                onClick={() => setActiveTab('params')}
                className={`flex items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${
                  activeTab === 'params'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span
                  className={`p-0.5 rounded-md ${
                    activeTab === 'params'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                </span>
                <span className="truncate">
                  {lang === 'ru' ? '1. Параметры' : '1. Parametrlar'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('businessPlan')}
                className={`flex items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${
                  activeTab === 'businessPlan'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span
                  className={`p-0.5 rounded-md ${
                    activeTab === 'businessPlan'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                </span>
                <span className="truncate">
                  {lang === 'ru' ? '2. План' : '2. Reja'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('credit')}
                className={`flex items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${
                  activeTab === 'credit'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span
                  className={`p-0.5 rounded-md ${
                    activeTab === 'credit'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                </span>
                <span className="truncate">
                  {lang === 'ru' ? '3. Кредит (10)' : '3. Kredit (10)'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('taxes')}
                className={`flex items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${
                  activeTab === 'taxes'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span
                  className={`p-0.5 rounded-md ${
                    activeTab === 'taxes'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5 shrink-0" />
                </span>
                <span className="truncate">
                  {lang === 'ru' ? '4. Налоги' : '4. Soliqlar'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('market')}
                className={`flex items-center justify-center gap-1 py-2.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-[0.98] col-span-2 sm:col-span-1 ${
                  activeTab === 'market'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span
                  className={`p-0.5 rounded-md ${
                    activeTab === 'market'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                </span>
                <span className="truncate">
                  {lang === 'ru' ? '5. Рынок' : '5. Bozor'}
                </span>
              </button>
            </div>

            <div key={activeTab}>
              {activeTab === 'params' && (
                <LeftSidebar
                  mode="inputs"
                  lang={lang}
                  currency={currency}
                  inputs={inputs}
                  results={results}
                  onChangeInputs={handleUpdateInputs}
                  messages={messages}
                  isAiLoading={isAiLoading}
                  onSendPrompt={handleSendPrompt}
                  onResetChat={handleResetChat}
                  lastAiChanges={lang === 'ru' ? lastAiChangesRu : lastAiChangesUz}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'businessPlan' && (
                <BusinessPlanTab
                  lang={lang}
                  currency={currency}
                  inputs={inputs}
                  results={results}
                  onOpenOwnerPlanPdf={() => handleOpenPdfModal('owner')}
                />
              )}

              {activeTab === 'taxes' && (
                <TaxCalculatorTab
                  lang={lang}
                  currency={currency}
                  inputs={inputs}
                  results={results}
                  onSelectLegalForm={(legalForm: LegalFormId) =>
                    handleUpdateInputs({ legalForm })
                  }
                />
              )}

              {activeTab === 'credit' && (
                <CreditMatcherTab
                  lang={lang}
                  currency={currency}
                  inputs={inputs}
                  results={results}
                  onSelectBankProgram={(programId: BankProgramId) =>
                    handleUpdateInputs({ selectedBankProgram: programId })
                  }
                  onChangeInputs={handleUpdateInputs}
                />
              )}

              {activeTab === 'market' && (
                <MarketAnalysisTab
                  lang={lang}
                  currency={currency}
                  inputs={inputs}
                  onSelectDistrict={(districtId: DistrictId) =>
                    handleUpdateInputs({ district: districtId })
                  }
                />
              )}
            </div>
          </section>
        </div>

        {/* RIGHT STICKY COLUMN (48% width) — Prominent AI Business Copilot */}
        <aside className="w-full lg:w-[48%] min-w-0">
          <LeftSidebar
            mode="chat"
            lang={lang}
            currency={currency}
            inputs={inputs}
            results={results}
            onChangeInputs={handleUpdateInputs}
            messages={messages}
            isAiLoading={isAiLoading}
            onSendPrompt={handleSendPrompt}
            onResetChat={handleResetChat}
            plan={plan}
            freeAttemptsLeft={freeAttemptsLeft}
            maxFreeAttempts={MAX_FREE_ATTEMPTS}
            onOpenPricingModal={() => {
              setLimitReachedTrigger(false);
              setIsPricingModalOpen(true);
            }}
            onResetFreeAttempts={handleResetFreeAttempts}
            onActivatePro={handleActivatePro}
          />
        </aside>
      </main>

      {/* Official Chamber of Commerce & Industry Uzbekistan Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 px-4 sm:px-6 mt-auto no-print">
        <div className="max-w-[1440px] mx-auto space-y-3 text-xs text-slate-600">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {lang === 'ru'
                    ? 'Торгово-промышленная палата Республики Узбекистан (ТПП РУз)'
                    : "O'zbekiston Respublikasi Savdo-sanoat palatasi (O'zR SSP)"}
                </span>
              </div>
              <a
                href="https://chamber.uz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-emerald-700 font-medium text-slate-600 transition-colors whitespace-nowrap"
              >
                <span>chamber.uz</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 whitespace-nowrap">
                <PhoneCall className="w-3 h-3 text-indigo-600 shrink-0" />
                {lang === 'ru' ? 'Колл-центр: 1094' : 'Call-markaz: 1094'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px] whitespace-nowrap">
                {lang === 'ru' ? 'НК РУз 2026' : "O'zR SK 2026"} • 1 USD ={' '}
                {USD_RATE_UZS.toLocaleString('ru-RU')} UZS
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-slate-400 font-semibold mr-0.5">
                {lang === 'ru' ? 'Госпорталы РУз:' : "O'zR portallari:"}
              </span>
              <a
                href="https://new.birdarcha.uz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-medium transition-colors whitespace-nowrap"
              >
                <span>
                  new.birdarcha.uz ({lang === 'ru' ? 'Регистрация' : "Ro'yxat"})
                </span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://my.soliq.uz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-medium transition-colors whitespace-nowrap"
              >
                <span>
                  my.soliq.uz ({lang === 'ru' ? 'Налоги' : 'Soliq'})
                </span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://ijara.soliq.uz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-medium transition-colors whitespace-nowrap"
              >
                <span>
                  ijara.soliq.uz ({lang === 'ru' ? 'Аренда' : 'Ijara'})
                </span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://my.mehnat.uz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-medium transition-colors whitespace-nowrap"
              >
                <span>
                  my.mehnat.uz ({lang === 'ru' ? 'Кадры' : 'Kadrlar'})
                </span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://oilakredit.uz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-medium transition-colors whitespace-nowrap"
              >
                <span>
                  oilakredit.uz ({lang === 'ru' ? 'Госкредиты' : 'Kreditlar'})
                </span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <p className="pt-2.5 border-t border-slate-200/70 text-[11px] text-slate-400 leading-relaxed">
            {lang === 'ru'
              ? 'Отказ от ответственности: расчеты носят предварительный справочный характер, не являются публичной офертой коммерческого банка или официальным заключением ТПП РУз.'
              : "Mas'uliyatdan voz kechish: hisob-kitoblar dastlabki ma'lumotnoma xarakteriga ega bo'lib, tijorat bankining ommaviy ofertasi yoki O'zR SSPning rasmiy xulosasi hisoblanmaydi."}
          </p>
        </div>
      </footer>

      {/* Bank Printable PDF Modal */}
      <BankPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        lang={lang}
        currency={currency}
        inputs={inputs}
        results={results}
        initialDocMode={pdfDocMode}
      />

      {/* 2-Plan Subscription Modal (Free Limited vs Pro Unlimited) */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => {
          setIsPricingModalOpen(false);
          setLimitReachedTrigger(false);
          setPendingPrompt(null);
        }}
        lang={lang}
        currency={currency}
        plan={plan}
        freeAttemptsLeft={freeAttemptsLeft}
        maxFreeAttempts={MAX_FREE_ATTEMPTS}
        limitReachedTrigger={limitReachedTrigger}
        onSelectPlan={(nextPlan) => {
          setPlan(nextPlan);
          setLimitReachedTrigger(false);
          if (nextPlan === 'free' && pendingPrompt) {
            setPendingPrompt(null);
          }
        }}
        onResetFreeAttempts={() => {
          handleResetFreeAttempts();
          setIsPricingModalOpen(false);
        }}
      />
    </div>
  );
}

export default App;
