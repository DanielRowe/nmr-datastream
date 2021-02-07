"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statementInformation = void 0;
const toDate_1 = __importDefault(require("../utils/toDate"));
const IDType_1 = require("../lookups/IDType");
const statementInformation = (datastream) => {
    // STATEMENT INFORMATION
    const statementInfo = [];
    const statementInfoStart = datastream.indexOf('S0');
    if (statementInfoStart === -1) {
        throw new Error('Statements not found');
    }
    const lactationInfoStart = datastream.indexOf('L0,');
    if (lactationInfoStart === -1) {
        throw new Error('Lactation section not found whilst building statements');
    }
    const statementInfoFromDatastream = datastream.substring(statementInfoStart, lactationInfoStart).split('S1,');
    if (statementInfoFromDatastream.length === 0) {
        throw new Error('Statements not found');
    }
    statementInfoFromDatastream.shift(); // First value is always blank - skip.
    statementInfoFromDatastream.map((info) => {
        const prependOne = `1,${info}`; // Adds a 1 to the first line - means we can latter identify type in switch.
        const extraNumbering = prependOne.replace(/S([A-Z0-9]{1})/g, 'S$1$1'); // during split we loose the row number - add an extra for good measure.
        const rows = extraNumbering.split(/S[A-Z0-9]{1}/g); // Split down the rows.
        let cow = {
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
                    liveFlag, lineNumber, youngstock, // 0 = false 1 = true
                    breedCode, lactationNumber, // 1-25 or 81-99 if not recorded entire life
                    estLactationNumber, // Only if 81-99
                    managementGroup, complete305, // 0 = on going, 1 = assumed end, 2 =
                    previousCalvingDate, sireBreed, // Breed of the sire of the calf that started the lactation
                    sireIdentity, // Identity of sire above
                    sireIdentityType, sireNonAuthenticIdentity, // 1 indicates non authentic identity of sire
                    dryDays,] = statement;
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
                        previousCalvingDate: toDate_1.default(previousCalvingDate),
                        calfSireInformation: {
                            sireBreedCode: sireBreed,
                            sireIdentity: sireIdentity.trim(),
                            sireIdentityType: IDType_1.IDType.find((x) => x.case === sireIdentityType)?.value,
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
                    recordingDate, recordingEstimatedRemark, timesMilked, // 1, 2 or 3
                    noSampleReason, // 0 = no sample, 1 = Spilt, 2 = sour, 3 = Dirty, 4 = Abnormal
                    milkYield, // DDD.D
                    butterfatPercentage, // DD.DD
                    proteinPercentage, // as above
                    lactosePercentage, , // as above             // blank
                    scc,] = statement;
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
                    cow.milkSamples.push({
                        date: toDate_1.default(recordingDate),
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
                    break;
                }
                case '4': { // Service information
                    const [, // row identifier
                    serviceDate, authenticService, , // 0 = yes, 1 = no
                    // blank
                    serviceSireBreed, serviceSireIdentity, serviceSireIdType, serviceSireAuthentic, pdStatus,] = statement;
                    const pdStatusLookup = [
                        { case: '0', value: 'Not Diagnosed' },
                        { case: '1', value: 'Not Pregnant' },
                        { case: '2', value: 'Pregnant' },
                    ];
                    // Push to the cows information
                    cow.services.push({
                        date: toDate_1.default(serviceDate),
                        authenticService: (authenticService === '0'),
                        sireBreed: serviceSireBreed,
                        sireIdentity: serviceSireIdentity.trim(),
                        sireIDType: IDType_1.IDType.find((x) => x.case === serviceSireIdType)?.value,
                        authenticSire: (serviceSireAuthentic === '0'),
                        pdStatus: pdStatusLookup.find((x) => x.case === pdStatus)?.value,
                    });
                    break;
                }
                case '5': { // Calving
                    const [, // row identifier
                    calvingDate, authenticCalving, , // 0 = yes, 1 = no
                    calf1Breed, calf1Identity, calf1IdentityType, calf1IdentityAuthentic, calf1Sex, calf2Breed, calf2Identity, calf2IdentityType, calf2IdentityAuthentic, calf2Sex,] = statement;
                    // Populate calves depending if there's a second calf.
                    const calves = [];
                    if (calf1Breed !== '00') {
                        calves.push({
                            breed: calf1Breed,
                            identity: calf1Identity.trim(),
                            identityType: IDType_1.IDType.find((x) => x.case === calf1IdentityType)?.value,
                            identityAuthentic: (calf1IdentityAuthentic === '0'),
                            sex: calf1Sex,
                        });
                    }
                    if (calf2Breed !== '00') {
                        calves.push({
                            breed: calf2Breed,
                            identity: calf2Identity.trim(),
                            identityType: IDType_1.IDType.find((x) => x.case === calf2IdentityType)?.value,
                            identityAuthentic: (calf2IdentityAuthentic === '0'),
                            sex: calf2Sex,
                        });
                    }
                    // Push data to cow.
                    cow.calvings.push({
                        date: toDate_1.default(calvingDate),
                        authentic: (authenticCalving === '0'),
                        assumed: false,
                        calves,
                    });
                    break;
                }
                case '6': { // Third calf
                    // Here we must find the last row to attach to the calving date.
                    const [, // row identifier
                    calf3Breed, calf3Identity, calf3IdentityType, calf3IdentityAuthentic, calf3Sex,] = statement;
                    cow.calvings[cow.calvings.length - 1]?.calves?.push({
                        breed: calf3Breed,
                        identity: calf3Identity.trim(),
                        identityType: IDType_1.IDType.find((x) => x.case === calf3IdentityType)?.value,
                        identityAuthentic: (calf3IdentityAuthentic === '0'),
                        sex: calf3Sex,
                    });
                    break;
                }
                case '7': { // Date of assumed calving
                    const [, // row identifier
                    assumedCalvingDate,] = statement;
                    cow.calvings.push({
                        date: toDate_1.default(assumedCalvingDate),
                        authentic: true,
                        assumed: true,
                    });
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
                    const [eventKey, eventDate, authenticEvent,] = statement;
                    cow.otherEvents.push({
                        date: toDate_1.default(eventDate),
                        eventType: eventDescription.find((x) => x.case === eventKey)?.value,
                        authenticEvent: (authenticEvent === '0'),
                    });
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
                    averagePPL, seasonalityApplied, averageSCC,] = statement;
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
                            totalFatKG: (parseInt(totalFatKG, 10) / 100),
                            totalProteinKG: (parseInt(totalProteinKG, 10) / 100),
                            totalLactoseKG: (parseInt(totalLactoseKG, 10) / 100),
                            totalFatPercentage: (parseInt(totalFatPercentage, 10) / 100),
                            totalProteinPercentage: (parseInt(totalProteinPercentage, 10) / 100),
                            totalLactosePercentage: (parseInt(totalLactosePercentage, 10) / 100),
                            totalValue: (parseInt(totalValue, 10) / 10),
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
                    return false;
            }
            return cow;
        });
        return statementInfo.push(cow);
    });
    return statementInfo;
};
exports.statementInformation = statementInformation;
exports.default = exports.statementInformation;
