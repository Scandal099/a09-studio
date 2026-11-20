export type Lang = "ru" | "en";

export type FormatId = "start" | "system" | "custom";

export interface LegalInfo {
  entity: string;
  taxNote: string;
  operatorNote: string;
  location: string;
}

/**
 * КОНТАКТЫ И РЕКВИЗИТЫ СТУДИИ A/09
 * Замените значения ниже на ваши реальные контакты перед запуском рекламы:
 * - email: ваш рабочий email для заявок и запросов по 152-ФЗ
 * - TELEGRAM_HANDLE: ваш логин в Telegram без символа "@"
 * - WHATSAPP_NUMBER: укажите номер (например, "79991234567"), чтобы показать кнопку WhatsApp
 * - calUrl: ссылка на короткий созвон (для EN-версии, можно оставить пустой)
 */
const TELEGRAM_HANDLE = "a09_studio";
// Укажите реальный номер, например "79991234567", чтобы кнопка WhatsApp появилась на сайте
const WHATSAPP_NUMBER = "";

export const studioContact = {
  email: "hello@a09.studio",
  telegramHandle: TELEGRAM_HANDLE,
  telegramUrl: `https://t.me/${TELEGRAM_HANDLE}`,
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappUrl: WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "",
  calUrl: "https://cal.com/a09-studio/15min",
  legal: {
    ru: {
      // Подставьте ваши ФИО и ИНН самозанятого перед публикацией
      entity: "Студия A/09 · Самозанятый (НПД)",
      taxNote: "Простой договор и официальный чек «Мой налог»",
      operatorNote:
        "Оператор ПДн: Студия A/09 (самозанятый, плательщик НПД) · реквизиты указываются в договоре · запросы по данным: hello@a09.studio",
      location: "Работаем с локальным бизнесом по РФ",
    },
    en: {
      // Fill in your legal details before production launch
      entity: "A/09 Studio · Independent",
      taxNote: "Simple written agreement & payment receipt",
      operatorNote:
        "Data Controller: A/09 Studio · details stated in the project agreement · privacy inquiries: hello@a09.studio",
      location: "Remote · Local & small business landing pages",
    },
  } satisfies Record<Lang, LegalInfo>,
} as const;

export type StudioContact = typeof studioContact;

export function buildTelegramUrl(prefillText?: string): string {
  if (!prefillText) return studioContact.telegramUrl;
  return `${studioContact.telegramUrl}?text=${encodeURIComponent(prefillText)}`;
}

export interface HeroMetric {
  value: string;
  label: string;
}

export interface FormatItem {
  id: FormatId;
  name: string;
  tagline: string;
  price: string;
  timeline: string;
  flagship?: boolean;
  badge?: string;
  details: string;
  tags: [string, string, string];
}

export interface CaseMetric {
  label: string;
  value: string;
}

/**
 * СЛОТЫ ПОРТФОЛИО И РЕАЛЬНЫЕ КЕЙСЫ
 *
 * По умолчанию все 3 слота имеют `status: "open"`.
 * Когда сделаете первый реальный проект, поменяйте `status` на `"published"`
 * и заполните опциональные поля:
 *
 * {
 *   id: "01",
 *   status: "published",
 *   formatId: "system",
 *   category: "Детейлинг",
 *   title: "Студия оклейки авто",
 *   terms: "Запущен за 9 дней · 2026",
 *   client: "FORMA Detailing",
 *   year: "2026",
 *   image: "/cases/detailing.webp",
 *   imageAlt: "Главный экран лендинга детейлинг-студии",
 *   liveUrl: "https://example.ru",
 *   metrics: [{ label: "Запуск", value: "9 дней" }],
 *   summary: "Собрали понятный лендинг с ценами и записью в Telegram прямо с телефона.",
 * }
 */
export interface CaseSlot {
  id: string;
  status: "open" | "published";
  formatId: FormatId;
  category: string;
  title: string;
  terms: string;
  // Поля для опубликованного кейса (status: "published"):
  client?: string;
  year?: string;
  image?: string;
  imageAlt?: string;
  liveUrl?: string;
  metrics?: CaseMetric[];
  summary?: string;
}

