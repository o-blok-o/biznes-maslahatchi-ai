/// <reference types="vite/client" />

import {
  BankProgramId,
  BusinessInputs,
  Currency,
  DistrictId,
  FinancialResults,
  Language,
  LegalFormId,
} from '../types/business';
import { TASHKENT_DISTRICTS } from '../data/tashkentDistricts';
import {
  BUSINESS_TYPE_DEFAULTS,
  CUSTOM_BUSINESS_SUGGESTIONS,
  DEMO_PRESETS,
} from '../data/presets';
import { GEMINI_API_KEY } from '../apiKey';
import {
  calculateFinancials,
  formatUzs,
  getActiveCompetitors,
  getBusinessDisplayName,
  getUzbekistanLegalRoadmap,
  USD_RATE_UZS,
} from './calculations';

const STORAGE_KEY = 'BIZNES_MASLAHATCHI_GEMINI_API_KEY';

export function getStoredApiKey(): string {
  if (typeof GEMINI_API_KEY === 'string' && GEMINI_API_KEY.trim().length > 0) {
    return GEMINI_API_KEY.trim();
  }
  try {
    const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
    if (typeof envKey === 'string' && envKey.trim().length > 0) {
      return envKey.trim();
    }
  } catch {
    // ignore env lookup errors
  }
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function buildInitialExecutiveSummary(
  inputs: BusinessInputs,
  results: FinancialResults,
  lang: Language,
  currency: Currency = 'UZS'
): string {
  const district = TASHKENT_DISTRICTS[inputs.district];
  const bTypeName = getBusinessDisplayName(inputs, lang);
  const competitors = getActiveCompetitors(inputs, lang);
  const topComp = competitors[0];
  const optimalTax = results.taxRegimes[results.optimalTaxRegimeId];
  const fmt = (val: number) => formatUzs(val, lang, currency);

  if (lang === 'ru') {
    const dscrText =
      inputs.loanAmountUzs <= 0
        ? `Без кредита (финансирование 100% за счет собственных средств)`
        : results.approvalStatus === 'High'
        ? `Высокий (${results.dscr}x — шанс одобрения ${results.approvalProbabilityPercent}%)`
        : results.approvalStatus === 'Medium'
        ? `Средний (${results.dscr}x — шанс ${results.approvalProbabilityPercent}%, может потребоваться залог)`
        : `Низкий (${results.dscr}x — шанс ${results.approvalProbabilityPercent}%, рекомендуем снизить сумму кредита или увеличить срок)`;

    const paybackText =
      results.paybackMonths > 0
        ? `окупаемость **${results.paybackMonths} мес.**, ROI **${results.annualRoiPercent}% годовых**`
        : `**в убытке — пересмотрите выручку или расходы**`;

    return [
      `📊 **Экспертное заключение ИИ ТПП РУз (${district.nameRu})**`,
      `Проект: **${bTypeName}** (${inputs.areaSqm} м², штат ${inputs.staffCount} чел.)`,
      ``,
      `• **Чистая прибыль:** **${fmt(results.netMonthlyProfitUzs)}/мес** (${paybackText}).`,
      `• **Юнит-экономика:** Чек **${fmt(results.estimatedAvgCheckUzs)}**, нужно **~${results.dailyCustomersNeeded} клиентов/день** (точка безубыточности: ~${results.breakEvenDailyCustomers}/день).`,
      `• **Аренда в локации:** ${fmt(district.rentPerSqmUzs)}/м² → **${fmt(results.opex.rentUzs)}/мес** (Трафик: ${district.trafficScore}/100).`,
      `• **Налоговый оптимум:** **${optimalTax.nameRu}** — нагрузка **${fmt(optimalTax.monthlyTaxUzs)}/мес** (экономия до **${fmt(results.annualTaxSavingsUzs)}/год**).`,
      `• **Кредитный скоринг:** ${dscrText}. Платеж: **${fmt(results.selectedBankProgramResult.monthlyPaymentUzs)}/мес**.`,
      `• **Как обойти конкурента (${topComp.name}):** ${topComp.uspAdviceRu}`,
    ].join('\n');
  }

  const dscrText =
    inputs.loanAmountUzs <= 0
      ? `Kreditsiz (100% shaxsiy mablag' hisobidan)`
      : results.approvalStatus === 'High'
      ? `Yuqori (${results.dscr}x — tasdiqlash ehtimoli ${results.approvalProbabilityPercent}%)`
      : results.approvalStatus === 'Medium'
      ? `O'rtacha (${results.dscr}x — ehtimol ${results.approvalProbabilityPercent}%, garov talab etilishi mumkin)`
      : `Past (${results.dscr}x — ehtimol ${results.approvalProbabilityPercent}%, kreditni kamaytirish tavsiya etiladi)`;

  const paybackText =
    results.paybackMonths > 0
      ? `qoplash muddati **${results.paybackMonths} oy**, yillik ROI **${results.annualRoiPercent}%**`
      : `**zararda — tushum yoki xarajatlarni qayta ko'rib chiqing**`;

  return [
    `📊 **O'zR SSP AI Ekspert Xulosasi (${district.nameUz})**`,
    `Loyiha: **${bTypeName}** (${inputs.areaSqm} m², xodimlar: ${inputs.staffCount} nafar)`,
    ``,
    `• **Oylik sof foyda:** **${fmt(results.netMonthlyProfitUzs)}/oy** (${paybackText}).`,
    `• **Yunit-iqtisodiyot:** Chek **${fmt(results.estimatedAvgCheckUzs)}**, kuniga **~${results.dailyCustomersNeeded} mijoz** (zararsizlik: ~${results.breakEvenDailyCustomers}/kun).`,
    `• **Hudud ijarasi:** ${fmt(district.rentPerSqmUzs)}/m² → **${fmt(results.opex.rentUzs)}/oy** (Trafik: ${district.trafficScore}/100).`,
    `• **Optimal soliq rejimi:** **${optimalTax.nameUz}** — soliq **${fmt(optimalTax.monthlyTaxUzs)}/oy** (yillik tejamkorlik **${fmt(results.annualTaxSavingsUzs)}**).`,
    `• **Bank kredit skoringi:** ${dscrText}. Oylik to'lov: **${fmt(results.selectedBankProgramResult.monthlyPaymentUzs)}/oy**.`,
    `• **Raqobatchidan ustunlik (${topComp.name}):** ${topComp.uspAdviceUz}`,
  ].join('\n');
}

function generateDeepExpertResponse(
  prompt: string,
  inputs: BusinessInputs,
  results: FinancialResults,
  lang: Language,
  currency: Currency
): string {
  const q = prompt.toLowerCase();
  const district = TASHKENT_DISTRICTS[inputs.district];
  const competitors = getActiveCompetitors(inputs, lang);
  const optimalTax = results.taxRegimes[results.optimalTaxRegimeId];
  const bTypeName = getBusinessDisplayName(inputs, lang);
  const fmt = (val: number) => formatUzs(val, lang, currency);

  const isStressTest =
    /риск|xavf|упадет|сниз|стресс|кризис|просад|stress|inqiroz/.test(q);
  const isProfitOptimize =
    /увелич[а-яё]*\s+(?:чист[а-яё]*\s+|ежемесячн[а-яё]*\s+)?прибыл|подн[а-яё]*\s+(?:чист[а-яё]*\s+)?прибыл|больше\s+прибыл|как\s+заработа|сниз[а-яё]*\s+расход|быстрее\s+окуп|повыс[а-яё]*\s+(?:чист[а-яё]*\s+)?прибыл|foyda[a-z']*\s+oshir|xarajat[a-z']*\s+kamaytir/.test(
      q
    );
  const isFullBreakdown =
    /разлож|по\s+полоч|подробн[а-яё]*\s+расчет|откуда\s+прибыл|откуда\s+цифр|формул|p&l|доход[а-яё]*\s+и\s+расход|daromad\s+va\s+xarajat|batafsil\s+tushuntir/.test(
      q
    );
  const isIdeaAdvisor =
    /какой\s+бизнес|что\s+открыт|посоветуй\s+бизнес|идея\s+бизнес|под\s+ключ|на\s+бюджет|qanday\s+biznes|nima\s+och|budjetga/.test(
      q
    );
  const isStaff =
    /сотруд|персонал|штат|зарплат|фот|xodim|maosh|ишчи/.test(q);
  const isMarketing =
    /маркет|клиент|чек|продаж|реклам|инста|телеграм|mijoz|savdo|chek/.test(q);
  const isCapex =
    /оборудован|ремонт|капекс|capex|вложен|окупаем|roi|uskuna|ta'mir|sarmoya|qoplash/.test(
      q
    );
  const isOwnerBusinessPlan =
    /бизнес[-\s]?план|для\s+(?:меня|бизнесмен|себя|предпринимател)|мой\s+путь|пошагов[а-яё]*\s+путь|законодател|закон[а-яё]*\s+(?:руз|узбекистан)|лиценз|разрешен|сэс(?=$|[^а-яё])|ккм|ijara\.soliq|mehnat\.uz|birdarcha|что\s+нужно\s+по\s+закон|с\s+чего\s+начать|biznes[-\s]?reja|men\s+uchun|tadbirkor\s+uchun|yo'l\s+xarita|o'z\s*r\s*qonun|qonun\w*|litsenziya|ruxsatnoma/.test(
      q
    );
  const isRent =
    /аренд|ijara|площад|maydon|помещен|квадрат/.test(q);
  const isLaunchPlan =
    /открыть|запуск|шаг|оформ|план|ochish|qadam|boshlash|reja/.test(q);
  const isTax =
    /налог|soliq|ндс|qqs|ятт|yatt|мчж|mchj|самозан|режим|нк руз/.test(q);
  const isCredit =
    /кредит|kredit|dscr|банк|bank|залог|garov|одобр|ставк|лимит|льгот|отсрочк|imtiyoz/.test(q);
  const isCompetitor =
    /конкурент|raqobat|район|tuman|утп|utp|локац|трафик|рынок|bozor|откуда данные|источник/.test(
      q
    );

  const rentShare = Math.round(
    (results.opex.rentUzs / Math.max(1, inputs.expectedMonthlyRevenueUzs)) * 100
  );
  const payrollShare = Math.round(
    (results.opex.payrollGrossUzs /
      Math.max(1, inputs.expectedMonthlyRevenueUzs)) *
      100
  );
  const ownPct = Math.round(
    (inputs.ownCapitalUzs / Math.max(1, results.capex.totalInvestmentUzs)) * 100
  );
  const marginPct = Math.round(
    (results.netMonthlyProfitUzs /
      Math.max(1, inputs.expectedMonthlyRevenueUzs)) *
      100
  );

  if (lang === 'ru') {
    if (isProfitOptimize) {
      const topBank = results.bankPrograms[results.recommendedBankId];
      const taxGain = Math.max(
        0,
        results.activeTaxRegime.monthlyTaxUzs - optimalTax.monthlyTaxUzs
      );
      const bankGain = Math.max(
        0,
        results.selectedBankProgramResult.monthlyPaymentUzs -
          topBank.monthlyPaymentUzs
      );
      const upsellGain = Math.round(
        inputs.expectedMonthlyRevenueUzs *
          0.15 *
          (1 - inputs.cogsPercent / 100 - 0.1)
      );
      const cogsGain = Math.round(inputs.expectedMonthlyRevenueUzs * 0.03);
      const totalBoost = taxGain + bankGain + upsellGain + cogsGain;

      return [
        `📈 **Точки роста чистой прибыли для «${bTypeName}»**`,
        ``,
        `• **Текущая прибыль:** **${fmt(results.netMonthlyProfitUzs)}/мес** (потенциал роста: **+${fmt(totalBoost)}/мес** → до **${fmt(results.netMonthlyProfitUzs + totalBoost)}/мес**).`,
        `• **Рычаг 1 — Налоговая оптимизация:** ${taxGain > 0 ? `переход на **${optimalTax.nameRu}** экономит **+${fmt(taxGain)}/мес**.` : `у вас уже выбран оптимальный режим **${optimalTax.nameRu}** (${fmt(optimalTax.monthlyTaxUzs)}/мес).`}`,
        `• **Рычаг 2 — Банк и льготный период:** ${bankGain > 0 ? `переход в **${topBank.bankNamesRu}** (${topBank.annualRatePercent}%) снижает платеж на **+${fmt(bankGain)}/мес**.` : `оптимальный банк **${topBank.bankNamesRu}** с льготным периодом **${topBank.recommendedGraceMonths} мес.** бережет оборотку на старте.`}`,
        `• **Рычаг 3 — Повышение среднего чека (+15%):** комбо-пакеты и допродажи на чеке ${fmt(results.estimatedAvgCheckUzs)} принесут **+${fmt(upsellGain)}/мес** к чистой прибыли.`,
        `• **Рычаг 4 — Снижение закупочной цены (−3% COGS):** прямые контракты с поставщиками добавят **+${fmt(cogsGain)}/мес**.`,
      ].join('\n');
    }

    if (isFullBreakdown) {
      return [
        `📊 **Полная структура доходов и расходов (P&L) «${bTypeName}»**`,
        ``,
        `• **1. Плановая выручка:** **+${fmt(inputs.expectedMonthlyRevenueUzs)}/мес** (~${results.dailyCustomersNeeded} кл./день × чек ${fmt(results.estimatedAvgCheckUzs)})`,
        `• **2. Себестоимость (${inputs.cogsPercent}%):** −${fmt(results.opex.cogsUzs)}`,
        `• **3. Коммуналка, связь и маркетинг (6%):** −${fmt(results.opex.utilitiesAndMarketingUzs)}`,
        `• **4. Аренда (${inputs.areaSqm} м² × ${fmt(district.rentPerSqmUzs)}):** −${fmt(results.opex.rentUzs)}`,
        `• **5. ФОТ (${inputs.staffCount} сотр. × ${fmt(inputs.avgSalaryUzs)}):** −${fmt(results.opex.payrollGrossUzs)}`,
        `• **6. Налоги (${results.activeTaxRegime.nameRu}):** −${fmt(results.activeTaxRegime.monthlyTaxUzs)}`,
        `• **= Свободный поток (EBITDA):** **${fmt(results.ebitdaUzs)}/мес**`,
        `• **7. Платеж банку (${results.selectedBankProgramResult.bankNamesRu}):** −${fmt(results.selectedBankProgramResult.monthlyPaymentUzs)}`,
        `• **= Чистая прибыль «на руки»:** **${fmt(results.netMonthlyProfitUzs)}/мес** (рентабельность **${marginPct}%**, окупаемость **${results.paybackMonths > 0 ? `${results.paybackMonths} мес.` : 'в убытке'}**)`,
      ].join('\n');
    }

    if (isIdeaAdvisor) {
      const topBank = results.bankPrograms[results.recommendedBankId];
      return [
        `🤖 **Готовая конфигурация проекта «${bTypeName}» (${district.nameRu})**`,
        ``,
        `• **Что настроено в основной панели:** ниша **${bTypeName}**, площадь **${inputs.areaSqm} м²**, штат **${inputs.staffCount} чел.**, бюджет старта **${fmt(results.capex.totalInvestmentUzs)}** (Свои: ${fmt(inputs.ownCapitalUzs)} + Кредит: ${fmt(inputs.loanAmountUzs)}).`,
        `• **Прогноз экономики:** выручка **${fmt(inputs.expectedMonthlyRevenueUzs)}/мес** (~${results.dailyCustomersNeeded} кл./день при чеке ${fmt(results.estimatedAvgCheckUzs)}), чистая прибыль **${fmt(results.netMonthlyProfitUzs)}/мес**, окупаемость **${results.paybackMonths > 0 ? `${results.paybackMonths} мес.` : 'требует роста'}** (ROI **${results.annualRoiPercent}%**).`,
        `• **Налог и Банк:** автоматически выбран **${optimalTax.nameRu}** (${fmt(optimalTax.monthlyTaxUzs)}/мес)${inputs.loanAmountUzs > 0 ? ` и лучший банк **${topBank.bankNamesRu}** (${topBank.annualRatePercent}%, льготный период **${topBank.recommendedGraceMonths} мес.**)` : ' (запуск без кредита)'}.`,
        `• **Как обойти конкурента «${competitors[0].name}»:** ${competitors[0].uspAdviceRu}`,
      ].join('\n');
    }

    if (isStressTest) {
      const drop25Rev = Math.max(
        1_000_000,
        Math.round(inputs.expectedMonthlyRevenueUzs * 0.75)
      );
      const drop15Rev = Math.max(
        1_000_000,
        Math.round(inputs.expectedMonthlyRevenueUzs * 0.85)
      );
      const stress15Results = calculateFinancials(
        { ...inputs, expectedMonthlyRevenueUzs: drop15Rev },
        currency
      );
      const stress25Results = calculateFinancials(
        { ...inputs, expectedMonthlyRevenueUzs: drop25Rev },
        currency
      );
      const stress15Net = stress15Results.netMonthlyProfitUzs;
      const stressNet = stress25Results.netMonthlyProfitUzs;
      const fixedCosts25 =
        stress25Results.opex.rentUzs +
        stress25Results.opex.payrollGrossUzs +
        stress25Results.activeTaxRegime.monthlyTaxUzs +
        stress25Results.selectedBankProgramResult.monthlyPaymentUzs;

      return [
        `🛡️ **Глубокий стресс-тест устойчивости «${bTypeName}» (${district.nameRu})**`,
        ``,
        `• **Базовый сценарий (100% плана):** выручка **${fmt(inputs.expectedMonthlyRevenueUzs)}/мес**, чистая прибыль **${fmt(results.netMonthlyProfitUzs)}/мес** (рентабельность **${marginPct}%**).`,
        `• **Умеренная просадка (−15% выручки):** продажи **${fmt(drop15Rev)}/мес** → чистая прибыль **${fmt(stress15Net)}/мес**.`,
        `• **Кризисный шок (−25% выручки):** продажи **${fmt(drop25Rev)}/мес** (пересчитанный налог ${fmt(stress25Results.activeTaxRegime.monthlyTaxUzs)}) → чистый результат **${fmt(stressNet)}/мес**.`,
        `• **Обязательные платежи при −25%:** **${fmt(fixedCosts25)}/мес** (аренда ${fmt(stress25Results.opex.rentUzs)} + ФОТ ${fmt(stress25Results.opex.payrollGrossUzs)} + налог ${fmt(stress25Results.activeTaxRegime.monthlyTaxUzs)} + банк ${fmt(stress25Results.selectedBankProgramResult.monthlyPaymentUzs)}).`,
        `• **Точка безубыточности:** минимум **${fmt(results.breakEvenMonthlyRevenueUzs)}/мес** (~**${results.breakEvenDailyCustomers} клиентов/день** при чеке ${fmt(results.estimatedAvgCheckUzs)}). Запас прочности: **${results.safetyMarginPercent >= 0 ? '+' : ''}${results.safetyMarginPercent}%**.`,
        ``,
        `**Антикризисные рекомендации ТПП РУз:**`,
        `1. ${
          stressNet >= 0
            ? `Даже при просадке спроса на 25% проект остается в плюсе (**+${fmt(stressNet)}/мес**) — запас финансовой прочности надежный.`
            : `При обвале продаж на 25% возникнет дефицит **${fmt(Math.abs(stressNet))}/мес** — держите резервный фонд минимум **${fmt(results.opex.rentUzs * 2)}** на 2 месяца аренды.`
        }`,
        `2. Привяжите часть зарплаты сотрудников к % от дневной кассы, чтобы ФОТ (${payrollShare}% от выручки) гибко снижался в слабые сезоны.`,
      ].join('\n');
    }

    if (isCredit) {
      const topBank = results.bankPrograms[results.recommendedBankId];
      const topScheduleRu =
        topBank.recommendedRepaymentType === 'differentiated'
          ? 'Дифференцированный график (меньше переплата)'
          : 'Аннуитетный график (выше шанс одобрения по DSCR)';

      if (inputs.loanAmountUzs <= 0) {
        return [
          `🏦 **Оценка финансирования без привлечения кредита («${bTypeName}»)**`,
          ``,
          `• **Текущая модель:** 100% за счет собственных сбережений (**${fmt(inputs.ownCapitalUzs)}**). Банковская нагрузка и переплата по процентам равны **0**.`,
          `• **Чистая прибыль:** **${fmt(results.netMonthlyProfitUzs)}/мес** целиком остается у владельца. Срок окупаемости: **${results.paybackMonths > 0 ? `${results.paybackMonths} мес.` : 'требует роста выручки'}**.`,
          `• **Лучший резервный банк из 10 проанализированных:** **${topBank.bankNamesRu}** (${topBank.annualRatePercent}% годовых, льготный период до ${topBank.maxGraceMonths} мес.) — при расширении бизнеса вы легко пройдете скоринг со свободным EBITDA **${fmt(results.ebitdaUzs)}/мес**.`,
        ].join('\n');
      }

      const maxSafePayment = Math.max(0, Math.round(results.ebitdaUzs / 1.3));
      const pledge125 = Math.round(inputs.loanAmountUzs * 1.25);
      const govGuarantee50 = Math.round(inputs.loanAmountUzs * 0.5);

      return [
        `🏦 **Кредитный меморандум и AI-подбор из 10 банков РУз для «${bTypeName}»**`,
        ``,
        `• **🏆 Оптимальный банк для вас (№1 из 10):** **${topBank.bankNamesRu}** — программа «${topBank.nameRu}» (**${topBank.annualRatePercent}% годовых**, рейтинг совпадения **${topBank.matchScore}/100**, шанс одобрения **${topBank.approvalProbabilityPercent}%**).`,
        `• **Рекомендуемые условия договора:** **льготный период ${topBank.recommendedGraceMonths} мес.** (платеж в льготный период всего **${fmt(topBank.graceMonthlyPaymentUzs)}/мес**), **${topScheduleRu}**.`,
        `• **Текущая выбранная программа:** ${results.selectedBankProgramResult.bankNamesRu} (${results.selectedBankProgramResult.annualRatePercent}% годовых) → платеж **${fmt(results.selectedBankProgramResult.monthlyPaymentUzs)}/мес**, переплата **${fmt(results.selectedBankProgramResult.totalInterestUzs)}**.`,
        `• **Коэффициент DSCR:** **${results.dscr}x** при нормативе банков РУз **≥ 1.25–1.30x** (свободный EBITDA после налогов: **${fmt(results.ebitdaUzs)}/мес**).`,
        `• **Залоговое обеспечение:** ${topBank.collateralInfoRu}. Базовый залог 125% = **${fmt(pledge125)}** (можно покрыть 50% = **${fmt(govGuarantee50)}** через АО «Компания по развитию предпринимательства»).`,
        ``,
        `**Как поднять шанс одобрения и сэкономить:**`,
        `1. Безопасный ежемесячный платеж для вашего дохода — до **${fmt(maxSafePayment)}/мес**${inputs.loanTermMonths < 36 ? ' (увеличение срока до 36 мес. повышает DSCR).' : '.'}`,
        `2. Перейдите во вкладку **«Кредит в банке»** и нажмите **«Применить лучшие условия»** на карточке **${topBank.bankNamesRu}**.`,
      ].join('\n');
    }

    if (isTax) {
      return [
        `⚖️ **Экспертный разбор налогообложения «${bTypeName}» по НК РУз (2026)**`,
        ``,
        `• **Текущий выбор:** ${results.activeTaxRegime.nameRu} — **${fmt(results.activeTaxRegime.monthlyTaxUzs)}/мес** (нагрузка на выручку **${results.activeTaxRegime.effectiveRatePercent}%**).`,
        `• **Сравнение всех 3 законных режимов при выручке ${fmt(inputs.expectedMonthlyRevenueUzs)}/мес (${fmt(inputs.expectedMonthlyRevenueUzs * 12)}/год):**`,
        `  1. **Самозанятый (ст. 408 НК РУз):** ${results.taxRegimes.self_employed.isEligible ? `Доступен — ${fmt(results.taxRegimes.self_employed.monthlyTaxUzs)}/мес` : `Не подходит: ${results.taxRegimes.self_employed.ineligibilityReasonRu}`}.`,
        `  2. **ЯТТ / Упрощенный налог с оборота 4% (ст. 461–470 НК РУз):** ${results.taxRegimes.yatt.isEligible ? `**${fmt(results.taxRegimes.yatt.monthlyTaxUzs)}/мес** (4% с оборота + 12% соцналог с ФОТ ${fmt(results.opex.payrollGrossUzs)})` : `Не подходит: ${results.taxRegimes.yatt.ineligibilityReasonRu}`}.`,
        `  3. **МЧЖ / Общеустановленный (НДС 12% + Прибыль 15%):** **${fmt(results.taxRegimes.mchj.monthlyTaxUzs)}/мес** (учтен зачет входного НДС по сырью и аренде).`,
        `• **Рекомендация ТПП РУз:** Оптимальный законный вариант — **${optimalTax.nameRu}**. Годовая экономия на налогах по сравнению с менее выгодным режимом составляет **${fmt(results.annualTaxSavingsUzs)}/год**.`,
        `• **Практический совет:** Оформление через **new.birdarcha.uz** занимает 15 минут; при работе с розницей обязательно подключите онлайн-ККМ с фискальным QR-чеком и прием оплат Humo/Uzcard/Click/Payme.`,
      ].join('\n');
    }

    if (isCompetitor || isRent) {
      return [
        `📍 **Геомаркетинг локации: ${district.nameRu} (источники: stat.uz, OLX/Uybor, 2GIS)**`,
        ``,
        `• **Аренда помещения:** средняя ставка street-retail в районе — **${fmt(district.rentPerSqmUzs)}/м²**. За ваши **${inputs.areaSqm} м²** аренда составит **${fmt(results.opex.rentUzs)}/мес** (**${rentShare}%** от выручки — ${rentShare <= 15 ? 'здоровая норма, оптимально до 15%' : 'выше комфортных 15%, рассмотрите переговорный торг на −10% или 2-ю линию'}).`,
        `• **Потенциал трафика и спроса:** Индекс уличного трафика **${district.trafficScore}/100**, покупательская способность **${district.purchasingPowerScore}/100**, уровень конкуренции: **${district.competitionLevel === 'High' ? 'Высокий' : district.competitionLevel === 'Medium' ? 'Умеренный' : 'Низкий'}**.`,
        `• **Ключевые конкуренты для «${bTypeName}» и стратегия победы:**`,
        ...competitors.map(
          (c, idx) =>
            `${idx + 1}. **${c.name}** (средний чек ${fmt(c.avgCheckUzs)}, ★${c.rating})\n   - *Слабое место:* ${c.weaknessRu}\n   - *Как победить:* ${c.uspAdviceRu}`
        ),
      ].join('\n');
    }

    if (isMarketing) {
      const plus15Rev = Math.round(inputs.expectedMonthlyRevenueUzs * 1.15);
      const extraNet = Math.round(
        (plus15Rev - inputs.expectedMonthlyRevenueUzs) *
          (1 - inputs.cogsPercent / 100 - 0.1)
      );
      return [
        `📣 **Юнит-экономика и маркетинговый план роста для «${bTypeName}»**`,
        ``,
        `• **Дневной план продаж:** **${fmt(results.dailyRevenueUzs)}/день** — это **~${results.dailyCustomersNeeded} клиентов в день** при среднем чеке **${fmt(results.estimatedAvgCheckUzs)}**.`,
        `• **Порог выживания (в ноль):** нужно минимум **~${results.breakEvenDailyCustomers} клиентов/день**, все клиенты сверх этого приносят чистую прибыль.`,
        `• **Эффект роста чека на +15%:** если поднять средний чек с ${fmt(results.estimatedAvgCheckUzs)} до **${fmt(Math.round(results.estimatedAvgCheckUzs * 1.15))}** за счет комбо-пакетов или допродаж, ваша чистая прибыль вырастет примерно на **+${fmt(extraNet)}/мес**.`,
        ``,
        `**Топ-4 рабочих канала привлечения в Ташкенте:**`,
        `1. **Локальная карта (2GIS + Яндекс Карты + Google Maps):** приоритетная карточка с фото, отзывами и кнопкой маршрута дает до 35% первичного трафика района **${district.nameRu}**.`,
        `2. **Кэшбэк и рассрочка:** подключите оплату **Click/Payme** и (если чек высокий) рассрочку **Uzum Nasiya / Alif** — конверсия в покупку растет на 20–30%.`,
        `3. **Отстройка от «${competitors[0].name}»:** ${competitors[0].uspAdviceRu}`,
      ].join('\n');
    }

    if (isCapex) {
      return [
        `🏗️ **Отраслевой аудит стартовых инвестиций (CAPEX) и окупаемости**`,
        ``,
        `• **Итоговый бюджет старта:** **${fmt(results.capex.totalInvestmentUzs)}** (Свои: ${fmt(inputs.ownCapitalUzs)} + Кредит: ${fmt(inputs.loanAmountUzs)}).`,
        `• **Умное распределение под «${bTypeName}» (${inputs.areaSqm} м²):**`,
        `  - Оборудование и оснащение (**${results.capex.equipmentPercent}%**): **${fmt(results.capex.equipmentUzs)}**`,
        `  - Ремонт под площадь ${inputs.areaSqm} м² (**${results.capex.renovationPercent}%**): **${fmt(results.capex.renovationUzs)}**`,
        `  - Первичная закупка и маркетинг (**${results.capex.inventoryPercent}%**): **${fmt(results.capex.inventoryMarketingUzs)}**`,
        `  - Резервный фонд и запуск (**${results.capex.reservePercent}%**): **${fmt(results.capex.reserveRegistrationUzs)}**`,
        `• **Возврат вложений:** При чистой прибыли **${fmt(results.netMonthlyProfitUzs)}/мес** проект окупается за **${results.paybackMonths > 0 ? `${results.paybackMonths} мес.` : 'свыше 12 мес. (нужно повысить маржу)'}** с доходностью **ROI ${results.annualRoiPercent}% годовых** (точка выхода в плюс на графике: ${results.breakEvenMonth ? `M${results.breakEvenMonth}` : '>12 мес.'}).`,
      ].join('\n');
    }

    if (isStaff) {
      const socialTax = Math.round(results.opex.payrollGrossUzs * 0.12);
      const revPerStaff =
        inputs.staffCount > 0
          ? Math.round(inputs.expectedMonthlyRevenueUzs / inputs.staffCount)
          : inputs.expectedMonthlyRevenueUzs;
      return [
        `👥 **Аудит команды и фонда оплаты труда («${bTypeName}»)**`,
        ``,
        `• **Штатное расписание:** **${inputs.staffCount} сотр.** × средняя ставка **${fmt(inputs.avgSalaryUzs)}/мес** = ФОТ **${fmt(results.opex.payrollGrossUzs)}/мес**.`,
        `• **Социальный налог (12% от ФОТ):** **${fmt(socialTax)}/мес** (уже учтен в налогах по ЯТТ/МЧЖ).`,
        `• **Эффективность персонала:** Выручка на 1 сотрудника — **${fmt(revPerStaff)}/мес**, доля ФОТ в выручке — **${payrollShare}%** (${payrollShare <= 28 ? 'хорошая производительность для МСБ Ташкента' : 'доля зарплат высокая, стоит оптимизировать сменный график или поднять выручку'}).`,
        `• **Совет по мотивации:** Внедрите схему **70% фиксированный оклад + 30% KPI от выручки/качества** (привязка к среднему чеку ${fmt(results.estimatedAvgCheckUzs)}), чтобы персонал был заинтересован в росте продаж.`,
      ].join('\n');
    }

    if (isOwnerBusinessPlan || isLaunchPlan) {
      const roadmap = getUzbekistanLegalRoadmap(inputs, results, 'ru', currency);
      return [
        `🧭 **Рабочий бизнес-план предпринимателя и правовой путь РУз (отдельно от презентации для банка)**`,
        `Проект: **${roadmap.businessName}** (${roadmap.districtName}, ${inputs.areaSqm} м², штат ${inputs.staffCount} сотр.)`,
        ``,
        `• **1. Финансовая цель владельца:** вложения **${fmt(results.capex.totalInvestmentUzs)}**, целевой поток **~${results.dailyCustomersNeeded} кл./день** (чек ${fmt(results.estimatedAvgCheckUzs)}), точка безубыточности **~${results.breakEvenDailyCustomers} кл./день**, чистая прибыль **${fmt(results.netMonthlyProfitUzs)}/мес**, окупаемость **${results.paybackMonths > 0 ? `${results.paybackMonths} мес.` : 'требует роста'}** (ROI **${results.annualRoiPercent}%**).`,
        ``,
        `⚖️ **2. Требования законодательства Республики Узбекистан (2026) для вашей ниши:**`,
        `• **Базовый налоговый закон:** ${roadmap.registrationBasis}`,
        ...roadmap.requirements.map(
          (req) =>
            `• **${req.category} (${req.portalOrAuthority}):** ${req.title} (**${req.lawRef}**) — ${req.actionRequired}`
        ),
        ``,
        `📋 **3. Пошаговый путь предпринимателя (от Дня 1 до окупаемости):**`,
        ...roadmap.pathSteps.map(
          (st) =>
            `${st.stepNumber}. **${st.timeframe} — ${st.title}:** ${st.actions.join(' ')} **Закон:** ${st.legalNote} **KPI:** ${st.targetKpi}.`
        ),
        ``,
        `📅 **4. Ежемесячный календарь соблюдения законов РУз:**`,
        ...roadmap.monthlyComplianceCalendar.map((item) => `• ${item}`),
        ``,
        `💡 **Совет:** нажмите **«Скачать PDF»** в шапке и выберите вкладку **«🧭 План для бизнеса (Путь + Законы РУз)»**, чтобы распечатать эту личную дорожную карту отдельно от банковского ТЭО и презентации.`,
      ].join('\n');
    }

    // Comprehensive General Executive Audit for ANY free-form question
    return [
      `🚀 **Комплексный экспертный разбор проекта «${bTypeName}» (${district.nameRu})**`,
      ``,
      `• **Финансовый итог:** При выручке **${fmt(inputs.expectedMonthlyRevenueUzs)}/мес** ваша чистая прибыль составит **${fmt(results.netMonthlyProfitUzs)}/мес** (маржа **${marginPct}%**, окупаемость **${results.paybackMonths > 0 ? `${results.paybackMonths} мес.` : 'не окупается'}**, годовой ROI **${results.annualRoiPercent}%**).`,
      `• **План продаж на 1 день:** Нужно обслуживать **~${results.dailyCustomersNeeded} клиентов/день** при среднем чеке **${fmt(results.estimatedAvgCheckUzs)}** (точка нуля — ~${results.breakEvenDailyCustomers}/день, запас прочности **${results.safetyMarginPercent}%**).`,
      `• **Где главная точка роста:**`,
      `  1. *Налоги:* Оптимальный режим **${optimalTax.nameRu}** (${fmt(optimalTax.monthlyTaxUzs)}/мес) экономит вам **${fmt(results.annualTaxSavingsUzs)}/год**.`,
      `  2. *Аренда и расходы:* Локация **${district.nameRu}** (${fmt(results.opex.rentUzs)}/мес, доля ${rentShare}% в выручке). ${rentShare > 15 ? 'Рекомендуем сравнить на графике соседние районы с арендой ниже 220 тыс./м².' : 'Арендная нагрузка находится в оптимальной зоне до 15%.'}`,
      `  3. *Кредит и банк:* DSCR **${results.dscr}x**, вероятность одобрения **${results.approvalProbabilityPercent}%**. ${inputs.loanAmountUzs > 0 ? `При необходимости используйте госпоручительство на 50% залога (${fmt(Math.round(inputs.loanAmountUzs * 0.5))}).` : 'Проект не зависит от банковских процентов.'}`,
      `• **Конкурентное преимущество против «${competitors[0].name}»:** ${competitors[0].uspAdviceRu}`,
    ].join('\n');
  }

  // UZBEK (LATIN) DEEP EXPERT RESPONSES
  if (isProfitOptimize) {
    const topBank = results.bankPrograms[results.recommendedBankId];
    const taxGain = Math.max(
      0,
      results.activeTaxRegime.monthlyTaxUzs - optimalTax.monthlyTaxUzs
    );
    const bankGain = Math.max(
      0,
      results.selectedBankProgramResult.monthlyPaymentUzs -
        topBank.monthlyPaymentUzs
    );
    const upsellGain = Math.round(
      inputs.expectedMonthlyRevenueUzs *
        0.15 *
        (1 - inputs.cogsPercent / 100 - 0.1)
    );
    const cogsGain = Math.round(inputs.expectedMonthlyRevenueUzs * 0.03);
    const totalBoost = taxGain + bankGain + upsellGain + cogsGain;

    return [
      `📈 **«${bTypeName}» sof foydasini oshirish yo'llari**`,
      ``,
      `• **Joriy sof foyda:** **${fmt(results.netMonthlyProfitUzs)}/oy** (o'sish imkoniyati: **+${fmt(totalBoost)}/oy** → **${fmt(results.netMonthlyProfitUzs + totalBoost)}/oy** gacha).`,
      `• **1. Soliq optimizatsiyasi:** ${taxGain > 0 ? `**${optimalTax.nameUz}** ga o'tish **+${fmt(taxGain)}/oy** tejaydi.` : `optimal rejim **${optimalTax.nameUz}** (${fmt(optimalTax.monthlyTaxUzs)}/oy) tanlangan.`}`,
      `• **2. Bank va imtiyozli davr:** **${topBank.bankNamesUz}** (${topBank.annualRatePercent}%, imtiyoz **${topBank.recommendedGraceMonths} oy**) aylanma mablag'ni saqlaydi.`,
      `• **3. O'rtacha chekni +15% oshirish:** kombo-to'plamlar orqali **+${fmt(upsellGain)}/oy** qo'shimcha sof foyda.`,
      `• **4. Tannarxni −3% tushirish:** to'g'ridan-to'g'ri ulgurji shartnomalar **+${fmt(cogsGain)}/oy** daromad keltiradi.`,
    ].join('\n');
  }

  if (isFullBreakdown) {
    return [
      `📊 **«${bTypeName}» oylik daromad va xarajatlari (P&L)**`,
      ``,
      `• **1. Rejalashtirilgan tushum:** **+${fmt(inputs.expectedMonthlyRevenueUzs)}/oy** (~${results.dailyCustomersNeeded} mijoz/kun × ${fmt(results.estimatedAvgCheckUzs)})`,
      `• **2. Tannarx (${inputs.cogsPercent}%):** −${fmt(results.opex.cogsUzs)}`,
      `• **3. Kommunal va marketing (6%):** −${fmt(results.opex.utilitiesAndMarketingUzs)}`,
      `• **4. Ijara (${inputs.areaSqm} m² × ${fmt(district.rentPerSqmUzs)}):** −${fmt(results.opex.rentUzs)}`,
      `• **5. Ish haqi fondi (${inputs.staffCount} xodim):** −${fmt(results.opex.payrollGrossUzs)}`,
      `• **6. Soliqlar (${results.activeTaxRegime.nameUz}):** −${fmt(results.activeTaxRegime.monthlyTaxUzs)}`,
      `• **= Erkin oqim (EBITDA):** **${fmt(results.ebitdaUzs)}/oy**`,
      `• **7. Kredit to'lovi (${results.selectedBankProgramResult.bankNamesUz}):** −${fmt(results.selectedBankProgramResult.monthlyPaymentUzs)}`,
      `• **= Oylik sof foyda:** **${fmt(results.netMonthlyProfitUzs)}/oy** (marja **${marginPct}%**, qoplash **${results.paybackMonths > 0 ? `${results.paybackMonths} oy` : 'zararda'}**)`,
    ].join('\n');
  }

  if (isIdeaAdvisor) {
    const topBank = results.bankPrograms[results.recommendedBankId];
    return [
      `🤖 **Tayyor loyiha konfiguratsiyasi: «${bTypeName}» (${district.nameUz})**`,
      ``,
      `• **Asosiy panelda sozlandi:** **${bTypeName}**, maydon **${inputs.areaSqm} m²**, xodimlar **${inputs.staffCount} nafar**, boshlang'ich sarmoya **${fmt(results.capex.totalInvestmentUzs)}** (Shaxsiy: ${fmt(inputs.ownCapitalUzs)} + Kredit: ${fmt(inputs.loanAmountUzs)}).`,
      `• **Iqtisodiy prognoz:** tushum **${fmt(inputs.expectedMonthlyRevenueUzs)}/oy**, sof foyda **${fmt(results.netMonthlyProfitUzs)}/oy**, qoplash muddati **${results.paybackMonths > 0 ? `${results.paybackMonths} oy` : 'tahlil kerak'}** (ROI **${results.annualRoiPercent}%**).`,
      `• **Soliq va Bank:** **${optimalTax.nameUz}** (${fmt(optimalTax.monthlyTaxUzs)}/oy)${inputs.loanAmountUzs > 0 ? ` va №1 bank **${topBank.bankNamesUz}** (${topBank.annualRatePercent}%, imtiyozli davr **${topBank.recommendedGraceMonths} oy**)` : ' (kreditsiz start)'}.`,
      `• **Raqobatchi «${competitors[0].name}» dan ustunlik:** ${competitors[0].uspAdviceUz}`,
    ].join('\n');
  }

  if (isStressTest) {
    const drop25Rev = Math.max(
      1_000_000,
      Math.round(inputs.expectedMonthlyRevenueUzs * 0.75)
    );
    const stress25Results = calculateFinancials(
      { ...inputs, expectedMonthlyRevenueUzs: drop25Rev },
      currency
    );
    const stressNet = stress25Results.netMonthlyProfitUzs;
    const fixedCosts25 =
      stress25Results.opex.rentUzs +
      stress25Results.opex.payrollGrossUzs +
      stress25Results.activeTaxRegime.monthlyTaxUzs +
      stress25Results.selectedBankProgramResult.monthlyPaymentUzs;

    return [
      `🛡️ **«${bTypeName}» loyihasi uchun chuqur stress-test (${district.nameUz})**`,
      ``,
      `• **Asosiy reja (100%):** tushum **${fmt(inputs.expectedMonthlyRevenueUzs)}/oy**, sof foyda **${fmt(results.netMonthlyProfitUzs)}/oy** (rentabellik **${marginPct}%**).`,
      `• **Inqiroz ssenariysi (−25% tushum):** savdo **${fmt(drop25Rev)}/oy** (qayta hisoblangan soliq ${fmt(stress25Results.activeTaxRegime.monthlyTaxUzs)}) → sof natija **${fmt(stressNet)}/oy**.`,
      `• **Majburiy xarajatlar:** **${fmt(fixedCosts25)}/oy** (ijara + maosh + soliq + kredit to'lovi).`,
      `• **Zararsizlik nuqtasi:** kuniga kamida **~${results.breakEvenDailyCustomers} ta mijoz** (${fmt(results.breakEvenMonthlyRevenueUzs)}/oy). Xavfsizlik zaxirasi: **${results.safetyMarginPercent}%**.`,
      ``,
      `**Tavsiya:** ${
        stressNet >= 0
          ? `Savdo 25% tushgan taqdirda ham loyiha **+${fmt(stressNet)}/oy** foydada qoladi.`
          : `Kamida **${fmt(results.opex.rentUzs * 2)}** (2 oylik ijara) zaxira fondini saqlang va xodimlar maoshini KPIga bog'lang.`
      }`,
    ].join('\n');
  }

  if (isCredit) {
    const topBank = results.bankPrograms[results.recommendedBankId];
    const topScheduleUz =
      topBank.recommendedRepaymentType === 'differentiated'
        ? 'Differensial jadval (foiz ortiqcha to‘lovi kamroq)'
        : 'Annuitet jadval (DSCR skoringidan o‘tish osonroq)';

    if (inputs.loanAmountUzs <= 0) {
      return [
        `🏦 **Kreditsiz moliyalashtirish tahlili («${bTypeName}»)**`,
        ``,
        `• Siz loyihani 100% shaxsiy mablag' (**${fmt(inputs.ownCapitalUzs)}**) hisobidan boshlayapsiz — bank foizi va garov yuklamasi **0**.`,
        `• Sof foyda **${fmt(results.netMonthlyProfitUzs)}/oy** to'liq sizda qoladi, qoplash muddati — **${results.paybackMonths > 0 ? `${results.paybackMonths} oy` : 'tushumni oshirish kerak'}**.`,
        `• **10 ta bank orasidan eng qulay zaxira variant:** **${topBank.bankNamesUz}** (${topBank.annualRatePercent}%, imtiyozli davr ${topBank.maxGraceMonths} oygacha) — erkin EBITDA **${fmt(results.ebitdaUzs)}/oy** bilan keyingi filial uchun oson kredit olasiz.`,
      ].join('\n');
    }

    return [
      `🏦 **«${bTypeName}» uchun O'zbekistondagi 10 ta bankdan AI kredit tanlovi**`,
      ``,
      `• **🏆 Siz uchun №1 eng yaxshi bank:** **${topBank.bankNamesUz}** — «${topBank.nameUz}» (**${topBank.annualRatePercent}%** yillik, moslik reytingi **${topBank.matchScore}/100**, ma'qullash ehtimoli **${topBank.approvalProbabilityPercent}%**).`,
      `• **Tavsiya etiladigan kredit shartlari:** **${topBank.recommendedGraceMonths} oylik imtiyozli davr** (imtiyozli davrda faqat foiz: oyiga **${fmt(topBank.graceMonthlyPaymentUzs)}**), **${topScheduleUz}**.`,
      `• **Tanlangan joriy dastur:** ${results.selectedBankProgramResult.bankNamesUz} (**${results.selectedBankProgramResult.annualRatePercent}%**, ${inputs.loanTermMonths} oy) → oylik to'lov **${fmt(results.selectedBankProgramResult.monthlyPaymentUzs)}/oy**, jami foiz **${fmt(results.selectedBankProgramResult.totalInterestUzs)}**.`,
      `• **DSCR zaxira koeffitsienti:** **${results.dscr}x** (bank talabi **≥ 1.25–1.30x**, erkin EBITDA: **${fmt(results.ebitdaUzs)}/oy**, shaxsiy ulush: **${ownPct}%**).`,
      `• **Garov va Davlat kafolati:** ${topBank.collateralInfoUz}. Umumiy 125% garov (**${fmt(Math.round(inputs.loanAmountUzs * 1.25))}**) ning 50% igacha (**${fmt(Math.round(inputs.loanAmountUzs * 0.5))}**) davlat kafilligi bilan yopilishi mumkin.`,
    ].join('\n');
  }

  if (isTax) {
    return [
      `⚖️ **«${bTypeName}» uchun O'zR Soliq kodeksi (2026) bo'yicha soliq tahlili**`,
      ``,
      `• **Hozirgi rejim:** ${results.activeTaxRegime.nameUz} — **${fmt(results.activeTaxRegime.monthlyTaxUzs)}/oy** (yuklama **${results.activeTaxRegime.effectiveRatePercent}%**).`,
      `• **3 ta qonuniy variant taqqoslanishi:**`,
      `  1. **O'zini o'zi band qilish (1 BHM):** ${results.taxRegimes.self_employed.isEligible ? `${fmt(results.taxRegimes.self_employed.monthlyTaxUzs)}/oy` : `To'g'ri kelmaydi: ${results.taxRegimes.self_employed.ineligibilityReasonUz}`}.`,
      `  2. **YaTT (Aylanmadan 4% + 12% ijtimoiy soliq):** ${results.taxRegimes.yatt.isEligible ? `**${fmt(results.taxRegimes.yatt.monthlyTaxUzs)}/oy**` : `Limitdan oshadi (${results.taxRegimes.yatt.ineligibilityReasonUz})`}.`,
      `  3. **MChJ (QQS 12% + Foyda 15% + Ijtimoiy 12%):** **${fmt(results.taxRegimes.mchj.monthlyTaxUzs)}/oy**.`,
      `• **Optimal tanlov:** **${optimalTax.nameUz}** — yiliga **${fmt(results.annualTaxSavingsUzs)}** soliq tejaydi. Ro'yxatdan o'tish: **new.birdarcha.uz** (15 daqiqa).`,
    ].join('\n');
  }

  if (isCompetitor || isRent) {
    return [
      `📍 **Hudud va bozor tahlili: ${district.nameUz} (Manba: stat.uz, OLX/Uybor, 2GIS)**`,
      ``,
      `• **Ijara xarajati:** tumandagi o'rtacha stavka **${fmt(district.rentPerSqmUzs)}/m²** → ${inputs.areaSqm} m² uchun **${fmt(results.opex.rentUzs)}/oy** (tushumdagi ulushi **${rentShare}%**).`,
      `• **Trafik va talab:** Piyodalar oqimi **${district.trafficScore}/100**, Xarid qobiliyati **${district.purchasingPowerScore}/100**.`,
      `• **Asosiy raqobatchilar va g'olib chiqish yo'li:**`,
      ...competitors.map(
        (c, idx) =>
          `${idx + 1}. **${c.name}** (chek ${fmt(c.avgCheckUzs)}, ★${c.rating})\n   - *Zaif tomoni:* ${c.weaknessUz}\n   - *Ustunlik g'oyasi:* ${c.uspAdviceUz}`
      ),
    ].join('\n');
  }

  if (isMarketing) {
    return [
      `📣 **«${bTypeName}» uchun yunit-iqtisodiyot va mijoz jalb qilish rejasi**`,
      ``,
      `• **Kunlik savdo rejasi:** **${fmt(results.dailyRevenueUzs)}/kun** — o'rtacha chek **${fmt(results.estimatedAvgCheckUzs)}** bilan kuniga **~${results.dailyCustomersNeeded} mijoz**.`,
      `• **Zararsizlik nuqtasi:** kuniga kamida **~${results.breakEvenDailyCustomers} mijoz** (zaxira: ${results.safetyMarginPercent}%).`,
      `• **Toshkentda mijoz topishning 3 tezkor yo'li:**`,
      `  1. **2GIS va Yandex Xaritalar:** rasmlar, ish vaqti va sharhlar orqali ${district.nameUz} aholisining 35% gacha trafikini jalb qiladi.`,
      `  2. **Click/Payme va Uzum Nasiya:** qulay QR-to'lov va muddatli to'lov savdo konversiyasini 20–30% ga oshiradi.`,
      `  3. **«${competitors[0].name}» dan ustunlik:** ${competitors[0].uspAdviceUz}`,
    ].join('\n');
  }

  if (isOwnerBusinessPlan || isCapex || isStaff || isLaunchPlan) {
    if (isOwnerBusinessPlan || isLaunchPlan) {
      const roadmapUz = getUzbekistanLegalRoadmap(inputs, results, 'uz', currency);
      return [
        `🧭 **Tadbirkorning shaxsiy biznes-rejasi va O'zR qonunlari bo'yicha yo'l xaritasi (Bank taqdimotidan alohida)**`,
        `Loyiha: **${roadmapUz.businessName}** (${roadmapUz.districtName}, ${inputs.areaSqm} m², ${inputs.staffCount} nafar xodim)`,
        ``,
        `• **1. Moliyaviy maqsadlar:** boshlang'ich sarmoya **${fmt(results.capex.totalInvestmentUzs)}**, kunlik reja **~${results.dailyCustomersNeeded} mijoz/kun** (o'rtacha chek ${fmt(results.estimatedAvgCheckUzs)}), zararsizlik **~${results.breakEvenDailyCustomers} mijoz/kun**, sof foyda **${fmt(results.netMonthlyProfitUzs)}/oy**, qoplash muddati **${results.paybackMonths > 0 ? `${results.paybackMonths} oy` : 'tahlil kerak'}** (ROI **${results.annualRoiPercent}%**).`,
        ``,
        `⚖️ **2. O'zbekiston Respublikasi qonunchiligi talablari (2026):**`,
        `• **Soliq asosi:** ${roadmapUz.registrationBasis}`,
        ...roadmapUz.requirements.map(
          (req) =>
            `• **${req.category} (${req.portalOrAuthority}):** ${req.title} (**${req.lawRef}**) — ${req.actionRequired}`
        ),
        ``,
        `📋 **3. Tadbirkor bosib o'tadigan bosqichma-bosqich yo'l (1-kundan qoplashgacha):**`,
        ...roadmapUz.pathSteps.map(
          (st) =>
            `${st.stepNumber}. **${st.timeframe} — ${st.title}:** ${st.actions.join(' ')} **Qonun:** ${st.legalNote} **KPI:** ${st.targetKpi}.`
        ),
        ``,
        `📅 **4. Har oylik soliq va hisobot taqvimi:**`,
        ...roadmapUz.monthlyComplianceCalendar.map((item) => `• ${item}`),
        ``,
        `💡 **Maslahat:** Yuqoridagi **«PDF yuklab olish»** tugmasini bosib, bank taqdimotidan alohida **«🧭 Biznes uchun reja (Yo'l xaritasi + Qonunlar)»** bo'limini yuklab oling.`,
      ].join('\n');
    }

    return [
      `📋 **«${bTypeName}» ni ishga tushirish va xarajatlar rejasi (${district.nameUz})**`,
      ``,
      `• **Boshlang'ich sarmoya (${fmt(results.capex.totalInvestmentUzs)}):** Uskunalar **${results.capex.equipmentPercent}%** (${fmt(results.capex.equipmentUzs)}), Ta'mirlash **${results.capex.renovationPercent}%** (${fmt(results.capex.renovationUzs)}), Ilk tovar **${results.capex.inventoryPercent}%** (${fmt(results.capex.inventoryMarketingUzs)}).`,
      `• **Jamoa va maosh fondi:** **${inputs.staffCount} nafar xodim**, jami maosh **${fmt(results.opex.payrollGrossUzs)}/oy** (tushumdagi ulushi ${payrollShare}%).`,
      `• **90 kunlik reja:** 1) **new.birdarcha.uz** orqali ${optimalTax.nameUz} ochish; 2) ${inputs.areaSqm} m² joy ijaraga olish va 15–30 kun ijara imtiyozli davri kelishish; 3) Oylik sof foyda **${fmt(results.netMonthlyProfitUzs)}** bilan **${results.paybackMonths > 0 ? `${results.paybackMonths} oyda` : 'rejali'}** sarmoyani qoplash.`,
    ].join('\n');
  }

  return [
    `🚀 **«${bTypeName}» loyihasi bo'yicha to'liq ekspert tahlili (${district.nameUz})**`,
    ``,
    `• **Moliyaviy natija:** Tushum **${fmt(inputs.expectedMonthlyRevenueUzs)}/oy**, Sof foyda **${fmt(results.netMonthlyProfitUzs)}/oy** (marja **${marginPct}%**, qoplash muddati **${results.paybackMonths > 0 ? `${results.paybackMonths} oy` : 'zararda'}**, ROI **${results.annualRoiPercent}%**).`,
    `• **1 kunlik savdo rejasi:** O'rtacha chek **${fmt(results.estimatedAvgCheckUzs)}** bilan kuniga **~${results.dailyCustomersNeeded} mijoz** kerak (zararsizlik: ~${results.breakEvenDailyCustomers}/kun, zaxira **${results.safetyMarginPercent}%**).`,
    `• **Soliq va Kredit:** Eng qulay soliq **${optimalTax.nameUz}** (${fmt(optimalTax.monthlyTaxUzs)}/oy, tejash ${fmt(results.annualTaxSavingsUzs)}/yil). Bank skoringi: DSCR **${results.dscr}x**, ma'qullash ehtimoli **${results.approvalProbabilityPercent}%**.`,
    `• **Raqobat ustunligi (${competitors[0].name} ga qarshi):** ${competitors[0].uspAdviceUz}`,
  ].join('\n');
}

