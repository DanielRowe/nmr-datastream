"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCowInformation = void 0;
const cowListComplete_1 = require("./cowListComplete");
const findCowInformation = (datastream, params) => {
    let cow = [];
    if (params && Object.keys(params).length === 0) {
        throw new Error('No parameters defined to search');
    }
    const info = cowListComplete_1.cowListComplete(datastream);
    if (typeof params?.id !== 'undefined') { // Search by ID if defined
        const idNumber = info.filter((x) => x.identityNumber === params.id);
        if (idNumber.length > 0) {
            cow = idNumber;
            return cow;
        }
        // If we haven't found it by primary ID search alternate ID as well...
        const altNumber = info.filter((x) => x.alternateIDNumber === params.id);
        if (altNumber.length > 0) {
            cow = altNumber;
            return cow;
        }
    }
    if (typeof params?.lineNumber !== 'undefined') { // Find by line number if defined
        const lineNumberSearch = info.filter((x) => x.lineNumber === params.lineNumber);
        if (lineNumberSearch.length > 0) {
            cow = lineNumberSearch;
            return cow;
        }
    }
    if (typeof params?.DSIdentifier !== 'undefined') { // Find by DSIdentifier if defined
        const DSIdentifierSearch = info.filter((x) => x.DSIdentifier === params.DSIdentifier);
        if (DSIdentifierSearch.length > 0) {
            cow = DSIdentifierSearch;
            return cow;
        }
    }
    return cow;
};
exports.findCowInformation = findCowInformation;
exports.default = exports.findCowInformation;
