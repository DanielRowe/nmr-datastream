"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cowListComplete = void 0;
const cowInformation_1 = require("./deciferDatastream/cowInformation");
const statementInformation_1 = __importDefault(require("./deciferDatastream/statementInformation"));
const lactationInformation_1 = require("./deciferDatastream/lactationInformation");
const cowListComplete = (datastream) => {
    const completeCows = [];
    const cows = cowInformation_1.cowList(datastream);
    const statements = statementInformation_1.default(datastream);
    const lactations = lactationInformation_1.lactationsList(datastream);
    cows.map((cow) => {
        // Find relevant statement information
        const statement = statements.find((x) => x.DSIdentifier === cow.DSIdentifier);
        // Find relevant lactation information
        const lactation = lactations.filter((x) => x.DSIdentifier === cow.DSIdentifier);
        // Put together a new object!
        return completeCows.push({
            ...cow,
            currentLactationNumber: statement?.lactationNumber,
            milkSamples: statement?.milkSamples,
            services: statement?.services,
            calvings: statement?.calvings,
            events: statement?.otherEvents,
            currentLactation: statement?.currentLactation,
            allLactations: lactation,
        });
    });
    return completeCows;
};
exports.cowListComplete = cowListComplete;
exports.default = exports.cowListComplete;
