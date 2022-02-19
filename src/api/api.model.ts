export interface CountryAPIResponse {
    [key: string]: Case[];
}

export interface Case {
    date: string;
    confirmed: number;
    deaths: number;
    recovered: number;
}


export interface StateAPIResponse {
    
}