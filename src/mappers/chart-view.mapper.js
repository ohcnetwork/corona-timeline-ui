import * as _ from 'lodash';

export const mapWorldStatToChartSeries = (data) => {
    const dates = _.map(data.China, 'date');
    const placeStatMap = _.keyBy(_.map(data, (report, key) => {
        return {
            name: key,
            data: _.map(report, 'confirmed')
        }
    }), 'name');
    return { dates, placeStatMap };
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

    const placeStatMap = indiaDailyStatResponse.data.reduce((lookup, data, i) => {
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
    return {dates, placeStatMap};
}

export const mapToSelectedChartSeries = (selectedPlaces, placeStatMap) =>
    _.merge( _.map(selectedPlaces, (country) =>  placeStatMap[country]));
