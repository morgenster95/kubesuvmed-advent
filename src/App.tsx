import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Eye, Gift, Music, Share2, Sparkles, Volume2, VolumeX, LogIn, Heart, Leaf, Truck, Award } from 'lucide-react';
import { availableDay, BASE, CONTEST_DAYS, doors as ALL_DOORS } from './content';
import { CONTENT_MODE, PREVIEW_KEY } from './config';
import { backend } from './backend';
import type { Door, Progress, User } from './types';
import { Honeycomb } from './components/Honeycomb';
import { DoorModal } from './components/DoorModal';
import { LoginDialog } from './components/LoginDialog';
import { GiftsDrawer } from './components/GiftsDrawer';
import { Bee, Celebrate, Garland, HoneyDrip, Pine, Snow } from './components/Decor';

const A = BASE + 'assets/';
const F = A + 'foto/';
const SHOP = 'https://www.kubesuvmed.cz/';
const EVE = Date.parse('2026-12-24T00:00:00+01:00');
const draft = CONTENT_MODE !== 'live';

function readPreview(): boolean {
  try {
    const url = new URL(location.href);
    const q = url.searchParams.get('nahled');
    if (q !== null) {
      if (q === PREVIEW_KEY) sessionStorage.setItem('kmed-nahled', '1');
      else sessionStorage.removeItem('kmed-nahled');
      url.searchParams.delete('nahled');
      history.replaceState(null, '', url);
    }
    return sessionStorage.getItem('kmed-nahled') === '1';
  } catch { return false; }
}

function useCountdown() {
  const calc = () => {
    const s = Math.max(0, Math.floor((EVE - Date.now()) / 1000));
    return [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
  };
  const [v, setV] = useState(calc);
  useEffect(() => { const id = setInterval(() => setV(calc()), 1000); return () => clearInterval(id); }, []);
  return v;
}

const plural = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many);

