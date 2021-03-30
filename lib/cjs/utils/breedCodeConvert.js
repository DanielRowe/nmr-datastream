"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.breedCodeToText = void 0;
const breedCodes_1 = __importDefault(require("../lookups/breedCodes"));
const breedCodeToText = (code) => {
    const find = breedCodes_1.default.find((x) => x.breed === code);
    return find?.breed_Lit;
};
exports.breedCodeToText = breedCodeToText;
const all = {
    breedCodeToText: exports.breedCodeToText,
};
exports.default = all;
