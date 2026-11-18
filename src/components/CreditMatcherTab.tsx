import React, { useCallback, useEffect, useState } from 'react';
import {
  Award,
  BadgeCheck,
  Building,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Gauge,
  Info,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  BankProgramId,
  BusinessInputs,
  Currency,
  FinancialResults,
  Language,
  RepaymentType,
} from '../types/business';
import { TRANSLATIONS } from '../data/translations';
import { UZ_ECONOMIC_CONFIG } from '../data/economicConfig';
import { formatMln, formatUzs } from '../utils/calculations';

interface CreditMatcherTabProps {
  lang: Language;
  currency: Currency;
  inputs: BusinessInputs;
  results: FinancialResults;
  onSelectBankProgram: (programId: BankProgramId) => void;
  onChangeInputs?: (updated: Partial<BusinessInputs>) => void;
}

const ALL_BANK_IDS: BankProgramId[] = [
  'preferential',
  'brb',
  'ipakyuli',
  'aab',
  'aloqa',
  'commercial',
  'hamkor',
  'trast',
  'sqb',
  'nbu',
];

export const CreditMatcherTab: React.FC<CreditMatcherTabProps> = ({
  lang,
  currency,
  inputs,
  results,
  onSelectBankProgram,
  onChangeInputs,
}) => {
  const t = TRANSLATIONS[lang];
  const [showSchedule, setShowSchedule] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() =>
    new Date().toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  );
  const [nextSyncCountdown, setNextSyncCountdown] = useState<number>(
    UZ_ECONOMIC_CONFIG.updateIntervalSeconds
  );
  const [cbuRatePercent, setCbuRatePercent] = useState<number>(
    UZ_ECONOMIC_CONFIG.cbuPolicyRatePercent
  );
  const [isRefreshingRates, setIsRefreshingRates] = useState<boolean>(false);

  const syncBankRates = useCallback(
    async (manual = false) => {
      if (manual) setIsRefreshingRates(true);
      try {
        const res = await fetch(
          manual ? '/api/bank-rates/refresh' : '/api/bank-rates',
          { method: manual ? 'POST' : 'GET' }
        );
        if (res.ok) {
          const data = (await res.json()) as {
            updatedAt?: string;
            nextUpdateInSeconds?: number;
            cbuRatePercent?: number;
          };
          if (typeof data.cbuRatePercent === 'number') {
            setCbuRatePercent(data.cbuRatePercent);
          }
          const ts = data.updatedAt ? new Date(data.updatedAt) : new Date();
          setLastSyncedAt(
            ts.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
          setNextSyncCountdown(
            data.nextUpdateInSeconds || UZ_ECONOMIC_CONFIG.updateIntervalSeconds
          );
        } else {
          setLastSyncedAt(
            new Date().toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
          setNextSyncCountdown(UZ_ECONOMIC_CONFIG.updateIntervalSeconds);
        }
      } catch {
        setLastSyncedAt(
          new Date().toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
        setNextSyncCountdown(UZ_ECONOMIC_CONFIG.updateIntervalSeconds);
      } finally {
        if (manual) setIsRefreshingRates(false);
      }
    },
    [lang]
  );

  useEffect(() => {
    void syncBankRates(false);
  }, [syncBankRates]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNextSyncCountdown((prev) => {
        if (prev <= 1) {
          void syncBankRates(false);
          return UZ_ECONOMIC_CONFIG.updateIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [syncBankRates]);

  const hasLoan = inputs.loanAmountUzs > 0;
  const repaymentType: RepaymentType = inputs.repaymentType || 'annuity';
  const gracePeriodMonths = inputs.gracePeriodMonths || 0;
  const activeMaxGrace = results.selectedBankProgramResult.maxGraceMonths;

  const getStatusBadge = (status: 'High' | 'Medium' | 'Low', prob: number) => {
    if (!hasLoan) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
          {lang === 'ru' ? 'Без кредита' : 'Kreditsiz'}
        </span>
      );
    }
    if (status === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          {prob}% • {t.statusApproved}
        </span>
      );
    }
    if (status === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
          <Info className="w-3 h-3 shrink-0" />
          {prob}% • {t.statusCollateral}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
        <XCircle className="w-3 h-3 shrink-0" />
        {prob}% • {t.statusRisk}
      </span>
    );
  };

  const gaugeWidth = !hasLoan
    ? 100
    : Math.min(100, Math.max(8, results.approvalProbabilityPercent));

  const ownSharePercent =
    results.capex.totalInvestmentUzs > 0
      ? Math.round(
          (inputs.ownCapitalUzs / results.capex.totalInvestmentUzs) * 100
        )
      : 0;

  const amortizationRows = results.selectedBankProgramResult.schedule;

  return (
    <div className="space-y-5 animate-fade-up tabular-nums">
      {/* Visual Color-Coded Bank Approval Meter */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm card-interactive">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 mt-0.5 shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900">
                {t.creditTab.dscrMeterTitle}:{' '}
                <span
                  className={`whitespace-nowrap ${
                    !hasLoan || results.approvalStatus === 'High'
                      ? 'text-emerald-600'
                      : results.approvalStatus === 'Medium'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {hasLoan
                    ? `${results.approvalProbabilityPercent}%`
                    : lang === 'ru'
                    ? 'Без кредита'
                    : 'Kreditsiz'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                {hasLoan
                  ? lang === 'ru'
                    ? `Учтены запас дохода (DSCR ${results.dscr}x), доля собственных средств (${ownSharePercent}% — банки РУз требуют 20–30%) и условия выбранной программы.`
                    : `Daromad zaxirasi (DSCR ${results.dscr}x), shaxsiy ulush (${ownSharePercent}% — banklar 20–30% talab qiladi) va dastur shartlari hisobga olingan.`
                  : lang === 'ru'
                  ? 'Кредитная сумма равна 0. Задайте сумму кредита в левой панели, чтобы оценить шанс одобрения банком.'
                  : "Kredit summasi 0. Bank tasdiqlash ehtimolini hisoblash uchun kredit summasini kiriting."}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-4 shrink-0 self-start sm:self-auto">
            <div>
              <span className="text-[11px] text-slate-500 block whitespace-nowrap">
                {t.creditTab.approvalProbLabel}
              </span>
              <span className="text-xl font-extrabold text-slate-900 whitespace-nowrap">
                {hasLoan ? `${results.approvalProbabilityPercent}%` : '—'}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[11px] text-slate-500 block whitespace-nowrap">DSCR</span>
              <span
                className={`text-lg font-extrabold whitespace-nowrap ${
                  !hasLoan || results.dscr >= 1.3
                    ? 'text-emerald-600'
                    : results.dscr >= 1.0
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {hasLoan ? `${results.dscr}x` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Color-Coded Gauge */}
        <div className="space-y-2.5">
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                results.approvalStatus === 'High'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  : results.approvalStatus === 'Medium'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600'
              }`}
              style={{ width: `${gaugeWidth}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span className="text-rose-600">
              10–41% ({lang === 'ru' ? 'Риск отказа' : 'Rad etish xavfi'})
            </span>
            <span className="text-amber-600">
              42–64% ({lang === 'ru' ? 'Нужен залог' : 'Garov kerak'})
            </span>
            <span className="text-emerald-700">
              65–91% ({lang === 'ru' ? 'Высокий шанс' : 'Yuqori imkoniyat'})
            </span>
          </div>

          <div
            className={`mt-3 p-3.5 rounded-xl border text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-300 ${
              results.approvalStatus === 'High'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : results.approvalStatus === 'Medium'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 shrink-0" />
              <span>
                {!hasLoan
                  ? lang === 'ru'
                    ? 'Кредит не требуется — проект финансируется за счет собственных средств'
                    : "Kredit talab etilmaydi — loyiha shaxsiy mablag' hisobidan moliyalashtiriladi"
                  : results.approvalStatus === 'High'
                  ? t.creditTab.approvalHigh
                  : results.approvalStatus === 'Medium'
                  ? t.creditTab.approvalMedium
                  : t.creditTab.approvalLow}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Periodic Bank Conditions Live Sync Banner */}
      <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 mt-1 sm:mt-0" />
          <div className="text-xs">
            <div className="font-bold flex flex-wrap items-center gap-2">
              <span>
                {lang === 'ru'
                  ? 'База тарифов 10 банков РУз (ставка ЦБ: '
                  : "O'zR 10 ta bank tariflari bazasi (MB asosiy stavkasi: "}
                {cbuRatePercent}%)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold">
                {lang === 'ru'
                  ? `Обновлено: ${lastSyncedAt}`
                  : `Yangilandi: ${lastSyncedAt}`}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-indigo-300 shrink-0" />
              <span>
                {lang === 'ru'
                  ? `Автоматическая синхронизация условий и льготных периодов каждые ${UZ_ECONOMIC_CONFIG.updateIntervalSeconds} сек. (следующая через ${nextSyncCountdown} сек.)`
                  : `Bank foizlari va imtiyozli davr shartlari har ${UZ_ECONOMIC_CONFIG.updateIntervalSeconds} soniyada avtomatik yangilanadi (keyingisi: ${nextSyncCountdown} son.)`}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void syncBankRates(true)}
          disabled={isRefreshingRates}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-60 border border-white/20 text-xs font-semibold transition-all active:scale-95 shrink-0"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-emerald-300 ${
              isRefreshingRates ? 'animate-spin' : ''
            }`}
          />
          <span>
            {lang === 'ru' ? 'Обновить сейчас' : 'Hozir yangilash'}
          </span>
        </button>
      </div>

      {/* Smart AI Top-3 Bank & Conditions Recommendation Engine */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-emerald-50/80 border border-indigo-200/90 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                {lang === 'ru'
                  ? 'ИИ-подбор из 10 банков: где брать кредит и на каких условиях'
                  : "10 ta bank ichidan AI-tanlov: qaysi bankdan va qanday shartda kredit olish kerak"}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {lang === 'ru'
                  ? 'Алгоритм проанализировал все 10 банков РУз по вашей нише, ставке, DSCR, сумме и подобрал оптимальный льготный период'
                  : "Algoritm barcha 10 ta bankni biznes yo'nalishingiz, stavka, DSCR va limit bo'yicha solishtirib eng qulay imtiyozli davrni tanladi"}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 shrink-0 self-start sm:self-auto">
            {lang === 'ru' ? 'Топ-3 из 10 банков' : '10 tadan Top-3'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {results.topRecommendedBanks.map((offer, idx) => {
            const rankBadge =
              idx === 0
                ? lang === 'ru'
                  ? '🏆 №1 Лучший выбор'
                  : '🏆 №1 Eng yaxshi tanlov'
                : idx === 1
                ? lang === 'ru'
                  ? '⚡ №2 Высокий шанс'
                  : '⚡ №2 Yuqori ehtimol'
                : lang === 'ru'
                ? '🛡️ №3 Альтернатива'
                : '🛡️ №3 Muqobil variant';

            const isApplied =
              inputs.selectedBankProgram === offer.id &&
              (!hasLoan ||
                (gracePeriodMonths === offer.recommendedGraceMonths &&
                  repaymentType === offer.recommendedRepaymentType));

            const schedLabel =
              offer.recommendedRepaymentType === 'differentiated'
                ? lang === 'ru'
                  ? 'Дифференцированный'
                  : 'Differensial'
                : lang === 'ru'
                ? 'Аннуитетный'
                : 'Annuitet';

            return (
              <div
                key={offer.id}
                className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                  idx === 0
                    ? 'bg-white border-emerald-400 ring-2 ring-emerald-500/15 shadow-sm'
                    : 'bg-white/95 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        idx === 0
                          ? 'bg-emerald-600 text-white'
                          : idx === 1
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rankBadge}
                    </span>
                    <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {offer.matchScore}/100
                    </span>
                  </div>

                  <div className="font-extrabold text-slate-900 text-sm">
                    {lang === 'ru' ? offer.bankNamesRu : offer.bankNamesUz}
                  </div>
                  <div className="text-[11px] text-slate-500 mb-3">
                    {lang === 'ru' ? offer.nameRu : offer.nameUz}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-3">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                      <span className="text-slate-500 block">
                        {lang === 'ru' ? 'Ставка и шанс' : 'Stavka va imkon'}
                      </span>
                      <strong className="text-slate-900 whitespace-nowrap">
                        {offer.annualRatePercent}% •{' '}
                        {hasLoan ? `${offer.approvalProbabilityPercent}%` : '—'}
                      </strong>
                      <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                        {lang === 'ru' ? offer.rateRangeRu : offer.rateRangeUz}
                      </span>
                    </div>
                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2">
                      <span className="text-emerald-700 block">
                        {lang === 'ru' ? 'Льготный период' : 'Imtiyozli davr'}
                      </span>
                      <strong className="text-emerald-900 whitespace-nowrap">
                        {hasLoan
                          ? `${offer.recommendedGraceMonths} ${t.monthsUnit}`
                          : lang === 'ru'
                          ? offer.graceRangeRu
                          : offer.graceRangeUz}
                      </strong>
                      <span className="block text-[10px] text-emerald-700/90 font-normal mt-0.5">
                        {lang === 'ru'
                          ? `Условия: ${offer.graceRangeRu}`
                          : `Shart: ${offer.graceRangeUz}`}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                      <span className="text-slate-500 block">
                        {lang === 'ru' ? 'Рекоменд. график' : 'Tavsiya jadval'}
                      </span>
                      <strong className="text-slate-900">{schedLabel}</strong>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                      <span className="text-slate-500 block">
                        {lang === 'ru'
                          ? 'В льготный период'
                          : 'Imtiyozli davrda'}
                      </span>
                      <strong className="text-slate-900 whitespace-nowrap">
                        {hasLoan
                          ? formatUzs(offer.graceMonthlyPaymentUzs, lang, currency)
                          : '—'}
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3 bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5">
                    {lang === 'ru'
                      ? offer.recommendationReasonRu
                      : offer.recommendationReasonUz}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onChangeInputs) {
                      onChangeInputs({
                        selectedBankProgram: offer.id,
                        gracePeriodMonths: hasLoan
                          ? offer.recommendedGraceMonths
                          : gracePeriodMonths,
                        repaymentType: hasLoan
                          ? offer.recommendedRepaymentType
                          : repaymentType,
                      });
                    } else {
                      onSelectBankProgram(offer.id);
                    }
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                    isApplied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : idx === 0
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 border border-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isApplied
                      ? lang === 'ru'
                        ? 'Применено в расчете'
                        : "Hisobga qo'llangan"
                      : lang === 'ru'
                      ? 'Применить банк и условия'
                      : 'Bank va shartlarni tanlash'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Comparison Table of All 10 Uzbekistan Banks */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm card-interactive">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {lang === 'ru'
                  ? 'Полное сравнение 10 банков Узбекистана (ставки, льготный период и залог)'
                  : "O'zbekistonning 10 ta bankini to'liq taqqoslash (stavka, imtiyozli davr va garov)"}
              </h4>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 tracking-wide">
              <th className="py-2.5 px-1">{t.creditTab.colProgram}</th>
              <th className="py-2.5 px-1 whitespace-nowrap">
                {lang === 'ru' ? 'Ставка и льгота' : 'Stavka va imtiyoz'}
              </th>
              <th className="py-2.5 px-1 whitespace-nowrap">
                {lang === 'ru' ? 'Платеж / перепл.' : "To'lov / ustama"}
              </th>
              <th className="py-2.5 px-1 whitespace-nowrap">
                {lang === 'ru' ? 'Шанс • DSCR' : 'Ehtimol • DSCR'}
              </th>
              <th className="py-2.5 px-1 text-right whitespace-nowrap">
                {t.creditTab.colAction}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px] sm:text-xs">
            {ALL_BANK_IDS.map((progId) => {
              const prog = results.bankPrograms[progId];
              if (!prog) return null;
              const isSelected = inputs.selectedBankProgram === progId;
              const isBestAi = results.recommendedBankId === progId;

              return (
                <tr
                  key={progId}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/60'
                      : isBestAi
                      ? 'bg-emerald-50/35'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2.5 px-1 align-top">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-bold text-slate-900">
                        {lang === 'ru' ? prog.bankNamesRu : prog.bankNamesUz}
                      </span>
                      {isBestAi && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                          {lang === 'ru' ? '🏆 Топ-1 AI' : '🏆 Top-1 AI'}
                        </span>
                      )}
                      {!prog.isEligibleByLimit && hasLoan && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                          {lang === 'ru'
                            ? `Лимит ${formatMln(prog.maxLoanUzs, 'ru', currency)}`
                            : `Limit ${formatMln(prog.maxLoanUzs, 'uz', currency)}`}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-slate-600 mt-0.5 leading-snug">
                      {lang === 'ru' ? prog.nameRu : prog.nameUz}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      {lang === 'ru' ? prog.collateralInfoRu : prog.collateralInfoUz}
                    </div>
                  </td>
                  <td className="py-2.5 px-1 align-top">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-100 font-bold text-emerald-700 border border-slate-200 whitespace-nowrap text-[11px]">
                        {prog.annualRatePercent}%
                      </span>
                      <span className="font-bold text-slate-900 whitespace-nowrap text-[11px]">
                        {lang === 'ru' ? prog.graceRangeRu : prog.graceRangeUz}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug max-w-[120px]">
                      {lang === 'ru' ? prog.rateRangeRu : prog.rateRangeUz}
                    </div>
                    {hasLoan && (
                      <div className="text-[10px] text-emerald-700 mt-1 leading-tight">
                        <div>
                          {lang === 'ru' ? 'рек.' : 'tavsiya'}{' '}
                          {prog.recommendedGraceMonths} {t.monthsUnit}:
                        </div>
                        <div className="font-bold whitespace-nowrap">
                          {formatUzs(prog.graceMonthlyPaymentUzs, lang, currency)}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-1 align-top whitespace-nowrap">
                    <div className="font-bold text-slate-900">
                      {formatUzs(prog.monthlyPaymentUzs, lang, currency)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {lang === 'ru' ? 'переплата:' : 'ustama:'}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-700">
                      {formatUzs(prog.totalInterestUzs, lang, currency)}
                    </div>
                  </td>
                  <td className="py-2.5 px-1 align-top whitespace-nowrap">
                    <div>
                      {getStatusBadge(
                        prog.approvalStatus,
                        prog.approvalProbabilityPercent
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 mt-1">
                      DSCR: {hasLoan ? `${prog.dscr}x` : '—'}
                    </div>
                  </td>
                  <td className="py-2.5 px-1 text-right align-top whitespace-nowrap">
                    <button
                      onClick={() => onSelectBankProgram(progId)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {isSelected
                        ? t.creditTab.activeProgramBtn
                        : t.creditTab.selectProgramBtn}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Month-by-Month Loan Schedule & Grace Period Controls */}
      {hasLoan && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setShowSchedule((prev) => !prev)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2.5">
              <CalendarRange className="w-4 h-4 text-indigo-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {lang === 'ru'
                    ? `Помесячный график погашения и льготного периода (${inputs.loanTermMonths} мес.)`
                    : `Oylar bo'yicha kredit va imtiyozli davr jadvali (${inputs.loanTermMonths} oy)`}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {lang === 'ru'
                    ? `Всего процентов за срок: ${formatUzs(
                        results.selectedBankProgramResult.totalInterestUzs,
                        lang,
                        currency
                      )} • Льготный период: ${gracePeriodMonths} мес.`
                    : `Jami foiz to'lovi: ${formatUzs(
                        results.selectedBankProgramResult.totalInterestUzs,
                        lang,
                        currency
                      )} • Imtiyozli davr: ${gracePeriodMonths} oy`}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
              {showSchedule
                ? lang === 'ru'
                  ? 'Свернуть'
                  : 'Yashirish'
                : lang === 'ru'
                ? 'Показать график'
                : "Jadvalni ko'rish"}
              {showSchedule ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {onChangeInputs && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 mr-1">
                  {lang === 'ru' ? 'Тип платежа:' : "To'lov turi:"}
                </span>
                <button
                  type="button"
                  onClick={() => onChangeInputs({ repaymentType: 'annuity' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    repaymentType === 'annuity'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'ru' ? 'Аннуитетный (равный)' : 'Annuitet (teng)'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChangeInputs({ repaymentType: 'differentiated' })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    repaymentType === 'differentiated'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'ru'
                    ? 'Дифференцированный (выгоднее)'
                    : 'Differensial (kam foiz)'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 mr-1">
                  {lang === 'ru'
                    ? `Льготный период в таблице (макс. ${activeMaxGrace} мес.):`
                    : `Jadvaldagi imtiyozli davr (maks. ${activeMaxGrace} oy):`}
                </span>
                {[0, 3, 6, 9, 12, 18, 24].map((g) => {
                  const exceedsBankMax =
                    g > Math.min(activeMaxGrace, Math.max(0, inputs.loanTermMonths - 3));
                  const isSelectedGrace = gracePeriodMonths === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={exceedsBankMax}
                      title={
                        exceedsBankMax
                          ? lang === 'ru'
                            ? `Выбранный банк допускает льготный период до ${activeMaxGrace} мес. (при сроке от ${g + 3} мес.)`
                            : `Tanlangan bank ${activeMaxGrace} oygacha imtiyozli davr beradi`
                          : undefined
                      }
                      onClick={() => onChangeInputs({ gracePeriodMonths: g })}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                        exceedsBankMax
                          ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                          : isSelectedGrace
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g === 0
                        ? lang === 'ru'
                          ? '0 мес.'
                          : '0 oy'
                        : `${g} ${t.monthsUnit}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showSchedule && (
            <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto max-h-80 overflow-y-auto animate-fade-up">
              <table className="w-full text-left border-collapse min-w-[660px] text-xs">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-2 px-2.5">
                      {lang === 'ru' ? 'Месяц' : 'Oy'}
                    </th>
                    <th className="py-2 px-2.5">
                      {lang === 'ru' ? 'Статус месяца' : 'Oy holati'}
                    </th>
                    <th className="py-2 px-2.5 text-right">
                      {lang === 'ru' ? 'Платеж' : "To'lov"}
                    </th>
                    <th className="py-2 px-2.5 text-right">
                      {lang === 'ru' ? 'Основной долг' : 'Asosiy qarz'}
                    </th>
                    <th className="py-2 px-2.5 text-right">
                      {lang === 'ru' ? 'Проценты банку' : 'Bank foizi'}
                    </th>
                    <th className="py-2 px-2.5 text-right">
                      {lang === 'ru' ? 'Остаток долга' : 'Qoldiq qarz'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {amortizationRows.map((row) => {
                    const isGraceMonth = row.principalUzs === 0;
                    return (
                      <tr
                        key={row.month}
                        className={
                          isGraceMonth
                            ? 'bg-emerald-50/75 hover:bg-emerald-50'
                            : 'hover:bg-slate-50'
                        }
                      >
                        <td className="py-2 px-2.5 font-semibold text-slate-900 whitespace-nowrap">
                          {row.month}
                        </td>
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          {isGraceMonth ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                              {lang === 'ru'
                                ? 'Льготный период (только %)'
                                : 'Imtiyozli davr (faqat %)'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
                              {lang === 'ru'
                                ? 'Основной долг + %'
                                : 'Asosiy qarz + %'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-right font-medium text-slate-900 whitespace-nowrap">
                          {formatUzs(row.paymentUzs, lang, currency)}
                        </td>
                        <td
                          className={`py-2 px-2.5 text-right font-semibold whitespace-nowrap ${
                            isGraceMonth ? 'text-slate-400' : 'text-emerald-700'
                          }`}
                        >
                          {isGraceMonth
                            ? lang === 'ru'
                              ? '0 (отсрочка)'
                              : '0 (kechiktirilgan)'
                            : formatUzs(row.principalUzs, lang, currency)}
                        </td>
                        <td className="py-2 px-2.5 text-right text-amber-700 whitespace-nowrap">
                          {formatUzs(row.interestUzs, lang, currency)}
                        </td>
                        <td className="py-2 px-2.5 text-right text-slate-600 whitespace-nowrap">
                          {formatUzs(row.balanceUzs, lang, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Concrete Collateral & State Guarantee Calculator (125% Bank Requirement) */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-indigo-900 mb-1">
              {lang === 'ru'
                ? 'Калькулятор залога и госпоручительства (125% требование банка)'
                : 'Garov va davlat kafilligi kalkulyatori (bankning 125% talabi)'}
            </h5>
            <p className="text-xs text-indigo-800 leading-relaxed">
              {t.creditTab.collateralAdviceText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-white/90 border border-indigo-200/80 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 block">
              {lang === 'ru'
                ? 'Требуемый залог банка (125%)'
                : 'Bank talab qiladigan garov (125%)'}
            </span>
            <span className="text-sm font-extrabold text-slate-900 whitespace-nowrap">
              {formatUzs(
                Math.round(inputs.loanAmountUzs * 1.25),
                lang,
                currency
              )}
            </span>
          </div>

          <div className="bg-white/90 border border-emerald-200 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 block">
              {lang === 'ru'
                ? 'Поручительство Фонда (до 50%)'
                : "Jamg'arma kafilligi (50% gacha)"}
            </span>
            <span className="text-sm font-extrabold text-emerald-700 whitespace-nowrap">
              {formatUzs(
                Math.round(inputs.loanAmountUzs * 0.5),
                lang,
                currency
              )}
            </span>
          </div>

          <div className="bg-white/90 border border-indigo-200/80 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 block">
              {lang === 'ru'
                ? 'Остаток залога от вас (75%)'
                : 'Sizdan talab qilinadigan qoldiq (75%)'}
            </span>
            <span className="text-sm font-extrabold text-indigo-800 whitespace-nowrap">
              {formatUzs(
                Math.round(inputs.loanAmountUzs * 0.75),
                lang,
                currency
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Bank Scoring Methodology Explainer Card */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 mb-3">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            {lang === 'ru'
              ? 'Откуда берутся цифры одобрения: методология скоринга банков РУз'
              : "Tasdiqlash foizlari qanday hisoblanadi: O'zbekiston banklari skoring metodologiyasi"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 text-[11px] text-slate-600 leading-relaxed">
          <div className="bg-white border border-slate-200/80 rounded-xl p-3">
            <strong className="text-slate-900 block mb-1">
              {lang === 'ru'
                ? '1. Коэффициент DSCR (Запас дохода)'
                : '1. DSCR koeffitsienti (Daromad zaxirasi)'}
            </strong>
            {lang === 'ru'
              ? 'Формула: (Выручка − OPEX − Налоги) / Платеж банку. Банки РУз (BRB, Агробанк, SQB, Капиталбанк, NBU) требуют DSCR ≥ 1.25–1.30x для «зеленой зоны».'
              : "Formula: (Tushum − OPEX − Soliqlar) / Kredit to'lovi. O'zbekiston banklari (BRB, Agrobank, SQB, Kapitalbank, NBU) ijobiy qaror uchun DSCR ≥ 1.25–1.30x talab qiladi."}
          </div>
          <div className="bg-white border border-slate-200/80 rounded-xl p-3">
            <strong className="text-slate-900 block mb-1">
              {lang === 'ru'
                ? '2. Доля собственных средств (Equity)'
                : '2. Shaxsiy kapital ulushi (15–25%)'}
            </strong>
            {lang === 'ru'
              ? 'Банки проверяют соучастие предпринимателя: норматив по госпрограммам и БРБ/SQB 20–25%, в Капиталбанке от 15%. Нехватка сбережений снижает скоринг.'
              : "Banklar tadbirkorning o'z ulushini tekshiradi: ko'pchilik banklarda 20–25%, Kapitalbankda 15% dan. Ulush kam bo'lsa, ball pasayadi."}
          </div>
          <div className="bg-white border border-slate-200/80 rounded-xl p-3">
            <strong className="text-slate-900 block mb-1">
              {lang === 'ru'
                ? '3. Лимиты, льготный период и залог'
                : '3. Limitlar, imtiyozli davr va garov'}
            </strong>
            {lang === 'ru'
              ? 'Учитываются тарифные вилки 10 банков, допустимый льготный период (от 3 до 24 мес.), лимиты программ и требование залога 125% с опцией Фонда.'
              : "10 ta bankning stavka diapazoni, imtiyozli davr (3 oydan 24 oygacha), dastur limitlari va 125% garov talabi hisobga olinadi."}
          </div>
        </div>
      </div>
    </div>
  );
};
