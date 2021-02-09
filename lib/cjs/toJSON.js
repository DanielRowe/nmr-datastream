"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJSON = void 0;
const cowInformation_1 = require("./deciferDatastream/cowInformation");
const statementInformation_1 = __importDefault(require("./deciferDatastream/statementInformation"));
const lactationInformation_1 = require("./deciferDatastream/lactationInformation");
const bullList_1 = __importDefault(require("./deciferDatastream/bullList"));
const deadDams_1 = __importDefault(require("./deciferDatastream/deadDams"));
const herdInformation_1 = __importDefault(require("./deciferDatastream/herdInformation"));
const herdRecordings_1 = __importDefault(require("./deciferDatastream/herdRecordings"));
const cowListComplete_1 = __importDefault(require("./cowListComplete"));
const toJSON = (datastream, outputCowListComplete = false) => {
    const output = {};
    output.herdInformation = herdInformation_1.default(datastream);
    output.herdRecordings = herdRecordings_1.default(datastream);
    // Depending on user choice add cows and relevant info
    if (outputCowListComplete) {
        output.cows = cowListComplete_1.default(datastream);
    }
    else {
        output.cows = cowInformation_1.cowList(datastream);
        output.statementInformation = statementInformation_1.default(datastream);
        output.lactations = lactationInformation_1.lactationsList(datastream);
    }
    // If the file contains bull information - we can add it
    const bullInfoStart = datastream.indexOf('B1');
    if (bullInfoStart !== -1) {
        output.bulls = bullList_1.default(datastream);
    }
    // If the file contains dead dams - add it!
    const deadDamInfoStart = datastream.indexOf('D1');
    if (deadDamInfoStart !== -1) {
        output.deadDams = deadDams_1.default(datastream);
    }
    return output;
};
exports.toJSON = toJSON;
exports.default = exports.toJSON;
