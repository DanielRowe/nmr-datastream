import toDate from '../utils/toDate';
import { IDType as IDTypeLookup } from '../lookups/IDType';
export const lactationsList = (datastream) => {
    const lactationInfoStart = datastream.indexOf('L0');
    if (lactationInfoStart === -1) {
        throw new Error('Lactations not found');
    }
    const bullInfoStart = datastream.indexOf('B1,');
    if (lactationInfoStart === -1) {
        throw new Error('Bull section not found whilst building lactations');
    }
    const lactationList = [];
    const lactationInfoFromDatastream = datastream.substring(lactationInfoStart, bullInfoStart).split('L1,');
    if (lactationInfoFromDatastream.length === 0) {
        throw new Error('Lactations not found');
    }
    lactationInfoFromDatastream.shift(); // First value is always blank - skip.
    lactationInfoFromDatastream.map((info) => {
        const prependOne = `1,${info}`; // Adds a 1 to the first line - means we can latter identify type in switch.
        const extraNumbering = prependOne.replace(/L(\d)/gi, 'L$1$1'); // during split we loose the row number - add an extra for good measure.
        const rows = extraNumbering.split(/L\d/); // Split down the rows.
        let cow = {
            calves: [],
        };
        rows.map((row) => {
            const lactation = row.split(','); // Split the values in the array by comma.
            // How we can use the data depends on it's type. Switch statement should help here.
            switch (lactation[0]) {
                case '1': {
                    const [, liveFlag, lineNumber, lactationNumber, breedCode, totalMaleCalves, totalFemaleCalves, totalDeadCalves, numberDaysDry, estimatedLactationNumber, totalServices, missedRecordings, seasonalAdjustment, financialValue, productionIndex, productionBase, lameCount, mastitsCount, sickCount,] = lactation;
                    cow = {
                        ...cow,
                        DSIdentifier: `${lineNumber}|${liveFlag}`,
                        lineNumber: parseInt(lineNumber, 10),
                        lactationNumber: parseInt(lactationNumber, 10),
                        estimatedLactationNumber: parseInt(estimatedLactationNumber, 10),
                        breed: breedCode,
                        // eslint-disable-next-line max-len
                        totalCalves: parseInt(totalDeadCalves, 10) + parseInt(totalFemaleCalves, 10) + parseInt(totalMaleCalves, 10),
                        totalDeadCalves: parseInt(totalDeadCalves, 10),
                        totalFemaleCalves: parseInt(totalFemaleCalves, 10),
                        totalMaleCalves: parseInt(totalMaleCalves, 10),
                        numberDaysDry: parseInt(numberDaysDry, 10),
                        totalServices: parseInt(totalServices, 10),
                        missedRecordings: parseInt(missedRecordings, 10),
                        healthCounts: {
                            mastitis: parseInt(mastitsCount, 10),
                            lameness: parseInt(lameCount, 10),
                            sickness: parseInt(sickCount, 10),
                        },
                        seasonalAdjustment: parseInt(seasonalAdjustment, 10),
                        financialValue: parseInt(financialValue, 10),
                        productionBase: parseInt(productionBase, 10),
                        productionIndex: parseInt(productionIndex, 10),
                    };
                    break;
                }
                case '2': {
                    const [, calvingInterval, ageAtCalving, calvingDate, authenticCalvingDate, sireBreed, sireIdentity, sireIdentityType, sireAuthenticIdentity, , 
                    // filler
                    calf1Breed, calf1Identity, calf1IdentityType, calf1IdentityAuthentic, calf1Sex,] = lactation;
                    cow = {
                        ...cow,
                        calvingInterval: parseInt(calvingInterval, 10),
                        ageAtCalving: parseInt(ageAtCalving, 10),
                        calvingDate: (calvingDate !== '000000') ? toDate(calvingDate) : undefined,
                        authenticCalvingDate: (authenticCalvingDate === '0'),
                        sireBreed,
                        sireID: sireIdentity.trim(),
                        sireIDType: IDTypeLookup.find((x) => x.case === sireIdentityType)?.value,
                        sireAuthenticID: (sireAuthenticIdentity === '0'),
                    };
                    if (calf1Breed !== '00' && typeof calf1Breed !== 'undefined') {
                        const calf = {
                            breed: calf1Breed,
                            id: calf1Identity.trim(),
                            idType: IDTypeLookup.find((x) => x.case === calf1IdentityType)?.value,
                            authenticID: (calf1IdentityAuthentic === '0'),
                            sex: calf1Sex,
                        };
                        cow.calves?.push(calf);
                    }
                    break;
                }
                case '3': {
                    const [, calf2Breed, calf2Identity, calf2IdentityType, calf2IdentityAuthentic, calf2Sex, calf3Breed, calf3Identity, calf3IdentityType, calf3IdentityAuthentic, calf3Sex,] = lactation;
                    if (calf2Breed !== '00') {
                        const calf = {
                            breed: calf2Breed,
                            id: calf2Identity.trim(),
                            idType: IDTypeLookup.find((x) => x.case === calf2IdentityType)?.value,
                            authenticID: (calf2IdentityAuthentic === '0'),
                            sex: calf2Sex,
                        };
                        cow.calves?.push(calf);
                    }
                    if (calf3Breed !== '00') {
                        const calf = {
                            breed: calf3Breed,
                            id: calf3Identity.trim(),
                            idType: IDTypeLookup.find((x) => x.case === calf3IdentityType)?.value,
                            authenticID: (calf3IdentityAuthentic === '0'),
                            sex: calf3Sex,
                        };
                        cow.calves?.push(calf);
                    }
                    break;
                }
                case '4':
                case '5': {
                    const [naturalOr305, qualifyingLactation, authenticTotals, milkYield, fatKG, proteinKG, lactoseKG, totalDays, total3xMilkedDays, milked3XStartDays, lactationEndDate, endReason, totalRecordings, averageCellCount, cellCountsOver200,] = lactation;
                    const endReasons = [
                        { case: '1', value: 'Dead' },
                        { case: '2', value: 'Sold' },
                        { case: '3', value: 'Dry' },
                        { case: '4', value: '1x Milking' },
                        { case: '5', value: 'LP' },
                        { case: '6', value: 'Calved' },
                        { case: '7', value: 'Ceased to record' },
                        { case: '8', value: 'Suckled' },
                    ];
                    const thisLactation = {
                        qualifyingLactation: (qualifyingLactation === '0'),
                        authenticTotals: (authenticTotals === '0'),
                        milkYield: (parseInt(milkYield, 10) / 10),
                        fatKG: (parseInt(fatKG, 10) / 100),
                        proteinKG: (parseInt(proteinKG, 10) / 100),
                        lactoseKG: (parseInt(lactoseKG, 10) / 100),
                        totalDays: (parseInt(totalDays, 10) / 10),
                        total3xMilkedDays: (parseInt(total3xMilkedDays, 10) / 10),
                        milked3XStartDays: (parseInt(milked3XStartDays, 10) / 10),
                        lactationEndDate: (lactationEndDate !== '000000') ? toDate(lactationEndDate) : undefined,
                        endReason: endReasons.find((x) => x.case === endReason)?.value,
                        totalRecordings: parseInt(totalRecordings, 10),
                        averageCellCount: parseInt(averageCellCount, 10),
                        cellCountsOver200: parseInt(cellCountsOver200, 10),
                    };
                    if (naturalOr305 === '4') {
                        cow.qualifyingLactation = thisLactation;
                    }
                    else if (naturalOr305 === '5') {
                        cow.naturalLactation = thisLactation;
                    }
                    break;
                }
                default:
                    return false;
            }
            return cow;
        });
        return lactationList.push(cow);
    });
    return lactationList;
};
export default lactationsList;
