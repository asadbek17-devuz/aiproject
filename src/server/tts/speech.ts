import type { TtsStyle } from "@/server/tts/provider.interface";

const STYLE_BASE: Record<TtsStyle, { rate: number; pitch: number; volume: number }> = {
  mentor: { rate: 0.97, pitch: 0, volume: 100 },
  hint: { rate: 0.94, pitch: 1, volume: 100 },
  celebrate: { rate: 1.0, pitch: 4, volume: 100 },
  question: { rate: 0.96, pitch: 3, volume: 100 },
};

const EMPHASIS_WORDS = [
  "muhim",
  "asosiy",
  "e'tibor",
  "diqqat",
  "esda tuting",
  "xato",
  "farq",
  "sir",
  "kalit",
];

const QUESTION_STARTS = [
  "nima",
  "nega",
  "nima uchun",
  "qanday",
  "qaysi",
  "qachon",
  "qayerda",
  "kim",
  "nechta",
  "mumkinmi",
  "kerakmi",
  "to'g'rimi",
  "tushundingizmi",
];


const TAG_PRONUNCIATIONS: Record<string, string> = {
  html: "eych ti em el",
  head: "hed",
  body: "bodi",
  title: "taytl",
  h1: "eych bir",
  h2: "eych ikki",
  h3: "eych uch",
  h4: "eych to'rt",
  h5: "eych besh",
  h6: "eych olti",
  p: "pi",
  a: "a",
  img: "imij",
  div: "div",
  span: "span",
  strong: "strong",
  em: "em",
  ul: "yu el",
  ol: "ou el",
  li: "el ay",
  section: "sekshn",
  header: "heder",
  footer: "futer",
  main: "meyn",
  nav: "nav",
  button: "batn",
  input: "input",
  form: "form",
  label: "leybl",
  link: "link",
  meta: "meta",
  script: "skript",
  style: "stayl",
  doctype: "doktayp",
  article: "artikl",
  aside: "esayd",
  figure: "figura",
  figcaption: "fig kapshn",
  blockquote: "blok kvout",
  pre: "pri",
  code: "koud",
  br: "breyk",
  hr: "hoy rizontel",
  table: "teybl",
  tr: "ti ar",
  td: "ti di",
  th: "ti eych",
  thead: "ti hed",
  tbody: "ti bodi",
  tfoot: "ti fut",
  video: "video",
  audio: "audio",
  source: "sors",
  picture: "pikcher",
  canvas: "kanvas",
  svg: "es vi ji",
  path: "pat",
  iframe: "ay freym",
};

const ATTR_PRONUNCIATIONS: Record<string, string> = {
  href: "eych ref",
  src: "es ar si",
  alt: "alt",
  class: "klas",
  id: "ay di",
  style: "stayl",
  lang: "leng",
  charset: "char set",
  rel: "rel",
  target: "target",
  width: "vidt",
  height: "hayt",
  type: "tayp",
  placeholder: "pleysholder",
  value: "valyu",
  name: "neym",
  role: "roul",
  method: "metod",
  action: "akshn",
  for: "for",
  required: "rikvayrd",
  disabled: "diskeybld",
  checked: "chekt",
  selected: "silekted",
  rows: "rouz",
  cols: "koulz",
  colspan: "kol span",
  rowspan: "rou span",
  download: "daunloud",
  controls: "kontrolls",
  poster: "poustir",
  preload: "pri loud",
  defer: "difər",
  async: "esink",
  loading: "louding",
  content: "kontent",
  property: "properti",
  media: "midia",
};

