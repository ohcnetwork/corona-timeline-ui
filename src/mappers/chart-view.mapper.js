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