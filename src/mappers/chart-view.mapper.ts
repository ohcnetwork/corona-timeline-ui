import * as _ from 'lodash';
import { CountryAPIResponse } from '../api/api.model';
import { ChartJsDatset, DropDownOptions, PlotData } from '../components/chart.model';

export const mapCountriesToPlotData = (data: CountryAPIResponse): PlotData  => {
    const dates = _.map(_.sample(data), 'date');
    const datasetList: ChartJsDatset[] = _.map(data, (report, key) => {
        return {
            label: key.replace(',',''),
            data: _.map(report, 'confirmed'),
            borderColor: '',
            backgroundColor: '',
            tension: 0.5
        }
    });
    return { dates, datasetList };
}

export const mapCountriesToDropDown = (countryStat: CountryAPIResponse): DropDownOptions[] => {
    return _.map(_.keys(countryStat), (country, index) => ({
        label: country,
        value: index,
    }));
}

export const mapIndiaStatToChartSeries = (indiaDailyStatResponse: any) => {
    // const dates = indiaDailyStatResponse.data.map(d => d.day);
    // const initialStateLookup = _.chain(indiaDailyStatResponse)
    //                             .get('data', [])
    //                             .map('regional')
    //                             .flatten()
    //                             .map('loc').uniq()
    //                             .map(state => ({name: state, data:[]}))
    //                             .keyBy('name').value();

    // const locStatMap = indiaDailyStatResponse.data.reduce((lookup, data, i) => {
    //     data.regional.forEach((region) => {
    //         lookup[region.loc].data.push(region.totalConfirmed);
    //     })
        
    //     // add previous totalConfirmed || 0 for missing state data
    //     _.each(lookup, (lookupItem) => {
    //         lookup[lookupItem.name] = !!lookupItem.data[i] 
    //         ? lookupItem 
    //         : { ...lookupItem, data: [...lookupItem.data, lookupItem.data[i-1] || 0]}
    //     });
    //     return lookup;
    // }, initialStateLookup);
    return {};
}

export const mapToSelectedLocChartSeries = (selectedPlaces: any, chartSeries: any) => {
  const series =   _.map(selectedPlaces, (country) => {
    return  chartSeries.locStatMap[country];
    });
  return {dates: chartSeries.dates, series};
}
