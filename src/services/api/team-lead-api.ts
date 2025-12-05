import { Observable } from "rxjs";
import { GET } from "./base-api";

const SYSTEM_ROOT_PATH = "api/v1/system";

export interface Team {
  id: number;
  name: string;
}

export const getTeamsAPI = (): Observable<Team[]> => {
  return GET(`${SYSTEM_ROOT_PATH}/teams`, {});
};
