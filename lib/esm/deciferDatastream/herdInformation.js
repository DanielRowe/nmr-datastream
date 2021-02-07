import toDate from '../utils/toDate';
export const herdInformation = (datastream) => {
    let herdInfo = {
        address: {},
        nmrInformation: {},
    };
    const cattleInfoStart = datastream.indexOf('C1');
    if (cattleInfoStart === -1) {
        throw new Error('Next section not found');
    }
    // We'll start by sorting out any herd information...
    // Ignore any data at cattle info start, then split by HD to array
    const herdRecordings = datastream.substring(0, cattleInfoStart).split('HD,');
    if (herdRecordings.length === 0) {
        throw new Error('No herd records found');
    }
    const rows = herdRecordings[0].split('H'); // Do something with H0 to H8 - contains farm info.
    rows.map((row) => {
        const information = row.split(',');
        switch (information[0]) {
            case '1': {
                const [, nmrCounty, nmrOffice, nmrSchemeCode, weightingSequence, lastWeightingMonth, , herdMark, pedigreeBreed, herdPrefix, startedRecording,] = information;
                const schemeLookup = [
                    { case: '01', value: 'Premium' },
                    { case: '02', value: 'CMR' },
                    { case: '03', value: 'PMR' },
                    { case: '04', value: 'FMR' },
                    { case: '05', value: 'Goats' },
                    { case: '06', value: 'Isle of Man' },
                    { case: '07', value: 'Jersey' },
                    { case: '08', value: 'Guernsey' },
                    { case: '11', value: 'Standard 1' },
                    { case: '12', value: 'Standard 2' },
                    { case: '13', value: 'Standard 3' },
                    { case: '14', value: 'Standard 4' },
                    { case: '15', value: 'Basic 1' },
                    { case: '16', value: 'Basic 2' },
                ];
                herdInfo = {
                    ...herdInformation,
                    pedigreeBreed,
                    herdPrefix: herdPrefix.trim(),
                    startedRecording: (startedRecording !== '000000') ? toDate(startedRecording) : null,
                    nmrInformation: {
                        ...herdInfo.nmrInformation,
                        nmrCounty,
                        nmrOffice,
                        scheme: schemeLookup.find((x) => x.case === nmrSchemeCode)?.value,
                        weightingSequence,
                        lastWeightingMonth: parseInt(lastWeightingMonth, 10),
                        herdMark: herdMark.trim(),
                    },
                };
                break;
            }
            case '2': {
                const [, addressLine1,] = information;
                herdInfo.address = {
                    ...herdInfo.address,
                    line1: addressLine1.trim(),
                };
                break;
            }
            case '3': {
                const [, addressLine2,] = information;
                herdInfo.address = {
                    ...herdInfo.address,
                    line2: addressLine2.trim(),
                };
                break;
            }
            case '4': {
                const [, addressLine3,] = information;
                herdInfo.address = {
                    ...herdInfo.address,
                    line3: addressLine3.trim(),
                };
                break;
            }
            case '5': {
                const [, addressLine4,] = information;
                herdInfo.address = {
                    ...herdInfo.address,
                    line4: addressLine4.trim(),
                };
                break;
            }
            case '6': {
                const [, addressLine5,] = information;
                herdInfo.address = {
                    ...herdInfo.address,
                    line5: addressLine5.trim(),
                };
                break;
            }
            case '7': {
                const [, county, postcode, , serviceType, progenyTest, lifeTimeYieldMember, , cowCardPrinted, calfCropIndex,] = information;
                const serviceTypeLookup = [
                    { case: 'A', value: 'Automatic Service' },
                    { case: 'M', value: 'Manual Service' },
                ];
                const cowCardPrintedLookup = [
                    { case: '0', value: 'Never' },
                    { case: '1', value: 'End of 305 lactation' },
                    { case: '2', value: 'End of natural' },
                    { case: '3', value: 'End of 305 and natural' },
                ];
                const calfCropIndexLookup = [
                    { case: '1', value: 'Jan, Apr, Jul, Oct' },
                    { case: '2', value: 'Feb, May, Aug, Nov' },
                    { case: '3', value: 'Mar, Jun, Sep, Dec' },
                ];
                herdInfo.address = {
                    ...herdInfo.address,
                    county: county.trim(),
                    postcode: postcode.trim(),
                };
                herdInfo.nmrInformation = {
                    ...herdInfo.nmrInformation,
                    serviceType: serviceTypeLookup.find((x) => x.case === serviceType)?.value,
                    progenyTest,
                    lifeTimeYieldMember,
                    cowCardPrinted: cowCardPrintedLookup.find((x) => x.case === cowCardPrinted)?.value,
                    calfCropIndex: calfCropIndexLookup.find((x) => x.case === calfCropIndex)?.value,
                };
                break;
            }
            case '8': {
                const [, herdWatchMember, , cellCountMember,] = information;
                const cellCountMemberLookup = [
                    { case: '0', value: 'Not a member' },
                    { case: '1', value: 'Member' },
                    { case: '3', value: 'Resigned' },
                ];
                herdInfo.nmrInformation = {
                    ...herdInfo.nmrInformation,
                    herdWatchMember,
                    cellCountMember: cellCountMemberLookup.find((x) => x.case === cellCountMember)?.value,
                };
                break;
            }
            default:
                return true;
        }
        return herdInfo;
    });
    return herdInfo;
};
export default herdInformation;
