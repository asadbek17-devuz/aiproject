import "dotenv/config";
import { PrismaClient, type Prisma } from "@prisma/client";
import { hashPassword } from "../src/server/auth/password";
import {
  lessonScriptSchema,
  type LessonScriptInput,
} from "../src/server/ai/lesson-script.schema";

const db = new PrismaClient();

function daysFromNow(days: number, hour = 13): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

const lesson1Script: LessonScriptInput = {
  title: "Web olamiga kirish: Figma, VSCode va birinchi sahifa",
  summary:
    "O'quv rejasi, veb-sayt qanday ishlashi, Figma, VSCode, GitHub va birinchi loyihani noldan sozlash.",
  language: "uz",
  level: "BEGINNER",
  segments: [
    {
      type: "intro",
      title: "Kirish",
      durationMin: 3,
      steps: [
        {
          id: "l1-intro-1",
          title: "Kursda qanday o'rganamiz",
          narration:
            "Bu kursda biz shunchaki kod yozmaymiz, balki haqiqiy loyiha yaratishni o'rganamiz. Har dars 20 daqiqa nazariya, 20 daqiqa amaliyot va 20 daqiqa savol-javobdan iborat. Siz har bosqichda AI mentordan so'rab, tushunmagan joyingizni chuqurlashtirishingiz mumkin. Eng muhimi, videoni ko'rib qo'ymang: har bir kodni o'z qo'lingiz bilan yozing.",
          boardActions: [
            { type: "heading", text: "1-dars: Web olamiga kirish" },
            {
              type: "text",
              text: "Kurs formati: 20 daqiqa nazariya, 20 daqiqa amaliyot, 20 daqiqa savol-javob va uyga vazifa.",
            },
            {
              type: "note",
              text: "Qoida: har bir kodni o'zingiz yozing. Xato qilish — o'rganishning eng tez yo'li.",
              tone: "tip",
            },
            {
              type: "table",
              headers: ["Bosqich", "Nima qilamiz"],
              rows: [
                ["Nazariya", "Tushunchani doskada ko'ramiz"],
                ["Amaliyot", "Figma va VSCode'da o'zimiz quramiz"],
                ["Savol-javob", "AI mentor bilan mustahkamlaymiz"],
              ],
            },
          ],
        },
        {
          id: "l1-intro-2",
          scene: "teaching",
          pose: "point-board",
          expression: "smile",
          lookAt: "board",
          focus: 1,
          title: "Veb-sayt qanday ishlaydi",
          narration:
            "Siz brauzerga manzil yozganingizda, brauzer serverga so'rov yuboradi. Server javob qaytaradi, brauzer esa HTML, CSS va JavaScriptni o'qib, sahifani chizadi. HTML — skelet, CSS — ko'rinish, JavaScript — harakat. Frontend foydalanuvchi ko'radigan qism, backend esa serverdagi mantiq va ma'lumotlar bazasi.",
          boardActions: [
            { type: "heading", text: "Veb-sayt qanday ishlaydi?" },
            {
              type: "diagram",
              mermaid:
                "flowchart LR\n  A[Brauzer] -->|so'rov| B[Server]\n  B --> C[(Ma'lumotlar bazasi)]\n  B -->|HTML, CSS, JS| A",
              caption: "Brauzer va server muloqoti",
            },
            {
              type: "table",
              headers: ["Texnologiya", "Vazifasi"],
              rows: [
                ["HTML", "Sahifa skeleti va kontent"],
                ["CSS", "Rang, shrift va joylashuv"],
                ["JavaScript", "Interaktivlik va mantiq"],
              ],
            },
            {
              type: "note",
              text: "Frontend — brauzerdagi qism. Backend — serverdagi ko'rinmas qism.",
              tone: "info",
            },
          ],
        },
        {
          id: "l1-intro-3",
          focus: 1,
          title: "Bizning vositalar",
          narration:
            "Bugun biz beshta asosiy vosita bilan tanishamiz. Figma'da dizayn chizamiz, VSCode'da kod yozamiz, Chrome'da natijani tekshiramiz, GitHub'da loyihani saqlaymiz va terminalda buyruqlarni bajaramiz. Bu vositalar sizning ish stolingiz bo'ladi. Avval ularni o'rnatib, sozlab olamiz, keyin birinchi sahifani yozamiz.",
          boardActions: [
            { type: "heading", text: "Ish stolimiz" },
            {
              type: "table",
              headers: ["Vosita", "Nima uchun?"],
              rows: [
                ["Figma", "Dizayn va maket chizish"],
                ["VSCode", "Kod yozish va loyihani boshqarish"],
                ["Chrome", "Natijani tekshirish va xatolarni ko'rish"],
                ["GitHub", "Loyihani saqlash va ulashish"],
                ["Terminal", "Buyruqlar va Git bilan ishlash"],
              ],
            },
            {
              type: "note",
              text: "Bugungi maqsad: barcha vositalarni sozlash va brauzerda ochiladigan birinchi sahifani yaratish.",
              tone: "tip",
            },
          ],
        },
      ],
    },
    {
      type: "explain",
      title: "Nazariya",
      durationMin: 12,
      steps: [
        {
          id: "l1-explain-1",
          focus: 2,
          title: "Figma nima va nega kerak?",
          narration:
            "Figma — brauzerda ishlaydigan dizayn vositasi. Unda saytning ko'rinishini kod yozishdan oldin chizamiz. Frame — sahifa o'lchami, layer — har bir element, component — qayta ishlatiladigan blok, prototype — tugmalar qanday ishlashini ko'rsatadi. Figma'da chizilgan maket keyin kodga aylanadi, shuning uchun dizayn va kod bir xil tuzilishga ega bo'ladi.",
          boardActions: [
            { type: "heading", text: "Figma: dizayndan kodga" },
            {
              type: "text",
              text: "Figma'da avval maket chizamiz, keyin uni HTML va CSS bilan jonlantiramiz.",
            },
            {
              type: "table",
              headers: ["Atama", "Ma'nosi"],
              rows: [
                ["Frame", "Sahifa yoki blok o'lchami"],
                ["Layer", "Har bir matn, rasm yoki shakl"],
                ["Component", "Qayta ishlatiladigan tugma yoki karta"],
                ["Prototype", "Tugmalar va o'tishlarni sinash"],
              ],
            },
            {
              type: "note",
              text: "Bepul reja boshlash uchun yetarli. figma.com saytida ro'yxatdan o'tamiz.",
              tone: "info",
            },
          ],
        },
        {
          id: "l1-explain-2",
          title: "Figma'da ro'yxatdan o'tish va birinchi frame",
          narration:
            "Brauzerda figma.com saytini oching va Sign up tugmasini bosing. Google yoki email bilan ro'yxatdan o'ting. Yangi Design file yarating, so'ng F tugmasi bilan Frame tanlang. O'ng panelda 1440 va 900 o'lchamini kiriting, frame nomini Portfolio deb qo'ying. Endi ichiga matn va to'rtburchak qo'shib, sahifangizning eskizini chizing.",
          boardActions: [
            { type: "heading", text: "Figma'da birinchi qadam" },
            {
              type: "table",
              headers: ["Qadam", "Amal"],
              rows: [
                ["1", "figma.com → Sign up"],
                ["2", "New design file"],
                ["3", "F tugmasi → Frame"],
                ["4", "O'lcham: 1440 × 900"],
                ["5", "Nom: Portfolio"],
              ],
            },
            {
              type: "note",
              text: "Frame — bu sizning sahifangiz. Ichidagi hamma narsa shu frame ichida turadi.",
              tone: "tip",
            },
          ],
        },
        {
          id: "l1-explain-3",
          focus: 1,
          title: "VSCode'ni o'rnatish",
          narration:
            "Kod yozish uchun code.visualstudio.com saytidan VSCode'ni yuklab oling. Windows, macOS va Linux uchun versiyalar bor. O'rnatishda Next tugmalarini bosing va oxirida Open VSCode tugmasini tanlang. VSCode bepul va eng ko'p ishlatiladigan muharrir, chunki kengaytmalar bilan HTML, CSS, JavaScript va Git'ni bitta joyda boshqaradi.",
          boardActions: [
            { type: "heading", text: "VSCode o'rnatish" },
            {
              type: "text",
              text: "Manba: code.visualstudio.com → Download → operatsion tizimingizni tanlang.",
            },
            {
              type: "table",
              headers: ["Kengaytma", "Vazifasi"],
              rows: [
                ["Live Server", "Sahifani avtomatik yangilab ko'rsatadi"],
                ["Prettier", "Kodni chiroyli formatlaydi"],
                ["ESLint", "Xatolarni oldindan ko'rsatadi"],
                ["GitLens", "Git tarixini ko'rish"],
              ],
            },
            {
              type: "note",
              text: "Kengaytmalarni Extensions panelidan (Ctrl+Shift+X) o'rnating.",
              tone: "tip",
            },
          ],
        },
        {
          id: "l1-explain-4",
          focus: 1,
          title: "VSCode'ni sozlash",
          narration:
            "VSCode'da Ctrl+, tugmasi bilan Settings'ni oching. Auto Save'ni afterDelay qilib qo'ying, Format On Save'ni yoqing, shrift o'lchamini 15 ga, tab o'lchamini 2 ga sozlang. Bu sozlamalar kodni har safar qo'lda saqlamaslik va bir xil uslubda yozish uchun kerak. Terminalni Ctrl+` bilan ochishni ham o'rganib oling.",
          boardActions: [
            { type: "heading", text: "VSCode sozlamalari" },
            {
              type: "code",
              language: "json",
              code: '{\n  "files.autoSave": "afterDelay",\n  "editor.formatOnSave": true,\n  "editor.fontSize": 15,\n  "editor.tabSize": 2\n}',
              highlightLines: [2, 3, 4],
              caption: "settings.json",
            },
            {
              type: "note",
              text: "Ctrl+, — sozlamalar. Ctrl+` — terminal. Ctrl+S — saqlash.",
              tone: "info",
            },
          ],
        },
        {
          id: "l1-explain-5",
          focus: 1,
          title: "Loyiha papkasi va fayl tuzilishi",
          narration:
            "Har bir loyiha uchun alohida papka ochamiz. Ichida index.html — asosiy sahifa, styles.css — uslublar, script.js — JavaScript va assets papkasi — rasmlar uchun. Fayl nomlarida bo'sh joy va katta harf ishlatmang, chunki serverlarda muammo bo'ladi. Terminalda mkdir portfolio buyrug'i bilan papka yaratib, VSCode'da Open Folder qiling.",
          boardActions: [
            { type: "heading", text: "Loyiha tuzilishi" },
            {
              type: "code",
              language: "bash",
              code: "portfolio/\n├── index.html\n├── styles.css\n├── script.js\n└── assets/\n    └── images/",
              highlightLines: [2, 3, 4],
              caption: "Loyiha papkasi",
            },
            {
              type: "text",
              text: "index.html — sahifa, styles.css — dizayn, script.js — interaktivlik, assets — rasmlar.",
            },
            {
              type: "note",
              text: "Fayl nomlari kichik harfda va bo'sh joysiz bo'lsin: index.html, styles.css.",
              tone: "warning",
            },
          ],
        },
        {
          id: "l1-explain-6",
          focus: 1,
          title: "GitHub'ga ro'yxatdan o'tish va Git sozlash",
          narration:
            "GitHub'da ro'yxatdan o'tish uchun github.com saytiga kirib, Sign up tugmasini bosing. Email, parol va foydalanuvchi nomini kiriting. Keyin Git'ni o'rnatib, terminalda ismingiz va emailingizni sozlang. Git loyihangizning tarixini saqlaydi, GitHub esa uni bulutga yuklaydi. Shunday qilib, kompyuteringiz buzilsa ham loyiha yo'qolmaydi.",
          boardActions: [
            { type: "heading", text: "GitHub va Git" },
            {
              type: "code",
              language: "bash",
              code: 'git config --global user.name "Ismingiz"\ngit config --global user.email "email@example.com"\ngit init\ngit add .\ngit commit -m "Birinchi commit"',
              highlightLines: [1, 2, 4, 5],
              caption: "Git asosiy buyruqlari",
            },
            {
              type: "note",
              text: "Parol va maxfiy kalitlarni hech qachon GitHub'ga yuklamang.",
              tone: "warning",
            },
          ],
        },
        {
          id: "l1-explain-7",
          pose: "point-board",
          focus: 1,
          title: "Birinchi HTML sahifa",
          narration:
            "Endi index.html faylini yaratamiz. Har bir HTML hujjat doctype bilan boshlanadi, keyin html, head va body keladi. Head ichida title va viewport, body ichida esa foydalanuvchi ko'radigan kontent bo'ladi. Live Server'ni ishga tushirsangiz, brauzer sahifani avtomatik ochadi va har saqlaganingizda yangilaydi.",
          boardActions: [
            { type: "heading", text: "Birinchi sahifa" },
            {
              type: "code",
              language: "html",
              code: '<!doctype html>\n<html lang="uz">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>Mening portfoliom</title>\n    <link rel="stylesheet" href="styles.css" />\n  </head>\n  <body>\n    <header>Salom, men Azizaman</header>\n    <main>Bu mening birinchi sahifam.</main>\n    <footer>© 2026</footer>\n  </body>\n</html>',
              highlightLines: [4, 5, 6, 7],
              caption: "index.html",
            },
            {
              type: "note",
              text: "Faylni saqlang, index.html ustida o'ng tugma → Open with Live Server.",
              tone: "tip",
            },
          ],
        },
      ],
    },
    {
      type: "demo",
      title: "Namuna",
      durationMin: 5,
      steps: [
        {
          id: "l1-demo-1",
          scene: "coding",
          pose: "explain",
          expression: "neutral",
          lookAt: "laptop",
          focus: 1,
          code: {
            file: "index.html",
            language: "html",
            content:
              '<body>\n  <header class="site-header">\n    <h1>Aziza Karimova</h1>\n    <p>Frontend dasturchi</p>\n  </header>\n  <main class="site-main">\n    <section class="about">Men veb-dasturlashni o\'rganyapman.</section>\n  </main>\n  <footer class="site-footer">© 2026</footer>\n</body>',
            typing: "type",
            highlightLines: [2, 6, 9],
            run: true,
          },
          title: "Figma maketini HTML skeletiga aylantiramiz",
          narration:
            "Figma'dagi Portfolio frame'ini eslaymiz: yuqorida header, o'rtada main, pastda footer. Xuddi shu tuzilishni HTML'da yozamiz. Har bir blokga class beramiz, chunki keyin CSS'da ularni tanlash oson bo'ladi. Diqqat qiling: dizayndagi tartib kodda ham bir xil tartibda yoziladi.",
          boardActions: [
            { type: "heading", text: "Figma → HTML" },
            {
              type: "code",
              language: "html",
              code: '<body>\n  <header class="site-header">\n    <h1>Aziza Karimova</h1>\n    <p>Frontend dasturchi</p>\n  </header>\n  <main class="site-main">\n    <section class="about">Men veb-dasturlashni o\'rganyapman.</section>\n  </main>\n  <footer class="site-footer">© 2026</footer>\n</body>',
              highlightLines: [2, 6, 9],
              caption: "Semantik tuzilish",
            },
            {
              type: "note",
              text: "header, main va footer — sahifaning mantiqiy bo'laklari. Ularni div o'rniga ishlatsangiz, kod tushunarli bo'ladi.",
              tone: "info",
            },
          ],
        },
        {
          id: "l1-demo-2",
          scene: "coding",
          pose: "explain",
          expression: "smile",
          lookAt: "laptop",
          focus: 1,
          code: {
            file: "styles.css",
            language: "css",
            content:
              'body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  background: #f8fafc;\n  color: #0f172a;\n}\n\n.site-header {\n  padding: 48px 24px;\n  text-align: center;\n  background: #2563eb;\n  color: white;\n}',
            typing: "type",
            highlightLines: [1, 9, 12],
            run: false,
          },
          title: "VSCode'da ishga tushirish",
          narration:
            "Endi styles.css faylini yaratib, oddiy uslub qo'shamiz. Body'ga shrift va fon, header'ga markazlash, main'ga bo'sh joy beramiz. Keyin Live Server orqali natijani ko'ramiz. Agar sahifa ochilmasa, fayl nomi va yo'lni tekshiring: index.html aynan loyiha papkasida bo'lishi kerak.",
          boardActions: [
            { type: "heading", text: "Birinchi uslub" },
            {
              type: "code",
              language: "css",
              code: 'body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  background: #f8fafc;\n  color: #0f172a;\n}\n\n.site-header {\n  padding: 48px 24px;\n  text-align: center;\n  background: #2563eb;\n  color: white;\n}',
              highlightLines: [1, 9, 12],
              caption: "styles.css",
            },
            {
              type: "note",
              text: "Live Server o'rnatilmagan bo'lsa, index.html faylini brauzerga sudrab ham ochish mumkin.",
              tone: "tip",
            },
          ],
        },
      ],
    },
    {
      type: "practice",
      title: "Amaliyot",
      durationMin: 15,
      steps: [
        {
          id: "l1-practice-1",
          scene: "coding",
          pose: "encourage",
          expression: "smile",
          lookAt: "laptop",
          focus: 0,
          code: {
            file: "index.html",
            language: "html",
            content:
              '<header>\n  <h1>Aziza Karimova</h1>\n</header>\n<main>\n  <p>Men frontend dasturchi bo\'lishni o\'rganyapman.</p>\n</main>\n<footer>\n  <p>© 2026</p>\n</footer>',
            typing: "type",
            highlightLines: [1, 4, 7],
            run: true,
          },
          title: "Figma rejasini kodga aylantiring",
          narration:
            "Endi mustaqil mashq. Avval Figma'da o'z portfoliongizning oddiy eskizini chizing: header, main va footer. Keyin VSCode'da shu uchta blokni HTML'da yozing. Class nomlarini o'zingiz tanlang, lekin izchil bo'lsin. Tayyor bo'lsa, Tekshirish tugmasini bosing.",
          boardActions: [
            { type: "note", text: "Avval Figma'da 3 blok chizing, keyin kodga o'tkazing.", tone: "tip" },
            {
              type: "table",
              headers: ["Blok", "Nima yoziladi"],
              rows: [
                ["header", "Ism va kasb"],
                ["main", "O'zingiz haqingizda"],
                ["footer", "Aloqa yoki yil"],
              ],
            },
          ],
          exercise: {
            prompt:
              "HTML sahifada header, main va footer bloklarini yarating. Har birini to'g'ri yoping.",
            starterCode:
              '<!doctype html>\n<html lang="uz">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Mening portfoliom</title>\n  </head>\n  <body>\n    \n  </body>\n</html>',
            language: "html",
            expectedKeywords: ["<header>", "</header>", "<main>", "</main>", "<footer>", "</footer>"],
            hints: [
              "Body ichida uchta blokni ketma-ket yozing.",
              "Har bir ochilish tegi uchun yopilish tegi bo'lishi kerak.",
              "Header ichiga ismingizni h1 qilib qo'shing.",
            ],
            solution:
              '<header>\n  <h1>Aziza Karimova</h1>\n</header>\n<main>\n  <p>Men frontend dasturchi bo\'lishni o\'rganyapman.</p>\n</main>\n<footer>\n  <p>© 2026</p>\n</footer>',
          },
        },
        {
          id: "l1-practice-2",
          scene: "coding",
          pose: "encourage",
          expression: "smile",
          lookAt: "laptop",
          focus: 0,
          code: {
            file: "index.html",
            language: "html",
            content:
              '<meta name="viewport" content="width=device-width, initial-scale=1" />\n<link rel="stylesheet" href="styles.css" />\n<title>Portfolio</title>',
            typing: "type",
            highlightLines: [1, 2, 3],
            run: false,
          },
          title: "Sozlamalarni to'g'ri ulang",
          narration:
            "Sahifangiz telefonda ham to'g'ri ko'rinishi uchun viewport meta tegini qo'shing. CSS faylini link teg bilan ulang va title yozing. Bu uchta qator keyingi barcha loyihalarda kerak bo'ladi. Ularni yodlab olish shart emas, lekin nima vazifa bajarishini tushunish muhim.",
          boardActions: [
            { type: "code", language: "html", code: '<meta name="viewport" content="width=device-width, initial-scale=1" />\n<link rel="stylesheet" href="styles.css" />\n<title>Portfolio</title>', highlightLines: [1, 2, 3], caption: "Head ichidagi muhim teglar" },
            { type: "note", text: "Viewport — mobil moslashuv. Link — CSS ulanishi. Title — brauzer yorlig'i.", tone: "info" },
          ],
          exercise: {
            prompt:
              "Head ichiga viewport meta tegini, styles.css havolasini va sahifa title'ini qo'shing.",
            starterCode:
              '<!doctype html>\n<html lang="uz">\n  <head>\n    <meta charset="UTF-8" />\n    \n  </head>\n  <body>\n    <h1>Portfolio</h1>\n  </body>\n</html>',
            language: "html",
            expectedKeywords: ['name="viewport"', 'href="styles.css"', "<title>"],
            hints: [
              "Viewport uchun meta name=\"viewport\" ishlatiladi.",
              "CSS faylni link rel=\"stylesheet\" bilan ulang.",
              "Title ochilish va yopilish tegi orasida bo'ladi.",
            ],
            solution:
              '<meta name="viewport" content="width=device-width, initial-scale=1" />\n<link rel="stylesheet" href="styles.css" />\n<title>Portfolio</title>',
          },
        },
      ],
    },
    {
      type: "reinforce",
      title: "Mustahkamlash",
      durationMin: 5,
      steps: [
        {
          id: "l1-reinforce-1",
          pose: "point-board",
          expression: "concerned",
          focus: 1,
          title: "Tipik xatolar",
          narration:
            "Boshlovchilar ko'p uchraydigan beshta xatoni ko'rib chiqamiz. Fayl .txt bo'lib qolishi, noto'g'ri papkada ochish, saqlashni unutish, CSS yo'li xato bo'lishi va viewport yo'qligi. Har bir xatoning sababi oddiy, lekin natijada sahifa ochilmaydi yoki telefonda buziladi. Shuning uchun har safar fayl nomi, papka va yo'lni tekshiring.",
          boardActions: [
            { type: "heading", text: "5 ta tipik xato" },
            {
              type: "table",
              headers: ["Xato", "Yechim"],
              rows: [
                ["index.html.txt", "Faylni index.html deb qayta nomlang"],
                ["Noto'g'ri papka", "VSCode'da Open Folder bilan loyihani oching"],
                ["Saqlanmagan fayl", "Ctrl+S yoki Auto Save'ni yoqing"],
                ["styles.css yo'li xato", "HTML bilan bir papkada ekanini tekshiring"],
                ["Viewport yo'q", "Meta viewport tegini qo'shing"],
              ],
            },
            { type: "note", text: "Xatoni ko'rish uchun Chrome'da F12 — DevTools panelini oching.", tone: "warning" },
          ],
        },
        {
          id: "l1-reinforce-2",
          scene: "coding",
          pose: "encourage",
          expression: "curious",
          lookAt: "laptop",
          focus: 0,
          code: {
            file: "index.html",
            language: "html",
            content: '<head>\n  <meta charset="UTF-8" />\n  <title>Mening sahifam\n</head>',
            typing: "instant",
            highlightLines: [3],
            run: false,
          },
          title: "Xatoni tuzatish",
          narration:
            "Quyidagi kodda head qismi to'liq emas. Title yopilmagan va viewport yo'q. Kodni to'g'rilang, keyin tekshiring. Bu mashq sizga real loyihada uchraydigan mayda xatolarni tez topishga yordam beradi.",
          boardActions: [
            {
              type: "code",
              language: "html",
              code: '<head>\n  <meta charset="UTF-8" />\n  <title>Mening sahifam\n</head>',
              highlightLines: [3],
              caption: "Xato kod",
            },
          ],
          exercise: {
            prompt: "Head ichidagi title tegini yoping va viewport meta tegini qo'shing.",
            starterCode:
              '<head>\n  <meta charset="UTF-8" />\n  <title>Mening sahifam\n</head>',
            language: "html",
            expectedKeywords: ["</title>", 'name="viewport"'],
            hints: ["Title yopilish tegini qo'shing.", "Viewport uchun meta name=\"viewport\" yozing."],
            solution:
              '<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>Mening sahifam</title>\n</head>',
          },
        },
      ],
    },
    {
      type: "wrapup",
      title: "Savol-javob va uyga vazifa",
      durationMin: 20,
      steps: [
        {
          id: "l1-wrapup-1",
          pose: "celebrate",
          expression: "smile",
          lookAt: "student",
          focus: 1,
          title: "Bugungi checklist",
          narration:
            "Bugun biz o'quv rejasini, veb-sayt ishlashini, Figma, VSCode, GitHub va birinchi HTML sahifani ko'rib chiqdik. Endi o'zingizni tekshiring: Figma akkaunti bormi, VSCode o'rnatilganmi, Live Server ishlayaptimi, loyiha papkasi va index.html tayyormi. Agar biror band bajarilmagan bo'lsa, hoziroq to'ldiring.",
          boardActions: [
            { type: "heading", text: "Bugun o'rgandik" },
            {
              type: "table",
              headers: ["Vosita", "Holat"],
              rows: [
                ["Figma akkaunti", "Ro'yxatdan o'tdim"],
                ["VSCode", "O'rnatdim"],
                ["Live Server", "Kengaytma qo'shdim"],
                ["Loyiha papkasi", "index.html va styles.css tayyor"],
                ["GitHub", "Akkaunt va Git sozlandi"],
              ],
            },
            { type: "note", text: "Uyga vazifa: Figma'da oddiy portfolio chizing va uning HTML skeletini yozing.", tone: "info" },
          ],
        },
        {
          id: "l1-wrapup-2",
          pose: "encourage",
          expression: "smile",
          lookAt: "student",
          title: "Savol-javob va keyingi dars",
          narration:
            "Savolingiz bo'lsa, pastdagi savol maydoniga yozing yoki Chuqurroq tugmasini bosing. Keyingi darsda matn, havola va rasmlar bilan ishlaymiz, bugungi skeletni boyitamiz. Uyga vazifani bajarib kelsangiz, keyingi dars siz uchun ancha oson bo'ladi. Endi qaysi qadam sizga qiyin bo'ldi?",
          boardActions: [
            { type: "heading", text: "Keyingi dars" },
            { type: "text", text: "Matn, havola va rasmlar: p, a, img, alt va xavfsiz manzillar." },
            { type: "note", text: "Savolingizni yozing — mentor sizga qadam-baqadam tushuntiradi.", tone: "tip" },
          ],
        },
      ],
    },
  ],
};