export interface AgentActionExtraction {
  updatedInputs: Partial<BusinessInputs>;
  appliedChangesRu: string[];
  appliedChangesUz: string[];
}

function parseMonetaryToUzs(
  rawNum: string,
  rawUnit: string | undefined,
  currency: Currency
): number {
  const num = Number(rawNum.replace(',', '.')) || 0;
  if (num <= 0) return 0;
  const unit = (rawUnit || '').toLowerCase();

  if (unit.includes('млрд') || unit.includes('mlrd')) {
    return Math.round(num * 1_000_000_000);
  }
  if (unit.includes('млн') || unit.includes('mln')) {
    return Math.round(num * 1_000_000);
  }
  if (unit.includes('$') || unit.includes('дол')) {
    return Math.round(num * USD_RATE_UZS);
  }
  if (unit.includes('k')) {
    return Math.round(num * 1000 * (currency === 'USD' ? USD_RATE_UZS : 1));
  }
  if (unit.includes('тыс') || unit.includes('ming')) {
    return Math.round(num * 1000);
  }

  if (currency === 'USD') {
    return Math.round(num * USD_RATE_UZS);
  }
  return num <= 5000 ? Math.round(num * 1_000_000) : Math.round(num);
}

/**
 * Parses natural-language user instructions so the AI acts as an interactive agent
 * with full write access to update all main business panel parameters directly.
 */
