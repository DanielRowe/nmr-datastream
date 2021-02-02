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

import { promises as fs } from "fs";
import { default as FileType } from 'file-type';
import AdmZip from 'adm-zip';
import { URL } from "url";

export const openDatastream = async (file: string | Buffer | URL | fs.FileHandle) => {
  // Handle applicably if buffer passed to opener.
  if(Buffer.isBuffer(file)) {
    const fileFormat = await FileType.fromBuffer(file);
    if(fileFormat?.ext === 'exe') {
      const zip = new AdmZip(file);  // Extract contents of exe.
      let result = '';
      zip.getEntries().map((zipFile) => {
        if(zipFile.entryName === "DSMEMBER.DAT") {  // Providing we find the right file - return.
          result = zipFile.getData().toString('utf-8');  // Get data and convert to string.
        }
      })
      if(result === '') {
        throw new Error('DSMember.DAT not found within EXE');
      }
      return result;
    } else {
      const fileContents = file.toString(); // Convert to string
      if(fileContents.substring(0, 3) === "H1,") { // Check first few digits match standard datastream - Very basic check.
        return fileContents;
      } else {
        throw new Error("Invalid file type");
      }
    }
  } else if(typeof file === "string") { // Handle if string (hopefully file path)
    // Determine file extension
    const fileFormat = await FileType.fromFile(file);
    if(fileFormat?.ext === 'exe') {
      const zip = new AdmZip(file);
      let result = '';
      zip.getEntries().map((zipFile) => {
        if(zipFile.entryName === "DSMEMBER.DAT") {  // Providing we find the right file - return.
          result = zipFile.getData().toString('utf-8');
        }
      })
      if(result === '') {
        throw new Error('DSMember.DAT not found within EXE');
      }
      return result;
    } else {
      const fileFormat = file.split('.')?.pop()?.toLocaleLowerCase();
      if(fileFormat === "dat") { // Check the file format is a .dat
        const output = await fs.readFile(file, 'utf-8');
        return output;
      }
      else {
        throw new Error("Invalid file provided")
      }
    }
  } else {
    throw new Error('File not provided as a path or buffer');
  }
  return false;
}

export default openDatastream;
