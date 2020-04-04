import * as _ from 'lodash';

export const mapToStackedLineView = (data) => {
    const categories = _.map(data.India, 'date');
    const currentData = _.keyBy(_.map(data, (report, key) => {
        return {
            name: key,
            data: _.map(report, 'confirmed')
        }
    }), 'name');
    currentData.other = { name: 'other', data: _.map(categories, category => 0) }
    return { categories, currentData };
}