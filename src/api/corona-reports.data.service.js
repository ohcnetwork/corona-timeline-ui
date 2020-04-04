
import to from 'await-to-js';

export const retrieveCoronaWorldReports = async () => {
    const [err, countryWiseData] = await to(fetch('https://pomber.github.io/covid19/timeseries.json'));
    if(err) {
        return Promise.resolve({});
    }
    return countryWiseData
    ? countryWiseData.json()
    : {};
}