
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


export const retrieveCoronaIndiaStats = async () => {
    const [err, indiaData] = await to(fetch('https://api.rootnet.in/covid19-in/stats/daily'));
    if (err) {
        return Promise.resolve({});
    }
    return indiaData
        ? indiaData.json()
        : {};
}