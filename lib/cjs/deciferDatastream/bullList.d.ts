interface BullInformation {
    shortName?: string;
    longName?: string;
    breed?: string;
    herdbookNumber?: string;
    ptas: {
        evaluationGroup: string | undefined;
        evaluationSource: string | undefined;
        evaluationDate: Date | null;
        reliability: number;
        milkKG: number;
        fatKG: number;
        proteinKG: number;
        fatPercentage: number;
        proteinPercentage: number;
    }[];
}
export declare const bullList: (datastream: string) => BullInformation[];
export default bullList;
