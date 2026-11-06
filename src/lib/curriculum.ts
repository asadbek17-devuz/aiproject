export const TRACK_KEYS = [
  "WEB_DEVELOPER",
  "SOFTWARE_ENGINEER",
  "MOBILE_DEVELOPER",
  "CYBERSECURITY",
  "SYSTEM_DESIGN",
  "AI_ENGINEER",
  "MATH_ENGLISH",
] as const;

export type TrackKey = (typeof TRACK_KEYS)[number];

export type CourseKind =
  | "FRONTEND"
  | "BACKEND"
  | "FULLSTACK"
  | "EXAM"
  | "CORE"
  | "MOBILE"
  | "SECURITY"
  | "SYSTEM_DESIGN"
  | "AI"
  | "ENGLISH";

export type CurriculumLesson = {
  title: string;
  summary: string;
};

export type CurriculumCourse = {
  slug: string;
  title: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  kind: CourseKind;
  tracks: TrackKey[];
  lessons: CurriculumLesson[];
};

export type TrackPlan = {
  key: TrackKey;
  title: string;
  shortTitle: string;
  description: string;
  courseSlugs: string[];
};

export const TRACK_PLANS: Record<TrackKey, TrackPlan> = {
  WEB_DEVELOPER: {
    key: "WEB_DEVELOPER",
    title: "Web developer",
    shortTitle: "Web",
    description: "Frontend, backend, fullstack va yakuniy imtihon — ishga tayyor yo'l.",
    courseSlugs: [
      "web-dasturlash-asoslari",
      "backend-asoslari",
      "fullstack-inkubator",
      "yakuniy-imtihon",
    ],
  },
  SOFTWARE_ENGINEER: {
    key: "SOFTWARE_ENGINEER",
    title: "Software engineer",
    shortTitle: "Engineer",
    description: "Algoritmlar, matematika, backend va system design bilan chuqur poydevor.",
    courseSlugs: [
      "web-dasturlash-asoslari",
      "kompyuter-fanlari",
      "backend-asoslari",
      "system-design",
      "fullstack-inkubator",
      "yakuniy-imtihon",
    ],
  },
  MOBILE_DEVELOPER: {
    key: "MOBILE_DEVELOPER",
    title: "Mobile developer",
    shortTitle: "Mobile",
    description: "Web asoslari, React Native, API va mobil loyihani noldan chiqarish.",
    courseSlugs: [
      "web-dasturlash-asoslari",
      "mobil-dasturlash",
      "backend-asoslari",
      "yakuniy-imtihon",
    ],
  },
  CYBERSECURITY: {
    key: "CYBERSECURITY",
    title: "Cybersecurity / ethical hacker",
    shortTitle: "Security",
    description: "Linux, tarmoq, OWASP va himoya — qonuniy ethical hacking yo'li.",
    courseSlugs: [
      "kompyuter-fanlari",
      "kiberxavfsizlik",
      "backend-asoslari",
      "yakuniy-imtihon",
    ],
  },
  SYSTEM_DESIGN: {
    key: "SYSTEM_DESIGN",
    title: "System design",
    shortTitle: "Design",
    description: "Katta tizimlar, ma'lumotlar bazasi, keshlash va arxitektura intervyusi.",
    courseSlugs: [
      "kompyuter-fanlari",
      "backend-asoslari",
      "system-design",
      "fullstack-inkubator",
      "yakuniy-imtihon",
    ],
  },
  AI_ENGINEER: {
    key: "AI_ENGINEER",
    title: "AI engineer",
    shortTitle: "AI",
    description: "Python, ma'lumotlar, LLM va real AI mahsulot yaratish.",
    courseSlugs: [
      "kompyuter-fanlari",
      "ai-muhandisligi",
      "backend-asoslari",
      "yakuniy-imtihon",
    ],
  },
  MATH_ENGLISH: {
    key: "MATH_ENGLISH",
    title: "Matematika va ingliz tili",
    shortTitle: "Math + English",
    description: "IT uchun matematik tafakkur va texnik ingliz tili.",
    courseSlugs: ["kompyuter-fanlari", "it-ingliz-tili"],
  },
};

