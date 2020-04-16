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

export const mapIndiaStatToStackedLineView = (data) => {
    const currentData = data.data.reduce((lookup, data) => {
        data.regional.forEach((region) => {
            if (!lookup[region.loc]) {
                lookup[region.loc] = { name: region.loc, data: [region.totalConfirmed] }
            }
            lookup[region.loc].data.push(region.totalConfirmed);
        })
        return lookup;
    }, {});
    const categories = data.data.map(d => d.day);
    return {categories, currentData};
}
    