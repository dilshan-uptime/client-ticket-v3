import { roleTypes } from "@/constants/user-role";
import type { UserRole } from "@/models/user-role";

import AuthRoutes from "@/modules/auth/routes";
import { NotFoundPage } from "../pages/NotFoundPage";

import type { AppRouteDto } from "@/models/common";
import { ClientRoutes } from "./client";

export const NOT_FOUND = "404-not-found";

const AppRoutes: AppRouteDto[] = [
  {
    path: NOT_FOUND,
    component: NotFoundPage,
    isPrivate: false,
    permissions: [],
  },
];

const getRoutes = (userRole: UserRole | null): Array<AppRouteDto> => {
  const commonRoutes = [...AuthRoutes, ...AppRoutes];

  if (userRole) {
    switch (userRole.roleName) {
      case roleTypes.SUPER_ADMIN:
        return [...commonRoutes];
      case roleTypes.ADMIN:
        return [...commonRoutes];
      case roleTypes.CLIENT:
        return [...commonRoutes, ...ClientRoutes];

      default:
        return commonRoutes;
    }
  }
  return commonRoutes;
};

export default getRoutes;