export function isTrackKey(value: unknown): value is TrackKey {
  return typeof value === "string" && (TRACK_KEYS as readonly string[]).includes(value);
}

export function getTrackPlan(track: TrackKey): TrackPlan {
  return TRACK_PLANS[track];
}

export const CURRICULUM: CurriculumCourse[] = [
  {
    slug: "web-dasturlash-asoslari",
    title: "Frontend asoslari: HTML, CSS, JavaScript",
    description:
      "Noldan ishlaydigan saytgacha: VSCode, Figma, Monkeytype typing, HTML skeleti, matn, havolalar, rasmlar, Flexbox, Grid, responsiv dizayn, JavaScript va portfolio loyiha.",
    level: "BEGINNER",
    kind: "FRONTEND",
    tracks: [
      "WEB_DEVELOPER",
      "SOFTWARE_ENGINEER",
      "MOBILE_DEVELOPER",
      "SYSTEM_DESIGN",
    ],
    lessons: [
      {
        title: "Web olamiga kirish: Figma, VSCode va birinchi sahifa",
        summary:
          "Brauzer qanday ishlaydi, VSCode sozlash, Figma bilan tanishuv, Monkeytype'da typing va birinchi HTML fayl.",
      },
      {
        title: "HTML asoslari: h1, p, havola va rasm",
        summary:
          "html, head, body, h1, h2, p, a va img. Har bir teg sahifada qanday ko'rinishini amalda ko'ramiz.",
      },
      {
        title: "Havola, rasm va ro'yxatlar",
        summary:
          "a, img, alt, ul, ol va li. Nisbiy yo'llar, xavfsiz havolalar va rasmga alt yozish odati.",
      },
      {
        title: "CSS asoslari: rang, shrift va box model",
        summary:
          "Selektor, class, color, background, font-family, margin, padding va border bilan ishlash.",
      },
      {
        title: "Flexbox bilan joylashuv",
        summary:
          "display flex, justify-content, align-items, gap va wrap. Navigatsiya va kartochkalarni tekislash.",
      },
      {
        title: "Grid va zamonaviy layout",
        summary:
          "CSS Grid, ustunlar, auto-fit, minmax va sahifa bo'limlarini tuzish.",
      },
      {
        title: "Responsive dizayn va media query",
        summary:
          "Mobil, planshet va desktop uchun moslashuv. relative birliklar va rasmni moslashtirish.",
      },
      {
        title: "JavaScript asoslari: o'zgaruvchi va funksiya",
        summary:
          "let, const, string, number, boolean, if, function va console.log bilan birinchi mantiq.",
      },
      {
        title: "DOM va eventlar",
        summary:
          "querySelector, textContent, addEventListener va tugma bosilganda sahifani o'zgartirish.",
      },
      {
        title: "Forma va validatsiya",
        summary:
          "input, label, required, pattern va JavaScript bilan forma tekshirish.",
      },
      {
        title: "Portfolio loyiha: struktura va dizayn",
        summary:
          "Figma maketini bo'limlarga ajratish, semantik HTML va CSS bilan shaxsiy sahifa qurish.",
      },
      {
        title: "Portfolio loyiha: JavaScript va yakunlash",
        summary:
          "Menyu, filtr, tema almashtirish va loyihani GitHub Pages'ga chiqarish.",
      },
    ],
  },
  {
    slug: "backend-asoslari",
    title: "Backend asoslari: Node.js, API va PostgreSQL",
    description:
      "Client-server, Node.js, Express, REST API, PostgreSQL, Prisma, autentifikatsiya, fayl yuklash, xavfsizlik va deploy.",
    level: "INTERMEDIATE",
    kind: "BACKEND",
    tracks: [
      "WEB_DEVELOPER",
      "SOFTWARE_ENGINEER",
      "MOBILE_DEVELOPER",
      "CYBERSECURITY",
      "SYSTEM_DESIGN",
      "AI_ENGINEER",
    ],
    lessons: [
      {
        title: "Backend nima va client-server qanday ishlaydi",
        summary:
          "So'rov, javob, HTTP, port va serverning hayotiy sikli. Brauzer ostida nima bo'ladi?",
      },
      {
        title: "Node.js va npm muhiti",
        summary:
          "Runtime, modul, package.json, npm script va birinchi Node server.",
      },
      {
        title: "Express va birinchi API",
        summary:
          "Route, handler, request, response va JSON qaytarish.",
      },
      {
        title: "REST, status code va validatsiya",
        summary:
          "GET, POST, PUT, DELETE, 200/201/400/404/500 va zod bilan kiritmani tekshirish.",
      },
      {
        title: "PostgreSQL va SQL asoslari",
        summary:
          "Jadval, qator, primary key, foreign key, SELECT, INSERT, UPDATE va JOIN.",
      },
      {
        title: "Prisma ORM bilan ma'lumot modeli",
        summary:
          "Schema, migration, relation va type-safe query. CRUD'ni amalda qurish.",
      },
      {
        title: "Auth: session, cookie va parol xavfsizligi",
        summary:
          "Hash, salt, session token, HttpOnly cookie va CSRF'dan himoya.",
      },
      {
        title: "Fayl yuklash va xatolarni boshqarish",
        summary:
          "Multipart form, fayl hajmi, turi, xavfsiz saqlash va markaziy error handler.",
      },
      {
        title: "Deploy va monitoring",
        summary:
          "Environment variable, build, migratsiya, log va health check bilan productionga chiqish.",
      },
    ],
  },
  {
    slug: "fullstack-inkubator",
    title: "Fullstack inkubator: React, Next.js va real loyiha",
    description:
      "React, Next.js App Router, API integratsiya, auth, to'lov, AI va yakuniy fullstack mahsulot.",
    level: "ADVANCED",
    kind: "FULLSTACK",
    tracks: [
      "WEB_DEVELOPER",
      "SOFTWARE_ENGINEER",
      "SYSTEM_DESIGN",
      "AI_ENGINEER",
    ],
    lessons: [
      {
        title: "Fullstack arxitektura va loyiha tanlash",
        summary:
          "Frontend, backend, baza va deploy qatlamlari. Muammoni mahsulotga aylantirish.",
      },
      {
        title: "React: component, props va state",
        summary:
          "Komponent tafakkuri, props, useState, ro'yxat va shartli render.",
      },
      {
        title: "React: effect, form va component bo'linishi",
        summary:
          "useEffect, controlled form, custom hook va qayta ishlatiladigan UI.",
      },
      {
        title: "Next.js App Router va server component",
        summary:
          "Routing, layout, server/client component farqi va ma'lumot yuklash.",
      },
      {
        title: "API integratsiya va server action",
        summary:
          "fetch, cache, error state, loading va server action bilan forma yuborish.",
      },
      {
        title: "Auth va rolga asoslangan himoya",
        summary:
          "Middleware, session, role guard va foydalanuvchi menyusi.",
      },
      {
        title: "To'lov va obuna oqimi",
        summary:
          "Checkout, webhook, status va xavfsiz to'lov holatini boshqarish.",
      },
      {
        title: "AI integratsiya: mentor va avtomatik tekshiruv",
        summary:
          "LLM API, prompt, JSON javob, fallback va xarajatni nazorat qilish.",
      },
      {
        title: "Yakuniy loyiha: test, deploy va taqdimot",
        summary:
          "Test, performance, xavfsizlik, deploy va portfolio uchun taqdimot.",
      },
    ],
  },
  {
    slug: "yakuniy-imtihon",
    title: "Yakuniy imtihon va sertifikat",
    description:
      "Frontend, backend va fullstack bo'yicha amaliy imtihon. Kod, tushuntirish va real topshiriq.",
    level: "ADVANCED",
    kind: "EXAM",
    tracks: [
      "WEB_DEVELOPER",
      "SOFTWARE_ENGINEER",
      "MOBILE_DEVELOPER",
      "CYBERSECURITY",
      "SYSTEM_DESIGN",
      "AI_ENGINEER",
    ],
    lessons: [
      {
        title: "Frontend imtihoni: sahifa qurish",
        summary:
          "Berilgan Figma maket asosida semantik, responsiv va interaktiv sahifa qurish.",
      },
      {
        title: "Backend imtihoni: API va baza",
        summary:
          "CRUD API, validatsiya, autentifikatsiya va ma'lumot modelini amalda yozish.",
      },
      {
        title: "Fullstack imtihoni: yakuniy mahsulot",
        summary:
          "Frontend + API + baza + deploy. Yechimni tushuntirish va himoya qilish.",
      },
    ],
  },
  {
    slug: "kompyuter-fanlari",
    title: "Kompyuter fanlari va matematika",
    description:
      "Algoritm, ma'lumot tuzilmasi, mantiq, algebra va IT uchun matematik tafakkur.",
    level: "BEGINNER",
    kind: "CORE",
    tracks: [
      "SOFTWARE_ENGINEER",
      "CYBERSECURITY",
      "SYSTEM_DESIGN",
      "AI_ENGINEER",
      "MATH_ENGLISH",
    ],
    lessons: [
      {
        title: "Kompyuter qanday hisoblaydi",
        summary:
          "Binary, bit, byte, CPU, xotira va kodning mashina tiliga aylanishi.",
      },
      {
        title: "Algoritm va murakkablik",
        summary:
          "Qadamlar ketma-ketligi, Big O, vaqt va xotira. Oddiy qidiruv misolida.",
      },
      {
        title: "Massiv, obyekt va lug'at",
        summary:
          "Ma'lumot tuzilmalari, indeks, kalit-qiymat va qachon nimani tanlash.",
      },
      {
        title: "Saralash va qidirish",
        summary:
          "Linear search, binary search, bubble sort va real hayotdagi analogiya.",
      },
      {
        title: "Mantiq va boolean algebra",
        summary:
          "AND, OR, NOT, shart, truth table va dasturlashdagi shartlar.",
      },
      {
        title: "Matematik funksiya va grafik",
        summary:
          "f(x), o'zgaruvchi, chiziqli funksiya va kodda funksiya tushunchasi.",
      },
      {
        title: "Ehtimollik va statistika asoslari",
        summary:
          "O'rtacha, median, foiz, ehtimollik va AI/ma'lumotlar uchun ahamiyati.",
      },
      {
        title: "Diskret matematika va kombinatorika",
        summary:
          "To'plam, permutatsiya, kombinatsiya va algoritmda sanash.",
      },
    ],
  },
  {
    slug: "it-ingliz-tili",
    title: "IT uchun ingliz tili",
    description:
      "Texnik atamalar, hujjat o'qish, xato xabarlari, intervyu va jamoaviy muloqot.",
    level: "BEGINNER",
    kind: "ENGLISH",
    tracks: ["MATH_ENGLISH", "WEB_DEVELOPER", "SOFTWARE_ENGINEER"],
    lessons: [
      {
        title: "IT atamalari va talaffuz",
        summary:
          "Frontend, backend, deploy, bug, feature kabi so'zlarning ma'nosi va talaffuzi.",
      },
      {
        title: "Xato xabarini o'qish",
        summary:
          "Error, warning, stack trace, undefined va syntax error'ni inglizchadan tushunish.",
      },
      {
        title: "Hujjat va README o'qish",
        summary:
          "Install, usage, requirement, example bo'limlarini tez o'qish strategiyasi.",
      },
      {
        title: "Git va terminal inglizchasi",
        summary:
          "Commit, branch, merge, pull request, permission denied kabi iboralar.",
      },
      {
        title: "Intervyu savollari",
        summary:
          "Tell me about yourself, explain your project va savollarga qisqa javob.",
      },
      {
        title: "Jamoada yozishma",
        summary:
          "Standup, code review, bug report va muloyim texnik izoh yozish.",
      },
    ],
  },
  {
    slug: "mobil-dasturlash",
    title: "Mobil dasturlash: React Native",
    description:
      "Mobil UI, navigation, API, qurilma imkoniyatlari, test va store'ga chiqarish.",
    level: "INTERMEDIATE",
    kind: "MOBILE",
    tracks: ["MOBILE_DEVELOPER"],
    lessons: [
      {
        title: "Mobil dasturlash va React Native muhiti",
        summary:
          "iOS/Android farqi, Expo, simulator va birinchi ekran.",
      },
      {
        title: "Mobil UI: View, Text, StyleSheet",
        summary:
          "Flexbox asosida mobil ekran, safe area va responsive o'lchamlar.",
      },
      {
        title: "Ro'yxat va navigatsiya",
        summary:
          "FlatList, screen, tab va stack navigation bilan ilova tuzilishi.",
      },
      {
        title: "Forma va qurilma imkoniyatlari",
        summary:
          "TextInput, klaviatura, kamera, rasm tanlash va ruxsatlar.",
      },
      {
        title: "API va offline holat",
        summary:
          "fetch, loading, error, cache va internet yo'qligida xatti-harakat.",
      },
      {
        title: "Auth va push notification",
        summary:
          "Token saqlash, login oqimi va notification ruxsati.",
      },
      {
        title: "Mobil test va performance",
        summary:
          "Test, profiling, rasm optimizatsiyasi va sekin ekranlarni tuzatish.",
      },
      {
        title: "Store'ga chiqarish",
        summary:
          "Build, imzo, version, App Store va Play Store jarayoni.",
      },
    ],
  },
  {
    slug: "kiberxavfsizlik",
    title: "Kiberxavfsizlik va ethical hacking",
    description:
      "Linux, tarmoq, web xavfsizlik, OWASP, CTF va qonuniy himoya ko'nikmalari.",
    level: "INTERMEDIATE",
    kind: "SECURITY",
    tracks: ["CYBERSECURITY"],
    lessons: [
      {
        title: "Ethical hacking va qonuniy chegaralar",
        summary:
          "Ruxsat, scope, javobgarlik va himoyachi tafakkuri.",
      },
      {
        title: "Linux va terminal asoslari",
        summary:
          "Fayl tizimi, permission, process, package va foydali buyruqlar.",
      },
      {
        title: "Tarmoq: IP, DNS, TCP va HTTP",
        summary:
          "Paket qanday yuradi, port, DNS va TLS asoslari.",
      },
      {
        title: "Web xavfsizlik: OWASP Top 10",
        summary:
          "SQL injection, XSS, CSRF, IDOR va broken access control.",
      },
      {
        title: "Autentifikatsiya va parol xavfsizligi",
        summary:
          "Hash, MFA, session, JWT xatolari va brute force himoyasi.",
      },
      {
        title: "Recon va zaiflik qidirish",
        summary:
          "Nmap, directory scan, header tekshirish va ruxsatli audit.",
      },
      {
        title: "CTF va lab amaliyoti",
        summary:
          "Xavfsiz labda zaiflikni topish, isbotlash va tuzatish.",
      },
      {
        title: "Himoya va incident response",
        summary:
          "Log, monitoring, backup, patch va hujumga javob rejasi.",
      },
    ],
  },
  {
    slug: "system-design",
    title: "System design va arxitektura",
    description:
      "Katta tizimlar, scaling, baza tanlovi, cache, queue va intervyu uchun dizayn.",
    level: "ADVANCED",
    kind: "SYSTEM_DESIGN",
    tracks: [
      "SYSTEM_DESIGN",
      "SOFTWARE_ENGINEER",
      "WEB_DEVELOPER",
      "CYBERSECURITY",
      "AI_ENGINEER",
    ],
    lessons: [
      {
        title: "System design nima va qanday o'ylash",
        summary:
          "Talab, cheklov, scale va trade-off. Intervyuda 4 qadamli yondashuv.",
      },
      {
        title: "Vertical va horizontal scaling",
        summary:
          "Server, load balancer, statelesslik va bottleneck topish.",
      },
      {
        title: "Ma'lumotlar bazasi tanlash",
        summary:
          "SQL va NoSQL, indeks, sharding, replication va consistency.",
      },
      {
        title: "Cache strategiyasi",
        summary:
          "Redis, cache hit/miss, TTL, invalidation va stale data.",
      },
      {
        title: "Queue va async ishlash",
        summary:
          "Message queue, worker, retry, idempotency va background job.",
      },
      {
        title: "API dizayni va versioning",
        summary:
          "REST, rate limit, pagination, idempotency key va backward compatibility.",
      },
      {
        title: "Kuzatuvchanlik va ishonchlilik",
        summary:
          "Log, metric, trace, SLA, monitoring va alert.",
      },
      {
        title: "Amaliy dizayn: Instagram yoki Uber",
        summary:
          "Feed, rasm saqlash, notification va real vaqt talablarini loyihalash.",
      },
    ],
  },
  {
    slug: "ai-muhandisligi",
    title: "AI muhandisligi: Python, ML va LLM",
    description:
      "Python, ma'lumot tayyorlash, klassik ML, LLM API, RAG, prompt va AI mahsulot.",
    level: "INTERMEDIATE",
    kind: "AI",
    tracks: ["AI_ENGINEER"],
    lessons: [
      {
        title: "Python va AI muhiti",
        summary:
          "Sintaksis, list, dict, funksiya, virtual environment va notebook.",
      },
      {
        title: "Ma'lumot bilan ishlash",
        summary:
          "CSV, tozalash, feature, train/test va ma'lumot sifati.",
      },
      {
        title: "Klassik ML: regressiya va klassifikatsiya",
        summary:
          "Model, loss, overfitting va metrikalarni sodda misolda tushunish.",
      },
      {
        title: "Neyron tarmoq va embedding",
        summary:
          "Qatlam, weight, activation, embedding va o'xshashlik.",
      },
      {
        title: "LLM API va prompt engineering",
        summary:
          "System prompt, temperature, JSON output va xarajatni boshqarish.",
      },
      {
        title: "RAG: hujjatdan javob",
        summary:
          "Chunk, embedding, vector search va manba bilan javob berish.",
      },
      {
        title: "AI mahsulot arxitekturasi",
        summary:
          "API, queue, fallback, evaluation va foydalanuvchi tajribasi.",
      },
      {
        title: "AI loyiha: mentor yoki klassifikator",
        summary:
          "Model/LLM tanlash, prototip, test va deploy.",
      },
    ],
  },
];

export function curriculumBySlug(slug: string): CurriculumCourse | undefined {
  return CURRICULUM.find((course) => course.slug === slug);
}

export function courseOrderForTrack(track: TrackKey): string[] {
  return TRACK_PLANS[track].courseSlugs;
}

export function totalLessonsForTrack(track: TrackKey): number {
  return TRACK_PLANS[track].courseSlugs.reduce((total, slug) => {
    const course = curriculumBySlug(slug);
    return total + (course?.lessons.length ?? 0);
  }, 0);
}

export function kindForCourseSlug(slug: string): CourseKind {
  if (slug.includes("backend")) return "BACKEND";
  if (slug.includes("fullstack")) return "FULLSTACK";
  if (slug.includes("imtihon")) return "EXAM";
  if (slug.includes("kompyuter")) return "CORE";
  if (slug.includes("mobil")) return "MOBILE";
  if (slug.includes("kiber")) return "SECURITY";
  if (slug.includes("system-design")) return "SYSTEM_DESIGN";
  if (slug.includes("ai-")) return "AI";
  if (slug.includes("ingliz")) return "ENGLISH";
  return "FRONTEND";
}
