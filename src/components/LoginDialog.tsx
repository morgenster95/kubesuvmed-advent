import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Mail, MailCheck, X } from 'lucide-react';
import { backend } from '../backend';
import { BASE } from '../content';
import { Pine } from './Decor';

interface Props {
  open: boolean;
  reason?: string;
  onClose: () => void;
  onSignedIn: () => void;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function LoginDialog({ open, reason, onClose, onSignedIn }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [busy, setBusy] = useState<'' | 'google' | 'email'>('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) { d.showModal(); setSent(false); setError(''); }
    if (!open && d.open) d.close();
  }, [open]);

  const fb = backend.mode === 'firebase';

  async function google() {
    setBusy('google'); setError('');
    try { await backend.signInGoogle(newsletter); onSignedIn(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(''); }
  }

  async function byEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy('email'); setError('');
    try {
      const r = await backend.signInEmail(email.trim(), newsletter);
      if (r === 'sent') setSent(true); else onSignedIn();
    } catch (er) { setError((er as Error).message); }
    finally { setBusy(''); }
  }

  return (
    <dialog ref={ref} className="login" aria-labelledby="login-title" onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="login-card">
        <button className="modal-close" aria-label="Zavřít" onClick={onClose}><X size={20} /></button>
        <Pine className="login-pine" />
        <img className="login-logo" src={BASE + 'assets/foto/logo.webp'} alt="Kubešova medová manufaktura" />
        {sent ? (
          <div className="login-sent" role="status">
            <MailCheck size={44} />
            <h2 id="login-title">Mrkněte do e-mailu</h2>
            <p>Na adresu <b>{email}</b> jsme poslali odkaz pro přihlášení. Stačí na něj kliknout – a jste uvnitř.</p>
            <small>Nic nepřišlo? Zkontrolujte složku Hromadné nebo Spam, případně <button className="link" onClick={() => setSent(false)}>zkuste to znovu</button>.</small>
          </div>
        ) : (
          <>
            <div className="eyebrow center">Váš medový advent</div>
            <h2 id="login-title">{reason || 'Přihlaste se a otevírejte okénka'}</h2>
            <p className="login-lead">Otevřená okénka, recepty i slevové kódy si pamatujeme za vás – najdete je na mobilu i počítači.</p>

            {fb && (
              <button className="btn google" onClick={google} disabled={!!busy}>
                <GoogleIcon /> {busy === 'google' ? 'Přihlašuji…' : 'Pokračovat přes Google'}
              </button>
            )}
            {fb && <div className="or"><span>nebo e-mailem</span></div>}

            <form onSubmit={byEmail} className="login-form">
              <label htmlFor="login-email" className="sr-only">E-mail</label>
              <div className="input-icon">
                <Mail size={18} />
                <input id="login-email" type="email" required autoComplete="email" placeholder="vas@email.cz" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button className="btn primary" disabled={!!busy}>
                {busy === 'email' ? 'Odesílám…' : fb ? 'Poslat přihlašovací odkaz' : 'Vstoupit'} <ArrowRight size={17} />
              </button>
            </form>

            <label className="check small">
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
              <span>Chci občas dostat e-mail s medovými novinkami a nabídkami. (Nepovinné, odhlásit se jde kdykoli.)</span>
            </label>
            {error && <div className="form-error" role="alert">{error}</div>}
            {!fb && <p className="legal demo">Ukázkový režim: přihlášení bez ověření, postup se ukládá jen v tomto prohlížeči.</p>}
            <p className="legal">Přihlášením souhlasíte se zpracováním e-mailu za účelem provozu adventního kalendáře. <a href="#soukromi" onClick={onClose}>Více o soukromí</a></p>
          </>
        )}
      </div>
    </dialog>
  );
}
