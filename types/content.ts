export type ContentStatus = "Pending" | "Approved" | "Rejected";
export type ResourceType = "Dissertation" | "Thesis" | "Research Paper";

export type ContentItem = {
  id: string;
  resourceType: ResourceType;
  title: string;
  author: string;
  submittedDate: string;
  status: ContentStatus;
};
