export const EBOOK_PDF_URL =
  '/assets/aistudio/KetoLife_Bahrain_FINAL_30_Day_Keto_Guide_BILINGUAL_FIXED_17cd2883.pdf';

export const BOOK_COVER_IMAGE_URL = '/assets/book-cover-p1.jpg';
export const BOOK_PAGE_2_URL = '/assets/book-page-2.jpg';
export const BOOK_PAGE_3_URL = '/assets/book-page-3.jpg';

export type CurrencyCode = 'BHD' | 'USD' | 'SAR' | 'AED' | 'GBP' | 'EUR';

export interface CurrencyMeta {
  code: CurrencyCode;
  label: string;
  region: string;
  rateFromBhd: number;
  decimals: number;
  symbol: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  BHD: { code: 'BHD', label: 'BHD · Bahrain', region: 'Bahrain', rateFromBhd: 1, decimals: 3, symbol: 'BHD' },
  USD: { code: 'USD', label: 'USD · Global', region: 'Worldwide', rateFromBhd: 2.65, decimals: 2, symbol: '$' },
  SAR: { code: 'SAR', label: 'SAR · Saudi', region: 'Saudi Arabia', rateFromBhd: 10.0, decimals: 2, symbol: 'SAR' },
  AED: { code: 'AED', label: 'AED · UAE', region: 'UAE', rateFromBhd: 9.75, decimals: 2, symbol: 'AED' },
  GBP: { code: 'GBP', label: 'GBP · UK', region: 'United Kingdom', rateFromBhd: 2.1, decimals: 2, symbol: '£' },
  EUR: { code: 'EUR', label: 'EUR · Europe', region: 'Europe', rateFromBhd: 2.45, decimals: 2, symbol: '€' },
};

export const DISCOUNT_PERCENT = 25;

export function applyDiscountBhd(bhdAmount: number, percent: number = DISCOUNT_PERCENT): number {
  return Math.round(bhdAmount * (1 - percent / 100) * 1000) / 1000;
}

export function formatCurrencyPrice(bhdAmount: number, currency: CurrencyCode): string {
  const meta = CURRENCIES[currency];
  const converted = bhdAmount * meta.rateFromBhd;
  const fixed = converted.toFixed(meta.decimals);
  if (currency === 'USD' || currency === 'GBP' || currency === 'EUR') {
    return `${meta.symbol}${fixed} ${currency}`;
  }
  return `${fixed} ${meta.symbol}`;
}

export const BENEFITPAY_QR_URL = '/assets/aistudio/IMG-20261115-WA0000_90bda122.jpg';
export const WHATSAPP_SUPPORT_NUMBER = '+973 3387 2201';
export const WHATSAPP_SUPPORT_LINK = 'https://wa.me/97333872201';

export interface BisbBankDetails {
  bankName: string;
  accountHolder: string;
  iban: string;
  accountNumber: string;
  swiftBic: string;
  benefitPayNumber: string;
  globalPayLink: string;
  merchantEmail: string;
  digitalPriceBhd: number;
  bundlePriceBhd: number;
}

export const DEFAULT_BISB_ACCOUNT: BisbBankDetails = {
  bankName: 'Bahrain Islamic Bank (BisB)',
  accountHolder: 'KetoLife Bahrain',
  iban: 'BH28BIBB00100002951057',
  accountNumber: '00100002951057',
  swiftBic: 'BIBBBHBM',
  benefitPayNumber: '+973 3387 2201',
  globalPayLink: '',
  merchantEmail: 'pridebahrain22@gmail.com',
  digitalPriceBhd: 9.9,
  bundlePriceBhd: 14.9,
};

export interface SocialAccounts {
  instagram: string;
  tiktok: string;
  youtube: string;
  x: string;
  facebook: string;
  snapchat: string;
}

export type SocialPlatformId = keyof SocialAccounts;

export interface SocialPlatformMeta {
  id: SocialPlatformId;
  label: string;
  placeholder: string;
}

