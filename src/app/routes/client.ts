import type { AppRouteDto } from "@/models/common";
import { HomePage } from "@/modules/auth/other/pages/HomePage";
import { TicketDetailsPage } from "@/modules/ticket/pages/TicketDetailsPage";

export const HOME = "/home";
export const TICKET_DETAILS = "/ticket-details/:id";

export const ClientRoutes: AppRouteDto[] = [
  {
    path: HOME,
    component: HomePage,
    isPrivate: true,
    permissions: [],
  },
  {
    path: TICKET_DETAILS,
    component: TicketDetailsPage,
    isPrivate: true,
    permissions: [],
  },
];
