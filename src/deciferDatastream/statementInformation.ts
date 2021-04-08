import toDate from '../utils/toDate';
import { IDType as IDTypeLookup } from '../lookups/IDType';

interface CowInfo {
  DSIdentifier?: string,
  liveFlag?: string,
  lineNumber?: number,
  isYoungstock?: boolean,
  breedCode?:string,
  lactationNumber?: number,
  lactationIsEstimate?: boolean,
  complete305?: string,
  managementGroup?: string,
  previousCalvingDate?: Date,
  calfSireInformation?: {
    sireBreedCode: string,
    sireIdentity: string,
    sireIdentityType: string | undefined,
    sireAuthenticIdentity: boolean,
  },
  daysDryBetweenLactations?: number,
  milkSamples: {
    date: Date,
    timesMilked: number,
    milkYield: number,
    butterfatPercentage: number,
    proteinPercentage: number,
    lactosePercentage: number,
    scc: number,
    estimatedRemark: string | boolean | undefined,
    noSample: string | boolean | undefined,
  }[],
  services: {
    date: Date,
    authenticService: boolean,
    sireBreed: string,
    sireIdentity: string,
    sireIDType: string | undefined,
    authenticSire: boolean,
    pdStatus: string | undefined,
  }[],
  calvings: {
    date: Date,
    authentic: boolean,
    assumed: boolean,
    calves?: {
      breed:string,
      id: string,
      idType: string | undefined,
      authenticID: boolean,
      sex: string
    }[]
  }[],
  otherEvents: {
    date: Date,
    eventType: string | undefined,
    authenticEvent: boolean,
  }[],
  currentLactation?: {
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
  }
}

