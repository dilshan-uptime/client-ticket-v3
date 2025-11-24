import { Observable } from "rxjs";

import { GET, POST } from "./base-api";
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
