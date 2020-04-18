import * as _ from 'lodash';

export const mapWorldStatToChartSeries = (data) => {
    const dates = _.map(data.China, 'date');
    const locStatMap = _.keyBy(_.map(data, (report, key) => {
        return {
            name: key.replace(',',''),
            data: _.map(report, 'confirmed')
        }
    }), 'name');
    return { dates, locStatMap };
}

export const mapIndiaStatToChartSeries = (indiaDailyStatResponse) => {
    const dates = indiaDailyStatResponse.data.map(d => d.day);
    const initialStateLookup = _.chain(indiaDailyStatResponse)
                                .get('data', [])
                                .map('regional')
                                .flatten()
                                .map('loc').uniq()
                                .map(state => ({name: state, data:[]}))
                                .keyBy('name').value();

    const locStatMap = indiaDailyStatResponse.data.reduce((lookup, data, i) => {
        data.regional.forEach((region) => {
            lookup[region.loc].data.push(region.totalConfirmed);
        })
        
        // add previous totalConfirmed || 0 for missing state data
        _.each(lookup, (lookupItem) => {
            lookup[lookupItem.name] = !!lookupItem.data[i] 
            ? lookupItem 
            : { ...lookupItem, data: [...lookupItem.data, lookupItem.data[i-1] || 0]}
        });
        return lookup;
    }, initialStateLookup);
    return {dates, locStatMap};
}

export const mapToSelectedLocChartSeries = (selectedPlaces, chartSeries) => {
  const series =   _.map(selectedPlaces, (country) => {
    return  chartSeries.locStatMap[country];
    });
  return {dates: chartSeries.dates, series};
}
