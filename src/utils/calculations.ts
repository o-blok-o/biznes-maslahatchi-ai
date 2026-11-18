import {
  BankProgramId,
  BankProgramResult,
  BusinessInputs,
  BusinessTypeId,
  CashflowMonth,
  Competitor,
  Currency,
  FinancialResults,
  Language,
  LegalFormId,
  LoanScheduleRow,
  RepaymentType,
  TaxRegimeResult,
} from '../types/business';
import { TASHKENT_DISTRICTS } from '../data/tashkentDistricts';
import { TRANSLATIONS } from '../data/translations';
import { UZ_ECONOMIC_CONFIG } from '../data/economicConfig';

export const USD_RATE_UZS = UZ_ECONOMIC_CONFIG.usdRateUzs;

export function formatNumber(value: number): string {
  const safeVal = Number.isFinite(value) ? Math.round(value) : 0;
  return safeVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatUzs(
  valueUzs: number,
  lang: Language = 'ru',
  currency: Currency = 'UZS'
): string {
  if (currency === 'USD') {
    const usdVal = Number.isFinite(valueUzs)
      ? Math.round(valueUzs / USD_RATE_UZS)
      : 0;
    const absFormatted = formatNumber(Math.abs(usdVal));
    return usdVal < 0 ? `-$${absFormatted}` : `$${absFormatted}`;
  }
  const safeVal = Number.isFinite(valueUzs) ? Math.round(valueUzs) : 0;
  const formatted = formatNumber(safeVal);
  return lang === 'ru' ? `${formatted} сум` : `${formatted} so'm`;
}

export function formatMln(
  valueUzs: number,
  lang: Language = 'ru',
  currency: Currency = 'UZS'
): string {
  if (currency === 'USD') {
    const usdVal = Number.isFinite(valueUzs) ? valueUzs / USD_RATE_UZS : 0;
    if (Math.abs(usdVal) >= 1000) {
      return `$${(usdVal / 1000).toFixed(1)}k`;
    }
    return `$${Math.round(usdVal)}`;
  }
  const safeVal = Number.isFinite(valueUzs) ? valueUzs / 1_000_000 : 0;
  const suffix = lang === 'ru' ? 'млн сум' : "mln so'm";
  return `${safeVal.toFixed(1)} ${suffix}`;
}

export function getBusinessDisplayName(
  inputs: BusinessInputs,
  lang: Language
): string {
  const custom = inputs.customBusinessName?.trim();
  if (custom && custom.length > 0) {
    return custom;
  }
  return TRANSLATIONS[lang].businessTypes[inputs.businessType];
}

export function getActiveCompetitors(
  inputs: BusinessInputs,
  lang: Language = 'ru'
): Competitor[] {
  const district =
    TASHKENT_DISTRICTS[inputs.district] || TASHKENT_DISTRICTS.chilonzor;
  const custom = inputs.customBusinessName?.trim();

  if (!custom) {
    return district.competitors[inputs.businessType];
  }

  const lower = custom.toLowerCase();
  const dShortRu = district.nameRu.replace(' район', '');
  const dShortUz = district.nameUz.replace(' tumani', '');
  const dShort = lang === 'ru' ? dShortRu : dShortUz;
  const ppFactor = district.purchasingPowerScore / 80;

  if (lower.includes('автомой') || lower.includes('avtomoy')) {
    return [
      {
        name: `AquaLux CarWash (${dShort})`,
        avgCheckUzs: 75000,
        rating: 4.6,
        weaknessRu:
          'Очереди в выходные и нет теплой комнаты ожидания с кофе.',
        weaknessUz:
          'Dam olish kunlari navbatlar va qahvali issiq kutish xonasining yo‘qligi.',
        uspAdviceRu:
          'Откройте уютный лаунж с кофе, Wi-Fi и онлайн-бронью бокса через Telegram-бот.',
        uspAdviceUz:
          'Qahva, bepul Wi-Fi va Telegram-bot orqali navbat band qilishga ega shinam kutish xonasi oching.',
      },
      {
        name:
          lang === 'ru'
            ? 'Мойка 24/7 Самообслуживания'
            : '24/7 Avto-yuvish Shoxobchasi',
        avgCheckUzs: 35000,
        rating: 4.3,
        weaknessRu:
          'Слабая химия зимой, нет услуги качественной химчистки салона.',
        weaknessUz:
          'Qishda kimyoviy vositalar sifati past va salon kimyoviy tozalash xizmati yo‘q.',
        uspAdviceRu:
          'Предложите экспресс-мойку с нано-воском и профессиональную химчистку за 2 часа.',
        uspAdviceUz:
          'Nano-vask bilan tezkor yuvish va 2 soatda professional salon tozalash xizmatini taklif qiling.',
      },
      {
        name: `Detailing Pro ${dShort}`,
        avgCheckUzs: 140000,
        rating: 4.8,
        weaknessRu:
          'Высокий прайс, недоступный для ежедневного заезда такси и корпоративных авто.',
        weaknessUz:
          'Taksi va korporativ mashinalar uchun kundalik narxlar haddan tashqari qimmat.',
        uspAdviceRu:
          'Заключите B2B-договоры с таксопарками и доставкой по тарифу «Ночная мойка −30%».',
        uspAdviceUz:
          'Taksoparklar va yetkazib berish xizmatlari bilan «Tungi yuvish −30%» B2B shartnomalarini tuzing.',
      },
    ];
  }

  if (lower.includes('стоматолог') || lower.includes('stomatolog')) {
    return [
      {
        name: `StomService (${dShort})`,
        avgCheckUzs: 380000,
        rating: 4.7,
        weaknessRu:
          'Сложно записаться на вечер после 18:00 и нет рассрочки на имплантацию.',
        weaknessUz:
          'Soat 18:00 dan keyin yozilish qiyin va implantatsiya uchun bo‘lib to‘lash yo‘q.',
        uspAdviceRu:
          'Работайте до 21:30 и подключите рассрочку 0% через Uzum Nasiya / Alif на брекеты и коронки.',
        uspAdviceUz:
          '21:30 gacha ishlang hamda breket va implantlar uchun Uzum Nasiya / Alif orqali 0% nasiyani ulang.',
      },
      {
        name: 'Sadaf Dental Clinic',
        avgCheckUzs: 450000,
        rating: 4.8,
        weaknessRu:
          'Нет отдельного детского кабинета с мультиками и игровой зоной.',
        weaknessUz:
          'Multfilmlar va o‘yin burchagiga ega alohida bolalar xonasi mavjud emas.',
        uspAdviceRu:
          'Сделайте семейную клинику: бесплатный первый чекап ребенку и скидка 15% для родителей.',
        uspAdviceUz:
          'Oilaviy klinika oching: bolalarga bepul ko‘rik va ota-onalar uchun 15% chegirma bering.',
      },
      {
        name: 'Dr. Smile Express',
        avgCheckUzs: 290000,
        rating: 4.4,
        weaknessRu:
          'Отсутствует собственный 3D-рентген (пациентов отправляют в другую клинику).',
        weaknessUz:
          'Xususiy 3D-rentgen apparati yo‘q (bemorlarni boshqa klinikaga yuborishadi).',
        uspAdviceRu:
          'Поставьте цифровой визиограф на месте: диагностика + план лечения с фото за 15 минут.',
        uspAdviceUz:
          'Klinikaning o‘zida raqamli viziograf o‘rnating: 15 daqiqada tashxis va davolash rejasi.',
      },
    ];
  }

  if (lower.includes('аптек') || lower.includes('dorixona')) {
    return [
      {
        name: `OXYmed (${dShort})`,
        avgCheckUzs: 95000,
        rating: 4.7,
        weaknessRu:
          'Нет круглосуточного дежурного окна в глубине жилого массива.',
        weaknessUz:
          'Turar-joy massivi ichkarisida 24/7 navbatchi oyna mavjud emas.',
        uspAdviceRu:
          'Откройте круглосуточную точку 24/7 с бесплатной доставкой лекарств по району за 20 минут.',
        uspAdviceUz:
          'Hudud bo‘ylab 20 daqiqada bepul yetkazib berish xizmatiga ega 24/7 dorixona oching.',
      },
      {
        name: 'Grand Pharm',
        avgCheckUzs: 110000,
        rating: 4.6,
        weaknessRu:
          'Наценка на импортные витамины и детское питание выше среднерыночной.',
        weaknessUz:
          'Import vitaminlar va bolalar ozuqasiga ustama bozor o‘rtachasidan yuqori.',
        uspAdviceRu:
          'Выделите полку «Мама и малыш» + ортопедия по ценам дистрибьютора с картой лояльности.',
        uspAdviceUz:
          '«Ona va bola» hamda ortopediya bo‘limini distribyutor narxlarida va bonus kartasi bilan yo‘lga qo‘ying.',
      },
      {
        name: lang === 'ru' ? 'Dori-Darmon Локальная' : 'Dori-Darmon Mahalliy',
        avgCheckUzs: 68000,
        rating: 4.2,
        weaknessRu: 'Очереди в утренние часы и слабый выбор дерматокосметики.',
        weaknessUz:
          'Ertalabki soatlarda navbatlar va dermatokosmetika tanlovining kamligi.',
        uspAdviceRu:
          'Добавьте востребованную зону дерматокосметики (La Roche-Posay / CeraVe) и Telegram-бронь рецепта.',
        uspAdviceUz:
          'Talab yuqori dermatokosmetika bo‘limini va Telegram orqali dori band qilish xizmatini qo‘shing.',
      },
    ];
  }

  if (lower.includes('пекарн') || lower.includes('novvoy') || lower.includes('тандыр')) {
    return [
      {
        name: `Safia Bakery (${dShort})`,
        avgCheckUzs: 58000,
        rating: 4.8,
        weaknessRu:
          'В утренний час-пик быстро разбирают горячий багет и тандырную выпечку.',
        weaknessUz:
          'Ertalabki tig‘iz vaqtda issiq baget va pishiriqlar tez tugab qoladi.',
        uspAdviceRu:
          'Выпекайте свежий хлеб и слойки каждые 90 минут с оповещением «Горячее из печи» в районе.',
        uspAdviceUz:
          'Har 90 daqiqada issiq non va qatlamalar chiqaring hamda mahalla guruhlarida xabar bering.',
      },
      {
        name: 'Toshkent Non & Somsa',
        avgCheckUzs: 28000,
        rating: 4.4,
        weaknessRu:
          'Только традиционная выпечка без европейских круассанов, кофе навынос и оплаты QR.',
        weaknessUz:
          'Faqat an’anaviy non-somsa, yevropacha kruassanlar, qahva va QR-to‘lov yo‘q.',
        uspAdviceRu:
          'Совместите горячую самсу/лепешки с современным кофе-пойнтом и безналичной оплатой.',
        uspAdviceUz:
          'Issiq somsa va nonlarni zamonaviy qahva burchagi va QR-to‘lov bilan birlashtiring.',
      },
      {
        name:
          lang === 'ru' ? 'Zira Домашняя Выпечка' : 'Zira Uy Pishiriqlari',
        avgCheckUzs: 42000,
        rating: 4.5,
        weaknessRu:
          'Нет диетической линейки (цельнозерновой хлеб, безглютеновые десерты).',
        weaknessUz:
          'Parhez mahsulotlari (butun donli non, shakarsiz pishiriqlar) liniyasi yo‘q.',
        uspAdviceRu:
          'Добавьте ремесленный хлеб на закваске (Sourdough) и подарочные боксы к чаю.',
        uspAdviceUz:
          'Xamirturushsiz hunarmandchilik noni (Sourdough) va sovg‘abop shirinlik qutilarini qo‘shing.',
      },
    ];
  }

  if (lower.includes('салон') || lower.includes("go'zallik") || lower.includes('барбер')) {
    return [
      {
        name: `Chic Salon (${dShort})`,
        avgCheckUzs: 185000,
        rating: 4.6,
        weaknessRu:
          'Долгое ожидание мастера даже по записи и нет комплексной услуги «в 4 руки».',
        weaknessUz:
          'Oldindan yozilgan mijozlar ham kutib qoladi, «4 qo‘l» kompleks xizmati yo‘q.',
        uspAdviceRu:
          'Запустите экспресс-пакет «Маникюр + укладка за 75 минут в 4 руки» и онлайн-запись 24/7.',
        uspAdviceUz:
          '«75 daqiqada 4 qo‘lda manikyur + ukladka» tezkor paketini va 24/7 onlayn yozilishni kiriting.',
      },
      {
        name: 'Beauty Bar Studio',
        avgCheckUzs: 220000,
        rating: 4.7,
        weaknessRu:
          'Мало мастеров мужского груминга и высокий ценник на базовое окрашивание.',
        weaknessUz:
          'Erkaklar xizmati kam va oddiy bo‘yash narxlari yuqori.',
        uspAdviceRu:
          'Внедрите прозрачное пакетное меню и подписку «Уход на месяц» со скидкой 20%.',
        uspAdviceUz:
          'Shaffof paketli menyu va 20% chegirmali «Bir oylik parvarish» obunasini joriy eting.',
      },
      {
        name: `Lash & Brow ${dShort}`,
        avgCheckUzs: 130000,
        rating: 4.3,
        weaknessRu:
          'Нет продажи профессионального домашнего ухода за волосами и кожей.',
        weaknessUz:
          'Uy sharoitida soch va teri parvarishi uchun professional vositalar sotilmaydi.',
        uspAdviceRu:
          'Поставьте витрину корейской и проф-косметики — это дает +18% к чистому чеку без затрат на аренду.',
        uspAdviceUz:
          'Koreys va professional kosmetika vitrinasini qo‘ying — bu ijarasiz +18% qo‘shimcha daromad beradi.',
      },
    ];
  }

  if (lower.includes('пункт') || lower.includes('topshirish') || lower.includes('пвз')) {
    return [
      {
        name: `Uzum Market ${lang === 'ru' ? 'ПВЗ' : 'PVZ'} (${dShort})`,
        avgCheckUzs: 45000,
        rating: 4.8,
        weaknessRu:
          'В вечерние часы (18:00–20:30) очередь на примерку в 2 кабинки.',
        weaknessUz:
          'Kechki soatlarda (18:00–20:30) 2 ta kiyib ko‘rish kabinasida navbat yuzaga keladi.',
        uspAdviceRu:
          'Оборудуйте 4 просторные примерочные и поставьте кофейный аппарат/вендинг в зоне ожидания.',
        uspAdviceUz:
          '4 ta keng kiyib ko‘rish xonasi va kutish hududida qahva apparati/vending o‘rnating.',
      },
      {
        name:
          lang === 'ru'
            ? 'Wildberries Точка выдачи'
            : 'Wildberries Topshirish Punkti',
        avgCheckUzs: 52000,
        rating: 4.6,
        weaknessRu:
          'Неудобный вход с колясками и отсутствие стола проверки электроники.',
        weaknessUz:
          'Bolalar aravachasi bilan kirish noqulay va texnikani tekshirish stoli yetishmaydi.',
        uspAdviceRu:
          'Сделайте безбарьерный вход, удобный стол проверки с розетками и упаковку посылок на отправку.',
        uspAdviceUz:
          'Qulay kirish pandusi, rozetkali tekshiruv stoli va jo‘natmalarni qadoqlash xizmatini qo‘shing.',
      },
      {
        name:
          lang === 'ru'
            ? 'Локальный Почтомат / Курьер-пойнт'
            : 'Mahalliy Pochtamat / Kuryer-poynt',
        avgCheckUzs: 38000,
        rating: 4.3,
        weaknessRu: 'Работает только на выдачу одного сервиса с низким оборотом.',
        weaknessUz: 'Faqat bitta xizmat buyurtmalarini beradi, aylanmasi past.',
        uspAdviceRu:
          'Объедините выдачу нескольких маркетплейсов + прием возвратов и экспресс-отправку BTS/Fargo.',
        uspAdviceUz:
          'Bir nechta marketpleyslar + BTS/Fargo tezkor jo‘natmalarini qabul qilishni birlashtiring.',
      },
    ];
  }

  if (lower.includes('фастфуд') || lower.includes('донер') || lower.includes('fastfud') || lower.includes('lavash')) {
    return [
      {
        name: `EVOS Express (${dShort})`,
        avgCheckUzs: 54000,
        rating: 4.7,
        weaknessRu:
          'Большие очереди в обед и стандартный вкус без авторских соусов.',
        weaknessUz:
          'Tushlik paytida katta navbatlar va mualliflik souslarisiz standart ta’m.',
        uspAdviceRu:
          'Запустите авторские соусы на мраморной говядине, предзаказ за 10 мин через Telegram и ночную доставку.',
        uspAdviceUz:
          'Maxsus sousli donerlar, Telegram orqali 10 daqiqada tayyorlash va tungi yetkazib berishni yo‘lga qo‘ying.',
      },
      {
        name: lang === 'ru' ? 'Oqtepa Lavash Локальный' : 'Oqtepa Lavash Mahalliy',
        avgCheckUzs: 48000,
        rating: 4.5,
        weaknessRu: 'Шумный зал, недостаточно комфортно для студентов и семей.',
        weaknessUz:
          'Shovqinli zal va oilalar hamda talabalar uchun qulaylik yetishmaydi.',
        uspAdviceRu:
          'Сделайте уютную посадку с зарядками для телефонов и комбо-ланчем за 39 000 сум.',
        uspAdviceUz:
          'Zamonaviy zaryadka o‘rinli zal va 39 000 so‘mlik kombo-lanch menyusini taklif qiling.',
      },
      {
        name: `Street Doner ${dShort}`,
        avgCheckUzs: 35000,
        rating: 4.1,
        weaknessRu:
          'Нет единых стандартов чистоты открытой кухни и терминала QR-чеков.',
        weaknessUz:
          'Ochiq oshxona tozalik standartlari va QR-chekli to‘lov tizimi zaif.',
        uspAdviceRu:
          'Установите прозрачную открытую кухню с видео-меню и онлайн-оплатой в 1 клик (Click/Payme).',
        uspAdviceUz:
          'Shaffof ochiq oshxona, video-menyu va 1 bosishda Click/Payme to‘lovini joriy eting.',
      },
    ];
  }

  if (lower.includes('националь') || lower.includes('milliy') || lower.includes('таом')) {
    return [
      {
        name: `Milliy Taomlar (${dShort})`,
        avgCheckUzs: 85000,
        rating: 4.6,
        weaknessRu:
          'Медленное обслуживание в обеденный пик (ожидание горячего до 25 мин).',
        weaknessUz:
          'Tushlik vaqtida xizmat sekin (taomni 25 daqiqagacha kutish).',
        uspAdviceRu:
          'Сделайте формат «Бизнес-раздача за 4 минуты» с фиксированными бизнес-ланчами для офисов и рабочих.',
        uspAdviceUz:
          'Ofislar va ishchilar uchun 4 daqiqada tayyor bo‘ladigan tezkor biznes-lanch formatini joriy eting.',
      },
      {
        name: lang === 'ru' ? 'Центр Плова и Самсы' : 'Osh va Somsa Markazi',
        avgCheckUzs: 72000,
        rating: 4.7,
        weaknessRu:
          'После 14:30 плов заканчивается, вечером заведение пустует.',
        weaknessUz:
          'Soat 14:30 dan keyin osh tugab qoladi va kechqurun mijoz kam.',
        uspAdviceRu:
          'Вечером переключайтесь на семейные ужины с шашлыками и доставку наборов к столу через Uzum Tezkor/Yandex Eats.',
        uspAdviceUz:
          'Kechqurun oilaviy shashlik kechki ovqatlari va Uzum Tezkor/Yandex Eats orqali yetkazib berishni yoqing.',
      },
      {
        name: `Choyxona ${dShort}`,
        avgCheckUzs: 110000,
        rating: 4.3,
        weaknessRu:
          'Устаревший интерьер и прокуренные залы, куда неудобно приходить с семьей.',
        weaknessUz: 'Eskirgan interyer va oila bilan kelish uchun noqulay muhit.',
        uspAdviceRu:
          'Оформите светлый современный этно-зал с отдельными чистыми кабинками для семей и гостей района.',
        uspAdviceUz:
          'Oilalar va mehmonlar uchun yorug‘, toza va zamonaviy milliy uslubdagi xonalar tashkil eting.',
      },
    ];
  }

  if (lower.includes('автосерв') || lower.includes('сто') || lower.includes('avtoservis')) {
    return [
      {
        name: `AutoMaster (${dShort})`,
        avgCheckUzs: 420000,
        rating: 4.5,
        weaknessRu:
          'Непрозрачные цены на запчасти и нет официальной гарантии на ремонт.',
        weaknessUz:
          'Ehtiyot qismlar narxi noaniq va ta’mirlashga rasmiy kafolat berilmaydi.',
        uspAdviceRu:
          'Показывайте точную смету до начала работ с фото-отчетом замены деталей в Telegram и гарантией 6 месяцев.',
        uspAdviceUz:
          'Ish boshlanishidan oldin aniq smeta, Telegramda fotohisobot va 6 oylik rasmiy kafolat bering.',
      },
      {
        name: lang === 'ru' ? 'Гараж-сервис на массиве' : 'Mahalla Avto-ustaxonasi',
        avgCheckUzs: 250000,
        rating: 4.1,
        weaknessRu:
          'Нет компьютерной диагностики гибридов и электромобилей (BYD, Chery, Kia).',
        weaknessUz:
          'Gibrid va elektromobillar (BYD, Chery, Kia) uchun kompyuter diagnostikasi yo‘q.',
        uspAdviceRu:
          'Закупите мультибрендовый сканер под китайские электромобили и гибриды — дефицитная ниша в Ташкенте.',
        uspAdviceUz:
          'Xitoy elektromobillari va gibridlar uchun zamonaviy skaner o‘rnating — Toshkentda talab eng yuqori yo‘nalish.',
      },
      {
        name:
          lang === 'ru'
            ? 'Express Oil & Шиномонтаж'
            : 'Express Oil & Shina Almashtirish',
        avgCheckUzs: 310000,
        rating: 4.6,
        weaknessRu: 'Нет теплой зоны ожидания с кофе и Wi-Fi на время ТО.',
        weaknessUz:
          'Texnik xizmat vaqtida qahva va Wi-Fi ga ega kutish xonasi yo‘q.',
        uspAdviceRu:
          'Внедрите замену масла и фильтров за 25 минут по предварительной записи с бесплатным кофе.',
        uspAdviceUz:
          'Oldindan yozilish orqali 25 daqiqada moy almashtirish va bepul qahva xizmatini yo‘lga qo‘ying.',
      },
    ];
  }

  if (lower.includes('фитнес') || lower.includes('спорт') || lower.includes('fitnes')) {
    return [
      {
        name: `BeFit / Chekhov (${dShort})`,
        avgCheckUzs: 850000,
        rating: 4.8,
        weaknessRu: 'Высокая стоимость годового абонемента без помесячной оплаты.',
        weaknessUz: 'Oylik to‘lovsiz faqat qimmat yillik abonement sotiladi.',
        uspAdviceRu:
          'Предложите гибкий помесячный абонемент от 350 000 сум и раздельные комфортные женские/мужские часы.',
        uspAdviceUz:
          'Oyiga 350 000 so‘mdan moslashuvchan abonement va ayollar/erkaklar uchun qulay alohida vaqtlar belgilang.',
      },
      {
        name:
          lang === 'ru'
            ? 'Локальный зал на цоколе'
            : 'Mahalla Sport Zali',
        avgCheckUzs: 280000,
        rating: 4.0,
        weaknessRu:
          'Душное помещение без приточно-вытяжной вентиляции и плохие душевые.',
        weaknessUz:
          'Havo aylanish tizimi zaif, issiq xona va noqulay dush kabinalari.',
        uspAdviceRu:
          'Сделайте упор на мощную вентиляцию, чистые просторные душевые и групповые программы (пилатес, бокс).',
        uspAdviceUz:
          'Kuchli ventilyatsiya, toza dush xonalari va guruh mashg‘ulotlariga (pilates, boks) urg‘u bering.',
      },
      {
        name: `FitStudio ${dShort}`,
        avgCheckUzs: 520000,
        rating: 4.5,
        weaknessRu: 'Слабый контроль со стороны дежурных тренеров для новичков.',
        weaknessUz: 'Yangi kelganlar uchun navbatchi murabbiylar nazorati yetarli emas.',
        uspAdviceRu:
          'Включите в первый месяц 2 бесплатные вводные тренировки с персональным тренером и план питания.',
        uspAdviceUz:
          'Birinchi oyda murabbiy bilan 2 ta bepul kirish mashg‘uloti va ovqatlanish rejasini qo‘shib bering.',
      },
    ];
  }

  if (lower.includes('одежд') || lower.includes('шоурум') || lower.includes('kiyim') || lower.includes('shourum')) {
    return [
      {
        name: `Fashion Showroom (${dShort})`,
        avgCheckUzs: 460000,
        rating: 4.6,
        weaknessRu:
          'Нет рассрочки 0-0-6 и долгий подбор размеров без онлайн-каталога.',
        weaknessUz:
          '0-0-6 nasiya tizimi va onlayn katalog bo‘yicha o‘lcham tanlash yo‘q.',
        uspAdviceRu:
          'Подключите рассрочку через Uzum Nasiya / Alif и ведите прямые продажи через Instagram Reels + Telegram.',
        uspAdviceUz:
          'Uzum Nasiya / Alif bo‘lib to‘lash tizimini ulang va Instagram Reels + Telegram orqali savdo qiling.',
      },
      {
        name:
          lang === 'ru' ? 'Сетевой масс-маркет (ТРЦ)' : 'Tarmoq Kiyim Do‘koni (SM)',
        avgCheckUzs: 590000,
        rating: 4.7,
        weaknessRu:
          'Огромные очереди в примерочные по выходным и однотипные модели.',
        weaknessUz:
          'Dam olish kunlari kiyib ko‘rish xonalarida navbat va bir xil andozalar.',
        uspAdviceRu:
          'Сделайте уютный бутик у дома с уникальными капсулами из Турции/Узбекистана и услугой бесплатной подгонки.',
        uspAdviceUz:
          'Turkiya/O‘zbekistonning sara kapsulalari va bepul kiyim moslashtirish xizmatiga ega shourum oching.',
      },
      {
        name: lang === 'ru' ? 'Вещевой базар / Ряды' : 'Kiyim Bozori / Qatorlar',
        avgCheckUzs: 290000,
        rating: 4.1,
        weaknessRu: 'Холодно зимой, жарко летом, неудобно примерять одежду.',
        weaknessUz: 'Qishda sovuq, yozda issiq va kiyim kiyib ko‘rish uchun sharoit yo‘q.',
        uspAdviceRu:
          'Предложите чистый зал с климат-контролем, большими зеркалами и честной ценой без торга.',
        uspAdviceUz:
          'Salqin, keng ko‘zguli zal va savdolashishga hojat bo‘lmagan aniq qulay narxlar taklif qiling.',
      },
    ];
  }

  if (lower.includes('мебел') || lower.includes('mebel')) {
    return [
      {
        name: `Mebel Pro ${dShort}`,
        avgCheckUzs: 6800000,
        rating: 4.5,
        weaknessRu: 'Затягивают сроки изготовления кухонь и шкафов до 45–60 дней.',
        weaknessUz: 'Oshxona va shkaflarni yasash muddati 45–60 kungacha cho‘zilib ketadi.',
        uspAdviceRu:
          'Гарантируйте изготовление за 14 дней по договору с 3D-визуализацией на замере бесплатно.',
        uspAdviceUz:
          'Shartnoma asosida 14 kunda tayyorlash kafolati va o‘lcham olishda bepul 3D-loyiha bering.',
      },
      {
        name: lang === 'ru' ? 'Мебельный цех на массиве' : 'Mahalla Mebel Sexi',
        avgCheckUzs: 4900000,
        rating: 4.2,
        weaknessRu:
          'Работают только на дешевом ЛДСП без качественной кромки ПВХ и фурнитуры Blum.',
        weaknessUz:
          'Faqat oddiy LDSP va arzon furnitura bilan ishlaydi, sifatli PVX qoplama yo‘q.',
        uspAdviceRu:
          'Используйте кромку Rehau/PUR и современную фурнитуру с доводчиками — дайте рассрочку до 12 месяцев.',
        uspAdviceUz:
          'Sifatli PVX qoplama va zamonaviy furnitura ishlating hamda 12 oygacha bo‘lib to‘lash imkonini bering.',
      },
      {
        name: lang === 'ru' ? 'Салон готовой мебели' : 'Tayyor Mebel Saloni',
        avgCheckUzs: 8200000,
        rating: 4.7,
        weaknessRu:
          'Стандартные размеры, которые не вписываются в нестандартные новостройки.',
        weaknessUz: 'Yangi uylarning o‘lchamlariga mos kelmaydigan standart mebellar.',
        uspAdviceRu:
          'Делайте корпусную мебель строго по миллиметрам квартиры под ключ с уборкой после монтажа.',
        uspAdviceUz:
          'Yangi xonadonlar o‘lchamiga millimetrigacha moslashtirib, tozalash xizmati bilan o‘rnatib bering.',
      },
    ];
  }

  const baseCheck = Math.round((85000 * ppFactor) / 5000) * 5000;

  return [
    {
      name:
        lang === 'ru'
          ? `${custom} «Барака» (${dShort})`
          : `${custom} «Baraka» (${dShort})`,
      avgCheckUzs: baseCheck,
      rating: 4.5,
      weaknessRu: `Нет онлайн-записи/предзаказа через Telegram, очереди в часы пик и устаревший сервис в ${dShortRu}.`,
      weaknessUz: `${dShortUz}da Telegram orqali oldindan yozilish tizimi yo'q, tig'iz vaqtda navbatlar va eskirgan xizmat ko'rsatish.`,
      uspAdviceRu: `Запустите для вашего проекта «${custom}» быструю онлайн-запись и оплату по Click/Payme за 15 секунд с кэшбэком 7%.`,
      uspAdviceUz: `«${custom}» loyihangiz uchun 15 soniyada onlayn navbat olish va Click/Payme orqali 7% keshbekli to'lovni yo'lga qo'ying.`,
    },
    {
      name:
        lang === 'ru' ? `${dShort} ${custom} Центр` : `${dShort} ${custom} Markazi`,
      avgCheckUzs: Math.round((baseCheck * 1.35) / 5000) * 5000,
      rating: 4.7,
      weaknessRu: `Завышенный чек из-за дорогой аренды на первой линии и жесткий график работы только до 19:00.`,
      weaknessUz: `Birinchi qatordagi qimmat ijara sababli yuqori narxlar va faqat soat 19:00 gacha cheklangan ish vaqti.`,
      uspAdviceRu: `Работайте с 08:00 до 22:00 и предложите жителям ${dShortRu} прозрачный базовый тариф на 15–20% выгоднее.`,
      uspAdviceUz: `Soat 08:00 dan 22:00 gacha ishlang va ${dShortUz} aholisiga 15–20% arzonroq shaffof bazaviy tarif taklif qiling.`,
    },
    {
      name:
        lang === 'ru'
          ? `Частный сервис «${custom} Плюс»`
          : `Xususiy xizmat «${custom} Plyus»`,
      avgCheckUzs: Math.round((baseCheck * 0.78) / 5000) * 5000,
      rating: 4.1,
      weaknessRu: `Нестабильное качество услуг, отсутствие гарантии на чек и неудобная парковка.`,
      weaknessUz: `Xizmat sifatining barqaror emasligi, rasmiy kafolat yo'qligi va noqulay avtoturargoh.`,
      uspAdviceRu: `Сделайте упор на официальный стандарт качества, удобный заезд/вход и программу лояльности для постоянных клиентов.`,
      uspAdviceUz: `Rasmiy sifat standarti, qulay kirish/avtoturargoh va doimiy mijozlar uchun bonus dasturiga e'tibor qarating.`,
    },
  ];
}

export function calculateAnnuityPayment(
  principalUzs: number,
  annualRatePercent: number,
  termMonths: number
): number {
  const P = Math.max(0, Number(principalUzs) || 0);
  const n = Math.max(1, Math.round(Number(termMonths) || 12));
  if (P <= 0) return 0;

  const r = annualRatePercent / 100 / 12;
  if (r <= 0) return Math.round(P / n);

  const factor = Math.pow(1 + r, n);
  const payment = P * ((r * factor) / (factor - 1));
  return Number.isFinite(payment) ? Math.round(payment) : 0;
}

/**
 * Generates exact month-by-month loan amortization schedule supporting both
 * annuity & differentiated repayment as well as grace periods (interest-only months).
 */
export function buildLoanSchedule(
  principalUzs: number,
  annualRatePercent: number,
  termMonths: number,
  repaymentType: RepaymentType = 'annuity',
  gracePeriodMonths: number = 0
): LoanScheduleRow[] {
  const P = Math.max(0, Math.round(Number(principalUzs) || 0));
  const n = Math.max(6, Math.round(Number(termMonths) || 24));
  if (P <= 0) return [];

  const grace = Math.min(
    Math.max(0, Math.round(Number(gracePeriodMonths) || 0)),
    Math.max(0, n - 3)
  );
  const activeMonths = n - grace;
  const r = annualRatePercent / 100 / 12;

  const baseAnnuityPayment = calculateAnnuityPayment(
    P,
    annualRatePercent,
    activeMonths
  );
  const baseDiffPrincipal = Math.round(P / activeMonths);

  let balance = P;
  const rows: LoanScheduleRow[] = [];

  for (let m = 1; m <= n; m++) {
    const interest = Math.round(balance * r);
    let principal = 0;

    if (m <= grace) {
      principal = 0;
    } else if (m === n) {
      principal = balance;
    } else if (repaymentType === 'differentiated') {
      principal = Math.min(balance, baseDiffPrincipal);
    } else {
      principal = Math.min(
        balance,
        Math.max(0, Math.round(baseAnnuityPayment - interest))
      );
    }

    balance = Math.max(0, balance - principal);
    rows.push({
      month: m,
      paymentUzs: principal + interest,
      principalUzs: principal,
      interestUzs: interest,
      balanceUzs: balance,
    });
  }

  return rows;
}

function calculateCapexAllocation(
  totalInvestmentUzs: number,
  areaSqm: number,
  businessType: BusinessTypeId,
  customBusinessName?: string
) {
  const lower = (customBusinessName || '').toLowerCase();

  let renovPerSqmUzs = 900_000;
  let minRenovPct = 16;
  let maxRenovPct = 36;
  let invPct = 14;
  let resPct = 8;

  if (lower.includes('аптек') || lower.includes('dorixona')) {
    renovPerSqmUzs = 800_000;
    minRenovPct = 12;
    maxRenovPct = 26;
    invPct = 46;
    resPct = 8;
  } else if (
    lower.includes('одежд') ||
    lower.includes('шоурум') ||
    lower.includes('kiyim')
  ) {
    renovPerSqmUzs = 950_000;
    minRenovPct = 16;
    maxRenovPct = 30;
    invPct = 48;
    resPct = 8;
  } else if (lower.includes('автомой') || lower.includes('avtomoy')) {
    renovPerSqmUzs = 550_000;
    minRenovPct = 15;
    maxRenovPct = 30;
    invPct = 8;
    resPct = 8;
  } else if (
    lower.includes('автосерв') ||
    lower.includes('сто') ||
    lower.includes('avtoservis')
  ) {
    renovPerSqmUzs = 480_000;
    minRenovPct = 12;
    maxRenovPct = 25;
    invPct = 12;
    resPct = 8;
  } else if (lower.includes('стоматолог') || lower.includes('stomatolog')) {
    renovPerSqmUzs = 1_200_000;
    minRenovPct = 20;
    maxRenovPct = 38;
    invPct = 9;
    resPct = 8;
  } else if (
    lower.includes('фитнес') ||
    lower.includes('спорт') ||
    lower.includes('fitnes')
  ) {
    renovPerSqmUzs = 850_000;
    minRenovPct = 24;
    maxRenovPct = 40;
    invPct = 6;
    resPct = 7;
  } else if (lower.includes('мебел') || lower.includes('mebel')) {
    renovPerSqmUzs = 380_000;
    minRenovPct = 10;
    maxRenovPct = 22;
    invPct = 20;
    resPct = 8;
  } else if (businessType === 'sewing') {
    renovPerSqmUzs = 420_000;
    minRenovPct = 10;
    maxRenovPct = 26;
    invPct = 14;
    resPct = 8;
  } else if (businessType === 'retail') {
    renovPerSqmUzs = 700_000;
    minRenovPct = 12;
    maxRenovPct = 28;
    invPct = 42;
    resPct = 8;
  } else if (businessType === 'education') {
    renovPerSqmUzs = 1_050_000;
    minRenovPct = 22;
    maxRenovPct = 42;
    invPct = 10;
    resPct = 8;
  } else {
    renovPerSqmUzs = 950_000;
    minRenovPct = 18;
    maxRenovPct = 36;
    invPct = 14;
    resPct = 8;
  }

  if (totalInvestmentUzs <= 0) {
    const eqPct = 100 - minRenovPct - invPct - resPct;
    return {
      totalInvestmentUzs: 0,
      equipmentUzs: 0,
      renovationUzs: 0,
      inventoryMarketingUzs: 0,
      reserveRegistrationUzs: 0,
      equipmentPercent: eqPct,
      renovationPercent: minRenovPct,
      inventoryPercent: invPct,
      reservePercent: resPct,
    };
  }

  const targetRenovUzs = areaSqm * renovPerSqmUzs;
  const rawRenovPct = Math.round((targetRenovUzs / totalInvestmentUzs) * 100);
  const renovationPercent = Math.min(
    maxRenovPct,
    Math.max(minRenovPct, rawRenovPct)
  );
  const inventoryPercent = invPct;
  const reservePercent = resPct;
  const equipmentPercent = Math.max(
    10,
    100 - renovationPercent - inventoryPercent - reservePercent
  );

  const renovationUzs = Math.round(
    totalInvestmentUzs * (renovationPercent / 100)
  );
  const inventoryMarketingUzs = Math.round(
    totalInvestmentUzs * (inventoryPercent / 100)
  );
  const reserveRegistrationUzs = Math.round(
    totalInvestmentUzs * (reservePercent / 100)
  );
  const equipmentUzs = Math.max(
    0,
    totalInvestmentUzs -
      renovationUzs -
      inventoryMarketingUzs -
      reserveRegistrationUzs
  );

  return {
    totalInvestmentUzs,
    equipmentUzs,
    renovationUzs,
    inventoryMarketingUzs,
    reserveRegistrationUzs,
    equipmentPercent,
    renovationPercent,
    inventoryPercent,
    reservePercent,
  };
}

interface MonthlyTaxDetails {
  totalTaxUzs: number;
  vatPayableUzs: number;
  socialTaxUzs: number;
  profitTaxUzs: number;
}

function computeMonthlyTaxes(
  regimeId: LegalFormId,
  monthlyRevenueUzs: number,
  rentUzs: number,
  payrollGrossUzs: number,
  cogsPercent: number,
  monthlyLoanInterestUzs: number,
  monthlyAmortizationUzs: number
): MonthlyTaxDetails {
  const cfg = UZ_ECONOMIC_CONFIG.tax;
  const utilShare = UZ_ECONOMIC_CONFIG.opex.utilitiesAndMarketingShare;

  if (regimeId === 'self_employed') {
    const monthlySocial = Math.round(cfg.selfEmployedAnnualSocialUzs / 12);
    return {
      totalTaxUzs: monthlySocial,
      vatPayableUzs: 0,
      socialTaxUzs: monthlySocial,
      profitTaxUzs: 0,
    };
  }

  if (regimeId === 'yatt') {
    const turnoverTax = Math.round(monthlyRevenueUzs * cfg.turnoverTaxRate);
    const socialTax = Math.round(payrollGrossUzs * cfg.socialTaxRate);
    return {
      totalTaxUzs: turnoverTax + socialTax,
      vatPayableUzs: 0,
      socialTaxUzs: socialTax,
      profitTaxUzs: 0,
    };
  }

  // mchj (General Tax Regime: VAT 12% + Profit Tax 15% + Social Tax 12%)
  const cogs = Math.round(monthlyRevenueUzs * (cogsPercent / 100));
  const util = Math.round(monthlyRevenueUzs * utilShare);
  const vatRateFactor = cfg.vatRate / (1 + cfg.vatRate);
  const vatPayableUzs = Math.max(
    0,
    Math.round((monthlyRevenueUzs - cogs - rentUzs - util) * vatRateFactor)
  );
  const socialTaxUzs = Math.round(payrollGrossUzs * cfg.socialTaxRate);
  const taxableProfitUzs = Math.max(
    0,
    monthlyRevenueUzs -
      cogs -
      rentUzs -
      payrollGrossUzs -
      socialTaxUzs -
      util -
      vatPayableUzs -
      monthlyLoanInterestUzs -
      monthlyAmortizationUzs
  );
  const profitTaxUzs = Math.round(taxableProfitUzs * cfg.profitTaxRate);

  return {
    totalTaxUzs: vatPayableUzs + socialTaxUzs + profitTaxUzs,
    vatPayableUzs,
    socialTaxUzs,
    profitTaxUzs,
  };
}

/**
 * Finds the exact analytical monthly revenue where Net Monthly Profit equals 0,
 * completely independent of expectedMonthlyRevenueUzs.
 */
function findExactBreakEvenRevenue(
  regimeId: LegalFormId,
  rentUzs: number,
  payrollGrossUzs: number,
  cogsPercent: number,
  monthlyLoanPaymentUzs: number,
  monthlyLoanInterestUzs: number,
  monthlyAmortizationUzs: number
): number {
  const utilShare = UZ_ECONOMIC_CONFIG.opex.utilitiesAndMarketingShare;

  const calcNet = (rev: number) => {
    const cogs = Math.round(rev * (cogsPercent / 100));
    const util = Math.round(rev * utilShare);
    const tax = computeMonthlyTaxes(
      regimeId,
      rev,
      rentUzs,
      payrollGrossUzs,
      cogsPercent,
      monthlyLoanInterestUzs,
      monthlyAmortizationUzs
    ).totalTaxUzs;
    return (
      rev -
      (rentUzs + payrollGrossUzs + cogs + util + tax + monthlyLoanPaymentUzs)
    );
  };

  if (calcNet(0) >= 0) return 0;

  let low = 0;
  let high = 10_000_000_000;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (calcNet(mid) >= 0) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}

export function calculateFinancials(
  inputs: BusinessInputs,
  currency: Currency = 'UZS'
): FinancialResults {
  const cfg = UZ_ECONOMIC_CONFIG;
  const district =
    TASHKENT_DISTRICTS[inputs.district] || TASHKENT_DISTRICTS.chilonzor;

  const areaSqm = Math.max(5, Number(inputs.areaSqm) || 0);
  const staffCount = Math.max(0, Math.round(Number(inputs.staffCount) || 0));
  const avgSalaryUzs = Math.max(0, Math.round(Number(inputs.avgSalaryUzs) || 0));
  const ownCapitalUzs = Math.max(
    0,
    Math.round(Number(inputs.ownCapitalUzs) || 0)
  );
  const loanAmountUzs = Math.max(
    0,
    Math.round(Number(inputs.loanAmountUzs) || 0)
  );
  const loanTermMonths = Math.max(
    6,
    Math.round(Number(inputs.loanTermMonths) || 24)
  );
  const repaymentType: RepaymentType = inputs.repaymentType || 'annuity';
  const gracePeriodMonths = Math.max(
    0,
    Math.round(Number(inputs.gracePeriodMonths) || 0)
  );
  const expectedMonthlyRevenueUzs = Math.max(
    1_000_000,
    Math.round(Number(inputs.expectedMonthlyRevenueUzs) || 0)
  );
  const cogsPercent = Math.min(
    90,
    Math.max(5, Number(inputs.cogsPercent) || 30)
  );

  // 1. Industry & Area-Aware CAPEX
  const totalInvestmentUzs = ownCapitalUzs + loanAmountUzs;
  const capex = calculateCapexAllocation(
    totalInvestmentUzs,
    areaSqm,
    inputs.businessType,
    inputs.customBusinessName
  );
  const monthlyAmortizationUzs = Math.round(
    (capex.equipmentUzs * cfg.tax.equipmentAmortizationAnnualRate) / 12
  );

  // 2. Loan Schedules (computed first so interest expense is deducted in Profit Tax)
  const rawSchedules = {} as Record<BankProgramId, LoanScheduleRow[]>;
  const avgMonthlyInterests = {} as Record<BankProgramId, number>;
  const representativePayments = {} as Record<BankProgramId, number>;
  const selectedProgId: BankProgramId = cfg.bankPrograms.some(
    (b) => b.id === inputs.selectedBankProgram
  )
    ? inputs.selectedBankProgram
    : 'preferential';

  for (const bankCfg of cfg.bankPrograms) {
    const isActiveBank = bankCfg.id === selectedProgId;
    const bankRepaymentType: RepaymentType = isActiveBank
      ? repaymentType
      : 'annuity';
    const effectiveGrace = isActiveBank
      ? Math.min(
          gracePeriodMonths,
          bankCfg.maxGraceMonths,
          Math.max(0, loanTermMonths - 3)
        )
      : 0;
    const sched = buildLoanSchedule(
      loanAmountUzs,
      bankCfg.annualRatePercent,
      loanTermMonths,
      bankRepaymentType,
      effectiveGrace
    );
    rawSchedules[bankCfg.id] = sched;
    if (sched.length === 0) {
      avgMonthlyInterests[bankCfg.id] = 0;
      representativePayments[bankCfg.id] = 0;
    } else {
      const totalInt = sched.reduce((s, r) => s + r.interestUzs, 0);
      avgMonthlyInterests[bankCfg.id] = Math.round(totalInt / sched.length);
      // Representative monthly burden = first non-grace payment
      const activeIdx = Math.min(sched.length - 1, effectiveGrace);
      representativePayments[bankCfg.id] =
        sched[activeIdx]?.paymentUzs ?? sched[0].paymentUzs;
    }
  }

  const selectedLoanInterestUzs = avgMonthlyInterests[selectedProgId] || 0;
  const selectedRepLoanPaymentUzs = representativePayments[selectedProgId] || 0;

  // 3. OPEX (before taxes and loan)
  const rentUzs = Math.round(areaSqm * district.rentPerSqmUzs);
  const payrollGrossUzs = Math.round(staffCount * avgSalaryUzs);
  const cogsUzs = Math.round(expectedMonthlyRevenueUzs * (cogsPercent / 100));
  const utilitiesAndMarketingUzs = Math.round(
    expectedMonthlyRevenueUzs * cfg.opex.utilitiesAndMarketingShare
  );
  const totalBeforeTaxAndLoanUzs =
    rentUzs + payrollGrossUzs + cogsUzs + utilitiesAndMarketingUzs;

  const opex = {
    rentUzs,
    payrollGrossUzs,
    cogsUzs,
    utilitiesAndMarketingUzs,
    totalBeforeTaxAndLoanUzs,
  };

  // 4. UZBEKISTAN TAX REGIMES COMPARISON
  const annualRevenueUzs = expectedMonthlyRevenueUzs * 12;

  // 4A. Self-employed (1 BRV/year = 375 000 sum/year => ~31 250 sum/month)
  const selfEmployedEligible =
    staffCount === 0 &&
    annualRevenueUzs <= cfg.tax.selfEmployedMaxAnnualRevenueUzs;
  const selfTaxDetails = computeMonthlyTaxes(
    'self_employed',
    expectedMonthlyRevenueUzs,
    rentUzs,
    payrollGrossUzs,
    cogsPercent,
    selectedLoanInterestUzs,
    monthlyAmortizationUzs
  );
  let selfEmployedReasonRu = '';
  let selfEmployedReasonUz = '';
  if (!selfEmployedEligible) {
    if (
      staffCount > 0 &&
      annualRevenueUzs > cfg.tax.selfEmployedMaxAnnualRevenueUzs
    ) {
      selfEmployedReasonRu = `Запрещен найм сотрудников (штат > 0) и годовой оборот превышает ${formatMln(
        cfg.tax.selfEmployedMaxAnnualRevenueUzs,
        'ru',
        currency
      )}`;
      selfEmployedReasonUz = `Xodim yollash mumkin emas (shtat > 0) va yillik aylanma ${formatMln(
        cfg.tax.selfEmployedMaxAnnualRevenueUzs,
        'uz',
        currency
      )} dan yuqori`;
    } else if (staffCount > 0) {
      selfEmployedReasonRu =
        'Самозанятые не имеют права нанимать наемных сотрудников (требуется ЯТТ или МЧЖ)';
      selfEmployedReasonUz =
        "O'zini o'zi band qilgan shaxslar xodim yollash huquqiga ega emas (YaTT yoki MChJ kerak)";
    } else {
      selfEmployedReasonRu = `Годовой доход превышает лимит ${formatMln(
        cfg.tax.selfEmployedMaxAnnualRevenueUzs,
        'ru',
        currency
      )}/год для самозанятых`;
      selfEmployedReasonUz = `Yillik tushum o'zini o'zi band qilganlar uchun ${formatMln(
        cfg.tax.selfEmployedMaxAnnualRevenueUzs,
        'uz',
        currency
      )} limitdan oshadi`;
    }
  }

  const selfEmployedResult: TaxRegimeResult = {
    id: 'self_employed',
    nameRu: 'Самозанятый (Соц. налог 1 БРВ/год)',
    nameUz: "O'zini o'zi band qilgan (yiliga 1 BHM)",
    monthlyTaxUzs: selfTaxDetails.totalTaxUzs,
    annualTaxUzs: cfg.tax.selfEmployedAnnualSocialUzs,
    effectiveRatePercent: Number(
      ((selfTaxDetails.totalTaxUzs / expectedMonthlyRevenueUzs) * 100).toFixed(2)
    ),
    isEligible: selfEmployedEligible,
    ineligibilityReasonRu: selfEmployedReasonRu || undefined,
    ineligibilityReasonUz: selfEmployedReasonUz || undefined,
    breakdownRu: [
      `Налог с оборота: ${formatUzs(0, 'ru', currency)} (до ${formatMln(
        cfg.tax.selfEmployedMaxAnnualRevenueUzs,
        'ru',
        currency
      )}/год)`,
      `Соц. налог (ст. 408 НК РУз): ${formatUzs(
        cfg.tax.selfEmployedAnnualSocialUzs,
        'ru',
        currency
      )}/год (~${formatUzs(selfTaxDetails.totalTaxUzs, 'ru', currency)}/мес)`,
      'Ограничение: без права найма сотрудников',
    ],
    breakdownUz: [
      `Aylanmadan soliq: ${formatUzs(0, 'uz', currency)} (yiliga ${formatMln(
        cfg.tax.selfEmployedMaxAnnualRevenueUzs,
        'uz',
        currency
      )} gacha)`,
      `Ijtimoiy soliq (SK 408-m.): yiliga ${formatUzs(
        cfg.tax.selfEmployedAnnualSocialUzs,
        'uz',
        currency
      )} (~${formatUzs(selfTaxDetails.totalTaxUzs, 'uz', currency)}/oy)`,
      'Cheklov: yollanma ishchi olish mumkin emas',
    ],
  };

  // 4B. Simplified 4% Turnover (YaTT <= 5 staff or Small LLC <= 1B UZS/year)
  const turnoverRevOk = annualRevenueUzs <= cfg.tax.yattMaxAnnualRevenueUzs;
  const yattStaffOk = staffCount <= cfg.tax.yattMaxStaffCount;
  const turnoverEligible = turnoverRevOk && yattStaffOk;
  const yattTaxDetails = computeMonthlyTaxes(
    'yatt',
    expectedMonthlyRevenueUzs,
    rentUzs,
    payrollGrossUzs,
    cogsPercent,
    selectedLoanInterestUzs,
    monthlyAmortizationUzs
  );
  const turnoverTaxBaseUzs = Math.round(
    expectedMonthlyRevenueUzs * cfg.tax.turnoverTaxRate
  );

  let yattReasonRu = '';
  let yattReasonUz = '';
  if (!turnoverEligible) {
    if (!yattStaffOk && !turnoverRevOk) {
      yattReasonRu = `Штат (${staffCount} чел.) превышает лимит ЯТТ (до ${cfg.tax.yattMaxStaffCount} чел.) и оборот выше 1 млрд/год — требуется МЧЖ`;
      yattReasonUz = `Xodimlar soni (${staffCount}) YaTT limitidan (${cfg.tax.yattMaxStaffCount} nafar) oshadi va yillik tushum 1 mlrddan yuqori`;
    } else if (!yattStaffOk) {
      yattReasonRu = `Для ИП/ЯТТ разрешено нанимать до ${cfg.tax.yattMaxStaffCount} сотрудников (у вас ${staffCount}) — перейдите на МЧЖ`;
      yattReasonUz = `YaTT ko‘pi bilan ${cfg.tax.yattMaxStaffCount} nafar xodim yollashi mumkin (sizda ${staffCount}) — MChJga o‘ting`;
    } else {
      yattReasonRu = `Годовой оборот (${formatMln(
        annualRevenueUzs,
        'ru',
        currency
      )}) превышает лимит ${formatMln(
        cfg.tax.yattMaxAnnualRevenueUzs,
        'ru',
        currency
      )}/год`;
      yattReasonUz = `Yillik aylanma (${formatMln(
        annualRevenueUzs,
        'uz',
        currency
      )}) ${formatMln(
        cfg.tax.yattMaxAnnualRevenueUzs,
        'uz',
        currency
      )} limitdan oshadi`;
    }
  }

  const yattResult: TaxRegimeResult = {
    id: 'yatt',
    nameRu: 'Налог с оборота 4% (ЯТТ до 5 сотр.)',
    nameUz: 'Aylanmadan soliq 4% (YaTT 5 xodimgacha)',
    monthlyTaxUzs: yattTaxDetails.totalTaxUzs,
    annualTaxUzs: yattTaxDetails.totalTaxUzs * 12,
    effectiveRatePercent: Number(
      ((yattTaxDetails.totalTaxUzs / expectedMonthlyRevenueUzs) * 100).toFixed(2)
    ),
    isEligible: turnoverEligible,
    ineligibilityReasonRu: yattReasonRu || undefined,
    ineligibilityReasonUz: yattReasonUz || undefined,
    breakdownRu: [
      `Налог с оборота (4% от выручки): ${formatUzs(
        turnoverTaxBaseUzs,
        'ru',
        currency
      )}`,
      `Социальный налог (12% от ФОТ): ${formatUzs(
        yattTaxDetails.socialTaxUzs,
        'ru',
        currency
      )}`,
      `Лимит: до ${cfg.tax.yattMaxStaffCount} сотр. и до ${formatMln(
        cfg.tax.yattMaxAnnualRevenueUzs,
        'ru',
        currency
      )}/год`,
    ],
    breakdownUz: [
      `Aylanmadan soliq (tushumdan 4%): ${formatUzs(
        turnoverTaxBaseUzs,
        'uz',
        currency
      )}`,
      `Ijtimoiy soliq (FOTdan 12%): ${formatUzs(
        yattTaxDetails.socialTaxUzs,
        'uz',
        currency
      )}`,
      `Limit: ${cfg.tax.yattMaxStaffCount} xodimgacha va ${formatMln(
        cfg.tax.yattMaxAnnualRevenueUzs,
        'uz',
        currency
      )}/yilgacha`,
    ],
  };

  // 4C. General Regime (MChJ / LLC: VAT 12% + Profit Tax 15% with interest & depreciation deductions)
  const mchjTaxDetails = computeMonthlyTaxes(
    'mchj',
    expectedMonthlyRevenueUzs,
    rentUzs,
    payrollGrossUzs,
    cogsPercent,
    selectedLoanInterestUzs,
    monthlyAmortizationUzs
  );

  const mchjResult: TaxRegimeResult = {
    id: 'mchj',
    nameRu: 'Общеустановленный МЧЖ (НДС 12% + Прибыль 15%)',
    nameUz: 'Umumbelgilangan MChJ (QQS 12% + Foyda 15%)',
    monthlyTaxUzs: mchjTaxDetails.totalTaxUzs,
    annualTaxUzs: mchjTaxDetails.totalTaxUzs * 12,
    effectiveRatePercent: Number(
      ((mchjTaxDetails.totalTaxUzs / expectedMonthlyRevenueUzs) * 100).toFixed(2)
    ),
    isEligible: true,
    breakdownRu: [
      `НДС 12% к уплате (с зачетом сырья, аренды и комм.): ${formatUzs(
        mchjTaxDetails.vatPayableUzs,
        'ru',
        currency
      )}`,
      `Налог на прибыль 15% (вычет % кредита и амортизации): ${formatUzs(
        mchjTaxDetails.profitTaxUzs,
        'ru',
        currency
      )}`,
      `Социальный налог 12% от ФОТ: ${formatUzs(
        mchjTaxDetails.socialTaxUzs,
        'ru',
        currency
      )}`,
    ],
    breakdownUz: [
      `To'lanadigan QQS 12% (xarajatlar chegirilgan): ${formatUzs(
        mchjTaxDetails.vatPayableUzs,
        'uz',
        currency
      )}`,
      `Foyda solig'i 15% (foiz va amortizatsiya chegirilgan): ${formatUzs(
        mchjTaxDetails.profitTaxUzs,
        'uz',
        currency
      )}`,
      `Ijtimoiy soliq (FOTdan 12%): ${formatUzs(
        mchjTaxDetails.socialTaxUzs,
        'uz',
        currency
      )}`,
    ],
  };

  const taxRegimes: Record<LegalFormId, TaxRegimeResult> = {
    self_employed: selfEmployedResult,
    yatt: yattResult,
    mchj: mchjResult,
  };

  const eligibleRegimes = Object.values(taxRegimes).filter((r) => r.isEligible);
  eligibleRegimes.sort((a, b) => a.monthlyTaxUzs - b.monthlyTaxUzs);
  const optimalTaxRegimeId: LegalFormId =
    eligibleRegimes.length > 0 ? eligibleRegimes[0].id : 'mchj';

  const highestEligibleAnnualTax =
    eligibleRegimes.length > 0
      ? eligibleRegimes[eligibleRegimes.length - 1].annualTaxUzs
      : mchjResult.annualTaxUzs;
  const lowestEligibleAnnualTax =
    eligibleRegimes.length > 0
      ? eligibleRegimes[0].annualTaxUzs
      : mchjResult.annualTaxUzs;
  const annualTaxSavingsUzs = Math.max(
    0,
    highestEligibleAnnualTax - lowestEligibleAnnualTax
  );

  const selectedRegimeObj = taxRegimes[inputs.legalForm];
  const activeTaxRegime =
    selectedRegimeObj && selectedRegimeObj.isEligible
      ? selectedRegimeObj
      : taxRegimes[optimalTaxRegimeId];

  const activeMonthlyTaxUzs = activeTaxRegime.monthlyTaxUzs;

  // 5. Operating Cash Flow available for Debt Service (post-tax EBITDA-equivalent)
  const operatingCashAfterTaxUzs =
    expectedMonthlyRevenueUzs -
    (rentUzs +
      payrollGrossUzs +
      cogsUzs +
      utilitiesAndMarketingUzs +
      activeMonthlyTaxUzs);

  // 6. Bank Programs & Smart 10-Bank Conditions Matcher
  const ownCapitalRatio =
    totalInvestmentUzs > 0 ? ownCapitalUzs / totalInvestmentUzs : 0;
  const customLower = (inputs.customBusinessName || '').toLowerCase();

  const bankPrograms = {} as Record<BankProgramId, BankProgramResult>;

  for (const bankCfg of cfg.bankPrograms) {
    const sched = rawSchedules[bankCfg.id];
    const monthlyPaymentUzs = representativePayments[bankCfg.id] || 0;
    const totalPaymentUzs = sched.reduce((s, r) => s + r.paymentUzs, 0);
    const totalInterestUzs = sched.reduce((s, r) => s + r.interestUzs, 0);
    const graceMonthlyPaymentUzs =
      loanAmountUzs > 0
        ? Math.round(loanAmountUzs * (bankCfg.annualRatePercent / 100 / 12))
        : 0;
    const isWithinAmountLimit = loanAmountUzs <= bankCfg.quotaPenaltyThresholdUzs;
    const isWithinTermLimit = loanTermMonths <= bankCfg.maxTermMonths;
    const isEligibleByLimit = isWithinAmountLimit && isWithinTermLimit;
    const minEquityPercent = Math.round(bankCfg.equityRequirement * 100);
    const maxGraceCap = Math.min(
      bankCfg.maxGraceMonths,
      Math.max(0, loanTermMonths - 3)
    );

    if (loanAmountUzs <= 0 || sched.length === 0) {
      let noLoanScore = (26 - bankCfg.annualRatePercent) * 4 + bankCfg.maxGraceMonths;
      if (bankCfg.id === 'preferential') noLoanScore += 6;
      if (bankCfg.id === 'brb') noLoanScore += 4;
      bankPrograms[bankCfg.id] = {
        id: bankCfg.id,
        nameRu: bankCfg.nameRu,
        nameUz: bankCfg.nameUz,
        bankNamesRu: bankCfg.bankNamesRu,
        bankNamesUz: bankCfg.bankNamesUz,
        annualRatePercent: bankCfg.annualRatePercent,
        rateRangeRu: bankCfg.rateRangeRu,
        rateRangeUz: bankCfg.rateRangeUz,
        graceRangeRu: bankCfg.graceRangeRu,
        graceRangeUz: bankCfg.graceRangeUz,
        minGraceMonths: bankCfg.minGraceMonths,
        maxGraceMonths: bankCfg.maxGraceMonths,
        recommendedGraceMonths: 0,
        recommendedRepaymentType: 'annuity',
        graceMonthlyPaymentUzs: 0,
        maxLoanUzs: bankCfg.quotaPenaltyThresholdUzs,
        maxTermMonths: bankCfg.maxTermMonths,
        minEquityPercent,
        collateralInfoRu: bankCfg.collateralInfoRu,
        collateralInfoUz: bankCfg.collateralInfoUz,
        bestForRu: bankCfg.bestForRu,
        bestForUz: bankCfg.bestForUz,
        recommendationReasonRu: `Условия: ${bankCfg.rateRangeRu}, льготный период ${bankCfg.graceRangeRu}, лимит до ${formatMln(bankCfg.quotaPenaltyThresholdUzs, 'ru', currency)}.`,
        recommendationReasonUz: `Shartlar: ${bankCfg.rateRangeUz}, imtiyozli davr ${bankCfg.graceRangeUz}, limit ${formatMln(bankCfg.quotaPenaltyThresholdUzs, 'uz', currency)} gacha.`,
        isEligibleByLimit: true,
        matchScore: Math.round(Math.min(100, Math.max(0, noLoanScore))),
        monthlyPaymentUzs: 0,
        totalPaymentUzs: 0,
        totalInterestUzs: 0,
        dscr: 0,
        approvalStatus: 'High',
        approvalProbabilityPercent: 0,
        schedule: [],
      };
      continue;
    }

    const dscrVal = Number(
      (operatingCashAfterTaxUzs / Math.max(1, monthlyPaymentUzs)).toFixed(2)
    );

    const calcBankApprovalPct = (targetDscr: number): number => {
      let s = 0;
      if (targetDscr >= 1.3) {
        s = 68 + Math.min(18, (targetDscr - 1.3) * 10);
      } else if (targetDscr >= 1.0) {
        s = 44 + ((targetDscr - 1.0) / 0.3) * 24;
      } else {
        s = Math.max(8, targetDscr * 40);
      }

      if (ownCapitalRatio >= bankCfg.equityRequirement) {
        s += 6;
      } else if (ownCapitalRatio >= 0.1) {
        s -= 8;
      } else {
        s -= 18;
      }

      if (!isWithinAmountLimit) {
        s -= 16;
      }
      if (!isWithinTermLimit) {
        s -= 6;
      }

      if (staffCount === 0 && (bankCfg.id === 'preferential' || bankCfg.id === 'brb')) {
        s += 3;
      } else if (expectedMonthlyRevenueUzs >= 50_000_000) {
        s += 2;
      }

      return Math.min(bankCfg.maxCap, Math.max(10, Math.round(s)));
    };

    const approvalProbabilityPercent = calcBankApprovalPct(dscrVal);

    let approvalStatus: 'High' | 'Medium' | 'Low' = 'Low';
    if (dscrVal >= 1.3 && approvalProbabilityPercent >= 65) {
      approvalStatus = 'High';
    } else if (dscrVal >= 1.0 && approvalProbabilityPercent >= 42) {
      approvalStatus = 'Medium';
    } else {
      approvalStatus = 'Low';
    }

    const isCapexHeavy =
      inputs.businessType === 'sewing' ||
      customLower.includes('цех') ||
      customLower.includes('производ') ||
      customLower.includes('стомат') ||
      customLower.includes('клин') ||
      totalInvestmentUzs > expectedMonthlyRevenueUzs * 2.5;

    const baseAnnuityPaymentUzs =
      loanAmountUzs > 0
        ? calculateAnnuityPayment(
            loanAmountUzs,
            bankCfg.annualRatePercent,
            loanTermMonths
          )
        : 0;
    const baseAnnuityDscr =
      baseAnnuityPaymentUzs > 0
        ? Number(
            (
              operatingCashAfterTaxUzs / Math.max(1, baseAnnuityPaymentUzs)
            ).toFixed(2)
          )
        : 0;

    const minBankGrace = Math.min(
      bankCfg.minGraceMonths,
      Math.max(0, loanTermMonths - 3)
    );
    let recommendedGraceMonths = minBankGrace;
    if (baseAnnuityDscr < 1.15 && maxGraceCap >= 12 && loanTermMonths >= 24) {
      recommendedGraceMonths = Math.min(12, maxGraceCap);
    } else if ((baseAnnuityDscr < 1.35 || isCapexHeavy) && maxGraceCap >= 6) {
      recommendedGraceMonths = Math.max(
        minBankGrace,
        Math.min(6, maxGraceCap)
      );
    } else if (maxGraceCap >= 3) {
      recommendedGraceMonths = Math.max(
        minBankGrace,
        Math.min(3, maxGraceCap)
      );
    }

    const activePrincipalMonths = Math.max(
      1,
      loanTermMonths - recommendedGraceMonths
    );
    const peakDiffPaymentUzs =
      loanAmountUzs > 0
        ? Math.round(loanAmountUzs / activePrincipalMonths) +
          graceMonthlyPaymentUzs
        : 0;
    const peakDiffDscr =
      peakDiffPaymentUzs > 0
        ? operatingCashAfterTaxUzs / Math.max(1, peakDiffPaymentUzs)
        : 0;
    const recommendedRepaymentType: RepaymentType =
      peakDiffDscr >= 1.55 ? 'differentiated' : 'annuity';

    const baseApprovalProb = calcBankApprovalPct(baseAnnuityDscr);

    let matchScore =
      baseApprovalProb * 0.55 +
      (26 - bankCfg.annualRatePercent) * 3.2 +
      Math.min(12, bankCfg.maxGraceMonths) * 1.1;

    if (
      bankCfg.id === 'preferential' &&
      (inputs.businessType === 'coffee' ||
        customLower.includes('пекар') ||
        customLower.includes('фастфуд') ||
        customLower.includes('националь') ||
        inputs.legalForm !== 'mchj') &&
      loanAmountUzs <= 1_000_000_000
    ) {
      matchScore += 6;
    } else if (
      bankCfg.id === 'brb' &&
      (inputs.legalForm !== 'mchj' || loanAmountUzs <= 1_500_000_000)
    ) {
      matchScore += 6;
    } else if (
      bankCfg.id === 'ipakyuli' &&
      (inputs.businessType === 'retail' ||
        customLower.includes('пункт') ||
        customLower.includes('пвз'))
    ) {
      matchScore += 6;
    } else if (
      bankCfg.id === 'sqb' &&
      (inputs.businessType === 'sewing' ||
        customLower.includes('цех') ||
        customLower.includes('производ') ||
        customLower.includes('мебел') ||
        customLower.includes('стомат')) &&
      loanAmountUzs <= 3_500_000_000
    ) {
      matchScore += 7;
    } else if (
      (bankCfg.id === 'aloqa' || bankCfg.id === 'nbu') &&
      (isCapexHeavy || inputs.businessType === 'education' || loanAmountUzs >= 800_000_000)
    ) {
      matchScore += 6;
    } else if (bankCfg.id === 'commercial' && ownCapitalRatio < 0.22) {
      matchScore += 8;
    } else if (
      bankCfg.id === 'hamkor' &&
      inputs.legalForm !== 'mchj' &&
      loanAmountUzs <= 1_500_000_000
    ) {
      matchScore += 4;
    } else if (
      (bankCfg.id === 'aab' || bankCfg.id === 'trast') &&
      expectedMonthlyRevenueUzs >= 80_000_000
    ) {
      matchScore += 4;
    }

    if (!isWithinAmountLimit) matchScore -= 32;
    if (!isWithinTermLimit) matchScore -= 12;
    if (ownCapitalRatio < bankCfg.equityRequirement) matchScore -= 10;

    const clampedMatchScore = Math.round(Math.min(100, Math.max(5, matchScore)));

    const scheduleRu =
      recommendedRepaymentType === 'differentiated'
        ? 'дифференцированный график (снижает переплату)'
        : 'аннуитетный график (легче пройти скоринг DSCR)';
    const scheduleUz =
      recommendedRepaymentType === 'differentiated'
        ? "differensial jadval (foiz to'lovini kamaytiradi)"
        : 'annuitet jadval (bank DSCR skoringidan o‘tish osonroq)';

    const limitNoteRu = !isWithinAmountLimit
      ? ` Превышен стандартный лимит программы (${formatMln(bankCfg.quotaPenaltyThresholdUzs, 'ru', currency)}).`
      : '';
    const limitNoteUz = !isWithinAmountLimit
      ? ` Dastur limiti (${formatMln(bankCfg.quotaPenaltyThresholdUzs, 'uz', currency)}) dan oshib ketgan.`
      : '';

    const recommendationReasonRu = `Диапазон: ${bankCfg.rateRangeRu} (в модели ${bankCfg.annualRatePercent}%), льгота ${bankCfg.graceRangeRu.replace(/\.$/, '')}. Рекомендуем ${recommendedGraceMonths} мес. льготного периода (платеж только %: ${formatUzs(graceMonthlyPaymentUzs, 'ru', currency)}/мес) и ${scheduleRu}.${limitNoteRu}`;
    const recommendationReasonUz = `Stavka: ${bankCfg.rateRangeUz} (hisobda ${bankCfg.annualRatePercent}%), imtiyoz ${bankCfg.graceRangeUz.replace(/\.$/, '')}. ${recommendedGraceMonths} oy imtiyozli davr (faqat foiz: oyiga ${formatUzs(graceMonthlyPaymentUzs, 'uz', currency)}) va ${scheduleUz}ni tanlang.${limitNoteUz}`;

    bankPrograms[bankCfg.id] = {
      id: bankCfg.id,
      nameRu: bankCfg.nameRu,
      nameUz: bankCfg.nameUz,
      bankNamesRu: bankCfg.bankNamesRu,
      bankNamesUz: bankCfg.bankNamesUz,
      annualRatePercent: bankCfg.annualRatePercent,
      rateRangeRu: bankCfg.rateRangeRu,
      rateRangeUz: bankCfg.rateRangeUz,
      graceRangeRu: bankCfg.graceRangeRu,
      graceRangeUz: bankCfg.graceRangeUz,
      minGraceMonths: bankCfg.minGraceMonths,
      maxGraceMonths: bankCfg.maxGraceMonths,
      recommendedGraceMonths,
      recommendedRepaymentType,
      graceMonthlyPaymentUzs,
      maxLoanUzs: bankCfg.quotaPenaltyThresholdUzs,
      maxTermMonths: bankCfg.maxTermMonths,
      minEquityPercent,
      collateralInfoRu: bankCfg.collateralInfoRu,
      collateralInfoUz: bankCfg.collateralInfoUz,
      bestForRu: bankCfg.bestForRu,
      bestForUz: bankCfg.bestForUz,
      recommendationReasonRu,
      recommendationReasonUz,
      isEligibleByLimit,
      matchScore: clampedMatchScore,
      monthlyPaymentUzs,
      totalPaymentUzs,
      totalInterestUzs,
      dscr: dscrVal,
      approvalStatus,
      approvalProbabilityPercent,
      schedule: sched,
    };
  }

  const rankedBanks = [...Object.values(bankPrograms)].sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.annualRatePercent - b.annualRatePercent;
  });
  const topRecommendedBanks = rankedBanks.slice(0, 3);
  const recommendedBankId: BankProgramId =
    topRecommendedBanks[0]?.id || 'preferential';

  const selectedBankProgramResult =
    bankPrograms[selectedProgId] || bankPrograms.preferential;

  const netMonthlyProfitUzs =
    operatingCashAfterTaxUzs - selectedRepLoanPaymentUzs;

  // 7. Exact Analytical Break-Even Point (completely independent of expectedMonthlyRevenueUzs)
  const breakEvenMonthlyRevenueUzs = findExactBreakEvenRevenue(
    activeTaxRegime.id,
    rentUzs,
    payrollGrossUzs,
    cogsPercent,
    selectedRepLoanPaymentUzs,
    selectedLoanInterestUzs,
    monthlyAmortizationUzs
  );
  const safetyMarginPercent =
    expectedMonthlyRevenueUzs > 0
      ? Math.round(
          ((expectedMonthlyRevenueUzs - breakEvenMonthlyRevenueUzs) /
            expectedMonthlyRevenueUzs) *
            100
        )
      : 0;

  const activeCompetitors = getActiveCompetitors(inputs, 'ru');
  const avgCompCheckRaw =
    activeCompetitors.reduce((sum, c) => sum + c.avgCheckUzs, 0) /
    Math.max(1, activeCompetitors.length);
  const defaultAvgCheckUzs = Math.max(10000, Math.round(avgCompCheckRaw));
  const customCheckVal = Number(inputs.customAvgCheckUzs) || 0;
  const estimatedAvgCheckUzs =
    customCheckVal >= 1000 ? Math.round(customCheckVal) : defaultAvgCheckUzs;

  const dailyRevenueUzs = Math.round(expectedMonthlyRevenueUzs / 30);
  const dailyCustomersNeeded = Math.max(
    1,
    Math.round(dailyRevenueUzs / estimatedAvgCheckUzs)
  );
  const breakEvenDailyCustomers = Math.max(
    0,
    breakEvenMonthlyRevenueUzs <= 0
      ? 0
      : Math.max(1, Math.round(breakEvenMonthlyRevenueUzs / 30 / estimatedAvgCheckUzs))
  );

  // 8. Equity Cashflow Simulation (12-month, 60-month extended horizon & payback solver up to 99m)
  // Start cumulative flow at -ownCapitalUzs because loan principal is repaid via monthly schedule rows.
  const rampUpSchedule = cfg.cashflowRampUpSchedule;
  const selectedSchedule = selectedBankProgramResult.schedule;

  let cumulative = -ownCapitalUzs;
  let breakEvenMonth: number | null = null;
  const cashflow12Months: CashflowMonth[] = [];
  const cashflowExtended: CashflowMonth[] = [];

  for (let i = 0; i < 99; i++) {
    const ramp = i < 12 ? rampUpSchedule[i] : rampUpSchedule[11];
    const mRev = Math.round(expectedMonthlyRevenueUzs * ramp);
    const mCogs = Math.round(mRev * (cogsPercent / 100));
    const mUtil = Math.round(mRev * cfg.opex.utilitiesAndMarketingShare);
    const mLoanPayment = selectedSchedule[i]?.paymentUzs ?? 0;
    const mLoanInterest = selectedSchedule[i]?.interestUzs ?? 0;

    const mTax = computeMonthlyTaxes(
      activeTaxRegime.id,
      mRev,
      rentUzs,
      payrollGrossUzs,
      cogsPercent,
      mLoanInterest,
      monthlyAmortizationUzs
    ).totalTaxUzs;

    const mExpenses =
      rentUzs + payrollGrossUzs + mCogs + mUtil + mTax + mLoanPayment;
    const mNet = mRev - mExpenses;
    cumulative += mNet;

    if (breakEvenMonth === null && cumulative >= 0 && mNet > 0) {
      breakEvenMonth = i + 1;
    }

    const rowObj: CashflowMonth = {
      month: `M${i + 1}`,
      monthIndex: i + 1,
      rampUpPercent: Math.round(ramp * 100),
      monthlyRevenue: mRev,
      monthlyExpenses: mExpenses,
      monthlyNet: mNet,
      cumulativeCashflow: cumulative,
    };

    if (i < 12) {
      cashflow12Months.push(rowObj);
    }
    if (i < 60) {
      cashflowExtended.push(rowObj);
    }
    if (i >= 59 && breakEvenMonth !== null) {
      break;
    }
  }

  let paybackMonths = breakEvenMonth ?? 0;
  if (ownCapitalUzs === 0 && loanAmountUzs === 0 && netMonthlyProfitUzs > 0) {
    paybackMonths = 1;
    breakEvenMonth = 1;
  }

  const annualRoiBase = ownCapitalUzs > 0 ? ownCapitalUzs : totalInvestmentUzs;
  const annualRoiPercent =
    annualRoiBase > 0
      ? Math.round(((netMonthlyProfitUzs * 12) / annualRoiBase) * 100)
      : netMonthlyProfitUzs > 0
      ? 100
      : 0;

  return {
    capex,
    opex,
    taxRegimes,
    optimalTaxRegimeId,
    activeTaxRegime,
    annualTaxSavingsUzs,
    bankPrograms,
    selectedBankProgramResult,
    recommendedBankId,
    topRecommendedBanks,
    ebitdaUzs: operatingCashAfterTaxUzs,
    dscr: selectedBankProgramResult.dscr,
    approvalStatus: selectedBankProgramResult.approvalStatus,
    approvalProbabilityPercent:
      selectedBankProgramResult.approvalProbabilityPercent,
    netMonthlyProfitUzs,
    paybackMonths,
    annualRoiPercent,
    breakEvenMonth,
    breakEvenMonthlyRevenueUzs,
    safetyMarginPercent,
    dailyRevenueUzs,
    estimatedAvgCheckUzs,
    dailyCustomersNeeded,
    breakEvenDailyCustomers,
    cashflow12Months,
    cashflowExtended,
  };
}

