export interface AppRouteDto {
  path: string;
  component: React.ComponentType;
  isPrivate?: boolean;
  permissions?: string[];
}
