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
  added_by_name: string;
  recipient_count: number;
  has_member_count: number;
  audience_type: AudienceType;
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
  Alabama = "AL",
  Alaska = "AK",
  Arizona = "AZ",
  Arkansas = "AR",
  California = "CA",
  Colorado = "CO",
  Connecticut = "CT",
  Delaware = "DE",
  DistrictOfColumbia = "DC",
  Florida = "FL",
  Georgia = "GA",
  Hawaii = "HI",
  Idaho = "ID",
  Illinois = "IL",
  Indiana = "IN",
  Iowa = "IA",
  Kansas = "KS",
  Kentucky = "KY",
  Louisiana = "LA",
  Maine = "ME",
  Maryland = "MD",
  Massachusetts = "MA",
  Michigan = "MI",
  Minnesota = "MN",
  Mississippi = "MS",
  Missouri = "MO",
  Montana = "MT",
  Nebraska = "NE",
  Nevada = "NV",
  NewHampshire = "NH",
  NewJersey = "NJ",
  NewMexico = "NM",
  NewYork = "NY",
  NorthCarolina = "NC",
  NorthDakota = "ND",
  Ohio = "OH",
  Oklahoma = "OK",
  Oregon = "OR",
  Pennsylvania = "PA",
  RhodeIsland = "RI",
  SouthCarolina = "SC",
  SouthDakota = "SD",
  Tennessee = "TN",
  Texas = "TX",
  Utah = "UT",
  Vermont = "VT",
  Virginia = "VA",
  Washington = "WA",
  WestVirginia = "WV",
  Wisconsin = "WI",
  Wyoming = "WY",
}