export interface UzbekistanLegalRequirement {
  category: string;
  title: string;
  lawRef: string;
  portalOrAuthority: string;
  actionRequired: string;
}

export interface EntrepreneurPathStep {
  stepNumber: number;
  timeframe: string;
  title: string;
  actions: string[];
  legalNote: string;
  targetKpi: string;
}

export interface UzbekistanLegalRoadmap {
  businessName: string;
  districtName: string;
  recommendedTaxFormTitle: string;
  registrationBasis: string;
  requirements: UzbekistanLegalRequirement[];
  pathSteps: EntrepreneurPathStep[];
  monthlyComplianceCalendar: string[];
}

function detectNicheLegalProfile(inputs: BusinessInputs):
  | 'food'
  | 'education'
  | 'manufacturing'
  | 'medical_auto'
  | 'retail' {
  const lower = (inputs.customBusinessName || '').toLowerCase();
  if (
    lower.includes('автомой') ||
    lower.includes('avtomoy') ||
    lower.includes('автосерв') ||
    lower.includes('avtoservis') ||
    lower.includes('стоматолог') ||
    lower.includes('stomatolog') ||
    lower.includes('салон') ||
    lower.includes('барбер') ||
    lower.includes("go'zallik")
  ) {
    return 'medical_auto';
  }
  if (
    lower.includes('аптек') ||
    lower.includes('dorixon') ||
    lower.includes('пункт') ||
    lower.includes('topshirish') ||
    lower.includes('одежд') ||
    lower.includes('kiyim') ||
    lower.includes('шоурум')
  ) {
    return 'retail';
  }
  if (
    lower.includes('пекар') ||
    lower.includes('novvoy') ||
    lower.includes('фастфуд') ||
    lower.includes('fastfud') ||
    lower.includes('донер') ||
    lower.includes('лаваш') ||
    lower.includes('националь') ||
    lower.includes('milliy') ||
    lower.includes('чайхан')
  ) {
    return 'food';
  }
  if (lower.includes('мебел') || lower.includes('mebel')) {
    return 'manufacturing';
  }
  if (inputs.businessType === 'coffee') return 'food';
  if (inputs.businessType === 'education') return 'education';
  if (inputs.businessType === 'sewing') return 'manufacturing';
  return 'retail';
}

