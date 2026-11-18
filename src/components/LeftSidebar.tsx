import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Coffee,
  Copy,
  GraduationCap,
  Landmark,
  MapPin,
  Mic,
  PenLine,
  RotateCcw,
  Scale,
  Scissors,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  BankProgramId,
  BusinessInputs,
  BusinessTypeId,
  ChatMessage,
  Currency,
  DistrictId,
  FinancialResults,
  Language,
  SubscriptionPlanId,
} from '../types/business';
import { DISTRICT_LIST, TASHKENT_DISTRICTS } from '../data/tashkentDistricts';
import {
  BUSINESS_TYPE_DEFAULTS,
  CUSTOM_BUSINESS_SUGGESTIONS,
} from '../data/presets';
import { TRANSLATIONS } from '../data/translations';
import {
  formatMln,
  formatNumber,
  formatUzs,
  USD_RATE_UZS,
} from '../utils/calculations';

interface LeftSidebarProps {
  mode?: 'inputs' | 'chat';
  lang: Language;
  currency: Currency;
  inputs: BusinessInputs;
  results: FinancialResults;
  onChangeInputs: (updated: Partial<BusinessInputs>) => void;
  messages: ChatMessage[];
  isAiLoading: boolean;
  onSendPrompt: (promptText: string) => void;
  onResetChat?: () => void;
  plan?: SubscriptionPlanId;
  freeAttemptsLeft?: number;
  maxFreeAttempts?: number;
  onOpenPricingModal?: () => void;
  onResetFreeAttempts?: () => void;
  onActivatePro?: () => void;
  lastAiChanges?: string[];
  onNavigateTab?: (
    tab: 'params' | 'businessPlan' | 'credit' | 'taxes' | 'market'
  ) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  mode = 'inputs',
  lang,
  currency,
  inputs,
  results,
  onChangeInputs,
  messages,
  isAiLoading,
  onSendPrompt,
  onResetChat,
  plan = 'free',
  freeAttemptsLeft = 15,
  maxFreeAttempts = 15,
  onOpenPricingModal,
  onResetFreeAttempts,
  onActivatePro,
  lastAiChanges = [],
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[lang];
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAllNiches, setShowAllNiches] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [voiceToast, setVoiceToast] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const voiceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (voiceTimerRef.current !== null) {
        window.clearTimeout(voiceTimerRef.current);
      }
    };
  }, []);

  const handleVoiceClick = () => {
    setVoiceToast(true);
    if (voiceTimerRef.current !== null) {
      window.clearTimeout(voiceTimerRef.current);
    }
    voiceTimerRef.current = window.setTimeout(() => {
      setVoiceToast(false);
    }, 3500);
  };

  useEffect(() => {
    if (mode === 'chat' && chatScrollRef.current && messages.length > 1) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length, isAiLoading, mode]);

  const handleCopyMessage = (id: string, content: string) => {
    try {
      navigator.clipboard?.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const isUsd = currency === 'USD';
  const toDisplayAmount = (uzs: number) =>
    isUsd ? Math.round(uzs / USD_RATE_UZS) : uzs;
  const fromDisplayAmount = (val: number) =>
    isUsd ? Math.round(val * USD_RATE_UZS) : val;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || isAiLoading) return;
    onSendPrompt(customPrompt.trim());
    setCustomPrompt('');
  };

  const renderFormattedInline = (raw: string) => {
    const parts = raw.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={j} className="text-slate-900 font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={j}>{part}</span>;
    });
  };

  const renderFormattedAiText = (text: string) => {
    const headerPrefixes = [
      '🧭',
      '📅',
      '💡',
      '📊',
      '🏦',
      '⚖️',
      '📍',
      '🚀',
      '🛡️',
      '👥',
      '🏢',
      '📋',
      '📣',
      '🏗️',
      '⚡',
    ];
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed === '') {
        return <div key={i} className="h-1.5" />;
      }

      const isBannerHeader = headerPrefixes.some((p) => trimmed.startsWith(p));
      if (isBannerHeader) {
        return (
          <div
            key={i}
            className={`rounded-lg px-2.5 py-1.5 mb-2 text-xs font-semibold shadow-2xs border ${
              trimmed.startsWith('⚡')
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-white border-indigo-100 text-slate-900'
            }`}
          >
            {renderFormattedInline(trimmed)}
          </div>
        );
      }

      const isBullet =
        trimmed.startsWith('• ') || trimmed.startsWith('- ');
      if (isBullet) {
        const content = trimmed.slice(2);
        return (
          <div
            key={i}
            className="flex items-start gap-2 leading-relaxed mb-1.5 pl-0.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div className="flex-1">{renderFormattedInline(content)}</div>
          </div>
        );
      }

      const numberedMatch = trimmed.match(/^(\d+\.)\s+(.*)$/);
      if (numberedMatch) {
        return (
          <div
            key={i}
            className="flex items-start gap-2 leading-relaxed mb-1.5"
          >
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
              {numberedMatch[1]}
            </span>
            <div className="flex-1">
              {renderFormattedInline(numberedMatch[2])}
            </div>
          </div>
        );
      }

      return (
        <p key={i} className="leading-relaxed mb-1">
          {renderFormattedInline(line)}
        </p>
      );
    });
  };

  const bankRateNum = results.selectedBankProgramResult.annualRatePercent;

  const district = TASHKENT_DISTRICTS[inputs.district];
  const optimalRegime = results.taxRegimes[results.optimalTaxRegimeId];

  // Mode: Always-Visible Right Sticky AI Consultant Column
  if (mode === 'chat') {
    const dscrReadyText =
      inputs.loanAmountUzs <= 0
        ? lang === 'ru'
          ? 'Без кредита (100% свои)'
          : 'Kreditsiz (100% shaxsiy)'
        : results.approvalStatus === 'High'
        ? lang === 'ru'
          ? `${t.statusApproved} (${results.approvalProbabilityPercent}%, DSCR ${results.dscr}x)`
          : `${t.statusApproved} (${results.approvalProbabilityPercent}%, DSCR ${results.dscr}x)`
        : results.approvalStatus === 'Medium'
        ? lang === 'ru'
          ? `Нужен залог (${results.approvalProbabilityPercent}%, DSCR ${results.dscr}x)`
          : `Garov kerak (${results.approvalProbabilityPercent}%, DSCR ${results.dscr}x)`
        : lang === 'ru'
        ? `Риск отказа (${results.approvalProbabilityPercent}%, DSCR ${results.dscr}x)`
        : `Rad etish xavfi (${results.approvalProbabilityPercent}%, DSCR ${results.dscr}x)`;

    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col lg:sticky lg:top-[4.75rem] lg:h-[calc(100vh-8.5rem)] lg:max-h-[calc(100vh-8.5rem)] 2xl:h-[calc(100vh-5.75rem)] 2xl:max-h-[calc(100vh-5.75rem)] animate-fade-up">
        {/* Distinctive Dark-Indigo / Emerald Header Bar */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-emerald-800 text-white px-4 py-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
                <Bot className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold leading-tight truncate">
                  {lang === 'ru'
                    ? 'ИИ-Консультант ТПП РУз'
                    : "O'zR SSP AI-Maslahatchi"}
                </h3>
                <p className="text-[11px] text-indigo-100/90 truncate">
                  {lang === 'ru'
                    ? 'Автонастройка, бизнес-план и законы РУз'
                    : "Avto-sozlash, biznes-reja va O'zR qonunlari"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onOpenPricingModal && (
                <button
                  type="button"
                  onClick={onOpenPricingModal}
                  className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                    plan === 'pro'
                      ? 'bg-emerald-500/25 text-emerald-100 border-emerald-300/40'
                      : freeAttemptsLeft <= 1
                      ? 'bg-amber-500/30 text-amber-100 border-amber-300/50'
                      : 'bg-white/15 hover:bg-white/25 text-white border-white/25'
                  }`}
                >
                  {plan === 'pro'
                    ? 'Pro: ∞'
                    : `${freeAttemptsLeft}/${maxFreeAttempts}`}
                </button>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <Sparkles className="w-3 h-3 animate-pulse-soft" />
                {lang === 'ru'
                  ? 'Онлайн'
                  : 'Onlayn'}
              </span>
              {onResetChat && (
                <button
                  type="button"
                  onClick={onResetChat}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/15 transition-colors"
                  title={
                    lang === 'ru'
                      ? 'Обновить / Очистить чат'
                      : 'Chatni yangilash / tozalash'
                  }
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Compact AI Context Strip (Location + Tax + Loan Readiness) */}
        <div className="bg-indigo-50/75 border-b border-indigo-100 px-3.5 py-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] shrink-0">
          <span className="inline-flex items-center gap-1 text-slate-700">
            <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
            <strong className="text-slate-900">
              {formatUzs(district.rentPerSqmUzs, lang, currency)}/{t.sqmUnit}
            </strong>
            <span>· {district.trafficScore}/100</span>
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-800">
            <Scale className="w-3 h-3 text-emerald-600 shrink-0" />
            <strong className="truncate max-w-[190px]">
              {lang === 'ru' ? optimalRegime.nameRu : optimalRegime.nameUz}
            </strong>
          </span>
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              results.approvalStatus === 'High'
                ? 'text-emerald-700'
                : results.approvalStatus === 'Medium'
                ? 'text-amber-700'
                : 'text-rose-700'
            }`}
          >
            <Landmark className="w-3 h-3 shrink-0" />
            <span>{dscrReadyText}</span>
          </span>
        </div>

        {/* Quick-Ask Prompt & Autonomous Agent Actions (Compact Scrollable Strip) */}
        <div className="px-3.5 py-2 space-y-1.5 border-b border-slate-100 bg-slate-50/70 shrink-0 max-h-[112px] overflow-y-auto">
          <div className="flex flex-wrap gap-1">
            {[
              lang === 'ru'
                ? '🤖 Собери кофейню под ключ на бюджет 150 млн'
                : '🤖 150 mln budjetga qahvaxona loyihasini tuz',
              lang === 'ru'
                ? '🥖 Настрой пекарню в Сергели, 70 м², 4 чел.'
                : '🥖 Sirg‘alida 70 m², 4 xodimlik novvoyxona sozla',
              lang === 'ru'
                ? '🎓 Учебный центр на Юнусабаде, 100 клиентов/день'
                : '🎓 Yunusobodda kuniga 100 mijozli o‘quv markazi',
              lang === 'ru'
                ? '⚡ Оптимизируй бизнес, налог и выбери лучший банк'
                : '⚡ Biznes, soliq va eng qulay bankni optimallashtir',
              lang === 'ru'
                ? '🧭 Бизнес-план для меня (путь + законы РУз)'
                : "🧭 Men uchun biznes-reja (yo'l xaritasi + O'zR qonunlari)",
              lang === 'ru'
                ? '🛡️ Стресс-тест (-25% выручки)'
                : '🛡️ Stress-test (-25% tushum)',
              lang === 'ru'
                ? '📈 Как увеличить чистую прибыль?'
                : '📈 Sof foydani qanday oshirish mumkin?',
              lang === 'ru'
                ? '🏦 Сравни все 10 банков под мой проект'
                : '🏦 Loyiham uchun 10 ta bankni solishtir',
              lang === 'ru'
                ? '📊 Разложи доходы и расходы по полочкам'
                : '📊 Daromad va xarajatlarni batafsil tushuntir',
            ].map((chip, idx) => (
              <button
                key={chip}
                onClick={() => onSendPrompt(chip)}
                disabled={isAiLoading}
                className={`text-[10.5px] px-2 py-0.5 rounded-full border transition-all active:scale-95 disabled:opacity-50 shadow-2xs ${
                  idx < 4
                    ? 'font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'font-medium bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Scroll */}
        <div
          ref={chatScrollRef}
          className="flex-1 min-h-[160px] overflow-y-auto p-3.5 space-y-2.5"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-xl text-xs animate-fade-up ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white ml-8 shadow-xs'
                  : 'bg-slate-50 border border-slate-200/90 text-slate-700'
              }`}
            >
              <div
                className={`flex items-center justify-between text-[10px] mb-1 ${
                  msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                <span className="font-semibold">
                  {msg.role === 'user'
                    ? lang === 'ru'
                      ? 'Предприниматель'
                      : 'Tadbirkor'
                    : 'Biznes-Maslahatchi AI'}
                </span>
                <div className="flex items-center gap-2">
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 transition-colors"
                      title={lang === 'ru' ? 'Копировать ответ' : 'Nusxa olish'}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">
                            {lang === 'ru' ? 'Скопировано' : 'Nusxalandi'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{lang === 'ru' ? 'Копировать' : 'Nusxa'}</span>
                        </>
                      )}
                    </button>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
              <div className="text-xs leading-relaxed">
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  renderFormattedAiText(msg.content)
                )}
              </div>
            </div>
          ))}

          {isAiLoading && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2 animate-fade-up">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>
                {lang === 'ru'
                  ? 'ИИ-консультант анализирует цифры...'
                  : 'AI-maslahatchi raqamlarni tahlil qilmoqda...'}
              </span>
            </div>
          )}
        </div>

        {/* Voice Input Placeholder Notice */}
        {voiceToast && (
          <div className="mx-3.5 mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2 animate-fade-up shrink-0">
            <div className="flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-medium">
                {lang === 'ru'
                  ? 'Голосовой ввод (узбекский и русский языки) скоро будет доступен в следующем обновлении!'
                  : "Ovozli kiritish (o'zbek va rus tillarida) tez orada keyingi yangilanishda ishga tushiriladi!"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setVoiceToast(false)}
              className="text-amber-700 hover:text-amber-950 p-0.5 shrink-0"
              aria-label={lang === 'ru' ? 'Закрыть уведомление' : 'Yopish'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Recovery Bar When Attempts Run Low or Out */}
        {plan === 'free' &&
          freeAttemptsLeft <= 3 &&
          (onResetFreeAttempts || onActivatePro) && (
            <div className="mx-3.5 mt-2 px-3 py-2 rounded-xl bg-indigo-50/90 border border-indigo-200 text-xs flex flex-wrap items-center justify-between gap-2 animate-fade-up shrink-0">
              <span className="text-indigo-900 font-semibold">
                {freeAttemptsLeft <= 0
                  ? lang === 'ru'
                    ? 'Бесплатные попытки закончились:'
                    : 'Bepul urinishlar tugadi:'
                  : lang === 'ru'
                  ? `Осталось ${freeAttemptsLeft} из ${maxFreeAttempts} попыток:`
                  : `${maxFreeAttempts} tadan ${freeAttemptsLeft} urinish qoldi:`}
              </span>
              <div className="flex items-center gap-1.5">
                {onResetFreeAttempts && (
                  <button
                    type="button"
                    onClick={onResetFreeAttempts}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-bold transition-all whitespace-nowrap"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>
                      {lang === 'ru'
                        ? `Восстановить ${maxFreeAttempts} попыток`
                        : `${maxFreeAttempts} urinishni tiklash`}
                    </span>
                  </button>
                )}
                {onActivatePro && (
                  <button
                    type="button"
                    onClick={onActivatePro}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold transition-all whitespace-nowrap"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{lang === 'ru' ? 'Включить Pro ∞' : 'Pro ∞ yoqish'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

        {/* Input Form — Always Pinned Visible at Bottom */}
        <form
          onSubmit={handleFormSubmit}
          className="p-3 border-t-2 border-indigo-100 bg-white flex gap-2 items-center shrink-0"
        >
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={
              lang === 'ru'
                ? 'Например: «Собери пекарню в Сергели на бюджет 150 млн» или вопрос по прибыли...'
                : "Masalan: «Sirg'alida 150 mln budjetga novvoyxona tuz» yoki foyda haqida savol..."
            }
            className="flex-1 min-w-0 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-colors"
          />
          <button
            type="button"
            onClick={handleVoiceClick}
            title={
              lang === 'ru'
                ? 'Голосовой ввод (скоро будет доступно)'
                : 'Ovozli kiritish (tez orada)'
            }
            aria-label={
              lang === 'ru'
                ? 'Голосовой ввод (скоро будет доступно)'
                : 'Ovozli kiritish (tez orada)'
            }
            className={`p-2.5 rounded-xl border transition-all active:scale-95 shrink-0 ${
              voiceToast
                ? 'bg-amber-50 border-amber-400 text-amber-700'
                : 'bg-slate-100 hover:bg-indigo-50 border-slate-300 hover:border-indigo-300 text-slate-600 hover:text-indigo-700'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={isAiLoading || !customPrompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.aiSendBtn}</span>
          </button>
        </form>
      </div>
    );
  }

  // Mode: Step 1 Business Parameters Card (Left Main Column)
  const businessCards: Array<{
    id: BusinessTypeId;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'coffee',
      label: t.businessTypesShort.coffee,
      icon: <Coffee className="w-4 h-4" />,
    },
    {
      id: 'education',
      label: t.businessTypesShort.education,
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: 'sewing',
      label: t.businessTypesShort.sewing,
      icon: <Scissors className="w-4 h-4" />,
    },
    {
      id: 'retail',
      label: t.businessTypesShort.retail,
      icon: <ShoppingBag className="w-4 h-4" />,
    },
  ];

  const hasCustomName =
    Boolean(inputs.customBusinessName) &&
    inputs.customBusinessName!.trim().length > 0;

  const ownCapitalChips = isUsd
    ? [
        { label: '$5k', uzs: 5000 * USD_RATE_UZS },
        { label: '$10k', uzs: 10000 * USD_RATE_UZS },
        { label: '$20k', uzs: 20000 * USD_RATE_UZS },
      ]
    : [
        { label: '50 млн', uzs: 50_000_000 },
        { label: '100 млн', uzs: 100_000_000 },
        { label: '200 млн', uzs: 200_000_000 },
      ];

  const loanChips = isUsd
    ? [
        { label: lang === 'ru' ? '0 (Без кредита)' : '0 (Kreditsiz)', uzs: 0 },
        { label: '$10k', uzs: 10000 * USD_RATE_UZS },
        { label: '$20k', uzs: 20000 * USD_RATE_UZS },
      ]
    : [
        { label: lang === 'ru' ? '0 (Без кредита)' : '0 (Kreditsiz)', uzs: 0 },
        { label: '100 млн', uzs: 100_000_000 },
        { label: '200 млн', uzs: 200_000_000 },
      ];

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm animate-fade-up no-print">
      {/* Step 1 Title with Numbered Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-start gap-2.5">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-xs shrink-0 mt-0.5">
            1
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {lang === 'ru'
                ? 'Параметры вашего бизнеса'
                : 'Biznesingiz parametrlari'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'ru'
                ? 'Выберите готовое направление или впишите свой вариант бизнеса'
                : "Tayyor yo'nalishni tanlang yoki o'z biznesingiz nomini yozing"}
            </p>
          </div>
        </div>
        {isUsd && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              1 USD = {formatNumber(USD_RATE_UZS)} UZS
            </span>
          </div>
        )}
      </div>

      {lastAiChanges.length > 0 && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 flex items-center gap-2 animate-fade-up">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">
            <strong>
              {lang === 'ru'
                ? 'Обновлено ИИ-ассистентом:'
                : 'AI-yordamchi yangiladi:'}
            </strong>{' '}
            {lastAiChanges.join(' · ')}
          </span>
        </div>
      )}

      {/* Visual 4-Card Selector + Custom Business Input */}
      <div className="mb-4 space-y-2.5">
        <label className="block text-xs font-semibold text-slate-700">
          {t.businessTypeLabel}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {businessCards.map((item) => {
            const isSelected = inputs.businessType === item.id && !hasCustomName;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onChangeInputs({
                    ...BUSINESS_TYPE_DEFAULTS[item.id],
                    district: inputs.district,
                    customAvgCheckUzs: undefined,
                  })
                }
                className={`relative card-interactive flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border text-left ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs ring-2 ring-white">
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                )}
                <span
                  className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Business Type Text Input */}
        <div className="relative">
          <PenLine
            className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
              hasCustomName ? 'text-emerald-600' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={inputs.customBusinessName || ''}
            onChange={(e) =>
              onChangeInputs({ customBusinessName: e.target.value })
            }
            placeholder={
              lang === 'ru'
                ? 'Или впишите свой бизнес (например: Автомойка, Стоматология, Пекарня, Барбершоп)...'
                : 'Yoki o‘z biznesingizni yozing (masalan: Avtomoyka, Stomatologiya, Novvoyxona)...'
            }
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition-all border ${
              hasCustomName
                ? 'bg-emerald-50/40 border-emerald-500 text-slate-900 font-semibold ring-1 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Collapsible 12 Extra Custom Business Suggestions */}
        <div>
          <button
            type="button"
            onClick={() => setShowAllNiches((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 px-3 py-1 rounded-full transition-colors"
          >
            <span>
              {showAllNiches
                ? lang === 'ru'
                  ? 'Скрыть дополнительные ниши'
                  : "Qo'shimcha sohalarni yashirish"
                : lang === 'ru'
                ? 'Показать ещё 12 готовых ниш МСБ (Пекарня, Автомойка, Стоматология...)'
                : "Yana 12 ta tayyor KO'B sohasini ko'rsatish (Novvoyxona, Avtomoyka...)"}
            </span>
            {showAllNiches ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showAllNiches && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 animate-fade-up">
              {CUSTOM_BUSINESS_SUGGESTIONS.map((item) => {
                const label = lang === 'ru' ? item.nameRu : item.nameUz;
                const currentLower = (inputs.customBusinessName || '')
                  .trim()
                  .toLowerCase();
                const isPicked =
                  currentLower === label.toLowerCase() ||
                  currentLower === item.nameRu.toLowerCase() ||
                  currentLower === item.nameUz.toLowerCase();
                return (
                  <button
                    key={item.nameRu}
                    type="button"
                    onClick={() =>
                      onChangeInputs({
                        ...item.preset,
                        customBusinessName: label,
                        customAvgCheckUzs: undefined,
                      })
                    }
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all active:scale-95 ${
                      isPicked
                        ? 'bg-emerald-600 text-white border-emerald-600 font-medium'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Clean 3-Column Row: District, Own Capital, Loan Amount */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.districtLabel}
          </label>
          <select
            value={inputs.district}
            onChange={(e) =>
              onChangeInputs({ district: e.target.value as DistrictId })
            }
            className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none transition-colors"
          >
            {DISTRICT_LIST.map((d) => (
              <option key={d.id} value={d.id}>
                {lang === 'ru' ? d.nameRu : d.nameUz} (
                {formatUzs(d.rentPerSqmUzs, lang, currency)}/{t.sqmUnit})
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {lang === 'ru' ? 'Аренда:' : 'Ijara:'}{' '}
            {formatUzs(district.rentPerSqmUzs, lang, currency)}/{t.sqmUnit}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isUsd
              ? lang === 'ru'
                ? 'Свои сбережения ($)'
                : "Shaxsiy jamg'arma ($)"
              : t.ownCapitalLabel}
          </label>
          <input
            type="number"
            min={0}
            max={isUsd ? 500000 : 5000000000}
            step={isUsd ? 500 : 5000000}
            value={toDisplayAmount(inputs.ownCapitalUzs)}
            onChange={(e) =>
              onChangeInputs({
                ownCapitalUzs: fromDisplayAmount(
                  Math.max(0, Number(e.target.value) || 0)
                ),
              })
            }
            className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none transition-colors"
          />
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            {ownCapitalChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => onChangeInputs({ ownCapitalUzs: chip.uzs })}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isUsd
              ? lang === 'ru'
                ? 'Сумма кредита ($)'
                : 'Kredit summasi ($)'
              : t.loanAmountLabel}
          </label>
          <input
            type="number"
            min={0}
            max={isUsd ? 500000 : 5000000000}
            step={isUsd ? 500 : 5000000}
            value={toDisplayAmount(inputs.loanAmountUzs)}
            onChange={(e) =>
              onChangeInputs({
                loanAmountUzs: fromDisplayAmount(
                  Math.max(0, Number(e.target.value) || 0)
                ),
              })
            }
            className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none transition-colors"
          />
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            {loanChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => onChangeInputs({ loanAmountUzs: chip.uzs })}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expressive Expected Monthly Revenue Slider + Exact Input + Daily Unit Economics */}
      <div className="bg-gradient-to-r from-emerald-50/80 via-white to-indigo-50/70 border border-emerald-200/80 rounded-xl p-3.5 mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <label className="text-xs font-bold text-slate-800 block">
              {t.expectedRevenueLabel}
            </label>
            <span className="text-[11px] font-semibold text-emerald-700">
              {formatMln(inputs.expectedMonthlyRevenueUzs, lang, currency)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={isUsd ? 100 : 1000000}
              max={isUsd ? 500000 : 5000000000}
              step={isUsd ? 500 : 2000000}
              value={toDisplayAmount(inputs.expectedMonthlyRevenueUzs)}
              onChange={(e) =>
                onChangeInputs({
                  expectedMonthlyRevenueUzs: Math.max(
                    1000000,
                    fromDisplayAmount(Number(e.target.value) || 0)
                  ),
                })
              }
              className="w-36 bg-white border border-emerald-300 focus:border-emerald-600 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-800 text-right outline-none"
            />
            <span className="text-[11px] font-semibold text-slate-600">
              {isUsd ? '$' : t.uzsUnit}
            </span>
          </div>
        </div>

        <input
          type="range"
          min={10000000}
          max={600000000}
          step={2000000}
          value={Math.min(600000000, inputs.expectedMonthlyRevenueUzs)}
          onChange={(e) =>
            onChangeInputs({
              expectedMonthlyRevenueUzs: Number(e.target.value),
            })
          }
          className="w-full accent-emerald-600 cursor-pointer h-2 bg-emerald-200/70 rounded-lg mb-3"
        />

        {/* Interactive Avg Check x Daily Customers Unit Calculator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
          <div className="bg-white/95 border border-slate-200/90 rounded-lg px-2.5 py-2 flex items-center justify-between gap-2">
            <label className="text-[11px] font-medium text-slate-600 shrink-0">
              {lang === 'ru' ? 'Средний чек:' : "O'rtacha chek:"}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={isUsd ? 1 : 5000}
                max={isUsd ? 10000 : 100000000}
                step={isUsd ? 1 : 5000}
                value={toDisplayAmount(results.estimatedAvgCheckUzs)}
                onChange={(e) => {
                  const newCheckUzs = Math.max(
                    1000,
                    fromDisplayAmount(Number(e.target.value) || 0)
                  );
                  onChangeInputs({
                    customAvgCheckUzs: newCheckUzs,
                    expectedMonthlyRevenueUzs: Math.max(
                      1_000_000,
                      newCheckUzs * results.dailyCustomersNeeded * 30
                    ),
                  });
                }}
                className="w-24 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white rounded-md px-2 py-0.5 text-xs font-bold text-slate-900 text-right outline-none"
              />
              <span className="text-[10px] font-semibold text-slate-500">
                {isUsd ? '$' : t.uzsUnit}
              </span>
            </div>
          </div>

          <div className="bg-white/95 border border-slate-200/90 rounded-lg px-2.5 py-2 flex items-center justify-between gap-2">
            <label className="text-[11px] font-medium text-slate-600 shrink-0">
              {lang === 'ru' ? 'Клиентов / день:' : 'Kunlik mijoz:'}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={5000}
                step={1}
                value={results.dailyCustomersNeeded}
                onChange={(e) => {
                  const custCount = Math.max(
                    1,
                    Math.round(Number(e.target.value) || 1)
                  );
                  onChangeInputs({
                    expectedMonthlyRevenueUzs: Math.max(
                      1_000_000,
                      results.estimatedAvgCheckUzs * custCount * 30
                    ),
                  });
                }}
                className="w-20 bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-md px-2 py-0.5 text-xs font-bold text-indigo-700 text-right outline-none"
              />
              <span className="text-[10px] font-semibold text-slate-500">
                {lang === 'ru' ? 'чел.' : 'ta'}
              </span>
            </div>
          </div>
        </div>

        {/* Daily Unit Economics 2-Badge Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 tabular-nums">
          <div className="bg-white/95 border border-slate-200/80 rounded-lg px-3 py-2 flex items-center gap-2 text-[11px] text-slate-700 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              <strong className="text-slate-900">
                {lang === 'ru' ? 'В 1 день:' : '1 kunda:'}
              </strong>{' '}
              {formatUzs(results.dailyRevenueUzs, lang, currency)} · ~
              {results.dailyCustomersNeeded}{' '}
              {lang === 'ru' ? 'клиентов' : 'mijoz'}
            </span>
          </div>
          <div
            className={`bg-white/95 border rounded-lg px-3 py-2 flex items-center gap-2 text-[11px] font-semibold shadow-2xs ${
              results.safetyMarginPercent >= 15
                ? 'border-emerald-200 text-emerald-800'
                : results.safetyMarginPercent >= 0
                ? 'border-amber-200 text-amber-800'
                : 'border-rose-200 text-rose-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>
              {lang === 'ru' ? 'В ноль:' : 'Nolga:'} ~
              {results.breakEvenDailyCustomers}{' '}
              {lang === 'ru' ? 'кл./день' : 'mijoz/kun'} ·{' '}
              {lang === 'ru' ? 'запас' : 'zaxira'}{' '}
              {results.safetyMarginPercent >= 0 ? '+' : ''}
              {results.safetyMarginPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Exact Settings Drawer (Single place for non-tax details) */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-600 transition-colors"
        >
          <span className="flex items-center gap-2 truncate">
            <Settings2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-medium text-slate-800">
              {lang === 'ru' ? 'Точная настройка:' : 'Aniq sozlash:'}
            </span>
            <span className="truncate">
              {inputs.areaSqm} {t.sqmUnit} · {inputs.staffCount}{' '}
              {lang === 'ru' ? 'сотр.' : 'xodim'} ·{' '}
              {lang === 'ru' ? 'кредит' : 'kredit'} {bankRateNum}%{' '}
              {lang === 'ru' ? 'на' : ''} {inputs.loanTermMonths} {t.monthsUnit}
            </span>
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-3 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fade-up">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                {t.areaLabel}
              </label>
              <input
                type="number"
                min={5}
                max={1000}
                step={5}
                value={inputs.areaSqm || ''}
                onChange={(e) =>
                  onChangeInputs({
                    areaSqm: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                onBlur={() => {
                  if (inputs.areaSqm < 5) onChangeInputs({ areaSqm: 5 });
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                {t.staffLabel}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={inputs.staffCount}
                onChange={(e) =>
                  onChangeInputs({
                    staffCount: Math.min(
                      100,
                      Math.max(0, Math.round(Number(e.target.value) || 0))
                    ),
                  })
                }
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                {isUsd
                  ? lang === 'ru'
                    ? 'Средняя зарплата ($/мес)'
                    : "O'rtacha maosh ($/oy)"
                  : t.avgSalaryLabel}
              </label>
              <input
                type="number"
                min={0}
                max={isUsd ? 3000 : 30000000}
                step={isUsd ? 50 : 500000}
                value={toDisplayAmount(inputs.avgSalaryUzs)}
                onChange={(e) =>
                  onChangeInputs({
                    avgSalaryUzs: fromDisplayAmount(
                      Math.max(0, Number(e.target.value) || 0)
                    ),
                  })
                }
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span className="truncate">{t.cogsPercentLabel}</span>
                <span className="font-bold text-indigo-600 ml-1">
                  {inputs.cogsPercent}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={75}
                step={1}
                value={inputs.cogsPercent}
                onChange={(e) =>
                  onChangeInputs({ cogsPercent: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg mt-2.5"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                {t.loanTermLabel}
              </label>
              <select
                value={inputs.loanTermMonths}
                onChange={(e) =>
                  onChangeInputs({ loanTermMonths: Number(e.target.value) })
                }
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500"
              >
                <option value={12}>12 {t.monthsUnit}</option>
                <option value={18}>18 {t.monthsUnit}</option>
                <option value={24}>24 {t.monthsUnit}</option>
                <option value={36}>36 {t.monthsUnit}</option>
                <option value={48}>48 {t.monthsUnit}</option>
                <option value={60}>60 {t.monthsUnit}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                {t.bankProgramLabel}
              </label>
              <select
                value={inputs.selectedBankProgram}
                onChange={(e) =>
                  onChangeInputs({
                    selectedBankProgram: e.target.value as BankProgramId,
                  })
                }
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500"
              >
                {(Object.keys(t.bankProgramsShort) as BankProgramId[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {t.bankProgramsShort[key]}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        )}
      </div>

      {onNavigateTab && (
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab('businessPlan')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 text-center"
          >
            {lang === 'ru'
              ? 'Перейти к Бизнес-плану и графикам →'
              : 'Biznes-reja va grafiklarga o‘tish →'}
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('credit')}
            className="py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all active:scale-95 text-center"
          >
            {lang === 'ru'
              ? 'Подобрать банк из 10 →'
              : '10 ta bankdan tanlash →'}
          </button>
        </div>
      )}
    </section>
  );
};
