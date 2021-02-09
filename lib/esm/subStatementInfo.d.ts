export declare const samples: (datastream: string) => {
    DSIdentifier?: string | undefined;
    liveFlag?: string | undefined;
    lineNumber?: number | undefined;
    date: Date;
    timesMilked: number;
    milkYield: number;
    butterfatPercentage: number;
    proteinPercentage: number;
    lactosePercentage: number;
    scc: number;
    estimatedRemark: string | boolean | undefined;
    noSample: string | boolean | undefined;
}[];
export declare const services: (datastream: string) => {
    DSIdentifier?: string | undefined;
    liveFlag?: string | undefined;
    lineNumber?: number | undefined;
    date: Date;
    authenticService: boolean;
    sireBreed: string;
    sireIdentity: string;
    sireIDType: string | undefined;
    authenticSire: boolean;
    pdStatus: string | undefined;
}[];
export declare const healthEvents: (datastream: string) => {
    DSIdentifier?: string | undefined;
    liveFlag?: string | undefined;
    lineNumber?: number | undefined;
    date: Date;
    eventType: string | undefined;
}[];
export declare const otherEvents: (datastream: string) => {
    DSIdentifier?: string | undefined;
    liveFlag?: string | undefined;
    lineNumber?: number | undefined;
    date: Date;
    eventType: string | undefined;
}[];
export declare const currentLactationInformation: (datastream: string) => {
    DSIdentifier?: string | undefined;
    liveFlag?: string | undefined;
    lineNumber?: number | undefined;
    lactationDays: number;
    totalMilkKG: number;
    totalFatKG: number;
    totalProteinKG: number;
    totalLactoseKG: number;
    totalFatPercentage: number;
    totalProteinPercentage: number;
    totalLactosePercentage: number;
    totalValue: number;
    averagePPL: number;
    seasonalityApplied: boolean | undefined;
    averageSCC: number;
}[];
export declare const calvings: (datastream: string) => {
    DSIdentifier?: string | undefined;
    lineNumber?: number | undefined;
    date: Date | undefined;
    assumed: boolean;
    sireBreed?: string | undefined;
    sireID?: string | undefined;
    sireIDType?: string | undefined;
    sireAuthenticID?: boolean | undefined;
    calves?: {
        breed: string;
        id: string;
        idType: string | undefined;
        authenticID: boolean;
        sex: string;
    }[] | undefined;
}[];
