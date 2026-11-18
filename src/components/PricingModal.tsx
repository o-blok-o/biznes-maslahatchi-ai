import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Check,
  Crown,
  Infinity as InfinityIcon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { Currency, Language, SubscriptionPlanId } from '../types/business';
import { formatUzs, USD_RATE_UZS } from '../utils/calculations';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  plan: SubscriptionPlanId;
  freeAttemptsLeft: number;
  maxFreeAttempts: number;
  limitReachedTrigger: boolean;
  onSelectPlan: (plan: SubscriptionPlanId) => void;
  onResetFreeAttempts: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  plan,
  freeAttemptsLeft,
  maxFreeAttempts,
  limitReachedTrigger,
  onSelectPlan,
  onResetFreeAttempts,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const proPriceMonthlyUsd = 15;
  const proPriceMonthlyUzs = proPriceMonthlyUsd * USD_RATE_UZS;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print animate-fade-up"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Top Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-emerald-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Crown className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold leading-tight">
                {lang === 'ru'
                  ? 'Тарифные планы Biznes-Maslahatchi AI'
                  : 'Biznes-Maslahatchi AI tarif rejalari'}
              </h3>
              <p className="text-[11px] text-indigo-100/90">
                {lang === 'ru'
                  ? 'Выберите бесплатный старт с лимитом попыток или безлимитный Pro для полной работы'
                  : 'Urinishlar limiti bilan bepul start yoki cheksiz Pro tarifini tanlang'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label={lang === 'ru' ? 'Закрыть' : 'Yopish'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {limitReachedTrigger && plan === 'free' && freeAttemptsLeft <= 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm mb-0.5">
                  {lang === 'ru'
                    ? `Бесплатный лимит (${maxFreeAttempts} из ${maxFreeAttempts} попыток) исчерпан`
                    : `Bepul limit (${maxFreeAttempts} tadan ${maxFreeAttempts} urinish) tugadi`}
                </div>
                <p className="text-amber-900 leading-relaxed">
                  {lang === 'ru'
                    ? 'Чтобы продолжать безлимитные запросы к ИИ-консультанту, стресс-тесты и выгрузку PDF ТЭО / презентаций, перейдите на тариф «Pro Безлимитный».'
                    : "AI-maslahatchiga cheksiz murojaatlar, stress-testlar va PDF biznes-reja yuklashni davom ettirish uchun «Pro Cheksiz» tarifiga o'ting."}
                </p>
              </div>
            </div>
          )}

          {/* 2 Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PLAN 1: FREE (Limited Attempts) */}
            <div
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                plan === 'free'
                  ? 'bg-slate-50 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {lang === 'ru' ? 'Тариф 1 • Free' : '1-tarif • Bepul'}
                  </span>
                  {plan === 'free' && (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      {lang === 'ru' ? 'Текущий план' : 'Joriy tarif'}
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-extrabold text-slate-900 mt-1">
                  {lang === 'ru' ? 'Бесплатный (Лимит)' : 'Bepul (Cheklangan)'}
                </h4>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatUzs(0, lang, currency)}
                  </span>
                  <span className="text-xs text-slate-500">
                    / {lang === 'ru' ? 'навсегда' : 'doimiy'}
                  </span>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    {lang === 'ru' ? 'Остаток попыток:' : 'Qolgan urinishlar:'}
                  </span>
                  <span
                    className={`font-extrabold tabular-nums ${
                      freeAttemptsLeft > 1
                        ? 'text-emerald-700'
                        : freeAttemptsLeft === 1
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {freeAttemptsLeft} / {maxFreeAttempts}
                  </span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {lang === 'ru'
                        ? `До ${maxFreeAttempts} попыток ИИ-консультанта, стресс-тестов и экспортов PDF ТЭО`
                        : `AI-maslahatchi, stress-test va PDF eksport uchun ${maxFreeAttempts} tagacha urinish`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {lang === 'ru'
                        ? 'Калькулятор финансовой модели и налоги НК РУз (3 режима)'
                        : "Moliyaviy model kalkulyatori va O'zR SK soliqlari (3 rejim)"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {lang === 'ru'
                        ? 'Базовый просмотр 10 банков РУз и льготных периодов'
                        : "O'zbekistonning 10 ta banki va imtiyozli davrlarini ko'rish"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 space-y-2">
                {plan === 'free' ? (
                  <button
                    type="button"
                    onClick={onResetFreeAttempts}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'ru'
                        ? `Сбросить демо-лимит (${maxFreeAttempts}/${maxFreeAttempts})`
                        : `Demo-limitni tiklash (${maxFreeAttempts}/${maxFreeAttempts})`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPlan('free');
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                  >
                    {lang === 'ru'
                      ? `Переключиться на Бесплатный (лимит ${maxFreeAttempts})`
                      : `Bepul rejimga o'tish (${maxFreeAttempts} urinish)`}
                  </button>
                )}
              </div>
            </div>

            {/* PLAN 2: PRO (Paid Unlimited) */}
            <div
              className={`rounded-2xl border p-5 flex flex-col justify-between relative overflow-hidden transition-all ${
                plan === 'pro'
                  ? 'bg-gradient-to-br from-indigo-50 via-white to-emerald-50 border-emerald-500 ring-2 ring-emerald-500/25 shadow-md'
                  : 'bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/70 border-indigo-300 hover:border-indigo-400 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-600 text-white">
                    <Zap className="w-3 h-3" />
                    {lang === 'ru' ? 'Тариф 2 • Pro' : '2-tarif • Pro'}
                  </span>
                  {plan === 'pro' ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      {lang === 'ru' ? 'Активен сейчас' : 'Faol tarif'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      {lang === 'ru' ? 'Рекомендуем' : 'Tavsiya etiladi'}
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                  <span>
                    {lang === 'ru'
                      ? 'Платный Безлимитный'
                      : 'Pullik Cheksiz'}
                  </span>
                  <InfinityIcon className="w-5 h-5 text-emerald-600" />
                </h4>
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-700">
                    ${proPriceMonthlyUsd}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    / {lang === 'ru' ? 'месяц' : 'oy'} (
                    {formatUzs(proPriceMonthlyUzs, lang, 'UZS')})
                  </span>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                  <span className="text-emerald-900 font-semibold">
                    {lang === 'ru' ? 'Количество попыток:' : 'Urinishlar soni:'}
                  </span>
                  <span className="font-extrabold text-emerald-700 inline-flex items-center gap-1">
                    <InfinityIcon className="w-4 h-4" />
                    {lang === 'ru' ? 'Безлимит' : 'Cheksiz'}
                  </span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>
                        {lang === 'ru'
                          ? 'Безлимитный ИИ-консультант (Gemini 2.5 Flash / Pro)'
                          : 'Cheksiz AI-maslahatchi (Gemini 2.5 Flash / Pro)'}
                      </strong>{' '}
                      {lang === 'ru'
                        ? '— диалоги, авто-настройка параметров, законы РУз и голосовой ввод STT (скоро)'
                        : "— cheklovlarsiz savollar, parametrlarni sozlash, O'zR qonunlari va ovozli kiritish (tez kunda)"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {lang === 'ru'
                        ? 'Неограниченный экспорт 3 форматов PDF (ТЭО для банка, План для бизнеса + законы РУз, 6-слайдовая презентация) и Excel'
                        : "Cheksiz 3 formatdagi PDF (Bank TIA, Biznes yo'l xaritasi, 6 slaydli taqdimot) va Excel eksport"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {lang === 'ru'
                        ? 'Полный ИИ-подбор по 10 банкам РУз (ставка, льготный период до 24 мес., DSCR, сценарии до выхода в плюс)'
                        : "O'zbekistonning 10 ta banki bo'yicha to'liq AI-tanlov (stavka, 24 oygacha imtiyoz, DSCR, plyusga chiqish tahlili)"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlan('pro');
                    onClose();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    plan === 'pro'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {plan === 'pro'
                      ? lang === 'ru'
                        ? 'Тариф Pro уже активен'
                        : 'Pro tarifi faol'
                      : lang === 'ru'
                      ? `Активировать Pro ($${proPriceMonthlyUsd}/мес)`
                      : `Pro tarifni yoqish ($${proPriceMonthlyUsd}/oy)`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {lang === 'ru'
                ? 'Платформа выполняет аналитику и подбор оптимального банка; оформление и подписание кредитного договора всегда проходит напрямую в отделении выбранного банка РУз.'
                : "Platforma tahlil va eng qulay bank shartlarini tanlashda yordam beradi; kredit rasmiylashtirish faqat tanlangan bank bo'limida amalga oshiriladi."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
