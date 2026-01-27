export interface Lottery {
  id: string;
  slug?: string;
  title: string;
  prizePool: string;
  drawDate: string;
  ticketPrice: string;
  participants?: number;
  icon?: 'ticket' | 'coins' | 'trending' | 'calendar';
}

export type PlayerLevelType = 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';