export const SOCIAL_PLATFORMS: SocialPlatformMeta[] = [
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/ketolife.bh' },
  { id: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@ketolife.bh' },
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@ketolife.bh' },
  { id: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/ketolife_bh' },
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/ketolife.bh' },
  { id: 'snapchat', label: 'Snapchat', placeholder: 'https://snapchat.com/add/ketolife.bh' },
];

export const DEFAULT_SOCIAL_ACCOUNTS: SocialAccounts = {
  instagram: '',
  tiktok: '',
  youtube: '',
  x: '',
  facebook: '',
  snapchat: '',
};

export function normalizeSocialUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  customerName: string;
  country: string;
  phone: string;
  email: string;
  editionTitle: string;
  amountFormatted: string;
  paymentRail: 'bisb-local' | 'global-swift' | 'global-link';
  screenshotName: string;
  screenshotDataUrl?: string;
}

export interface IngredientSpec {
  id:
    | 'avocado'
    | 'salmon'
    | 'broccoli'
    | 'egg'
    | 'oliveOil'
    | 'lemon'
    | 'almonds'
    | 'greens'
    | 'chicken'
    | 'olives'
    | 'cucumber'
    | 'cauliflower'
    | 'cheese'
    | 'garlic';
  nameEn: string;
  nameAr: string;
  category: string;
  macros: string;
  roleInGuide: string;
  roleInGuideAr: string;
  accentHex: string;
}

export const ORBIT_INGREDIENTS: IngredientSpec[] = [
  {
    id: 'salmon',
    nameEn: 'Clean Protein Sources',
    nameAr: 'مصادر البروتين النقي',
    category: 'Satiety Pillar',
    macros: 'High Satiety · Zero Sugar',
    roleInGuide: 'Helps preserve lean tone and keep hunger stable during fat loss.',
    roleInGuideAr: 'يساعد في الحفاظ على الكتلة العضلية وتقليل الجوع أثناء خسارة الوزن.',
    accentHex: '#f97316',
  },
  {
    id: 'avocado',
    nameEn: 'Healthy Natural Fats',
    nameAr: 'الدهون الصحية الطبيعية',
    category: 'Metabolic Fuel',
    macros: 'Steady Energy · Zero Crash',
    roleInGuide: 'Replaces refined carbs with slow-burning fuel so afternoon fatigue fades.',
    roleInGuideAr: 'يستبدل السكريات بطاقة مستقرة تمنع الخمول خلال اليوم.',
    accentHex: '#84cc16',
  },
  {
    id: 'egg',
    nameEn: 'Morning Bio-Protein',
    nameAr: 'بروتين بداية اليوم',
    category: 'Appetite Control',
    macros: 'Complete Amino Profile',
    roleInGuide: 'Sets stable blood sugar early in the morning to stop mid-day snacking.',
    roleInGuideAr: 'يمنح شبعا مبكراً ويقلل الرغبة في الحلويات طوال اليوم.',
    accentHex: '#eab308',
  },
  {
    id: 'broccoli',
    nameEn: 'High-Fiber Greens',
    nameAr: 'الألياف والخضروات',
    category: 'Digestive Balance',
    macros: 'Micronutrients · Low Net Carbs',
    roleInGuide: 'Supports smooth digestion and mineral balance throughout all 4 weeks.',
    roleInGuideAr: 'يدعم الهضم وتوازن المعادن طوال فترة البرنامج.',
    accentHex: '#22c55e',
  },
  {
    id: 'oliveOil',
    nameEn: 'Cold-Pressed Oils',
    nameAr: 'الزيوت الطبيعية النقية',
    category: 'Clean Cooking Base',
    macros: 'Pure Fat · Antioxidant Rich',
    roleInGuide: 'Simple everyday swap for inflammatory seed oils and heavy sauces.',
    roleInGuideAr: 'بديل عملي وسهل للزيوت المكررة والصلصات الغنية بالسكر.',
    accentHex: '#ca8a04',
  },
  {
    id: 'lemon',
    nameEn: 'Natural Electrolytes',
    nameAr: 'توازن الأملاح والترطيب',
    category: 'Hydration Support',
    macros: 'Zero Sugar · Fresh Zest',
    roleInGuide: 'Prevents early-week sluggishness by keeping daily hydration effective.',
    roleInGuideAr: 'يساعد على تجنب تعب البداية والحفاظ على النشاط.',
    accentHex: '#facc15',
  },
  {
    id: 'almonds',
    nameEn: 'Controlled Crunch',
    nameAr: 'وجبات خفيفة متوازنة',
    category: 'Craving Control',
    macros: 'Vitamin E · Mineral Dense',
    roleInGuide: 'Smart portion guidance so snacking never stalls weekly progress.',
    roleInGuideAr: 'إرشادات ذكية للكميات حتى لا يتوقف نزول الوزن.',
    accentHex: '#d97706',
  },
  {
    id: 'greens',
    nameEn: 'Mineral Leafy Base',
    nameAr: 'قاعدة المعادن اليومية',
    category: 'Potassium & Magnesium',
    macros: 'Essential Electrolytes',
    roleInGuide: 'Builds plate volume for satisfaction without heavy starches.',
    roleInGuideAr: 'يعطي امتلاءً صحياً للوجبة دون نشويات ثقيلة.',
    accentHex: '#10b981',
  },
  {
    id: 'chicken',
    nameEn: 'Everyday Grill Staples',
    nameAr: 'أساسيات الشواء اليومية',
    category: 'Busy Schedule Protein',
    macros: 'Fast Prep · High Protein',
    roleInGuide: 'Easy 15-minute preparation ideas suited for busy Bahrain households.',
    roleInGuideAr: 'أفكار تحضير سريعة تناسب أوقات العمل والأسرة.',
    accentHex: '#f59e0b',
  },
  {
    id: 'olives',
    nameEn: 'Mediterranean Fats',
    nameAr: 'دهون البحر المتوسط',
    category: 'Satiety Booster',
    macros: 'Low Carb · Savory',
    roleInGuide: 'Bridges meal gaps naturally without reaching for sugary biscuits.',
    roleInGuideAr: 'يسد الجوع بين الوجبات دون الحاجة للسكريات.',
    accentHex: '#65a30d',
  },
  {
    id: 'cucumber',
    nameEn: 'Crisp Hydration Veg',
    nameAr: 'ترطيب وانتعاش يومي',
    category: 'Cooling Fiber',
    macros: '95% Water · Light Carb',
    roleInGuide: 'Ideal for warm Gulf weather to stay refreshed and light.',
    roleInGuideAr: 'مناسب لأجواء الخليج للحفاظ على الانتعاش والترطيب.',
    accentHex: '#4ade80',
  },
  {
    id: 'cauliflower',
    nameEn: 'Smart Rice Alternatives',
    nameAr: 'بدائل ذكية للنشويات',
    category: 'Traditional Swaps',
    macros: 'Fraction of the Carbs',
    roleInGuide: 'Lets you enjoy familiar local dishes without post-meal heaviness.',
    roleInGuideAr: 'يسمح بالاستمتاع بنكهات قريبة من أطباقنا دون ثقل الأرز.',
    accentHex: '#e7e5e4',
  },
  {
    id: 'cheese',
    nameEn: 'Full-Fat Dairy Options',
    nameAr: 'خيارات الألبان الكاملة',
    category: 'Calcium & Richness',
    macros: 'Zero Added Sugar',
    roleInGuide: 'Explains how to read labels locally and avoid hidden starches.',
    roleInGuideAr: 'يوضح كيفية قراءة الملصقات الغذائية وتجنب السكر الخفي.',
    accentHex: '#fef08a',
  },
  {
    id: 'garlic',
    nameEn: 'Clean Herbs & Spices',
    nameAr: 'التوابل والأعشاب الطبيعية',
    category: 'Zero-Calorie Flavor',
    macros: 'Pure Aroma · 0g Sugar',
    roleInGuide: 'Replaces bottled sugar-loaded marinades with bold Gulf & home spices.',
    roleInGuideAr: 'يستبدل التتبيلات التجارية السكرية بنكهات طبيعية غنية.',
    accentHex: '#fde68a',
  },
];

export interface TransformationPillar {
  number: string;
  problemTitle: string;
  solutionTitle: string;
  solutionAr: string;
  description: string;
}

export const TRANSFORMATION_PILLARS: TransformationPillar[] = [
  {
    number: '01',
    problemTitle: 'Afternoon Crashes & Constant Cravings',
    solutionTitle: 'Switch to Steady Fat-Burn Fuel',
    solutionAr: 'طاقة مستقرة دون هبوط أو جوع مفاجئ',
    description:
      'Break the blood-sugar rollercoaster caused by heavy lunches and sweet snacks so your energy stays calm and focused from morning until evening.',
  },
  {
    number: '02',
    problemTitle: 'Confusing Calorie Apps & Complicated Math',
    solutionTitle: 'Use a Simple Visual Habit System',
    solutionAr: 'نظام بصري بسيط بلا حسابات معقدة',
    description:
      'Skip exhausting spreadsheets and exotic imported powders. Follow clear portion principles built around everyday supermarkets across Bahrain.',
  },
  {
    number: '03',
    problemTitle: 'Social Dinners & Eating Out Anxiety',
    solutionTitle: 'Navigate Restaurants With Confidence',
    solutionAr: 'ثقة كاملة في المطاعم والجمعات العائلية',
    description:
      'Learn how to order at local grills, cafes, and family gatherings without ruining your momentum or feeling left out.',
  },
  {
    number: '04',
    problemTitle: 'Quitting After the First 10 Days',
    solutionTitle: 'Structured 30-Day Weekly Milestones',
    solutionAr: 'خطة واضحة من اليوم الأول حتى اليوم ٣٠',
    description:
      'Track hydration, sleep, waist changes, and beginner movement targets step by step so results compound week after week.',
  },
];

export interface TransformationPhase {
  id: 'week1' | 'week2' | 'week3' | 'week4';
  tabLabel: string;
  daysLabel: string;
  titleEn: string;
  titleAr: string;
  summary: string;
  milestones: string[];
}

export const THIRTY_DAY_PHASES: TransformationPhase[] = [
  {
    id: 'week1',
    tabLabel: 'Week 1 · Reset',
    daysLabel: 'Days 01–07',
    titleEn: 'Clear Sugar Habits & Stabilize Hydration',
    titleAr: 'تنظيف العادات الغذائية وتوازن الترطيب',
    summary:
      'The first 7 days focus on clearing hidden sugars from your kitchen, balancing water and minerals, and feeling lighter without starving.',
    milestones: [
      'Spot hidden carbs in everyday drinks and sauces',
      'Set an easy daily hydration and electrolyte rhythm',
      'Reduce bloating and late-night snack impulses',
    ],
  },
  {
    id: 'week2',
    tabLabel: 'Week 2 · Adaptation',
    daysLabel: 'Days 08–14',
    titleEn: 'Natural Appetite Control & Kitchen Speed',
    titleAr: 'تنظيم الشهية وسرعة التحضير اليومي',
    summary:
      'As cravings quiet down, you build a repeatable 60-minute weekly prep routine that fits busy workdays and family life.',
    milestones: [
      'Streamline grocery shopping with local Bahrain aisles',
      'Establish steady meal timing without mid-day slumps',
      'Introduce gentle low-impact movement habits',
    ],
  },
  {
    id: 'week3',
    tabLabel: 'Week 3 · Momentum',
    daysLabel: 'Days 15–21',
    titleEn: 'Consistent Fat Loss & Real-World Flexibility',
    titleAr: 'ثبات حرق الدهون والمرونة خارج المنزل',
    summary:
      'Week 3 locks in sustainable fat metabolism while teaching smart ordering habits for weekend dining and travel.',
    milestones: [
      'Apply quick restaurant ordering frameworks',
      'Overcome common weight-loss plateaus calmly',
      'Notice steadier sleep and morning clarity',
    ],
  },
  {
    id: 'week4',
    tabLabel: 'Week 4 · Results',
    daysLabel: 'Days 22–30',
    titleEn: 'Lock In Lifestyle Results Beyond Day 30',
    titleAr: 'تثبيت النتائج وبناء أسلوب حياة دائم',
    summary:
      'Finish strong with progress check-ins, waist and energy comparisons, and a flexible long-term maintenance blueprint.',
    milestones: [
      'Review 30-day body, energy, and habit wins',
      'Learn how to reintroduce variety without rebound',
      'Transition smoothly into your ongoing routine',
    ],
  },
];

export interface ChapterTopicCard {
  pages: string;
  titleEn: string;
  titleAr: string;
  scope: string;
}

export const CHAPTER_TOPIC_CARDS: ChapterTopicCard[] = [
  {
    pages: 'Pages 01–05',
    titleEn: 'Keto Foundations & Safety Principles',
    titleAr: 'أساسيات الكيتو وإرشادات السلامة',
    scope: 'How fat adaptation works, who should consult a doctor first, and setting realistic 30-day goals.',
  },
  {
    pages: 'Pages 06–10',
    titleEn: 'Structured Nutrition & Quick Recipes',
    titleAr: 'النظام الغذائي والوصفات السريعة',
    scope: 'Complete weekly frameworks and step-by-step bilingual meal blueprints unlocked inside the PDF.',
  },
  {
    pages: 'Pages 11–14',
    titleEn: 'Bahrain Shopping & Smart Prep Topics',
    titleAr: 'قائمة التسوق في البحرين والتحضير المسبق',
    scope: 'Budget-friendly local supermarket strategies and 60-minute weekly batch prep systems.',
  },
  {
    pages: 'Pages 15–20',
    titleEn: 'Dining Out, Hydration & Progress Trackers',
    titleAr: 'الأكل خارج المنزل والترطيب ومتابعة التقدم',
    scope: 'Restaurant swap frameworks, electrolyte habits, and printable weekly measurement sheets.',
  },
  {
    pages: 'Pages 21–24 · Men',
    titleEn: '30-Day Men’s Conditioning Topics',
    titleAr: 'مواضيع اللياقة ٣٠ يوماً للرجال',
    scope: 'Progressive full-body, upper/lower balance, and cardio conditioning topics inside the guide.',
  },
  {
    pages: 'Pages 21–24 · Women',
    titleEn: '30-Day Women’s Toning & Fitness Topics',
    titleAr: 'مواضيع اللياقة ٣٠ يوماً للنساء',
    scope: 'Joint-friendly sculpting, core stability, and sustainable 30-day conditioning topics.',
  },
];

export interface EbookEdition {
  id: 'digital';
  titleEn: string;
  titleAr: string;
  priceBhd: string;
  numericBhd: number;
  subtitle: string;
  features: string[];
}

export const EBOOK_EDITIONS: EbookEdition[] = [
  {
    id: 'digital',
    titleEn: 'Bilingual Digital eBook',
    titleAr: 'النسخة الرقمية ثنائية اللغة',
    priceBhd: '9.900 BHD',
    numericBhd: 9.9,
    subtitle: 'Instant 24-page interactive PDF (English & Arabic)',
    features: [
      'Complete 24-page KetoLife Bahrain bilingual PDF',
      '7-Day Meal Plan & 4 step-by-step Bahrain recipes',
      'Local Bahrain supermarket shopping list (Lulu, Carrefour, Alosra)',
      'Eating out in Bahrain restaurant ordering guide',
      '30-Day Beginner Workout Plans for Men & Women',
    ],
  },
];

export const GUIDE_FAQS = [
  {
    qEn: 'Can everyone follow keto?',
    qAr: 'هل يمكن للجميع اتباع الكيتو؟',
    aEn: 'Not necessarily. People with certain medical conditions, diabetes treated with glucose-lowering medication, kidney/liver disease, or who are pregnant should consult a qualified healthcare professional first.',
    aAr: 'ليس بالضرورة. بعض الحالات الصحية والأدوية تتطلب استشارة مختص صحي مؤهل قبل البدء.',
  },
  {
    qEn: 'How much weight will I lose in 30 days?',
    qAr: 'كم سأخسر من الوزن خلال ٣٠ يوماً؟',
    aEn: 'There is no guaranteed number. Thirty days builds sustainable habits—results depend on food intake, activity, sleep, starting weight, and consistency.',
    aAr: 'لا توجد كمية مضمونة. تعتمد النتائج على الطعام والنشاط والنوم والوزن الابتدائي وعوامل شخصية أخرى.',
  },
  {
    qEn: 'Can I find all the ingredients easily in Bahrain?',
    qAr: 'هل تتوفر جميع المكونات بسهولة في البحرين؟',
    aEn: 'Yes. Every recipe and the Bahrain Shopping List are built around staples stocked across Manama, Riffa, Muharraq, and Seef supermarkets.',
    aAr: 'نعم، جميع الوصفات وقائمة التسوق مصممة بمكونات متوفرة يومياً في أسواق البحرين.',
  },
  {
    qEn: 'How can buyers in Bahrain and foreign countries pay by QR or USD?',
    qAr: 'كيف يدفع المشتري داخل البحرين ومن خارج البحرين بالدولار أو رمز QR؟',
    aEn: 'Inside Bahrain, scan our BenefitPay QR code or transfer to BisB IBAN (BH28BIBB00100002951057). International buyers can pay in USD via Wise, Remitly, Revolut, or SWIFT wire (BIC: BIBBBHBM) directly to the IBAN, or scan the Global Payment QR. For customer support, message WhatsApp +973 3387 2201. Upload your screenshot to unlock the 24-page PDF immediately.',
    aAr: 'داخل البحرين امسح رمز QR لبنفت باي أو حوّل عبر آيبان بنك البحرين الإسلامي (BH28BIBB00100002951057). ومن خارج البحرين يمكن الدفع بالدولار عبر Wise أو Remitly أو Revolut أو التحويل الدولي SWIFT ثم رفع صورة الإيصال لفتح الكتاب فوراً. للدعم عبر واتساب: 33872201 973+.',
  },
];
