export interface PlotData {
    dates: string[];
    datasetList: ChartJsDatset[]
}

export interface ChartJsDatset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
}

export interface DropDownOptions {
    label: string;
    value: number;
}