const lesson2Script: LessonScriptInput = {
  title: "Matn, havola va rasmlar",
  summary:
    "Paragraf, matnni ajratish, havola va rasmlarni to'g'ri, xavfsiz qo'shish.",
  language: "uz",
  level: "BEGINNER",
  segments: [
    {
      type: "intro",
      title: "Kirish",
      durationMin: 3,
      steps: [
        {
          id: "l2-intro-1",
          pose: "point-board",
          expression: "smile",
          focus: 1,
          title: "Oldingi darsni eslaymiz",
          narration:
            "O'tgan darsda hujjat skeletini va sarlavhani o'rgandik. Bugun sahifamizni matn, havola va rasm bilan boyitamiz. Oxirida shaxsiy profil sahifasini yasaymiz.",
          boardActions: [
            { type: "heading", text: "2-dars: Matn, havola va rasmlar" },
            {
              type: "text",
              text: "Bugun p, strong, em, a va img teglari bilan ishlaymiz.",
            },
            {
              type: "note",
              text: "Havola va rasm manzillari to'g'ri bo'lishi shart.",
              tone: "info",
            },
          ],
        },
      ],
    },
    {
      type: "explain",
      title: "Nazariya",
      durationMin: 12,
      steps: [
        {
          id: "l2-explain-1",
          focus: 1,
          title: "Matnni ajratish",
          narration:
            "Paragraf uchun p tegidan foydalanamiz. Muhim so'zni strong, urg'u beriladigan so'zni em tegi bilan ajratamiz. Bu teglar matn ma'nosini kuchaytiradi.",
          boardActions: [
            { type: "heading", text: "Matn teglari" },
            {
              type: "code",
              language: "html",
              code: "<p>Men <strong>HTML</strong> va <em>CSS</em> o'rganyapman.</p>",
              highlightLines: [1],
              caption: "Matnni ajratish",
            },
            {
              type: "table",
              headers: ["Teg", "Ma'nosi"],
              rows: [
                ["<p>", "Paragraf"],
                ["<strong>", "Muhim matn"],
                ["<em>", "Urg'u berilgan matn"],
              ],
            },
          ],
        },
        {
          id: "l2-explain-2",
          pose: "point-board",
          focus: 0,
          title: "Havola va rasm",
          narration:
            "Havola a tegi bilan yaratiladi va href atributi manzilni ko'rsatadi. Rasm img tegi bilan qo'shiladi. img yopilish tegi talab qilmaydi, lekin alt atributi majburiy.",
          boardActions: [
            {
              type: "code",
              language: "html",
              code: '<a href="https://example.com">Saytga o\'tish</a>\n<img src="rasm.jpg" alt="Tavsif">',
              highlightLines: [1, 2],
              caption: "href va src atributlari",
            },
            {
              type: "note",
              text: "alt — rasm yuklanmasa ko'rinadigan matn. Uni har doim yozing.",
              tone: "warning",
            },
          ],
        },
      ],
    },
    {
      type: "demo",
      title: "Namuna",
      durationMin: 5,
      steps: [
        {
          id: "l2-demo-1",
          scene: "coding",
          pose: "explain",
          expression: "smile",
          lookAt: "laptop",
          focus: 0,
          code: {
            file: "index.html",
            language: "html",
            content:
              '<h1>Aziza Karimova</h1>\n<p>Men <strong>veb-dasturlash</strong>ni o\'rganyapman.</p>\n<a href="https://developer.mozilla.org">MDN sayti</a>\n<img src="avatar.jpg" alt="Aziza avatari">',
            typing: "type",
            highlightLines: [3, 4],
            run: true,
          },
          title: "Profil sahifasi",
          narration:
            "Endi kichik profil sahifasini yozamiz. Unda ism, qisqa tavsif, sevimli saytga havola va rasm bo'ladi. Atributlarni diqqat bilan kuzating.",
          boardActions: [
            {
              type: "code",
              language: "html",
              code: '<h1>Aziza Karimova</h1>\n<p>Men <strong>veb-dasturlash</strong>ni o\'rganyapman.</p>\n<a href="https://developer.mozilla.org">MDN sayti</a>\n<img src="avatar.jpg" alt="Aziza avatari">',
              highlightLines: [3, 4],
              caption: "profile.html",
            },
            {
              type: "note",
              text: "Havola manzili to'liq bo'lishi kerak: https:// bilan boshlanadi.",
              tone: "tip",
            },
          ],
        },
      ],
    },
    {
      type: "practice",
      title: "Amaliyot",
      durationMin: 15,
      steps: [
        {
          id: "l2-practice-1",
          scene: "coding",
          pose: "encourage",
          expression: "smile",
          lookAt: "laptop",
          focus: 0,
          code: {
            file: "index.html",
            language: "html",
            content:
              '<a href="https://example.com">Sevimli saytim</a>\n<img src="rasm.jpg" alt="Mening rasmim">',
            typing: "type",
            highlightLines: [1, 2],
            run: true,
          },
          title: "Havola qo'shing",
          narration:
            "Endi o'zingizning sevimli saytingizga havola qo'shing va rasm uchun alt matn yozing. Ishoralar kerak bo'lsa, pastdagi tugmadan foydalaning.",
          boardActions: [
            {
              type: "note",
              text: "Havola va rasm manzillarini qo'shtirnoq ichiga yozishni unutmang.",
              tone: "tip",
            },
          ],
          exercise: {
            prompt:
              "Sahifaga bitta havola (a href) va bitta rasm (img src, alt) qo'shing.",
            starterCode:
              '<h1>Mening profilim</h1>\n<p>Men o\'rganyapman.</p>\n',
            language: "html",
            expectedKeywords: ["<a", "href=", "<img", "alt="],
            hints: [
              "Havola uchun a tegini oching va href yozing.",
              "Rasm tegi yopilmaydi, lekin alt atributi kerak.",
              "Manzilni qo'shtirnoq ichiga oling.",
            ],
            solution:
              '<a href="https://example.com">Sevimli saytim</a>\n<img src="rasm.jpg" alt="Mening rasmim">',
          },
        },
      ],
    },
    {
      type: "reinforce",
      title: "Mustahkamlash",
      durationMin: 5,
      steps: [
        {
          id: "l2-reinforce-1",
          scene: "coding",
          pose: "point-board",
          expression: "concerned",
          lookAt: "laptop",
          focus: 0,
          code: {
            file: "index.html",
            language: "html",
            content: '<img src="logo.png">',
            typing: "instant",
            highlightLines: [1],
            run: false,
          },
          title: "Alt matnni tekshiramiz",
          narration:
            "Quyidagi rasmda alt atributi yo'q. Bu ekran o'quvchilar uchun muammo. Alt matnni qo'shing va nima uchun muhimligini ayting.",
          boardActions: [
            {
              type: "code",
              language: "html",
              code: '<img src="logo.png">',
              highlightLines: [1],
              caption: "alt yo'q",
            },
          ],
          exercise: {
            prompt: "Rasmga mazmunli alt matn qo'shing.",
            language: "html",
            expectedKeywords: ["alt="],
            hints: [
              "alt atributini img tegining ichiga yozing.",
              "Alt matn rasm mazmunini qisqa tasvirlasin.",
            ],
          },
        },
        {
          id: "l2-reinforce-2",
          scene: "coding",
          pose: "encourage",
          expression: "curious",
          lookAt: "laptop",
          focus: 0,
          code: {
            file: "index.html",
            language: "html",
            content: '<a hraf="https://example.com">Havola</a>',
            typing: "instant",
            highlightLines: [1],
            run: false,
          },
          title: "Buzilgan havola",
          narration:
            "Havolada href atributi noto'g'ri yozilgan. Atribut nomini va qo'shtirnoqlarni tekshiring. To'g'rilangandan keyin havola ishlashi kerak.",
          boardActions: [
            {
              type: "code",
              language: "html",
              code: '<a hraf="https://example.com">Havola</a>',
              highlightLines: [1],
              caption: "Atribut nomida xato",
            },
            {
              type: "note",
              text: "Atribut nomi href bo'lishi kerak.",
              tone: "warning",
            },
          ],
        },
      ],
    },
    {
      type: "wrapup",
      title: "Savol-javob va uyga vazifa",
      durationMin: 20,
      steps: [
        {
          id: "l2-wrapup-1",
          pose: "celebrate",
          expression: "smile",
          lookAt: "student",
          focus: 1,
          title: "Xulosa",
          narration:
            "Bugun matnni ajratish, havola va rasm qo'shishni o'rgandik. Uyga vazifa: profil sahifangizga kamida ikkita havola va bitta rasm qo'shing. Keyingi darsda CSS bilan rang va shriftlarni o'zgartiramiz.",
          boardActions: [
            { type: "heading", text: "Bugun o'rgandik" },
            {
              type: "text",
              text: "p, strong, em, a href, img src va alt.",
            },
            {
              type: "note",
              text: "Uyga vazifa: profil sahifasini havola va rasm bilan to'ldiring.",
              tone: "info",
            },
          ],
        },
      ],
    },
  ],
};

