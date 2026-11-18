export type Language = 'ru' | 'uz';

export type Currency = 'UZS' | 'USD';

export type DistrictId =
  | 'chilonzor'
  | 'yunusobod'
  | 'mirzo_ulugbek'
  | 'shayxontohur'
  | 'mirobod'
  | 'yakkasaroy'
  | 'olmazor'
  | 'uchtepa'
  | 'yashnobod'
  | 'sergeli'
  | 'yangihayot'
  | 'bektemir';

export type BusinessTypeId = 'coffee' | 'education' | 'sewing' | 'retail';

export type LegalFormId = 'self_employed' | 'yatt' | 'mchj';

export type BankProgramId =
  | 'preferential' // 1. Агробанк (18–24%, агро-программы 6–18%, льготный 6–12 мес.)
  | 'brb'          // 2. Банк развития бизнеса (BRB) (11–28,5%, льготный 6–12 мес.)
  | 'ipakyuli'     // 3. Ипак Йули Банк (18–24%, в валюте от 10%, льготный 6–12 мес.)
  | 'aab'          // 4. Asia Alliance Bank (18,5–24%, льготный до 6 мес.)
  | 'aloqa'        // 5. Aloqabank (19–25%, льготный 6–24 мес.)
  | 'commercial'   // 6. Капиталбанк (18–26%, льготный 3–12 мес.)
  | 'hamkor'       // 7. Hamkorbank (18–28%, льготный 3–6 мес.)
  | 'trast'        // 8. Трастбанк (21–26%, льготный до 6 мес.)
  | 'sqb'          // 9. Узпромстройбанк (SQB) (23–24%, госпрограммы 8–12%, льготный 6–12 мес.)
  | 'nbu';         // 10. Узнацбанк (NBU) (от 23%, льготный 6–24 мес.)

export type SubscriptionPlanId = 'free' | 'pro';

export type RepaymentType = 'annuity' | 'differentiated';

export interface LoanScheduleRow {
  month: number;
  paymentUzs: number;
  principalUzs: number;
  interestUzs: number;
  balanceUzs: number;
}

export interface BusinessInputs {
  district: DistrictId;
  businessType: BusinessTypeId;
  customBusinessName?: string;
  customAvgCheckUzs?: number;
  legalForm: LegalFormId;
  areaSqm: number;
  staffCount: number;
  avgSalaryUzs: number;
  ownCapitalUzs: number;
  loanAmountUzs: number;
  loanTermMonths: number;
  selectedBankProgram: BankProgramId;
  repaymentType?: RepaymentType;
  gracePeriodMonths?: number;
  expectedMonthlyRevenueUzs: number;
  cogsPercent: number;
}

export interface Competitor {
  name: string;
  avgCheckUzs: number;
  rating: number;
  weaknessRu: string;
  weaknessUz: string;
  uspAdviceRu: string;
  uspAdviceUz: string;
}

export interface DistrictData {
  id: DistrictId;
  nameRu: string;
  nameUz: string;
  rentPerSqmUzs: number;
  trafficScore: number;
  purchasingPowerScore: number;
  competitionLevel: 'Low' | 'Medium' | 'High';
  summaryRu: string;
  summaryUz: string;
  competitors: Record<BusinessTypeId, Competitor[]>;
}

export interface CapexBreakdown {
  totalInvestmentUzs: number;
  equipmentUzs: number;
  renovationUzs: number;
  inventoryMarketingUzs: number;
  reserveRegistrationUzs: number;
  equipmentPercent: number;
  renovationPercent: number;
  inventoryPercent: number;
  reservePercent: number;
}

export interface OpexBreakdown {
  rentUzs: number;
  payrollGrossUzs: number;
  cogsUzs: number;
  utilitiesAndMarketingUzs: number;
  totalBeforeTaxAndLoanUzs: number;
}

export interface TaxRegimeResult {
  id: LegalFormId;
  nameRu: string;
  nameUz: string;
  monthlyTaxUzs: number;
  annualTaxUzs: number;
  effectiveRatePercent: number;
  isEligible: boolean;
  ineligibilityReasonRu?: string;
  ineligibilityReasonUz?: string;
  breakdownRu: string[];
  breakdownUz: string[];
}

export interface BankProgramResult {
  id: BankProgramId;
  nameRu: string;
  nameUz: string;
  bankNamesRu: string;
  bankNamesUz: string;
  annualRatePercent: number;
  rateRangeRu: string;
  rateRangeUz: string;
  graceRangeRu: string;
  graceRangeUz: string;
  minGraceMonths: number;
  maxGraceMonths: number;
  recommendedGraceMonths: number;
  recommendedRepaymentType: RepaymentType;
  graceMonthlyPaymentUzs: number;
  maxLoanUzs: number;
  maxTermMonths: number;
  minEquityPercent: number;
  collateralInfoRu: string;
  collateralInfoUz: string;
  bestForRu: string;
  bestForUz: string;
  recommendationReasonRu: string;
  recommendationReasonUz: string;
  isEligibleByLimit: boolean;
  matchScore: number;
  monthlyPaymentUzs: number;
  totalPaymentUzs: number;
  totalInterestUzs: number;
  dscr: number;
  approvalStatus: 'High' | 'Medium' | 'Low';
  approvalProbabilityPercent: number;
  schedule: LoanScheduleRow[];
}

export interface CashflowMonth {
  month: string;
  monthIndex: number;
  rampUpPercent: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyNet: number;
  cumulativeCashflow: number;
}

export interface FinancialResults {
  capex: CapexBreakdown;
  opex: OpexBreakdown;
  taxRegimes: Record<LegalFormId, TaxRegimeResult>;
  optimalTaxRegimeId: LegalFormId;
  activeTaxRegime: TaxRegimeResult;
  annualTaxSavingsUzs: number;
  bankPrograms: Record<BankProgramId, BankProgramResult>;
  selectedBankProgramResult: BankProgramResult;
  recommendedBankId: BankProgramId;
  topRecommendedBanks: BankProgramResult[];
  ebitdaUzs: number;
  dscr: number;
  approvalStatus: 'High' | 'Medium' | 'Low';
  approvalProbabilityPercent: number;
  netMonthlyProfitUzs: number;
  paybackMonths: number;
  annualRoiPercent: number;
  breakEvenMonth: number | null;
  breakEvenMonthlyRevenueUzs: number;
  safetyMarginPercent: number;
  dailyRevenueUzs: number;
  estimatedAvgCheckUzs: number;
  dailyCustomersNeeded: number;
  breakEvenDailyCustomers: number;
  cashflow12Months: CashflowMonth[];
  cashflowExtended: CashflowMonth[];
}

export interface PresetItem {
  id: string;
  titleRu: string;
  titleUz: string;
  badgeRu: string;
  badgeUz: string;
  inputs: BusinessInputs;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SavedProject {
  id: string;
  name: string;
  savedAt: string;
  inputs: BusinessInputs;
  netMonthlyProfitUzs: number;
}