export interface ProcessStep {
  number: string;
  duration: string;
  title: string;
  text: string;
}

export interface GuaranteeItem {
  value: string;
  label: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PrivacySection {
  heading: string;
  body: string;
}

export interface SiteContent {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    descriptor: string;
    links: {
      formats: string;
      work: string;
      process: string;
      contact: string;
    };
    cta: string;
    menuOpen: string;
    menuClose: string;
    skipToContent: string;
    langLabel: string;
  };
  hero: {
    kicker: string;
    titleLines: string[];
    lead: string;
    primaryCta: string;
    secondaryCta: string;
    metrics: [HeroMetric, HeroMetric, HeroMetric];
    visualAlt: string;
  };
  formats: {
    eyebrow: string;
    title: string;
    items: [FormatItem, FormatItem, FormatItem];
    included: string;
    ctaLabel: string;
  };
  work: {
    eyebrow: string;
    title: string;
    lead: string;
    slots: CaseSlot[];
    slotCta: string;
    publishedCta: string;
  };
  statement: {
    kicker: string;
    title: string;
    alt: string;
  };
  process: {
    eyebrow: string;
    title: string;
    steps: [ProcessStep, ProcessStep, ProcessStep, ProcessStep];
    guarantees: [GuaranteeItem, GuaranteeItem, GuaranteeItem];
    faqTitle: string;
    faq: [FaqItem, FaqItem, FaqItem, FaqItem];
  };
  contact: {
    eyebrow: string;
    title: string;
    sla: string;
    primaryCta: string;
    secondaryCta: string;
    copyEmail: string;
    emailCopied: string;
    privacyLabel: string;
    privacyHref: string;
    backToTop: string;
    copyright: string;
  };
  briefModal: {
    eyebrow: string;
    title: string;
    subtitle: string;
    slotPrefix: string;
    clearSlotLabel: string;
    fields: {
      nameLabel: string;
      namePlaceholder: string;
      contactLabel: string;
      contactPlaceholder: string;
      serviceLabel: string;
      serviceOptions: string[];
      briefLabel: string;
      briefPlaceholder: string;
      consentPrefix: string;
      consentLink: string;
    };
    submitLabel: string;
    submittingLabel: string;
    closeLabel: string;
    errors: {
      nameRequired: string;
      contactInvalid: string;
      consentRequired: string;
      network: string;
    };
    success: {
      eyebrow: string;
      title: string;
      referenceLabel: string;
      body: string;
      altCta: string;
      doneLabel: string;
    };
  };
  privacyModal: {
    eyebrow: string;
    title: string;
    updated: string;
    operatorLine: string;
    fullPageLabel: string;
    closeLabel: string;
    sections: PrivacySection[];
  };
}

