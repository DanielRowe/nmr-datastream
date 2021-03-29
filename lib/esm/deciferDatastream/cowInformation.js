import { toDate } from '../utils/toDate';
import leftHerdReason from '../lookups/leftHerdReason';
import { IDType as IDTypeLookup } from '../lookups/IDType';
import { pedigreeStatus as pedigreeStatusLookup } from '../lookups/pedigreeStatus';
import ptaSource from '../lookups/ptaSource';
export const cowList = (datastream, params) => {
    /* let filter = {};
    for (item in params) {
      filter[item] = params[item];
    } */
    let filter = {};
    if (params) {
        filter = params;
    }
    const cattleInfoStart = datastream.indexOf('C1');
    if (cattleInfoStart === -1) {
        throw new Error('Cattle information not found');
    }
    const statementInfoStart = datastream.indexOf('S0,');
    if (statementInfoStart === -1) {
        throw new Error('Statement information not found');
    }
    const datastreamInfo = datastream.substring(cattleInfoStart, statementInfoStart);
    // Test to see if we match the basic cow info before proceeding...
    if (!/C1,(\d\d),/g.test(datastreamInfo)) {
        throw new Error('No cow information found');
    }
    const reAddRegion = datastreamInfo.replace(/C1,(\d\d),/g, 'C1,$1,$1,');
    const cowInfo = reAddRegion.split(/C1,\d\d,/g);
    if (cowInfo.length === 0) {
        throw new Error('No cow information found');
    }
    const cows = []; // Create empty array to populate.
    cowInfo.shift(); // First value is always blank - ignore it.
    cowInfo.map((cow) => {
        const [, // Region number - not sure it's needed.
        producerNumber, herdCode, liveFlag, // 0 = Alive, 1-9 = sold / dead. Means same cow can use same line number... such fun
        lineNumber, breedCode, identityNumber, // Ear tag or herdbook number
        IDType, pedigreeStatus, genuineIdentity, , , , // 0 = authentic, 1 = not // genuineEmn (unknown),,      , // Blank
        // Line 2 Start
        breedCode2, alternateIDNumber, dateOfBirth, isYoungstock, // 0 = cow
        dateEnteredHerd, dateLeftHerd, reasonLeftHerd, // 0 = in herd, 1 = dead, 2 = sold, 4 = ceased recording
        classChange, , , // Date of change of pedigree class,      , // blank
        // line 3 start
        shortName, // 20 chars
        longName, , , // 40 chars      , // blank
        // line 4 start
        sireBreed, sireIdentity, sireIDType, , // Same as animal id type.       // blank filler
        damBreed, damIdentity, damIdentityType, damPedigreeStatus, damGenuineIdentity, , , // blank
        // line 5 start
        evalGroup, evalSrc, evalDate, PTAMilk, // +/- DDDD
        PTAFatKG, // +/- DDD.D
        PTAProteinKG, // as above
        PTAFatPercentage, // +/- DD.DD
        PTAProteinPercentage, // as above.
        PTAReliability,] = cow.split(',');
        // console.log(sireBreed);
        return cows.push({
            producerNumber: parseInt(producerNumber, 10),
            herdCode: parseInt(herdCode, 10),
            lineNumber: parseInt(lineNumber, 10),
            DSIdentifier: `${lineNumber}|${liveFlag}`,
            breedCode,
            otherBreedCode: breedCode2,
            identityNumber: identityNumber.trim(),
            IDType: IDTypeLookup.find((x) => x.case === IDType)?.value,
            alternateIDNumber,
            pedigreeStatus: pedigreeStatusLookup.find((x) => x.case === pedigreeStatus)?.value,
            pedigreeClassChangeDate: (classChange !== '000000') ? toDate(classChange) : null,
            genuineIdentity: (genuineIdentity === '0'),
            shortName: shortName.trim(),
            longName: longName.trim(),
            isYoungstock: (isYoungstock === '1'),
            dateOfBirth: toDate(dateOfBirth),
            dateEnteredHerd: (dateEnteredHerd !== '000000') ? toDate(dateEnteredHerd) : null,
            dateLeftHerd: (dateLeftHerd !== '000000') ? toDate(dateLeftHerd) : null,
            inHerd: (dateLeftHerd === '000000'),
            leftHerd: (dateLeftHerd !== '000000') ? {
                date: toDate(dateLeftHerd),
                reason: leftHerdReason.find((x) => x.case === reasonLeftHerd)?.value,
            } : '',
            sireInformation: {
                breed: sireBreed,
                identity: sireIdentity.trim(),
                IDType: IDTypeLookup.find((x) => x.case === sireIDType)?.value,
            },
            damInformation: {
                breed: damBreed,
                identity: damIdentity.trim(),
                IDType: IDTypeLookup.find((x) => x.case === damIdentityType)?.value,
                pedigreeStatus: pedigreeStatusLookup.find((x) => x.case === damPedigreeStatus)?.value,
                genuineIdentity: (damGenuineIdentity === '0'),
            },
            PTA: {
                evaluationGroup: ptaSource.find((x) => x.case === evalGroup)?.value,
                evaluationSource: ptaSource.find((x) => x.case === evalSrc)?.value,
                evaluationDate: (evalDate !== '000000') ? toDate(evalDate) : null,
                reliability: parseInt(PTAReliability, 10),
                milkKG: parseInt(PTAMilk, 10),
                fatKG: (parseInt(PTAFatKG, 10) / 10),
                proteinKG: (parseInt(PTAProteinKG, 10) / 10),
                fatPercentage: (parseInt(PTAFatPercentage, 10) / 100),
                proteinPercentage: (parseInt(PTAProteinPercentage, 10) / 100),
            },
        });
    });
    // Sort the cows by any params provided.
    const filterArray = Object.entries(filter); // Create an array of any filters.
    const sortedCows = cows.filter((item) => {
        // Create an inner return value - allows the inner functions to return a value to the filter.
        let returnInner = true;
        if (filterArray.length > 0) { // If we have items to filter...
            filterArray.map((keyValue) => {
                const [key, value] = keyValue; // Key / Value from the filters
                if (value instanceof Date) { // If it's a date we have to compare if it's greater value.
                    if (item[key] === undefined || item[key] < value) {
                        returnInner = false;
                        return false;
                    }
                }
                else {
                    // If not defined or doesn't match the value wanted then we don't need it.
                    if (item[key] === undefined || item[key] !== value) {
                        returnInner = false;
                        return false;
                    }
                    return true;
                }
                return true;
            });
        }
        return returnInner;
    });
    return sortedCows;
};
export default cowList;
