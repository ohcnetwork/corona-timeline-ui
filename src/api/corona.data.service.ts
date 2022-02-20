
import to from 'await-to-js';
import { CountryAPIResponse, IndiaApiResponse } from './api.model';

export const retrieveCoronaWorldReports = async (): Promise<CountryAPIResponse> => {
    const [err, countryWiseData] = await to(fetch('https://pomber.github.io/covid19/timeseries.json'));
    if(err) {
        return Promise.reject('Api error');
    }
    return countryWiseData
    ? countryWiseData.json()
    : {};
}


export const retrieveCoronaIndiaStats = async (): Promise<IndiaApiResponse> => {
    const [err, indiaData] = await to(fetch('https://api.rootnet.in/covid19-in/stats/daily'));
    if (err) {
        return Promise.reject('Api error');
    }
    return indiaData
        ? indiaData.json()
        : {};
}