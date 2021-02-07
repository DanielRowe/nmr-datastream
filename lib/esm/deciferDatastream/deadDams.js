import { toDate } from '../utils/toDate';
import { IDType as IDTypeLookup } from '../lookups/IDType';
import { pedigreeStatus as pedigreeStatusLookup } from '../lookups/pedigreeStatus';
import ptaSource from '../lookups/ptaSource';
export const deadDams = (datastream) => {
    const dams = [];
    const deadDamInfoStart = datastream.indexOf('D1');
    if (deadDamInfoStart === -1) { // No dead dam's exist - error.
        throw new Error('No dead dams exit');
    }
    // There's no guarantees if there are any weights if not end at
    // end of file otherwise cut appropriately
    let deadDamInfoEnd = datastream.length;
    if (datastream.indexOf('W1') > 0) {
        deadDamInfoEnd = datastream.indexOf('W1');
    }
    const deadDamInfoFromDatastream = datastream.substring(deadDamInfoStart, deadDamInfoEnd).split('D1,');
    deadDamInfoFromDatastream.shift(); // First value is always blank - skip.
    deadDamInfoFromDatastream.map((info) => {
        const prependOne = `1,${info}`; // Adds a 1 to the first line - means we can latter identify type in switch.
        const extraNumbering = prependOne.replace(/D(\d)/gi, 'D$1$1'); // during split we loose the row number - add an extra for good measure.
        const rows = extraNumbering.split(/D\d/); // Split down the rows.
        let dam = {
            ptas: [],
        };
        rows.map((row) => {
            const damInfo = row.split(','); // Split the values in the array by comma.
            // How we can use the data depends on it's type. Switch statement should help here.
            switch (damInfo[0]) {
                case '1': {
                    const [, // first row is identifier
                    breed, identity, idType, idAuthentic, pedigreeStatus, name,] = damInfo;
                    dam = {
                        ...dam,
                        name: name.trim(),
                        breed,
                        identity: identity.trim(),
                        identityType: IDTypeLookup.find((x) => x.case === idType)?.value,
                        authenticIdentity: (idAuthentic === '0'),
                        pedigreeStatus: pedigreeStatusLookup.find((x) => x.case === pedigreeStatus)?.value,
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
                    const [, evalGroup, evalSrc, evalDate, PTAMilk, // +/- DDDD
                    PTAFatKG, // +/- DDD.D
                    PTAProteinKG, // as above
                    PTAFatPercentage, // +/- DD.DD
                    PTAProteinPercentage, // as above.
                    PTAReliability,] = damInfo;
                    dam.ptas.push({
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
            return dam;
        });
        return dams.push(dam);
    });
    return dams;
};
export default deadDams;
