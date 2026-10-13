import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, Share2, X } from 'lucide-react';
import type { Door } from '../types';
import { typeIcon } from './Honeycomb';
import { Bee } from './Decor';

export const LABELS: Record<string, string> = {
  tip: 'Malá radost', recipe: 'Z medové kuchyně', gift: 'Tip na dárek', discount: 'Adventní sleva', contest: 'Vánoční soutěž', story: 'Ze včelína',
};

interface Props {
  door: Door | null;
  draft: boolean;
  entered: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onShare: () => void;
  onCopy: (code: string) => void;
  onEnter: (day: number, answer: string) => Promise<void>;
}

export function DoorModal({ door, draft, entered, canPrev, canNext, onPrev, onNext, onClose, onShare, onCopy, onEnter }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = ref.current!;
    if (door && !d.open) d.showModal();
    if (!door && d.open) d.close();
    setMore(door?.type === 'recipe' ? false : false);
    setFormError('');
    bodyRef.current?.scrollTo(0, 0);
  }, [door]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!door || busy) return;
    const f = new FormData(e.currentTarget);
    setBusy(true); setFormError('');
    try { await onEnter(door.day, String(f.get('answer') || '')); }
    catch (er) { setFormError((er as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <dialog ref={ref} className="modal" aria-label={door?.title || 'Okénko'} onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      {door && (
        <div className="modal-card" key={door.day}>
          <button className="modal-close" aria-label="Zavřít" onClick={onClose}><X size={20} /></button>
          <div className={'modal-art' + (door.product ? ' product' : '') + (door.image ? '' : ' plain')}>
            {door.image && <img src={door.image} alt="" />}
            {!door.image && <div className="modal-glyph">{typeIcon(door.type, 64)}</div>}
            <div className="modal-day"><strong>{door.day}</strong><span>prosince</span></div>
            <Bee className="modal-bee" />
          </div>
          <div className="modal-body" ref={bodyRef}>
            <div className="eyebrow">{typeIcon(door.type, 14)} {LABELS[door.type]}</div>
            <h2>{door.title}</h2>
            <p className="lead">{door.text}</p>

            {door.code && (
              <div className="coupon">
                <div className="coupon-label">Váš slevový kód</div>
                <div className="coupon-row">
                  <code>{door.code}</code>
                  <button onClick={() => onCopy(door.code!)}><Copy size={16} /> Kopírovat</button>
                </div>
                {door.codeNote && draft && <small>{door.codeNote}</small>}
                <small>Kód máte uložený i v sekci <b>Moje dárky</b>.</small>
              </div>
            )}

            {door.more && (
              door.type === 'recipe' ? (
                <>
                  <button className="more-btn" aria-expanded={more} onClick={() => setMore(!more)}>{more ? 'Skrýt recept' : 'Zobrazit celý recept'} <ArrowRight size={16} /></button>
                  {more && <div className="more">{door.more}</div>}
                </>
              ) : <div className="more soft">{door.more}</div>
            )}

            {door.type === 'contest' && (
              <div className="contest">
                {draft && <div className="draft-note">Ukázková soutěž – výhry a pravidla doplníme před spuštěním.</div>}
                {entered ? (
                  <div className="success" role="status"><Check size={26} /><div><strong>Vaši odpověď máme.</strong><span>Výherce oznámíme e-mailem. Držíme palce!</span></div></div>
                ) : (
                  <form onSubmit={submit}>
                    <label htmlFor="answer">Vaše odpověď</label>
                    <textarea id="answer" name="answer" required minLength={3} maxLength={1000} rows={3} placeholder="Napište nám…" />
                    <label className="check"><input type="checkbox" required /> <span>Souhlasím s pravidly soutěže a se zpracováním odpovědi pro účely soutěže.</span></label>
                    {formError && <div className="form-error" role="alert">{formError}</div>}
                    <button className="btn primary" disabled={busy}>{busy ? 'Odesílám…' : 'Odeslat odpověď'} <ArrowRight size={17} /></button>
                  </form>
                )}
              </div>
            )}

            {door.url && (
              <div className="cta-row">
                <a className="btn primary" href={door.url} target="_blank" rel="noreferrer">{door.urlLabel || 'Do e-shopu'} <ArrowUpRight size={16} /></a>
                {door.adult && <small className="adult">Alkoholické nápoje prodáváme pouze osobám starším 18 let.</small>}
              </div>
            )}

            <nav className="modal-nav" aria-label="Další okénka">
              <button disabled={!canPrev} onClick={onPrev}><ChevronLeft size={17} /> Předchozí</button>
              <button onClick={onShare}><Share2 size={15} /> Sdílet</button>
              <button disabled={!canNext} onClick={onNext}>Další <ChevronRight size={17} /></button>
            </nav>
          </div>
        </div>
      )}
    </dialog>
  );
}