export const statementInformation = (datastream: string, afterDate: Date = new Date('1900-01-01')) => {
  // STATEMENT INFORMATION
  const statementInfo: CowInfo[] = [];

  const statementInfoStart = datastream.indexOf('S0');
  if (statementInfoStart === -1) {
    throw new Error('Statements not found');
  }

  const lactationInfoStart = datastream.indexOf('L0,');
  if (lactationInfoStart === -1) {
    throw new Error('Lactation section not found whilst building statements');
  }

  if (!/S1,(?![A-Z0-9\s]{12})/g.test(datastream.substring(statementInfoStart, lactationInfoStart))) {
    throw new Error('No statement information found');
  }

  const statementInfoFromDatastream = datastream.substring(statementInfoStart, lactationInfoStart).split(/S1,(?![A-Z0-9\s]{12})/);

  statementInfoFromDatastream.shift(); // First value is always blank - skip.

  statementInfoFromDatastream.map((info) => {
    const prependOne = `1,${info}`; // Adds a 1 to the first line - means we can latter identify type in switch.
    // On the next to lines the check for not having 12 digits
    // after is if SW is used as a breed code on service info
    const extraNumbering = prependOne.replace(/S([A-Z0-9]{1}),(?![A-Z0-9\s]{12})/g, 'S$1,$1,'); // during split we loose the row number - add an extra for good measure.
    const rows = extraNumbering.split(/S[A-Z0-9]{1},(?![A-Z0-9\s]{12})/g); // Split down the rows.
    let cow: CowInfo = {
      milkSamples: [],
      services: [],
      calvings: [],
      otherEvents: [],
    };

    rows.map((row) => {
      const statement = row.split(','); // Split the values in the array by comma.
      // How we can use the data depends on it's type. Switch statement should help here.
      switch (statement[0]) {
        case '1': { // Cow information
          const [, // 1 / Row identifier
            liveFlag,
            lineNumber,
            youngstock, // 0 = false 1 = true
            breedCode,
            lactationNumber, // 1-25 or 81-99 if not recorded entire life
            estLactationNumber, // Only if 81-99
            managementGroup,
            complete305, // 0 = on going, 1 = assumed end, 2 =
            previousCalvingDate,
            sireBreed, // Breed of the sire of the calf that started the lactation
            sireIdentity, // Identity of sire above
            sireIdentityType,
            sireNonAuthenticIdentity, // 1 indicates non authentic identity of sire
            dryDays, // Days dry between last lactation and current.
          ] = statement;
          const isComplete305 = [
            { case: '0', value: 'Lactation ongoing' },
            { case: '1', value: 'Assumed End' },
            { case: '2', value: 'Lactating Period Ended' },
            { case: '3', value: 'Assumed Natural End' },
            { case: '4', value: 'Definite Natural End' },
          ];
          cow = {
            ...cow,
            DSIdentifier: `${lineNumber}|${liveFlag}`,
            liveFlag,
            lineNumber: parseInt(lineNumber, 10),
            isYoungstock: (youngstock === '1'),
            breedCode,
            // eslint-disable-next-line max-len
            lactationNumber: (parseInt(lactationNumber, 10) > 25) ? parseInt(estLactationNumber, 10) : parseInt(lactationNumber, 10),
            lactationIsEstimate: (estLactationNumber !== '00'),
            complete305: isComplete305.find((x) => x.case === complete305)?.value,
            managementGroup,
            previousCalvingDate: toDate(previousCalvingDate),
            calfSireInformation: {
              sireBreedCode: sireBreed,
              sireIdentity: sireIdentity.trim(),
              sireIdentityType: IDTypeLookup.find((x) => x.case === sireIdentityType)?.value,
              sireAuthenticIdentity: (sireNonAuthenticIdentity === '0'),
            },
            daysDryBetweenLactations: parseInt(dryDays, 10),
          };
          break;
        }
        case '2': // Not in use
        // NMR use only - no data provided to build spec
          break;
        case '3': { // Sampling information
          const [, // Row identifier
            recordingDate,
            recordingEstimatedRemark,
            timesMilked, // 1, 2 or 3
            noSampleReason, // 0 = no sample, 1 = Spilt, 2 = sour, 3 = Dirty, 4 = Abnormal
            milkYield, // DDD.D
            butterfatPercentage, // DD.DD
            proteinPercentage, // as above
            lactosePercentage,, // as above             // blank
            scc,
          ] = statement;
          const estimatedRemark = [
            { case: '0', value: false },
            { case: '1', value: 'Fat / Protein / Lactose Estimated' },
            { case: '2', value: 'Full Estimate (Absent)' },
            { case: '3', value: 'Full Estimate (Sick)' },
          ];
          const noSampleLookup = [
            { case: ' ', value: false },
            { case: '0', value: 'No Sample' },
            { case: '1', value: 'Spilt' },
            { case: '2', value: 'Sour' },
            { case: '3', value: 'Dirty' },
            { case: '4', value: 'Abnormal' },
          ];
          // Push this information to the original cow.
          if (toDate(recordingDate) >= afterDate) { // If after date specified in param.
            cow.milkSamples.push({
              date: toDate(recordingDate),
              timesMilked: parseInt(timesMilked, 10),
              milkYield: (parseInt(milkYield, 10) / 10),
              butterfatPercentage: (parseInt(butterfatPercentage, 10) / 100),
              proteinPercentage: (parseInt(proteinPercentage, 10) / 100),
              lactosePercentage: (parseInt(lactosePercentage, 10) / 100),
              scc: parseInt(scc, 10),
              // eslint-disable-next-line max-len
              estimatedRemark: estimatedRemark.find((x) => x.case === recordingEstimatedRemark)?.value,
              noSample: noSampleLookup.find((x) => x.case === noSampleReason)?.value,
            });
          }
          break;
        }
        case '4': { // Service information
          const [, // row identifier
            serviceDate,
            authenticService,, // 0 = yes, 1 = no
            // blank
            serviceSireBreed,
            serviceSireIdentity,
            serviceSireIdType,
            serviceSireAuthentic,,
            pdStatus, // 0 = Not diagnosed, 1 = not pregnant, 2 = Pregnant
          ] = statement;
          const pdStatusLookup = [
            { case: '0', value: 'Not Diagnosed' },
            { case: '1', value: 'Not Pregnant' },
            { case: '2', value: 'Pregnant' },
          ];
          // Push to the cows information
          if (toDate(serviceDate) >= afterDate) { // If after param date.
            cow.services.push({
              date: toDate(serviceDate),
              authenticService: (authenticService === '0'),
              sireBreed: serviceSireBreed,
              sireIdentity: serviceSireIdentity.trim(),
              sireIDType: IDTypeLookup.find((x) => x.case === serviceSireIdType)?.value,
              authenticSire: (serviceSireAuthentic === '0'),
              pdStatus: pdStatusLookup.find((x) => x.case === pdStatus)?.value,
            });
          }
          break;
        }
        case '5': { // Calving
          const [, // row identifier
            calvingDate,
            authenticCalving,, // 0 = yes, 1 = no
            calf1Breed,
            calf1Identity,
            calf1IdentityType,
            calf1IdentityAuthentic,
            calf1Sex,
            calf2Breed,
            calf2Identity,
            calf2IdentityType,
            calf2IdentityAuthentic,
            calf2Sex,
          ] = statement;

          // Populate calves depending if there's a second calf.
          const calves: {
            breed:string,
            id: string,
            idType: string | undefined,
            authenticID: boolean,
            sex: string,
          }[] = [];
          if (calf1Breed !== '00') {
            calves.push({
              breed: calf1Breed,
              id: calf1Identity.trim(),
              idType: IDTypeLookup.find((x) => x.case === calf1IdentityType)?.value,
              authenticID: (calf1IdentityAuthentic === '0'),
              sex: calf1Sex,
            });
          }
          if (calf2Breed !== '00') {
            calves.push({
              breed: calf2Breed,
              id: calf2Identity.trim(),
              idType: IDTypeLookup.find((x) => x.case === calf2IdentityType)?.value,
              authenticID: (calf2IdentityAuthentic === '0'),
              sex: calf2Sex,
            });
          }

          // Push data to cow.
          if (toDate(calvingDate) >= afterDate) { // If param specified - only return if after date.
            cow.calvings.push({
              date: toDate(calvingDate),
              authentic: (authenticCalving === '0'),
              assumed: false,
              calves,
            });
          }
          break;
        }
        case '6': { // Third calf
        // Here we must find the last row to attach to the calving date.
          const [, // row identifier
            calf3Breed,
            calf3Identity,
            calf3IdentityType,
            calf3IdentityAuthentic,
            calf3Sex,
          ] = statement;

          if (cow.calvings.length >= 1) { // Providing we have a calving to push to...
            cow.calvings[cow.calvings.length - 1]?.calves?.push({ // push to last calving
              breed: calf3Breed,
              id: calf3Identity.trim(),
              idType: IDTypeLookup.find((x) => x.case === calf3IdentityType)?.value,
              authenticID: (calf3IdentityAuthentic === '0'),
              sex: calf3Sex,
            });
          }
          break;
        }
        case '7': { // Date of assumed calving
          const [, // row identifier
            assumedCalvingDate,
          ] = statement;
          if (toDate(assumedCalvingDate) >= afterDate) {
            cow.calvings.push({
              date: toDate(assumedCalvingDate),
              authentic: true,
              assumed: true,
            });
          }
          break;
        }
        case '8': // No sample
        case '9': // Assumed 1x milking
        case 'A': // 1x a day milking
        case 'B': // Assumed dry
        case 'C': // Dry
        case 'D': // Suckling
        case 'E': // Absent
        case 'F': // Barren
        case 'G': // Abort
        case 'H': // Sick
        case 'I': // Lame
        case 'J': // Mastitis
        case 'K': // Dead
        case 'L': // Sold in previous herd
        case 'M': { // Sold
          const eventDescription = [
            { case: '8', value: 'No sample' },
            { case: '9', value: 'Assumed 1x Milking' },
            { case: 'A', value: '1x A Day Milking' },
            { case: 'B', value: 'Assumed Dry' },
            { case: 'C', value: 'Dry' },
            { case: 'D', value: 'Sucking' },
            { case: 'E', value: 'Absent' },
            { case: 'F', value: 'Barren' },
            { case: 'G', value: 'Abortion' },
            { case: 'H', value: 'Sick' },
            { case: 'I', value: 'Lameness' },
            { case: 'J', value: 'Mastitis' },
            { case: 'K', value: 'Dead' },
            { case: 'L', value: 'Sold In Previous Herd' },
            { case: 'M', value: 'Sold' },
          ];
          const [
            eventKey,
            eventDate,
            authenticEvent, // 0 = true, 1 = false
          ] = statement;
          if (toDate(eventDate) >= afterDate) {
            cow.otherEvents.push({
              date: toDate(eventDate),
              eventType: eventDescription.find((x) => x.case === eventKey)?.value,
              authenticEvent: (authenticEvent === '0'),
            });
          }
          break;
        }
        case 'X': { // Current lactation info
          const [, // Row identifier - X
            lactationDays, // DDD.D
            totalMilkKG, // DDDDD.D
            totalFatKG, // DDDD.DD
            totalProteinKG, // as above
            totalLactoseKG, // as above
            totalFatPercentage, // DD.DD
            totalProteinPercentage, // as above
            totalLactosePercentage, // as above
            totalValue, // total value of the milk
            averagePPL,
            seasonalityApplied,
            averageSCC, // DDDD (x10^3)
          ] = statement;
          const seasonalityLookup = [
            { case: 'N', value: true },
            { case: 'C', value: true },
            { case: ' ', value: false },
            { case: 'G', value: false },
          ];

          cow = {
            ...cow,
            currentLactation: {
              lactationDays: (parseInt(lactationDays, 10) / 10),
              totalMilkKG: (parseInt(totalMilkKG, 10) / 10),
              totalFatKG: (parseInt(totalFatKG, 10) / 100), // DDDD.DD
              totalProteinKG: (parseInt(totalProteinKG, 10) / 100), // as above
              totalLactoseKG: (parseInt(totalLactoseKG, 10) / 100), // as above
              totalFatPercentage: (parseInt(totalFatPercentage, 10) / 100), // DD.DD
              totalProteinPercentage: (parseInt(totalProteinPercentage, 10) / 100), // as above
              totalLactosePercentage: (parseInt(totalLactosePercentage, 10) / 100), // as above
              totalValue: (parseInt(totalValue, 10) / 10), // total value of the milk
              averagePPL: (parseInt(averagePPL, 10) / 100),
              // eslint-disable-next-line max-len
              seasonalityApplied: seasonalityLookup.find((x) => x.case === seasonalityApplied)?.value,
              averageSCC: parseInt(averageSCC, 10),
            },
          };
          break;
        }
        case 'Z':
        // NMR only / Not in use.
          break;
        default:
      }
      return cow;
    });
    return statementInfo.push(cow);
  });
  return statementInfo;
};

export default statementInformation;
