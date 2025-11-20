import { Observable } from "rxjs";

import { GET } from "./base-api";
import type { ScoredTicketItem, TicketItem, CompanyTodoItem } from "@/models/ticket";

const ROOT_PATH = "api/v1/tickets";

export const getInProgressTicketsAPI = (): Observable<TicketItem[]> => {
  return GET(`${ROOT_PATH}/in-progress`, {});
};

export const getScoredTicketsAPI = (): Observable<ScoredTicketItem[]> => {
  return GET(`${ROOT_PATH}/scored`, {});
};

export const getCompanyTodoListAPI = (): Observable<CompanyTodoItem[]> => {
  return GET('api/v1/company-todo/upcoming-list', {});
};