export const content: Record<Lang, SiteContent> = {
  ru: {
    meta: {
      title: "A/09 — Лендинги для локального бизнеса",
      description:
        "Делаем понятные лендинги для малого бизнеса в вашем городе от 25\u00A0000\u00A0₽ за 5–12 дней. Мобильная версия, заявки в Telegram, самозанятость и чек.",
    },
    nav: {
      descriptor: "ЛЕНДИНГИ",
      links: {
        formats: "Форматы",
        work: "Слоты",
        process: "Процесс",
        contact: "Контакт",
      },
      cta: "Написать",
      menuOpen: "Открыть меню",
      menuClose: "Закрыть меню",
      skipToContent: "К содержанию",
      langLabel: "Выбор языка",
    },
    hero: {
      kicker: "Лендинги для локального бизнеса",
      titleLines: ["Лендинги", "для бизнеса", "в вашем городе."],
      lead: "Помогаем локальным студиям, сервисам и мастерам получать заявки с телефона и рекламы.",
      primaryCta: "Написать в Telegram",
      secondaryCta: "Оставить заявку",
      metrics: [
        { value: "от 25\u00A0000\u00A0₽", label: "старт" },
        { value: "5–12 дней", label: "запуск" },
        { value: "Самозанятость", label: "договор и чек" },
      ],
      visualAlt: "Сложенная металлическая лента — визуальный знак A/09",
    },
    formats: {
      eyebrow: "01 / Форматы",
      title: "Что делаем.",
      items: [
        {
          id: "start",
          name: "Лендинг · Визитка",
          tagline: "Для частного мастера или одной услуги в городе",
          price: "от 25\u00A0000\u00A0₽",
          timeline: "5–7 дней",
          details:
            "4–5 понятных экранов: чем занимаетесь, цены, примеры работ и кнопка записи в Telegram или по телефону.",
          tags: ["Мобильная версия", "Заявки в Telegram", "Готов за неделю"],
        },
        {
          id: "system",
          flagship: true,
          badge: "Основной",
          name: "Лендинг · Под рекламу",
          tagline: "Для локального бизнеса: сервис, студия, клиника, ремонт",
          price: "от 45\u00A0000\u00A0₽",
          timeline: "7–12 дней",
          details:
            "Поможем с текстами, сделаем чистый дизайн под телефон, подключим Яндекс.Метрику и заявки сразу в Telegram.",
          tags: ["Помощь с текстами", "Яндекс.Метрика", "Заявки в Telegram"],
        },
        {
          id: "custom",
          badge: "Обновление",
          name: "Редизайн лендинга",
          tagline: "Если старый сайт устарел и неудобен на телефоне",
          price: "от 35\u00A0000\u00A0₽",
          timeline: "7–10 дней",
          details:
            "Пересоберём ваш одностраничник с нуля: понятная структура, современный вид и быстрая загрузка на мобильном.",
          tags: ["Новый дизайн", "Скорость на 4G", "Перенос на домен"],
        },
      ],
      included:
        "В каждом лендинге: мобильная версия · быстрая загрузка · заявки в Telegram · все файлы и доступы ваши",
      ctaLabel: "Обсудить формат",
    },
    work: {
      eyebrow: "02 / Кейсы",
      title: "Стартовые слоты.",
      lead: "Студия молодая — выдуманных кейсов не держим. Берём первые 3 локальных проекта на стартовых условиях.",
      slots: [
        {
          id: "01",
          status: "open",
          formatId: "system",
          category: "Авто и ремонт",
          title: "Детейлинг, автосервис, ремонт",
          terms: "−15% за кейс · от 38\u00A0250\u00A0₽",
        },
        {
          id: "02",
          status: "open",
          formatId: "start",
          category: "Бьюти и мастера",
          title: "Салон, барбершоп, частный мастер",
          terms: "−15% за кейс · от 21\u00A0250\u00A0₽",
        },
        {
          id: "03",
          status: "open",
          formatId: "custom",
          category: "Локальный бизнес",
          title: "Обновление старого лендинга",
          terms: "Бесплатный разбор текущего сайта",
        },
      ],
      slotCta: "Занять слот",
      publishedCta: "Открыть сайт",
    },
    statement: {
      kicker: "A/09 · ДЛЯ ЛОКАЛЬНОГО БИЗНЕСА",
      title: "Понятно с телефона за 5 секунд.",
      alt: "Трафарет A/09 на бетонной стене",
    },
    process: {
      eyebrow: "03 / Процесс",
      title: "Как работаем.",
      steps: [
        {
          number: "01",
          duration: "1 день",
          title: "Созвон",
          text: "Обсуждаем услуги, фиксируем цену и срок.",
        },
        {
          number: "02",
          duration: "2–3 дня",
          title: "Структура",
          text: "Помогаем с текстами и порядком блоков.",
        },
        {
          number: "03",
          duration: "3–4 дня",
          title: "Дизайн",
          text: "Сначала первый экран, затем весь сайт.",
        },
        {
          number: "04",
          duration: "2–4 дня",
          title: "Запуск",
          text: "Вёрстка, мобилка, заявки в Telegram.",
        },
      ],
      guarantees: [
        { value: "50 / 50", label: "поэтапная оплата" },
        { value: "Самозанятость", label: "простой договор и чек" },
        { value: "14 дней", label: "гарантия после запуска" },
      ],
      faqTitle: "Частые вопросы",
      faq: [
        {
          question: "Нет готовых текстов и фото — справимся?",
          answer:
            "Да. Созвонимся на 20–30 минут, сами соберём тексты из ваших ответов и подскажем, что просто снять на телефон.",
        },
        {
          question: "Смогу ли потом поменять цены или акцию?",
          answer:
            "Да. Просто напишите нам в Telegram — мелкие правки цен, акций и контактов вносим быстро и без лишней волокиты.",
        },
        {
          question: "Как проходит оплата и какие документы?",
          answer:
            "Работаем официально по самозанятости: 50% до старта, 50% после приёмки. Подпишем простой договор и выдадим официальный чек из «Мой налог».",
        },
        {
          question: "Кому принадлежат сайт и домен?",
          answer:
            "На 100% вам. Домен оформляется на вас, отдаём все файлы и доступы — без ежемесячной аренды и привязки к нам.",
        },
      ],
    },
    contact: {
      eyebrow: "04 / Контакт",
      title: "Обсудим сайт?",
      sla: "Отвечаем в Telegram за 1–2 часа. Без навязчивых звонков.",
      primaryCta: "Написать в Telegram",
      secondaryCta: "Оставить заявку",
      copyEmail: "Скопировать email",
      emailCopied: "Скопировано",
      privacyLabel: "Политика ПДн",
      privacyHref: "/privacy",
      backToTop: "Наверх",
      copyright: "© 2026 A/09",
    },
    briefModal: {
      eyebrow: "Заявка",
      title: "Оставьте контакт.",
      subtitle: "Напишем в Telegram или на почту за 1–2 часа в рабочее время.",
      slotPrefix: "Слот",
      clearSlotLabel: "Убрать",
      fields: {
        nameLabel: "Имя",
        namePlaceholder: "Артём",
        contactLabel: "Telegram, телефон или email",
        contactPlaceholder: "@username или +7 999...",
        serviceLabel: "Формат",
        serviceOptions: [
          "Лендинг · Визитка",
          "Лендинг · Под рекламу",
          "Редизайн лендинга",
          "Пока не решил",
        ],
        briefLabel: "О бизнесе (необязательно)",
        briefPlaceholder: "Чем занимаетесь и в каком городе?",
        consentPrefix: "Согласен с ",
        consentLink: "Политикой ПДн (152-ФЗ)",
      },
      submitLabel: "Отправить заявку",
      submittingLabel: "Отправляем...",
      closeLabel: "Закрыть",
      errors: {
        nameRequired: "Укажите имя.",
        contactInvalid: "Укажите Telegram, телефон или email.",
        consentRequired: "Подтвердите согласие на обработку данных.",
        network: "Не удалось отправить. Попробуйте ещё раз или напишите в Telegram.",
      },
      success: {
        eyebrow: "Принято",
        title: "Заявка отправлена.",
        referenceLabel: "Номер",
        body: "Напишем за 1–2 часа в рабочие дни (10:00–19:00 МСК).",
        altCta: "Написать сразу в Telegram",
        doneLabel: "Готово",
      },
    },
    privacyModal: {
      eyebrow: "152-ФЗ",
      title: "Политика обработки ПДн",
      updated: "Редакция 2026 года",
      operatorLine: studioContact.legal.ru.operatorNote,
      fullPageLabel: "Открыть полностью",
      closeLabel: "Закрыть",
      sections: [
        {
          heading: "1. Общие положения",
          body: "Настоящая политика определяет порядок обработки персональных данных пользователей сайта A/09 в соответствии с Федеральным законом № 152-ФЗ.",
        },
        {
          heading: "2. Какие данные собираются",
          body: "Только сведения из формы заявки: имя, контакт для связи (Telegram, телефон или email), выбранный формат и комментарий, если вы его указали.",
        },
        {
          heading: "3. Цель обработки",
          body: "Данные используются только для ответа по вашему сайту, оценки стоимости и подготовки простого договора. Контакты не передаются третьим лицам и не используются для рассылок.",
        },
        {
          heading: "4. Хранение и защита",
          body: "Данные заявок хранятся ровно столько, сколько нужно для переписки и работы по проекту, либо до вашего запроса на удаление.",
        },
        {
          heading: "5. Удаление данных",
          body: `Для удаления данных напишите на ${studioContact.email} с темой «Удаление данных» — запрос будет выполнен за 3 рабочих дня.`,
        },
      ],
    },
  },

  en: {
    meta: {
      title: "A/09 — Landing Pages for Local Businesses",
      description:
        "Clear, mobile-first landing pages for local businesses and independent specialists from €390 in 5–12 days.",
    },
    nav: {
      descriptor: "LANDING PAGES",
      links: {
        formats: "Formats",
        work: "Slots",
        process: "Process",
        contact: "Contact",
      },
      cta: "Start a project",
      menuOpen: "Open menu",
      menuClose: "Close menu",
      skipToContent: "Skip to content",
      langLabel: "Language",
    },
    hero: {
      kicker: "Landing pages for local businesses",
      titleLines: ["Landing pages", "for local", "businesses."],
      lead: "Helping local studios, shops, and independent specialists get inquiries from mobile and ads.",
      primaryCta: "Start a project",
      secondaryCta: "Book 15-min call",
      metrics: [
        { value: "From €390", label: "start" },
        { value: "5–12 days", label: "launch" },
        { value: "50 / 50", label: "simple agreement" },
      ],
      visualAlt: "Folded brushed titanium ribbon — visual mark of A/09",
    },
    formats: {
      eyebrow: "01 / Formats",
      title: "What we build.",
      items: [
        {
          id: "start",
          name: "Starter Landing",
          tagline: "For an independent specialist or single local service",
          price: "from €390",
          timeline: "5–7 days",
          details:
            "4–5 focused sections: what you offer, pricing, examples of work, and one-tap booking.",
          tags: ["Mobile-first", "Instant inquiries", "Ready in 1 week"],
        },
        {
          id: "system",
          flagship: true,
          badge: "Main",
          name: "Ad-Ready Landing",
          tagline: "For local services running ads or Google/Maps traffic",
          price: "from €690",
          timeline: "7–12 days",
          details:
            "Help shaping the copy, crisp mobile layout, basic analytics setup, and instant Telegram or email leads.",
          tags: ["Copy help", "Analytics setup", "Fast 4G load"],
        },
        {
          id: "custom",
          badge: "Refresh",
          name: "Landing Redesign",
          tagline: "When an old one-pager looks dated or breaks on phones",
          price: "from €550",
          timeline: "7–10 days",
          details:
            "Rebuild your single-page site from scratch: clearer hierarchy, modern look, and fast mobile speed.",
          tags: ["Fresh layout", "Mobile speed", "Domain setup"],
        },
      ],
      included:
        "Every landing page includes: mobile version · fast loading · instant inquiry form · 100% files & access yours",
      ctaLabel: "Discuss format",
    },
    work: {
      eyebrow: "02 / Work",
      title: "Open slots.",
      lead: "Newly independent — zero fictional concepts. First 3 local business slots are open at founding rates.",
      slots: [
        {
          id: "01",
          status: "open",
          formatId: "system",
          category: "Auto & Home",
          title: "Detailing, repair, local trades",
          terms: "−15% founding rate",
        },
        {
          id: "02",
          status: "open",
          formatId: "start",
          category: "Beauty & Care",
          title: "Salon, barbershop, solo specialist",
          terms: "−15% founding rate",
        },
        {
          id: "03",
          status: "open",
          formatId: "custom",
          category: "Local Business",
          title: "Old landing page refresh",
          terms: "Free review of your current page",
        },
      ],
      slotCta: "Claim slot",
      publishedCta: "Visit live site",
    },
    statement: {
      kicker: "A/09 · FOR LOCAL BUSINESS",
      title: "Clear on mobile in 5 seconds.",
      alt: "A/09 stencil painted on architectural concrete",
    },
    process: {
      eyebrow: "03 / Process",
      title: "How we work.",
      steps: [
        {
          number: "01",
          duration: "Day 1",
          title: "Quick call",
          text: "Discuss your service, lock price and date.",
        },
        {
          number: "02",
          duration: "Days 2–3",
          title: "Structure",
          text: "We help shape clear copy and sections.",
        },
        {
          number: "03",
          duration: "Days 4–7",
          title: "Design",
          text: "Approve the hero first, then the rest.",
        },
        {
          number: "04",
          duration: "Days 8–12",
          title: "Launch",
          text: "Mobile build, lead form, full handover.",
        },
      ],
      guarantees: [
        { value: "50 / 50", label: "milestone payment" },
        { value: "Simple terms", label: "written agreement & receipt" },
        { value: "14 days", label: "post-launch fixes" },
      ],
      faqTitle: "Quick answers",
      faq: [
        {
          question: "No final copy or professional photos yet?",
          answer:
            "No problem. A 25-minute call gives us the facts to write clear copy, plus simple tips for phone photos.",
        },
        {
          question: "Can I update prices or offers later?",
          answer:
            "Yes. Just message us directly — small price or contact edits are updated quickly without hassle.",
        },
        {
          question: "How do payment and paperwork work?",
          answer:
            "50% upfront to start, 50% after approval before launch, backed by a plain written agreement and receipt.",
        },
        {
          question: "Who owns the website and domain?",
          answer:
            "100% yours. Your domain stays under your name and all source files are handed over with zero lock-in.",
        },
      ],
    },
    contact: {
      eyebrow: "04 / Contact",
      title: "Need a landing page?",
      sla: "Replies within 24h on business days. Direct message, no sales pitch.",
      primaryCta: "Start a project",
      secondaryCta: "Book 15-min call",
      copyEmail: "Copy email",
      emailCopied: "Copied",
      privacyLabel: "Privacy Notice",
      privacyHref: "/privacy#en-privacy",
      backToTop: "Back to top",
      copyright: "© 2026 A/09",
    },
    briefModal: {
      eyebrow: "Inquiry",
      title: "Leave your contact.",
      subtitle: "Direct reply within 24h on business days.",
      slotPrefix: "Slot",
      clearSlotLabel: "Remove",
      fields: {
        nameLabel: "Name",
        namePlaceholder: "Alex",
        contactLabel: "Email, Telegram, or phone",
        contactPlaceholder: "you@domain.com or @handle",
        serviceLabel: "Format",
        serviceOptions: [
          "Starter Landing",
          "Ad-Ready Landing",
          "Landing Redesign",
          "Not sure yet",
        ],
        briefLabel: "About your business (optional)",
        briefPlaceholder: "What service do you offer and in which city?",
        consentPrefix: "I agree to the ",
        consentLink: "Privacy Notice (GDPR)",
      },
      submitLabel: "Send inquiry",
      submittingLabel: "Sending...",
      closeLabel: "Close",
      errors: {
        nameRequired: "Enter your name.",
        contactInvalid: "Enter a valid email, Telegram, or phone.",
        consentRequired: "Confirm data processing consent.",
        network: "Could not send. Retry or email hello@a09.studio.",
      },
      success: {
        eyebrow: "Received",
        title: "Inquiry sent.",
        referenceLabel: "Ref",
        body: "We'll reply within 24h on business days.",
        altCta: "Book a 15-min call directly",
        doneLabel: "Done",
      },
    },
    privacyModal: {
      eyebrow: "GDPR",
      title: "Privacy Notice",
      updated: "Updated 2026",
      operatorLine: studioContact.legal.en.operatorNote,
      fullPageLabel: "Open full page",
      closeLabel: "Close",
      sections: [
        {
          heading: "1. Controller & Scope",
          body: "This notice explains how A/09 Studio processes personal data submitted via our website under EU GDPR (Art. 6(1)(a) & Art. 6(1)(b)).",
        },
        {
          heading: "2. Data Collected",
          body: "Only what you submit in the inquiry form: your name, preferred contact (email, Telegram, or phone), selected format, and optional note.",
        },
        {
          heading: "3. Purpose",
          body: "Used solely to reply about your landing page, confirm pricing, and prepare a simple project agreement. Data is never sold or used for spam.",
        },
        {
          heading: "4. Retention",
          body: "Records are kept only as long as needed to handle your inquiry and project, or until you ask for deletion.",
        },
        {
          heading: "5. Erasure & Rights",
          body: `Email ${studioContact.email} with the subject "Data Deletion Request" to access or erase your data within 3 business days.`,
        },
      ],
    },
  },
};
