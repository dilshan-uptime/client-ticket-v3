import { Observable } from "rxjs";
import { GET } from "./base-api";
import type { SystemMetadata } from "@/models/metadata";

export const getSystemMetadataAPI = (): Observable<SystemMetadata> => {
  return GET("/api/v1/system/meta-data", {});
};
