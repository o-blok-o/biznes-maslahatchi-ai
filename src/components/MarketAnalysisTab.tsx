import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Database,
  Lightbulb,
  MapPin,
  Star,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  BusinessInputs,
  Currency,
  DistrictId,
  Language,
} from '../types/business';
import { DISTRICT_LIST, TASHKENT_DISTRICTS } from '../data/tashkentDistricts';
import { TRANSLATIONS } from '../data/translations';
import {
  formatUzs,
  getActiveCompetitors,
  USD_RATE_UZS,
} from '../utils/calculations';

interface MarketAnalysisTabProps {
  lang: Language;
  currency: Currency;
  inputs: BusinessInputs;
  onSelectDistrict: (districtId: DistrictId) => void;
}

export const MarketAnalysisTab: React.FC<MarketAnalysisTabProps> = ({
  lang,
  currency,
  inputs,
  onSelectDistrict,
}) => {
  const t = TRANSLATIONS[lang];
  const currentDistrict = TASHKENT_DISTRICTS[inputs.district];
  const competitors = getActiveCompetitors(inputs, lang);
  const isUsd = currency === 'USD';

  const chartData = DISTRICT_LIST.map((d) => ({
    id: d.id,
    name:
      lang === 'ru'
        ? d.nameRu.replace(' район', '')
        : d.nameUz.replace(' tumani', ''),
    rentDisplay: isUsd
      ? Number((d.rentPerSqmUzs / USD_RATE_UZS).toFixed(1))
      : d.rentPerSqmUzs,
    rentUzs: d.rentPerSqmUzs,
    isCurrent: d.id === inputs.district,
  }));

  const getCompBadgeColor = (level: 'Low' | 'Medium' | 'High') => {
    if (level === 'Low')
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (level === 'Medium')
      return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-5 animate-fade-up tabular-nums">
      {/* District Overview & Colored Progress Bars */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm card-interactive">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'ru' ? currentDistrict.nameRu : currentDistrict.nameUz}
                </h3>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getCompBadgeColor(
                    currentDistrict.competitionLevel
                  )}`}
                >
                  {t.marketTab.competition}:{' '}
                  {t.marketTab.compLevels[currentDistrict.competitionLevel]}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-3xl">
                {lang === 'ru'
                  ? currentDistrict.summaryRu
                  : currentDistrict.summaryUz}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Visual District Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <span className="text-xs text-slate-500 block mb-1">
              {t.marketTab.rentRate}
            </span>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 whitespace-nowrap">
              {formatUzs(currentDistrict.rentPerSqmUzs, lang, currency)} /{' '}
              {t.sqmUnit}
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-1 whitespace-nowrap">
              {inputs.areaSqm} {t.sqmUnit} ={' '}
              {formatUzs(
                currentDistrict.rentPerSqmUzs * inputs.areaSqm,
                lang,
                currency
              )}
              /{lang === 'ru' ? 'мес' : 'oy'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                {t.marketTab.footTraffic}
              </span>
              <span className="font-bold text-indigo-700">
                {currentDistrict.trafficScore} / 100
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${currentDistrict.trafficScore}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                {t.marketTab.purchasingPower}
              </span>
              <span className="font-bold text-emerald-700">
                {currentDistrict.purchasingPowerScore} / 100
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${currentDistrict.purchasingPowerScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Rent Bar Chart across 5 Tashkent Districts */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm card-interactive">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <h4 className="text-sm font-bold text-slate-900">
            {lang === 'ru'
              ? `Стоимость аренды по районам Ташкента (${
                  isUsd ? '$/м² в месяц' : 'сум/м² в месяц'
                })`
              : `Toshkent tumanlari bo'yicha ijara narxi (${
                  isUsd ? '$/m² oyiga' : "so'm/m² oyiga"
                })`}
          </h4>
          <span className="text-xs text-slate-500">
            {lang === 'ru'
              ? 'Кликните на столбец для смены района'
              : 'Tumanni tanlash uchun ustunga bosing'}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 16, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={52}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) =>
                  isUsd ? `$${val}` : `${Math.round(val / 1000)}k`
                }
              />
              <Tooltip
                formatter={(
                  _value: number,
                  _name: string,
                  props: { payload?: { rentUzs: number } }
                ) => [
                  formatUzs(props?.payload?.rentUzs || 0, lang, currency),
                  t.marketTab.rentRate,
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
              <Bar
                dataKey="rentDisplay"
                radius={[6, 6, 0, 0]}
                className="cursor-pointer"
                onClick={(data) => {
                  if (data && data.id) {
                    onSelectDistrict(data.id as DistrictId);
                  }
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isCurrent ? '#059669' : '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3 Rich Competitor Cards with Amber Weakness & Emerald Winning Idea */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900">
              {t.marketTab.competitorsTitle}
            </h4>
          </div>
          {inputs.customBusinessName?.trim() && (
            <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              {lang === 'ru'
                ? `Ниша: ${inputs.customBusinessName.trim()}`
                : `Soha: ${inputs.customBusinessName.trim()}`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {competitors.map((comp, idx) => (
            <div
              key={idx}
              className="card-interactive bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="text-sm font-bold text-slate-900">
                    {comp.name}
                  </h5>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shrink-0 whitespace-nowrap">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    {comp.rating}
                  </span>
                </div>

                <div className="inline-block px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 mb-3 whitespace-nowrap">
                  {t.marketTab.avgCheck}:{' '}
                  <strong className="text-slate-900">
                    {formatUzs(comp.avgCheckUzs, lang, currency)}
                  </strong>
                </div>

                {/* Amber Weakness Callout */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>{t.marketTab.weaknessLabel}</span>
                  </div>
                  <p className="text-xs text-amber-950/80 leading-relaxed">
                    {lang === 'ru' ? comp.weaknessRu : comp.weaknessUz}
                  </p>
                </div>
              </div>

              {/* Emerald Winning Idea Callout */}
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 mb-1">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>{t.marketTab.aiUspLabel}</span>
                </div>
                <p className="text-xs text-emerald-950/90 leading-relaxed">
                  {lang === 'ru' ? comp.uspAdviceRu : comp.uspAdviceUz}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Geomarketing & Real Estate Data Sources Strip */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 mb-3">
          <Database className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            {lang === 'ru'
              ? 'Официальные источники геомаркетинговых данных по 12 районам Ташкента'
              : "Toshkentning 12 tumani bo'yicha rasmiy geomarketing ma'lumot manbalari"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 text-[11px] text-slate-600 leading-relaxed">
          <div className="bg-white border border-slate-200/80 rounded-xl p-3">
            <strong className="text-slate-900 block mb-1">
              {lang === 'ru' ? '1. Ставки аренды (сум/м²)' : "1. Ijara stavkalari (so'm/m²)"}
            </strong>
            {lang === 'ru'
              ? 'Медианные ставки коммерческих помещений street-retail (30–250 м²) по открытой аналитике OLX Недвижимость РУз, Uybor.uz и обзорам CMWP Uzbekistan.'
              : "OLX Ko'chmas mulk, Uybor.uz va CMWP Uzbekistan tahlillari bo'yicha 30–250 m² tijorat xonalari o'rtacha bozor stavkalari."}
          </div>
          <div className="bg-white border border-slate-200/80 rounded-xl p-3">
            <strong className="text-slate-900 block mb-1">
              {lang === 'ru' ? '2. Трафик и платежеспособность' : '2. Trafik va xarid qobiliyati'}
            </strong>
            {lang === 'ru'
              ? 'Оценка плотности населения, доходов на душу населения по данным Агентства статистики РУз (stat.uz), а также загруженности метрополитена и узлов 2GIS.'
              : "O'zR Statistika agentligi (stat.uz) ma'lumotlari, aholi zichligi, daromadlar hamda metro va 2GIS trafik indeksi."}
          </div>
          <div className="bg-white border border-slate-200/80 rounded-xl p-3">
            <strong className="text-slate-900 block mb-1">
              {lang === 'ru' ? '3. Конкуренты и средний чек' : "3. Raqobatchilar va o'rtacha chek"}
            </strong>
            {lang === 'ru'
              ? 'Карточки реальных заведений и компаний района, их рейтинги, типовые отзывы посетителей и открытые меню/прайсы из справочников 2GIS Ташкент и Яндекс Карт.'
              : "2GIS Toshkent va Yandex Xaritalardagi haqiqiy biznes nuqtalari, mijozlar sharhlari, reytinglar va ochiq narxnomalar."}
          </div>
        </div>
      </div>
    </div>
  );
};
