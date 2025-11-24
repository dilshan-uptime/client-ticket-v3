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
  createdAt?: string;
  scoredAt?: string;
  companyId: number | null;
  contractId: number | null;
  issueTypeId: number | null;
  subIssueTypeId: number | null;
  priority: string | null;
  workTypeId: number | null;
  queueId: number | null;
}

export interface ScoredTicketResponse {
  scoredList: ScoredTicketItem[];
  isTriageMode: boolean;
}

export interface CompanyTodoItem {
  id: number;
  description: string;
  ticketId: number | null;
  ticketNumber: string | null;
  ticketUrl: string | null;
  startDate: string;
}
