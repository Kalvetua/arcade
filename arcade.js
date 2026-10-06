// Shared arcade helpers. Load before the game's own script.
// Games must not use Escape for anything else: it always returns to the hub.
window.Arcade = (() => {
  const get = key => { try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; } };
  const set = (key, v) => { try { localStorage.setItem(key, v); } catch {} };
  const readJSON = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const writeJSON = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };

  // The hub marks itself with <meta name="arcade-hub">; everywhere else Escape goes home.
  // Capture phase so no game handler can swallow it; keyup as a fallback for
  // browser extensions (Vimium, Tridactyl...) that eat the Escape keydown.
  if (!document.querySelector('meta[name="arcade-hub"]')) {
    let leaving = false;
    const home = e => {
      if (e.key !== 'Escape' || leaving) return;
      e.preventDefault();
      leaving = true;
      location.href = 'index.html';
    };
    addEventListener('keydown', home, true);
    addEventListener('keyup', home, true);

    // Backup route home that no extension intercepts: Alt+Shift+H (Firefox access key).
    addEventListener('DOMContentLoaded', () => {
      const back = document.querySelector('a.back');
      if (back) back.accessKey = 'h';
    });
  }

  // On touch screens, swap keyboard instructions (any .keys line with <kbd> in it) for the tap
  // instructions in its data-touch attribute. An empty data-touch hides the line.
  const touch = matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (touch) {
    document.documentElement.classList.add('touch');
    addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.keys').forEach(p => {
        if (!p.querySelector('kbd')) return;
        const text = p.dataset.touch ?? 'Tap the buttons on screen to play, and tap a text box when you need to type.';
        if (text) p.textContent = text; else p.hidden = true;
      });
    });
  }

  // Seeded randomness, so daily puzzles are the same for everyone on the same date.
  const pad = n => String(n).padStart(2, '0');
  const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hash = str => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619); return h >>> 0; };
  const seeded = seed => () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  // Days on which at least one daily puzzle was finished, oldest first.
  const LOG = 'dailyLog';
  function dailyStreak() {
    const days = new Set(readJSON(LOG) || []);
    const d = new Date();
    if (!days.has(dateKey(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (days.has(dateKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  return {
    best: get,
    // Saves score if it beats the stored best. Returns the (possibly new) best.
    record(key, score) {
      const b = get(key);
      if (score > b) { set(key, score); return score; }
      return b;
    },
    shuffle(arr, rand = Math.random) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    pick: (arr, rand = Math.random) => arr[Math.floor(rand() * arr.length)],
    // A repeatable random-number function from any string seed.
    seeded: str => seeded(hash(str)),

    // Daily mode. Returns null unless the page was opened with ?daily.
    // `rng` is the same for everyone today; `result` is today's saved result (null if not played yet).
    daily(game) {
      if (!new URLSearchParams(location.search).has('daily')) return null;
      const date = dateKey(), key = `daily:${game}:${date}`;
      return {
        date,
        rng: seeded(hash(`${game}:${date}`)),
        result: readJSON(key),
        finish(result) {
          writeJSON(key, result);
          const days = (readJSON(LOG) || []).filter(d => d !== date);
          writeJSON(LOG, [...days, date].slice(-400));
        },
      };
    },
    dailyResult: (game, date = dateKey()) => readJSON(`daily:${game}:${date}`),
    dailyStreak,
    touch,
  };
})();
