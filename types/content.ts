export type ContentStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Deleted'
export type ResourceType = 'Dissertation' | 'Thesis' | 'Research Paper'

export type ContentItem = {
  id: string
  title: string
  abstract: string
  keywords: string
  authors: string
  adviser: string
  submittedDate: string
  resourceType: ResourceType
  status: ContentStatus
  visibility: 'public' | 'restricted'
  campus: string
  college: string
  department: string
  library: string
  fileName: string
}
