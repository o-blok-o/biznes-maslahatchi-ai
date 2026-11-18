import {
  BusinessInputs,
  Currency,
  FinancialResults,
  Language,
} from '../types/business';
import { TASHKENT_DISTRICTS } from '../data/tashkentDistricts';
import { TRANSLATIONS } from '../data/translations';
import {
  getBusinessDisplayName,
  USD_RATE_UZS,
} from './calculations';

/**
 * Exports full financial model (Passport, CAPEX, OPEX, Taxes, Credit & 12-Month Cashflow)
 * to a UTF-8 BOM CSV file optimized for Microsoft Excel.
 */
export function exportFinancialModelCsv(
  inputs: BusinessInputs,
  results: FinancialResults,
  lang: Language,
  currency: Currency
): void {
  const t = TRANSLATIONS[lang];
  const district = TASHKENT_DISTRICTS[inputs.district];
  const businessName = getBusinessDisplayName(inputs, lang);
  const isUsd = currency === 'USD';

  const fmtVal = (uzs: number) =>
    isUsd ? Math.round(uzs / USD_RATE_UZS) : Math.round(uzs);
  const curUnit = isUsd ? 'USD' : 'UZS';

  const esc = (cell: string | number) => {
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows: Array<Array<string | number>> = [];

  rows.push([
    lang === 'ru'
      ? 'BIZNES-MASLAHATCHI AI — ФИНАНСОВАЯ МОДЕЛЬ (ТПП РУз)'
      : "BIZNES-MASLAHATCHI AI — MOLIYAVIY MODEL (O'zR SSP)",
    `${lang === 'ru' ? 'Валюта' : 'Valyuta'}: ${curUnit}`,
    `${lang === 'ru' ? 'Дата' : 'Sana'}: ${new Date().toLocaleDateString(
      lang === 'ru' ? 'ru-RU' : 'uz-UZ'
    )}`,
  ]);
  rows.push([]);

  // 1. Passport
  rows.push([t.pdfModal.section1Passport]);
  rows.push([t.businessTypeLabel, businessName]);
  rows.push([
    t.districtLabel,
    lang === 'ru' ? district.nameRu : district.nameUz,
  ]);
  rows.push([
    t.legalFormLabel,
    lang === 'ru'
      ? results.activeTaxRegime.nameRu
      : results.activeTaxRegime.nameUz,
  ]);
  rows.push([t.areaLabel, inputs.areaSqm]);
  rows.push([t.staffLabel, inputs.staffCount]);
  rows.push([
    t.kpiPayback,
    results.paybackMonths > 0
      ? `${results.paybackMonths} ${t.monthsUnit} (ROI ${results.annualRoiPercent}%)`
      : lang === 'ru'
      ? 'Не окупается'
      : "O'zini oqlamaydi",
  ]);
  rows.push([]);

  // 2. CAPEX
  rows.push([t.businessPlanTab.capexTitle, curUnit]);
  rows.push([t.ownCapitalLabel, fmtVal(inputs.ownCapitalUzs)]);
  rows.push([t.loanAmountLabel, fmtVal(inputs.loanAmountUzs)]);
  rows.push([t.businessPlanTab.capexEquipment, fmtVal(results.capex.equipmentUzs)]);
  rows.push([
    t.businessPlanTab.capexRenovation,
    fmtVal(results.capex.renovationUzs),
  ]);
  rows.push([
    t.businessPlanTab.capexInventory,
    fmtVal(results.capex.inventoryMarketingUzs),
  ]);
  rows.push([
    t.businessPlanTab.capexReserve,
    fmtVal(results.capex.reserveRegistrationUzs),
  ]);
  rows.push([
    t.businessPlanTab.capexTotal,
    fmtVal(results.capex.totalInvestmentUzs),
  ]);
  rows.push([]);

  // 3. OPEX
  rows.push([t.businessPlanTab.opexTitle, curUnit]);
  rows.push([t.expectedRevenueLabel, fmtVal(inputs.expectedMonthlyRevenueUzs)]);
  rows.push([t.businessPlanTab.opexRent, fmtVal(results.opex.rentUzs)]);
  rows.push([t.businessPlanTab.opexPayroll, fmtVal(results.opex.payrollGrossUzs)]);
  rows.push([t.businessPlanTab.opexCogs, fmtVal(results.opex.cogsUzs)]);
  rows.push([
    t.businessPlanTab.opexUtilities,
    fmtVal(results.opex.utilitiesAndMarketingUzs),
  ]);
  rows.push([
    t.businessPlanTab.opexTax,
    fmtVal(results.activeTaxRegime.monthlyTaxUzs),
  ]);
  rows.push([
    t.businessPlanTab.opexLoan,
    fmtVal(results.selectedBankProgramResult.monthlyPaymentUzs),
  ]);
  rows.push([t.businessPlanTab.opexNetProfit, fmtVal(results.netMonthlyProfitUzs)]);
  rows.push([]);

  // 4. Loan & Scoring
  rows.push([t.pdfModal.section4TaxLoan]);
  rows.push([
    t.bankProgramLabel,
    lang === 'ru'
      ? results.selectedBankProgramResult.nameRu
      : results.selectedBankProgramResult.nameUz,
  ]);
  rows.push([
    t.creditTab.colRate,
    `${results.selectedBankProgramResult.annualRatePercent}%`,
  ]);
  rows.push([t.loanTermLabel, `${inputs.loanTermMonths} ${t.monthsUnit}`]);
  rows.push(['DSCR', results.dscr]);
  rows.push([
    t.creditTab.approvalProbLabel,
    `${results.approvalProbabilityPercent}%`,
  ]);
  rows.push([]);

  // 5. 12-Month Cashflow
  rows.push([t.pdfModal.section5Cashflow, curUnit]);
  rows.push([
    lang === 'ru' ? 'Месяц' : 'Oy',
    lang === 'ru' ? 'Загрузка (%)' : 'Quvvat (%)',
    `${t.businessPlanTab.legendRevenue} (${curUnit})`,
    `${t.businessPlanTab.legendExpenses} (${curUnit})`,
    `${t.businessPlanTab.legendNetProfit} (${curUnit})`,
    `${t.businessPlanTab.legendCumulative} (${curUnit})`,
  ]);
  for (const m of results.cashflow12Months) {
    rows.push([
      m.month,
      `${m.rampUpPercent}%`,
      fmtVal(m.monthlyRevenue),
      fmtVal(m.monthlyExpenses),
      fmtVal(m.monthlyNet),
      fmtVal(m.cumulativeCashflow),
    ]);
  }

  const csvBody = rows.map((r) => r.map(esc).join(';')).join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvBody], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const safeName = businessName
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
  link.href = url;
  link.download = `biznes_plan_${safeName || 'model'}_${curUnit}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