const IT_TERMS: Array<[RegExp, string]> = [
  [/\bHTML5/g, "eych ti em el besh"],
  [/\bCSS3/g, "si es es uch"],
  [/\bHTML/g, "eych ti em el"],
  [/\bCSS/g, "si es es"],
  [/\bVSCode/gi, "Visual Studio Code"],
  [/\bVS Code/gi, "Visual Studio Code"],
  [/\bGitHub/gi, "git hab"],
  [/\bGitLab/gi, "git lab"],
  [/\bGit/g, "git"],
  [/\bAPI/g, "ey pi ay"],
  [/\bAI/g, "ey ay"],
  [/\bURL/g, "yu ar el"],
  [/\bURI/g, "yu ar ay"],
  [/\bJSON/g, "jeyson"],
  [/\bSQL/g, "es kyuel"],
  [/\bDOM/g, "dom"],
  [/\bUI/g, "yu ay"],
  [/\bUX/g, "yu eks"],
  [/\bIDE/g, "ay di i"],
  [/\bHTTPS/g, "eych ti ti pi es"],
  [/\bHTTP/g, "eych ti ti pi"],
  [/\bPNG/g, "pi en ji"],
  [/\bJPG/g, "jey pek ji"],
  [/\bSVG/g, "es vi ji"],
  [/\bPDF/g, "pi di ef"],
  [/\bFAQ/g, "ef ey ky"],
  [/\bSEO/g, "es i ou"],
  [/\bCDN/g, "si di en"],
  [/\bnpm/g, "en pi em"],
  [/\bNode\.\s*js/gi, "Node JS"],
  [/\bNext\.\s*js/gi, "Next JS"],
  [/\bPostgreSQL/gi, "postgres kyuel"],
  [/\bChrome/gi, "Kroum"],
  [/\bFirefox/gi, "Fayrfoks"],
  [/\bSafari/gi, "Safari"],
  [/\bWindows/gi, "Windows"],
  [/\bmacOS/gi, "Mak OS"],
  [/\bLinux/gi, "Linux"],
  [/\bWordPress/gi, "WordPress"],
  [/\bWix/gi, "Viks"],
  [/\bShopify/gi, "Shopify"],
  [/\bWebflow/gi, "Webflow"],
  [/\bFramer/gi, "Framer"],
  [/\bFigma/gi, "Figma"],
  [/\bTilda/gi, "Tilda"],
  [/\bCanvas/gi, "Kanvas"],
  [/\bES6/g, "i es olti"],
  [/\bJSX/g, "jey es eks"],
  [/\bTSX/g, "ti es eks"],
  [/\bREST/g, "rest"],
  [/\bGraphQL/g, "graf kyuel"],
  [/\bJWT/g, "jey dablyu ti"],
  [/\bOAuth/g, "ou os"],
  [/\bDNS/g, "di en es"],
  [/\bSSH/g, "es es eych"],
  [/\bFTP/g, "ef ti pi"],
  [/\bSMTP/g, "es em ti pi"],
  [/\bTCP/g, "ti si pi"],
  [/\bUDP/g, "yu di pi"],
  [/\bCPU/g, "si pi yu"],
  [/\bGPU/g, "ji pi yu"],
  [/\bRAM/g, "ram"],
  [/\bCLI/g, "si el ay"],
  [/\bGUI/g, "gu i"],
  [/\bSDK/g, "es di key"],
  [/\bCMS/g, "si em es"],
  [/\bCRUD/g, "krud"],
  [/\bMVC/g, "em vi si"],
  [/\bCI\/CD/g, "si ay si di"],
  [/\bDevOps/gi, "devops"],
  [/\bAgile/gi, "ajayl"],
  [/\bScrum/gi, "skram"],
  [/\bSprint/gi, "sprint"],
  [/\bKanban/gi, "kanban"],
  [/\bReact/gi, "riakt"],
  [/\bVue/gi, "vyu"],
  [/\bAngular/gi, "angulyar"],
  [/\bTailwind/gi, "teylvind"],
  [/\bBootstrap/gi, "butstrap"],
  [/\bMongoDB/gi, "mongo di bi"],
  [/\bMySQL/gi, "may es kyuel"],
  [/\bVite/gi, "vit"],
  [/\bYarn/gi, "yarn"],
];

function speakTag(token: string): string {
  const closing = token.startsWith("</");
  const tagMatch = token.match(/^<\/?([a-zA-Z0-9]+)/);
  const tag = tagMatch?.[1]?.toLowerCase() ?? "";
  const tagSpeech = TAG_PRONUNCIATIONS[tag] ?? tag;
  const attrs: string[] = [];
  const attrRegex = /\b([a-zA-Z-]+)=["']([^"']*)["']/g;
  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = attrRegex.exec(token)) !== null) {
    const attr = attrMatch[1].toLowerCase();
    attrs.push(`${ATTR_PRONUNCIATIONS[attr] ?? attr} atributi ${attrMatch[2]}`);
  }

  return `${closing ? "yopilish" : "ochilish"} ${tagSpeech} tegi${attrs.length ? `, ${attrs.join(", ")}` : ""}`;
}

