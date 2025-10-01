export interface MarketingList {
  id: number;
  list_name: string;
  audience_type_id: number;
  count: number;
  email_sent: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  added_by: number;
  recipient_count: number;
  has_member_count: number;
  added_by_name: string;
  audience_type_name: string;
  member_details?: {
    type: string;
    members: any[];
  };
  audience_type?: {
    id: number;
    name: string;
  };
  audienceType?: {
    id: number;
    name: string;
  };
  marketing_list_filter?: MarketingListFilter[];
}

export interface AudienceType {
  value: number;  // Changed back to value
  name: string;
}

export interface AudienceTypeFilter {
  value: number | string;  // Allow both number and string for custom filters like 'company'
  name: string;
  audience_type_id: number;
  type: string;
  code?: string;  // Made optional since it's not in API response
}

export interface MarketingListFilter {
  id?: number;
  marketing_list_id?: number;
  audience_type_filter_id: number | string;  // Allow string for custom filters like 'company'
  value: string;
  audience_type_filter?: AudienceTypeFilter;
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

