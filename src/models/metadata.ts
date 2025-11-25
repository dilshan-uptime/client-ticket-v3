export interface MetadataOption {
  id: number;
  name: string;
}

export interface SystemMetadata {
  issueType: MetadataOption[];
  subIssueTypeMap: Record<string, MetadataOption[]>;
  queue: MetadataOption[];
  priority: MetadataOption[];
  workType: MetadataOption[];
}
