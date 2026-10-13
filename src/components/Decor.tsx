import { useEffect, useRef } from 'react';

/** Malá včelka (SVG) s mávajícími křidélky. */
export function Bee({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={'bee ' + className} style={style} viewBox="0 0 64 48" aria-hidden="true">
      <g className="bee-wings">
        <ellipse className="wing w1" cx="27" cy="13" rx="10" ry="13" />
        <ellipse className="wing w2" cx="38" cy="14" rx="8" ry="11" />
      </g>
      <g className="bee-body">
        <ellipse cx="32" cy="30" rx="17" ry="12" fill="#E8B23A" />
        <path d="M24 19.5c-2.3 6.6-2.3 14.4 0 21M32 18c-2 7.6-2 16.6 0 24M40 19.5c2 6.6 2 14.4 0 21" stroke="#3D322D" strokeWidth="4.2" fill="none" strokeLinecap="round" />
        <circle cx="49" cy="27" r="7.5" fill="#3D322D" />
        <circle cx="51.5" cy="25.5" r="1.6" fill="#FBF7EF" />
        <path d="M52 20q4-7 8-6M48 20q1-7 5-9" stroke="#3D322D" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M15 30l-5 1.5 5 1.5" fill="#3D322D" />
      </g>
    </svg>
  );
}

/** Větvička jedličky (line-art jako botanické kresby kubesuvmed.cz). */
export function Pine({ className = '' }: { className?: string }) {
  return (
    <svg className={'pine ' + className} viewBox="0 0 320 120" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M4 60C90 48 190 50 316 62" strokeWidth="2.6" />
        {Array.from({ length: 22 }, (_, i) => {
          const x = 14 + i * 13.5;
          const y = 58 - Math.sin(i / 3.4) * 2;
          return (
            <g key={i} strokeWidth="1.4">
              <path d={`M${x} ${y}q10 -16 22 -24`} />
              <path d={`M${x} ${y + 2}q10 16 22 24`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Girlanda: jedlová větev s medovými baňkami, které se jemně houpou. */
export function Garland() {
  const baubles = [
    { x: 9, c: 'var(--berry)', d: 0 }, { x: 22, c: 'var(--gold)', d: 0.6 }, { x: 37, c: 'var(--pine)', d: 1.2 },
    { x: 52, c: 'var(--gold)', d: 0.3 }, { x: 66, c: 'var(--berry)', d: 0.9 }, { x: 80, c: 'var(--gold)', d: 1.5 }, { x: 92, c: 'var(--pine)', d: 0.4 },
  ];
  return (
    <div className="garland" aria-hidden="true">
      <svg className="garland-branch" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d="M0 18 Q300 52 600 26 T1200 22" stroke="#4E6B53" strokeWidth="3" fill="none" />
        {Array.from({ length: 90 }, (_, i) => {
          const x = i * 13.5;
          const y = 18 + Math.sin((x / 1200) * Math.PI * 2.2) * 12 + 6;
          return <path key={i} d={`M${x} ${y} l${8 + (i % 3) * 2} ${-10 + (i % 4) * 5}`} stroke={i % 2 ? '#4E6B53' : '#6F8C6F'} strokeWidth="2.2" strokeLinecap="round" />;
        })}
      </svg>
      {baubles.map((b, i) => (
        <span key={i} className="bauble" style={{ left: b.x + '%', animationDelay: `-${b.d * 2}s`, ['--c' as string]: b.c, ['--len' as string]: `${18 + (i % 3) * 12}px` }}>
          <i />
        </span>
      ))}
    </div>
  );
}

/** Stékající med (okraj sekce). */
export function HoneyDrip({ className = '' }: { className?: string }) {
  return (
    <svg className={'honey-drip ' + className} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="hd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3A93B" />
          <stop offset="1" stopColor="#B87818" />
        </linearGradient>
      </defs>
      <path fill="url(#hd)" d="M0 0h1440v26c-40 0-52 10-60 28-6 14-24 14-28 0-8-26-30-30-70-30-60 0-70 6-86 36-10 20-34 20-40 0-10-30-36-36-110-36-90 0-120 4-140 24-10 10-26 10-30-2-8-20-40-22-130-22-80 0-110 8-122 40-8 22-34 22-40 0-8-34-40-40-150-40-70 0-96 6-110 22-8 10-24 8-28-4-8-18-40-18-150-18-60 0-70 8-80 26-8 16-26 16-32 0-10-26-40-26-114-26Z" />
      <circle className="drop d1" cx="300" cy="62" r="6" fill="#C98822" />
      <circle className="drop d2" cx="964" cy="70" r="5" fill="#C98822" />
      <circle className="drop d3" cx="1352" cy="58" r="5" fill="#C98822" />
    </svg>
  );
}

/** Jemné sněžení na plátně – v tmavých sekcích. */
export function Snow({ count = 70 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const flakes = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 2.2, s: 0.15 + Math.random() * 0.5, d: Math.random() * Math.PI * 2, g: Math.random() < 0.25 }));
    const resize = () => {
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(c);
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        if (!reduce) {
          f.y += f.s / h * 1.4 * 60 / 60;
          f.x += Math.sin(t / 2400 + f.d) * 0.00025;
          if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
        }
        ctx.beginPath();
        ctx.fillStyle = f.g ? 'rgba(236, 196, 120, .75)' : 'rgba(255, 250, 240, .8)';
        ctx.arc(f.x * w, f.y * h, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [count]);
  return <canvas ref={ref} className="snow" aria-hidden="true" />;
}

/** Konfety z malých šestiúhelníků, vloček a hvězdiček. */
export function Celebrate({ burst }: { burst: number }) {
  if (!burst) return null;
  const pieces = Array.from({ length: 36 }, (_, i) => i);
  return (
    <div className="celebrate" key={burst} aria-hidden="true">
      {pieces.map((i) => (
        <i key={i} className={['hx', 'sn', 'st'][i % 3]} style={{
          ['--x' as string]: `${(Math.cos(i * 2.4) * (120 + (i * 37) % 220)).toFixed(0)}px`,
          ['--y' as string]: `${(Math.sin(i * 2.4) * (90 + (i * 53) % 180) - 120).toFixed(0)}px`,
          ['--r' as string]: `${(i * 47) % 360}deg`,
          animationDelay: `${(i % 6) * 0.03}s`,
          color: ['#E3A93B', '#9E3B2F', '#4E6B53', '#F3D9A4'][i % 4],
        }}>{['⬢', '❄', '✦'][i % 3]}</i>
      ))}
    </div>
  );
}
