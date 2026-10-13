import { useEffect, useState } from 'react';
import { BookOpen, Check, Gift, Leaf, Lock, Percent, Sparkles, Trophy, Heart } from 'lucide-react';
import type { DoorType } from '../types';

/** Pořadí okének v plástvi – rozházené jako u opravdového adventního kalendáře. */
const ORDER = [7, 15, 2, 20, 11, 4, 18, 1, 23, 9, 13, 6, 22, 3, 16, 10, 24, 14, 5, 19, 8, 12, 21, 17];

export const typeIcon = (t?: DoorType, size = 20) => {
  switch (t) {
    case 'recipe': return <BookOpen size={size} />;
    case 'gift': return <Gift size={size} />;
    case 'discount': return <Percent size={size} />;
    case 'contest': return <Trophy size={size} />;
    case 'story': return <Heart size={size} />;
    default: return <Leaf size={size} />;
  }
};

function useCols() {
  const get = () => (innerWidth >= 1000 ? 6 : innerWidth >= 700 ? 5 : innerWidth >= 400 ? 4 : 3);
  const [cols, setCols] = useState(get);
  useEffect(() => {
    const on = () => setCols(get());
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, []);
  return cols;
}

interface Props {
  max: number;
  opened: Map<number, DoorType | undefined>;
  opening: number | null;
  onOpen: (day: number, el: HTMLElement) => void;
}

export function Honeycomb({ max, opened, opening, onOpen }: Props) {
  const cols = useCols();
  // pro 5 sloupců bude poslední řada neúplná – vycentrujeme ji
  const rows: number[][] = [];
  for (let i = 0; i < ORDER.length; i += cols) rows.push(ORDER.slice(i, i + cols));

  return (
    <div className="comb" style={{ ['--cols' as string]: cols }} role="list" aria-label="24 adventních okének">
      {rows.map((row, r) => (
        <div key={r} className={'comb-row' + (r % 2 ? ' shift' : '')} role="presentation">
          {row.map((day) => {
            const isOpen = opened.has(day);
            const locked = day > max;
            const today = day === max && !isOpen;
            const state = isOpen ? 'opened' : locked ? 'locked' : 'available';
            const label = `Okénko ${day}${locked ? ', odemkne se ' + day + '. prosince' : isOpen ? ', otevřené' : ', otevřít'}`;
            return (
              <div role="listitem" key={day} className="cell-wrap">
                <button
                  className={`cell ${state}${today ? ' today' : ''}${day === 24 ? ' eve' : ''}${opening === day ? ' cracking' : ''}`}
                  aria-label={label}
                  aria-disabled={locked}
                  onClick={(e) => onOpen(day, e.currentTarget)}
                  style={{ animationDelay: `${(r * cols + row.indexOf(day)) * 35}ms` }}
                >
                  <span className="cell-honey" />
                  <span className="cell-cap" />
                  <span className="cell-inner">
                    <span className="cell-num">{day}</span>
                    <span className="cell-ico">
                      {isOpen ? <>{typeIcon(opened.get(day), 16)}<Check size={13} className="tick" /></> : locked ? <Lock size={13} /> : day === 24 ? <Sparkles size={16} /> : <Gift size={16} />}
                    </span>
                    {today && <span className="cell-badge">dnes</span>}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
