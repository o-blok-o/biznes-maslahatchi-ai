import React from 'react';
import {
  AlertCircle,
  Award,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  PiggyBank,
  QrCode,
  Scale,
  Sparkles,
} from 'lucide-react';
import {
  BusinessInputs,
  Currency,
  FinancialResults,
  Language,
  LegalFormId,
} from '../types/business';
import { TRANSLATIONS } from '../data/translations';
import { formatUzs } from '../utils/calculations';

interface TaxCalculatorTabProps {
  lang: Language;
  currency: Currency;
  inputs: BusinessInputs;
  results: FinancialResults;
  onSelectLegalForm: (legalForm: LegalFormId) => void;
}

export const TaxCalculatorTab: React.FC<TaxCalculatorTabProps> = ({
  lang,
  currency,
  results,
  onSelectLegalForm,
}) => {
  const t = TRANSLATIONS[lang];
  const regimeOrder: LegalFormId[] = ['self_employed', 'yatt', 'mchj'];
  const canOptimize = results.activeTaxRegime.id !== results.optimalTaxRegimeId;

  return (
    <div className="space-y-5 animate-fade-up tabular-nums">
      {/* Green Savings Banner + One-Click Switch to Optimal */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs mt-0.5 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900">
              {t.taxTab.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
              {t.taxTab.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="bg-white border border-emerald-300 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-2xs">
            <PiggyBank className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">
                {t.taxTab.annualSavingsTitle}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-700 whitespace-nowrap">
                +{formatUzs(results.annualTaxSavingsUzs, lang, currency)} /{' '}
                {lang === 'ru' ? 'год' : 'yil'}
              </span>
            </div>
          </div>

          {canOptimize && (
            <button
              type="button"
              onClick={() => onSelectLegalForm(results.optimalTaxRegimeId)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                {lang === 'ru'
                  ? 'Переключить на самый выгодный режим'
                  : 'Eng foydali rejimga o‘tkazish'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Expressive Comparison Cards */}
      <div className="grid grid-cols-1 gap-4">
        {regimeOrder.map((regimeId) => {
          const regime = results.taxRegimes[regimeId];
          const isOptimal = results.optimalTaxRegimeId === regimeId;
          const isSelected = results.activeTaxRegime.id === regimeId;
          const breakdownList =
            lang === 'ru' ? regime.breakdownRu : regime.breakdownUz;
          const ineligibilityReason =
            lang === 'ru'
              ? regime.ineligibilityReasonRu
              : regime.ineligibilityReasonUz;

          return (
            <div
              key={regimeId}
              className={`card-interactive rounded-2xl p-5 flex flex-col justify-between border shadow-sm ${
                isOptimal
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/15'
                  : regime.isEligible
                  ? 'bg-white border-slate-200/90 hover:border-slate-300'
                  : 'bg-slate-100/80 border-slate-200 opacity-85'
              }`}
            >
              <div>
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {isOptimal && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Award className="w-3.5 h-3.5" />
                      {t.taxTab.optimalBadge}
                    </span>
                  )}
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {t.taxTab.selectedBadge}
                    </span>
                  )}
                  {!regime.isEligible && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertCircle className="w-3 h-3" />
                      {t.taxTab.notEligibleBadge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-base font-bold text-slate-900 mb-4">
                  {lang === 'ru' ? regime.nameRu : regime.nameUz}
                </h4>

                {/* Monthly & Annual Tax Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      {t.taxTab.monthlyTax}
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 whitespace-nowrap">
                      {formatUzs(regime.monthlyTaxUzs, lang, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      {t.taxTab.annualTax}
                    </span>
                    <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                      {formatUzs(regime.annualTaxUzs, lang, currency)}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[11px] text-slate-500 block mb-0.5">
                      {t.taxTab.effectiveLoad}
                    </span>
                    <span
                      className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                        isOptimal
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {regime.effectiveRatePercent}%
                    </span>
                  </div>
                </div>

                {/* Breakdown Items */}
                <ul className="space-y-2 mb-4">
                  {breakdownList.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Ineligibility Reason Alert */}
                {!regime.isEligible && ineligibilityReason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-4 leading-relaxed">
                    {ineligibilityReason}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectLegalForm(regimeId)}
                disabled={!regime.isEligible}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  !regime.isEligible
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                {!regime.isEligible
                  ? t.taxTab.notEligibleBadge
                  : isSelected
                  ? t.taxTab.selectedBadge
                  : t.taxTab.selectRegimeBtn}
              </button>
            </div>
          );
        })}
      </div>

      {/* Uzbekistan Entrepreneur Tax & Registration Guide */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 mb-3">
          {lang === 'ru'
            ? 'Памятка предпринимателя РУз (Регистрация и сроки уплаты на my.soliq.uz)'
            : "O'zR tadbirkori eslatmasi (my.soliq.uz da ro'yxatdan o'tish va to'lov muddatlari)"}
        </h4>
        <div className="grid grid-cols-1 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {lang === 'ru'
                  ? '1. Онлайн-регистрация за 15 мин'
                  : '1. 15 daqiqada onlayn ro‘yxatdan o‘tish'}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {lang === 'ru'
                ? 'Самозанятый оформляется через приложение Soliq (бесплатно). ЯТТ и МЧЖ регистрируются онлайн на портале new.birdarcha.uz / my.gov.uz.'
                : "O'zini o'zi band qilish Soliq ilovasi orqali (bepul). YaTT va MChJ esa new.birdarcha.uz / my.gov.uz orqali onlayn ochiladi."}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
              <CalendarClock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                {lang === 'ru'
                  ? '2. Сроки сдачи отчетов и оплаты'
                  : '2. Soliq hisobotlari muddatlari'}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {lang === 'ru'
                ? 'Налог с оборота (4%) и соцналог (12%) — ежемесячно до 15-го числа. Отчетность и уплата НДС (12%) — ежемесячно до 20-го числа.'
                : "Aylanmadan soliq (4%) va ijtimoiy soliq (12%) — har oyning 15-sanasigacha. QQS (12%) hisoboti va to'lovi — har oyning 20-sanasigacha."}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
              <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {lang === 'ru'
                  ? '3. Онлайн-ККМ и фискальный QR'
                  : '3. Onlayn-NKM va fiskal QR-chek'}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {lang === 'ru'
                ? 'Для розницы, общепита и услуг обязательна онлайн-ККМ (виртуальная касса) и выдача чека с QR-кодом + прием Humo/Uzcard/Click/Payme.'
                : "Chakana savdo, umumiy ovqatlanish va xizmatlarda onlayn-NKM (virtual kassa) va QR-kodli chek berish hamda Humo/Uzcard/Click/Payme qabuli shart."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
