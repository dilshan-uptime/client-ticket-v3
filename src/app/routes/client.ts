import type { AppRouteDto } from "@/models/common";
import { HomePage } from "@/modules/auth/other/pages/HomePage";
import { TicketDetailsPage } from "@/modules/ticket/pages/TicketDetailsPage";
import { TeamLeadDashboardPage } from "@/modules/dashboard/pages/TeamLeadDashboardPage";

export const HOME = "/home";
export const TICKET_DETAILS = "/ticket-details/:id";
export const TEAM_LEAD_DASHBOARD = "/team-lead-dashboard";

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
  {
    path: TEAM_LEAD_DASHBOARD,
    component: TeamLeadDashboardPage,
    isPrivate: true,
    permissions: [],
  },
];
