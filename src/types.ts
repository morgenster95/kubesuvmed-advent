export type DoorType = 'tip' | 'recipe' | 'gift' | 'discount' | 'contest' | 'story';

export interface Door {
  day: number;
  type: DoorType;
  title: string;
  text: string;
  more?: string;
  image?: string;
  /** produktová fotka na bílém/průhledném pozadí (zobrazí se „na podstavci“) */
  product?: boolean;
  url?: string;
  urlLabel?: string;
  code?: string;
  codeNote?: string;
  adult?: boolean;
}

export interface User {
  uid: string;
  email: string;
  name: string | null;
}

export interface Progress {
  /** den -> ISO čas otevření */
  opened: Record<number, string>;
  /** dny, ve kterých uživatel odeslal soutěžní odpověď */
  entries: number[];
  newsletter: boolean;
}
