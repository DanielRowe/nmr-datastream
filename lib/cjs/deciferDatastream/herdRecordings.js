"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.herdRecordings = void 0;
const toDate_1 = require("../utils/toDate");
const herdRecordings = (datastream) => {
    const recordings = [];
    const cattleInfoStart = datastream.indexOf('C1');
    // If we can't find the next part of the datastream... Somethings gone wrong.
    if (cattleInfoStart === -1) {
        throw new Error('Next section not found');
    }
    // We'll start by sorting out any herd information...
    // Ignore any data at cattle info start, then split by HD to array
    const herdInfo = datastream.substring(0, cattleInfoStart).split('HD,');
    if (herdInfo.length === 0) { // Throw exception if we've no records.
        throw new Error('No herd records found');
    }
    herdInfo.shift();
    herdInfo.map((info) => {
        // Break down array of info by easy to refer to name.
        const [recordingDate, , , // YYMMDD      , // recordingSeq // Blank
        // blank
        totalAnimals, cowsInMilk, cowsIn3xMilk, // Don't think this is in use.
        herdWOM, // Total amount of milk // DDDDD.D
        herdWOF, // Total fat kg DDD.DDDD
        herdWOP, // Total protein kg DDD.DDDD
        herdWOL, // Total lactose (as above)
        diffCode, missedWeight, printEligible, , , // blank
        // Line end / HE row.
        bulkYield, bulkFatPercentage, bulkProteinPercentage, bulkLactosePercentage, herdProductionBase, , , // blank
        // blank
        averageSCC,] = info.split(',');
        const differenceCodes = [
            { code: '0', value: '' },
            { code: '1', value: 'No Sample Taken' },
            { code: '2', value: 'Yields Missing' },
            { code: '3', value: 'Not received in lab' },
            { code: '4', value: 'No Sample Taken' },
            { code: '5', value: 'Spilt' },
            { code: '6', value: 'Spoilt / Sour' },
            { code: '7', value: 'Sediment' },
        ];
        return recordings.push({
            date: toDate_1.toDate(recordingDate),
            totalAnimals: parseInt(totalAnimals, 10),
            cowsInMilk: parseInt(cowsInMilk, 10),
            cowsIn3xMilk: parseInt(cowsIn3xMilk, 10),
            totalWeightOfMilk: (parseInt(herdWOM, 10) / 10),
            totalWeightOfFat: (parseInt(herdWOF, 10) / 10000),
            totalWeightOfProtein: (parseInt(herdWOP, 10) / 10000),
            totalWeightOfLactose: (parseInt(herdWOL, 10) / 10000),
            differenceReason: differenceCodes.find((x) => x.code === diffCode)?.value,
            numberMissedWeights: parseInt(missedWeight, 10),
            printEligible: (printEligible === '0' || printEligible === ' '),
            bulkYield: parseInt(bulkYield, 10),
            bulkFatPercentage: (parseInt(bulkFatPercentage, 10) / 100),
            bulkProteinPercentage: (parseInt(bulkProteinPercentage, 10) / 100),
            bulkLactosePercentage: (parseInt(bulkLactosePercentage, 10) / 100),
            herdProductionBase: parseInt(herdProductionBase, 10),
            bulkSCC: parseInt(averageSCC, 10),
        });
    });
    return recordings;
};
exports.herdRecordings = herdRecordings;
exports.default = exports.herdRecordings;
