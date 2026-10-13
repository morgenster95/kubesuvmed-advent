/**
 * NASTAVENÍ WEBU
 *
 * 1) Firebase – zkopírujte z Firebase Console → Project settings → Your apps → Web app.
 *    Tyto hodnoty nejsou tajné (jsou vidět v každém webu, který Firebase používá).
 *    Dokud je apiKey prázdný, web běží v UKÁZKOVÉM režimu (přihlášení jen e-mailem, data jen v prohlížeči).
 */
export const FIREBASE = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
};

/** 'draft' = u kupónů a soutěží se ukazuje upozornění „ukázkový obsah“. Před spuštěním přepněte na 'live'. */
export const CONTENT_MODE: 'draft' | 'live' = 'draft';

/**
 * Klíč pro náhled všech okének před 1. prosincem: otevřete web s ?nahled=KLÍČ
 * (vypnutí: ?nahled=off). Kalendář je statický, takže nejde o zabezpečení – jen o pohodlné testování.
 */
export const PREVIEW_KEY = 'medovyadvent';

export const firebaseEnabled = () => !!FIREBASE.apiKey && !!FIREBASE.projectId;
