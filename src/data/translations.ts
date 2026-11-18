import { Language } from '../types/business';

export interface TranslationDictionary {
  appTitle: string;
  appSubtitle: string;
  chamberBadge: string;
  presetsLabel: string;
  apiKeyBtn: string;
  downloadPdfBtn: string;
  sidebarTitle: string;
  sidebarSubtitle: string;
  districtLabel: string;
  businessTypeLabel: string;
  legalFormLabel: string;
  areaLabel: string;
  staffLabel: string;
  avgSalaryLabel: string;
  startupMoneyLabel: string;
  ownCapitalLabel: string;
  loanAmountLabel: string;
  loanTermLabel: string;
  bankProgramLabel: string;
  expectedRevenueLabel: string;
  cogsPercentLabel: string;
  advancedSettingsShow: string;
  advancedSettingsHide: string;
  businessTypes: {
    coffee: string;
    education: string;
    sewing: string;
    retail: string;
  };
  businessTypesShort: {
    coffee: string;
    education: string;
    sewing: string;
    retail: string;
  };
  legalForms: {
    self_employed: string;
    yatt: string;
    mchj: string;
  };
  bankProgramsShort: {
    preferential: string;
    brb: string;
    ipakyuli: string;
    aab: string;
    aloqa: string;
    commercial: string;
    hamkor: string;
    trast: string;
    sqb: string;
    nbu: string;
  };
  kpiNetProfit: string;
  kpiNetProfitSub: string;
  kpiPayback: string;
  kpiRoiSub: string;
  kpiLoanPayment: string;
  kpiDscrBadge: string;
  kpiOptimalTax: string;
  kpiTaxSub: string;
  statusApproved: string;
  statusCollateral: string;
  statusRisk: string;
  monthsUnit: string;
  perMonthUnit: string;
  perYearUnit: string;
  sqmUnit: string;
  peopleUnit: string;
  uzsUnit: string;
  mlnUzsUnit: string;
  tabs: {
    market: string;
    businessPlan: string;
    taxes: string;
    credit: string;
  };
  aiChatTitle: string;
  aiChatSubtitle: string;
  aiOnlineBadge: string;
  aiSmartEngineBadge: string;
  aiInputPlaceholder: string;
  aiSendBtn: string;
  quickPrompts: {
    dscr: string;
    tax: string;
    competitors: string;
    investor: string;
  };
  marketTab: {
    districtOverview: string;
    rentRate: string;
    footTraffic: string;
    purchasingPower: string;
    competition: string;
    compLevels: {
      Low: string;
      Medium: string;
      High: string;
    };
    rentComparisonTitle: string;
    competitorsTitle: string;
    avgCheck: string;
    weaknessLabel: string;
    aiUspLabel: string;
  };
  businessPlanTab: {
    cumulativeChartTitle: string;
    cumulativeChartSub: string;
    revExpChartTitle: string;
    revExpChartSub: string;
    capexTitle: string;
    capexTotal: string;
    capexEquipment: string;
    capexRenovation: string;
    capexInventory: string;
    capexReserve: string;
    opexTitle: string;
    opexRent: string;
    opexPayroll: string;
    opexCogs: string;
    opexUtilities: string;
    opexTax: string;
    opexLoan: string;
    opexNetProfit: string;
    legendRevenue: string;
    legendExpenses: string;
    legendNetProfit: string;
    legendCumulative: string;
    breakEvenReached: string;
  };
  taxTab: {
    title: string;
    subtitle: string;
    optimalBadge: string;
    selectedBadge: string;
    notEligibleBadge: string;
    selectRegimeBtn: string;
    monthlyTax: string;
    annualTax: string;
    effectiveLoad: string;
    annualSavingsTitle: string;
    annualSavingsDesc: string;
  };
  creditTab: {
    dscrMeterTitle: string;
    dscrFormulaDesc: string;
    approvalHigh: string;
    approvalMedium: string;
    approvalLow: string;
    approvalProbLabel: string;
    bankComparisonTitle: string;
    colProgram: string;
    colRate: string;
    colMonthly: string;
    colOverpayment: string;
    colDscr: string;
    colStatus: string;
    colAction: string;
    selectProgramBtn: string;
    activeProgramBtn: string;
    collateralAdviceTitle: string;
    collateralAdviceText: string;
  };
  pdfModal: {
    modalTitle: string;
    printBtn: string;
    closeBtn: string;
    docHeaderOrg: string;
    docTitle: string;
    docSubtitle: string;
    section1Passport: string;
    section2Market: string;
    section3CapexOpex: string;
    section4TaxLoan: string;
    section5Cashflow: string;
    applicantSign: string;
    aiStampText: string;
    dateLabel: string;
  };
  apiModal: {
    title: string;
    desc: string;
    placeholder: string;
    saveBtn: string;
    clearBtn: string;
    closeBtn: string;
    statusActive: string;
    statusOffline: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  ru: {
    appTitle: 'Biznes-Maslahatchi',
    appSubtitle: 'Простой расчет бизнеса, налогов и кредита • ТПП Узбекистана',
    chamberBadge: 'ТПП Узбекистана',
    presetsLabel: 'Примеры:',
    apiKeyBtn: 'ИИ ключ',
    downloadPdfBtn: 'Скачать бизнес-план (PDF)',
    sidebarTitle: 'Настройте свой проект',
    sidebarSubtitle: 'Цифры справа обновляются сразу',
    districtLabel: 'Район Ташкента',
    businessTypeLabel: 'Чем планируете заниматься?',
    legalFormLabel: 'Как оформить бизнес',
    areaLabel: 'Площадь (м²)',
    staffLabel: 'Сотрудники (чел.)',
    avgSalaryLabel: 'Средняя зарплата (сум/мес)',
    startupMoneyLabel: 'Деньги на старт',
    ownCapitalLabel: 'Свои сбережения (сум)',
    loanAmountLabel: 'Сумма кредита (сум)',
    loanTermLabel: 'Срок кредита',
    bankProgramLabel: 'Программа кредита',
    expectedRevenueLabel: 'Ожидаемая выручка в месяц',
    cogsPercentLabel: 'Затраты на сырье и закупку товара (%)',
    advancedSettingsShow: 'Точная настройка (площадь, сотрудники, срок кредита)',
    advancedSettingsHide: 'Скрыть дополнительные настройки',
    businessTypes: {
      coffee: 'Кофейня / Пекарня',
      education: 'Учебный центр / Курсы',
      sewing: 'Швейный цех',
      retail: 'Магазин у дома / Мини-маркет',
    },
    businessTypesShort: {
      coffee: 'Кофейня',
      education: 'Учебный центр',
      sewing: 'Швейный цех',
      retail: 'Магазин',
    },
    legalForms: {
      self_employed: 'Самозанятый (1 БРВ/год, без найма, до 100 млн/год)',
      yatt: 'ЯТТ / ИП (4% с оборота, до 5 сотр. и до 1 млрд/год)',
      mchj: 'МЧЖ / ООО (НДС 12% + Налог на прибыль 15%)',
    },
    bankProgramsShort: {
      preferential: 'Агробанк (18–24%, агро 6–18%)',
      brb: 'Банк развития бизнеса BRB (11–28,5%)',
      ipakyuli: 'Ипак Йули Банк (18–24%, вал. от 10%)',
      aab: 'Asia Alliance Bank (18,5–24%)',
      aloqa: 'Aloqabank (19–25%)',
      commercial: 'Капиталбанк (18–26%)',
      hamkor: 'Hamkorbank (18–28%)',
      trast: 'Трастбанк (21–26%)',
      sqb: 'Узпромстройбанк SQB (23–24%, гос 8–12%)',
      nbu: 'Узнацбанк NBU (от 23%)',
    },
    kpiNetProfit: 'Чистая прибыль «на руки»',
    kpiNetProfitSub: 'После всех расходов, налогов и кредита',
    kpiPayback: 'Срок окупаемости',
    kpiRoiSub: 'Доходность в год',
    kpiLoanPayment: 'Платеж по кредиту',
    kpiDscrBadge: 'Оценка банка',
    kpiOptimalTax: 'Налог в месяц',
    kpiTaxSub: 'Выбранный режим',
    statusApproved: 'Высокий шанс',
    statusCollateral: 'Нужен залог',
    statusRisk: 'Высокий риск',
    monthsUnit: 'мес.',
    perMonthUnit: 'сум/мес',
    perYearUnit: 'сум/год',
    sqmUnit: 'м²',
    peopleUnit: 'чел.',
    uzsUnit: 'сум',
    mlnUzsUnit: 'млн сум',
    tabs: {
      market: 'Район и конкуренты',
      businessPlan: 'Расходы и окупаемость',
      taxes: 'Выбор налога',
      credit: 'Кредит в банке',
    },
    aiChatTitle: 'Помощник предпринимателя',
    aiChatSubtitle: 'Отвечает по вашим цифрам простым языком',
    aiOnlineBadge: 'Gemini Подключен',
    aiSmartEngineBadge: 'Советник готов',
    aiInputPlaceholder: 'Спросите про налоги, кредит или район...',
    aiSendBtn: 'Спросить',
    quickPrompts: {
      dscr: 'Одобрит ли банк кредит?',
      tax: 'Как платить меньше налогов?',
      competitors: 'Кто мои конкуренты в районе?',
      investor: 'Итоги для запуска бизнеса',
    },
    marketTab: {
      districtOverview: 'Описание района',
      rentRate: 'Средняя аренда',
      footTraffic: 'Поток людей на улице',
      purchasingPower: 'Платежеспособность жителей',
      competition: 'Конкуренция',
      compLevels: {
        Low: 'Низкая — легко зайти',
        Medium: 'Умеренная',
        High: 'Высокая — нужен сильный плюс',
      },
      rentComparisonTitle: 'Сколько стоит аренда в разных районах Ташкента (сум/м² в месяц)',
      competitorsTitle: 'Кто уже работает рядом и чем вы можете привлечь клиентов',
      avgCheck: 'Средний чек',
      weaknessLabel: 'Слабое место конкурента:',
      aiUspLabel: 'Как переманить клиентов (идея):',
    },
    businessPlanTab: {
      cumulativeChartTitle: 'Когда вернутся вложенные деньги (12 месяцев, млн сум)',
      cumulativeChartSub: 'Как бизнес постепенно окупает стартовые вложения и выходит в плюс',
      revExpChartTitle: 'Выручка, расходы и чистая прибыль по месяцам (млн сум)',
      revExpChartSub: 'Учтен плавный старт продаж: с 65% в первый месяц до 100–110% далее',
      capexTitle: 'Куда пойдут стартовые деньги',
      capexTotal: 'Всего нужно на старт (Свои + Кредит)',
      capexEquipment: 'Оборудование, техника и мебель',
      capexRenovation: 'Ремонт и подготовка помещения',
      capexInventory: 'Первая закупка товара и реклама',
      capexReserve: 'Запас денег на первые недели и оформление',
      opexTitle: 'Ежемесячные расходы и прибыль',
      opexRent: 'Аренда помещения',
      opexPayroll: 'Зарплаты сотрудникам',
      opexCogs: 'Затраты на сырье и закупку товара',
      opexUtilities: 'Свет, вода, интернет и реклама (6%)',
      opexTax: 'Налоги и соцвзносы',
      opexLoan: 'Платеж по кредиту в банк',
      opexNetProfit: 'Чистая прибыль предпринимателя в месяц',
      legendRevenue: 'Выручка',
      legendExpenses: 'Все расходы',
      legendNetProfit: 'Чистая прибыль',
      legendCumulative: 'Баланс с учетом вложений',
      breakEvenReached: 'Окупится на',
    },
    taxTab: {
      title: 'Какой налог выгоднее по законам Узбекистана',
      subtitle: 'Сравнение трех законных вариантов оформления бизнеса — выберите самый выгодный',
      optimalBadge: 'Самый выгодный вариант',
      selectedBadge: 'Выбран сейчас',
      notEligibleBadge: 'Не подходит по лимитам',
      selectRegimeBtn: 'Выбрать этот вариант',
      monthlyTax: 'Налог в месяц',
      annualTax: 'Налог за год',
      effectiveLoad: 'Доля от выручки',
      annualSavingsTitle: 'Сколько можно сэкономить за год',
      annualSavingsDesc: 'При выборе оптимального режима ваша экономия составит:',
    },
    creditTab: {
      dscrMeterTitle: 'Шанс одобрения кредита банком',
      dscrFormulaDesc: 'Банк смотрит, хватает ли вашей прибыли после налогов, чтобы спокойно платить кредит каждый месяц (запас прочности DSCR должен быть от 1.25–1.30x).',
      approvalHigh: 'Высокий шанс одобрения — доход уверенно покрывает ежемесячный платеж',
      approvalMedium: 'Средний шанс — банк может попросить залог (125%) или поручительство',
      approvalLow: 'Высокий риск отказа — уменьшите сумму кредита или выберите срок длиннее',
      approvalProbLabel: 'Вероятность одобрения',
      bankComparisonTitle: 'Сравнение кредитных программ банков Узбекистана',
      colProgram: 'Программа и банки',
      colRate: 'Ставка',
      colMonthly: 'Платеж в месяц',
      colOverpayment: 'Переплата за весь срок',
      colDscr: 'Запас (DSCR)',
      colStatus: 'Шанс одобрения',
      colAction: 'Выбор',
      selectProgramBtn: 'Выбрать',
      activeProgramBtn: 'Выбрано',
      collateralAdviceTitle: 'Что делать, если не хватает залога?',
      collateralAdviceText: 'Вы можете получить государственное поручительство через Компанию по развитию предпринимательства (до 50% от суммы кредита), а также частичную компенсацию процентной ставки.',
    },
    pdfModal: {
      modalTitle: 'Готовый бизнес-план для подачи в банк',
      printBtn: 'Распечатать или сохранить PDF',
      closeBtn: 'Закрыть',
      docHeaderOrg: 'ТОРГОВО-ПРОМЫШЛЕННАЯ ПАЛАТА РЕСПУБЛИКИ УЗБЕКИСТАН • «BIZNES-MASLAHATCHI»',
      docTitle: 'ТЕХНИКО-ЭКОНОМИЧЕСКОЕ ОБОСНОВАНИЕ (БИЗНЕС-ПЛАН)',
      docSubtitle: 'для предоставления в коммерческий банк Республики Узбекистан на получение финансирования',
      section1Passport: '1. ПАСПОРТ ПРОЕКТА',
      section2Market: '2. ОБОСНОВАНИЕ ВЫБОРА РАЙОНА И РЫНКА',
      section3CapexOpex: '3. СТАРТОВЫЕ ВЛОЖЕНИЯ (CAPEX) И ЕЖЕМЕСЯЧНЫЙ БЮДЖЕТ (OPEX)',
      section4TaxLoan: '4. НАЛОГОВЫЙ РЕЖИМ И УСЛОВИЯ КРЕДИТА',
      section5Cashflow: '5. ПРОГНОЗ ДЕНЕЖНЫХ ПОТОКОВ НА 12 МЕСЯЦЕВ',
      applicantSign: 'Предприниматель (Подпись / М.П.): _______________________',
      aiStampText: 'Расчет проверен системой Biznes-Maslahatchi • ТПП РУз',
      dateLabel: 'Дата составления:',
    },
    apiModal: {
      title: 'Подключение Gemini API (по желанию)',
      desc: 'Помощник уже работает автономно и бесплатно на основе ваших точных расчетов. Если хотите, можете добавить свой ключ Google Gemini для развернутых ответов.',
      placeholder: 'Вставьте ключ AIzaSy...',
      saveBtn: 'Сохранить',
      clearBtn: 'Работать без ключа',
      closeBtn: 'Закрыть',
      statusActive: 'Подключен облачный ИИ Gemini',
      statusOffline: 'Включен встроенный умный советник (работает без интернета)',
    },
  },
  uz: {
    appTitle: 'Biznes-Maslahatchi',
    appSubtitle: "Biznes, soliq va kreditni oddiy hisoblash • O'zbekiston SSP",
    chamberBadge: "O'zbekiston SSP",
    presetsLabel: 'Tayyor misollar:',
    apiKeyBtn: 'AI kalit',
    downloadPdfBtn: 'Biznes-rejani yuklash (PDF)',
    sidebarTitle: 'Loyihangizni sozlang',
    sidebarSubtitle: "O'ng tomondagi raqamlar darhol yangilanadi",
    districtLabel: 'Toshkent tumani',
    businessTypeLabel: 'Qanday biznes ochmoqchisiz?',
    legalFormLabel: 'Biznesni rasmiylashtirish shakli',
    areaLabel: 'Maydon (m²)',
    staffLabel: 'Xodimlar soni',
    avgSalaryLabel: "O'rtacha maosh (so'm/oy)",
    startupMoneyLabel: "Boshlash uchun mablag'",
    ownCapitalLabel: "Shaxsiy jamg'arma (so'm)",
    loanAmountLabel: "Bank krediti summasi (so'm)",
    loanTermLabel: 'Kredit muddati',
    bankProgramLabel: 'Kredit dasturi',
    expectedRevenueLabel: 'Kutilayotgan oylik tushum',
    cogsPercentLabel: 'Xomashyo va mahsulot xarajati (%)',
    advancedSettingsShow: 'Aniq sozlash (maydon, xodimlar, kredit muddati)',
    advancedSettingsHide: "Qo'shimcha sozlamalarni yashirish",
    businessTypes: {
      coffee: 'Qahvaxona / Novvoyxona',
      education: "O'quv markazi / Kurslar",
      sewing: 'Tikuv sexi',
      retail: "Uy yonidagi do'kon / Minimarket",
    },
    businessTypesShort: {
      coffee: 'Qahvaxona',
      education: "O'quv markazi",
      sewing: 'Tikuv sexi',
      retail: "Do'kon",
    },
    legalForms: {
      self_employed: "O'zini o'zi band qilgan (yiliga 1 BHM, xodimsiz)",
      yatt: 'YaTT (Aylanmadan 4%, 5 xodimgacha, 1 mlrdgacha)',
      mchj: 'MChJ (QQS 12% + Foyda solig‘i 15%)',
    },
    bankProgramsShort: {
      preferential: 'Agrobank (18–24%, agro 6–18%)',
      brb: 'Biznesni rivojlantirish banki BRB (11–28,5%)',
      ipakyuli: 'Ipak Yo‘li Banki (18–24%, valyuta 10% dan)',
      aab: 'Asia Alliance Bank (18,5–24%)',
      aloqa: 'Aloqabank (19–25%)',
      commercial: 'Kapitalbank (18–26%)',
      hamkor: 'Hamkorbank (18–28%)',
      trast: 'Trastbank (21–26%)',
      sqb: 'SQB (23–24%, davlat 8–12%)',
      nbu: 'O‘zmilliybank NBU (23% dan)',
    },
    kpiNetProfit: "Qo'lga tegadigan sof foyda",
    kpiNetProfitSub: 'Xarajatlar, soliq va kreditdan keyin',
    kpiPayback: 'Qoplash muddati',
    kpiRoiSub: 'Yillik daromadlilik',
    kpiLoanPayment: "Oylik kredit to'lovi",
    kpiDscrBadge: 'Bank bahosi',
    kpiOptimalTax: 'Oylik soliq',
    kpiTaxSub: 'Tanlangan shakl',
    statusApproved: 'Yuqori imkoniyat',
    statusCollateral: 'Garov kerak',
    statusRisk: 'Xavf yuqori',
    monthsUnit: 'oy',
    perMonthUnit: "so'm/oy",
    perYearUnit: "so'm/yil",
    sqmUnit: 'm²',
    peopleUnit: 'nafar',
    uzsUnit: "so'm",
    mlnUzsUnit: "mln so'm",
    tabs: {
      market: 'Tuman va raqobatchilar',
      businessPlan: "Xarajatlar va o'zini oqlash",
      taxes: 'Soliq tanlash',
      credit: 'Bank krediti',
    },
    aiChatTitle: 'Tadbirkor yordamchisi',
    aiChatSubtitle: 'Raqamlaringiz asosida oddiy tilda tushuntiradi',
    aiOnlineBadge: 'Gemini Ulangan',
    aiSmartEngineBadge: 'Maslahatchi tayyor',
    aiInputPlaceholder: "Soliq, kredit yoki tuman haqida so'rang...",
    aiSendBtn: "So'rash",
    quickPrompts: {
      dscr: 'Bank kredit beradimi?',
      tax: 'Soliqlarni qanday kamaytirish mumkin?',
      competitors: 'Tumandagi raqobatchilar kim?',
      investor: 'Biznes boshlash uchun xulosa',
    },
    marketTab: {
      districtOverview: 'Tuman haqida qisqacha',
      rentRate: "O'rtacha ijara narxi",
      footTraffic: "Ko'chadagi odamlar oqimi",
      purchasingPower: 'Aholining xarid qobiliyati',
      competition: 'Raqobat',
      compLevels: {
        Low: 'Past — kirish oson',
        Medium: "O'rtacha",
        High: 'Yuqori — kuchli ustunlik kerak',
      },
      rentComparisonTitle: "Toshkent tumanlarida ijara narxlari (oyiga so'm/m²)",
      competitorsTitle: 'Yaqin atrofdagi raqobatchilar va mijozlarni jalb qilish yo‘llari',
      avgCheck: "O'rtacha chek",
      weaknessLabel: 'Raqobatchining zaif tomoni:',
      aiUspLabel: "Mijozlarni jalb qilish g'oyasi:",
    },
    businessPlanTab: {
      cumulativeChartTitle: "Tikilgan pul qachon qaytadi (12 oy, mln so'm)",
      cumulativeChartSub: "Biznes boshlang'ich sarmoyani qoplab, foydaga chiqish grafigi",
      revExpChartTitle: "Oylik tushum, xarajatlar va sof foyda (mln so'm)",
      revExpChartSub: "Savdoning bosqichma-bosqich o'sishi: 1-oyda 65% dan keyin 100–110% gacha",
      capexTitle: "Boshlang'ich pul qayerga sarflanadi",
      capexTotal: "Boshlash uchun jami kerak (Shaxsiy + Kredit)",
      capexEquipment: 'Uskunalar, texnika va mebel',
      capexRenovation: "Ta'mirlash va binoni tayyorlash",
      capexInventory: 'Ilk tovar xaridi va reklama',
      capexReserve: "Dastlabki haftalar zaxirasi va hujjatlar",
      opexTitle: 'Oylik xarajatlar va sof foyda',
      opexRent: 'Bino ijarasi',
      opexPayroll: 'Xodimlar maoshi',
      opexCogs: 'Xomashyo va mahsulot xarajati',
      opexUtilities: 'Svet, suv, internet va reklama (6%)',
      opexTax: 'Soliqlar va ijtimoiy to‘lovlar',
      opexLoan: "Bankka oylik kredit to'lovi",
      opexNetProfit: 'Tadbirkorning oylik sof foydasi',
      legendRevenue: 'Tushum',
      legendExpenses: 'Barcha xarajatlar',
      legendNetProfit: 'Sof foyda',
      legendCumulative: 'Sarmoyani hisobga olgan balans',
      breakEvenReached: 'Qoplanadi:',
    },
    taxTab: {
      title: "O'zbekiston qonunchiligi bo'yicha qaysi soliq foydaliroq",
      subtitle: "Biznesni rasmiylashtirishning 3 ta qonuniy usulini taqqoslang va eng qulayini tanlang",
      optimalBadge: 'Eng foydali variant',
      selectedBadge: 'Hozir tanlangan',
      notEligibleBadge: "Limit bo'yicha to'g'ri kelmaydi",
      selectRegimeBtn: 'Shu variantni tanlash',
      monthlyTax: 'Oylik soliq',
      annualTax: 'Yillik soliq',
      effectiveLoad: 'Tushumdagi ulushi',
      annualSavingsTitle: 'Yiliga qancha tejash mumkin',
      annualSavingsDesc: 'Optimal soliq turini tanlash orqali yillik tejamkorligingiz:',
    },
    creditTab: {
      dscrMeterTitle: 'Bank kredit berish ehtimoli',
      dscrFormulaDesc: "Bank soliqlardan keyingi foydangiz har oylik kredit to'lovini bemalol qoplashiga qaraydi (xavfsizlik zaxirasi DSCR ≥ 1.25–1.30x bo'lishi kerak).",
      approvalHigh: "Kredit olish imkoniyati yuqori — daromad to'lovni bemalol qoplaydi",
      approvalMedium: "O'rtacha imkoniyat — bank garov (125%) yoki kafillik so'rashi mumkin",
      approvalLow: 'Rad etilish xavfi yuqori — kredit summasini kamaytiring yoki muddatni uzaytiring',
      approvalProbLabel: 'Tasdiqlanish ehtimoli',
      bankComparisonTitle: "O'zbekiston banklari kredit dasturlarini taqqoslash",
      colProgram: 'Dastur va banklar',
      colRate: 'Stavka',
      colMonthly: "Oylik to'lov",
      colOverpayment: "Jami ortiqcha to'lov",
      colDscr: 'Zaxira (DSCR)',
      colStatus: 'Imkoniyat',
      colAction: 'Tanlov',
      selectProgramBtn: 'Tanlash',
      activeProgramBtn: 'Tanlangan',
      collateralAdviceTitle: 'Garov yetmasa nima qilish kerak?',
      collateralAdviceText: "Tadbirkorlikni rivojlantirish kompaniyasi orqali kredit summasining 50% gacha davlat kafilligini hamda foiz xarajatlarining bir qismiga kompensatsiya olishingiz mumkin.",
    },
    pdfModal: {
      modalTitle: 'Bankka topshirish uchun tayyor biznes-reja',
      printBtn: 'Chop etish yoki PDF saqlash',
      closeBtn: 'Yopish',
      docHeaderOrg: "O'ZBEKISTON RESPUBLIKASI SAVDO-SANOAT PALATASI • «BIZNES-MASLAHATCHI»",
      docTitle: 'TEXNIK-IQTISODIY ASOSNOMA (BIZNES-REJA)',
      docSubtitle: "O'zbekiston Respublikasi tijorat banklaridan moliyalashtirish olish uchun taqdim etiladi",
      section1Passport: '1. LOYIHA PASPORTI',
      section2Market: '2. TUMAN VA BOZOR TANLOVI ASOSNOMASI',
      section3CapexOpex: "3. BOSHLANG'ICH SARMOYA (CAPEX) VA OYLIK BYUDJET (OPEX)",
      section4TaxLoan: '4. SOLIQ REJIMI VA KREDIT SHARTLARI',
      section5Cashflow: '5. 12 OYLIK PUL OQIMI PROGNOZI',
      applicantSign: 'Tadbirkor (Imzo / M.O‘.): _______________________',
      aiStampText: "Biznes-Maslahatchi tizimi orqali tekshirilgan • O'zR SSP",
      dateLabel: 'Tuzilgan sana:',
    },
    apiModal: {
      title: 'Gemini API ulash (ixtiyoriy)',
      desc: "Yordamchi hozir ham aniq hisob-kitoblaringiz asosida bepul va internetsiz ishlayapti. Istasangiz, kengaytirilgan javoblar uchun Google Gemini kalitini kiritishingiz mumkin.",
      placeholder: 'AIzaSy... kalitini kiriting',
      saveBtn: 'Saqlash',
      clearBtn: 'Kalitsiz ishlash',
      closeBtn: 'Yopish',
      statusActive: 'Bulutli Gemini AI ulangan',
      statusOffline: "Ichki aqlli maslahatchi yoqilgan (internetsiz ham ishlaydi)",
    },
  },
};