export default function App() {
  const [preview, setPreview] = useState(readPreview);
  const [today, setToday] = useState(() => availableDay());
  const max = preview ? 24 : today;
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [progress, setProgress] = useState<Progress>({ opened: {}, entries: [], newsletter: false });
  const [modalDay, setModalDay] = useState<number | null>(null);
  const [opening, setOpening] = useState<number | null>(null);
  const [login, setLogin] = useState<{ open: boolean; reason?: string; pendingDay?: number }>({ open: false });
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState('');
  const [burst, setBurst] = useState(0);
  const [sound, setSound] = useState(false);
  const [gate, setGate] = useState(() => { try { return sessionStorage.getItem('kmed-gate') !== '1'; } catch { return true; } });
  const audio = useRef<HTMLAudioElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const trigger = useRef<HTMLElement | null>(null);
  const countdown = useCountdown();

  const notify = useCallback((s: string) => {
    setToast(s);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4200);
  }, []);

  // přihlášení
  useEffect(() => {
    let off: (() => void) | undefined;
    backend.completeEmailLink().then((ok) => ok && notify('Jste přihlášeni. Krásný advent!')).catch((e) => notify((e as Error).message));
    backend.watch((u) => { setUser(u); setAuthReady(true); }).then((f) => { off = f; });
    return () => off?.();
  }, [notify]);

  // postup uživatele
  useEffect(() => {
    if (!user) { setProgress({ opened: {}, entries: [], newsletter: false }); return; }
    backend.load(user, preview).then(setProgress).catch(() => notify('Nepodařilo se načíst vaše okénka. Zkuste obnovit stránku.'));
  }, [user, preview, notify]);

  // půlnoc → nové okénko
  useEffect(() => { const id = setInterval(() => setToday(availableDay()), 30000); return () => clearInterval(id); }, []);

  const openedMap = useMemo(() => {
    const m = new Map<number, Door['type']>();
    for (const d of Object.keys(progress.opened).map(Number)) if (d <= max) m.set(d, ALL_DOORS[d - 1]?.type);
    return m;
  }, [progress.opened, max]);
  const openedDoors = useMemo(() => ALL_DOORS.filter((d) => openedMap.has(d.day)), [openedMap]);

  // hudba
  async function music(on: boolean) {
    if (!audio.current) {
      audio.current = new Audio(BASE + 'audio/vanoce.mp3');
      audio.current.loop = true;
      audio.current.volume = 0.38;
    }
    if (on) {
      try { await audio.current.play(); setSound(true); } catch { setSound(false); }
    } else { audio.current.pause(); setSound(false); }
  }
  useEffect(() => {
    const vis = () => { if (!audio.current) return; if (document.hidden) audio.current.pause(); else if (sound) audio.current.play().catch(() => {}); };
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, [sound]);

  function enter(withMusic: boolean) {
    setGate(false);
    try { sessionStorage.setItem('kmed-gate', '1'); } catch { /* */ }
    if (withMusic) void music(true);
  }

  const openDoor = useCallback(async (day: number, el?: HTMLElement) => {
    if (el) trigger.current = el;
    if (day > max) {
      notify(max === 0 ? `Trpělivost, med se nekvapí. Okénko ${day} se otevře ${day}. prosince.` : `Okénko ${day} se otevře ${day}. prosince. Na dobré věci se vyplatí počkat.`);
      return;
    }
    if (!user) { setLogin({ open: true, reason: 'Přihlaste se a otevřete okénko', pendingDay: day }); return; }
    const already = !!progress.opened[day];
    if (!already) {
      setOpening(day);
      await new Promise((r) => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 750));
      setOpening(null);
      setProgress((p) => ({ ...p, opened: { ...p.opened, [day]: new Date().toISOString() } }));
      backend.markOpened(user, day, preview).catch(() => notify('Okénko se nepodařilo uložit k účtu. Zkuste to prosím znovu.'));
      setBurst((b) => b + 1);
    }
    setModalDay(day);
    const url = new URL(location.href); url.searchParams.set('den', String(day)); history.replaceState(null, '', url);
  }, [max, user, progress.opened, preview, notify]);

  // po přihlášení otevřít okénko, na které uživatel klikl
  useEffect(() => {
    if (user && login.pendingDay && !login.open) { const d = login.pendingDay; setLogin({ open: false }); void openDoor(d); }
  }, [user, login, openDoor]);

  // odkaz ?den=5
  const deepLinked = useRef(false);
  useEffect(() => {
    if (deepLinked.current || !authReady || gate) return;
    const n = Number(new URLSearchParams(location.search).get('den'));
    if (n >= 1 && n <= 24) { deepLinked.current = true; void openDoor(n); }
  }, [authReady, gate, openDoor]);

  function closeModal() {
    setModalDay(null);
    const url = new URL(location.href); url.searchParams.delete('den'); history.replaceState(null, '', url);
    trigger.current?.focus();
  }

  async function share() {
    const url = new URL(location.origin + BASE);
    if (modalDay) url.searchParams.set('den', String(modalDay));
    try {
      if (navigator.share) { await navigator.share({ title: 'Medový advent s Kubešovými', text: '24 medových překvapení až do Štědrého dne 🍯', url: url.href }); return; }
      await navigator.clipboard.writeText(url.href);
      notify('Odkaz je zkopírovaný. Pošlete trochu medové radosti dál.');
    } catch (e) { if ((e as Error).name !== 'AbortError') notify('Sdílení se nepodařilo. Odkaz zkopírujte z adresního řádku.'); }
  }
  async function copy(code: string) {
    try { await navigator.clipboard.writeText(code); notify(`Kód ${code} je zkopírovaný.`); }
    catch { notify('Kód prosím označte a zkopírujte ručně.'); }
  }
  async function logout() {
    await backend.signOut(); setDrawer(false); notify('Byli jste odhlášeni. Těšíme se zase zítra!');
  }

  useEffect(() => {
    document.body.style.overflow = gate ? 'hidden' : '';
  }, [gate]);

  const door = modalDay ? ALL_DOORS[modalDay - 1] : null;
  const openedCount = openedMap.size;
  const status = preview ? 'Režim náhledu – všechna okénka jsou odemčená'
    : max === 0 ? 'První okénko otevřeme 1. prosince o půlnoci'
    : max >= 24 ? 'Všechna okénka jsou odemčená. Veselé Vánoce!'
    : openedMap.has(max) ? `Dnešní okénko máte otevřené. Zítra čeká ${max + 1}.`
    : `Dnes na vás čeká okénko číslo ${max}`;

  return (
    <>
      {preview && (
        <div className="preview-bar">
          <Eye size={15} /> Náhled: všechna okénka odemčená{draft ? ' · obsah je ukázkový' : ''}
          <button onClick={() => { try { sessionStorage.removeItem('kmed-nahled'); } catch { /* */ } setPreview(false); }}>Ukončit</button>
        </div>
      )}

      {/* ------------------------------------------------------------- HERO */}
      <div className="night">
        <Snow />
        <Garland />
        <header className="topbar wrap">
          <a href={SHOP} className="brand" target="_blank" rel="noreferrer" aria-label="Kubešova medová manufaktura – e-shop">
            <img src={F + 'logo.webp'} alt="Kubešova medová manufaktura" />
          </a>
          <nav aria-label="Ovládání">
            <button className="chip" onClick={() => music(!sound)} aria-pressed={sound} aria-label={sound ? 'Vypnout hudbu' : 'Zapnout hudbu'}>
              {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}<span className="hide-sm">{sound ? 'Hudba hraje' : 'Hudba'}</span>
            </button>
            <button className="chip hide-xs" onClick={share} aria-label="Sdílet kalendář"><Share2 size={16} /></button>
            {user ? (
              <button className="chip gold" onClick={() => setDrawer(true)}>
                <Gift size={16} /><span>Moje dárky</span>{openedCount > 0 && <b className="badge">{openedCount}</b>}
              </button>
            ) : (
              <button className="chip gold" onClick={() => setLogin({ open: true })}><LogIn size={16} /><span>Přihlásit</span></button>
            )}
          </nav>
        </header>

        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow light"><span className="line" /> Adventní kalendář 2026</div>
            <h1>Vánoce, které<br /><em>chutnají po medu.</em></h1>
            <p>24 dní, 24 malých radostí z naší rodinné včelí farmy. Recepty, tipy, slevy i soutěže – každý den o půlnoci se odemkne jedna buňka medové plástve.</p>
            <div className="hero-cta">
              <a href="#kalendar" className="btn primary big">{user ? 'Otevřít kalendář' : 'Vstoupit do kalendáře'} <ArrowRight size={18} /></a>
              {!user && <button className="btn ghost" onClick={() => setLogin({ open: true })}><LogIn size={17} /> Přihlásit se</button>}
            </div>
            <div className="hero-note"><Heart size={14} /> S láskou od Kubešů z Olomouce</div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="arch"><img src={F + 'ig_med.webp'} alt="" /></div>
            <div className="round r1"><img src={F + 'onas2.webp'} alt="" /></div>
            <div className="round r2"><img src={F + 'ig_vcelin.webp'} alt="" /></div>
            <img className="bottle" src={A + 'medovina-aronie-cut.webp'} alt="" />
            <div className="seal"><span>sladké čekání</span><strong>24</strong><span>dní do Vánoc</span></div>
            <Pine className="hero-pine" />
            <Bee className="fly f1" />
            <Bee className="fly f2" />
          </div>
        </section>

        <section className="countdown wrap" aria-label="Odpočet do Štědrého dne">
          <div className="cd-label">Do Štědrého večera<br /><b>zbývá</b></div>
          <div className="cd-time">
            {countdown.map((v, i) => (
              <div key={i}><strong>{String(v).padStart(2, '0')}</strong><span>{[plural(v, 'den', 'dny', 'dní'), plural(v, 'hodina', 'hodiny', 'hodin'), plural(v, 'minuta', 'minuty', 'minut'), plural(v, 'sekunda', 'sekundy', 'sekund')][i]}</span></div>
            ))}
          </div>
          <div className="cd-note"><Sparkles size={18} /> To nejhezčí je někdy samotné těšení.</div>
        </section>
      </div>
      <HoneyDrip />

      {/* --------------------------------------------------------- CALENDAR */}
      <main>
        <section id="kalendar" className="calendar wrap">
          <div className="cal-head">
            <div>
              <div className="eyebrow">Malé radosti, den za dnem</div>
              <h2>Medová plástev <em>plná překvapení</em></h2>
            </div>
            <p>Za každou buňkou se skrývá recept, tip na dárek, příběh ze včelína nebo sleva do e-shopu. Vše, co otevřete, si pamatujeme u vašeho účtu.</p>
          </div>
          <div className="cal-bar">
            <div className="progress">
              <span>{user ? <><b>{openedCount}</b> z 24 radostí objeveno</> : 'Přihlaste se a začněte sbírat radosti'}</span>
              <div className="track"><i style={{ width: `${(openedCount / 24) * 100}%` }} /></div>
            </div>
            <span className="status">{status}</span>
          </div>

          <Honeycomb max={max} opened={openedMap} opening={opening} onOpen={openDoor} />

          <div className="cal-foot">
            {user ? (
              <span>Přihlášeni jako <b>{user.email}</b> · <button className="link" onClick={() => setDrawer(true)}>Moje dárky</button></span>
            ) : (
              <button className="btn primary" onClick={() => setLogin({ open: true })}><LogIn size={17} /> Přihlásit se a začít</button>
            )}
          </div>
        </section>

        {/* ----------------------------------------------------- STORY */}
        <section className="story wrap">
          <div className="story-photos" aria-hidden="true">
            <img className="sp1" src={F + 'onas1.webp'} alt="" loading="lazy" />
            <img className="sp2" src={F + 'efa3348.webp'} alt="" loading="lazy" />
            <img className="sp3" src={A + 'plastve.jpg'} alt="" loading="lazy" />
          </div>
          <div className="story-copy">
            <div className="eyebrow">Rodinná včelí farma od roku 2002</div>
            <h2>Od včel až <em>pod stromeček</em></h2>
            <p>O stovky včelstev se staráme v kopcích, lukách a lesích Nízkého Jeseníku a Litovelského Pomoraví. Med i medovinu zpracováváme kousek od domova v Olomouci–Neředíně – s velkým podílem ruční práce a bez přídavku cukru, barviv a éček.</p>
            <ul className="perks">
              <li><Leaf size={18} /> Čisté přírodní produkty</li>
              <li><Award size={18} /> Medovina roku 2019</li>
              <li><Truck size={18} /> Přímo od výrobce</li>
            </ul>
            <a className="text-link" href={SHOP + 'o-nas/'} target="_blank" rel="noreferrer">Přečíst náš příběh <ArrowUpRight size={16} /></a>
          </div>
        </section>

        {/* ------------------------------------------------------ GIFTS */}
        <section className="gifts">
          <div className="wrap">
            <div className="gifts-head">
              <div>
                <div className="eyebrow">Pod stromeček od srdce</div>
                <h2>Darujte něco <em>opravdu dobrého</em></h2>
              </div>
              <a className="text-link" href={SHOP} target="_blank" rel="noreferrer">Celý e-shop <ArrowUpRight size={16} /></a>
            </div>
            <div className="products">
              {[
                { img: A + 'med-pastovany-cut.webp', tag: 'Pro sladká rána', name: 'Květový pastovaný med', url: SHOP + 'med/' },
                { img: F + 'zimniset.webp', tag: 'Dárkové sady · 18+', name: 'Zimní set medovin', url: SHOP + 'medovina/' },
                { img: F + 'degust.webp', tag: 'Ochutnávka · 18+', name: 'Degustační set medovin', url: SHOP + 'medovina/' },
                { img: F + 'luxset.webp', tag: 'Pro znalce · 18+', name: 'Luxusní set medovin', url: SHOP + 'medovina/' },
              ].map((p) => (
                <a className="product" href={p.url} target="_blank" rel="noreferrer" key={p.name}>
                  <div className="product-img"><img src={p.img} alt={p.name} loading="lazy" /></div>
                  <span>{p.tag}</span>
                  <h3>{p.name} <ArrowUpRight size={16} /></h3>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="closing">
          <Pine className="closing-pine" />
          <Bee className="closing-bee" />
          <h2>Ať mají ty nejhezčí chvíle <em>chuť medu.</em></h2>
          <p>Krásný advent přeje Kubešova medová manufaktura.</p>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <img src={F + 'logo.webp'} alt="Kubešova medová manufaktura" />
          <div className="footer-links">
            <a href={SHOP} target="_blank" rel="noreferrer">E-shop ↗</a>
            <a href="https://www.instagram.com/kubesuvmed/" target="_blank" rel="noreferrer">Instagram ↗</a>
            <a href="https://www.facebook.com/Kubesuvmed/" target="_blank" rel="noreferrer">Facebook ↗</a>
          </div>
          <div id="soukromi" className="privacy">
            <h3>Soukromí</h3>
            <p>Pro přihlášení používáme službu Firebase (Google). Ukládáme váš e-mail, případně jméno z účtu Google, která okénka jste otevřeli, soutěžní odpovědi a to, zda chcete dostávat novinky. Údaje slouží jen k provozu adventního kalendáře, vyhodnocení soutěží a – pokud jste o to požádali – k zasílání novinek. Podrobnosti o zpracování osobních údajů najdete na <a href={SHOP + 'gdpr/'} target="_blank" rel="noreferrer">kubesuvmed.cz</a>.</p>
          </div>
          <small>© 2026 Kubešova medová manufaktura · Okénka se otevírají o půlnoci (Europe/Prague) · Hudba: vlastní aranžmá lidových koled</small>
        </div>
      </footer>

      {/* ---------------------------------------------------------- LAYERS */}
      {gate && (
        <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
          <Snow count={90} />
          <div className="gate-card">
            <img className="gate-logo" src={F + 'logo.webp'} alt="Kubešova medová manufaktura" />
            <div className="gate-comb" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i} />)}<Bee className="gate-bee" /></div>
            <div className="eyebrow light center">Malá radost. Každý den.</div>
            <h2 id="gate-title">Vítejte v našem<br /><em>medovém adventu</em></h2>
            <p>Na chvíli zpomalte. Vánoční kouzlo už na vás čeká.</p>
            <button className="btn primary big" onClick={() => enter(true)} autoFocus><Music size={18} /> Vstoupit s vánoční hudbou</button>
            <button className="btn link light" onClick={() => enter(false)}>Vstoupit bez hudby</button>
          </div>
        </div>
      )}

      <DoorModal
        door={door}
        draft={draft}
        entered={!!door && progress.entries.includes(door.day)}
        canPrev={!!door && door.day > 1}
        canNext={!!door && door.day < max}
        onPrev={() => door && openDoor(door.day - 1)}
        onNext={() => door && openDoor(door.day + 1)}
        onClose={closeModal}
        onShare={share}
        onCopy={copy}
        onEnter={async (day, answer) => {
          if (!user) throw new Error('Nejste přihlášeni.');
          if (!CONTEST_DAYS.includes(day)) throw new Error('Soutěž v tomto okénku neprobíhá.');
          const a = answer.trim();
          if (a.length < 3) throw new Error('Odpověď prosím napište alespoň třemi znaky.');
          await backend.submitEntry(user, day, a, preview);
          setProgress((p) => ({ ...p, entries: [...p.entries, day] }));
          setBurst((b) => b + 1);
        }}
      />
      <LoginDialog
        open={login.open}
        reason={login.reason}
        onClose={() => setLogin({ open: false })}
        onSignedIn={() => { setLogin((l) => ({ ...l, open: false })); notify('Jste přihlášeni. Krásný advent!'); }}
      />
      <GiftsDrawer
        open={drawer}
        user={user}
        newsletter={progress.newsletter}
        doors={openedDoors}
        onClose={() => setDrawer(false)}
        onPick={(d) => { setDrawer(false); void openDoor(d); }}
        onCopy={copy}
        onLogout={logout}
        onNewsletter={(v) => { if (!user) return; setProgress((p) => ({ ...p, newsletter: v })); backend.setNewsletter(user, v).catch(() => notify('Nastavení se nepodařilo uložit.')); }}
      />
      <Celebrate burst={burst} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
