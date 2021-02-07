export declare const cowList: (datastream: string) => {
    producerNumber: number;
    herdCode: number;
    lineNumber: number;
    DSIdentifier: string;
    breedCode: string;
    otherBreedCode: string;
    identityNumber: string;
    IDType: string | undefined;
    alternateIDNumber: string;
    pedigreeStatus: string | undefined;
    pedigreeClassChangeDate: Date | null;
    genuineIdentity: boolean;
    shortName: string;
    longName: string;
    isYoungstock: boolean;
    dateOfBirth: Date;
    dateEnteredHerd: Date | null;
    dateLeftHerd: Date | null;
    inHerd: boolean;
    leftHerd: string | {
        date: Date;
        reason: string | undefined;
    };
    sireInformation: {
        breed: string;
        identity: string;
        IDType: string | undefined;
    };
    damInformation: {
        breed: string;
        identity: string;
        IDType: string | undefined;
        pedigreeStatus: string | undefined;
        genuineIdentity: boolean;
    };
    PTA: {
        evaluationGroup: string | undefined;
        evaluationSource: string | undefined;
        evaluationDate: Date | null;
        reliability: number;
        milkKG: number;
        fatKG: number;
        proteinKG: number;
        fatPercentage: number;
        proteinPercentage: number;
    };
}[];
export default cowList;
