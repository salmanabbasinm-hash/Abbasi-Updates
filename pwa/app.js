const input = document.querySelector('#url');
const error = document.querySelector('#error');
const splash = document.querySelector('#splash');
const about = document.querySelector('#about');

// Adult / indecent content is not allowed: words (English, Urdu, Hindi) and sites.
const BAD_SITES = ['porn','xxx','hentai','nsfw','xvideos','xnxx','xhamster','redtube','youporn','spankbang','tube8','eporner','beeg','onlyfans','chaturbate','stripchat','rule34','nhentai','brazzers','erome','sexy','sexvid','sexcam'];
const BAD_WORDS = ['porn','xxx','nsfw','hentai','nude','naked','topless','erotic','onlyfans','blowjob','milf','sex','sexy','sexual','horny','orgasm','fetish','boob','boobs','breast','breasts','tits','nipple','nipples','busty','cleavage','bikini','lingerie','striptease','twerk','mms','fuck','pussy','dick','cock','anal','escort','callgirl','chhati','nangi','nanga','chudai','randi','ننگی','ننگا','چھاتی','چھاتیاں','فحش','سیکسی','جنسی','سیکس','برہنہ','عریاں','بھابھی','رنڈی','پورن','नंगी','सेक्स','अश्लील','पोर्न'];
const HARMLESS = /breast\s*cancer|breast\s*feeding|breastfeeding|chicken\s*breast|sussex|essex|middlesex|unisex|analy\w*|analog\w*|cocktail|peacock|cockpit/gi;

function looksAdult(text) {
  const t = ' ' + text.toLowerCase().replace(/[-_.+\/]/g, ' ').replace(HARMLESS, ' ') + ' ';
  return BAD_WORDS.some(w => /^[\x00-\x7f]+$/.test(w) ? (w.length <= 4 ? t.includes(' ' + w + ' ') : t.includes(w)) : t.includes(w));
}

function showError(message) { error.textContent = message; error.hidden = false; }

function convert(raw) {
  let value = raw.trim();
  if (!value) return { error: 'پہلے ویڈیو کا لنک پیسٹ کریں۔' };
  const m = value.match(/https?:\/\/\S+/i);
  if (m) value = m[0];
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  let parsed;
  try { parsed = new URL(value); } catch { return { error: 'یہ درست لنک نہیں ہے۔' }; }
  const host = parsed.hostname.toLowerCase();
  if (BAD_SITES.some(w => host.includes(w)) || looksAdult(decodeURIComponent(parsed.pathname + ' ' + parsed.search))) {
    return { error: '⚠️ انتباہ\nغیر اخلاقی اور ناجائز مواد ڈاؤنلوڈ کرنا ممنوع ہے۔\nیہ لنک اس ایپ میں قبول نہیں کیا جائے گا۔' };
  }
  const MUSIC_HOSTS = ['spotify.com','music.youtube.com','music.apple.com','deezer.com','gaana.com','jiosaavn.com','saavn.com','wynk.in','tidal.com','napster.com','anghami.com','audiomack.com','boomplay.com','bandcamp.com','mixcloud.com','soundcloud.com'];
  if (MUSIC_HOSTS.some(m => host === m || host.endsWith('.' + m))) {
    return { error: 'یہ ڈاؤنلوڈ ممنوع ہے۔ اس ایپ میں خالص موسیقی اور گانوں پر مبنی مواد ڈاؤنلوڈ کرنے کی اجازت نہیں۔' };
  }
  if (host === 'youtu.be') {
    const id = parsed.pathname.split('/').filter(Boolean)[0];
    if (!id) return { error: 'یہ یوٹیوب کا درست لنک نہیں ہے۔' };
    const out = new URL('https://www.sosyoutube.com/watch');
    out.searchParams.set('v', id);
    const time = parsed.searchParams.get('t');
    if (time) out.searchParams.set('t', time);
    return { url: out.href };
  }
  if (/^(www\.|m\.|music\.)?youtube\.com$/i.test(host)) {
    parsed.hostname = `${host.match(/^(www\.|m\.|music\.)?/)?.[0] || 'www.'}sosyoutube.com`;
    return { url: parsed.href };
  }
  // Every other site: the helper service opens with the link already filled in and starts by itself.
  return { url: 'https://cobalt.tools/#' + encodeURIComponent(parsed.href) };
}

document.querySelector('#paste').addEventListener('click', async () => {
  try { input.value = await navigator.clipboard.readText(); input.focus(); }
  catch { showError('براہِ کرم لنک خود پیسٹ کریں۔'); }
});

document.querySelector('#download').addEventListener('click', () => {
  error.hidden = true;
  const r = convert(input.value);
  if (r.error) { showError(r.error); return; }
  input.value = '';
  window.location.assign(r.url);
});

document.querySelector('#aboutBtn').addEventListener('click', () => { about.hidden = false; });
document.querySelector('#aboutClose').addEventListener('click', () => { about.hidden = true; });
about.addEventListener('click', e => { if (e.target === about) about.hidden = true; });

const terms = document.querySelector('#terms');
function termsOk() { try { return localStorage.getItem('terms-v1') === '1'; } catch { return false; } }
document.querySelector('#termsOk').addEventListener('click', () => {
  try { localStorage.setItem('terms-v1', '1'); } catch {}
  terms.hidden = true;
});
document.querySelector('#termsNo').addEventListener('click', () => {
  document.body.innerHTML = '<p style="padding:40px;text-align:center;font-size:18px;line-height:2">عہد قبول کیے بغیر ایپ استعمال نہیں ہو سکتی۔ ایپ دوبارہ کھولیں۔</p>';
});

window.addEventListener('load', () => {
  if (!termsOk()) setTimeout(() => { terms.hidden = false; }, 2300);
  setTimeout(() => splash.classList.add('hidden'), 2200);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
});
