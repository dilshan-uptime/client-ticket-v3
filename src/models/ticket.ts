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

export interface CompanyTodoItem {
  id: number;
  description: string;
  ticketId: number | null;
  ticketNumber: string | null;
  ticketUrl: string | null;
  startDate: string;
}
