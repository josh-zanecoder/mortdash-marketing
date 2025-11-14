export interface MarketingList {
  id: number;
  listName: string;
  audienceTypeId: number;
  count: number;
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  addedBy?: number;
  recipientCount: number;
  hasMemberCount: boolean;
  addedByName?: string;
  audienceTypeName?: string;
  memberDetails?: {
    type: string;
    members: any[];
  };
  audienceType?: {
    id: number;
    name: string;
  } | null;
  filters?: MarketingListFilter[] | null;
  // Legacy snake_case support (for backward compatibility)
  list_name?: string;
  audience_type_id?: number;
  created_at?: string;
  updated_at?: string;
  member_details?: {
    type: string;
    members: any[];
  };
  marketing_list_filter?: MarketingListFilter[];
}

export interface AudienceType {
  value: number;  // Changed back to value
  name: string;
}

export interface AudienceTypeFilter {
  id?: number;
  value?: number | string;  // Allow both number and string for custom filters like 'company'
  name: string;
  audienceTypeId: number;  // camelCase (primary)
  audience_type_id?: number;  // snake_case (legacy support)
  filterType?: string;  // camelCase from API
  type?: string;  // snake_case (legacy support)
  code?: string;
  valueType?: string;  // camelCase from API
  createdAt?: string;  // camelCase from API
  updatedAt?: string;  // camelCase from API
}

export interface MarketingListFilter {
  id?: number;
  marketingListId?: number;
  marketing_list_id?: number;  // Legacy support
  audienceTypeFilterId?: number | string;  // camelCase
  audience_type_filter_id?: number | string;  // snake_case (legacy)
  value: string;
  audienceTypeFilter?: AudienceTypeFilter;  // camelCase
  audience_type_filter?: AudienceTypeFilter;  // snake_case (legacy)
}

export interface MarketingListApiResponse {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: MarketingList[];
}

export interface BankChannel {
  value: number;  // Changed to value
  name: string;
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

