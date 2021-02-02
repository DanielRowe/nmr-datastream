"use strict";
/**
 * openDatastream
 *
 * Opens a datastream (DSMEMBER.DAT) either in its self extracting
 * exe format or in it's extracted .DAT format.
 *
 * You do not need to utilise this function to use anything else
 * it is simply a helper.
 *
 * It can open from either a path or a buffer.
 *
 * @param file: file path or string
 *
 * @returns string
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openDatastream = void 0;
const fs_1 = require("fs");
const file_type_1 = __importDefault(require("file-type"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const openDatastream = async (file) => {
    // Handle applicably if buffer passed to opener.
    if (Buffer.isBuffer(file)) {
        const fileFormat = await file_type_1.default.fromBuffer(file);
        if (fileFormat?.ext === 'exe') {
            const zip = new adm_zip_1.default(file); // Extract contents of exe.
            let result = '';
            zip.getEntries().map((zipFile) => {
                if (zipFile.entryName === "DSMEMBER.DAT") { // Providing we find the right file - return.
                    result = zipFile.getData().toString('utf-8'); // Get data and convert to string.
                }
            });
            return result;
        }
        else {
            const fileContents = file.toString(); // Convert to string
            if (fileContents.substring(0, 3) === "H1,") { // Check first few digits match standard datastream - Very basic check.
                return fileContents;
            }
            else {
                throw new Error("Invalid file type");
            }
        }
    }
    else if (typeof file === "string") { // Handle if string (hopefully file path)
        // Determine file extension
        const fileFormat = await file_type_1.default.fromFile(file);
        if (fileFormat?.ext === 'exe') {
            const zip = new adm_zip_1.default(file);
            let result = '';
            zip.getEntries().map((zipFile) => {
                if (zipFile.entryName === "DSMEMBER.DAT") { // Providing we find the right file - return.
                    result = zipFile.getData().toString('utf-8');
                }
            });
            return result;
        }
        else {
            const fileFormat = file.split('.')?.pop()?.toLocaleLowerCase();
            if (fileFormat === "dat") { // Check the file format is a .dat
                const output = await fs_1.promises.readFile(file, 'utf-8');
                return output;
            }
            else {
                throw new Error("Invalid file provided");
            }
        }
    }
    else {
        throw new Error('File not provided as a path or buffer');
    }
    return false;
};
exports.openDatastream = openDatastream;
exports.default = exports.openDatastream;
