export interface MarketingList {
  id: number;
  listName?: string;
  list_name?: string;
  audienceTypeId?: number;
  audience_type_id?: number;
  count?: number;
  recipientCount?: number;
  recipient_count?: number;
  emailSent?: boolean;
  email_sent?: boolean | number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  deletedAt?: string | null;
  deleted_at?: string | null;
  addedBy?: number;
  added_by?: number;
  added_by_name?: string;
  hasMemberCount?: boolean;
  has_member_count?: boolean | number;
  audienceTypeName?: string;
  audience_type_name?: string;
  audienceType?: {
    id: number;
    name: string;
  };
  audience_type?: {
    id: number;
    name: string;
  };
  filters?: MarketingListFilter[];
  marketing_list_filter?: MarketingListFilter[];
  member_details?: {
    type: string;
    members: any[];
  };
}

export interface AudienceType {
  id?: number;
  value?: number;
  name: string;
}

export interface AudienceTypeFilter {
  id: number;
  value?: number | string;
  name: string;
  audienceTypeId?: number;
  audience_type_id?: number;
  code?: string | null;
  filterType?: string;
  type?: string;
  valueType?: string;
  audience_type_filter?: AudienceTypeFilter;
}

export interface MarketingListFilter {
  id?: number;
  marketingListId?: number;
  marketing_list_id?: number;
  audienceTypeFilterId?: number | string;
  audience_type_filter_id?: number | string;
  value?: string;
  audienceTypeFilter?: AudienceTypeFilter;
  audience_type_filter?: AudienceTypeFilter;
}

export interface MarketingListApiResponse {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: MarketingList[];
}

export interface BankChannel {
  id?: string | number;
  value?: number;
  bankId?: string;
  name: string;
  channelCode?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface BankChannelApiResponse {
  data: BankChannel[];
  message: string;
  success: boolean;
}

export interface AudienceTypeApiResponse {
  data: AudienceType[];
  message: string;
  success: boolean;
}

export interface Company {
  value: string;
  name: string;
}

export interface ExternalMember {
  id: number;
  roleId?: number;
  avatar?: string | null;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  street?: string | null;
  unit?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  nmls?: string | null;
  rateSheet?: boolean | null;
  receiveSla?: boolean | null;
  isFirstTime?: boolean | null;
  mktgUnsubscribe?: boolean | null;
  isPrincipal?: boolean | null;
  isOfficeAddress?: boolean | null;
  accessLevel?: string | null;
  canCreateTestFile?: boolean | null;
  tpoPortalRole?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProspectMember {
  id: number;
  prospectId?: number;
  externalMemberId?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  externalMember?: ExternalMember;
}

export interface Prospect {
  id: number;
  company?: string | null;
  avatar?: string | null;
  nmls?: string | null;
  email?: string | null;
  address?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  channel?: string | null;
  status?: string | null;
  bankId?: number | null;
  mktgUnsubscribe?: boolean | null;
  dba?: string | null;
  companyName?: string | null;
  preferredName?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  prospectMembers?: ProspectMember[];
}

export interface ClientMember {
  id: number;
  clientId?: number;
  externalMemberId?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  externalMember?: ExternalMember;
}

export interface Client {
  id: number;
  company?: string | null;
  companyName?: string | null;
  avatar?: string | null;
  nmls?: string | null;
  email?: string | null;
  address?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  channel?: string | null;
  status?: string | null;
  bankId?: number | null;
  mktgUnsubscribe?: boolean | null;
  clientMembers?: ClientMember[];
}

export interface PersonalContact {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  emailAddress?: string | null;
  phone?: string | null;
  company?: string | null;
  title?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketingListRecipients {
  prospects: Prospect[];
  clients: Client[];
  personalContacts: PersonalContact[];
}

export enum State {
  AL = "Alabama",
  AK = "Alaska",
  AZ = "Arizona",
  AR = "Arkansas",
  CA = "California",
  CO = "Colorado",
  CT = "Connecticut",
  DE = "Delaware",
  DC = "District of Columbia",
  FL = "Florida",
  GA = "Georgia",
  HI = "Hawaii",
  ID = "Idaho",
  IL = "Illinois",
  IN = "Indiana",
  IA = "Iowa",
  KS = "Kansas",
  KY = "Kentucky",
  LA = "Louisiana",
  ME = "Maine",
  MD = "Maryland",
  MA = "Massachusetts",
  MI = "Michigan",
  MN = "Minnesota",
  MS = "Mississippi",
  MO = "Missouri",
  MT = "Montana",
  NE = "Nebraska",
  NV = "Nevada",
  NH = "New Hampshire",
  NJ = "New Jersey",
  NM = "New Mexico",
  NY = "New York",
  NC = "North Carolina",
  ND = "North Dakota",
  OH = "Ohio",
  OK = "Oklahoma",
  OR = "Oregon",
  PA = "Pennsylvania",
  RI = "Rhode Island",
  SC = "South Carolina",
  SD = "South Dakota",
  TN = "Tennessee",
  TX = "Texas",
  UT = "Utah",
  VT = "Vermont",
  VA = "Virginia",
  WA = "Washington",
  WV = "West Virginia",
  WI = "Wisconsin",
  WY = "Wyoming",
}

