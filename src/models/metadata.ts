export interface MetadataOption {
  id: number;
  name: string;
}

export interface SystemMetadata {
  issueType: MetadataOption[];
  subIssueType: MetadataOption[];
  queue: MetadataOption[];
  priority: MetadataOption[];
  workType: MetadataOption[];
}
