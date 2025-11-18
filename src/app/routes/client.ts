import type { AppRouteDto } from "@/models/common";
import { HomePage } from "@/modules/auth/other/pages/HomePage";

export const HOME = "/";

export const ClientRoutes: AppRouteDto[] = [
  {
    path: HOME,
    component: HomePage,
    isPrivate: true,
    permissions: [],
  },
];
