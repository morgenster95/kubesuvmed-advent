/**
 * NASTAVENÍ WEBU
 *
 * 1) Firebase – zkopírujte z Firebase Console → Project settings → Your apps → Web app.
 *    Tyto hodnoty nejsou tajné (jsou vidět v každém webu, který Firebase používá).
 *    Dokud je apiKey prázdný, web běží v UKÁZKOVÉM režimu (přihlášení jen e-mailem, data jen v prohlížeči).
 */
export const FIREBASE = {
  apiKey: 'AIzaSyCX8rTyVYunrnZS7vMC58d2eqQTs3aiABk',
  authDomain: 'kubesuvmed-advent.firebaseapp.com',
  projectId: 'kubesuvmed-advent',
  storageBucket: 'kubesuvmed-advent.firebasestorage.app',
  messagingSenderId: '285914020856',
  appId: '1:285914020856:web:93073dad155c693f94f40d',
};

/** 'draft' = u kupónů a soutěží se ukazuje upozornění „ukázkový obsah“. Před spuštěním přepněte na 'live'. */
export const CONTENT_MODE: 'draft' | 'live' = 'draft';

/**
 * Klíč pro náhled všech okének před 1. prosincem: otevřete web s ?nahled=KLÍČ
 * (vypnutí: ?nahled=off). Kalendář je statický, takže nejde o zabezpečení – jen o pohodlné testování.
 */
export const PREVIEW_KEY = 'medovyadvent';

export const firebaseEnabled = () => !!FIREBASE.apiKey && !!FIREBASE.projectId;

/**
 * UKÁZKOVÁ VERZE PRO PREZENTACI
 * true = vše je odemčené a dá se proklikat bez přihlášení (postup se ukládá jen v prohlížeči).
 * Před ostrým spuštěním kampaně přepněte na false.
 */
export const DEMO_MODE = true;
