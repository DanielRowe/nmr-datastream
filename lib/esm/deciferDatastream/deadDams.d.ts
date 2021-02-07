interface DamInformation {
    name?: string;
    breed?: string;
    identity?: string;
    identityType?: string | undefined;
    authenticIdentity?: boolean;
    pedigreeStatus?: string | undefined;
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
export declare const deadDams: (datastream: string) => DamInformation[];
export default deadDams;
