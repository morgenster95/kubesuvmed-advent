/**
 * Přihlášení a ukládání postupu.
 *  - S Firebase: Google / odkaz do e-mailu + Firestore (users/{uid}, entries/{uid}_{den}).
 *  - Bez Firebase (ukázkový režim): přihlášení e-mailem bez ověření, data v localStorage.
 */
import { FIREBASE, firebaseEnabled } from './config';
import type { Progress, User } from './types';

const EMAIL_KEY = 'kmed-email-for-signin';
const NEWSLETTER_KEY = 'kmed-newsletter-optin';
const LOCAL_USER = 'kmed-local-user';
const localKey = (uid: string, preview: boolean) => `kmed-progress-${preview ? 'nahled' : 'live'}-${uid}`;

export interface Backend {
  mode: 'firebase' | 'local';
  /** spustí sledování přihlášení; vrací funkci pro odhlášení odběru */
  watch(cb: (u: User | null) => void): Promise<() => void>;
  /** dokončí přihlášení odkazem z e-mailu (pokud stránka byla otevřena z odkazu) */
  completeEmailLink(): Promise<boolean>;
  signInGoogle(newsletter: boolean): Promise<void>;
  /** firebase: pošle odkaz; local: rovnou přihlásí */
  signInEmail(email: string, newsletter: boolean): Promise<'sent' | 'signed-in'>;
  signOut(): Promise<void>;
  load(u: User, preview: boolean): Promise<Progress>;
  markOpened(u: User, day: number, preview: boolean): Promise<void>;
  submitEntry(u: User, day: number, answer: string, preview: boolean): Promise<void>;
  setNewsletter(u: User, v: boolean): Promise<void>;
}

/* ------------------------------------------------------------------ local */
function localBackend(): Backend {
  let listener: ((u: User | null) => void) | null = null;
  const read = (): User | null => { try { return JSON.parse(localStorage.getItem(LOCAL_USER) || 'null'); } catch { return null; } };
  const getP = (u: User, p: boolean): Progress => {
    try { return { opened: {}, entries: [], newsletter: false, ...JSON.parse(localStorage.getItem(localKey(u.uid, p)) || '{}') }; }
    catch { return { opened: {}, entries: [], newsletter: false }; }
  };
  const setP = (u: User, p: boolean, v: Progress) => { try { localStorage.setItem(localKey(u.uid, p), JSON.stringify(v)); } catch { /* */ } };
  return {
    mode: 'local',
    async watch(cb) { listener = cb; cb(read()); return () => { listener = null; }; },
    async completeEmailLink() { return false; },
    async signInGoogle() { throw new Error('Přihlášení přes Google zatím není nastavené.'); },
    async signInEmail(email, newsletter) {
      const u: User = { uid: 'local:' + email.toLowerCase(), email: email.toLowerCase(), name: null };
      try { localStorage.setItem(LOCAL_USER, JSON.stringify(u)); } catch { /* */ }
      const p = getP(u, false); p.newsletter = p.newsletter || newsletter; setP(u, false, p);
      listener?.(u);
      return 'signed-in';
    },
    async signOut() { try { localStorage.removeItem(LOCAL_USER); } catch { /* */ } listener?.(null); },
    async load(u, preview) { return getP(u, preview); },
    async markOpened(u, day, preview) { const p = getP(u, preview); p.opened[day] ||= new Date().toISOString(); setP(u, preview, p); },
    async submitEntry(u, day, _answer, preview) {
      const p = getP(u, preview);
      if (p.entries.includes(day)) throw new Error('V tomto okénku už vaši odpověď máme. Držíme palce!');
      p.entries.push(day); setP(u, preview, p);
    },
    async setNewsletter(u, v) { const p = getP(u, false); p.newsletter = v; setP(u, false, p); },
  };
}

