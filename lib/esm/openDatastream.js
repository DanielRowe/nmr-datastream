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
import { promises as fs } from 'fs';
import FileType from 'file-type';
import AdmZip from 'adm-zip';
export const openDatastream = async (file) => {
    // Handle applicably if buffer passed to opener.
    if (Buffer.isBuffer(file)) {
        const fileFormat = await FileType.fromBuffer(file);
        if (fileFormat?.ext === 'exe') {
            const zip = new AdmZip(file); // Extract contents of exe.
            let result = '';
            zip.getEntries().map((zipFile) => {
                if (zipFile.entryName === 'DSMEMBER.DAT') { // Providing we find the right file - return.
                    result = zipFile.getData().toString('utf-8');
                }
                return result; // Get data and convert to string.
            });
            if (result === '') {
                throw new Error('DSMember.DAT not found within EXE');
            }
            return result;
        }
        const fileContents = file.toString(); // Convert to string
        if (fileContents.substring(0, 3) === 'H1,') { // Check first few digits match standard datastream - Very basic check.
            return fileContents;
        }
        throw new Error('Invalid file type');
    }
    else if (typeof file === 'string') { // Handle if string (hopefully file path)
        // Determine file extension
        const fileFormat = await FileType.fromFile(file);
        if (fileFormat?.ext === 'exe') {
            const zip = new AdmZip(file);
            let result = '';
            zip.getEntries().map((zipFile) => {
                if (zipFile.entryName === 'DSMEMBER.DAT') { // Providing we find the right file - return.
                    result = zipFile.getData().toString('utf-8');
                }
                return result;
            });
            if (result === '') {
                throw new Error('DSMember.DAT not found within EXE');
            }
            return result;
        }
        if (file.split('.')?.pop()?.toLocaleLowerCase() === 'dat') { // Check the file format is a .dat
            const output = await fs.readFile(file, 'utf-8');
            return output;
        }
        throw new Error('Invalid file provided');
    }
    else {
        throw new Error('File not provided as a path or buffer');
    }
};
export default openDatastream;
