export interface CountryAPIResponse {
    [key: string]: Case[];
}

export interface Case {
    date: string;
    confirmed: number;
    deaths: number;
    recovered: number;
}

export interface IndiaApiResponse {
  data: Datum[];
  lastOriginUpdate: string;
  lastRefreshed: string;
  success: boolean;
}

export interface Datum {
  day: string;
  regional: Regional[];
  summary: Summary;
}

interface Summary {
  confirmedButLocationUnidentified: number;
  confirmedCasesForeign: number;
  confirmedCasesIndian: number;
  deaths: number;
  discharged: number;
  total: number;
}

interface Regional {
  confirmedCasesForeign: number;
  confirmedCasesIndian: number;
  deaths: number;
  discharged: number;
  loc: string;
  totalConfirmed: number;
}