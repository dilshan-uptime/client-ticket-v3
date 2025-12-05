import { Observable } from "rxjs";
import { GET } from "./base-api";

const SYSTEM_ROOT_PATH = "api/v1/system";
const TEAMS_ROOT_PATH = "api/v1/teams";

export interface Team {
  id: number;
  name: string;
}

export interface User {
  id: string;
  sysId: number;
  name: string;
}

export interface StalledTicket {
  ticketId: number;
  ticketNumber: string;
  title: string;
  status: number;
  lastWork: string | null;
  hoursStalled?: number;
  stalledReason: string;
}

export interface RecentTicket {
  id: number;
  title: string;
  url: string;
  ticketNumber: string;
  description: string;
  companyId: number | null;
  contractId: number | null;
  issueTypeId: number | null;
  subIssueTypeId: number | null;
  priority: number | null;
  workTypeId: number | null;
  queueId: number | null;
}

export interface ResourceCreator {
  id: string;
  sysId: number;
  name: string;
}

export interface IdleResource {
  creator: ResourceCreator;
  idleType: 'stalled' | 'idle';
  lastActivity: string | null;
  idleDurationMinutes: number | null;
  inProgressCount: number;
  assignedCount: number;
  stalledTickets: StalledTicket[];
  recentTickets: RecentTicket[];
}

export const getTeamsAPI = (): Observable<Team[]> => {
  return GET(`${SYSTEM_ROOT_PATH}/teams`, {});
};

export const getUsersByTeamAPI = (teamId: string): Observable<User[]> => {
  return GET(`${SYSTEM_ROOT_PATH}/users?team_id=${teamId}`, {});
};

export const getCheckResourcesAPI = (teamId: string): Observable<IdleResource[]> => {
  return GET(`${TEAMS_ROOT_PATH}/${teamId}/check-resources`, {});
};

export interface ActivityItem {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  type: 'accept' | 'reject';
  timestamp: string;
  reason: string | null;
}

export interface ActivitiesResponse {
  total: number;
  page: number;
  size: number;
  items: ActivityItem[];
}

export const getTeamActivitiesAPI = (
  teamId: string,
  page: number,
  size: number,
  fromDate: string,
  toDate: string,
  userId?: number
): Observable<ActivitiesResponse> => {
  let url = `${TEAMS_ROOT_PATH}/${teamId}/activities?page=${page}&size=${size}&from_date=${fromDate}&to_date=${toDate}`;
  if (userId) {
    url = `${TEAMS_ROOT_PATH}/${teamId}/activities?user_id=${userId}&page=${page}&size=${size}&from_date=${fromDate}&to_date=${toDate}`;
  }
  return GET(url, {});
};

export interface ActivityStats {
  accepted: number;
  rejected: number;
  acceptanceRate: string;
  lastAccepted: string | null;
  lastRejected: string | null;
}

export const getTeamActivityStatsAPI = (
  teamId: string,
  page: number,
  size: number,
  fromDate: string,
  toDate: string,
  userId?: number
): Observable<ActivityStats> => {
  let url = `${TEAMS_ROOT_PATH}/${teamId}/activities/stats?page=${page}&size=${size}&from_date=${fromDate}&to_date=${toDate}`;
  if (userId) {
    url = `${TEAMS_ROOT_PATH}/${teamId}/activities/stats?user_id=${userId}&page=${page}&size=${size}&from_date=${fromDate}&to_date=${toDate}`;
  }
  return GET(url, {});
};
