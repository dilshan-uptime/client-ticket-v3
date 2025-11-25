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

export interface TicketDetails {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  create_date: string;
  status_id: number;
  priority_id: number;
  queue_id: number;
  issue_type: number;
  sub_issue_type: number;
  source_id: number;
  due_date: string;
  sla_id: number;
  worked_by: string;
  escalation_reason: string | null;
  partner_ticket_number: string | null;
  primary_resource: string | null;
  secondary_resource: string[];
  handover_region: string | null;
  contract_id: number | null;
  work_type_id: number;
  company: string | null;
}

export const searchTicketByNumberAPI = (ticketNumber: string): Observable<TicketSearchResult[]> => {
  return GET(`${ROOT_PATH}/search`, { ticket_number: ticketNumber });
};

export const getTicketByIdAPI = (ticketId: number): Observable<TicketDetails> => {
  return GET(`${ROOT_PATH}/${ticketId}`, {});
};
