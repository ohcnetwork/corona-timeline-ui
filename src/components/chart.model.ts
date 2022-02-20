export interface PlotData {
    dates: string[];
    apiType: string;
    datasetList: ChartJsDatset[]
}
export interface MissingDataPoint {
  apiType: string;
  prependNullCount:number; 
  appendNullCount: number;
}

export interface ApiDateRange {
  apiType: string;
  startDate: string;
  endDate: string;
}
export interface ChartJsDatset {
  label: string;
  data: (number|null)[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  apiType: string;
}

export interface DropDownOptions {
    label: string;
    value: number;
}