export function getUzbekistanLegalRoadmap(
  inputs: BusinessInputs,
  results: FinancialResults,
  lang: Language,
  currency: Currency = 'UZS'
): UzbekistanLegalRoadmap {
  const district = TASHKENT_DISTRICTS[inputs.district];
  const businessName = getBusinessDisplayName(inputs, lang);
  const optimalTax = results.taxRegimes[results.optimalTaxRegimeId];
  const activeTax = results.activeTaxRegime;
  const topBank = results.bankPrograms[results.recommendedBankId];
  const profile = detectNicheLegalProfile(inputs);
  const fmt = (val: number) => formatUzs(val, lang, currency);
  const lowerName = (inputs.customBusinessName || '').toLowerCase();
  const annualRev = inputs.expectedMonthlyRevenueUzs * 12;
  const paybackTarget =
    results.paybackMonths > 0 ? results.paybackMonths : 12;

  if (lang === 'ru') {
    let regBasis = '';
    if (optimalTax.id === 'self_employed') {
      regBasis =
        'ПП РУз № 4742 и ст. 408 НК РУз: регистрация самозанятого бесплатно в приложении Soliq, налог 1 БРВ/год (375 000 сум/год), без права найма сотрудников и при обороте до 100 млн сум/год.';
    } else if (optimalTax.id === 'yatt') {
      regBasis =
        'НК РУз гл. 58 (ст. 461–470) и ПКМ РУз: ЯТТ (до 5 наемных работников) с налогом с оборота 4% при выручке до 1 млрд сум/год; соцналог 12% с ФОТ сотрудников + фиксированный соцналог 1 БРВ/мес за ИП.';
    } else {
      regBasis =
        annualRev > 1_000_000_000
          ? 'НК РУз разд. IX и XII: при годовой выручке свыше 1 млрд сум (или >5 сотрудников) обязателен переход на общеустановленный режим (ООО/МЧЖ) — НДС 12% с зачетом входного НДС и налог на прибыль 15%.'
          : 'НК РУз: открытие МЧЖ (ООО) удобно для привлечения инвесторов, работы B2B с НДС и снятия лимита по штату; для малого оборота также доступен ЯТТ при штате <= 5 сотр.';
    }

    const nicheRequirementRu: UzbekistanLegalRequirement =
      profile === 'food'
        ? {
            category: 'Санитария, МЧС и общепит',
            title: 'Заключение СЭС (Санэпидком), медкнижки и пожарная безопасность',
            lawRef: 'СанПиН РУз и Закон о пожарной безопасности РУз',
            portalOrAuthority: 'my.gov.uz / Санэпидком и МЧС РУз',
            actionRequired:
              'Оформите санитарно-гигиенический акт на кухню/зал, личные медицинские книжки всех работников, вытяжку, огнетушители и журналы ПБ до открытия точки.',
          }
        : profile === 'education'
        ? {
            category: 'Образование и лицензирование',
            title: 'Уведомление / лицензия на негосударственную образовательную деятельность',
            lawRef: 'Закон «Об образовании» РУз и Постановление ПП-5117',
            portalOrAuthority: 'license.gov.uz / Министерство высшего образования',
            actionRequired:
              'Подайте электронное уведомление (или лицензию) через license.gov.uz, утвердите учебные программы; ученики с высокими баллами по IT/языкам могут получать гос. компенсацию по ПП-5117.',
          }
        : profile === 'manufacturing'
        ? {
            category: 'Производство, ТК и E-aktiv',
            title: 'Охрана труда, техусловия и складской учет сырья (E-aktiv / ЭСФ)',
            lawRef: 'Трудовой кодекс РУз и ПКМ по ЭСФ/E-aktiv',
            portalOrAuthority: 'my.soliq.uz / didox.uz / Узстандарт',
            actionRequired:
              'Проведите инструктаж по охране труда на рабочих местах, ведите приход/расход материалов в системе E-aktiv и оформляйте все отгрузки через ЭСФ с кодами МХИК.',
          }
        : profile === 'medical_auto'
        ? lowerName.includes('стоматолог')
          ? {
              category: 'Медлицензирование (Минздрав)',
              title: 'Лицензия на медицинскую деятельность и паспорт СЭС на стерилизацию',
              lawRef: 'Закон о лицензировании РУз и нормы Минздрава РУз',
              portalOrAuthority: 'license.gov.uz / Минздрав РУз',
              actionRequired:
                'Получите медлицензию на портале license.gov.uz, подтвердите профильное образование врачей, установите автоклав и заключите договор на утилизацию медотходов.',
            }
          : {
              category: 'Экология, водоканал и сервис',
              title: 'Разрешение водоканала, очистные фильтры и техника безопасности',
              lawRef: 'Закон об охране природы РУз и правила бытового обслуживания',
              portalOrAuthority: 'license.gov.uz / Минэкологии и Водоканал',
              actionRequired:
                'Для автомойки/СТО согласуйте оборотное водоснабжение и жиро/пескоуловители, а для салона красоты — медкнижки и стерилизацию инструментов по нормам СЭС.',
            }
        : lowerName.includes('аптек')
        ? {
            category: 'Фармацевтика и Asl Belgisi',
            title: 'Лицензия Фармагентства и обязательная цифровая маркировка лекарств',
            lawRef: 'Закон РУз о лекарственных средствах и ПКМ по Asl Belgisi',
            portalOrAuthority: 'license.gov.uz / aslbelgisi.uz',
            actionRequired:
              'Получите фармлицензию (провизор в штате, температурный режим, термогигрометры) и подключите сканеры 2D DataMatrix для системы маркировки Asl Belgisi.',
          }
        : {
            category: 'Торговля, МХИК и Asl Belgisi',
            title: 'Коды МХИК и цифровая маркировка маркируемых товаров',
            lawRef: 'ПКМ РУз по цифровой маркировке и Единому каталогу МХИК',
            portalOrAuthority: 'tasnif.soliq.uz / aslbelgisi.uz',
            actionRequired:
              'Подберите корректные 17-значные коды МХИК для всего ассортимента в tasnif.soliq.uz; при продаже напитков, воды, бытовой химии или лекарств подключите 2D-сканер Asl Belgisi.',
          };

    const requirements: UzbekistanLegalRequirement[] = [
      {
        category: '1. Регистрация бизнеса и ЭЦП',
        title: `Открытие ${activeTax.nameRu} и получение ключа ЭЦП`,
        lawRef: 'НК РУз (2026) и Указ Президента по упрощению регистрации МСБ',
        portalOrAuthority: 'new.birdarcha.uz / e-imzo.uz',
        actionRequired:
          'Получите ЭЦП (E-IMZO) через ЦГУ или мобильный Face-ID, зарегистрируйте субъект за 15 минут онлайн, откройте расчетный счет в банке (20208...) и корпоративную карту.',
      },
      {
        category: '2. Регистрация договора аренды',
        title: `Электронная постановка помещения ${inputs.areaSqm} м² на учет`,
        lawRef: 'НК РУз (контроль арендных отношений и рыночных ставок)',
        portalOrAuthority: 'ijara.soliq.uz',
        actionRequired:
          `Заключите договор аренды в ${district.nameRu} (~${fmt(district.rentPerSqmUzs)}/м² = ${fmt(results.opex.rentUzs)}/мес) и подтвердите его обеими сторонами ЭЦП в ijara.soliq.uz в течение 5 дней — иначе расходы не вычитаются и возможен штраф.`,
      },
      {
        category: '3. Касса, эквайринг и МХИК',
        title: 'Онлайн-ККМ / виртуальная касса с QR-чеком и терминалы оплаты',
        lawRef: 'ПКМ РУз № 943 (обязательная фискализация расчетов с населением)',
        portalOrAuthority: 'my.soliq.uz / Центр ОФД',
        actionRequired:
          'Зарегистрируйте онлайн-ККМ или мобильную виртуальную кассу, привяжите коды МХИК (tasnif.soliq.uz), подключите терминалы Uzcard/Humo и QR Click/Payme (фискальный чек обязателен по каждой оплате).',
      },
      {
        category: '4. Трудовое право РУз',
        title: `Оформление ${inputs.staffCount} сотр. и воинский/кадровый учет`,
        lawRef: 'Трудовой кодекс РУз (ред. 2023–2026) и НДФЛ 12% + Соцналог 12%',
        portalOrAuthority: 'my.mehnat.uz (ЕНСТ)',
        actionRequired:
          inputs.staffCount > 0
            ? `Зарегистрируйте трудовые договоры с ${inputs.staffCount} сотрудниками в ЕНСТ (my.mehnat.uz) не позднее даты выхода на смену; удерживайте НДФЛ 12% и уплачивайте 12% соцналога с ФОТ (${fmt(results.opex.payrollGrossUzs)}/мес).`
            : 'При работе в одиночку наемные договоры не требуются; при найме первого сотрудника обязательно зарегистрируйте договор в системе ЕНСТ (my.mehnat.uz).',
      },
      nicheRequirementRu,
    ];

    const pathSteps: EntrepreneurPathStep[] = [
      {
        stepNumber: 1,
        timeframe: 'Дни 1–5',
        title: 'Юридический старт, выбор налога и банковский счет',
        actions: [
          `Оформить ЭЦП (e-imzo.uz) и зарегистрировать оптимальную форму: ${optimalTax.nameRu} через new.birdarcha.uz.`,
          `Открыть расчетный счет и подключить банк-клиент${inputs.loanAmountUzs > 0 ? `; подготовить пакет документов на кредит ${fmt(inputs.loanAmountUzs)} в ${topBank.bankNamesRu} (льготный период ${topBank.recommendedGraceMonths} мес.)` : ' (работа без кредитной нагрузки)'}.`,
        ],
        legalNote:
          'Сразу закрепите за собой коды ОКЭД и правильный налоговый режим в личном кабинете my.soliq.uz.',
        targetKpi: `Экономия на налогах до ${fmt(results.annualTaxSavingsUzs)}/год`,
      },
      {
        stepNumber: 2,
        timeframe: 'Дни 6–15',
        title: 'Поиск помещения, договор аренды и согласования',
        actions: [
          `Подобрать помещение ~${inputs.areaSqm} м² в ${district.nameRu} и согласовать 15–30 дней арендного льготного периода на ремонт.`,
          'Провести регистрацию договора аренды через ijara.soliq.uz с подписанием ЭЦП арендодателя и арендатора.',
        ],
        legalNote:
          'Обязательно проверьте назначение помещения (нежилой фонд) и наличие договора на электроэнергию/воду по тарифам для юрлиц.',
        targetKpi: `Аренда <= ${fmt(results.opex.rentUzs)}/мес (${district.nameRu})`,
      },
      {
        stepNumber: 3,
        timeframe: 'Дни 16–35',
        title: 'Ремонт, закупка оборудования и отраслевые разрешения',
        actions: [
          `Освоить стартовый CAPEX ${fmt(results.capex.totalInvestmentUzs)}: оборудование (${fmt(results.capex.equipmentUzs)}), ремонт (${fmt(results.capex.renovationUzs)}), первичная закупка (${fmt(results.capex.inventoryMarketingUzs)}).`,
          'Подключить онлайн-ККМ (ПКМ №943), коды МХИК и оформить отраслевые разрешения (СЭС / МЧС / license.gov.uz / Asl Belgisi).',
        ],
        legalNote:
          'Вся закупка сырья и техники должна оформляться через электронные счета-фактуры (didox.uz) — для МЧЖ это дает зачет 12% входного НДС.',
        targetKpi: `Резерв безопасности в кассе: ${fmt(results.capex.reserveRegistrationUzs)}`,
      },
      {
        stepNumber: 4,
        timeframe: 'Дни 36–45',
        title: 'Найм команды, кассовая дисциплина и локальный маркетинг',
        actions: [
          inputs.staffCount > 0
            ? `Нанять ${inputs.staffCount} сотр., внести трудовые договоры в my.mehnat.uz и утвердить систему мотивации (оклад + KPI от чека ${fmt(results.estimatedAvgCheckUzs)}).`
            : 'Настроить операционные процессы самостоятельной работы, CRM-запись и прием безналичных платежей.',
          `Оформить точки в 2GIS, Яндекс Картах и Telegram; внедрить УТП против конкурентов района (${district.nameRu}).`,
        ],
        legalNote:
          'Каждый покупатель обязан получать фискальный QR-чек с кодом МХИК; штрафы по НК РУз за невыдачу чека начинаются от 5 млн сум.',
        targetKpi: 'Готовность к открытию и тестовые продажи (65% мощности)',
      },
      {
        stepNumber: 5,
        timeframe: 'Месяцы 2–3',
        title: 'Выход на точку безубыточности и жесткий контроль OPEX',
        actions: [
          `Довести дневной поток минимум до ~${results.breakEvenDailyCustomers} клиентов/день (${fmt(results.breakEvenMonthlyRevenueUzs)}/мес), чтобы полностью закрывать аренду, ФОТ, сырье и налоги.`,
          `Удерживать себестоимость (COGS) в рамках ${inputs.cogsPercent}% и контролировать кассовые разрывы в период раскачки (80–95% загрузки).`,
        ],
        legalNote:
          'Ежемесячно до 10–15 числа сдавайте налоговую отчетность в my.soliq.uz и уплачивайте налог с оборота / НДС / НДФЛ и соцналог без просрочек и пени.',
        targetKpi: `Выручка >= ${fmt(results.breakEvenMonthlyRevenueUzs)}/мес (0 убытков)`,
      },
      {
        stepNumber: 6,
        timeframe: `Месяцы 4–${paybackTarget}`,
        title: '100% мощности, возврат инвестиций и масштабирование',
        actions: [
          `Стабилизировать поток на ~${results.dailyCustomersNeeded} кл./день → чистая прибыль ${fmt(results.netMonthlyProfitUzs)}/мес; своевременно закрывать платежи по кредиту после окончания льготного периода.`,
          `Вернуть 100% собственных вложений (${fmt(inputs.ownCapitalUzs)}) и реинвестировать прибыль в открытие 2-й точки или расширение линейки.`,
        ],
        legalNote:
          'При приближении годового оборота к 1 млрд сум (для ЯТТ) заранее планируйте добровольный перевод в МЧЖ (НДС 12%), чтобы использовать зачет входного НДС без штрафов.',
        targetKpi: `Окупаемость на ${paybackTarget}-м мес. • ROI ${results.annualRoiPercent}%/год`,
      },
    ];

    const monthlyComplianceCalendar = [
      'До 5-го числа каждого месяца: проверка подписания всех ЭСФ (didox.uz) и сверка договора аренды в ijara.soliq.uz.',
      'До 15-го числа следующего месяца: сдача расчетов и уплата НДФЛ (12%), социального налога (12%) и налога с оборота (4% для ЯТТ) в my.soliq.uz.',
      'До 20-го числа (для плательщиков НДС / МЧЖ): подача отчетности и уплата НДС (12%), авансовых платежей / налога на прибыль (15%).',
      'Ежедневно: закрытие Z-отчета онлайн-ККМ, контроль остатков по E-aktiv и сверка факта выручки с дневным KPI.',
    ];

    return {
      businessName,
      districtName: district.nameRu,
      recommendedTaxFormTitle: optimalTax.nameRu,
      registrationBasis: regBasis,
      requirements,
      pathSteps,
      monthlyComplianceCalendar,
    };
  }

  // UZBEK (LATIN) — ZERO CYRILLIC CHARACTERS
  let regBasisUz = '';
  if (optimalTax.id === 'self_employed') {
    regBasisUz =
      "O'zR PQ-4742 va SK 408-modda: Soliq ilovasida bepul ro'yxatdan o'tish, soliq yiliga 1 BHM (375 000 so'm/yil), yollanma xodimlarsiz va yillik tushum 100 mln so'mgacha.";
  } else if (optimalTax.id === 'yatt') {
    regBasisUz =
      "O'zR SK 58-bob (461–470-moddalar): YaTT (5 nafargacha xodim bilan), yillik tushum 1 mlrd so'mgacha bo'lganda aylanmadan 4% soliq + xodimlar maoshidan 12% ijtimoiy soliq + YaTT uchun oyiga 1 BHM.";
  } else {
    regBasisUz =
      annualRev > 1_000_000_000
        ? "O'zR SK IX va XII bo'limlar: yillik aylanma 1 mlrd so'mdan oshganda (yoki >5 xodimda) umumbelgilangan soliq (MChJ: QQS 12% kiruvchi QQS hisobi bilan + Foyda solig'i 15%) majburiy."
        : "O'zR SK: MChJ ochish B2B shartnomalar, QQS bilan ishlash va xodimlar sonida cheklovsiz rivojlanish uchun qulay.";
  }

  const nicheRequirementUz: UzbekistanLegalRequirement =
    profile === 'food'
      ? {
          category: 'Sanitariya (SES) va FVV',
          title: "SES sanitariya xulosasi, tibbiy daftarcha va yong'in xavfsizligi",
          lawRef: "O'zR SanPin me'yorlari va Yong'in xavfsizligi qonuni",
          portalOrAuthority: 'my.gov.uz / Sanepidqo‘mita va FVV',
          actionRequired:
            "Ishga tushirishdan oldin oshxona/zal bo'yicha SES xulosasi, barcha xodimlar uchun tibbiy daftarcha, havo tortish tizimi va o't o'chirish vositalarini tayyorlang.",
        }
      : profile === 'education'
      ? {
          category: "Ta'lim va litsenziyalash",
          title: "Nodavlat ta'lim faoliyati uchun xabarnoma / litsenziya",
          lawRef: "O'zR Ta'lim to'g'risidagi qonun va PQ-5117",
          portalOrAuthority: "license.gov.uz / Oliy ta'lim vazirligi",
          actionRequired:
            "license.gov.uz orqali elektron xabarnoma yuboring va o'quv dasturlarini tasdiqlang; xalqaro IT/til sertifikatlariga davlat kompensatsiyasi dasturidan foydalaning.",
        }
      : profile === 'manufacturing'
      ? {
          category: 'Ishlab chiqarish va E-aktiv',
          title: 'Mehnat muhofazasi, texnik shartlar va ombor hisobi (E-aktiv / EHF)',
          lawRef: "O'zR Mehnat kodeksi va EHF/E-aktiv qarorlari",
          portalOrAuthority: "my.soliq.uz / didox.uz / O'zstandart",
          actionRequired:
            "Ish joylarida xavfsizlik yo'riqnomasini o'tkazing, xomashyo kirim-chiqimini E-aktiv tizimida yuriting va barcha yuk xatlarini MXIK kodi bilan EHF orqali rasmiylashtiring.",
        }
      : profile === 'medical_auto'
      ? lowerName.includes('stomatolog')
        ? {
            category: 'Tibbiyot litsenziyasi (SSV)',
            title: "Tibbiy faoliyat litsenziyasi va sterilizatsiya bo'yicha SES pasporti",
            lawRef: "O'zR Litsenziyalash qonuni va SSV me'yorlari",
            portalOrAuthority: "license.gov.uz / Sog'liqni saqlash vazirligi",
            actionRequired:
              "license.gov.uz portali orqali tibbiy litsenziya oling, shifokor diplomlarini tasdiqlang, avtoklav o'rnating va tibbiy chiqindilarni yo'q qilish shartnomasini tuzing.",
          }
        : {
            category: 'Ekologiya, Suvokova va xizmat',
            title: "Suv ta'minoti ruxsati, tozalash filtrlari va xavfsizlik",
            lawRef: "O'zR Tabiatni muhofaza qilish qonuni",
            portalOrAuthority: 'license.gov.uz / Ekologiya vazirligi',
            actionRequired:
              "Avtomoyka uchun aylanma suv tozalash tizimini kelishib oling; go'zallik saloni uchun esa asboblarni sterilizatsiya qilish va tibbiy daftarchalarni rasmiylashtiring.",
          }
      : lowerName.includes('dorixon')
      ? {
          category: 'Farmatsevtika va Asl Belgisi',
          title: 'Farmagentlik litsenziyasi va dorilarni raqamli markirovkalash',
          lawRef: "O'zR Dori vositalari qonuni va Asl Belgisi qarori",
          portalOrAuthority: 'license.gov.uz / aslbelgisi.uz',
          actionRequired:
            "Farmatsevtika litsenziyasini oling (shtatda provizor va harorat nazorati) hamda barcha dorilar uchun Asl Belgisi 2D-skanerini ulang.",
        }
      : {
          category: 'Savdo, MXIK va Asl Belgisi',
          title: 'MXIK kodlari va majburiy raqamli markirovkalash tizimi',
          lawRef: "O'zR raqamli markirovkalash va MXIK yagona katalogi qarorlari",
          portalOrAuthority: 'tasnif.soliq.uz / aslbelgisi.uz',
          actionRequired:
            "tasnif.soliq.uz saytidan barcha tovarlar uchun 17 xonali MXIK kodlarini biriktiring; ichimliklar, suv yoki maishiy kimyo sotilsa 2D-skaner ulang.",
        };

  return {
    businessName,
    districtName: district.nameUz,
    recommendedTaxFormTitle: optimalTax.nameUz,
    registrationBasis: regBasisUz,
    requirements: [
      {
        category: "1. Ro'yxatdan o'tish va ERI",
        title: `${activeTax.nameUz} ochish va elektron imzo (E-IMZO) olish`,
        lawRef: "O'zR SK (2026) va tadbirkorlikni ro'yxatga olish qoidalari",
        portalOrAuthority: 'new.birdarcha.uz / e-imzo.uz',
        actionRequired:
          "E-IMZO kalitini oling, 15 daqiqada onlayn ro'yxatdan o'ting, bankda hisob raqam (20208...) va korporativ karta oching.",
      },
      {
        category: '2. Ijara shartnomasini hisobga olish',
        title: `${inputs.areaSqm} m² joy ijarasini soliqda tasdiqlash`,
        lawRef: "O'zR SK (ijara shartnomalarini majburiy hisobga olish)",
        portalOrAuthority: 'ijara.soliq.uz',
        actionRequired:
          `${district.nameUz} hududidagi ijara shartnomasini (~${fmt(district.rentPerSqmUzs)}/m² = ${fmt(results.opex.rentUzs)}/oy) 5 kun ichida ijara.soliq.uz orqali ikki tomonlama ERI bilan tasdiqlang.`,
      },
      {
        category: '3. Kassa intizomi va MXIK',
        title: "QR-chekli onlayn-NKM / virtual kassa va to'lov terminallari",
        lawRef: "O'zR VMQ № 943 (aholi bilan naqd/karta hisob-kitob qoidalari)",
        portalOrAuthority: 'my.soliq.uz / OFD markazi',
        actionRequired:
          "Onlayn-NKM yoki virtual kassa ro'yxatdan o'tkazing, MXIK kodlarini ulang, Uzcard/Humo hamda Click/Payme QR-to'lovlarini yoqing.",
      },
      {
        category: '4. Mehnat qonunchiligi',
        title: `${inputs.staffCount} nafar xodimni YMMT tizimida rasmiylashtirish`,
        lawRef: "O'zR Mehnat kodeksi va 12% JShODS + 12% ijtimoiy soliq",
        portalOrAuthority: 'my.mehnat.uz (YMMT)',
        actionRequired:
          inputs.staffCount > 0
            ? `${inputs.staffCount} nafar xodim bilan mehnat shartnomasini my.mehnat.uz da ro'yxatdan o'tkazing; maosh fondi (${fmt(results.opex.payrollGrossUzs)}/oy) dan 12% JShODS va 12% ijtimoiy soliq to'lang.`
            : "Yolg'iz ishlaganda shartnoma shart emas; ilk xodim olingan kuni my.mehnat.uz da shartnoma kiritish majburiy.",
      },
      nicheRequirementUz,
    ],
    pathSteps: [
      {
        stepNumber: 1,
        timeframe: '1–5-kunlar',
        title: "Yuridik ro'yxatdan o'tish va soliq rejimini tanlash",
        actions: [
          `E-IMZO olish va new.birdarcha.uz orqali ${optimalTax.nameUz} shaklini ochish.`,
          `Bank hisob raqami ochish${inputs.loanAmountUzs > 0 ? ` va ${topBank.bankNamesUz} dan ${fmt(inputs.loanAmountUzs)} kredit (${topBank.recommendedGraceMonths} oy imtiyozli davr) bo'yicha hujjat tayyorlash` : ' (kreditsiz boshlash)'}.`,
        ],
        legalNote:
          'my.soliq.uz shaxsiy kabinetida IFUT kodi va tanlangan soliq rejimini tekshiring.',
        targetKpi: `Yillik soliq tejami: ${fmt(results.annualTaxSavingsUzs)}/yil`,
      },
      {
        stepNumber: 2,
        timeframe: '6–15-kunlar',
        title: 'Joy topish, ijara kelishuvi va ijara.soliq.uz',
        actions: [
          `${district.nameUz} da ${inputs.areaSqm} m² joy tanlash va ta'mirlash uchun 15–30 kun ijara imtiyozli davrini kelishish.`,
          'Ijara shartnomasini ijara.soliq.uz tizimida ERI bilan tasdiqlatish.',
        ],
        legalNote:
          "Binoning noturar joy maqomini va yuridik shaxslar uchun elektr/suv shartnomasini tekshiring.",
        targetKpi: `Ijara chegarasi <= ${fmt(results.opex.rentUzs)}/oy`,
      },
      {
        stepNumber: 3,
        timeframe: '16–35-kunlar',
        title: "Ta'mirlash, uskunalar xaridi va ruxsatnomalar",
        actions: [
          `Boshlang'ich CAPEX (${fmt(results.capex.totalInvestmentUzs)}) ni sarflash: uskunalar (${fmt(results.capex.equipmentUzs)}), ta'mirlash (${fmt(results.capex.renovationUzs)}), ilk tovar (${fmt(results.capex.inventoryMarketingUzs)}).`,
          "Onlayn-NKM ulash (VMQ-943), MXIK kodlari va tarmoq ruxsatnomalarini (SES / FVV / license.gov.uz) olish.",
        ],
        legalNote:
          "Barcha xaridlar didox.uz orqali EHF bilan rasmiylashtirilsa, MChJ uchun 12% QQS hisobga olinadi.",
        targetKpi: `Zaxira fondi: ${fmt(results.capex.reserveRegistrationUzs)}`,
      },
      {
        stepNumber: 4,
        timeframe: '36–45-kunlar',
        title: 'Jamoa yollash, kassa va mahalliy marketing',
        actions: [
          inputs.staffCount > 0
            ? `${inputs.staffCount} xodimni my.mehnat.uz da ro'yxatdan o'tkazish va o'rtacha chek (${fmt(results.estimatedAvgCheckUzs)}) ga bog'langan KPI joriy qilish.`
            : "Ish jarayonlarini, CRM yozuvni va naqdsiz QR to'lovlarni yo'lga qo'yish.",
          '2GIS, Yandex Xaritalar va Telegram kanalini ishga tushirish; raqobatchilardan ustunlikni targ‘ib qilish.',
        ],
        legalNote:
          "Har bir xaridorga MXIK kodli QR-chek berilishi shart; aks holda O'zR SK bo'yicha yirik jarima qo'llanadi.",
        targetKpi: 'Test savdolariga start (65% quvvat)',
      },
      {
        stepNumber: 5,
        timeframe: '2–3-oylar',
        title: 'Zararsizlik nuqtasiga chiqish va xarajatlar nazorati',
        actions: [
          `Kunlik oqimni kamida ~${results.breakEvenDailyCustomers} mijoz/kun (${fmt(results.breakEvenMonthlyRevenueUzs)}/oy) darajasiga olib chiqish.`,
          `Tannarxni ${inputs.cogsPercent}% chegarasida ushlash va ijara/maosh intizomini nazorat qilish.`,
        ],
        legalNote:
          "Har oyning 10–15-sanasigacha my.soliq.uz da hisobot topshirib soliqlarni o'z vaqtida to'lang.",
        targetKpi: `Tushum >= ${fmt(results.breakEvenMonthlyRevenueUzs)}/oy`,
      },
      {
        stepNumber: 6,
        timeframe: `4–${paybackTarget}-oylar`,
        title: "100% quvvat, sarmoyani qaytarish va kengayish",
        actions: [
          `Kuniga ~${results.dailyCustomersNeeded} mijoz oqimi bilan barqaror oyiga ${fmt(results.netMonthlyProfitUzs)} sof foydaga chiqish.`,
          `Shaxsiy sarmoyani (${fmt(inputs.ownCapitalUzs)}) 100% qoplash va 2-filial ochishga tayyorlanish.`,
        ],
        legalNote:
          "Yillik aylanma 1 mlrd so'mga yaqinlashganda YaTT dan MChJ (QQS 12%) ga o'tishni oldindan rejalashtiring.",
        targetKpi: `Qoplash: ${paybackTarget}-oy • Yillik ROI ${results.annualRoiPercent}%`,
      },
    ],
    monthlyComplianceCalendar: [
      "Har oyning 5-sanasigacha: didox.uz dagi barcha EHF larni tasdiqlash va ijara.soliq.uz ni tekshirish.",
      "Keyingi oyning 15-sanasigacha: my.soliq.uz da JShODS (12%), ijtimoiy soliq (12%) va aylanma solig'i (4% YaTT) hisobotini topshirish va to'lash.",
      "20-sanasigacha (MChJ / QQS to'lovchilar): QQS (12%) va foyda solig'i (15%) hisobotlarini yuborish.",
      "Har kuni: onlayn-NKM Z-hisobotini yopish va E-aktiv qoldiqlarini tekshirish.",
    ],
  };
}
