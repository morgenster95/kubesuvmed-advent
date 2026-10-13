# Medový advent 2026 – Kubešova medová manufaktura

Adventní kalendář pro [kubesuvmed.cz](https://www.kubesuvmed.cz/): 24 buněk medové plástve, které se odemykají každý den o půlnoci (Europe/Prague). Přihlášení přes **Google** nebo **odkazem do e-mailu** (Firebase Authentication), otevřená okénka, slevové kódy a soutěžní odpovědi se ukládají k účtu ve **Firestore**. Web je statický a běží na **GitHub Pages**.

🌐 https://morgenster95.github.io/kubesuvmed-advent/

## Co kde je

| Soubor | Co obsahuje |
| --- | --- |
| `src/content.ts` | **obsah všech 24 okének** (texty, recepty, fotky, slevové kódy, odkazy) |
| `src/config.ts` | Firebase konfigurace, režim `draft`/`live`, klíč pro náhled |
| `src/App.tsx` | rozložení stránky |
| `src/styles.css` | vzhled (barvy a písmo podle kubesuvmed.cz) |
| `src/backend.ts` | přihlášení a ukládání (Firebase / ukázkový režim) |
| `firestore.rules` | bezpečnostní pravidla pro Firestore |
| `public/assets/` | fotky (z e-shopu kubesuvmed.cz), `public/audio/vanoce.mp3` hudba |

## Nastavení Firebase (jednorázově)

1. [Firebase Console](https://console.firebase.google.com/) → vytvořte projekt (nebo použijte existující) → **Add app → Web**.
2. Zkopírujte `apiKey`, `authDomain`, `projectId`, `appId` do `src/config.ts` a pushněte.
3. **Authentication → Sign-in method**: zapněte **Google** a **Email/Password** včetně volby **Email link (passwordless sign-in)**.
4. **Authentication → Settings → Authorized domains**: přidejte `morgenster95.github.io` (případně vlastní doménu).
5. **Firestore Database → Create database** (region `eur3` / `europe-west`) → záložka **Rules** → vložte obsah `firestore.rules` → Publish.

Dokud je `apiKey` prázdný, web běží v **ukázkovém režimu**: přihlášení jen e-mailem bez ověření a postup se ukládá pouze v prohlížeči.

## Náhled před 1. prosincem

Otevřete web s `?nahled=medovyadvent` – všechna okénka se odemknou (vypnutí `?nahled=off` nebo tlačítkem Ukončit). Náhledová otevření a soutěžní odpovědi se ukládají odděleně od ostrých (`openedPreview`, `entries/<uid>_nahled_<den>`).

## Před spuštěním kampaně

- [ ] Ve Shoptetu založte slevové kódy `ADVENT7`, `ADVENT14`, `ADVENT21` (nebo je v `src/content.ts` přepište) a doplňte `codeNote` s výší slevy a platností.
- [ ] Doplňte výhry a pravidla soutěží (okénka 5, 12, 19).
- [ ] V `src/config.ts` přepněte `CONTENT_MODE` na `'live'` (zmizí upozornění „ukázkový obsah“).
- [ ] Zkontrolujte informace o zpracování osobních údajů v patičce (`src/App.tsx`, sekce `#soukromi`).

> Web je statický, takže obsah budoucích okének je technicky součástí stránky. Pokud by slevové kódy musely zůstat do daného dne tajné, je potřeba je přesunout do Firestore s pravidlem podle data.

## Data pro marketing

Ve Firestore:
- `users/{uid}` – e-mail, jméno, `newsletter` (souhlas se zasíláním novinek), `opened` (den → čas otevření), `entries`
- `entries/{uid}_{den}` – soutěžní odpovědi (`day`, `answer`, `email`, `name`, `createdAt`)

Export: Firebase Console → Firestore → kolekce → případně přes Google Cloud *Import/Export*, nebo jednoduše filtr `newsletter == true`.

## Vývoj

```bash
npm install
npm run dev        # http://localhost:5173/kubesuvmed-advent/
npm run build      # výstup v dist/
```

Každý push do `main` se přes GitHub Actions automaticky sestaví a nasadí na GitHub Pages (`.github/workflows/deploy.yml`).

**Vlastní doména** (např. `advent.kubesuvmed.cz`): v GitHubu *Settings → Pages → Custom domain*, v DNS CNAME na `morgenster95.github.io`, a v *Settings → Secrets and variables → Actions → Variables* nastavte `BASE_PATH` = `/`. Doménu přidejte i do Firebase Authorized domains.

## Hudba

`public/audio/vanoce.mp3` je vlastní syntetizované aranžmá dvou volných děl – *Rolničky* (J. Pierpont, 1857) a *Tichá noc* (F. X. Gruber, 1818) – se zvonkohrou, celestou a rolničkami. Bez autorských práv třetích stran.
