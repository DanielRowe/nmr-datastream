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
/// <reference types="node" />
import { promises as fs } from "fs";
import { URL } from "url";
export declare const openDatastream: (file: string | Buffer | URL | fs.FileHandle) => Promise<string | false>;
export default openDatastream;