function speakCode(code: string): string {
  if (/^<!doctype/i.test(code.trim())) return "doktayp eych ti em el";
  const withTags = code.replace(/<\/?[a-zA-Z0-9]+[^>]*>/g, (tag) => ` ${speakTag(tag)} `);
  return withTags
    .replace(/\b([a-zA-Z-]+)=["']([^"']*)["']/g, (_, attr: string, value: string) => {
      const key = attr.toLowerCase();
      return `${ATTR_PRONUNCIATIONS[key] ?? attr} atributi ${value}`;
    })
    .replace(/[{}()\[\];=<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const WORD_PRONUNCIATIONS: Array<[RegExp, string]> = [
  [/\bjavascript\b/gi, "java skript"],
  [/\btypescript\b/gi, "tayp skript"],
  [/\bstylesheet\b/gi, "stayl shit"],
  [/\bfilename\b/gi, "fayl neym"],
  [/\bfilepath\b/gi, "fayl pat"],
  [/\bclassname\b/gi, "klas neym"],
  [/\bstyle/gi, "stayl"],
  [/\bfrontend/gi, "frontend"],
  [/\bbackend/gi, "bekend"],
  [/\bwebsite/gi, "veb sayt"],
  [/\bwebpage/gi, "veb sahifa"],
  [/\bbrowser/gi, "brauzer"],
  [/\bserver/gi, "server"],
  [/\blayout/gi, "leyout"],
  [/\bresponsive/gi, "responsiv"],
  [/\bmargin/gi, "marjin"],
  [/\bpadding/gi, "peding"],
  [/\bborder/gi, "border"],
  [/\bbackground/gi, "bekgraund"],
  [/\bflexbox/gi, "fleksboks"],
  [/\bflex/gi, "fleks"],
  [/\bgrid/gi, "grid"],
  [/\bclass/gi, "klas"],
  [/\bid\b/gi, "ay di"],
  [/\battribute/gi, "atribut"],
  [/\belement/gi, "element"],
  [/\binput/gi, "input"],
  [/\bbutton/gi, "batn"],
  [/\bform/gi, "form"],
  [/\blabel/gi, "leybl"],
  [/\bimage/gi, "imij"],
  [/\bscript/gi, "skript"],
  [/\bdeploy/gi, "diploy"],
  [/\bcommit/gi, "kommit"],
  [/\bbranch/gi, "branch"],
  [/\bmerge/gi, "merj"],
  [/\brepository/gi, "repozitori"],
  [/\bterminal/gi, "terminal"],
  [/\bcommand/gi, "komand"],
  [/\bfile/gi, "fayl"],
  [/\bfolder/gi, "papka"],
  [/\bdownload/gi, "daunloud"],
  [/\bupload/gi, "aploud"],
  [/\blogin/gi, "login"],
  [/\blogout/gi, "logaut"],
  [/\bpassword/gi, "parol"],
  [/\bemail/gi, "email"],
  [/\bheader/gi, "heder"],
  [/\bfooter/gi, "futer"],
  [/\bmenu/gi, "menyu"],
];

function pronounceItTerms(text: string): string {
  let result = text;
  for (const [pattern, replacement] of IT_TERMS) {
    result = result.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of WORD_PRONUNCIATIONS) {
    result = result.replace(pattern, replacement);
  }
  return result
    .replace(/\bh([1-6])\b/gi, (_, digit: string) => TAG_PRONUNCIATIONS[`h${digit}`] ?? `eych ${digit}`)
    .replace(/\b(div|span|body|head|title|href|src|alt|img|doctype|class)\b/gi, (word) => {
      const key = word.toLowerCase();
      return TAG_PRONUNCIATIONS[key] ?? ATTR_PRONUNCIATIONS[key] ?? word;
    });
}

const NUMBER_ONES = [
  "nol",
  "bir",
  "ikki",
  "uch",
  "to'rt",
  "besh",
  "olti",
  "yetti",
  "sakkiz",
  "to'qqiz",
];

const NUMBER_TENS = [
  "",
  "o'n",
  "yigirma",
  "o'ttiz",
  "qirq",
  "ellik",
  "oltmish",
  "yetmish",
  "sakson",
  "to'qson",
];

const NUMBER_UNITS: Array<{ value: number; label: string }> = [
  { value: 1_000_000_000, label: "milliard" },
  { value: 1_000_000, label: "million" },
  { value: 1_000, label: "ming" },
];

function belowThousandToUzbek(value: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;

  if (hundreds > 0) parts.push(`${NUMBER_ONES[hundreds]} yuz`);
  if (rest > 0) {
    if (rest < 10) {
      parts.push(NUMBER_ONES[rest] ?? "");
    } else {
      const tens = Math.floor(rest / 10);
      const ones = rest % 10;
      parts.push(NUMBER_TENS[tens] ?? "");
      if (ones > 0) parts.push(NUMBER_ONES[ones] ?? "");
    }
  }

  return parts.filter(Boolean).join(" ");
}

function numberToUzbek(value: number): string {
  if (!Number.isFinite(value) || value < 0) return String(value);
  const integer = Math.floor(value);
  if (integer === 0) return "nol";

  const parts: string[] = [];
  let rest = integer;
  for (const unit of NUMBER_UNITS) {
    const count = Math.floor(rest / unit.value);
    if (count > 0) {
      parts.push(`${belowThousandToUzbek(count)} ${unit.label}`);
      rest %= unit.value;
    }
  }
  if (rest > 0) parts.push(belowThousandToUzbek(rest));
  return parts.join(" ");
}

function decimalsToUzbek(value: string): string {
  const [whole, fraction] = value.split(/[.,]/);
  const wholeWords = numberToUzbek(Number(whole ?? "0"));
  if (!fraction) return wholeWords;
  const digits = fraction
    .split("")
    .map((digit) => NUMBER_ONES[Number(digit)] ?? digit)
    .join(" ");
  return `${wholeWords} butun ${digits}`;
}

function naturalizeNumbers(text: string): string {
  return text
    .replace(/\b\d{1,3}(?:[ ,]\d{3})+\b/g, (match) =>
      numberToUzbek(Number(match.replace(/[ ,]/g, ""))),
    )
    .replace(/\b(\d+[.,]\d+)\s*%/g, (_, value: string) => `${decimalsToUzbek(value)} foiz`)
    .replace(/\b(\d+)\s*%/g, (_, value: string) => `${numberToUzbek(Number(value))} foiz`)
    .replace(/\b(\d+[.,]\d+)\b/g, (_, value: string) => decimalsToUzbek(value))
    .replace(/\b\d+\b/g, (value) => numberToUzbek(Number(value)));
}

function naturalizeAbbreviations(text: string): string {
  return text
    .replace(/\bva\s+h\.\s*k\.?/gi, "va hokazo")
    .replace(/\bh\.\s*k\.?/gi, "hokazo")
    .replace(/\bdr\./gi, "doktor")
    .replace(/\bprof\./gi, "professor")
    .replace(/\bkm\b/gi, "kilometr")
    .replace(/\bkg\b/gi, "kilogramm")
    .replace(/\b№\s*/g, "raqam ");
}

function escapeXml(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function normalizeSpeechText(text: string): string {
  let clean = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, (_, code: string) => ` ${speakCode(code)} `)
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/gi, "havola")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|\s)[*_](\S[^*_]*?)[*_](?=\s|$)/g, "$1$2")
    .replace(/<\/?[a-zA-Z0-9]+[^>]*>/g, (tag) => ` ${speakTag(tag)} `)
    .replace(/[—–]/g, ", ")
    .replace(/\s*&\s*/g, " va ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
    .replace(/\r?\n+/g, ". ")
    .replace(/\s+/g, " ")
    .replace(/([^.!?…])\s+(lekin|ammo|chunki|masalan|ya'ni|shuning uchun)\s+/gi, "$1, $2 ")
    .replace(/\s+([,.;:!?…])/g, "$1")
    .replace(/(?<!\d)([,.;:!?…])(?=[^\s,.;:!?…])/g, "$1 ")
    .trim();

  clean = pronounceItTerms(clean);
  clean = naturalizeAbbreviations(clean);
  clean = naturalizeNumbers(clean);
  clean = clean
    .replace(/[’‘]/g, "'")
    .replace(/([oOgG])'/g, "$1ʻ")
    .replace(/\s+/g, " ");

  clean = clean.replace(/^[.,;:]+/, "").trim();
  if (!clean) return "";

  if (!/[.!?…]$/.test(clean)) clean += ".";
  return clean;
}

export function splitSpeechSentences(text: string): string[] {
  const matches = text.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? [text];
  const sentences = matches.map((sentence) => sentence.trim()).filter(Boolean);

  return sentences.reduce<string[]>((result, sentence) => {
    const previous = result[result.length - 1];
    if (previous && (sentence.length < 18 || previous.length < 18)) {
      result[result.length - 1] = `${previous} ${sentence}`.replace(/\s+/g, " ").trim();
      return result;
    }
    result.push(sentence);
    return result;
  }, []);
}

function isQuestion(sentence: string): boolean {
  const lower = sentence.toLowerCase();
  return (
    sentence.includes("?") ||
    QUESTION_STARTS.some((word) => lower.startsWith(`${word} `) || lower.startsWith(`${word},`))
  );
}

function isEmphatic(sentence: string): boolean {
  const lower = sentence.toLowerCase();
  const words = lower.split(/[^\p{L}']+/u);
  return EMPHASIS_WORDS.some(
    (word) => word.includes(" ") ? lower.includes(word) : words.includes(word),
  );
}

function prosodyFor(sentence: string, index: number, style: TtsStyle): {
  pitch: number;
  rate: number;
  volume: number;
} {
  const base = STYLE_BASE[style];
  const question = isQuestion(sentence);
  const emphatic = isEmphatic(sentence);
  const exclamation = sentence.includes("!");

  let pitch = base.pitch;
  let rate = base.rate;
  const volume = base.volume;

  if (question) {
    pitch += 4;
    rate -= 0.02;
  } else if (exclamation) {
    pitch += 5;
    rate += 0.02;
  } else if (emphatic) {
    pitch += 1;
    rate -= 0.03;
  } else if (sentence.length > 150) {
    rate -= 0.02;
  } else if (sentence.length < 40) {
    rate += 0.01;
  }

  // Kichik tabiiy tebranish: har bir gap bir xil ohangda yangramasin.
  pitch += [0, 1, -1, 1, -1, 0][index % 6] ?? 0;
  rate += [0, 0.01, -0.01][index % 3] ?? 0;

  if (index === 0 && style === "mentor" && !question) {
    pitch += 1;
  }

  return {
    pitch: Math.max(-5, Math.min(9, Math.round(pitch))),
    rate: Math.max(0.9, Math.min(1.1, Math.round(rate * 100) / 100)),
    volume,
  };
}

function prosodyTag(value: { pitch: number; rate: number; volume: number }, text: string): string {
  const pitch = `${value.pitch >= 0 ? "+" : ""}${value.pitch}Hz`;
  const volume = String(value.volume);
  return `<prosody pitch="${pitch}" rate="${value.rate}" volume="${volume}">${escapeXml(text)}</prosody>`;
}

function wrapSsml(voice: string, body: string): string {
  const locale = voice.startsWith("uz-") ? "uz-UZ" : "en-US";
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${locale}"><voice name="${escapeXml(voice)}">${body}</voice></speak>`;
}

const MAX_PROSODY_PER_REQUEST = 2;

export function buildSpeechSegments(text: string, voice: string, style: TtsStyle = "mentor"): string[] {
  const normalized = normalizeSpeechText(text);
  const sentences = splitSpeechSentences(normalized);
  const segments: string[] = [];

  for (let start = 0; start < sentences.length; start += MAX_PROSODY_PER_REQUEST) {
    const chunk = sentences.slice(start, start + MAX_PROSODY_PER_REQUEST);
    const body = chunk
      .map((sentence, offset) =>
        prosodyTag(prosodyFor(sentence, start + offset, style), sentence),
      )
      .join("");
    segments.push(wrapSsml(voice, body));
  }

  return segments;
}
