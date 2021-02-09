import { CowDefinition } from './deciferDatastream/cowInformation';
import { LactationInfo } from './deciferDatastream/lactationInformation';
interface CowListComplete extends CowDefinition {
    currentLactationNumber: number | undefined;
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
    }[] | undefined;
    services: {
        date: Date;
        authenticService: boolean;
        sireBreed: string;
        sireIdentity: string;
        sireIDType: string | undefined;
        authenticSire: boolean;
        pdStatus: string | undefined;
    }[] | undefined;
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
        }[] | undefined;
    }[] | undefined;
    events: {
        date: Date;
        eventType: string | undefined;
        authenticEvent: boolean;
    }[] | undefined;
    currentLactation: {
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
    } | undefined;
    allLactations: LactationInfo[];
}
export declare const cowListComplete: (datastream: string) => CowListComplete[];
export default cowListComplete;