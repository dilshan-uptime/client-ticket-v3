export interface TicketItem {
  id: number;
  title?: string;
  url?: string;
  ticketNumber?: string;
  description?: string;
  queue?: string;
}

export interface ScoredTicketItem extends TicketItem {
  isTriage: boolean;
  score: number;
  reasons: string[];
}
