import { CowDefinition, cowList } from './deciferDatastream/cowInformation';
import statementInformation from './deciferDatastream/statementInformation';
import { LactationInfo, lactationsList as lactationInformation } from './deciferDatastream/lactationInformation';

export interface CowListComplete extends CowDefinition {
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
    authenticSire: boolean; pdStatus: string | undefined;
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
      sex: string; }[] | undefined;
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
    averageSCC: number; } | undefined;
    allLactations: LactationInfo[];
}

export const cowListComplete = (datastream: string) => {
  const completeCows: CowListComplete[] = [];
  const cows = cowList(datastream);
  const statements = statementInformation(datastream);
  const lactations = lactationInformation(datastream);

  cows.map((cow) => {
    // Find relevant statement information
    const statement = statements.find((x) => x.DSIdentifier === cow.DSIdentifier);

    // Find relevant lactation information
    const lactation = lactations.filter((x) => x.DSIdentifier === cow.DSIdentifier);

    // Put together a new object!
    return completeCows.push({
      ...cow,
      currentLactationNumber: statement?.lactationNumber,
      milkSamples: statement?.milkSamples,
      services: statement?.services,
      calvings: statement?.calvings,
      events: statement?.otherEvents,
      currentLactation: statement?.currentLactation,
      allLactations: lactation,
    });
  });
  return completeCows;
};

export default cowListComplete;
