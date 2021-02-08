import statementInformation from './deciferDatastream/statementInformation';
import lactationInformation from './deciferDatastream/lactationInformation';

/* Samples

Returns an array of all sample results taken at all recording

@param datastream (string)

*/
export const samples = (datastream: string) => {
  const statements = statementInformation(datastream); // Load all statement info
  const milkSamples: {
    DSIdentifier?: string,
    liveFlag?: string,
    lineNumber?: number,
    date: Date,
    timesMilked: number,
    milkYield: number,
    butterfatPercentage: number,
    proteinPercentage: number,
    lactosePercentage: number,
    scc: number,
    estimatedRemark: string | boolean | undefined,
    noSample: string | boolean | undefined,
  }[] = [];

  statements.map((statement) => { // Filter though each statement - just sort samples.
    if (statement.milkSamples.length > 1) { // Only bother if there are samples...
      statement.milkSamples.map((sample) => milkSamples.push({
        DSIdentifier: statement.DSIdentifier,
        liveFlag: statement.liveFlag,
        lineNumber: statement.lineNumber,
        ...sample,
      }));
    }
    return false;
  });
  return milkSamples;
};

/* Services

Returns an array of all services within the datastream.

@param datastream (string)

*/
export const services = (datastream:string) => {
  const statements = statementInformation(datastream);
  const allServices: {
    DSIdentifier?: string,
    liveFlag?: string,
    lineNumber?: number,
    date: Date,
    authenticService: boolean,
    sireBreed: string,
    sireIdentity: string,
    sireIDType: string | undefined,
    authenticSire: boolean,
    pdStatus: string | undefined,
  }[] = [];

  statements.map((statement) => {
    if (statement.services.length > 1) {
      statement.services.map((service) => allServices.push({
        DSIdentifier: statement.DSIdentifier,
        liveFlag: statement.liveFlag,
        lineNumber: statement.lineNumber,
        ...service,
      }));
    }
    return false;
  });
  return allServices;
};

/* Health Events

Returns an array of all health events within the datastream file

@param datastream (string)

*/
export const healthEvents = (datastream: string) => {
  const statements = statementInformation(datastream);
  const allHealthEvents: {
    DSIdentifier?: string,
    liveFlag?: string,
    lineNumber?: number,
    date: Date,
    eventType: string | undefined,
  }[] = [];

  statements.map((statement) => {
    if (statement.services.length > 1) {
      statement.otherEvents.map((event) => {
        const acceptedValues = ['Sick', 'Mastitis', 'Lameness'];
        // If the event has one of the previous values - add it to our health events array.
        if (typeof event.eventType !== 'undefined' && acceptedValues.indexOf(event.eventType) > -1) {
          return allHealthEvents.push({
            DSIdentifier: statement.DSIdentifier,
            liveFlag: statement.liveFlag,
            lineNumber: statement.lineNumber,
            date: event.date,
            eventType: event.eventType,
          });
        }
        return allHealthEvents;
      });
    }
    return false;
  });
  return allHealthEvents;
};

/* Other Events

Returns an array of everything but health events within the datastream file

@param datastream (string)

*/
export const otherEvents = (datastream: string) => {
  const statements = statementInformation(datastream);
  const allOtherEvents: {
    DSIdentifier?: string,
    liveFlag?: string,
    lineNumber?: number,
    date: Date,
    eventType: string | undefined,
  }[] = [];

  statements.map((statement) => {
    if (statement.services.length > 1) {
      statement.otherEvents.map((event) => {
        const acceptedValues = ['Sick', 'Mastitis', 'Lameness'];
        // If the event isn't one of the previous values - add it to our array.
        if (typeof event.eventType !== 'undefined' && acceptedValues.indexOf(event.eventType) === -1) {
          return allOtherEvents.push({
            DSIdentifier: statement.DSIdentifier,
            liveFlag: statement.liveFlag,
            lineNumber: statement.lineNumber,
            date: event.date,
            eventType: event.eventType,
          });
        }
        return allOtherEvents;
      });
    }
    return false;
  });
  return allOtherEvents;
};

/* Current Lactation Information

Returns an array of all cows latest lactation info (SX record) from the data stream.

@param datastream (string)

*/
export const currentLactationInformation = (datastream: string) => {
  const statements = statementInformation(datastream); // Load all statement info
  const curLactationInfo: {
    DSIdentifier?: string,
    liveFlag?: string,
    lineNumber?: number,
    lactationDays: number,
    totalMilkKG: number,
    totalFatKG: number,
    totalProteinKG: number,
    totalLactoseKG: number,
    totalFatPercentage: number,
    totalProteinPercentage: number,
    totalLactosePercentage: number,
    totalValue: number,
    averagePPL: number,
    seasonalityApplied: boolean | undefined,
    averageSCC: number,
  }[] = [];

  statements.map((statement) => { // Filter though each statement
    if (typeof statement.currentLactation !== 'undefined') { // Only bother if there is an SX record
      curLactationInfo.push({
        DSIdentifier: statement.DSIdentifier,
        liveFlag: statement.liveFlag,
        lineNumber: statement.lineNumber,
        ...statement.currentLactation,
      });
    }
    return false;
  });
  return curLactationInfo;
};

/* Calvings

Returns an array of all calvings from the data stream.

This combines the statement and lactation information to ensure no gaps.

@param datastream (string)

*/
export const calvings = (datastream:string) => {
  const statements = statementInformation(datastream);
  const lactations = lactationInformation(datastream);
  const allCalvings: {
    DSIdentifier?: string,
    lineNumber?: number,
    date: Date | undefined, // Key identifier
    assumed: boolean,
    sireBreed?: string,
    sireID?: string,
    sireIDType?: string,
    sireAuthenticID?: boolean,
    calves?: {
      breed:string,
      id: string,
      idType: string | undefined,
      authenticID: boolean,
      sex: string
    }[],
  }[] = [];

  // Lets map the lactation lot first
  lactations.map((lactation) => allCalvings.push({
    DSIdentifier: lactation.DSIdentifier,
    lineNumber: lactation.lineNumber,
    date: lactation.calvingDate,
    assumed: false,
    sireBreed: lactation.sireBreed,
    sireID: lactation.sireID,
    sireIDType: lactation.sireIDType,
    sireAuthenticID: lactation.sireAuthenticID,
    calves: lactation.calves,
  }));

  // Now lets check statement's for any calvings and add them
  statements.map((statement) => {
    statement.calvings.map((calving) => {
      // If we haven't added it before - best add the calving.
      if ((allCalvings.findIndex((x) => x.date === calving.date)) === -1) {
        return allCalvings.push({
          DSIdentifier: statement.DSIdentifier,
          lineNumber: statement.lineNumber,
          date: calving.date,
          assumed: calving.assumed,
          calves: calving.calves,
        });
      }
      return allCalvings;
    });
    return allCalvings;
  });
  return allCalvings;
};