export function extractAgentActionsFromPrompt(
  prompt: string,
  currentInputsOrLang: BusinessInputs | Language,
  langOrCurrency?: Language | Currency,
  currencyArg: Currency = 'UZS'
): AgentActionExtraction {
  const currentInputs: BusinessInputs =
    typeof currentInputsOrLang === 'string'
      ? DEMO_PRESETS[0].inputs
      : currentInputsOrLang;
  const lang: Language =
    typeof currentInputsOrLang === 'string'
      ? currentInputsOrLang
      : (langOrCurrency as Language) || 'ru';
  const currency: Currency =
    typeof currentInputsOrLang === 'string'
      ? (langOrCurrency as Currency) || 'UZS'
      : currencyArg;

  const q = prompt.toLowerCase();
  const updatedInputs: Partial<BusinessInputs> = {};
  const appliedChangesRu: string[] = [];
  const appliedChangesUz: string[] = [];

  // 0. Detect Total Startup Budget if provided
  const budgetMatch =
    q.match(
      /(?:на\s+бюджет[а-яё]*|бюджет[а-яё]*|располага[а-яё]+|на\s+сумму|budjet[a-z']*|qo'limda|menda)\s*(?:в|около|до|на)?\s*(\d+(?:[.,]\d+)?)\s*(млрд|млн|тыс|mlrd|mln|ming|\$|дол[а-яё]*|k)?/
    ) ||
    q.match(
      /(?:у\s+меня\s+есть|есть)\s+(\d+(?:[.,]\d+)?)\s*(млрд|млн|тыс|mlrd|mln|ming|\$|дол[а-яё]*|k)/
    );
  let totalBudgetUzs = 0;
  if (budgetMatch && budgetMatch[1]) {
    totalBudgetUzs = parseMonetaryToUzs(budgetMatch[1], budgetMatch[2], currency);
  }

  // 1. Detect custom niche among all 12 extended suggestions first
  const customMatchers: Array<{ regex: RegExp; suggestionIdx: number }> = [
    { regex: /автомой|детейлинг|avtomoy|deteyl/, suggestionIdx: 0 },
    { regex: /стоматолог|stomatolog/, suggestionIdx: 1 },
    { regex: /пекарн|тандыр|новвой|novvoy|tandir/, suggestionIdx: 2 },
    { regex: /салон|барбер|парикмах|go'zallik|barber/, suggestionIdx: 3 },
    { regex: /аптек|dorixon/, suggestionIdx: 4 },
    { regex: /пункт выдач|пвз|pvz|topshirish/, suggestionIdx: 5 },
    { regex: /фастфуд|донер|лаваш|бургер|fastfud|doner|lavash/, suggestionIdx: 6 },
    { regex: /националь|миллий|чайхан|таом|milliy|choyxona/, suggestionIdx: 7 },
    { regex: /автосерв|сто\b|ремонт авто|avtoservis|sto\b/, suggestionIdx: 8 },
    { regex: /фитнес|спортзал|тренаж|fitnes|sport\s*zal/, suggestionIdx: 9 },
    { regex: /одежд|шоурум|бутик|kiyim|shourum/, suggestionIdx: 10 },
    { regex: /мебел|mebel/, suggestionIdx: 11 },
  ];

  let businessApplied = false;
  for (const m of customMatchers) {
    if (m.regex.test(q)) {
      const suggestion = CUSTOM_BUSINESS_SUGGESTIONS[m.suggestionIdx];
      if (suggestion) {
        Object.assign(updatedInputs, suggestion.preset, {
          customBusinessName:
            lang === 'ru' ? suggestion.nameRu : suggestion.nameUz,
          customAvgCheckUzs: undefined,
        });
        appliedChangesRu.push(`Бизнес: ${suggestion.nameRu}`);
        appliedChangesUz.push(`Biznes: ${suggestion.nameUz}`);
        businessApplied = true;
        break;
      }
    }
  }

  if (!businessApplied) {
    if (/кофейн|кофе|кафе|qahva/.test(q)) {
      Object.assign(updatedInputs, BUSINESS_TYPE_DEFAULTS.coffee, {
        customAvgCheckUzs: undefined,
      });
      appliedChangesRu.push('Бизнес: Кофейня');
      appliedChangesUz.push('Biznes: Qahvaxona');
    } else if (/учебн|курсы|школ|академ|образова|o'quv|ta'lim/.test(q)) {
      Object.assign(updatedInputs, BUSINESS_TYPE_DEFAULTS.education, {
        customAvgCheckUzs: undefined,
      });
      appliedChangesRu.push('Бизнес: Учебный центр');
      appliedChangesUz.push("Biznes: O'quv markazi");
    } else if (/швейн|цех|текстил|пошив|tikuv|sex/.test(q)) {
      Object.assign(updatedInputs, BUSINESS_TYPE_DEFAULTS.sewing, {
        customAvgCheckUzs: undefined,
      });
      appliedChangesRu.push('Бизнес: Швейный цех');
      appliedChangesUz.push('Biznes: Tikuv sexi');
    } else if (/магазин|маркет|продукт|розниц|do'kon|savdo/.test(q)) {
      Object.assign(updatedInputs, BUSINESS_TYPE_DEFAULTS.retail, {
        customAvgCheckUzs: undefined,
      });
      appliedChangesRu.push('Бизнес: Магазин у дома');
      appliedChangesUz.push("Biznes: Do'kon");
    } else if (/какой\s+бизнес|что\s+открыт|посоветуй\s+бизнес|идея\s+бизнес|qanday\s+biznes|nima\s+och/.test(q)) {
      const pickIdx =
        totalBudgetUzs > 0 && totalBudgetUzs <= 120_000_000
          ? 5 // Пункт выдачи (ПВЗ) — 85M CAPEX
          : totalBudgetUzs > 200_000_000
          ? 6 // Фастфуд / Донерная — 205M CAPEX
          : 2; // Пекарня / Тандыр — 165M CAPEX
      const pick = CUSTOM_BUSINESS_SUGGESTIONS[pickIdx];
      if (pick) {
        Object.assign(updatedInputs, pick.preset, {
          customBusinessName: lang === 'ru' ? pick.nameRu : pick.nameUz,
          customAvgCheckUzs: undefined,
        });
        appliedChangesRu.push(`Идея ИИ: ${pick.nameRu}`);
        appliedChangesUz.push(`AI g'oya: ${pick.nameUz}`);
        businessApplied = true;
      }
    }
  }

  // 2. Detect any of the 12 Tashkent districts or smart location preferences
  const districtMatchers: Array<{ id: DistrictId; regex: RegExp }> = [
    { id: 'mirobod', regex: /мирабад|миробод|mirobod/ },
    { id: 'yakkasaroy', regex: /яккасар|yakkasar/ },
    { id: 'olmazor', regex: /алмазар|олмазор|olmazor/ },
    { id: 'uchtepa', regex: /учтеп|uchtep/ },
    { id: 'yashnobod', regex: /яшнабад|яшнобод|yashnobod|yashnabad/ },
    { id: 'yangihayot', regex: /янгиха|янгиҳа|yangihayot|yangi\s*hayot/ },
    { id: 'bektemir', regex: /бектемир|bektemir/ },
    { id: 'chilonzor', regex: /чиланзар|чилонзор|chilonzor/ },
    { id: 'yunusobod', regex: /юнусабад|юнусобод|yunusobod/ },
    { id: 'mirzo_ulugbek', regex: /улугбек|улуғбек|ulug'?bek|ulugbek/ },
    { id: 'shayxontohur', regex: /шайхант|шайхонт|shayxont|shayhont/ },
    { id: 'sergeli', regex: /сергел|сиргал|sergeli|sirg'?ali/ },
  ];

  let districtMatched = false;
  for (const dm of districtMatchers) {
    if (dm.regex.test(q)) {
      updatedInputs.district = dm.id;
      const dObj = TASHKENT_DISTRICTS[dm.id];
      appliedChangesRu.push(`Район: ${dObj.nameRu}`);
      appliedChangesUz.push(`Tuman: ${dObj.nameUz}`);
      districtMatched = true;
      break;
    }
  }

  if (!districtMatched) {
    if (/дешев[а-яё]*\s+район|дешев[а-яё]*\s+аренд|arzon\s+tuman|arzon\s+ijara/.test(q)) {
      updatedInputs.district = 'bektemir';
      appliedChangesRu.push(`Район: ${TASHKENT_DISTRICTS.bektemir.nameRu}`);
      appliedChangesUz.push(`Tuman: ${TASHKENT_DISTRICTS.bektemir.nameUz}`);
    } else if (/премиум\s+район|центр\s+город|yuqori\s+xarid/.test(q)) {
      updatedInputs.district = 'mirobod';
      appliedChangesRu.push(`Район: ${TASHKENT_DISTRICTS.mirobod.nameRu}`);
      appliedChangesUz.push(`Tuman: ${TASHKENT_DISTRICTS.mirobod.nameUz}`);
    } else if (/лучш[а-яё]*\s+трафик|больш[а-яё]*\s+трафик|eng\s+katta\s+trafik/.test(q)) {
      updatedInputs.district = 'chilonzor';
      appliedChangesRu.push(`Район: ${TASHKENT_DISTRICTS.chilonzor.nameRu}`);
      appliedChangesUz.push(`Tuman: ${TASHKENT_DISTRICTS.chilonzor.nameUz}`);
    }
  }

  // 3. Detect area (absolute & relative)
  const relAreaMatch = q.match(
    /(увелич[а-яё]*|добав[а-яё]*|уменьш[а-яё]*|сократ[а-яё]*|ko'paytir\w*|kamaytir\w*)\s+(?:площад[а-яё]*|maydon\w*)\s+(?:на|ga)\s+(\d+(?:[.,]\d+)?)/
  );
  if (relAreaMatch && relAreaMatch[2]) {
    const delta = Math.round(Number(relAreaMatch[2].replace(',', '.')) || 0);
    const isDec = /уменьш|сократ|kamaytir/.test(relAreaMatch[1]);
    const baseArea = updatedInputs.areaSqm ?? currentInputs.areaSqm;
    const areaVal = Math.max(5, Math.min(1000, baseArea + (isDec ? -delta : delta)));
    updatedInputs.areaSqm = areaVal;
    appliedChangesRu.push(`Площадь: ${areaVal} м²`);
    appliedChangesUz.push(`Maydon: ${areaVal} m²`);
  } else {
    const areaMatch =
      q.match(/(\d+(?:[.,]\d+)?)\s*(?:м²|м2|кв\.?\s*м?|квадрат[а-яё]*|m²|m2)(?=$|[^а-яёa-z])/ ) ||
      q.match(/(?:площад[а-яё]*|помещен[а-яё]*|maydon\w*)[^\d]{0,12}(\d+(?:[.,]\d+)?)/);
    if (areaMatch && areaMatch[1]) {
      const areaVal = Math.max(
        5,
        Math.min(1000, Math.round(Number(areaMatch[1].replace(',', '.'))))
      );
      updatedInputs.areaSqm = areaVal;
      appliedChangesRu.push(`Площадь: ${areaVal} м²`);
      appliedChangesUz.push(`Maydon: ${areaVal} m²`);
    }
  }

  // 4. Detect staff count (absolute, zero & relative)
  if (/без сотрудник|без персонал|один буду работать|xodimsiz|yolg'iz/.test(q)) {
    updatedInputs.staffCount = 0;
    appliedChangesRu.push('Штат: 0 чел.');
    appliedChangesUz.push('Xodimlar: 0 nafar');
  } else {
    const relStaffMatch = q.match(
      /(добав[а-яё]*|увелич[а-яё]*|убер[а-яё]*|уменьш[а-яё]*|сократ[а-яё]*|qo'sh\w*|kamaytir\w*)\s+(\d+)\s*(?:сотрудник[а-яё]*|чел[а-яё]*|работник[а-яё]*|xodim\w*|nafar)/
    );
    if (relStaffMatch && relStaffMatch[2]) {
      const delta = Math.round(Number(relStaffMatch[2]) || 0);
      const isDec = /убер|уменьш|сократ|kamaytir/.test(relStaffMatch[1]);
      const baseStaff = updatedInputs.staffCount ?? currentInputs.staffCount;
      const staffVal = Math.max(0, Math.min(100, baseStaff + (isDec ? -delta : delta)));
      updatedInputs.staffCount = staffVal;
      appliedChangesRu.push(`Штат: ${staffVal} чел.`);
      appliedChangesUz.push(`Xodimlar: ${staffVal} nafar`);
    } else {
      const staffMatch =
        q.match(
          /(\d+)\s*(?:сотрудник[а-яё]*|чел[а-яё]*|работник[а-яё]*|шве[а-яё]*|xodim\w*|nafar)/
        ) ||
        q.match(/(?:штат[а-яё]*|персонал[а-яё]*|xodimlar\w*)[^\d]{0,10}(\d+)/);
      if (staffMatch && staffMatch[1]) {
        const staffVal = Math.max(
          0,
          Math.min(100, Math.round(Number(staffMatch[1])))
        );
        updatedInputs.staffCount = staffVal;
        appliedChangesRu.push(`Штат: ${staffVal} чел.`);
        appliedChangesUz.push(`Xodimlar: ${staffVal} nafar`);
      }
    }
  }

  // 4b. Detect average salary
  const salMatch = q.match(
    /(?:зарплат[а-яё]*|зп(?=$|[^а-яё])|оклад[а-яё]*|maosh\w*)[^\d$]{0,12}(\d+(?:[.,]\d+)?)\s*(млрд|млн|тыс|mlrd|mln|ming|\$|дол[а-яё]*|k)?/
  );
  if (salMatch && salMatch[1]) {
    const salUzs = Math.max(
      0,
      parseMonetaryToUzs(salMatch[1], salMatch[2] || (Number(salMatch[1].replace(',', '.')) <= 30 ? 'млн' : undefined), currency)
    );
    updatedInputs.avgSalaryUzs = salUzs;
    appliedChangesRu.push(`Зарплата: ${formatUzs(salUzs, 'ru', currency)}`);
    appliedChangesUz.push(`Maosh: ${formatUzs(salUzs, 'uz', currency)}`);
  }

  // 5. Detect loan amount (absolute, zero & relative)
  let hasExplicitLoan = false;
  if (/без кредита|без займа|kreditsiz/.test(q)) {
    updatedInputs.loanAmountUzs = 0;
    hasExplicitLoan = true;
    appliedChangesRu.push('Кредит: 0 (без кредита)');
    appliedChangesUz.push('Kredit: 0 (kreditsiz)');
  } else {
    const relLoanMatch = q.match(
      /(увелич[а-яё]*|добав[а-яё]*|уменьш[а-яё]*|сниз[а-яё]*|сократ[а-яё]*|ko'paytir\w*|kamaytir\w*)\s+(?:сумм[а-яё]*\s+)?(?:кредит[а-яё]*|займ[а-яё]*|kredit\w*)\s+(на|ga)\s+(\d+(?:[.,]\d+)?)\s*(млрд|млн|тыс|mlrd|mln|ming|\$|дол[а-яё]*|k)?/
    );
    if (relLoanMatch && relLoanMatch[3] && relLoanMatch[2]) {
      const deltaUzs = parseMonetaryToUzs(relLoanMatch[3], relLoanMatch[4], currency);
      const isDec = /уменьш|сниз|сократ|kamaytir/.test(relLoanMatch[1]);
      const baseLoan = updatedInputs.loanAmountUzs ?? currentInputs.loanAmountUzs;
      const nextLoan = Math.max(0, baseLoan + (isDec ? -deltaUzs : deltaUzs));
      updatedInputs.loanAmountUzs = nextLoan;
      hasExplicitLoan = true;
      appliedChangesRu.push(`Кредит: ${formatUzs(nextLoan, 'ru', currency)}`);
      appliedChangesUz.push(`Kredit: ${formatUzs(nextLoan, 'uz', currency)}`);
    } else {
      const loanMatch = q.match(
        /(?:кредит[а-яё]*|займ[а-яё]*|kredit\w*)[^\d$]{0,14}(\d+(?:[.,]\d+)?)\s*(млрд|млн|тыс|mlrd|mln|ming|\$|дол[а-яё]*|k)?/
      );
      const loanReverseMatch = q.match(
        /(\d+(?:[.,]\d+)?)\s*(млрд|млн|mlrd|mln|\$|k)\s*(?:кредит|kredit)/
      );
      const matchedLoan = loanMatch || loanReverseMatch;
      if (matchedLoan && matchedLoan[1]) {
        const loanUzs = parseMonetaryToUzs(
          matchedLoan[1],
          matchedLoan[2],
          currency
        );
        updatedInputs.loanAmountUzs = loanUzs;
        hasExplicitLoan = true;
        appliedChangesRu.push(`Кредит: ${formatUzs(loanUzs, 'ru', currency)}`);
        appliedChangesUz.push(`Kredit: ${formatUzs(loanUzs, 'uz', currency)}`);
      }
    }
  }

  // 6. Detect own capital
  let hasExplicitOwn = false;
  const ownMatch = q.match(
    /(?:свои[а-яё]*|собствен[а-яё]*|капитал[а-яё]*|вложен[а-яё]*|shaxsiy\w*)[^\d$]{0,14}(\d+(?:[.,]\d+)?)\s*(млрд|млн|тыс|mlrd|mln|ming|\$|дол[а-яё]*|k)?/
  );
  if (ownMatch && ownMatch[1]) {
    const ownUzs = parseMonetaryToUzs(ownMatch[1], ownMatch[2], currency);
    updatedInputs.ownCapitalUzs = ownUzs;
    hasExplicitOwn = true;
    appliedChangesRu.push(`Свои средства: ${formatUzs(ownUzs, 'ru', currency)}`);
    appliedChangesUz.push(`Shaxsiy mablag': ${formatUzs(ownUzs, 'uz', currency)}`);
  }

  // 7. Detect expected monthly revenue, average check & daily customers
  const avgCheckMatch = q.match(
    /(?:средн[а-яё]*\s+чек[а-яё]*|чек[а-яё]*|o'rtacha\s+chek\w*)[^\d$]{0,10}(\d+(?:[.,]\d+)?)\s*(тыс|ming|млн|mln|\$|дол[а-яё]*|k)?/
  );
  let extractedAvgCheck: number | undefined;
  if (avgCheckMatch && avgCheckMatch[1]) {
    const rawNum = Number(avgCheckMatch[1].replace(',', '.')) || 0;
    let checkUzs = 0;
    if (avgCheckMatch[2] || currency === 'USD') {
      checkUzs = parseMonetaryToUzs(avgCheckMatch[1], avgCheckMatch[2], currency);
    } else {
      checkUzs = rawNum < 1000 ? Math.round(rawNum * 1000) : Math.round(rawNum);
    }
    if (checkUzs >= 5000) {
      extractedAvgCheck = checkUzs;
      updatedInputs.customAvgCheckUzs = checkUzs;
      appliedChangesRu.push(`Средний чек: ${formatUzs(checkUzs, 'ru', currency)}`);
      appliedChangesUz.push(`O'rtacha chek: ${formatUzs(checkUzs, 'uz', currency)}`);
    }
  }

  const dailyCustMatch = q.match(
    /(\d+)\s*(?:клиент[а-яё]*|покупател[а-яё]*|гост[а-яё]*|чел[а-яё]*|mijoz\w*)\s*(?:в день|в сутки|кунига|kuniga)/
  );
  if (dailyCustMatch && dailyCustMatch[1]) {
    const custPerDay = Math.max(1, Math.round(Number(dailyCustMatch[1]) || 1));
    const checkForCalc =
      extractedAvgCheck ??
      currentInputs.customAvgCheckUzs ??
      (Math.round(currentInputs.expectedMonthlyRevenueUzs / 30 / 40) || 50_000);
    const revUzs = Math.max(1_000_000, custPerDay * checkForCalc * 30);
    updatedInputs.expectedMonthlyRevenueUzs = revUzs;
    appliedChangesRu.push(`Выручка (~${custPerDay} кл./день): ${formatUzs(revUzs, 'ru', currency)}`);
    appliedChangesUz.push(`Tushum (~${custPerDay} mijoz/kun): ${formatUzs(revUzs, 'uz', currency)}`);
  } else {
    const revMatch = q.match(
      /(?:выручк[а-яё]*|оборот[а-яё]*|tushum\w*)[^\d$]{0,14}(\d+(?:[.,]\d+)?)\s*(млрд|млн|тыс|mlrd|mln|ming|\$|дол[а-яё]*|k)?/
    );
    if (revMatch && revMatch[1] && !q.includes('стресс') && !q.includes('-25%')) {
      const revUzs = Math.max(
        1_000_000,
        parseMonetaryToUzs(revMatch[1], revMatch[2], currency)
      );
      updatedInputs.expectedMonthlyRevenueUzs = revUzs;
      appliedChangesRu.push(`Выручка: ${formatUzs(revUzs, 'ru', currency)}`);
      appliedChangesUz.push(`Tushum: ${formatUzs(revUzs, 'uz', currency)}`);
    }
  }

  // 8. Detect COGS / Margin %
  const cogsMatch = q.match(/(?:себестоимост[а-яё]*|закупк[а-яё]*|сырь[а-яё]*|xomashyo\w*)[^\d]{0,10}(\d+)\s*%/);
  if (cogsMatch && cogsMatch[1]) {
    const cogsVal = Math.max(10, Math.min(75, Math.round(Number(cogsMatch[1]) || 30)));
    updatedInputs.cogsPercent = cogsVal;
    appliedChangesRu.push(`Себестоимость: ${cogsVal}%`);
    appliedChangesUz.push(`Tannarx: ${cogsVal}%`);
  }

  // 9. Detect Legal Form
  let hasExplicitTax = false;
  if (/самозанят|o'zini\s*o'zi/.test(q)) {
    updatedInputs.legalForm = 'self_employed' as LegalFormId;
    hasExplicitTax = true;
    appliedChangesRu.push('Форма: Самозанятый');
    appliedChangesUz.push("Shakl: O'zini o'zi band");
  } else if (/(?:^|[^а-яё])(?:ятт|ип)(?=$|[^а-яё])|\byatt\b/.test(q)) {
    updatedInputs.legalForm = 'yatt' as LegalFormId;
    hasExplicitTax = true;
    appliedChangesRu.push('Форма: ЯТТ / ИП');
    appliedChangesUz.push('Shakl: YaTT');
  } else if (/(?:^|[^а-яё])(?:мчж|ооо)(?=$|[^а-яё])|\bmchj\b/.test(q)) {
    updatedInputs.legalForm = 'mchj' as LegalFormId;
    hasExplicitTax = true;
    appliedChangesRu.push('Форма: МЧЖ / ООО');
    appliedChangesUz.push('Shakl: MChJ');
  }

  // 10. Detect Bank Selection (all 10 banks)
  let hasExplicitBank = false;
  const bankMatchers: Array<{ id: BankProgramId; nameRu: string; nameUz: string; regex: RegExp }> = [
    { id: 'preferential', nameRu: 'Агробанк', nameUz: 'Agrobank', regex: /агробанк|agrobank/ },
    { id: 'brb', nameRu: 'БРБ (BRB)', nameUz: 'BRB', regex: /развити[а-яё]*\s+бизнес|(?:^|[^а-яё])брб(?=$|[^а-яё])|\bbrb\b/ },
    { id: 'ipakyuli', nameRu: 'Ипак Йули Банк', nameUz: "Ipak Yo'li Banki", regex: /ипак\s*йул|ipak\s*yo/ },
    { id: 'aab', nameRu: 'Asia Alliance Bank', nameUz: 'Asia Alliance Bank', regex: /asia\s*alliance|азия\s*альянс|альянс\s*банк/ },
    { id: 'aloqa', nameRu: 'Aloqabank', nameUz: 'Aloqabank', regex: /алока|aloqa/ },
    { id: 'commercial', nameRu: 'Капиталбанк', nameUz: 'Kapitalbank', regex: /капиталбанк|капитал\s*банк|kapital/ },
    { id: 'hamkor', nameRu: 'Hamkorbank', nameUz: 'Hamkorbank', regex: /хамкор|hamkor/ },
    { id: 'trast', nameRu: 'Трастбанк', nameUz: 'Trastbank', regex: /трастбанк|траст\s*банк|trast/ },
    { id: 'sqb', nameRu: 'Узпромстройбанк (SQB)', nameUz: 'SQB', regex: /узпромстрой|\bsqb\b/ },
    { id: 'nbu', nameRu: 'Узнацбанк (NBU)', nameUz: 'NBU', regex: /узнацбанк|(?:^|[^а-яё])нбу(?=$|[^а-яё])|\bnbu\b/ },
  ];

  for (const bm of bankMatchers) {
    if (bm.regex.test(q)) {
      updatedInputs.selectedBankProgram = bm.id;
      hasExplicitBank = true;
      appliedChangesRu.push(`Банк: ${bm.nameRu}`);
      appliedChangesUz.push(`Bank: ${bm.nameUz}`);
      break;
    }
  }

  // 11. Detect Loan Term (months or years)
  const yearTermMatch = q.match(/(?:на\s+|срок\s+|muddat\w*\s*)(\d+)\s*(?:год[а-яё]*|лет|yil\w*)/);
  const monthTermMatch = q.match(/(?:срок[а-яё]*|на\s+|muddat\w*)[^\d]{0,8}(\d+)\s*(?:мес[а-яё]*|oy\w*)/);
  if (yearTermMatch && yearTermMatch[1]) {
    const yrs = Math.round(Number(yearTermMatch[1]) || 2);
    const months = Math.min(60, Math.max(12, yrs * 12));
    updatedInputs.loanTermMonths = months;
    appliedChangesRu.push(`Срок кредита: ${months} мес.`);
    appliedChangesUz.push(`Kredit muddati: ${months} oy`);
  } else if (
    monthTermMatch &&
    monthTermMatch[1] &&
    !/льгот|отсроч|imtiyoz/.test(q.slice(Math.max(0, (monthTermMatch.index || 0) - 20), (monthTermMatch.index || 0) + 15))
  ) {
    const rawM = Math.round(Number(monthTermMatch[1]) || 24);
    const allowedTerms = [12, 18, 24, 36, 48, 60];
    const nearest = allowedTerms.reduce((best, cur) =>
      Math.abs(cur - rawM) < Math.abs(best - rawM) ? cur : best
    );
    updatedInputs.loanTermMonths = nearest;
    appliedChangesRu.push(`Срок кредита: ${nearest} мес.`);
    appliedChangesUz.push(`Kredit muddati: ${nearest} oy`);
  }

  // 12. Detect Grace Period (months)
  if (/без льгот|без отсрочки|льготный период 0|imtiyozsiz/.test(q)) {
    updatedInputs.gracePeriodMonths = 0;
    appliedChangesRu.push('Льготный период: 0 мес.');
    appliedChangesUz.push('Imtiyozli davr: 0 oy');
  } else {
    const graceMatch = q.match(
      /(?:льгот[а-яё]*\s*(?:период[а-яё]*)?|отсрочк[а-яё]*|imtiyoz\w*\s*(?:davr\w*)?)[^\d]{0,12}(\d+)\s*(?:мес[а-яё]*|oy\w*)?/
    );
    if (graceMatch && graceMatch[1]) {
      const graceVal = Math.max(0, Math.min(24, Math.round(Number(graceMatch[1]) || 0)));
      updatedInputs.gracePeriodMonths = graceVal;
      appliedChangesRu.push(`Льготный период: ${graceVal} мес.`);
      appliedChangesUz.push(`Imtiyozli davr: ${graceVal} oy`);
    }
  }

  // 13. Detect Repayment Type (annuity vs differentiated)
  if (/дифференцир|differensial/.test(q)) {
    updatedInputs.repaymentType = 'differentiated';
    appliedChangesRu.push('График: Дифференцированный');
    appliedChangesUz.push('Jadval: Differensial');
  } else if (/аннуитет|annuitet/.test(q)) {
    updatedInputs.repaymentType = 'annuity';
    appliedChangesRu.push('График: Аннуитетный');
    appliedChangesUz.push('Jadval: Annuitet');
  }

  // 13b. Configure Financing automatically from Total Budget when explicit own/loan weren't set separately
  if (totalBudgetUzs > 0 && !hasExplicitOwn && !hasExplicitLoan) {
    const targetCapex =
      (updatedInputs.ownCapitalUzs ?? currentInputs.ownCapitalUzs) +
        (updatedInputs.loanAmountUzs ?? currentInputs.loanAmountUzs) ||
      165_000_000;
    const wantsLoanExplicit = /с\s+кредит|в\s+кредит|kreditga|kredit\s+bilan/.test(q);
    if (wantsLoanExplicit) {
      const ownPart = Math.round(totalBudgetUzs * 0.6);
      const loanPart = Math.max(30_000_000, totalBudgetUzs - ownPart);
      updatedInputs.ownCapitalUzs = ownPart;
      updatedInputs.loanAmountUzs = loanPart;
    } else if (totalBudgetUzs >= targetCapex) {
      updatedInputs.ownCapitalUzs = totalBudgetUzs;
      updatedInputs.loanAmountUzs = 0;
    } else {
      updatedInputs.ownCapitalUzs = totalBudgetUzs;
      updatedInputs.loanAmountUzs = Math.max(
        30_000_000,
        targetCapex - totalBudgetUzs
      );
    }
    appliedChangesRu.push(
      `Бюджет: ${formatUzs(updatedInputs.ownCapitalUzs, 'ru', currency)} свои + ${formatUzs(updatedInputs.loanAmountUzs, 'ru', currency)} кредит`
    );
    appliedChangesUz.push(
      `Budjet: ${formatUzs(updatedInputs.ownCapitalUzs, 'uz', currency)} shaxsiy + ${formatUzs(updatedInputs.loanAmountUzs, 'uz', currency)} kredit`
    );
  }

  // 14. Smart One-Click Optimization & Autonomous Setup by AI
  const hadExplicitBank = hasExplicitBank;
  const hadExplicitTax = hasExplicitTax;
  const hadExplicitGrace = updatedInputs.gracePeriodMonths !== undefined;
  const hadExplicitRepayment = updatedInputs.repaymentType !== undefined;

  if (
    /открой|открыт|собери|настрой|запусти|сделай\s+бизнес[-\s]?план|составь\s+бизнес[-\s]?план|хочу\s+открыт|(?:^|[^а-яё])(?:увеличь|подними|снизь|сделай\s+выгод|быстрее\s+окуп)|оптимизируй|лучшие\s+условия|поставь\s+лучший\s+банк|выбери\s+лучший\s+банк|подбери\s+лучший|чтобы\s+банк\s+одобрил|qanday\s+biznes|nima\s+och|sozla|tuz(?=$|[^a-z])|biznes[-\s]?reja\s+tuz|ishga\s+tushir|foyda[a-z']*\s+oshir|yaxshila|eng\s+qulay\s+shart|optimal\s+qil/.test(
      q
    )
  ) {
    if (
      updatedInputs.cogsPercent === undefined &&
      !/^📈?\s*как\s+/.test(q) &&
      /(?:увеличь|подними|снизь)\s+(?:чист[а-яё]*\s+)?(?:прибыл|расход)|сделай\s+выгод|быстрее\s+окуп|foyda[a-z']*\s+oshir/.test(
        q
      )
    ) {
      const nextCogs = Math.max(15, currentInputs.cogsPercent - 3);
      if (nextCogs !== currentInputs.cogsPercent) {
        updatedInputs.cogsPercent = nextCogs;
        appliedChangesRu.push(`Оптимизация COGS: ${nextCogs}%`);
        appliedChangesUz.push(`Tannarx optimizatsiyasi: ${nextCogs}%`);
      }
    }

    const candidateInputs: BusinessInputs = { ...currentInputs, ...updatedInputs };
    if (/чтобы\s+банк\s+одобрил/.test(q) && candidateInputs.loanTermMonths < 36) {
      candidateInputs.loanTermMonths = 36;
      updatedInputs.loanTermMonths = 36;
      appliedChangesRu.push('Срок увеличен: 36 мес.');
      appliedChangesUz.push('Muddat oshirildi: 36 oy');
    }
    const calc = calculateFinancials(candidateInputs, currency);
    const bestBank = calc.bankPrograms[calc.recommendedBankId];
    const optTax = calc.taxRegimes[calc.optimalTaxRegimeId];

    if (!hadExplicitTax) {
      updatedInputs.legalForm = calc.optimalTaxRegimeId;
      appliedChangesRu.push(`Оптимальный режим: ${optTax.nameRu}`);
      appliedChangesUz.push(`Optimal soliq: ${optTax.nameUz}`);
    }
    if (!hadExplicitBank) {
      updatedInputs.selectedBankProgram = calc.recommendedBankId;
      appliedChangesRu.push(
        candidateInputs.loanAmountUzs > 0
          ? `Рекоменд. банк: ${bestBank.bankNamesRu} (льгота ${bestBank.recommendedGraceMonths} мес.)`
          : `Резервный банк: ${bestBank.bankNamesRu}`
      );
      appliedChangesUz.push(
        candidateInputs.loanAmountUzs > 0
          ? `Tavsiya bank: ${bestBank.bankNamesUz} (imtiyoz ${bestBank.recommendedGraceMonths} oy)`
          : `Zaxira bank: ${bestBank.bankNamesUz}`
      );
    }
    if (candidateInputs.loanAmountUzs > 0) {
      if (!hadExplicitGrace) {
        updatedInputs.gracePeriodMonths = bestBank.recommendedGraceMonths;
      }
      if (!hadExplicitRepayment) {
        updatedInputs.repaymentType = bestBank.recommendedRepaymentType;
      }
    }
  }

  return { updatedInputs, appliedChangesRu, appliedChangesUz };
}

/**
 * Instant, deterministic AI Financial Consultant (~180ms, zero network lag, zero hallucinations).
 * Computes live metrics directly from the financial model & Uzbekistan Tax/Banking rules.
 */
export async function askFinancialConsultant(
  userPrompt: string,
  inputs: BusinessInputs,
  results: FinancialResults,
  lang: Language,
  currency: Currency = 'UZS'
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 180));
  return generateDeepExpertResponse(
    userPrompt,
    inputs,
    results,
    lang,
    currency
  );
}
