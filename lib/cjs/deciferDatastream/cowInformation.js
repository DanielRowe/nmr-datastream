"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cowList = void 0;
const toDate_1 = require("../utils/toDate");
const leftHerdReason_1 = __importDefault(require("../lookups/leftHerdReason"));
const IDType_1 = require("../lookups/IDType");
const pedigreeStatus_1 = require("../lookups/pedigreeStatus");
const ptaSource_1 = __importDefault(require("../lookups/ptaSource"));
const cowList = (datastream) => {
    // console.warn(params);
    const cattleInfoStart = datastream.indexOf('C1');
    if (cattleInfoStart === -1) {
        throw new Error('Cattle information not found');
    }
    const statementInfoStart = datastream.indexOf('S0,');
    if (statementInfoStart === -1) {
        throw new Error('Statement information not found');
    }
    const cowInfo = datastream.substring(cattleInfoStart, statementInfoStart).split('C1,');
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
            IDType: IDType_1.IDType.find((x) => x.case === IDType)?.value,
            alternateIDNumber,
            pedigreeStatus: pedigreeStatus_1.pedigreeStatus.find((x) => x.case === pedigreeStatus)?.value,
            pedigreeClassChangeDate: (classChange !== '000000') ? toDate_1.toDate(classChange) : null,
            genuineIdentity: (genuineIdentity === '0'),
            shortName: shortName.trim(),
            longName: longName.trim(),
            isYoungstock: (isYoungstock === '1'),
            dateOfBirth: toDate_1.toDate(dateOfBirth),
            dateEnteredHerd: (dateEnteredHerd !== '000000') ? toDate_1.toDate(dateEnteredHerd) : null,
            dateLeftHerd: (dateLeftHerd !== '000000') ? toDate_1.toDate(dateLeftHerd) : null,
            inHerd: (dateLeftHerd === '000000'),
            leftHerd: (dateLeftHerd !== '000000') ? {
                date: toDate_1.toDate(dateLeftHerd),
                reason: leftHerdReason_1.default.find((x) => x.case === reasonLeftHerd)?.value,
            } : '',
            sireInformation: {
                breed: sireBreed,
                identity: sireIdentity.trim(),
                IDType: IDType_1.IDType.find((x) => x.case === sireIDType)?.value,
            },
            damInformation: {
                breed: damBreed,
                identity: damIdentity.trim(),
                IDType: IDType_1.IDType.find((x) => x.case === damIdentityType)?.value,
                pedigreeStatus: pedigreeStatus_1.pedigreeStatus.find((x) => x.case === damPedigreeStatus)?.value,
                genuineIdentity: (damGenuineIdentity === '0'),
            },
            PTA: {
                evaluationGroup: ptaSource_1.default.find((x) => x.case === evalGroup)?.value,
                evaluationSource: ptaSource_1.default.find((x) => x.case === evalSrc)?.value,
                evaluationDate: (evalDate !== '000000') ? toDate_1.toDate(evalDate) : null,
                reliability: parseInt(PTAReliability, 10),
                milkKG: parseInt(PTAMilk, 10),
                fatKG: (parseInt(PTAFatKG, 10) / 10),
                proteinKG: (parseInt(PTAProteinKG, 10) / 10),
                fatPercentage: (parseInt(PTAFatPercentage, 10) / 100),
                proteinPercentage: (parseInt(PTAProteinPercentage, 10) / 100),
            },
        });
    });
    return cows;
};
exports.cowList = cowList;
exports.default = exports.cowList;
