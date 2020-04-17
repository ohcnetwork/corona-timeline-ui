import * as _ from 'lodash';

export const mapToStackedLineView = (data) => {
    const categories = _.map(data.China, 'date');
    const currentData = _.keyBy(_.map(data, (report, key) => {
        return {
            name: key,
            data: _.map(report, 'confirmed')
        }
    }), 'name');
    return { categories, currentData };
}

export const mapIndiaStatToStackedLineView = (indiaDailyStatResponse) => {
    const categories = indiaDailyStatResponse.data.map(d => d.day);
    const initialStateLookup = _.chain(indiaDailyStatResponse)
                                .get('data', [])
                                .map('regional')
                                .flatten()
                                .map('loc').uniq()
                                .map(state => ({name: state, data:[]}))
                                .keyBy('name').value();

    const currentData = indiaDailyStatResponse.data.reduce((lookup, data, i) => {
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
    return {categories, currentData};
}
    