export function buildPreviewDoc(code: string, language: string): string {
  const shell = (body: string, extra = "") =>
    `<!doctype html><html lang="uz"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family:ui-sans-serif,system-ui,sans-serif;margin:0;padding:18px;color:#0f172a;background:#fff;line-height:1.6}${extra}</style></head><body>${body}</body></html>`;

  if (language === "css") {
    return shell(
      '<header class="site-header"><h1>Salom, dunyo</h1><p>Bu sizning birinchi uslubingiz.</p></header><main class="site-main"><section class="about">CSS natijasi shu yerda ko\'rinadi.</section></main><footer class="site-footer">© 2026</footer>',
      code,
    );
  }

  if (language === "javascript") {
    return shell(
      `<main id="app"><h1>Natija</h1><p id="out">Konsol natijasi shu yerda.</p></main><script>try{${code}}catch(error){document.getElementById('out').textContent='Xato: '+error.message}<\/script>`,
    );
  }

  if (language === "html") {
    if (/<html[\s>]/i.test(code) || /<!doctype/i.test(code)) {
      return code;
    }
    return shell(code);
  }

  return shell(
    `<pre style="white-space:pre-wrap;font-family:ui-monospace,monospace">${code.replace(/</g, "&lt;")}</pre>`,
  );
}
