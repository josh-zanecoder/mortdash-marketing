export interface MarketingListSummary {
  id?: number;
  listName?: string;
  list_name?: string;
  count?: number;
  recipientCount?: number;
  recipient_count?: number;
  [key: string]: any;
}

export interface MarketingCampaign {
  id: string | number;
  name: string;
  marketingListId?: number;
  marketing_list_id?: number;
  emailTemplateId?: string;
  email_template_id?: string;
  isScheduled?: boolean;
  is_scheduled?: boolean;
  scheduledAt?: string;
  scheduled_at?: string;
  status?: string;
  campaignStatus?: string;
  campaign_status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  listName?: string;
  list_name?: string;
  recipientCount?: number;
  recipient_count?: number;
  emailSent?: boolean;
  email_sent?: boolean;
  marketingList?: MarketingListSummary;
  marketing_list?: MarketingListSummary;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EmailTemplate {
  id: string | number;
  name?: string;
  subject?: string;
  [key: string]: any;
}

export interface CampaignRecipient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  type: string;
}

