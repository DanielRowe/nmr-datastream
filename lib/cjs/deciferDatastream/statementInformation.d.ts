interface CowInfo {
    DSIdentifier?: string;
    liveFlag?: string;
    lineNumber?: number;
    isYoungstock?: boolean;
    breedCode?: string;
    lactationNumber?: number;
    lactationIsEstimate?: boolean;
    complete305?: string;
    managementGroup?: string;
    previousCalvingDate?: Date;
    calfSireInformation?: {
        sireBreedCode: string;
        sireIdentity: string;
        sireIdentityType: string | undefined;
        sireAuthenticIdentity: boolean;
    };
    daysDryBetweenLactations?: number;
    milkSamples: {
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
    services: {
        date: Date;
        authenticService: boolean;
        sireBreed: string;
        sireIdentity: string;
        sireIDType: string | undefined;
        authenticSire: boolean;
        pdStatus: string | undefined;
    }[];
    calvings: {
        date: Date;
        authentic: boolean;
        assumed: boolean;
        calves?: {
            breed: string;
            id: string;
            idType: string | undefined;
            authenticID: boolean;
            sex: string;
        }[];
    }[];
    otherEvents: {
        date: Date;
        eventType: string | undefined;
        authenticEvent: boolean;
    }[];
    currentLactation?: {
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
    };
}
export declare const statementInformation: (datastream: string, afterDate?: Date) => CowInfo[];
export default statementInformation;
