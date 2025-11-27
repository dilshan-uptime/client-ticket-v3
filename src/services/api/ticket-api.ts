import { Observable } from "rxjs";

import { GET, POST, PUT } from "./base-api";
import type { ScoredTicketResponse, TicketItem, CompanyTodoItem } from "@/models/ticket";

const ROOT_PATH = "api/v1/tickets";

export const getInProgressTicketsAPI = (): Observable<TicketItem[]> => {
  return GET(`${ROOT_PATH}/in-progress`, {});
};

export const getScoredTicketsAPI = (): Observable<ScoredTicketResponse> => {
  return GET(`${ROOT_PATH}/scored`, {});
};

export const getCompanyTodoListAPI = (): Observable<CompanyTodoItem[]> => {
  return GET('api/v1/company-todo/upcoming-list', {});
};

export const acceptTicketAPI = (ticketId: number): Observable<any> => {
  return POST(`${ROOT_PATH}/${ticketId}/accept`, {});
};

export const rejectTicketAPI = (ticketId: number, reason: string): Observable<any> => {
  return POST(`${ROOT_PATH}/${ticketId}/reject`, { reason });
};

export interface CompleteTriagePayload {
  issue_type_id: number;
  sub_issue_type_id: number;
  priority_id: number;
  work_type_id: number;
  queue_id: number;
}

export const completeTriageAPI = (ticketId: number, payload: CompleteTriagePayload): Observable<any> => {
  return PUT(`${ROOT_PATH}/${ticketId}`, payload as unknown as Record<string, unknown>);
};

export interface TicketSearchResult {
  id: number;
  name: string;
  title: string;
}

export interface CompanyInfo {
  id: number;
  autotaskId: number;
  name: string;
  phoneNumber?: string;
  parentAutotaskId?: number | null;
}

export interface ContactInfo {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
}

export interface TicketDetails {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  createDateTime: string;
  statusId: number;
  priorityId: number;
  queueId: number;
  issueType: number;
  subIssueType: number;
  sourceId: number;
  dueDateTime: string;
  slaId: number;
  workedBy: string | { id?: number; autotaskId?: number; name?: string; email?: string };
  escalationReason: string | null;
  partnerTicketNumber: string | null;
  primaryResource: string | { id?: number; autotaskId?: number; name?: string; email?: string } | null;
  secondaryResource: (string | { id?: number; autotaskId?: number; name?: string; email?: string })[];
  handoverRegion: string | null;
  contractId: number | null;
  workTypeId: number;
  company: string | null;
  partnerCompany?: CompanyInfo | null;
  parentCompany?: CompanyInfo | null;
  contact?: ContactInfo | null;
  firstResponseDateTime?: string | null;
  firstResponseDueDateTime?: string | null;
  resolvedPlanDateTime?: string | null;
  resolvedPlanDueDateTime?: string | null;
  resolvedDateTime?: string | null;
  resolvedDueDateTime?: string | null;
}

export const searchTicketByNumberAPI = (ticketNumber: string): Observable<TicketSearchResult[]> => {
  return GET(`${ROOT_PATH}/search`, { ticket_number: ticketNumber });
};

export const searchByPartnerTicketNumberAPI = (partnerTicketNumber: string): Observable<TicketSearchResult[]> => {
  return GET(`${ROOT_PATH}/search`, { partner_ticket_number: partnerTicketNumber });
};

export const getTicketByIdAPI = (ticketId: number): Observable<TicketDetails> => {
  return GET(`${ROOT_PATH}/${ticketId}`, {});
};
