export interface AudienceType {
  value: number;
  name: string;
}

export interface AudienceTypeFilter {
  value: number;
  name: string;
  audience_type_id: number;
  type: string;
}

export interface MarketingListFilter {
  id: number;
  marketing_list_id: number;
  audience_type_filter_id: number | null;
  value: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  audience_type_filter: AudienceTypeFilter | null;
}

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
  audience_type?: {
    id: number;
    name: string;
  };
  audienceType?: {
    id: number;
    name: string;
  };
  member_details?: {
    type: 'prospect' | 'client' | 'marketing_contact' | null;
    members: Array<{
      id: number;
      email: string | null;
      phone: string | null;
      first_name: string;
      last_name: string;
      full_name: string;
      title: string | null;
      address: {
        street: string | null;
        city: string | null;
        state: string | null;
        zip: string | null;
      };
      company_name: string | null;
      prospect_id?: number;
      client_id?: number;
      external_member?: {
        id: number;
        full_name: string;
        email: string;
        phone: string;
        title: string;
        address: {
          street: string;
          city: string;
          state: string;
          zip: string;
        };
        nmls: string;
        rate_sheet: boolean;
        roles: {
          is_processor: boolean;
          is_loan_officer: boolean;
          is_supervisor: boolean;
        };
      };
    }>;
  };
  marketing_list_filter: MarketingListFilter[];
}

export interface MarketingListApiResponse {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: MarketingList[];
}

export interface BankChannel {
  name: string;
  value: number;
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

