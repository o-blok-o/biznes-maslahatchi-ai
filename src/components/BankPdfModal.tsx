import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  FileSpreadsheet,
  FileText,
  Presentation,
  Printer,
  Scale,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  BusinessInputs,
  Currency,
  FinancialResults,
  Language,
} from '../types/business';
import { TASHKENT_DISTRICTS } from '../data/tashkentDistricts';
import { TRANSLATIONS } from '../data/translations';
import {
  calculateFinancials,
  formatUzs,
  getActiveCompetitors,
  getBusinessDisplayName,
  getUzbekistanLegalRoadmap,
  USD_RATE_UZS,
} from '../utils/calculations';
import { exportFinancialModelCsv } from '../utils/exportCsv';

export type DocMode = 'owner' | 'teo' | 'deck';

interface BankPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  inputs: BusinessInputs;
  results: FinancialResults;
  initialDocMode?: DocMode;
}

export const BankPdfModal: React.FC<BankPdfModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  inputs,
  results,
  initialDocMode = 'teo',
}) => {
  const [docMode, setDocMode] = useState<DocMode>(initialDocMode);

  useEffect(() => {
    if (isOpen) {
      setDocMode(initialDocMode);
    }
  }, [isOpen, initialDocMode]);

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

  const t = TRANSLATIONS[lang];
  const district = TASHKENT_DISTRICTS[inputs.district];
  const competitors = getActiveCompetitors(inputs, lang);
  const optimalTax = results.taxRegimes[results.optimalTaxRegimeId];
  const todayStr = new Date().toLocaleDateString(
    lang === 'ru' ? 'ru-RU' : 'uz-UZ'
  );
  const businessName = getBusinessDisplayName(inputs, lang);
  const isUsd = currency === 'USD';
  const fmt = (val: number) => formatUzs(val, lang, currency);
  const fmtChartCell = (uzsVal: number) =>
    isUsd
      ? `$${(uzsVal / USD_RATE_UZS / 1000).toFixed(1)}k`
      : `${(uzsVal / 1_000_000).toFixed(1)}M`;

  const paybackText =
    results.paybackMonths > 0
      ? `${results.paybackMonths} ${t.monthsUnit} (ROI ${results.annualRoiPercent}%)`
      : lang === 'ru'
      ? 'Не окупается (Убыток)'
      : "O'zini oqlamaydi (Zarar)";

  const stress20Rev = Math.round(inputs.expectedMonthlyRevenueUzs * 0.8);
  const stress20Results = calculateFinancials(
    { ...inputs, expectedMonthlyRevenueUzs: stress20Rev },
    currency
  );
  const stress20Net = stress20Results.netMonthlyProfitUzs;
  const legalRoadmap = getUzbekistanLegalRoadmap(inputs, results, lang, currency);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:static print:inset-auto print:bg-white print:p-0 print:block print:overflow-visible animate-fade-up"
    >
      <div className="bg-white text-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto print-only-container">
        {/* Top Modal Action Bar & Preset Switcher (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold leading-tight">
                {docMode === 'owner'
                  ? lang === 'ru'
                    ? 'План для предпринимателя: пошаговый путь и законы РУз'
                    : "Tadbirkor rejasi: qadam-baqadam yo'l xaritasi va O'zR qonunlari"
                  : docMode === 'teo'
                  ? t.pdfModal.modalTitle
                  : lang === 'ru'
                  ? 'Готовая презентация бизнес-плана (Pitch Deck — 6 слайдов)'
                  : 'Tayyor biznes-reja taqdimoti (Pitch Deck — 6 slayd)'}
              </h3>
              <span className="text-[11px] text-slate-400">
                {lang === 'ru'
                  ? 'Мгновенная генерация по вашим расчетам без задержек и искажений'
                  : 'Hisob-kitoblaringiz asosida darhol shakllantirilgan hujjat'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Document Preset Mode Switcher */}
            <div className="flex flex-wrap items-center bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1">
              <button
                type="button"
                onClick={() => setDocMode('owner')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  docMode === 'owner'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ru'
                    ? 'План для бизнеса (Путь + Законы)'
                    : "Biznes rejasi (Yo'l + Qonunlar)"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDocMode('teo')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  docMode === 'teo'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ru'
                    ? 'Банковское ТЭО (8 разд.)'
                    : "Bank TIO (8 bo'lim)"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDocMode('deck')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  docMode === 'deck'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ru'
                    ? 'Презентация (6 слайдов)'
                    : 'Taqdimot (6 slayd)'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                exportFinancialModelCsv(inputs, results, lang, currency)
              }
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t.pdfModal.printBtn}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTENT: Owner Path (Laws of Uzbekistan), 8-Section Bank TEO, or 6-Slide Pitch Deck */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 text-xs leading-relaxed">
          {docMode === 'owner' ? (
            /* ==================== MODE 0: ENTREPRENEUR ROADMAP & UZBEKISTAN LAW PLAN ==================== */
            <div className="space-y-6 tabular-nums">
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {lang === 'ru'
                      ? 'РАБОЧИЙ ПЛАН ПРЕДПРИНИМАТЕЛЯ • ОТДЕЛЬНО ОТ БАНКА'
                      : 'TADBIRKORNING ISHCHI REJASI • BANKDAN ALOHIDA'}
                  </span>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1.5">
                    {lang === 'ru'
                      ? `Бизнес-план и пошаговый маршрут: «${businessName}»`
                      : `Biznes-reja va yo'l xaritasi: «${businessName}»`}
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {legalRoadmap.districtName} • {inputs.areaSqm} {t.sqmUnit} •{' '}
                    {inputs.staffCount} {t.peopleUnit} • {todayStr}
                  </p>
                </div>
                <div className="text-left sm:text-right bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 shrink-0">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    {lang === 'ru' ? 'Цель по прибыли' : 'Foyda maqsadi'}
                  </span>
                  <strong className="text-base font-extrabold text-emerald-700 whitespace-nowrap">
                    {fmt(results.netMonthlyProfitUzs)}/{lang === 'ru' ? 'мес' : 'oy'}
                  </strong>
                  <span className="text-[10px] text-emerald-700 block whitespace-nowrap">
                    {paybackText}
                  </span>
                </div>
              </div>

              {/* 1. Owner Operational Targets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 block">
                    {lang === 'ru' ? 'Бюджет старта' : 'Start budjeti'}
                  </span>
                  <strong className="text-sm font-extrabold text-slate-900 whitespace-nowrap">
                    {fmt(results.capex.totalInvestmentUzs)}
                  </strong>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 block">
                    {lang === 'ru' ? 'План потока' : 'Kunlik reja'}
                  </span>
                  <strong className="text-sm font-extrabold text-indigo-700 whitespace-nowrap">
                    ~{results.dailyCustomersNeeded}{' '}
                    {lang === 'ru' ? 'кл./день' : 'mijoz/kun'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 block">
                    {lang === 'ru' ? 'Точка в ноль' : 'Zararsizlik'}
                  </span>
                  <strong className="text-sm font-extrabold text-amber-700 whitespace-nowrap">
                    ~{results.breakEvenDailyCustomers}{' '}
                    {lang === 'ru' ? 'кл./день' : 'mijoz/kun'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 block">
                    {lang === 'ru' ? 'Режим НК РУз' : "O'zR SK rejimi"}
                  </span>
                  <strong className="text-xs font-extrabold text-emerald-700">
                    {legalRoadmap.recommendedTaxFormTitle}
                  </strong>
                </div>
              </div>

              {/* 2. Legislation Compliance Checklist of Uzbekistan */}
              <div>
                <h2 className="text-xs font-extrabold uppercase bg-amber-50 px-3 py-1.5 border-l-4 border-amber-500 mb-2.5 flex items-center gap-1.5 text-slate-900">
                  <Scale className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {lang === 'ru'
                      ? '1. ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ ЗАКОНОДАТЕЛЬСТВА РУЗ (2026)'
                      : "1. O'ZBEKISTON RESPUBLIKASI QONUNCHILIGI TALABLARI (2026)"}
                  </span>
                </h2>
                <div className="mb-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                  <strong className="text-slate-900">
                    {lang === 'ru' ? 'Налоговое основание: ' : 'Soliq asosi: '}
                  </strong>
                  {legalRoadmap.registrationBasis}
                </div>
                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-left">
                      <th className="p-2 border border-slate-300 w-[22%]">
                        {lang === 'ru' ? 'Сфера / Портал' : "Yo'nalish / Portal"}
                      </th>
                      <th className="p-2 border border-slate-300 w-[28%]">
                        {lang === 'ru' ? 'Норма закона РУз' : "O'zR qonun normasi"}
                      </th>
                      <th className="p-2 border border-slate-300">
                        {lang === 'ru'
                          ? 'Что обязан сделать предприниматель'
                          : 'Tadbirkor bajarishi shart'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {legalRoadmap.requirements.map((req, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border border-slate-300 align-top">
                          <div className="font-bold text-slate-900">
                            {req.category}
                          </div>
                          <div className="text-[10px] font-semibold text-indigo-700 mt-0.5">
                            {req.portalOrAuthority}
                          </div>
                        </td>
                        <td className="p-2 border border-slate-300 align-top">
                          <div className="font-semibold text-slate-800">
                            {req.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {req.lawRef}
                          </div>
                        </td>
                        <td className="p-2 border border-slate-300 align-top text-slate-700">
                          {req.actionRequired}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 3. Step-by-Step Entrepreneur Execution Path */}
              <div>
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 px-3 py-1.5 border-l-4 border-indigo-600 mb-2.5">
                  {lang === 'ru'
                    ? '2. ПОШАГОВЫЙ МАРШРУТ ПРЕДПРИНИМАТЕЛЯ (ОТ ДНЯ 1 ДО ОКУПАЕМОСТИ)'
                    : "2. TADBIRKORNING BOSQICHMA-BOSQICH YO'L XARITASI (1-KUNDAN QOPLASHGACHA)"}
                </h2>
                <div className="space-y-2.5">
                  {legalRoadmap.pathSteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="border border-slate-300 rounded-xl p-3 bg-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold whitespace-nowrap">
                            {lang === 'ru'
                              ? `Шаг ${step.stepNumber} • ${step.timeframe}`
                              : `${step.stepNumber}-qadam • ${step.timeframe}`}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">
                            {step.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {step.targetKpi}
                        </span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-700 pl-2">
                        {step.actions.map((act, i) => (
                          <li key={i}>• {act}</li>
                        ))}
                      </ul>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[10px] text-amber-900">
                        <strong>
                          {lang === 'ru'
                            ? 'Правовой контроль: '
                            : 'Huquqiy nazorat: '}
                        </strong>
                        {step.legalNote}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Monthly Tax & Compliance Calendar */}
              <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50">
                <h3 className="text-xs font-extrabold uppercase text-slate-900 mb-2">
                  {lang === 'ru'
                    ? '3. ЕЖЕМЕСЯЧНЫЙ КАЛЕНДАРЬ ОБЯЗАТЕЛЬНЫХ ОТЧЕТОВ И ПЛАТЕЖЕЙ'
                    : "3. OYLIK MAJBURIY SOLIQ HISOBOTI VA TO'LOV TAQVIMI"}
                </h3>
                <ul className="space-y-1 text-[11px] text-slate-700">
                  {legalRoadmap.monthlyComplianceCalendar.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : docMode === 'teo' ? (
            /* ==================== MODE 1: DEEP 8-SECTION BANK TEO ==================== */
            <div className="space-y-6 tabular-nums">
              {/* Official Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600">
                  {t.pdfModal.docHeaderOrg}
                </p>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  {t.pdfModal.docTitle}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  {t.pdfModal.docSubtitle} ({isUsd ? 'USD, 1$ = 12 850 UZS' : 'UZS'}
                  ) • № ТЭО-{inputs.district.toUpperCase()}-2026
                </p>
              </div>

              {/* Section 1: Formal Banking Project Passport */}
              <div>
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 px-3 py-1.5 border-l-4 border-emerald-600 mb-3">
                  {t.pdfModal.section1Passport}
                </h2>
                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <tbody>
                    <tr>
                      <td className="p-2.5 bg-slate-50 text-slate-600 font-medium border border-slate-300 w-[24%]">
                        {lang === 'ru'
                          ? 'Направление проекта:'
                          : "Loyiha yo'nalishi:"}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 border border-slate-300 w-[26%]">
                        {businessName}
                      </td>
                      <td className="p-2.5 bg-slate-50 text-slate-600 font-medium border border-slate-300 w-[24%]">
                        {lang === 'ru'
                          ? 'Локация (Ташкент):'
                          : 'Joylashuv hududi:'}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 border border-slate-300 w-[26%]">
                        {lang === 'ru' ? district.nameRu : district.nameUz}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-slate-50 text-slate-600 font-medium border border-slate-300">
                        {lang === 'ru'
                          ? 'Налоговый режим (НК РУз):'
                          : "Soliq rejimi (O'zR SK):"}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 border border-slate-300">
                        {lang === 'ru'
                          ? results.activeTaxRegime.nameRu
                          : results.activeTaxRegime.nameUz}
                      </td>
                      <td className="p-2.5 bg-slate-50 text-slate-600 font-medium border border-slate-300">
                        {lang === 'ru'
                          ? 'Помещение / Штат:'
                          : 'Maydon / Xodimlar:'}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 border border-slate-300 whitespace-nowrap">
                        {inputs.areaSqm} {t.sqmUnit} / {inputs.staffCount}{' '}
                        {t.peopleUnit}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-slate-50 text-slate-600 font-medium border border-slate-300">
                        {lang === 'ru'
                          ? 'Общие инвестиции (CAPEX):'
                          : 'Jami investitsiya (CAPEX):'}
                      </td>
                      <td className="p-2.5 font-bold text-emerald-700 border border-slate-300 whitespace-nowrap">
                        {fmt(results.capex.totalInvestmentUzs)}
                      </td>
                      <td className="p-2.5 bg-slate-50 text-slate-600 font-medium border border-slate-300">
                        {lang === 'ru'
                          ? 'Окупаемость / ROI:'
                          : 'Qoplash muddati / ROI:'}
                      </td>
                      <td
                        className={`p-2.5 font-bold border border-slate-300 whitespace-nowrap ${
                          results.paybackMonths > 0
                            ? 'text-indigo-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {paybackText}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-slate-50 text-slate-600 font-medium border border-slate-300">
                        {lang === 'ru'
                          ? 'Чистая прибыль / мес:'
                          : 'Oylik sof foyda:'}
                      </td>
                      <td className="p-2.5 font-bold text-emerald-700 border border-slate-300 whitespace-nowrap">
                        {fmt(results.netMonthlyProfitUzs)} /{' '}
                        {lang === 'ru' ? 'мес' : 'oy'}
                      </td>
                      <td className="p-2.5 bg-slate-50 text-slate-600 font-medium border border-slate-300">
                        {lang === 'ru'
                          ? 'Точка безубыточности:'
                          : 'Zararsizlik nuqtasi:'}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 border border-slate-300 whitespace-nowrap">
                        {fmt(results.breakEvenMonthlyRevenueUzs)} /{' '}
                        {lang === 'ru' ? 'мес' : 'oy'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 2: District, Market & 3 Competitors */}
              <div>
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 px-3 py-1.5 border-l-4 border-emerald-600 mb-2">
                  {t.pdfModal.section2Market}
                </h2>
                <p className="text-slate-700 mb-2.5">
                  {lang === 'ru' ? district.summaryRu : district.summaryUz}
                </p>
                <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {t.marketTab.rentRate}
                    </span>
                    <strong className="text-slate-900">
                      {fmt(district.rentPerSqmUzs)}/m²
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {t.marketTab.footTraffic}
                    </span>
                    <strong className="text-slate-900">
                      {district.trafficScore} / 100
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {t.marketTab.purchasingPower}
                    </span>
                    <strong className="text-slate-900">
                      {district.purchasingPowerScore} / 100
                    </strong>
                  </div>
                </div>

                {/* Competitors Table */}
                <table className="w-full border border-slate-300 text-[10px] mb-1.5">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="p-1.5 text-left">
                        {lang === 'ru' ? 'Конкурент' : 'Raqobatchi'}
                      </th>
                      <th className="p-1.5 text-right">
                        {t.marketTab.avgCheck}
                      </th>
                      <th className="p-1.5 text-left">
                        {t.marketTab.weaknessLabel}
                      </th>
                      <th className="p-1.5 text-left">
                        {lang === 'ru'
                          ? 'Конкурентное преимущество (УТП)'
                          : 'Ustunlik strategiyasi (UTP)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {competitors.map((comp, idx) => (
                      <tr key={idx}>
                        <td className="p-1.5 font-semibold text-slate-900">
                          {comp.name} (★{comp.rating})
                        </td>
                        <td className="p-1.5 text-right font-semibold">
                          {fmt(comp.avgCheckUzs)}
                        </td>
                        <td className="p-1.5 text-slate-600">
                          {lang === 'ru' ? comp.weaknessRu : comp.weaknessUz}
                        </td>
                        <td className="p-1.5 text-emerald-800 font-medium">
                          {lang === 'ru' ? comp.uspAdviceRu : comp.uspAdviceUz}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-slate-500">
                  {lang === 'ru'
                    ? 'Источники данных: ставки аренды — OLX Недвижимость / Uybor.uz / CMWP Ташкент; демография и доходы — stat.uz; карточки конкурентов и чеки — 2GIS Ташкент.'
                    : "Ma'lumot manbalari: ijara narxlari — OLX / Uybor.uz; demografiya va daromadlar — stat.uz; raqobatchilar va cheklar — 2GIS Toshkent."}
                </p>
              </div>

              {/* Section 3 & 4: CAPEX, OPEX & Unit Economics */}
              <div>
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 px-3 py-1.5 border-l-4 border-emerald-600 mb-3">
                  {t.pdfModal.section3CapexOpex}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <table className="w-full border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="p-2 text-left">CAPEX</th>
                        <th className="p-2 text-right">
                          {isUsd ? 'USD ($)' : t.uzsUnit}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2">
                          {lang === 'ru'
                            ? 'Собственные средства инициатора'
                            : 'Tashabbuskorning shaxsiy mablag‘i'}
                        </td>
                        <td className="p-2 text-right font-semibold whitespace-nowrap">
                          {fmt(inputs.ownCapitalUzs)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">
                          {lang === 'ru'
                            ? 'Заемные средства банка (кредит)'
                            : 'Jalab qilinadigan bank krediti'}
                        </td>
                        <td className="p-2 text-right font-semibold whitespace-nowrap">
                          {fmt(inputs.loanAmountUzs)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">
                          {t.businessPlanTab.capexEquipment} (
                          {results.capex.equipmentPercent}%)
                        </td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {fmt(results.capex.equipmentUzs)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">
                          {t.businessPlanTab.capexRenovation} (
                          {results.capex.renovationPercent}%)
                        </td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {fmt(results.capex.renovationUzs)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">
                          {t.businessPlanTab.capexInventory} (
                          {results.capex.inventoryPercent}%)
                        </td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {fmt(results.capex.inventoryMarketingUzs)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">
                          {t.businessPlanTab.capexReserve} (
                          {results.capex.reservePercent}%)
                        </td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {fmt(results.capex.reserveRegistrationUzs)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="p-2">{t.businessPlanTab.capexTotal}</td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {fmt(results.capex.totalInvestmentUzs)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="w-full border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="p-2 text-left">
                          OPEX ({isUsd ? '$/мес' : t.perMonthUnit})
                        </th>
                        <th className="p-2 text-right">
                          {isUsd ? 'USD ($)' : t.uzsUnit}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2">
                          {lang === 'ru'
                            ? 'Плановая ежемесячная выручка'
                            : 'Rejalashtirilgan oylik tushum'}
                        </td>
                        <td className="p-2 text-right font-bold text-emerald-700 whitespace-nowrap">
                          {fmt(inputs.expectedMonthlyRevenueUzs)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">{t.businessPlanTab.opexRent}</td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {fmt(results.opex.rentUzs)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">
                          {t.businessPlanTab.opexPayroll} ({inputs.staffCount}{' '}
                          {t.peopleUnit})
                        </td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {fmt(results.opex.payrollGrossUzs)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">
                          {t.businessPlanTab.opexCogs} ({inputs.cogsPercent}%) +{' '}
                          {lang === 'ru' ? 'коммуналка 6%' : 'kommunal 6%'}
                        </td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {fmt(
                            results.opex.cogsUzs +
                              results.opex.utilitiesAndMarketingUzs
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">{t.businessPlanTab.opexTax}</td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {fmt(results.activeTaxRegime.monthlyTaxUzs)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">{t.businessPlanTab.opexLoan}</td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {fmt(results.selectedBankProgramResult.monthlyPaymentUzs)}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50 font-bold">
                        <td className="p-2">
                          {lang === 'ru'
                            ? 'Чистая прибыль в месяц'
                            : 'Oylik sof foyda'}
                        </td>
                        <td className="p-2 text-right text-emerald-800 whitespace-nowrap">
                          {fmt(results.netMonthlyProfitUzs)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Unit Economics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">
                      {lang === 'ru' ? 'Средний чек' : "O'rtacha chek"}
                    </span>
                    <strong>{fmt(results.estimatedAvgCheckUzs)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {lang === 'ru' ? 'План клиентов/день' : 'Kunlik mijoz rejasi'}
                    </span>
                    <strong>~{results.dailyCustomersNeeded}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {lang === 'ru' ? 'В ноль (клиентов/день)' : 'Zararsizlik/kun'}
                    </span>
                    <strong>~{results.breakEvenDailyCustomers}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {lang === 'ru' ? 'Запас прочности' : 'Xavfsizlik zaxirasi'}
                    </span>
                    <strong
                      className={
                        results.safetyMarginPercent >= 0
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }
                    >
                      {results.safetyMarginPercent >= 0 ? '+' : ''}
                      {results.safetyMarginPercent}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section 5 & 6: Tax Optimization + Credit Scoring Memorandum */}
              <div>
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 px-3 py-1.5 border-l-4 border-emerald-600 mb-2">
                  {t.pdfModal.section4TaxLoan}
                </h2>
                <div className="border border-slate-300 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] mb-2.5">
                  <div>
                    <span className="text-slate-500 block">
                      {lang === 'ru' ? 'Банк и программа:' : 'Bank va dastur:'}
                    </span>
                    <strong>
                      {lang === 'ru'
                        ? `${results.selectedBankProgramResult.bankNamesRu} — ${results.selectedBankProgramResult.nameRu}`
                        : `${results.selectedBankProgramResult.bankNamesUz} — ${results.selectedBankProgramResult.nameUz}`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {lang === 'ru'
                        ? 'Ставка / Срок / Льгота:'
                        : 'Stavka / Muddat / Imtiyoz:'}
                    </span>
                    <strong>
                      {results.selectedBankProgramResult.annualRatePercent}% ({lang === 'ru' ? results.selectedBankProgramResult.rateRangeRu : results.selectedBankProgramResult.rateRangeUz}) • {inputs.loanTermMonths} {t.monthsUnit} •{' '}
                      {lang === 'ru' ? 'льгота' : 'imtiyoz'} {inputs.gracePeriodMonths || 0} {t.monthsUnit}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {lang === 'ru'
                        ? 'EBITDA / Платеж банку:'
                        : "EBITDA / Bank to'lovi:"}
                    </span>
                    <strong>
                      {fmt(results.ebitdaUzs)} /{' '}
                      {fmt(results.selectedBankProgramResult.monthlyPaymentUzs)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {lang === 'ru' ? 'Скоринг банка:' : 'Bank skoringi:'}
                    </span>
                    <strong className="text-emerald-700">
                      {inputs.loanAmountUzs > 0
                        ? `${results.approvalProbabilityPercent}% (DSCR ${results.dscr}x)`
                        : lang === 'ru'
                        ? 'Без кредита'
                        : 'Kreditsiz'}
                    </strong>
                  </div>
                </div>
                {inputs.loanAmountUzs > 0 &&
                  results.selectedBankProgramResult.schedule.length > 0 && (
                    <div className="mb-2.5 overflow-x-auto">
                      <table className="w-full border border-slate-300 text-[9.5px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300">
                            <th className="p-1 text-left">
                              {lang === 'ru'
                                ? 'График кредита (1–12 мес.)'
                                : 'Kredit jadvali (1–12 oy)'}
                            </th>
                            {results.selectedBankProgramResult.schedule
                              .slice(0, 12)
                              .map((r) => (
                                <th key={r.month} className="p-1 text-right">
                                  M{r.month}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="p-1 font-semibold">
                              {lang === 'ru' ? 'Статус месяца' : 'Oy holati'}
                            </td>
                            {results.selectedBankProgramResult.schedule
                              .slice(0, 12)
                              .map((r) => (
                                <td
                                  key={r.month}
                                  className={`p-1 text-right font-semibold ${
                                    r.principalUzs === 0
                                      ? 'text-emerald-700 bg-emerald-50'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {r.principalUzs === 0
                                    ? lang === 'ru'
                                      ? 'Льгота'
                                      : 'Imtiyoz'
                                    : lang === 'ru'
                                    ? 'Долг+%'
                                    : 'Qarz+%'}
                                </td>
                              ))}
                          </tr>
                          <tr>
                            <td className="p-1 font-semibold">
                              {lang === 'ru' ? 'Платеж' : "To'lov"}
                            </td>
                            {results.selectedBankProgramResult.schedule
                              .slice(0, 12)
                              .map((r) => (
                                <td key={r.month} className="p-1 text-right">
                                  {fmtChartCell(r.paymentUzs)}
                                </td>
                              ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                  {(['self_employed', 'yatt', 'mchj'] as const).map((id) => {
                    const reg = results.taxRegimes[id];
                    const isOpt = results.optimalTaxRegimeId === id;
                    return (
                      <div
                        key={id}
                        className={`p-2 rounded border ${
                          isOpt
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="font-bold text-slate-900">
                          {lang === 'ru' ? reg.nameRu : reg.nameUz}
                          {isOpt &&
                            (lang === 'ru' ? ' (Оптимум)' : ' (Optimal)')}
                        </div>
                        <div className="text-slate-600 mt-0.5">
                          {reg.isEligible
                            ? `${fmt(reg.monthlyTaxUzs)}/${lang === 'ru' ? 'мес' : 'oy'} (${reg.effectiveRatePercent}%)`
                            : lang === 'ru'
                            ? 'Не подходит по лимиту'
                            : "Limitga to'g'ri kelmaydi"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 7: Full 12-Month Cashflow Table */}
              <div>
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 px-3 py-1.5 border-l-4 border-emerald-600 mb-2">
                  {t.pdfModal.section5Cashflow}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-300 text-[9.5px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="p-1 text-left">
                          {lang === 'ru' ? 'Статья / Мес' : "Ko'rsatkich"}
                        </th>
                        {results.cashflow12Months.map((m) => (
                          <th key={m.month} className="p-1 text-right">
                            {m.month}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-1 font-semibold">
                          {t.businessPlanTab.legendRevenue}
                        </td>
                        {results.cashflow12Months.map((m) => (
                          <td key={m.month} className="p-1 text-right">
                            {fmtChartCell(m.monthlyRevenue)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold">
                          {t.businessPlanTab.legendExpenses}
                        </td>
                        {results.cashflow12Months.map((m) => (
                          <td key={m.month} className="p-1 text-right text-slate-600">
                            {fmtChartCell(m.monthlyExpenses)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold">
                          {t.businessPlanTab.legendNetProfit}
                        </td>
                        {results.cashflow12Months.map((m) => (
                          <td
                            key={m.month}
                            className={`p-1 text-right font-bold ${
                              m.monthlyNet >= 0
                                ? 'text-emerald-700'
                                : 'text-rose-600'
                            }`}
                          >
                            {fmtChartCell(m.monthlyNet)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="p-1 font-semibold">
                          {lang === 'ru' ? 'Накопл. баланс' : 'Jamlanma'}
                        </td>
                        {results.cashflow12Months.map((m) => (
                          <td key={m.month} className="p-1 text-right font-semibold">
                            {fmtChartCell(m.cumulativeCashflow)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 8: Risk Stress-Test, KPI & Milestones Roadmap */}
              <div>
                <h2 className="text-xs font-extrabold uppercase bg-slate-100 px-3 py-1.5 border-l-4 border-emerald-600 mb-2">
                  {lang === 'ru'
                    ? '6. KPI, КОНТРОЛЬНЫЕ ВЕХИ (MILESTONES) И АНАЛИЗ РИСКОВ'
                    : "6. KPI, NAZORAT BOSQICHLARI (MILESTONES) VA XAVFLAR TAHLILI"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] mb-2.5">
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                    <div className="font-bold text-slate-900 mb-1">
                      {lang === 'ru'
                        ? 'Стресс-тест при падении выручки на 20%'
                        : 'Savdo 20% kamayganda stress-test'}
                    </div>
                    <p className="text-slate-600">
                      {lang === 'ru'
                        ? `Выручка в кризис: ${fmt(stress20Rev)}/мес → Чистый результат: ${fmt(stress20Net)}/мес. Рекомендуемый резерв ликвидности: ${fmt(results.opex.rentUzs * 2)}.`
                        : `Inqiroz tushumi: ${fmt(stress20Rev)}/oy → Sof natija: ${fmt(stress20Net)}/oy. Tavsiya etilgan zaxira: ${fmt(results.opex.rentUzs * 2)}.`}
                    </p>
                  </div>
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
                    <div className="font-bold text-slate-900 mb-1">
                      {lang === 'ru'
                        ? 'Операционные KPI эффективности'
                        : 'Operatsion samaradorlik KPIlari'}
                    </div>
                    <p className="text-slate-600">
                      {lang === 'ru'
                        ? `Выручка на 1 м²: ${fmt(Math.round(inputs.expectedMonthlyRevenueUzs / Math.max(1, inputs.areaSqm)))}/м² • На 1 сотр.: ${fmt(Math.round(inputs.expectedMonthlyRevenueUzs / Math.max(1, inputs.staffCount)))} • Чистая маржа: ${inputs.expectedMonthlyRevenueUzs > 0 ? Math.round((results.netMonthlyProfitUzs / inputs.expectedMonthlyRevenueUzs) * 100) : 0}%`
                        : `1 m² tushum: ${fmt(Math.round(inputs.expectedMonthlyRevenueUzs / Math.max(1, inputs.areaSqm)))} • 1 xodimga: ${fmt(Math.round(inputs.expectedMonthlyRevenueUzs / Math.max(1, inputs.staffCount)))} • Sof marja: ${inputs.expectedMonthlyRevenueUzs > 0 ? Math.round((results.netMonthlyProfitUzs / inputs.expectedMonthlyRevenueUzs) * 100) : 0}%`}
                    </p>
                  </div>
                </div>

                <table className="w-full border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-left">
                      <th className="p-1.5 whitespace-nowrap">
                        {lang === 'ru' ? 'Веха (Milestone)' : 'Bosqich'}
                      </th>
                      <th className="p-1.5">
                        {lang === 'ru' ? 'Ключевые задачи этапа' : 'Bosqich vazifalari'}
                      </th>
                      <th className="p-1.5 text-right whitespace-nowrap">
                        {lang === 'ru' ? 'Целевой KPI' : 'Maqsadli KPI'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-1.5 font-bold whitespace-nowrap">
                        {lang === 'ru' ? 'M1 • Старт и CAPEX' : 'M1 • Start va CAPEX'}
                      </td>
                      <td className="p-1.5">
                        {lang === 'ru'
                          ? `Регистрация (${optimalTax.nameRu}), аренда ${inputs.areaSqm} м², запуск оснащения и штата (${inputs.staffCount} сотр.)`
                          : `Ro'yxatdan o'tish (${optimalTax.nameUz}), ${inputs.areaSqm} m² ijara, ${inputs.staffCount} xodim`}
                      </td>
                      <td className="p-1.5 text-right font-semibold whitespace-nowrap">
                        65% • {fmt(results.cashflow12Months[0]?.monthlyRevenue ?? 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-bold whitespace-nowrap">
                        {lang === 'ru' ? 'M2–M3 • Безубыточность' : 'M2–M3 • Zararsizlik'}
                      </td>
                      <td className="p-1.5">
                        {lang === 'ru'
                          ? `Маркетинг 2GIS/Telegram, достижение порога ~${results.breakEvenDailyCustomers} кл./день`
                          : `2GIS/Telegram marketingi, kuniga ~${results.breakEvenDailyCustomers} mijoz chegarasi`}
                      </td>
                      <td className="p-1.5 text-right font-semibold whitespace-nowrap">
                        {fmt(results.breakEvenMonthlyRevenueUzs)}/{lang === 'ru' ? 'мес' : 'oy'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-bold whitespace-nowrap">
                        {lang === 'ru' ? 'M4–M6 • 100% мощности' : 'M4–M6 • 100% quvvat'}
                      </td>
                      <td className="p-1.5">
                        {lang === 'ru'
                          ? `Плановый трафик ~${results.dailyCustomersNeeded} кл./день при среднем чеке ${fmt(results.estimatedAvgCheckUzs)}`
                          : `Kuniga ~${results.dailyCustomersNeeded} mijoz va ${fmt(results.estimatedAvgCheckUzs)} chek`}
                      </td>
                      <td className="p-1.5 text-right font-semibold text-emerald-700 whitespace-nowrap">
                        +{fmt(results.netMonthlyProfitUzs)}/{lang === 'ru' ? 'мес' : 'oy'}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/60">
                      <td className="p-1.5 font-bold whitespace-nowrap">
                        {lang === 'ru'
                          ? `M${results.paybackMonths > 0 ? results.paybackMonths : 12} • Окупаемость`
                          : `M${results.paybackMonths > 0 ? results.paybackMonths : 12} • Qoplash`}
                      </td>
                      <td className="p-1.5">
                        {lang === 'ru'
                          ? `Полный возврат собственного капитала (${fmt(inputs.ownCapitalUzs)}) и плановое погашение кредита`
                          : `Shaxsiy kapitalni (${fmt(inputs.ownCapitalUzs)}) qaytarish va kreditni to'lash`}
                      </td>
                      <td className="p-1.5 text-right font-bold text-emerald-800 whitespace-nowrap">
                        ROI {results.annualRoiPercent}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature & Official Stamp Footer */}
              <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-800">
                    {t.pdfModal.applicantSign}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {t.pdfModal.dateLabel} {todayStr}
                  </p>
                </div>

                <div className="border-2 border-emerald-700 text-emerald-800 rounded-xl px-4 py-2 flex items-center gap-2 bg-emerald-50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div className="text-[10px] font-bold uppercase leading-tight">
                    {t.pdfModal.aiStampText}
                    <div className="text-[9px] font-normal text-emerald-700">
                      DSCR: {results.dscr}x • ROI: {results.annualRoiPercent}% •{' '}
                      {lang === 'ru' ? 'Предварительный расчет' : 'Dastlabki hisob-kitob'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-[10px] text-slate-500 leading-relaxed">
                {lang === 'ru'
                  ? 'Правовая оговорка: данный документ сформирован автоматически как предварительное технико-экономическое обоснование на основе введенных пользователем параметров. Показатели скоринга, налогов и рынка носят информационный характер и не являются банковской офертой или официальным заключением ТПП РУз.'
                  : "Huquqiy eslatma: ushbu hujjat foydalanuvchi kiritgan parametrlar asosida dastlabki texnik-iqtisodiy asoslash sifatida shakllantirilgan. Skoring, soliq va bozor ko'rsatkichlari ma'lumotnoma xarakteriga ega bo'lib, tijorat banki ofertasi yoki O'zR SSPning rasmiy xulosasi hisoblanmaydi."}
              </div>
            </div>
          ) : (
            /* ==================== MODE 2: 6-SLIDE BUSINESS PLAN PRESENTATION PRESET ==================== */
            <div className="space-y-6 tabular-nums">
              {/* SLIDE 1: Cover & Key Value Metrics */}
              <div className="print-slide-break rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 text-white p-7 sm:p-9 shadow-md">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-emerald-300 font-bold mb-6">
                  <span>
                    {lang === 'ru'
                      ? 'СЛАЙД 1 / 6 • ИНВЕСТИЦИОННАЯ ПРЕЗЕНТАЦИЯ'
                      : 'SLAYD 1 / 6 • INVESTITSION TAQDIMOT'}
                  </span>
                  <span>
                    {todayStr} • {lang === 'ru' ? 'ТПП РУз' : "O'zR SSP"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                  {businessName}
                </h1>
                <p className="text-sm text-indigo-200 mb-8 max-w-2xl">
                  {lang === 'ru'
                    ? `Коммерческий запуск в локации: ${district.nameRu} (${inputs.areaSqm} м², штат ${inputs.staffCount} сотр.). Форма: ${results.activeTaxRegime.nameRu}.`
                    : `Hudud: ${district.nameUz} (${inputs.areaSqm} m², ${inputs.staffCount} nafar xodim). Shakl: ${results.activeTaxRegime.nameUz}.`}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-white/10 border border-white/15 rounded-xl p-4">
                    <span className="text-[11px] text-indigo-200 block mb-1">
                      {t.kpiNetProfit}
                    </span>
                    <strong className="text-lg font-extrabold text-emerald-300">
                      {fmt(results.netMonthlyProfitUzs)}
                    </strong>
                  </div>
                  <div className="bg-white/10 border border-white/15 rounded-xl p-4">
                    <span className="text-[11px] text-indigo-200 block mb-1">
                      {t.businessPlanTab.capexTotal}
                    </span>
                    <strong className="text-lg font-extrabold text-white">
                      {fmt(results.capex.totalInvestmentUzs)}
                    </strong>
                  </div>
                  <div className="bg-white/10 border border-white/15 rounded-xl p-4">
                    <span className="text-[11px] text-indigo-200 block mb-1">
                      {t.kpiPayback}
                    </span>
                    <strong className="text-lg font-extrabold text-white">
                      {results.paybackMonths > 0
                        ? `${results.paybackMonths} ${t.monthsUnit}`
                        : '—'}
                    </strong>
                  </div>
                  <div className="bg-white/10 border border-white/15 rounded-xl p-4">
                    <span className="text-[11px] text-indigo-200 block mb-1">
                      {t.kpiRoiSub}
                    </span>
                    <strong className="text-lg font-extrabold text-emerald-300">
                      {results.annualRoiPercent}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* SLIDE 2: Location & Competitive Advantage */}
              <div className="print-slide-break rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-indigo-600 font-bold mb-4 pb-2 border-b border-slate-100">
                  <span>
                    {lang === 'ru'
                      ? 'СЛАЙД 2 / 6 • РЫНОК И ОТСТРОЙКА ОТ КОНКУРЕНТОВ'
                      : "SLAYD 2 / 6 • BOZOR VA RAQOBATCHILARDAN USTUNLIK"}
                  </span>
                  <span>{lang === 'ru' ? district.nameRu : district.nameUz}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 mb-5">
                  {lang === 'ru' ? district.summaryRu : district.summaryUz}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {competitors.map((comp, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm mb-1">
                          {comp.name} (★{comp.rating})
                        </div>
                        <div className="text-[11px] text-slate-500 mb-3">
                          {t.marketTab.avgCheck}:{' '}
                          <strong className="text-slate-800">
                            {fmt(comp.avgCheckUzs)}
                          </strong>
                        </div>
                        <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-2.5">
                          <strong>
                            {lang === 'ru' ? 'Слабое место:' : 'Zaif tomoni:'}
                          </strong>{' '}
                          {lang === 'ru' ? comp.weaknessRu : comp.weaknessUz}
                        </div>
                      </div>
                      <div className="text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                        <strong>
                          {lang === 'ru' ? 'Наше УТП:' : 'Bizning ustunlik:'}
                        </strong>{' '}
                        {lang === 'ru' ? comp.uspAdviceRu : comp.uspAdviceUz}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SLIDE 3: Daily Unit Economics & Break-Even */}
              <div className="print-slide-break rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-emerald-600 font-bold mb-4 pb-2 border-b border-slate-100">
                  <span>
                    {lang === 'ru'
                      ? 'СЛАЙД 3 / 6 • ЮНИТ-ЭКОНОМИКА И БЕЗУБЫТОЧНОСТЬ'
                      : 'SLAYD 3 / 6 • YUNIT-IQTISODIYOT VA ZARARSIZLIK'}
                  </span>
                  <span>{businessName}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">
                      {lang === 'ru'
                        ? 'План продаж на 1 день'
                        : '1 kunlik savdo rejasi'}
                    </span>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {fmt(results.dailyRevenueUzs)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      ~{results.dailyCustomersNeeded}{' '}
                      {lang === 'ru' ? 'клиентов/день' : 'mijoz/kun'} ×{' '}
                      {fmt(results.estimatedAvgCheckUzs)}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-xs text-indigo-700 block mb-1">
                      {lang === 'ru'
                        ? 'Точка безубыточности'
                        : 'Zararsizlik nuqtasi'}
                    </span>
                    <div className="text-2xl font-extrabold text-indigo-900">
                      {fmt(results.breakEvenMonthlyRevenueUzs)}
                    </div>
                    <p className="text-xs text-indigo-800 mt-1">
                      ~{results.breakEvenDailyCustomers}{' '}
                      {lang === 'ru' ? 'клиентов/день минимум' : 'mijoz/kun min'}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xs text-emerald-700 block mb-1">
                      {lang === 'ru'
                        ? 'Запас финансовой прочности'
                        : 'Moliyaviy xavfsizlik zaxirasi'}
                    </span>
                    <div className="text-2xl font-extrabold text-emerald-700">
                      {results.safetyMarginPercent >= 0 ? '+' : ''}
                      {results.safetyMarginPercent}%
                    </div>
                    <p className="text-xs text-emerald-800 mt-1">
                      {lang === 'ru'
                        ? 'Допустимая просадка спроса без убытка'
                        : 'Zararsiz tushum pasayishi zaxirasi'}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>
                      {lang === 'ru'
                        ? 'Стресс-устойчивость при падении спроса на −20%:'
                        : 'Talab −20% kamayganda stress-barqarorlik:'}
                    </span>
                  </div>
                  <span className="font-extrabold text-emerald-300">
                    {fmt(stress20Net)} / {lang === 'ru' ? 'мес' : 'oy'}
                  </span>
                </div>
              </div>

              {/* SLIDE 4: Investment Structure (CAPEX) & Monthly Budget (OPEX) */}
              <div className="print-slide-break rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-indigo-600 font-bold mb-4 pb-2 border-b border-slate-100">
                  <span>
                    {lang === 'ru'
                      ? 'СЛАЙД 4 / 6 • СТРУКТУРА ИНВЕСТИЦИЙ (CAPEX) И РАСХОДЫ (OPEX)'
                      : 'SLAYD 4 / 6 • SARMOYA (CAPEX) VA OYLIK BYUDJET (OPEX)'}
                  </span>
                  <span>
                    {inputs.areaSqm} {t.sqmUnit}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900">
                      {t.businessPlanTab.capexTitle} (
                      {fmt(results.capex.totalInvestmentUzs)})
                    </h4>
                    {[
                      {
                        label: t.businessPlanTab.capexEquipment,
                        pct: results.capex.equipmentPercent,
                        val: results.capex.equipmentUzs,
                        bar: 'bg-emerald-600',
                      },
                      {
                        label: t.businessPlanTab.capexRenovation,
                        pct: results.capex.renovationPercent,
                        val: results.capex.renovationUzs,
                        bar: 'bg-indigo-600',
                      },
                      {
                        label: t.businessPlanTab.capexInventory,
                        pct: results.capex.inventoryPercent,
                        val: results.capex.inventoryMarketingUzs,
                        bar: 'bg-amber-500',
                      },
                      {
                        label: t.businessPlanTab.capexReserve,
                        pct: results.capex.reservePercent,
                        val: results.capex.reserveRegistrationUzs,
                        bar: 'bg-teal-500',
                      },
                    ].map((r) => (
                      <div key={r.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>
                            {r.label} ({r.pct}%)
                          </span>
                          <strong>{fmt(r.val)}</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${r.bar}`}
                            style={{ width: `${r.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-l border-slate-100 pl-0 md:pl-6">
                    <h4 className="font-bold text-slate-900 mb-2">
                      {t.businessPlanTab.opexTitle}
                    </h4>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>{t.expectedRevenueLabel}</span>
                      <strong className="text-indigo-700">
                        +{fmt(inputs.expectedMonthlyRevenueUzs)}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>{t.businessPlanTab.opexRent}</span>
                      <span>−{fmt(results.opex.rentUzs)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>{t.businessPlanTab.opexPayroll}</span>
                      <span>−{fmt(results.opex.payrollGrossUzs)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>{t.businessPlanTab.opexCogs} + 6%</span>
                      <span>
                        −
                        {fmt(
                          results.opex.cogsUzs +
                            results.opex.utilitiesAndMarketingUzs
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>{t.businessPlanTab.opexTax}</span>
                      <span>−{fmt(results.activeTaxRegime.monthlyTaxUzs)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>{t.businessPlanTab.opexLoan}</span>
                      <span>
                        −{fmt(results.selectedBankProgramResult.monthlyPaymentUzs)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-extrabold text-emerald-700">
                      <span>{t.kpiNetProfit}</span>
                      <span>{fmt(results.netMonthlyProfitUzs)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 5: 12-Month Growth, Taxes & Bank Approval */}
              <div className="print-slide-break rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-emerald-600 font-bold mb-4 pb-2 border-b border-slate-100">
                  <span>
                    {lang === 'ru'
                      ? 'СЛАЙД 5 / 6 • НАЛОГИ, БАНКОВСКИЙ СКОРИНГ И 12 МЕСЯЦЕВ'
                      : 'SLAYD 5 / 6 • SOLIQLAR, BANK SKORINGI VA 12 OY'}
                  </span>
                  <span>DSCR {results.dscr}x</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                      {lang === 'ru'
                        ? 'Налоговая оптимизация (НК РУз)'
                        : "Soliq optimizatsiyasi (O'zR SK)"}
                    </span>
                    <div className="text-base font-extrabold text-slate-900">
                      {lang === 'ru' ? optimalTax.nameRu : optimalTax.nameUz}
                    </div>
                    <p className="text-xs text-emerald-800 mt-1">
                      {lang === 'ru' ? 'Экономия за год:' : 'Yillik tejash:'}{' '}
                      <strong>+{fmt(results.annualTaxSavingsUzs)}</strong>
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                    <span className="text-[11px] font-bold text-indigo-800 uppercase block mb-1">
                      {lang === 'ru'
                        ? 'Банковское финансирование'
                        : 'Bank moliyalashtirishi'}
                    </span>
                    <div className="text-base font-extrabold text-slate-900">
                      {inputs.loanAmountUzs <= 0
                        ? lang === 'ru'
                          ? 'Без кредита (свой капитал)'
                          : "Kreditsiz (o'z sarmoyasi)"
                        : lang === 'ru'
                        ? `Оценка шанса ${results.approvalProbabilityPercent}%`
                        : `Baholangan ehtimol ${results.approvalProbabilityPercent}%`}
                    </div>
                    <p className="text-xs text-indigo-800 mt-1">
                      {inputs.loanAmountUzs <= 0
                        ? lang === 'ru'
                          ? 'Кредитная нагрузка: 0 сум (финансирование не требуется)'
                          : "Kredit yuki: 0 so'm (kredit talab etilmaydi)"
                        : `${fmt(inputs.loanAmountUzs)} (${results.selectedBankProgramResult.annualRatePercent}% • ${inputs.loanTermMonths} ${t.monthsUnit})`}
                    </p>
                  </div>
                </div>

                <table className="w-full border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-2 text-left">
                        {lang === 'ru' ? 'Динамика года' : 'Yillik dinamika'}
                      </th>
                      {[0, 2, 5, 8, 11].map((idx) => (
                        <th key={idx} className="p-2 text-right">
                          {results.cashflow12Months[idx].month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-semibold">
                        {t.businessPlanTab.legendRevenue}
                      </td>
                      {[0, 2, 5, 8, 11].map((idx) => (
                        <td key={idx} className="p-2 text-right">
                          {fmtChartCell(
                            results.cashflow12Months[idx].monthlyRevenue
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">
                        {t.businessPlanTab.legendNetProfit}
                      </td>
                      {[0, 2, 5, 8, 11].map((idx) => (
                        <td
                          key={idx}
                          className="p-2 text-right font-bold text-emerald-700"
                        >
                          {fmtChartCell(
                            results.cashflow12Months[idx].monthlyNet
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-slate-50 font-semibold">
                      <td className="p-2">
                        {lang === 'ru' ? 'Накопительный итог' : 'Jamlanma balans'}
                      </td>
                      {[0, 2, 5, 8, 11].map((idx) => (
                        <td key={idx} className="p-2 text-right">
                          {fmtChartCell(
                            results.cashflow12Months[idx].cumulativeCashflow
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SLIDE 6: Execution Roadmap & Socio-Economic Impact */}
              <div className="print-slide-break rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-indigo-600 font-bold mb-4 pb-2 border-b border-slate-100">
                  <span>
                    {lang === 'ru'
                      ? 'СЛАЙД 6 / 6 • ПЛАН ЗАПУСКА (90 ДНЕЙ) И ЭФФЕКТ'
                      : 'SLAYD 6 / 6 • 90 KUNLIK REJA VA IJTIMOIY SAMARA'}
                  </span>
                  <span>chamber.uz</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-extrabold text-indigo-700 mb-1">
                      {lang === 'ru' ? 'ЭТАП 1 (Недели 1–2)' : '1-BOSQICH (1–2 hafta)'}
                    </div>
                    <p className="text-xs text-slate-700">
                      {lang === 'ru'
                        ? `Регистрация ${optimalTax.nameRu} на new.birdarcha.uz, подготовка ТЭО для банка и подписание аренды (${inputs.areaSqm} м²).`
                        : `new.birdarcha.uz orqali ${optimalTax.nameUz} ochish, bank uchun TIA tayyorlash va ${inputs.areaSqm} m² ijara shartnomasi.`}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-extrabold text-indigo-700 mb-1">
                      {lang === 'ru' ? 'ЭТАП 2 (Недели 3–6)' : '2-BOSQICH (3–6 hafta)'}
                    </div>
                    <p className="text-xs text-slate-700">
                      {lang === 'ru'
                        ? `Ремонт (${fmt(results.capex.renovationUzs)}), закупка оборудования (${fmt(results.capex.equipmentUzs)}), найм ${inputs.staffCount} сотр. и подключение онлайн-ККМ.`
                        : `Ta'mirlash (${fmt(results.capex.renovationUzs)}), uskunalar (${fmt(results.capex.equipmentUzs)}), ${inputs.staffCount} xodim yollash va onlayn-NKM.`}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-extrabold text-emerald-700 mb-1">
                      {lang === 'ru' ? 'ЭТАП 3 (Месяцы 2–3)' : '3-BOSQICH (2–3 oylar)'}
                    </div>
                    <p className="text-xs text-slate-700">
                      {lang === 'ru'
                        ? `Запуск маркетинга в 2GIS/Telegram, выход на ~${results.dailyCustomersNeeded} клиентов/день и окупаемость за ${results.paybackMonths > 0 ? `${results.paybackMonths} мес.` : 'плановый срок'}.`
                        : `2GIS/Telegram marketingi, kuniga ~${results.dailyCustomersNeeded} mijozga chiqish va sarmoyani qoplash.`}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-emerald-900">
                      {lang === 'ru'
                        ? 'Социально-экономический вклад проекта:'
                        : 'Loyihaning ijtimoiy-iqtisodiy hissasi:'}
                    </div>
                    <div className="text-xs text-emerald-800 mt-0.5">
                      {lang === 'ru'
                        ? `Создается ${inputs.staffCount} рабочих мест • Налоговые отчисления в бюджет: ${fmt(results.activeTaxRegime.annualTaxUzs)}/год.`
                        : `${inputs.staffCount} ta ish o'rni yaratiladi • Byudjetga yillik soliq tushumi: ${fmt(results.activeTaxRegime.annualTaxUzs)}.`}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 shrink-0">
                    {lang === 'ru'
                      ? 'Предварительный расчет • ТЭО'
                      : "Dastlabki hisob-kitob • TIA"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
