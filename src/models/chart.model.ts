export interface FinalPlotData {
  dates: string[];
  datasetList: ChartJsDataset[]
}
export interface PlotData extends FinalPlotData {
  apiType: ApiType;
}
export interface MissingDataPoint {
  apiType: ApiType;
  prependNullCount:number; 
  appendNullCount: number;
}

export interface ApiDateRange {
  apiType: ApiType;
  startDate: string;
  endDate: string;
}
export interface ChartJsDataset {
  label: string;
  data: (number|null)[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  apiType: ApiType;
}

export interface DropDownOptions {
    label: string;
    value: number;
}

export interface SelectedSettings {
  selectedApiTypes: ApiType[],
  selectedLocations: number[]
}

export type ApiType =  'india' | 'international';