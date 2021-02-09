"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calvings = exports.currentLactationInformation = exports.otherEvents = exports.healthEvents = exports.services = exports.samples = void 0;
const statementInformation_1 = __importDefault(require("./deciferDatastream/statementInformation"));
const lactationInformation_1 = __importDefault(require("./deciferDatastream/lactationInformation"));
/* Samples

Returns an array of all sample results taken at all recording

@param datastream (string)

*/
const samples = (datastream) => {
    const statements = statementInformation_1.default(datastream); // Load all statement info
    const milkSamples = [];
    statements.map((statement) => {
        if (statement.milkSamples.length > 1) { // Only bother if there are samples...
            statement.milkSamples.map((sample) => milkSamples.push({
                DSIdentifier: statement.DSIdentifier,
                liveFlag: statement.liveFlag,
                lineNumber: statement.lineNumber,
                ...sample,
            }));
        }
        return false;
    });
    return milkSamples;
};
exports.samples = samples;
/* Services

Returns an array of all services within the datastream.

@param datastream (string)

*/
const services = (datastream) => {
    const statements = statementInformation_1.default(datastream);
    const allServices = [];
    statements.map((statement) => {
        if (statement.services.length > 1) {
            statement.services.map((service) => allServices.push({
                DSIdentifier: statement.DSIdentifier,
                liveFlag: statement.liveFlag,
                lineNumber: statement.lineNumber,
                ...service,
            }));
        }
        return false;
    });
    return allServices;
};
exports.services = services;
/* Health Events

Returns an array of all health events within the datastream file

@param datastream (string)

*/
const healthEvents = (datastream) => {
    const statements = statementInformation_1.default(datastream);
    const allHealthEvents = [];
    statements.map((statement) => {
        if (statement.services.length > 1) {
            statement.otherEvents.map((event) => {
                const acceptedValues = ['Sick', 'Mastitis', 'Lameness'];
                // If the event has one of the previous values - add it to our health events array.
                if (typeof event.eventType !== 'undefined' && acceptedValues.indexOf(event.eventType) > -1) {
                    return allHealthEvents.push({
                        DSIdentifier: statement.DSIdentifier,
                        liveFlag: statement.liveFlag,
                        lineNumber: statement.lineNumber,
                        date: event.date,
                        eventType: event.eventType,
                    });
                }
                return allHealthEvents;
            });
        }
        return false;
    });
    return allHealthEvents;
};
exports.healthEvents = healthEvents;
/* Other Events

Returns an array of everything but health events within the datastream file

@param datastream (string)

*/
const otherEvents = (datastream) => {
    const statements = statementInformation_1.default(datastream);
    const allOtherEvents = [];
    statements.map((statement) => {
        if (statement.services.length > 1) {
            statement.otherEvents.map((event) => {
                const acceptedValues = ['Sick', 'Mastitis', 'Lameness'];
                // If the event isn't one of the previous values - add it to our array.
                if (typeof event.eventType !== 'undefined' && acceptedValues.indexOf(event.eventType) === -1) {
                    return allOtherEvents.push({
                        DSIdentifier: statement.DSIdentifier,
                        liveFlag: statement.liveFlag,
                        lineNumber: statement.lineNumber,
                        date: event.date,
                        eventType: event.eventType,
                    });
                }
                return allOtherEvents;
            });
        }
        return false;
    });
    return allOtherEvents;
};
exports.otherEvents = otherEvents;
/* Current Lactation Information

Returns an array of all cows latest lactation info (SX record) from the data stream.

@param datastream (string)

*/
const currentLactationInformation = (datastream) => {
    const statements = statementInformation_1.default(datastream); // Load all statement info
    const curLactationInfo = [];
    statements.map((statement) => {
        if (typeof statement.currentLactation !== 'undefined') { // Only bother if there is an SX record
            curLactationInfo.push({
                DSIdentifier: statement.DSIdentifier,
                liveFlag: statement.liveFlag,
                lineNumber: statement.lineNumber,
                ...statement.currentLactation,
            });
        }
        return false;
    });
    return curLactationInfo;
};
exports.currentLactationInformation = currentLactationInformation;
/* Calvings

Returns an array of all calvings from the data stream.

This combines the statement and lactation information to ensure no gaps.

@param datastream (string)

*/
const calvings = (datastream) => {
    const statements = statementInformation_1.default(datastream);
    const lactations = lactationInformation_1.default(datastream);
    const allCalvings = [];
    // Lets map the lactation lot first
    lactations.map((lactation) => allCalvings.push({
        DSIdentifier: lactation.DSIdentifier,
        lineNumber: lactation.lineNumber,
        date: lactation.calvingDate,
        assumed: false,
        sireBreed: lactation.sireBreed,
        sireID: lactation.sireID,
        sireIDType: lactation.sireIDType,
        sireAuthenticID: lactation.sireAuthenticID,
        calves: lactation.calves,
    }));
    // Now lets check statement's for any calvings and add them
    statements.map((statement) => {
        statement.calvings.map((calving) => {
            // If we haven't added it before - best add the calving.
            if ((allCalvings.findIndex((x) => x.date === calving.date)) === -1) {
                return allCalvings.push({
                    DSIdentifier: statement.DSIdentifier,
                    lineNumber: statement.lineNumber,
                    date: calving.date,
                    assumed: calving.assumed,
                    calves: calving.calves,
                });
            }
            return allCalvings;
        });
        return allCalvings;
    });
    return allCalvings;
};
exports.calvings = calvings;
