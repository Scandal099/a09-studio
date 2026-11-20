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
 * Замените значения ниже на ваши реальные контакты перед публикацией:
 * - email: рабочий адрес для заявок и запросов по 152-ФЗ / GDPR
 * - TELEGRAM_HANDLE: логин в Telegram без символа "@"
 * - WHATSAPP_NUMBER: укажите номер (например, "79991234567"), чтобы показать WhatsApp
 * - calUrl: ссылка на 15-минутный созвон (EN-версия)
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
      // Подставьте ФИО ИП и ИНН перед публикацией
      entity: "Веб-студия A/09 · ИП на УСН (без НДС)",
      taxNote: "Договор, безнал, ЭДО, NDA",
      operatorNote:
        "Оператор ПДн: Веб-студия A/09 · полные реквизиты ИП указываются в договоре · запросы по данным: hello@a09.studio",
      location: "Москва (UTC+3) · РФ и Европа",
    },
    en: {
      // Fill in registered entity details before production launch
      entity: "A/09 Web Studio",
      taxNote: "B2B contract, EU/INTL invoicing, NDA",
      operatorNote:
        "Data Controller: A/09 Web Studio · registered entity details are stated in the client agreement · privacy inquiries: hello@a09.studio",
      location: "CET (UTC+1) · Remote across Europe",
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
 * Когда появится реальный клиентский проект, поменяйте `status` на `"published"`
 * и заполните опциональные поля:
 *
 * {
 *   id: "01",
 *   status: "published",
 *   formatId: "start",
 *   category: "Клиника",
 *   title: "Основа — имплантология",
 *   terms: "Запущен за 12 дней · 2026",
 *   client: "Клиника «Основа»",
 *   year: "2026",
 *   image: "/cases/osnova.webp",
 *   imageAlt: "Главный экран лендинга клиники Основа",
 *   liveUrl: "https://osnova-clinic.ru",
 *   metrics: [{ label: "Конверсия", value: "6.4%" }, { label: "LCP", value: "0.9s" }],
 *   summary: "Пересобрали оффер и прайс под Директ — стоимость лида снизилась на 34%.",
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
      title: "A/09 — Лендинги и сайты для бизнеса",
      description:
        "Лендинги под ключ от 45\u00A0000\u00A0₽ за 10 дней и сайты под запрос. Договор, ЭДО, аналитика и 100% прав на код.",
    },
    nav: {
      descriptor: "ВЕБ-СТУДИЯ",
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
      kicker: "Лендинги под ключ · сайты под запрос",
      titleLines: ["Лендинги,", "которые приводят", "клиентов."],
      lead: "Малому бизнесу — быстрый запуск под рекламу. Компаниям — чистая система с CRM и аналитикой.",
      primaryCta: "Написать в Telegram",
      secondaryCta: "Оставить заявку",
      metrics: [
        { value: "от 45\u00A0000\u00A0₽", label: "старт" },
        { value: "от 10 дней", label: "запуск" },
        { value: "Договор · 50/50", label: "все права ваши" },
      ],
      visualAlt: "Сложенная металлическая лента — визуальный знак студии A/09",
    },
    formats: {
      eyebrow: "01 / Форматы",
      title: "Что делаем.",
      items: [
        {
          id: "start",
          name: "Лендинг · Старт",
          tagline: "Малому бизнесу под рекламу и заявки",
          price: "от 45\u00A0000\u00A0₽",
          timeline: "10–14 дней",
          details:
            "Поможем с текстами, сделаем мобильную версию, подключим Метрику и заявки в Telegram.",
          tags: ["Тексты и дизайн", "Мобилка + 4G", "Заявки в Telegram"],
        },
        {
          id: "system",
          flagship: true,
          badge: "Флагман",
          name: "Лендинг · Система",
          tagline: "Компаниям и B2B под запуск продукта",
          price: "от 140\u00A0000\u00A0₽",
          timeline: "2–4 недели",
          details:
            "Прототип, дизайн-система в Figma, код на Next.js, CRM и аналитика. Легко растёт в большой сайт.",
          tags: ["Figma + Next.js", "CRM и аналитика", "На вырост"],
        },
        {
          id: "custom",
          badge: "Под запрос",
          name: "Сайт под запрос",
          tagline: "Многостраничник, редизайн или админка",
          price: "от 260\u00A0000\u00A0₽",
          timeline: "от 4 недель",
          details:
            "Индивидуальная архитектура, headless CMS, сохранение SEO и перенос на ваши серверы.",
          tags: ["Headless CMS", "301 SEO-перенос", "Серверы в РФ"],
        },
      ],
      included:
        "В каждом проекте: мобильная версия · скорость < 1.2 сек · аналитика · все исходники ваши",
      ctaLabel: "Обсудить формат",
    },
    work: {
      eyebrow: "02 / Кейсы",
      title: "Стартовые слоты.",
      lead: "Студия новая — выдуманных концептов не держим. Открыты 3 слота на стартовых условиях.",
      slots: [
        {
          id: "01",
          status: "open",
          formatId: "start",
          category: "Малый бизнес",
          title: "Лендинг под рекламу",
          terms: "−15% за кейс · от 38\u00A0250\u00A0₽",
        },
        {
          id: "02",
          status: "open",
          formatId: "system",
          category: "B2B и продукт",
          title: "Запуск направления",
          terms: "Прямая работа основателей · NDA или −15%",
        },
        {
          id: "03",
          status: "open",
          formatId: "custom",
          category: "Редизайн / сайт",
          title: "Обновление под рост",
          terms: "Бесплатный разбор текущего сайта",
        },
      ],
      slotCta: "Занять слот",
      publishedCta: "Открыть сайт",
    },
    statement: {
      kicker: "A/09 · БЕЗ ЛИШНЕГО",
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
          text: "Разбираем задачу, фиксируем цену и срок.",
        },
        {
          number: "02",
          duration: "2–4 дня",
          title: "Прототип",
          text: "Пишем тексты и структуру сами.",
        },
        {
          number: "03",
          duration: "4–6 дней",
          title: "Дизайн",
          text: "Сначала первый экран, затем весь сайт.",
        },
        {
          number: "04",
          duration: "4–6 дней",
          title: "Запуск",
          text: "Код, мобилка, аналитика, все права ваши.",
        },
      ],
      guarantees: [
        { value: "50 / 50", label: "поэтапная оплата" },
        { value: "Договор · ЭДО · NDA", label: "ИП на УСН, без НДС" },
        { value: "14–30 дней", label: "гарантия после запуска" },
      ],
      faqTitle: "Частые вопросы",
      faq: [
        {
          question: "Нет текстов и фото — поможете?",
          answer:
            "Да. Проведём короткое интервью на 30 минут, соберём факты и напишем тексты сами.",
        },
        {
          question: "Смогу ли менять цены и акции сам?",
          answer:
            "Да. Подключим простую админку или внесём мелкие правки по сообщению в Telegram в тот же день.",
        },
        {
          question: "Можно начать с лендинга, а потом расширить?",
          answer:
            "Да. Собираем сайт на компонентах — новые разделы и страницы добавляются без переделки.",
        },
        {
          question: "Кому принадлежат код и домен?",
          answer:
            "На 100% вам. Передаём Git, Figma и все доступы — без арендных платежей и привязки к студии.",
        },
      ],
    },
    contact: {
      eyebrow: "04 / Контакт",
      title: "Обсудим проект?",
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
      subtitle: "Ответим в Telegram или на почту за 1–2 часа в рабочее время.",
      slotPrefix: "Слот",
      clearSlotLabel: "Убрать",
      fields: {
        nameLabel: "Имя",
        namePlaceholder: "Алексей",
        contactLabel: "Telegram, телефон или email",
        contactPlaceholder: "@username или +7 999...",
        serviceLabel: "Формат",
        serviceOptions: [
          "Лендинг · Старт",
          "Лендинг · Система",
          "Сайт под запрос",
          "Пока не решил",
        ],
        briefLabel: "О задаче (необязательно)",
        briefPlaceholder: "Что продаёте и к какой дате нужен сайт?",
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
        body: "Свяжемся за 1–2 часа в рабочие дни (10:00–19:00 МСК).",
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
          body: "Настоящая политика определяет порядок обработки персональных данных пользователей сайта веб-студии A/09 в соответствии с Федеральным законом № 152-ФЗ.",
        },
        {
          heading: "2. Какие данные мы собираем",
          body: "Только сведения из формы заявки: имя, контакт для связи (Telegram, телефон или email), выбранный формат и комментарий, если вы его указали.",
        },
        {
          heading: "3. Цель обработки",
          body: "Данные используются только для ответа по вашему проекту, подготовки оценки и заключения договора. Мы не передаём контакты третьим лицам и не делаем рассылок.",
        },
        {
          heading: "4. Хранение и защита",
          body: "Хранение и обработка данных заявок осуществляются в защищённой базе данных на территории РФ в соответствии с требованиями 152-ФЗ до завершения переписки или отзыва согласия.",
        },
        {
          heading: "5. Удаление данных",
          body: `Для удаления данных напишите на ${studioContact.email} с темой «Удаление данных» — выполним запрос за 3 рабочих дня.`,
        },
      ],
    },
  },

  en: {
    meta: {
      title: "A/09 — Landing Pages & Custom Websites",
      description:
        "High-converting landing pages from €2,200 in 2–4 weeks, plus custom websites on request. Clean Next.js code, Figma & 100% IP.",
    },
    nav: {
      descriptor: "WEB STUDIO",
      links: {
        formats: "Formats",
        work: "Work",
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
      kicker: "Landing pages · custom websites",
      titleLines: ["Landing pages", "built to", "convert."],
      lead: "Fast launches for growing teams. Clean, scalable pages for B2B companies.",
      primaryCta: "Start a project",
      secondaryCta: "Book 15-min call",
      metrics: [
        { value: "From €2,200", label: "start" },
        { value: "2–4 weeks", label: "delivery" },
        { value: "100% IP", label: "code & Figma" },
      ],
      visualAlt: "Folded brushed titanium ribbon — visual mark of A/09 studio",
    },
    formats: {
      eyebrow: "01 / Formats",
      title: "What we build.",
      items: [
        {
          id: "start",
          name: "Launch Landing",
          tagline: "Fast page for paid traffic or a new offer",
          price: "from €2,200",
          timeline: "10–14 days",
          details:
            "Offer structure, responsive code, analytics, lead forms, and full handover.",
          tags: ["Copy & UI", "Mobile-first", "Analytics + forms"],
        },
        {
          id: "system",
          flagship: true,
          badge: "Flagship",
          name: "Landing System",
          tagline: "B2B & SaaS launches built to scale",
          price: "from €4,200",
          timeline: "2–4 weeks",
          details:
            "Messaging prototype, Figma system, Next.js code, CRM & analytics — ready to expand.",
          tags: ["Figma + Next.js", "CRM & tracking", "Modular scale"],
        },
        {
          id: "custom",
          badge: "On request",
          name: "Custom Website",
          tagline: "Multi-page site, redesign, or CMS",
          price: "from €7,500",
          timeline: "4+ weeks",
          details:
            "Custom architecture, headless CMS, safe 301 SEO migration, and team handover.",
          tags: ["Headless CMS", "301 SEO safe", "Full handover"],
        },
      ],
      included:
        "Every build includes: mobile-first UI · < 1.2s load · analytics · 100% code & Figma IP",
      ctaLabel: "Discuss format",
    },
    work: {
      eyebrow: "02 / Work",
      title: "Open slots.",
      lead: "Newly independent — zero fictional concepts. First 3 founding client slots are open.",
      slots: [
        {
          id: "01",
          status: "open",
          formatId: "start",
          category: "Local & Service",
          title: "Paid-search landing",
          terms: "−15% founding rate",
        },
        {
          id: "02",
          status: "open",
          formatId: "system",
          category: "B2B & SaaS",
          title: "Product launch page",
          terms: "Senior hands-on · NDA or −15%",
        },
        {
          id: "03",
          status: "open",
          formatId: "custom",
          category: "Redesign / Site",
          title: "Custom build",
          terms: "Free audit of current site",
        },
      ],
      slotCta: "Claim slot",
      publishedCta: "Visit live site",
    },
    statement: {
      kicker: "A/09 · BUILT FOR CLARITY",
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
          title: "Scope call",
          text: "Align on goals, lock price and timeline.",
        },
        {
          number: "02",
          duration: "Days 2–4",
          title: "Prototype",
          text: "We structure the page and write copy.",
        },
        {
          number: "03",
          duration: "Days 5–9",
          title: "Design",
          text: "Hero concept first, then every screen.",
        },
        {
          number: "04",
          duration: "Days 10–14",
          title: "Launch",
          text: "Clean build, analytics, full Git & Figma.",
        },
      ],
      guarantees: [
        { value: "50 / 50", label: "milestone billing" },
        { value: "Contract & NDA", label: "EU/INTL invoicing" },
        { value: "14–30 days", label: "post-launch support" },
      ],
      faqTitle: "Quick answers",
      faq: [
        {
          question: "No final copy or photos yet?",
          answer:
            "No problem. A 30-minute call gives us the facts to structure the page and write clear copy.",
        },
        {
          question: "Can we edit prices and text ourselves?",
          answer:
            "Yes. We wire a clean headless CMS so marketing updates content without developer tickets.",
        },
        {
          question: "Can a landing page expand into a full site?",
          answer:
            "Yes. We build on modular Figma and React components so new pages plug in cleanly.",
        },
        {
          question: "Who owns the code and domain?",
          answer:
            "100% yours. Full Git repo, Figma files, and hosting access — zero agency lock-in.",
        },
      ],
    },
    contact: {
      eyebrow: "04 / Contact",
      title: "Have a project?",
      sla: "Replies within 24h on business days. Straight to the builders.",
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
      subtitle: "Replies within 24h on business days — straight to the builders.",
      slotPrefix: "Slot",
      clearSlotLabel: "Remove",
      fields: {
        nameLabel: "Name",
        namePlaceholder: "Alex Weber",
        contactLabel: "Email, Telegram, or phone",
        contactPlaceholder: "you@company.com or @handle",
        serviceLabel: "Format",
        serviceOptions: [
          "Launch Landing",
          "Landing System",
          "Custom Website",
          "Not sure yet",
        ],
        briefLabel: "About the project (optional)",
        briefPlaceholder: "What are you launching and by when?",
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
        body: "We'll reply within 24h on business days (Mon–Fri, CET).",
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
          body: "This notice explains how A/09 Web Studio processes personal data submitted via our website under EU GDPR (Art. 6(1)(a) & Art. 6(1)(b)).",
        },
        {
          heading: "2. Data We Collect",
          body: "Only what you submit in the inquiry form: your name, preferred contact (email, Telegram, or phone), selected format, and optional project note.",
        },
        {
          heading: "3. Purpose",
          body: "Used solely to respond to your inquiry, scope a project, or prepare an NDA and contract. We never sell data or send marketing emails.",
        },
        {
          heading: "4. Retention",
          body: "Records are stored securely only as long as required to handle your request and related correspondence, or until you ask us to delete them.",
        },
        {
          heading: "5. Erasure & Rights",
          body: `Email ${studioContact.email} with the subject "Data Deletion Request" to access, export, or erase your data within 3 business days.`,
        },
      ],
    },
  },
};
