interface HerdInformation {
    address?: {
        line1?: string;
        line2?: string;
        line3?: string;
        line4?: string;
        line5?: string;
        county?: string;
        postcode?: string;
    };
    herdPrefix?: string;
    pedigreeBreed?: string;
    startedRecording?: Date | null;
    nmrInformation?: {
        nmrCounty?: string;
        nmrOffice?: string;
        scheme?: string | undefined;
        weightingSequence?: string;
        lastWeightingMonth?: number;
        herdMark?: string;
        serviceType?: string;
        progenyTest?: string;
        lifeTimeYieldMember?: string;
        cowCardPrinted?: string;
        calfCropIndex?: string;
        herdWatchMember?: string;
        cellCountMember?: string;
    };
}
export declare const herdInformation: (datastream: string) => HerdInformation;
export default herdInformation;