/* --------------------------------------------------------------- firebase */
function firebaseBackend(): Backend {
  const sdk = (async () => {
    const [{ initializeApp, getApps }, auth, fs] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
    const app = getApps()[0] || initializeApp(FIREBASE);
    const a = auth.getAuth(app);
    a.languageCode = 'cs';
    const db = fs.getFirestore(app);
    return { a, auth, db, fs };
  })();

  const toUser = (u: { uid: string; email: string | null; displayName: string | null }): User => ({ uid: u.uid, email: (u.email || '').toLowerCase(), name: u.displayName });
  const userField = (preview: boolean) => (preview ? 'openedPreview' : 'opened');
  const entriesField = (preview: boolean) => (preview ? 'entriesPreview' : 'entries');

  async function ensureProfile(u: User, newsletter: boolean) {
    const { db, fs } = await sdk;
    const ref = fs.doc(db, 'users', u.uid);
    const snap = await fs.getDoc(ref);
    const now = fs.serverTimestamp();
    if (!snap.exists()) await fs.setDoc(ref, { email: u.email, name: u.name, newsletter, createdAt: now, lastSeenAt: now, opened: {}, entries: [] });
    else await fs.updateDoc(ref, { email: u.email, lastSeenAt: now, ...(newsletter ? { newsletter: true } : {}) });
  }
  const pendingNewsletter = () => { try { return localStorage.getItem(NEWSLETTER_KEY) === '1'; } catch { return false; } };

  return {
    mode: 'firebase',
    async watch(cb) {
      const { a, auth } = await sdk;
      // dokončení případného Google redirectu (když prohlížeč blokuje popup)
      auth.getRedirectResult(a).then((r) => r?.user && ensureProfile(toUser(r.user), pendingNewsletter())).catch(() => {});
      return auth.onAuthStateChanged(a, (u) => cb(u ? toUser(u) : null));
    },
    async completeEmailLink() {
      const { a, auth } = await sdk;
      const href = location.href;
      if (!auth.isSignInWithEmailLink(a, href)) return false;
      let email: string | null = null;
      try { email = localStorage.getItem(EMAIL_KEY); } catch { /* */ }
      if (!email) email = window.prompt('Pro dokončení přihlášení zadejte prosím svůj e-mail:');
      const clean = new URL(href);
      ['apiKey', 'oobCode', 'mode', 'lang', 'continueUrl', 'prihlaseni', 'tenantId'].forEach((k) => clean.searchParams.delete(k));
      history.replaceState(null, '', clean);
      if (!email) return false;
      try {
        const res = await auth.signInWithEmailLink(a, email, href);
        await ensureProfile(toUser(res.user), pendingNewsletter());
        try { localStorage.removeItem(EMAIL_KEY); } catch { /* */ }
        return true;
      } catch (e) { throw new Error(humanError((e as { code?: string }).code || '')); }
    },
    async signInGoogle(newsletter) {
      const { a, auth } = await sdk;
      const provider = new auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        const res = await auth.signInWithPopup(a, provider);
        await ensureProfile(toUser(res.user), newsletter);
      } catch (e) {
        const code = (e as { code?: string }).code || '';
        if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
          try { localStorage.setItem(NEWSLETTER_KEY, newsletter ? '1' : '0'); } catch { /* */ }
          await auth.signInWithRedirect(a, provider);
          return;
        }
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') throw new Error('Přihlášení bylo zrušeno.');
        throw new Error(humanError(code));
      }
    },
    async signInEmail(email, newsletter) {
      const { a, auth } = await sdk;
      const url = new URL(location.origin + import.meta.env.BASE_URL);
      url.searchParams.set('prihlaseni', '1');
      try { await auth.sendSignInLinkToEmail(a, email, { url: url.href, handleCodeInApp: true }); }
      catch (e) { throw new Error(humanError((e as { code?: string }).code || '')); }
      try { localStorage.setItem(EMAIL_KEY, email); localStorage.setItem(NEWSLETTER_KEY, newsletter ? '1' : '0'); } catch { /* */ }
      return 'sent';
    },
    async signOut() { const { a, auth } = await sdk; await auth.signOut(a); },
    async load(u, preview) {
      const { db, fs } = await sdk;
      const snap = await fs.getDoc(fs.doc(db, 'users', u.uid));
      if (!snap.exists()) { await ensureProfile(u, false); return { opened: {}, entries: [], newsletter: false }; }
      const d = snap.data();
      const raw = (d[userField(preview)] || {}) as Record<string, { toDate?: () => Date } | string>;
      const opened: Record<number, string> = {};
      for (const [k, v] of Object.entries(raw)) opened[Number(k)] = typeof v === 'string' ? v : v?.toDate?.().toISOString() || '';
      return { opened, entries: (d[entriesField(preview)] || []) as number[], newsletter: !!d.newsletter };
    },
    async markOpened(u, day, preview) {
      const { db, fs } = await sdk;
      await fs.setDoc(fs.doc(db, 'users', u.uid), { [userField(preview)]: { [day]: new Date().toISOString() } }, { merge: true });
    },
    async submitEntry(u, day, answer, preview) {
      const { db, fs } = await sdk;
      const id = `${u.uid}_${preview ? 'nahled_' : ''}${day}`;
      const ref = fs.doc(db, 'entries', id);
      try {
        await fs.setDoc(ref, { uid: u.uid, email: u.email, name: u.name, day, answer, preview, createdAt: fs.serverTimestamp() });
      } catch (e) {
        if ((e as { code?: string }).code === 'permission-denied') throw new Error('V tomto okénku už vaši odpověď máme. Držíme palce!');
        throw new Error('Odpověď se nepodařilo uložit. Zkuste to prosím znovu.');
      }
      await fs.setDoc(fs.doc(db, 'users', u.uid), { [entriesField(preview)]: fs.arrayUnion(day) }, { merge: true });
    },
    async setNewsletter(u, v) {
      const { db, fs } = await sdk;
      await fs.setDoc(fs.doc(db, 'users', u.uid), { newsletter: v }, { merge: true });
    },
  };
}

function humanError(code: string) {
  switch (code) {
    case 'auth/invalid-email': return 'Tahle e-mailová adresa nevypadá správně.';
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code': return 'Odkaz pro přihlášení už vypršel nebo byl použit. Pošlete si prosím nový.';
    case 'auth/network-request-failed': return 'Nepodařilo se připojit. Zkontrolujte připojení k internetu.';
    case 'auth/too-many-requests':
    case 'auth/quota-exceeded': return 'Příliš mnoho pokusů. Zkuste to prosím za chvíli.';
    case 'auth/unauthorized-domain':
    case 'auth/unauthorized-continue-uri': return 'Tato doména zatím není ve Firebase povolená (Authentication → Settings → Authorized domains).';
    case 'auth/operation-not-allowed': return 'Tento způsob přihlášení není ve Firebase zapnutý.';
    default: return 'Přihlášení se nepodařilo. Zkuste to prosím znovu.';
  }
}

export const backend: Backend = firebaseEnabled() ? firebaseBackend() : localBackend();
