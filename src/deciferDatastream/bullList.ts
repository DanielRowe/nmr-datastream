import { toDate } from '../utils/toDate';
import ptaSource from '../lookups/ptaSource';

interface BullInformation {
  shortName?: string,
  longName?: string,
  breed?: string,
  herdbookNumber?: string,
  ptas: {
    evaluationGroup: string | undefined,
    evaluationSource: string | undefined,
    evaluationDate: Date | null,
    reliability: number,
    milkKG: number,
    fatKG: number,
    proteinKG: number,
    fatPercentage: number,
    proteinPercentage: number,
  }[],
}

export const bullList = (datastream: string) => {
  const bulls: BullInformation[] = [];

  const bullInfoStart = datastream.indexOf('B1');

  if (bullInfoStart === -1) {
    throw new Error('No bull information found');
  }

  // There's no guarantees if there are any dead dams, nor weights
  // if neither end at end of file otherwise cut appropriately
  let bullInfoEnd = datastream.length;

  if (datastream.indexOf('D1') > 0) {
    bullInfoEnd = datastream.indexOf('D1');
  } else if (datastream.indexOf('W1') > 0) {
    bullInfoEnd = datastream.indexOf('W1');
  }
  const bullInfoFromDatastream = datastream.substring(bullInfoStart, bullInfoEnd).split('B1,');
  bullInfoFromDatastream.shift(); // First value is always blank - skip.

  bullInfoFromDatastream.map((info) => {
    const prependOne = `1,${info}`; // Adds a 1 to the first line - means we can latter identify type in switch.
    const extraNumbering = prependOne.replace(/B(\d)/gi, 'B$1$1'); // during split we loose the row number - add an extra for good measure.
    const rows = extraNumbering.split(/B\d/); // Split down the rows.

    let bull:BullInformation = {
      ptas: [],
    };

    rows.map((row) => {
      const bullInfo = row.split(','); // Split the values in the array by comma.
      // How we can use the data depends on it's type. Switch statement should help here.
      switch (bullInfo[0]) {
        case '1': {
          const [, // first row is identifier
            breed,
            identity,
            longName,
            shortName,
          ] = bullInfo;
          bull = {
            ...bull,
            shortName: shortName.trim(),
            longName: longName.trim(),
            breed,
            herdbookNumber: identity.trim(),
          };
          break;
        }
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8': {
          const [,
            evalGroup,
            evalSrc,
            evalDate,
            PTAMilk, // +/- DDDD
            PTAFatKG, // +/- DDD.D
            PTAProteinKG, // as above
            PTAFatPercentage, // +/- DD.DD
            PTAProteinPercentage, // as above.
            PTAReliability,
          ] = bullInfo;
          bull.ptas.push({
            evaluationGroup: ptaSource.find((x) => x.case === evalGroup)?.value,
            evaluationSource: ptaSource.find((x) => x.case === evalSrc)?.value,
            evaluationDate: (evalDate !== '000000') ? toDate(evalDate) : null,
            reliability: parseInt(PTAReliability, 10),
            milkKG: parseInt(PTAMilk, 10),
            fatKG: (parseInt(PTAFatKG, 10) / 10),
            proteinKG: (parseInt(PTAProteinKG, 10) / 10),
            fatPercentage: (parseInt(PTAFatPercentage, 10) / 100),
            proteinPercentage: (parseInt(PTAProteinPercentage, 10) / 100),
          });
          break;
        }
        default:
          return false;
      }
      return bull;
    });
    return bulls.push(bull);
  });
  return bulls;
};

export default bullList;
