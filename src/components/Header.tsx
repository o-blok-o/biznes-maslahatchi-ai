import React, { useEffect, useRef, useState } from 'react';
import {
  BookmarkCheck,
  BookmarkPlus,
  Briefcase,
  ChevronDown,
  Crown,
  FileDown,
  FolderOpen,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  Currency,
  Language,
  SavedProject,
  SubscriptionPlanId,
} from '../types/business';
import { TRANSLATIONS } from '../data/translations';
import { formatUzs } from '../utils/calculations';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onOpenPdfModal: () => void;
  plan: SubscriptionPlanId;
  freeAttemptsLeft: number;
  maxFreeAttempts: number;
  onOpenPricingModal: () => void;
  savedProjects: SavedProject[];
  onSaveCurrentProject: () => void;
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  currency,
  onCurrencyChange,
  onOpenPdfModal,
  plan,
  freeAttemptsLeft,
  maxFreeAttempts,
  onOpenPricingModal,
  savedProjects,
  onSaveCurrentProject,
  onLoadProject,
  onDeleteProject,
}) => {
  const t = TRANSLATIONS[lang];
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsProjectsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveClick = () => {
    onSaveCurrentProject();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs no-print">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Official Brand Mark */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-emerald-600/20 ring-1 ring-black/5 transition-transform duration-300 hover:scale-105">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  Biznes-Maslahatchi AI
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <Sparkles className="w-3 h-3 animate-pulse-soft" />
                  {t.chamberBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Mobile Currency & Language */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={() =>
                onCurrencyChange(currency === 'UZS' ? 'USD' : 'UZS')
              }
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs"
            >
              {currency === 'UZS' ? 'UZS' : 'USD $'}
            </button>
            <button
              onClick={() => onLanguageChange(lang === 'ru' ? 'uz' : 'ru')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs"
            >
              {lang.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Right: Controls, My Projects, Bank Application & PDF */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Currency Segmented Control */}
          <div className="hidden sm:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onCurrencyChange('UZS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currency === 'UZS'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {lang === 'ru' ? 'UZS (сум)' : "UZS (so'm)"}
            </button>
            <button
              onClick={() => onCurrencyChange('USD')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currency === 'USD'
                  ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              USD ($)
            </button>
          </div>

          {/* Language Segmented Control */}
          <div className="hidden sm:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onLanguageChange('ru')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                lang === 'ru'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => onLanguageChange('uz')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                lang === 'uz'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              UZ
            </button>
          </div>

          {/* Saved Projects Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsProjectsOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all active:scale-95"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'ru' ? 'Мои проекты' : 'Loyihalarim'}</span>
              {savedProjects.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                  {savedProjects.length}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProjectsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-fade-up">
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    {lang === 'ru' ? 'Сохраненные расчеты' : 'Saqlangan loyihalar'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      justSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {justSaved ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>
                          {lang === 'ru' ? 'Сохранено!' : 'Saqlandi!'}
                        </span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>
                          {lang === 'ru' ? 'Сохранить текущий' : 'Joriyni saqlash'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {savedProjects.length === 0 ? (
                  <p className="text-[11px] text-slate-500 py-4 text-center leading-relaxed">
                    {lang === 'ru'
                      ? 'Сохраните свой бизнес-расчет, чтобы сравнить разные районы или варианты.'
                      : 'Turli tuman va variantlarni taqqoslash uchun hisob-kitobingizni saqlang.'}
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {savedProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onLoadProject(proj);
                            setIsProjectsOpen(false);
                          }}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {proj.name}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 tabular-nums">
                            <span>{proj.savedAt}</span>
                            <span>•</span>
                            <span
                              className={
                                proj.netMonthlyProfitUzs >= 0
                                  ? 'text-emerald-700 font-semibold'
                                  : 'text-rose-600 font-semibold'
                              }
                            >
                              {formatUzs(
                                proj.netMonthlyProfitUzs,
                                lang,
                                currency
                              )}
                              /{lang === 'ru' ? 'мес' : 'oy'}
                            </span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                          title={lang === 'ru' ? 'Удалить' : "O'chirish"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subscription Plan & Attempts Badge Button */}
          <button
            type="button"
            onClick={onOpenPricingModal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border shadow-2xs transition-all active:scale-95 ${
              plan === 'pro'
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-600/20'
                : freeAttemptsLeft <= 1
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-slate-50 hover:bg-indigo-50 text-slate-800 border-slate-200'
            }`}
          >
            {plan === 'pro' ? (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {lang === 'ru' ? 'Pro • ∞ Безлимит' : 'Pro • ∞ Cheksiz'}
                </span>
              </>
            ) : (
              <>
                <Crown className="w-3.5 h-3.5 text-indigo-600" />
                <span className="tabular-nums">
                  {lang === 'ru'
                    ? `Free: ${freeAttemptsLeft}/${maxFreeAttempts} попыток`
                    : `Bepul: ${freeAttemptsLeft}/${maxFreeAttempts} urinish`}
                </span>
              </>
            )}
          </button>

          {/* Primary Gradient Sheen Emerald CTA (PDF) */}
          <button
            type="button"
            onClick={onOpenPdfModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-600 text-white shadow-sm shadow-emerald-600/20 ring-1 ring-emerald-700/20 transition-all active:scale-[0.98]"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{t.downloadPdfBtn}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
