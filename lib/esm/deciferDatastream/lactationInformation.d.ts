interface LactationObject {
    qualifyingLactation: boolean;
    authenticTotals: boolean;
    milkYield: number;
    fatKG: number;
    proteinKG: number;
    lactoseKG: number;
    totalDays: number;
    total3xMilkedDays: number;
    milked3XStartDays: number;
    lactationEndDate: Date | undefined;
    endReason: string | undefined;
    totalRecordings: number;
    averageCellCount: number;
    cellCountsOver200: number;
}
export interface LactationInfo {
    DSIdentifier?: string;
    lineNumber?: number;
    lactationNumber?: number;
    estimatedLactationNumber?: number;
    breed?: string;
    totalCalves?: number;
    totalMaleCalves?: number;
    totalFemaleCalves?: number;
    totalDeadCalves?: number;
    numberDaysDry?: number;
    totalServices?: number;
    missedRecordings?: number;
    healthCounts?: {
        lameness: number;
        sickness: number;
        mastitis: number;
    };
    seasonalAdjustment?: number;
    financialValue?: number;
    productionIndex?: number;
    productionBase?: number;
    calvingInterval?: number;
    ageAtCalving?: number;
    calvingDate?: Date;
    authenticCalvingDate?: boolean;
    sireBreed?: string;
    sireID?: string;
    sireIDType?: string;
    sireAuthenticID?: boolean;
    calves?: {
        breed: string;
        id: string;
        idType: string | undefined;
        authenticID: boolean;
        sex: string;
    }[];
    qualifyingLactation?: LactationObject;
    naturalLactation?: LactationObject;
}
export declare const lactationsList: (datastream: string) => LactationInfo[];
export default lactationsList;
