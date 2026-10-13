import { useEffect, useRef } from 'react';
import { Copy, X } from 'lucide-react';
import type { Door, User } from '../types';
import { typeIcon } from './Honeycomb';
import { LABELS } from './DoorModal';

interface Props {
  open: boolean;
  user: User | null;
  newsletter: boolean;
  doors: Door[];
  onClose: () => void;
  onPick: (day: number) => void;
  onCopy: (code: string) => void;
  onLogout: () => void;
  onNewsletter: (v: boolean) => void;
}

export function GiftsDrawer({ open, user, newsletter, doors, onClose, onPick, onCopy, onLogout, onNewsletter }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const sorted = [...doors].sort((a, b) => a.day - b.day);
  const codes = sorted.filter((d) => d.code);

  return (
    <dialog ref={ref} className="drawer" aria-labelledby="gifts-title" onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="drawer-card">
        <header>
          <div>
            <div className="eyebrow">Váš účet</div>
            <h2 id="gifts-title">Moje dárky</h2>
            {user && <div className="drawer-user">{user.email}</div>}
          </div>
          <button className="modal-close static" aria-label="Zavřít" onClick={onClose}><X size={20} /></button>
        </header>

        {codes.length > 0 && (
          <section className="drawer-codes">
            <h3>Slevové kódy</h3>
            {codes.map((d) => (
              <div className="mini-coupon" key={d.day}>
                <div><span>{d.day}. prosince</span><code>{d.code}</code></div>
                <button aria-label={`Kopírovat kód ${d.code}`} onClick={() => onCopy(d.code!)}><Copy size={16} /></button>
              </div>
            ))}
          </section>
        )}

        <section>
          <h3>Otevřená okénka <span className="count">{sorted.length}/24</span></h3>
          {sorted.length === 0 ? (
            <p className="muted">Zatím tu nic není. Otevřete první okénko a dárek se uloží sem.</p>
          ) : (
            <ul className="gift-list">
              {sorted.map((d) => (
                <li key={d.day}>
                  <button onClick={() => onPick(d.day)}>
                    <span className="gift-day">{d.day}</span>
                    <span className="gift-text"><small>{typeIcon(d.type, 12)} {LABELS[d.type]}</small><strong>{d.title}</strong></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {user && (
          <footer>
            <label className="check small">
              <input type="checkbox" checked={newsletter} onChange={(e) => onNewsletter(e.target.checked)} />
              <span>Posílat mi medové novinky e-mailem</span>
            </label>
            <button className="link" onClick={onLogout}>Odhlásit se</button>
          </footer>
        )}
      </div>
    </dialog>
  );
}
