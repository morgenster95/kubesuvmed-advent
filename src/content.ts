import type { Door } from './types';

/**
 * OBSAH KALENDÁŘE – všech 24 okének.
 * Okénko se odemyká o půlnoci českého času (Europe/Prague).
 *
 * Než kalendář pustíte ven:
 *  - kupony (code) založte v Shoptetu se stejným kódem a doplňte podmínky do codeNote,
 *  - u soutěží (type: 'contest') doplňte výhry a pravidla,
 *  - v src/config.ts přepněte CONTENT_MODE na 'live'.
 */
export const YEAR = 2026;

export const BASE = import.meta.env.BASE_URL;
const F = BASE + 'assets/foto/';
const A = BASE + 'assets/';
const SHOP = 'https://www.kubesuvmed.cz/';

export const CONTEST_DAYS = [5, 12, 19];

export const doors: Door[] = [
  {
    day: 1, type: 'tip', title: 'Vítejte v medovém adventu',
    text: 'Na chvíli se zastavte. Uvařte si oblíbený čaj, přidejte lžičku medu a nechte se vést. První prosincový den patří malým radostem.',
    image: F + 'ig_med.webp',
    more: 'Až do Štědrého dne tu na vás každý den čeká nové okénko. Všechno, co otevřete, se ukládá k vašemu účtu – recepty, tipy i dárky najdete kdykoli v sekci „Moje dárky“. Další okénko se odemyká vždy o půlnoci.',
  },
  {
    day: 2, type: 'recipe', title: 'Pečená hruška s medem a skořicí',
    text: 'Jednoduchý dezert, který provoní celý domov dřív, než stihnete prostřít.',
    image: A + 'plastve.jpg',
    more: 'Na 2 porce: 2 hrušky, 2 lžičky medu, hrst vlašských ořechů, špetka skořice, kousek másla.\n\nHrušky rozpulte a zbavte jádřinců. Vložte do pekáčku, na každou půlku dejte kousek másla a pečte asi 20 minut při 180 °C. Ještě teplé zakápněte medem, posypte ořechy a skořicí. Podávejte s bílým jogurtem.',
  },
  {
    day: 3, type: 'gift', title: 'Dárek, který zahřeje',
    text: 'Pro dlouhé zimní večery vyberte medovinu z rodinné manufaktury. Třeba ovocnou s aronií – sametovou, tmavou a jemně trpkou.',
    image: A + 'medovina-aronie-cut.webp', product: true, adult: true,
    url: SHOP + 'medovina/', urlLabel: 'Medoviny v e-shopu',
  },
  {
    day: 4, type: 'tip', title: 'Zabaleno s láskou',
    text: 'Hnědý papír, jutový provázek a větvička jedličky. K medovému dárku víc nepotřebujete.',
    image: F + 'efa3336.webp',
    more: 'Přivažte malou ručně psanou kartičku. Místo obyčejného „Veselé Vánoce“ zkuste napsat, na jaký společný zážitek se v novém roce těšíte.',
  },
  {
    day: 5, type: 'contest', title: 'Mikulášská medová nadílka',
    text: 'Jakou dobrotu byste letos přidali do mikulášské nadílky? Napište nám – vylosujeme výherce medového balíčku.',
    image: A + 'med-pastovany-cut.webp', product: true,
  },
  {
    day: 6, type: 'recipe', title: 'Medové máslo k nedělní snídani',
    text: 'Malý rituál pro pomalé ráno: měkké máslo, med a křupavý chléb.',
    image: F + 'ig_med.webp',
    more: 'Utřete 100 g změklého másla se 2 lžičkami medu a špetkou skořice. Namažte na teplý toast nebo vánočku. Uchovávejte v lednici a připravujte raději menší čerstvé dávky.',
  },
  {
    day: 7, type: 'discount', title: 'Sladší vánoční nákup',
    text: 'Dnes pro vás máme slevový kód do e-shopu. Ideální chvíle pořídit medové dárky pro celou rodinu.',
    image: F + 'efa3348.webp',
    code: 'ADVENT7', codeNote: 'Výše slevy a platnost kódu budou doplněny.',
    url: SHOP, urlLabel: 'Nakoupit v e-shopu',
  },
  {
    day: 8, type: 'tip', title: 'Med do čaje? Dejte mu chvilku',
    text: 'Nechte čaj nejdříve zchladnout na příjemnou teplotu k pití a teprve potom přidejte med. Vyniknou tak jeho chuť i vůně.',
    image: A + 'med-pastovany-cut.webp', product: true,
    more: 'Udělejte si z přípravy čaje malou pauzu. Odložte telefon, vezměte oblíbený hrnek a na pár minut jen buďte.',
  },
  {
    day: 9, type: 'recipe', title: 'Voňavé medové perníčky',
    text: 'Vánoční klasika, kterou nejlépe upečete společně – a s trochou nepořádku.',
    image: A + 'plastve.jpg',
    more: 'Smíchejte 300 g hladké mouky, 80 g moučkového cukru, lžičku perníkového koření a půl lžičky jedlé sody. Přidejte 1 vejce, 60 g změklého másla a 3 lžíce medu. Vypracujte těsto a nechte ho přes noc v chladu.\n\nVyválejte na 4 mm, vykrajujte a pečte při 170 °C přibližně 8–10 minut. Dobu upravte podle velikosti perníčků.',
  },
  {
    day: 10, type: 'gift', title: 'Něco malého. Něco medového.',
    text: 'Sklenice pastovaného medu potěší milovníky pomalých snídaní. Jemně krémový med se snadno roztírá a nekape.',
    image: A + 'med-pastovany-cut.webp', product: true,
    url: SHOP + 'med/', urlLabel: 'Medy v e-shopu',
    more: 'Med má rád klid: uchovávejte ho uzavřený, v suchu a mimo přímé slunce. Krystalizace je jeho přirozená vlastnost – není třeba se jí bát.',
  },
  {
    day: 11, type: 'story', title: 'Příběh z rodinné farmy',
    text: 'Na počátku stálo rozhodnutí jednoho muže odejít z prostředí plného oleje a prachu. Vyučený zámečník si pořídil první úly – a první včely Kubešovy rodiny vyletěly v roce 2002.',
    image: F + 'onas2.webp',
    more: 'Dnes se o stovky včelstev staráme v kopcích, lukách a lesích Nízkého Jeseníku a Litovelského Pomoraví. Med i medovinu zpracováváme kousek od rodinného domu v Olomouci–Neředíně. Medomety na ruční pohon nahradila moderní technologie, ale jedno zůstalo: spousta ruční práce a láska k řemeslu.',
  },
  {
    day: 12, type: 'contest', title: 'Vaše nejmilejší tradice',
    text: 'Která rodinná vánoční tradice je pro vás ta nejmilejší? Podělte se s námi – nejhezčí odpovědi odměníme.',
    image: F + 'efa3348.webp',
  },
  {
    day: 13, type: 'recipe', title: 'Zimní jablečný hrnek',
    text: 'Hřejivý nealkoholický nápoj na dlouhé prosincové večery.',
    image: A + 'plastve.jpg',
    more: 'Ohřejte 500 ml jablečného moštu se svitkem skořice a 2 hřebíčky. Nechte 10 minut louhovat a koření vyjměte. Rozlijte do dvou hrnků, přidejte plátek pomeranče a po mírném zchladnutí doslaďte medem.',
  },
  {
    day: 14, type: 'discount', title: 'Medová radost pro vaše blízké',
    text: 'Druhý adventní slevový kód. Medové dobroty, medovina i dárkové sady – vyberte si.',
    image: F + 'onas3.webp',
    code: 'ADVENT14', codeNote: 'Výše slevy a platnost kódu budou doplněny.',
    url: SHOP, urlLabel: 'Nakoupit v e-shopu',
  },
  {
    day: 15, type: 'tip', title: 'Darujte společný čas',
    text: 'Přiložte k dárku pozvánku na snídani. Nejhezčí část dárku totiž někdy není uvnitř krabičky.',
    image: F + 'onas1.webp',
    more: 'Napište třeba: „Jedna nedělní snídaně u nás. Káva, čerstvý chléb a med. Termín vybíráš ty.“',
  },
  {
    day: 16, type: 'gift', title: 'Pohlazení pod stromeček',
    text: 'Zimní set medovin je pozvánkou ke společnému ochutnávání. Dárek pro dospělé milovníky medových chutí.',
    image: F + 'zimniset.webp', product: true, adult: true,
    url: SHOP + 'medovina/', urlLabel: 'Dárkové sady medovin',
  },
  {
    day: 17, type: 'recipe', title: 'Ořechy v medovém kabátku',
    text: 'Křupavá maličkost k zimnímu odpoledni i na vánoční talíř.',
    image: A + 'plastve.jpg',
    more: 'Promíchejte 150 g vlašských ořechů s 1 lžící medu, lžičkou rozpuštěného másla a špetkou skořice. Rozprostřete na pečicí papír a pečte při 160 °C asi 10–12 minut. V polovině promíchejte a hlídejte, aby se nespálily. Nechte úplně vychladnout.',
  },
  {
    day: 18, type: 'story', title: 'Co dělají včely v zimě?',
    text: 'Nespí! Stáhnou se do zimního chomáče a drobným chvěním svalů se navzájem zahřívají. Uprostřed chomáče si udrží teplo i ve chvíli, kdy venku mrzne.',
    image: F + 'ig_vcelin.webp',
    more: 'Včely na okraji chomáče se postupně střídají s těmi uvnitř, aby nikdo nezmrzl. Energii berou ze zásob, které si nanosily přes léto. Včelař je v zimě nechává v klidu – a už teď se těší na první jarní prolet.',
  },
  {
    day: 19, type: 'contest', title: 'Vánoce chutnají po…',
    text: 'Doplňte větu: „Naše Vánoce chutnají po…“ Nejkrásnější odpověď odměníme medovým dárkem.',
    image: F + 'luxset.webp', product: true,
  },
  {
    day: 20, type: 'recipe', title: 'Pomerančový salát s medovou zálivkou',
    text: 'Svěží chvilka mezi pečením a balením dárků.',
    image: F + 'ig_med.webp',
    more: 'Nakrájejte 2 pomeranče, přidejte hrst rukoly a vlašských ořechů. Zálivku připravte z 1 lžíce olivového oleje, lžičky citronové šťávy a lžičky medu. Lehce promíchejte a hned podávejte.',
  },
  {
    day: 21, type: 'discount', title: 'Poslední adventní překvapení',
    text: 'Třetí a poslední slevový kód. Pozor na termíny doručení před Vánoci – a když to nestihnete, zastavte se u nás pro med ze dvora.',
    image: F + 'degust.webp', product: true,
    code: 'ADVENT21', codeNote: 'Výše slevy, platnost a termíny doručení budou doplněny.',
    url: SHOP, urlLabel: 'Nakoupit v e-shopu',
  },
  {
    day: 22, type: 'gift', title: 'Přípitek na společné chvíle',
    text: 'Svěží frizzante pro slavnostní okamžik. Malé bublinky, velká radost ze setkání.',
    image: A + 'frizzante-cut.webp', product: true, adult: true,
    url: SHOP + 'medovina/', urlLabel: 'Medoviny v e-shopu',
  },
  {
    day: 23, type: 'tip', title: 'Už nemusí být všechno hotové',
    text: 'Cukroví může být trochu křivé. Mašle nemusí být dokonalá. Nejdůležitější je, s kým Vánoce prožijete.',
    image: A + 'plastve.jpg',
    more: 'Dnes si dopřejte deset minut jen pro sebe. Zapalte svíčku, pusťte si oblíbenou koledu a vychutnejte si něco dobrého.',
  },
  {
    day: 24, type: 'gift', title: 'Šťastné a medové Vánoce',
    text: 'Děkujeme, že jste s námi strávili advent. Přejeme vám domov plný pohody, blízkých lidí a drobných sladkých radostí.',
    image: F + 'degust.webp', product: true,
    more: 'Ať mají ty nejhezčí chvíle chuť medu. Krásné Vánoce a pokojný nový rok přeje celá Kubešova medová manufaktura.',
  },
];

/** Den, který je dnes nejvýše dostupný (časové pásmo Europe/Prague). */
export function availableDay(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Prague', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (n: string) => Number(parts.find((x) => x.type === n)?.value);
  const y = get('year'), m = get('month'), d = get('day');
  if (y < YEAR || (y === YEAR && m < 12)) return 0;
  if (y > YEAR) return 24;
  return Math.min(24, d);
}
