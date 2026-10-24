// Copy lock: every word a reader can see is frozen in copy.lock.json (the owner signed off on 2026-10-24 that the
// copy is final). `npm run check` fails when a built page's text differs from the lock; after the owner agrees to a
// change, run `npm run lock` to record it. Text that changes by itself sits between <!--live--> and <!--/live-->.
// Also refuses relative time words that would be wrong a year later (今年, 至今, this year…).
import fs from 'node:fs';

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e] ?? m));

export function pageText(html) {
  let s = html.replace(/<!--live-->[\s\S]*?<!--\/live-->/g, ' ');
  const meta = [];
  const title = /<title>([\s\S]*?)<\/title>/.exec(s);
  if (title) meta.push(title[1]);
  const desc = /<meta name="description" content="([^"]*)"/.exec(s);
  if (desc) meta.push(desc[1]);
  s = s.replace(/<(script|style|template|head)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<(?:img|svg|a|button|video)\b[^>]*?\s(?:alt|aria-label)="([^"]*)"[^>]*>/gi, (m, a) => ` ${a} ${m}`);
  s = s.replace(/<\/?(p|h[1-6]|li|dt|dd|blockquote|figcaption|summary|div|section|header|footer|article|br|tr|td|th|caption|ol|ul|dl|figure|nav|main|aside)\b[^>]*>/gi, '\n');
  s = decode(s.replace(/<[^>]+>/g, ''));
  const lines = s.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  return [...meta.map(decode), ...lines].join('\n');
}

const RELATIVE = /今年(?!（\d{4})|明年|去年|至今|如今|\bthis year\b|\blast year\b|\bnext year\b|\bto date\b/gi;

export function checkCopy(files, lockFile = 'copy.lock.json', { write = false } = {}) {
  const now = Object.fromEntries(files.map((f) => [f, pageText(fs.readFileSync(f, 'utf8'))]));
  const problems = [];
  for (const [f, t] of Object.entries(now)) for (const m of t.matchAll(RELATIVE)) problems.push(`${f}: 「${t.slice(Math.max(0, m.index - 12), m.index + 16).replace(/\n/g, ' ')}」 uses a relative time word; write the year`);
  if (write) { fs.writeFileSync(lockFile, JSON.stringify(now, null, 1) + '\n'); return problems; }
  if (!fs.existsSync(lockFile)) return [...problems, `${lockFile} is missing: run npm run lock`];
  const locked = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
  for (const f of new Set([...Object.keys(locked), ...files])) {
    const a = (locked[f] || '').split('\n'), b = (now[f] || '').split('\n');
    if (a.join('\n') === b.join('\n')) continue;
    let i = 0; while (i < a.length && a[i] === b[i]) i++;
    problems.push(`copy of ${f} differs from the lock (the copy is final; change it only with the owner's agreement, then npm run lock):\n    locked: ${a[i] ?? '(nothing)'}\n    now:    ${b[i] ?? '(nothing)'}`);
  }
  return problems;
}