async function main() {
  console.log("Seeding AI Academy demo data...");

  await db.aiUsage.deleteMany();
  await db.auditLog.deleteMany();
  await db.notification.deleteMany();
  await db.homeworkSubmission.deleteMany();
  await db.homework.deleteMany();
  await db.scheduleEvent.deleteMany();
  await db.scheduleGroup.deleteMany();
  await db.lessonSession.deleteMany();
  await db.enrollment.deleteMany();
  await db.lessonScript.deleteMany();
  await db.lesson.deleteMany();
  await db.course.deleteMany();
  await db.session.deleteMany();
  await db.payment.deleteMany();
  await db.user.deleteMany();
  await db.platformSetting.deleteMany();

  const adminHash = await hashPassword("Admin123!");
  const teacherHash = await hashPassword("Teacher123!");
  const studentHash = await hashPassword("Student123!");

  const admin = await db.user.create({
    data: {
      name: "Dilnoza Rahimova",
      email: "admin@aiacademy.uz",
      passwordHash: adminHash,
      role: "ADMIN",
      accessStatus: "ACTIVE",
      subscriptionPlan: "PRO",
      subscriptionEndsAt: daysFromNow(365),
    },
  });

  const teacher = await db.user.create({
    data: {
      name: "Sardor Ustoz",
      email: "teacher@aiacademy.uz",
      passwordHash: teacherHash,
      role: "TEACHER",
      accessStatus: "ACTIVE",
      subscriptionPlan: "PRO",
      subscriptionEndsAt: daysFromNow(365),
    },
  });

  const student1 = await db.user.create({
    data: {
      name: "Aziza Karimova",
      email: "student1@aiacademy.uz",
      passwordHash: studentHash,
      role: "STUDENT",
      accessStatus: "ACTIVE",
      subscriptionPlan: "PRO",
      subscriptionEndsAt: daysFromNow(20),
      adaptiveLevel: "INTERMEDIATE",
    },
  });

  const student2 = await db.user.create({
    data: {
      name: "Javohir Tursunov",
      email: "student2@aiacademy.uz",
      passwordHash: studentHash,
      role: "STUDENT",
      accessStatus: "GRACE",
      subscriptionPlan: "STARTER",
      subscriptionEndsAt: daysFromNow(-2),
    },
  });

  const student3 = await db.user.create({
    data: {
      name: "Malika Yusupova",
      email: "student3@aiacademy.uz",
      passwordHash: studentHash,
      role: "STUDENT",
      accessStatus: "RESTRICTED",
      subscriptionPlan: "NONE",
      subscriptionEndsAt: daysFromNow(-15),
    },
  });

  const course = await db.course.create({
    data: {
      slug: "web-dasturlash-asoslari",
      title: "Web dasturlash asoslari: HTML, CSS, JavaScript",
      description:
        "Noldan birinchi ishlaydigan loyihagacha: Figma'da dizayn, VSCode sozlash, HTML tuzilishi, CSS uslublari va JavaScript interaktivligi. Har darsda AI mentor, jonli doska va amaliy topshiriq.",
      level: "BEGINNER",
      isPublished: true,
    },
  });

  const lessonData = [
    {
      order: 1,
      title: "Web olamiga kirish: Figma, VSCode va birinchi sahifa",
      summary: "O'quv rejasi, Figma, VSCode, GitHub va birinchi loyihani sozlash.",
      status: "PUBLISHED" as const,
    },
    {
      order: 2,
      title: "Matn, havola va rasmlar",
      summary: "Paragraf, havola, rasm va alt matn bilan ishlash.",
      status: "PUBLISHED" as const,
    },
    {
      order: 3,
      title: "CSS asoslari: rang va tipografiya",
      summary: "Selektorlar, ranglar, shriftlar va asosiy uslublar.",
      status: "DRAFT" as const,
    },
    {
      order: 4,
      title: "Flexbox bilan joylashuv",
      summary: "Elementlarni qator va ustun bo'ylab joylashtirish.",
      status: "DRAFT" as const,
    },
    {
      order: 5,
      title: "JavaScript: birinchi interaktivlik",
      summary: "O'zgaruvchilar, hodisalar va DOM bilan tanishuv.",
      status: "DRAFT" as const,
    },
    {
      order: 6,
      title: "Yakuniy loyiha: shaxsiy sahifa",
      summary: "O'rganilganlarni birlashtirib, shaxsiy sahifa yaratish.",
      status: "DRAFT" as const,
    },
  ];

  const lessons = [];
  for (const data of lessonData) {
    lessons.push(
      await db.lesson.create({
        data: {
          courseId: course.id,
          order: data.order,
          title: data.title,
          summary: data.summary,
          durationMin: 60,
          status: data.status,
        },
      }),
    );
  }

  const validated1 = lessonScriptSchema.parse(lesson1Script);
  const validated2 = lessonScriptSchema.parse(lesson2Script);

  await db.lessonScript.create({
    data: {
      lessonId: lessons[0].id,
      version: 1,
      status: "APPROVED",
      content: validated1 as unknown as Prisma.InputJsonValue,
      createdById: teacher.id,
      approvedById: admin.id,
      approvedAt: new Date(),
    },
  });

  await db.lessonScript.create({
    data: {
      lessonId: lessons[1].id,
      version: 1,
      status: "APPROVED",
      content: validated2 as unknown as Prisma.InputJsonValue,
      createdById: teacher.id,
      approvedById: admin.id,
      approvedAt: new Date(),
    },
  });

  await db.enrollment.createMany({
    data: [
      { userId: student1.id, courseId: course.id, progressPercent: 50 },
      { userId: student2.id, courseId: course.id, progressPercent: 0 },
      { userId: student3.id, courseId: course.id, progressPercent: 0 },
    ],
  });

  await db.lessonSession.createMany({
    data: [
      {
        userId: student1.id,
        lessonId: lessons[0].id,
        stepIndex: 6,
        status: "COMPLETED",
        completedAt: new Date(),
      },
      {
        userId: student1.id,
        lessonId: lessons[1].id,
        stepIndex: 2,
        status: "IN_PROGRESS",
      },
      {
        userId: student2.id,
        lessonId: lessons[0].id,
        stepIndex: 1,
        status: "IN_PROGRESS",
      },
    ],
  });

  const group1 = await db.scheduleGroup.create({
    data: {
      name: "Du-Cho-Ju",
      days: ["Dushanba", "Chorshanba", "Juma"],
      startTime: "18:00",
      endTime: "19:00",
      courseId: course.id,
      teacherId: teacher.id,
    },
  });

  const group2 = await db.scheduleGroup.create({
    data: {
      name: "Se-Pa-Sh",
      days: ["Seshanba", "Payshanba", "Shanba"],
      startTime: "10:00",
      endTime: "11:00",
      courseId: course.id,
      teacherId: teacher.id,
    },
  });

  await db.scheduleEvent.createMany({
    data: [
      {
        groupId: group1.id,
        lessonId: lessons[0].id,
        title: lessons[0].title,
        date: daysFromNow(1),
        startTime: "18:00",
        endTime: "19:00",
      },
      {
        groupId: group1.id,
        lessonId: lessons[1].id,
        title: lessons[1].title,
        date: daysFromNow(3),
        startTime: "18:00",
        endTime: "19:00",
      },
      {
        groupId: group1.id,
        lessonId: lessons[2].id,
        title: lessons[2].title,
        date: daysFromNow(6),
        startTime: "18:00",
        endTime: "19:00",
      },
      {
        groupId: group2.id,
        lessonId: lessons[0].id,
        title: lessons[0].title,
        date: daysFromNow(2, 10),
        startTime: "10:00",
        endTime: "11:00",
      },
      {
        groupId: group2.id,
        lessonId: lessons[1].id,
        title: lessons[1].title,
        date: daysFromNow(4, 10),
        startTime: "10:00",
        endTime: "11:00",
      },
      {
        groupId: group2.id,
        lessonId: lessons[3].id,
        title: lessons[3].title,
        date: daysFromNow(7, 10),
        startTime: "10:00",
        endTime: "11:00",
      },
    ],
  });

  const homework1 = await db.homework.create({
    data: {
      lessonId: lessons[0].id,
      courseId: course.id,
      title: "O'zingiz haqingizda sahifa",
      description:
        "HTML hujjat skeletidan foydalanib, o'zingiz haqingizda uch qismli kichik sahifa yarating.",
      tasks: {
        items: [
          "Sarlavhada ismingizni yozing.",
          "Qisqa tavsif paragrafi qo'shing.",
          "Kamida bitta qiziqishingizni sanab bering.",
        ],
      },
      dueAt: daysFromNow(5, 18),
      status: "PUBLISHED",
      maxScore: 100,
      createdById: teacher.id,
    },
  });

  await db.homework.create({
    data: {
      lessonId: lessons[1].id,
      courseId: course.id,
      title: "Profil sahifasini boyiting",
      description:
        "Profil sahifangizga ikkita havola va bitta rasm qo'shing. Rasm uchun mazmunli alt matn yozing.",
      tasks: {
        items: [
          "Kamida 2 ta havola qo'shing.",
          "Bitta rasm va alt matn qo'shing.",
          "Havolalar yangi oynada ochilsin.",
        ],
      },
      dueAt: daysFromNow(12, 18),
      status: "PUBLISHED",
      maxScore: 100,
      createdById: teacher.id,
    },
  });

  await db.homeworkSubmission.create({
    data: {
      homeworkId: homework1.id,
      studentId: student1.id,
      content:
        '<h1>Aziza Karimova</h1>\n<p>Men veb-dasturlashni o\'rganyapman.</p>\n<p>Qiziqishlarim: dizayn, kitob o\'qish.</p>',
      status: "AI_REVIEWED",
      score: 90,
      aiFeedback: {
        summary: "Yaxshi bajarilgan. Hujjat skeleti va teglar to'g'ri.",
        suggestions: ["html lang atributini qo'shing.", "title tegini unutmang."],
      },
    },
  });

  await db.homeworkSubmission.create({
    data: {
      homeworkId: homework1.id,
      studentId: student2.id,
      content: "<h1>Javohir</h1>\n<p>Salom</p>",
      status: "PENDING",
    },
  });

  await db.payment.createMany({
    data: [
      {
        userId: student1.id,
        invoiceNumber: "INV-DEMO-1001",
        amount: 29_900_000,
        status: "PAID",
        provider: "DEMO",
        providerRef: "demo-seed-1001",
        description: "Pro obuna — 1 oy",
        paidAt: daysFromNow(-10),
      },
      {
        userId: student2.id,
        invoiceNumber: "INV-DEMO-1002",
        amount: 19_900_000,
        status: "PENDING",
        provider: "DEMO",
        providerRef: "demo-seed-1002",
        description: "Starter obuna — 1 oy",
      },
      {
        userId: student3.id,
        invoiceNumber: "INV-DEMO-1003",
        amount: 29_900_000,
        status: "FAILED",
        provider: "DEMO",
        providerRef: "demo-seed-1003",
        description: "Pro obuna — 1 oy",
      },
    ],
  });

  await db.notification.createMany({
    data: [
      {
        userId: student1.id,
        type: "LESSON",
        title: "Keyingi dars yaqinlashmoqda",
        body: "Du-Cho-Ju guruhi uchun HTML asoslari darsi ertaga 18:00 da boshlanadi.",
        link: "/lessons",
      },
      {
        userId: student1.id,
        type: "HOMEWORK",
        title: "Uyga vazifa tekshirildi",
        body: "AI mentor 'O'zingiz haqingizda sahifa' topshirig'ini ko'rib chiqdi.",
        link: "/homework",
      },
      {
        userId: student2.id,
        type: "PAYMENT",
        title: "To'lov muddati o'tdi",
        body: "Obunangiz imtiyozli davrda. Iltimos, to'lovni amalga oshiring.",
        link: "/subscription",
      },
      {
        userId: student3.id,
        type: "WARNING",
        title: "Kirish cheklangan",
        body: "Obuna muddati tugaganligi sababli darslarga kirish cheklangan.",
        link: "/subscription",
      },
    ],
  });

  await db.platformSetting.create({
    data: {
      id: "global",
      graceDays: 3,
      restrictAfterDays: 7,
      aiProvider: "GROQ",
      aiModel: process.env.AI_MODEL ?? "openai/gpt-oss-120b",
      aiTemperature: 0.4,
      monthlyTokenLimit: 1_200_000,
    },
  });

  console.log("Seed complete.");
  console.log("Users:", [admin.email, teacher.email, student1.email, student2.email, student3.email].join(", "));
  console.log("Demo passwords: Admin123! / Teacher123! / Student123! (DEMO ONLY).");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
